

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import type { GameState, User, GameView, Character, GatherableResource, ActiveAction, Item, TravelState, HuntingSession, HuntingLogEntry, PlayerState, Notification, CraftingRecipe, Stats, EquipmentSlot, Creature, CraftingIngredient, Settings, RarityKey } from '../types';
import { loadGameFromCloud, saveGameToCloud } from '../services/gameService';
import { saveGameStateToLocal, loadGameStateFromLocal } from '../services/storageService';
import { getInitialGameState, skillResourceMap, mapRegions, rareFishingResources, rareWoodcuttingResources, craftingRecipes } from '../utils/initialGameState';
import { creaturesByLocation } from '../utils/huntingData';
import { itemDatabase } from '../utils/itemData';
import { v4 as uuidv4 } from 'uuid';
import { calculateProfessionBonuses, calculateEquipmentBonuses, calculateSetBonuses } from '../utils/statBonuses';
import { useTranslation } from '../App';

const HUNT_MAX_DURATION = 2 * 60 * 60 * 1000; // 2 hours in ms
const INVENTORY_CAPACITY = 30;

/**
 * Yüklenmiş bir kayıt durumunu (source) varsayılan oyun durumu yapısına (target) güvenli bir şekilde birleştirir.
 * Bu fonksiyon, oyun güncellemeleriyle ileriye dönük uyumluluğu sürdürmek için kritik öneme sahiptir.
 * Eski veya bozuk kayıt verilerinin oyunu bozmasını önler.
 *
 * Nasıl Çalışır:
 * 1. `target` (varsayılan, "doğru" durum yapısı) anahtarları üzerinde döner.
 * 2. Varsayılan durumdan bir anahtar `source`'ta (yüklenen kayıtta) mevcutsa ve türler uyumluysa, `source`'tan gelen değer kullanılır.
 * 3. Bir anahtar varsayılan durumda mevcut ancak yüklenen kayıtta yoksa (örneğin, yeni bir özellik eklendiğinde), `target`'tan gelen varsayılan değer korunur, bu da oyunun gerekli tüm özelliklere sahip olmasını sağlar.
 * 4. Bir anahtar yüklenen kayıtta mevcut ancak varsayılan durumdan kaldırılmışsa (örneğin, bir özellik kaldırıldığında), döngü `target` anahtarlarına dayandığı için otomatik olarak yok sayılır.
 * 5. Tüm durum ağacının tutarlı olmasını sağlamak için iç içe nesneleri özyinelemeli olarak işler.
 *
 * Bu yaklaşım, son oyun durumunun her zaman doğru yapıya sahip olmasını,
 * eski kayıt verilerini sorunsuzca entegre etmesini ve eksik veya eşleşmeyen özellikler nedeniyle çökmeleri önlemesini sağlar.
 */
const safeMergeDeep = (target: any, source: any): any => {
    const output = { ...target };

    for (const key in target) {
        // Kaynağın geçerli bir nesne olduğundan ve anahtara sahip olduğundan emin ol
        if (source && typeof source === 'object' && key in source) {
            const targetValue = target[key];
            const sourceValue = source[key];

            // İç içe nesneleri özyinelemeli olarak işle
            if (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue) &&
                sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
                output[key] = safeMergeDeep(targetValue, sourceValue);
            } 
            // Dizileri işle: source dizisi bir dizi ise target dizisinin üzerine yaz.
            // Bu basit bir birleştirmedir; dizi öğelerini birleştirmek için daha karmaşık mantık eklenebilir.
            else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
                output[key] = sourceValue;
            }
            // İlkel değerleri işle: türler uyumluysa veya source null ise üzerine yaz.
            // source'tan gelen null değerin varsayılan bir değeri geçersiz kılmasına izin veriyoruz.
            else if (typeof targetValue === typeof sourceValue || sourceValue === null) {
                output[key] = sourceValue;
            }
            // Türler uyumsuzsa (ve yukarıda işlenen bir nesne/dizi değilse), target'ın varsayılan değerini koruruz.
            // Bu, örneğin, kayıt dosyasındaki bir string'in bir sayı alanının üzerine yazmasını önler.
        }
    }

    return output;
};


interface GameContextType {
  user: User;
  character: Character;
  gameState: GameState;
  currentView: GameView;
  activeSkillId: string | null;
  setCurrentView: (view: GameView) => void;
  saveGame: () => void;
  logout: () => void;
  goBackToCharSelect: () => void;
  startAction: (skillId: string, resource: GatherableResource) => void;
  startCraftingAction: (skillId: string, recipe: CraftingRecipe) => void;
  stopAction: () => void;
  setActiveSkillId: (skillId: string | null) => void;
  setPlayerInventory: (newInventory: Item[]) => void;
  updatePlayerStats: (newStats: Stats, remainingPoints: number) => void;
  travelTo: (destinationId: string) => void;
  startHuntingSession: (slotItem: Item | null) => void;
  refreshHuntingSession: () => void;
  cancelHuntingSession: (isDefeated?: boolean) => void;
  markNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  equipItem: (itemToEquip: Item) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  useItem: (itemToUse: Item) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ 
    children: ReactNode, 
    user: User, 
    character: Character,
    onLogout: () => void,
    onBackToCharSelect: () => void 
}> = ({ children, user, character, onLogout, onBackToCharSelect }) => {
    const [gameState, setGameState] = useState<GameState>(() => getInitialGameState());
    const [currentView, setCurrentView] = useState<GameView>('character');
    const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
    const actionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const huntTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const travelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const gameLoadedRef = useRef(false);
    const { t, tGame } = useTranslation();
    
    // CRITICAL FIX: Use a ref to hold the latest game state for cleanup functions
    // to prevent saving stale state due to closure issues in useEffect.
    const gameStateRef = useRef(gameState);
    useEffect(() => {
        gameStateRef.current = gameState;
    });
    
    const setActionLog = useCallback((newLog: string[] | ((prev: string[]) => string[])) => {
        setGameState(prev => ({
            ...prev,
            actionLog: typeof newLog === 'function' ? newLog(prev.actionLog) : newLog
        }));
    }, []);

    const addNotification = useCallback((message: string, icon?: string, type: 'level-up' | 'milestone' | 'general' = 'general') => {
        const latestGameState = gameStateRef.current;
        if (type === 'level-up' && latestGameState.settings.disableLevelUpNotifications) {
            return;
        }
        if (type === 'milestone' && latestGameState.settings.disableMilestoneNotifications) {
            return;
        }

        const newNotification: Notification = {
            id: uuidv4(),
            message,
            icon,
            timestamp: Date.now(),
            read: false,
        };
        setGameState(prev => ({
            ...prev,
            notifications: [newNotification, ...prev.notifications].slice(0, 50)
        }));
    }, []);

    const markNotificationsAsRead = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => ({...n, read: true})),
        }));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            notifications: [],
        }));
        setActionLog(prev => ['Tüm bildirimler temizlendi.', ...prev].slice(0, 50));
    }, [setActionLog]);

    const stopAction = useCallback(() => {
        if (actionIntervalRef.current) {
            clearInterval(actionIntervalRef.current);
            actionIntervalRef.current = null;
        }
        setGameState(prev => {
            if (prev.currentAction) {
                const { name, sessionGains } = prev.currentAction;
                const finalLog = t('actionStopped', { actionName: name, items: sessionGains.items, xp: sessionGains.xp });
                return {
                    ...prev,
                    currentAction: null,
                    actionLog: [finalLog, ...prev.actionLog]
                };
            }
            return prev;
        });
    }, [t]);
    
    const getUpdatedPlayerWithDerivedStats = useCallback((player: PlayerState): PlayerState => {
        const professionBonuses = calculateProfessionBonuses(player.skills);
        const equipmentBonuses = calculateEquipmentBonuses(player.equipment);
        const setBonuses = calculateSetBonuses(player.equipment);
        
        let totalEndurance = player.stats.endurance;
        if (professionBonuses.endurance) totalEndurance += professionBonuses.endurance;
        if (equipmentBonuses.endurance) totalEndurance += equipmentBonuses.endurance;
        if (setBonuses.endurance) totalEndurance += setBonuses.endurance;

        const maxHealth = 80 + (totalEndurance * 2);
        
        return {
            ...player,
            maxHealth,
            health: Math.min(player.health, maxHealth)
        };
    }, []);

    const handlePlayerLevelUp = useCallback((player: PlayerState): PlayerState => {
        if (player.level >= 30) {
            return {
                ...player,
                level: 30,
                xp: 0,
                xpToNextLevel: Infinity
            };
        }
        
        let updatedPlayer = { ...player };

        while (updatedPlayer.xp >= updatedPlayer.xpToNextLevel && updatedPlayer.level < 30) {
            updatedPlayer.xp -= updatedPlayer.xpToNextLevel;
            updatedPlayer.level++;
            updatedPlayer.xpToNextLevel = Math.floor(updatedPlayer.xpToNextLevel * 1.2);
            updatedPlayer.statPoints = (updatedPlayer.statPoints || 0) + 3; // 3 stat points per level

            addNotification(t('levelUpMessage', {level: updatedPlayer.level}), 'fa-solid fa-sparkles', 'level-up');
        }

        // Handle case where leveling up multiple times pushes player over level 30
        if (updatedPlayer.level >= 30) {
             updatedPlayer.level = 30;
             updatedPlayer.xp = 0;
             updatedPlayer.xpToNextLevel = Infinity;
        }

        return getUpdatedPlayerWithDerivedStats(updatedPlayer);
    }, [addNotification, getUpdatedPlayerWithDerivedStats, t]);

    const cancelHuntingSession = useCallback((isDefeated: boolean = false) => {
        if (huntTimeoutRef.current) {
            clearTimeout(huntTimeoutRef.current);
            huntTimeoutRef.current = null;
        }
        
        setGameState(prev => {
            if (!prev.huntingSession) return prev;
            
            const logMessage = isDefeated
                ? t('defeatedAndReturningLog')
                : t('returningFromHuntLog');
            const notificationMessage = isDefeated ? t('defeatedAndReturning') : t('returningFromHunt');

            const newLogEntry: HuntingLogEntry = {
                timestamp: Date.now(),
                message: logMessage,
                type: isDefeated ? 'error' : 'event'
            };
                
            const updatedSession: HuntingSession = {
                ...prev.huntingSession,
                isActive: false,
                isReturning: true,
                returnEndTime: Date.now() + 7000, // 7 sec return journey
                log: [...prev.huntingSession.log, newLogEntry],
            };
            
            addNotification(notificationMessage, "fa-solid fa-campground");

            setTimeout(() => {
                setGameState(g => {
                    if (!g.huntingSession) return g;

                    let finalPlayerState = { ...g.player };
                    const lootItems = Object.values(g.huntingSession.loot);
                    
                    const isSuccessfulCompletion = Date.now() >= g.huntingSession.endTime;
                    if(isSuccessfulCompletion && !isDefeated) {
                        finalPlayerState.health = finalPlayerState.maxHealth;
                    }
                    if(isDefeated) {
                        finalPlayerState.health = 1;
                    }

                    // Return item from slot
                    if (g.huntingSession.huntSlot) {
                        const slotItem = g.huntingSession.huntSlot;
                         const existingItemIndex = finalPlayerState.inventory.findIndex(invItem => invItem.id === slotItem.id);
                         if(existingItemIndex > -1) {
                             finalPlayerState.inventory[existingItemIndex].quantity += 1;
                         } else {
                            finalPlayerState.inventory.push({...slotItem, quantity: 1});
                         }
                    }

                    lootItems.forEach(lootItem => {
                        const existingItemIndex = finalPlayerState.inventory.findIndex(invItem => invItem.id === lootItem.id);
                        if(existingItemIndex > -1){
                             const newInventory = [...finalPlayerState.inventory];
                             newInventory[existingItemIndex] = {
                                ...newInventory[existingItemIndex],
                                quantity: newInventory[existingItemIndex].quantity + lootItem.quantity
                             };
                             finalPlayerState.inventory = newInventory;
                        } else {
                            finalPlayerState.inventory.push(lootItem);
                        }
                    });

                    return {
                        ...g,
                        player: finalPlayerState,
                        huntingSession: null,
                         actionLog: [t('returnedFromHunt'), ...g.actionLog].slice(0, 50)
                    };
                });

            }, 7000);
            
            return {
                ...prev,
                huntingSession: updatedSession,
                actionLog: [logMessage, ...prev.actionLog].slice(0, 50),
            };
        });
    }, [addNotification, t]);
    
    const saveGame = useCallback(async (isUnloading = false) => {
        if (gameState.isSaving && !isUnloading) return;
    
        const performSave = async () => {
            setGameState(prev => ({ ...prev, isSaving: true }));
    
            const stateToSave: GameState = {
                ...gameState,
                isSaving: false,
                isLoading: false,
            };
    
            if (stateToSave.huntingSession?.isReturning) {
                stateToSave.huntingSession = null;
            }
    
            try {
                const cloudSaveTime = await saveGameToCloud(user, character, stateToSave);
                saveGameStateToLocal(user, character.id, { ...stateToSave, lastSaved: cloudSaveTime });
                
                setGameState(prev => ({
                    ...prev,
                    isSaving: false,
                    lastSaved: cloudSaveTime
                }));
                
                if (!isUnloading) {
                    addNotification(t('gameSavedCloud'), "fa-solid fa-save");
                    setActionLog(prev => [t('gameSavedCloudAndLocal', { time: cloudSaveTime.toLocaleTimeString() }), ...prev]);
                }
    
            } catch (e: any) {
                console.error("Cloud save failed:", e);
                
                const localSaveTime = new Date();
                saveGameStateToLocal(user, character.id, { ...stateToSave, lastSaved: localSaveTime });
                setGameState(prev => ({
                    ...prev,
                    isSaving: false,
                    lastSaved: localSaveTime
                }));
                
                const errorMessage = e.message || "Bilinmeyen bir sunucu hatası oluştu.";
                if (!isUnloading) {
                    addNotification(t('cloudSaveFailed'), "fa-solid fa-triangle-exclamation");
                    setActionLog(prev => [t('cloudSaveError', { error: errorMessage }), ...prev]);
                }
            }
        };
    
        // This 'isUnloading' block is now handled by the useEffect cleanup functions
        // using the gameStateRef to ensure the latest state is saved.
        // The async save logic remains for manual/auto saves.
        if (!isUnloading) {
            await performSave();
        }
    }, [user, character, gameState, setActionLog, addNotification, t]);

    const startActionInterval = useCallback((action: ActiveAction) => {
        if (actionIntervalRef.current) {
            clearInterval(actionIntervalRef.current);
        }

        let tickDuration: number;
        let tickLogic: () => void;

        if (action.actionType === 'gathering') {
            const resource = skillResourceMap[action.skillId]?.find(r => r.id === action.targetId);
            if (!resource) {
                console.error("Geçersiz kaynak için eylem başlatılamadı. Eylem durduruluyor.", action);
                stopAction();
                return;
            }

            const gatheringSkill = gameState.player.skills.find(s => s.id === 'gathering');
            const gatheringLevel = gatheringSkill ? gatheringSkill.level : 1;
            
            const reductionPerLevel = 0.01;
            const maxReduction = 0.5;
            let reduction = (gatheringLevel - 1) * reductionPerLevel;
            if (reduction > maxReduction) reduction = maxReduction;

            let toolBonus = 0;
            const requiredToolType = action.skillId === 'mining' ? 'pickaxe' : action.skillId === 'woodcutting' ? 'axe' : action.skillId === 'fishing' ? 'fishing_rod' : null;
            if (requiredToolType) {
                const tools = gameState.player.inventory.filter(i => i.toolType === requiredToolType && typeof i.efficiencyBonus === 'number');
                if (tools.length > 0) toolBonus = Math.max(0, ...tools.map(t => t.efficiencyBonus!));
            }
            
            const totalReduction = reduction + toolBonus;
            const maxTotalReduction = 0.8;
            tickDuration = resource.timeToGather * (1 - Math.min(totalReduction, maxTotalReduction));

            tickLogic = () => setGameState(prev => {
                if (!prev.currentAction || prev.currentAction.targetId !== resource.id) return prev;
                
                let updatedPlayer = { ...prev.player };
                let updatedAction = { ...prev.currentAction };
                let newActionLog: string[] = [];
                let xpGainedThisTick = resource.xp;
                let itemsGainedThisTick = 1;
                
                const playerXPGained = Math.ceil(resource.xp * 0.005);
                updatedPlayer.xp += playerXPGained;
                updatedPlayer = handlePlayerLevelUp(updatedPlayer);
                
                const existingItemIndex = updatedPlayer.inventory.findIndex(item => item.id === resource.itemId);
                if (existingItemIndex > -1) {
                    updatedPlayer.inventory = updatedPlayer.inventory.map((item, index) => index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item);
                } else {
                     const itemData = itemDatabase[resource.itemId];
                     if(itemData) updatedPlayer.inventory = [...updatedPlayer.inventory, { ...itemData, quantity: 1 }];
                }
                newActionLog.push(`+1 ${resource.name}, +${resource.xp} Meslek TP, +${playerXPGained} Karakter TP kazanıldı.`);
                
                if (action.skillId === 'fishing') {
                    for (const drop of rareFishingResources) {
                        if (Math.random() < drop.chance) {
                            const rareItemTemplate = itemDatabase[drop.itemId];
                            if (rareItemTemplate) {
                                const rareItem = { ...rareItemTemplate, quantity: 1 };
                                const existingRareItemIndex = updatedPlayer.inventory.findIndex(item => item.id === rareItem.id);
                                if (existingRareItemIndex > -1) updatedPlayer.inventory[existingRareItemIndex].quantity += 1;
                                else updatedPlayer.inventory.push(rareItem);
                                const dropMessage = t('rareFind', { itemName: rareItem.name });
                                newActionLog.push(dropMessage);
                                addNotification(dropMessage, rareItem.icon);
                            }
                        }
                    }
                }
                
                const skillIndex = updatedPlayer.skills.findIndex(s => s.id === action.skillId);
                if (skillIndex > -1) {
                    let skill = { ...updatedPlayer.skills[skillIndex] };
                    skill.xp += xpGainedThisTick;
                    while (skill.xp >= skill.xpToNextLevel) {
                        skill.xp -= skill.xpToNextLevel;
                        skill.level++;
                        skill.xpToNextLevel = Math.floor(skill.xpToNextLevel * 1.15);
                        const skillUpMessage = t('skillLevelUpMessage', { skillName: skill.name, level: skill.level });
                        newActionLog.push(skillUpMessage);
                        addNotification(skillUpMessage, 'fa-solid fa-book-sparkles', 'milestone');
                    }
                    updatedPlayer.skills[skillIndex] = skill;
                    updatedPlayer = getUpdatedPlayerWithDerivedStats(updatedPlayer);
                }
                
                updatedAction.nextTickTime = Date.now() + tickDuration;
                updatedAction.sessionGains.items += itemsGainedThisTick;
                updatedAction.sessionGains.xp += xpGainedThisTick;
                
                return { ...prev, player: updatedPlayer, currentAction: updatedAction, actionLog: [...newActionLog, ...prev.actionLog].slice(0, 50) };
            });

        } else if (action.actionType === 'crafting') {
            const recipe = craftingRecipes[action.skillId]?.find(r => r.id === action.targetId);
            if (!recipe) {
                console.error("Geçersiz tarif için eylem başlatılamadı. Eylem durduruluyor.", action);
                stopAction();
                return;
            }

            tickDuration = recipe.timeToCraft;
            tickLogic = () => setGameState(prev => {
                if (!prev.currentAction || prev.currentAction.targetId !== recipe.id) return prev;
                
                let updatedPlayer = { ...prev.player };
                let updatedAction = { ...prev.currentAction };
                let newActionLog: string[] = [];

                let hasIngredients = true;
                for (const ingredient of recipe.ingredients) {
                    const itemInInv = updatedPlayer.inventory.find(i => i.id === ingredient.itemId);
                    if (!itemInInv || itemInInv.quantity < ingredient.quantity) {
                        hasIngredients = false;
                        break;
                    }
                }

                if (!hasIngredients) {
                    stopAction();
                    addNotification(t('craftingStoppedNoMats', { recipeName: recipe.name }), 'fa-solid fa-circle-exclamation');
                    return { ...prev, actionLog: [`${recipe.name} üretimi için malzemeler bitti.`, ...prev.actionLog].slice(0, 50) };
                }
                
                for (const ingredient of recipe.ingredients) {
                    const itemIndex = updatedPlayer.inventory.findIndex(i => i.id === ingredient.itemId);
                    updatedPlayer.inventory[itemIndex].quantity -= ingredient.quantity;
                }
                updatedPlayer.inventory = updatedPlayer.inventory.filter(i => i.quantity > 0);

                const existingItemIndex = updatedPlayer.inventory.findIndex(item => item.id === recipe.outputId);
                if (existingItemIndex > -1) {
                    updatedPlayer.inventory[existingItemIndex].quantity += recipe.outputQuantity;
                } else {
                    const itemData = itemDatabase[recipe.outputId];
                    if (itemData) updatedPlayer.inventory.push({ ...itemData, quantity: recipe.outputQuantity });
                }

                const playerXPGained = Math.ceil(recipe.xp * 0.005);
                updatedPlayer.xp += playerXPGained;
                updatedPlayer = handlePlayerLevelUp(updatedPlayer);
                
                const skillIndex = updatedPlayer.skills.findIndex(s => s.id === action.skillId);
                if (skillIndex > -1) {
                    let skill = { ...updatedPlayer.skills[skillIndex] };
                    skill.xp += recipe.xp;
                    while (skill.xp >= skill.xpToNextLevel) {
                        skill.xp -= skill.xpToNextLevel;
                        skill.level++;
                        skill.xpToNextLevel = Math.floor(skill.xpToNextLevel * 1.15);
                        const skillUpMessage = t('skillLevelUpMessage', { skillName: skill.name, level: skill.level });
                        newActionLog.push(skillUpMessage);
                        addNotification(skillUpMessage, 'fa-solid fa-book-sparkles', 'milestone');
                    }
                    updatedPlayer.skills[skillIndex] = skill;
                    updatedPlayer = getUpdatedPlayerWithDerivedStats(updatedPlayer);
                }
                
                newActionLog.push(`+${recipe.outputQuantity} ${recipe.name}, +${recipe.xp} Meslek TP, +${playerXPGained} Karakter TP kazanıldı.`);
                updatedAction.nextTickTime = Date.now() + tickDuration;
                updatedAction.sessionGains.items += recipe.outputQuantity;
                updatedAction.sessionGains.xp += recipe.xp;

                return { ...prev, player: updatedPlayer, currentAction: updatedAction, actionLog: [...newActionLog, ...prev.actionLog].slice(0, 50) };
            });
        } else {
            return;
        }
        
        actionIntervalRef.current = setInterval(tickLogic, tickDuration);
    }, [gameState.player.skills, gameState.player.inventory, stopAction, addNotification, handlePlayerLevelUp, getUpdatedPlayerWithDerivedStats, t]);

    const startAction = useCallback((skillId: string, resource: GatherableResource) => {
        if (gameState.huntingSession?.isActive) {
            cancelHuntingSession(false);
            addNotification(t('huntingActionCancel'), "fa-solid fa-person-digging");
        }
        stopAction();
        saveGame(false);
        
        const gatheringSkill = gameState.player.skills.find(s => s.id === 'gathering');
        const gatheringLevel = gatheringSkill ? gatheringSkill.level : 1;
        const reductionPerLevel = 0.01;
        const maxReduction = 0.5;
        let reduction = (gatheringLevel - 1) * reductionPerLevel;
        if (reduction > maxReduction) reduction = maxReduction;

        let toolBonus = 0;
        const requiredToolType = skillId === 'mining' ? 'pickaxe' : skillId === 'woodcutting' ? 'axe' : skillId === 'fishing' ? 'fishing_rod' : null;
        if (requiredToolType) {
            const tools = gameState.player.inventory.filter(i => i.toolType === requiredToolType && typeof i.efficiencyBonus === 'number');
            if (tools.length > 0) toolBonus = Math.max(0, ...tools.map(t => t.efficiencyBonus!));
        }
        
        const totalReduction = reduction + toolBonus;
        const maxTotalReduction = 0.8;
        const effectiveTimeToGather = resource.timeToGather * (1 - Math.min(totalReduction, maxTotalReduction));

        const newAction: ActiveAction = {
            name: resource.name,
            skillId,
            targetId: resource.id,
            actionType: 'gathering',
            startTime: Date.now(),
            nextTickTime: Date.now() + effectiveTimeToGather,
            sessionGains: { items: 0, xp: 0 },
        };
        
        setGameState(prev => ({
            ...prev,
            currentAction: newAction,
            actionLog: [`${resource.name} toplanmaya başlandı...`, ...prev.actionLog].slice(0, 50)
        }));
        
        startActionInterval(newAction);

    }, [stopAction, gameState.huntingSession, gameState.player.skills, gameState.player.inventory, cancelHuntingSession, addNotification, startActionInterval, saveGame, t]);
    
     const startCraftingAction = useCallback((skillId: string, recipe: CraftingRecipe) => {
        if (gameState.huntingSession?.isActive) {
            cancelHuntingSession(false);
            addNotification(t('huntingActionCancel'), "fa-solid fa-person-digging");
        }
        stopAction();
        saveGame(false);

        const newAction: ActiveAction = {
            name: recipe.name,
            skillId,
            targetId: recipe.id,
            actionType: 'crafting',
            startTime: Date.now(),
            nextTickTime: Date.now() + recipe.timeToCraft,
            sessionGains: { items: 0, xp: 0 },
        };

        setGameState(prev => ({
            ...prev,
            currentAction: newAction,
            actionLog: [`${recipe.name} üretilmeye başlandı...`, ...prev.actionLog].slice(0, 50)
        }));
        
        startActionInterval(newAction);

    }, [stopAction, gameState.huntingSession, cancelHuntingSession, addNotification, startActionInterval, saveGame, t]);
    
    const setPlayerInventory = useCallback((newInventory: Item[]) => {
        setGameState(prev => ({
            ...prev,
            player: {
                ...prev.player,
                inventory: newInventory
            }
        }));
    }, []);

    const updatePlayerStats = useCallback((newStats: Stats, remainingPoints: number) => {
        setGameState(prev => {
            let updatedPlayer = { ...prev.player, stats: newStats, statPoints: remainingPoints };
            updatedPlayer = getUpdatedPlayerWithDerivedStats(updatedPlayer);
            
            return {
                ...prev,
                player: updatedPlayer
            };
        });
        addNotification(t('statsUpdated'), 'fa-solid fa-user-pen');
    }, [addNotification, getUpdatedPlayerWithDerivedStats, t]);
    
    const travelTo = useCallback((destinationId: string) => {
        const destination = mapRegions.find(r => r.id === destinationId);
        if (!destination || destination.id === gameState.player.currentLocationId || gameState.currentTravel) {
            return;
        }

        if (gameState.player.gold < destination.travelCost) {
            addNotification(t('notEnoughGold'), "fa-solid fa-coins");
            return;
        }

        stopAction();

        const now = Date.now();
        const travelState: TravelState = {
            destinationId,
            destinationName: destination.name,
            startTime: now,
            endTime: now + destination.travelTime,
        };

        setGameState(prev => ({
            ...prev,
            player: {
                ...prev.player,
                gold: prev.player.gold - destination.travelCost
            },
            currentTravel: travelState,
            actionLog: [t('travelStarted', { destinationName: destination.name }), ...prev.actionLog].slice(0, 50)
        }));
        
        if(travelTimeoutRef.current) clearTimeout(travelTimeoutRef.current);
        travelTimeoutRef.current = setTimeout(() => {
            setGameState(prev => {
                if (!prev.currentTravel || prev.currentTravel.destinationId !== destinationId) return prev;
                return {
                    ...prev,
                    player: {
                        ...prev.player,
                        currentLocationId: destinationId
                    },
                    currentTravel: null,
                    actionLog: [`${destination.name} bölgesine ulaşıldı.`, ...prev.actionLog].slice(0, 50)
                };
            });
            addNotification(t('travelFinished', { destinationName: destination.name }), 'fa-solid fa-map-location-dot');
        }, destination.travelTime);
    }, [gameState.player.currentLocationId, gameState.player.gold, gameState.currentTravel, stopAction, addNotification, t]);

    const performHuntEncounter = useCallback(() => {
        setGameState(prev => {
            if (!prev.huntingSession || !prev.huntingSession.isActive) {
                 if (huntTimeoutRef.current) clearTimeout(huntTimeoutRef.current);
                return prev;
            }
            
            if (Date.now() >= prev.huntingSession.endTime) {
                cancelHuntingSession(false);
                return prev;
            }

            let updatedSession = { ...prev.huntingSession };
            let updatedPlayer = { ...prev.player };
            let newLogEntries: HuntingLogEntry[] = [];
            
            const availableCreatures = (creaturesByLocation[updatedSession.locationId] || []).filter(c => c.levelReq <= updatedPlayer.skills.find(s => s.id === 'hunting')!.level);
            
            if (availableCreatures.length === 0) {
                newLogEntries.push({ timestamp: Date.now(), message: t('noSuitableCreaturesLeft'), type: 'event' });
            } else {
                const creature = availableCreatures[Math.floor(Math.random() * availableCreatures.length)];
                const translatedCreatureName = tGame('creatures', creature.id, 'name', creature.name);
                
                const preludeKey = `encounterPrelude_${Math.floor(Math.random() * 13) + 1}` as any;
                const prelude = t(preludeKey, { creatureName: translatedCreatureName });
                newLogEntries.push({ timestamp: Date.now(), message: prelude, type: 'event' });
                newLogEntries.push({ timestamp: Date.now(), message: t('encounteredCreature', { creatureName: translatedCreatureName }), type: 'encounter', creatureId: creature.id });

                const damageTaken = Math.max(1, creature.levelReq - Math.floor(updatedPlayer.stats.endurance / 5));
                updatedPlayer.health = Math.max(0, updatedPlayer.health - damageTaken);
                
                const successMessageKey = `encounterSuccessMessage_${Math.floor(Math.random() * 8) + 1}` as any;
                const successMessage = t(successMessageKey, { creatureName: translatedCreatureName, damageTaken: damageTaken.toString() });
                newLogEntries.push({ timestamp: Date.now(), message: successMessage, type: 'damage' });

                if (updatedPlayer.health <= 0) {
                    if (huntTimeoutRef.current) clearTimeout(huntTimeoutRef.current);
                    updatedSession.log = [...updatedSession.log, ...newLogEntries];
                    cancelHuntingSession(true);
                    return { ...prev, player: updatedPlayer, huntingSession: updatedSession };
                }

                const isCritical = updatedPlayer.health > 0 && updatedPlayer.health / updatedPlayer.maxHealth <= 0.3;
                if (isCritical && updatedSession.huntSlot) {
                    const healItem = updatedSession.huntSlot;
                    const healAmount = Math.floor(updatedPlayer.maxHealth * (healItem.healAmount || 0.2));
                    updatedPlayer.health = Math.min(updatedPlayer.maxHealth, updatedPlayer.health + healAmount);
                    const translatedHealItemName = tGame('items', healItem.id, 'name', healItem.name);
                    newLogEntries.push({ timestamp: Date.now(), message: t('itemUsedHealInHunt', { itemName: translatedHealItemName, healAmount }), type: 'health', icon: healItem.icon });
                    updatedSession.huntSlot = null;
                }
                
                const xpFromCreature = creature.xp;
                updatedPlayer.xp += Math.ceil(xpFromCreature * 0.25); // Player Level: 25%
                updatedPlayer = handlePlayerLevelUp(updatedPlayer);

                const skillXPMap = {
                    hunting: 0.70,
                    melee_combat: 0.05,
                    ranged_combat: 0.05,
                    intuition: 0.05
                };
                
                updatedPlayer.skills = updatedPlayer.skills.map(skill => {
                    const xpShare = skillXPMap[skill.id as keyof typeof skillXPMap];
                    if(xpShare) {
                        let updatedSkill = {...skill};
                        updatedSkill.xp += Math.ceil(xpFromCreature * xpShare);
                        while (updatedSkill.xp >= updatedSkill.xpToNextLevel) {
                            updatedSkill.xp -= updatedSkill.xpToNextLevel;
                            updatedSkill.level++;
                            updatedSkill.xpToNextLevel = Math.floor(updatedSkill.xpToNextLevel * 1.15);
                            const skillUpMessage = t('skillLevelUpMessage', { skillName: updatedSkill.name, level: updatedSkill.level });
                            newLogEntries.push({ timestamp: Date.now(), message: skillUpMessage, type: 'milestone' });
                            addNotification(skillUpMessage, 'fa-solid fa-book-sparkles', 'milestone');
                        }
                        return updatedSkill;
                    }
                    return skill;
                });
                updatedPlayer = getUpdatedPlayerWithDerivedStats(updatedPlayer);
                
                let lootFound = false;
                const luckBonus = 1 + (updatedPlayer.stats.luck / 500); // Adjusted luck bonus
                const newLoot = { ...updatedSession.loot }; // Create a new loot object for this tick
                creature.lootTable.forEach(drop => {
                    if (Math.random() < drop.chance * luckBonus) {
                        lootFound = true;
                        const quantity = 1;
                        const itemTemplate = itemDatabase[drop.itemId];
                        if(itemTemplate){
                            const item: Item = { ...itemTemplate, quantity };
                            if (newLoot[item.id]) {
                                newLoot[item.id] = { ...newLoot[item.id], quantity: newLoot[item.id].quantity + quantity };
                            } else {
                                newLoot[item.id] = item;
                            }
                            const translatedItemName = tGame('items', item.id, 'name', item.name);
                            newLogEntries.push({ timestamp: Date.now(), message: t('lootObtained', { quantity, itemName: translatedItemName }), type: 'loot', icon: item.icon });
                        }
                    }
                });
                if (!lootFound) {
                    newLogEntries.push({ timestamp: Date.now(), message: t('noLootFound'), type: 'event' });
                }
                 updatedSession.loot = newLoot;
            }
            
            updatedSession.log = [...updatedSession.log, ...newLogEntries];
            
            return { ...prev, player: updatedPlayer, huntingSession: updatedSession };
        });

        const nextEncounterDelay = Math.random() * (720000 - 300000) + 300000; // 5-12 minutes
        huntTimeoutRef.current = setTimeout(performHuntEncounter, nextEncounterDelay);
        
        setTimeout(() => {
            setGameState(prev => {
                if (!prev.huntingSession || !prev.huntingSession.isActive) return prev;
                const flavorTextCount = 5;
                const flavorKey = `huntFlavor_${Math.floor(Math.random() * flavorTextCount) + 1}` as any;
                const newLogEntry: HuntingLogEntry = { timestamp: Date.now(), message: t(flavorKey), type: 'event' };
                const newLog = [...prev.huntingSession.log, newLogEntry];
                return {
                    ...prev,
                    huntingSession: { ...prev.huntingSession, log: newLog.slice(-100) },
                };
            });
        }, 2000);
    }, [cancelHuntingSession, addNotification, handlePlayerLevelUp, getUpdatedPlayerWithDerivedStats, t, tGame]);
    
    const startHuntingSession = useCallback((slotItem: Item | null) => {
        const creaturesInLocation = creaturesByLocation[gameState.player.currentLocationId];
        if (gameState.huntingSession?.isActive || !creaturesInLocation || !gameState.player.equipment.weapon) {
            addNotification(t('huntingNotReady'), "fa-solid fa-circle-exclamation");
            return;
        }

        stopAction();
        saveGame(false);
        const now = Date.now();
        const session: HuntingSession = {
            isActive: true,
            startTime: now,
            endTime: now + HUNT_MAX_DURATION,
            locationId: gameState.player.currentLocationId,
            log: [{ timestamp: now, message: t('huntStarted'), type: 'event' }],
            loot: {},
            huntSlot: slotItem,
            isReturning: false,
            returnEndTime: 0,
        };

        let playerAfterSlot = { ...gameState.player };
        if (slotItem) {
            const newInventory = [...playerAfterSlot.inventory];
            const itemIndex = newInventory.findIndex(i => i.id === slotItem.id);
            if (itemIndex > -1) {
                if (newInventory[itemIndex].quantity > 1) {
                    newInventory[itemIndex].quantity -= 1;
                } else {
                    newInventory.splice(itemIndex, 1);
                }
                playerAfterSlot.inventory = newInventory;
            }
        }

        setGameState(prev => ({ ...prev, player: playerAfterSlot, huntingSession: session }));
        
        // FIX: The first encounter is now also random to prevent exploits.
        const initialEncounterDelay = Math.random() * (720000 - 300000) + 300000; // 5-12 minutes
        huntTimeoutRef.current = setTimeout(performHuntEncounter, initialEncounterDelay);

    }, [gameState, stopAction, addNotification, performHuntEncounter, saveGame, t]);
    
    const refreshHuntingSession = useCallback(() => {
        setGameState(prev => {
            if (!prev.huntingSession) return prev;
            const now = Date.now();
            return {
                ...prev,
                huntingSession: {
                    ...prev.huntingSession,
                    startTime: now,
                    endTime: now + HUNT_MAX_DURATION,
                },
                actionLog: [t('huntingDurationRefreshed'), ...prev.actionLog].slice(0, 50),
            }
        });
        addNotification(t('huntingDurationRefreshed'), "fa-solid fa-check-circle");
    }, [addNotification, t]);
    
    const equipItem = useCallback((itemToEquip: Item) => {
        setGameState(prev => {
            const { player } = prev;
            const { inventory, equipment } = player;
    
            if (!itemToEquip.equipmentType || itemToEquip.equipmentType === 'tool') {
                 return prev;
            }
            
            const slot = itemToEquip.equipmentType as EquipmentSlot;
            
            const newInventory = [...inventory];
            const newEquipment = { ...equipment };
    
            const itemIndex = newInventory.findIndex(i => i.id === itemToEquip.id && i.quantity > 0);
            if (itemIndex === -1) return prev; // Item not in inventory
    
            const currentItemInSlot = newEquipment[slot];
            
            // Decrement or remove item from inventory
            if (newInventory[itemIndex].quantity > 1) {
                newInventory[itemIndex].quantity -= 1;
            } else {
                newInventory.splice(itemIndex, 1);
            }
            
            // Add currently equipped item (if any) back to inventory
            if (currentItemInSlot) {
                 const existingStackIndex = newInventory.findIndex(i => i.id === currentItemInSlot.id);
                 if (existingStackIndex > -1) {
                     newInventory[existingStackIndex].quantity += 1;
                 } else {
                    newInventory.push(currentItemInSlot);
                 }
            }
            
            // Equip the new item
            newEquipment[slot] = { ...itemToEquip, quantity: 1 };
    
            let updatedPlayer = { ...player, inventory: newInventory, equipment: newEquipment };
            updatedPlayer = getUpdatedPlayerWithDerivedStats(updatedPlayer);
    
            return { ...prev, player: updatedPlayer };
        });
    }, [getUpdatedPlayerWithDerivedStats]);
    
    const unequipItem = useCallback((slot: EquipmentSlot) => {
        setGameState(prev => {
            const { player } = prev;
            const { inventory, equipment } = player;
            
            const itemToUnequip = equipment[slot];
            if (!itemToUnequip) return prev;
            
            if (inventory.length >= INVENTORY_CAPACITY && !inventory.some(i => i.id === itemToUnequip.id)) {
                addNotification(t('inventoryFull'), "fa-solid fa-box-archive");
                return prev;
            }
    
            const newInventory = [...inventory];
            const newEquipment = { ...equipment };
            
            const existingStackIndex = newInventory.findIndex(i => i.id === itemToUnequip.id);
            if (existingStackIndex > -1) {
                newInventory[existingStackIndex].quantity += 1;
            } else {
                newInventory.push(itemToUnequip);
            }
            
            newEquipment[slot] = null;
    
            let updatedPlayer = { ...player, inventory: newInventory, equipment: newEquipment };
            updatedPlayer = getUpdatedPlayerWithDerivedStats(updatedPlayer);
            
            return { ...prev, player: updatedPlayer };
        });
    }, [addNotification, getUpdatedPlayerWithDerivedStats, t]);
    
    const useItem = useCallback((itemToUse: Item) => {
        setGameState(prev => {
            let updatedPlayer = { ...prev.player };
            
            if (itemToUse.healAmount) {
                const healValue = Math.floor(updatedPlayer.maxHealth * itemToUse.healAmount);
                updatedPlayer.health = Math.min(updatedPlayer.maxHealth, updatedPlayer.health + healValue);
                addNotification(t('itemUsedHeal', {itemName: itemToUse.name, healValue}), itemToUse.icon);
            } else {
                return prev;
            }
            
            const newInventory = [...updatedPlayer.inventory];
            const itemIndex = newInventory.findIndex(i => i.id === itemToUse.id);
            if (itemIndex > -1) {
                if (newInventory[itemIndex].quantity > 1) {
                    newInventory[itemIndex].quantity -= 1;
                } else {
                    newInventory.splice(itemIndex, 1);
                }
                updatedPlayer.inventory = newInventory;
            } else {
                return prev;
            }
    
            return { ...prev, player: updatedPlayer };
        });
    }, [addNotification, t]);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setGameState(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                ...newSettings,
            }
        }));
        addNotification(t('settingsUpdated'), "fa-solid fa-check-circle");
    }, [addNotification, t]);


    useEffect(() => {
        const loadGame = async () => {
            const localState = loadGameStateFromLocal(user, character.id);
            const cloudState = await loadGameFromCloud(user, character.id);

            let stateToLoad: GameState | null = null;
            let loadedFrom = '';
            let isLocalNewer = false;

            if (cloudState && localState) {
                const cloudTime = cloudState.lastSaved ? new Date(cloudState.lastSaved).getTime() : 0;
                const localTime = localState.lastSaved ? new Date(localState.lastSaved).getTime() : 0;
                
                if (cloudTime > localTime) {
                    stateToLoad = cloudState;
                    loadedFrom = 'cloud';
                } else {
                    stateToLoad = localState;
                    loadedFrom = 'local';
                    isLocalNewer = true;
                }
            } else if (cloudState) {
                stateToLoad = cloudState;
                loadedFrom = 'cloud';
            } else if (localState) {
                stateToLoad = localState;
                loadedFrom = 'local';
                isLocalNewer = true; // No cloud save exists, so local is definitively newer.
            }

            const calculateOfflineProgress = (loadedState: GameState): { updatedState: GameState, summaryNotification: Notification | null } => {
                const now = Date.now();
                const lastSeen = loadedState.lastSaved ? new Date(loadedState.lastSaved).getTime() : now;
                let offlineDuration = now - lastSeen;
                
                if (offlineDuration < 60000) return { updatedState: loadedState, summaryNotification: null };

                const MAX_OFFLINE_MS = 12 * 60 * 60 * 1000;
                offlineDuration = Math.min(offlineDuration, MAX_OFFLINE_MS);

                let summaryMessage = '';
                let summaryIcon = 'fa-solid fa-hourglass-half';
                let workingState: GameState = JSON.parse(JSON.stringify(loadedState));
                let actionShouldBeCleared = false;
                
                 // FIX: Handle hunts that were in the "returning" state when the app was closed.
                if (workingState.huntingSession && workingState.huntingSession.isReturning) {
                    if (now >= workingState.huntingSession.returnEndTime) {
                        let finalPlayerState = { ...workingState.player };
                        const lootItems = Object.values(workingState.huntingSession.loot);
                        const wasDefeated = workingState.huntingSession.log.some(
                            l => l.type === 'error' && (l.message.includes('Yenildin') || l.message.toLowerCase().includes('defeated'))
                        );
                        if (wasDefeated) {
                            finalPlayerState.health = 1;
                        }

                        if (workingState.huntingSession.huntSlot) {
                            const slotItem = workingState.huntingSession.huntSlot;
                            const existingItemIndex = finalPlayerState.inventory.findIndex(invItem => invItem.id === slotItem.id);
                            if (existingItemIndex > -1) {
                                finalPlayerState.inventory[existingItemIndex].quantity += 1;
                            } else {
                                finalPlayerState.inventory.push({ ...slotItem, quantity: 1 });
                            }
                        }

                        lootItems.forEach(lootItem => {
                            const existingItemIndex = finalPlayerState.inventory.findIndex(invItem => invItem.id === lootItem.id);
                            if (existingItemIndex > -1) {
                                finalPlayerState.inventory[existingItemIndex].quantity += lootItem.quantity;
                            } else {
                                finalPlayerState.inventory.push(lootItem);
                            }
                        });
                        
                        workingState.player = finalPlayerState;
                        workingState.huntingSession = null;
                    }
                }


                // --- Handle Offline Travel ---
                if (workingState.currentTravel) {
                    if (now >= workingState.currentTravel.endTime) {
                        const destination = mapRegions.find(r => r.id === workingState.currentTravel!.destinationId);
                        
                        const arrivalMessage = `${destination?.name || 'Hedefe'} ulaşıldı.`;
                         if (!workingState.notifications) workingState.notifications = [];
                         workingState.notifications.unshift({
                            id: uuidv4(),
                            message: arrivalMessage,
                            icon: 'fa-solid fa-map-location-dot',
                            timestamp: now,
                            read: false,
                        });
                        if (!workingState.actionLog) workingState.actionLog = [];
                        workingState.actionLog.unshift(arrivalMessage);

                        workingState.player.currentLocationId = workingState.currentTravel.destinationId;
                        workingState.currentTravel = null;
                        
                        // If travel finished, no other action could have been running.
                        return { updatedState: workingState, summaryNotification: null };
                    }
                }

                if (workingState.currentAction) {
                    const action = workingState.currentAction;
                    let ticks = 0;
                    let xpPerTick = 0;
                    let playerXpPerTick = 0;
                    const itemGains: { id: string, quantity: number }[] = [];
                    let ingredientCosts: CraftingIngredient[] = [];
                    let actionName = action.name;
                    let effectiveTime = 0;

                    if (action.actionType === 'gathering') {
                        const resource = skillResourceMap[action.skillId]?.find(r => r.id === action.targetId);
                        if (resource) {
                            actionName = resource.name;
                            summaryIcon = resource.icon;
                            const gatheringSkill = workingState.player.skills.find(s => s.id === 'gathering');
                            const gatheringLevel = gatheringSkill ? gatheringSkill.level : 1;
                            const reductionPerLevel = 0.01;
                            const maxReduction = 0.5;
                            let reduction = (gatheringLevel - 1) * reductionPerLevel;
                            if (reduction > maxReduction) reduction = maxReduction;
                            
                            let toolBonus = 0;
                            const requiredToolType = action.skillId === 'mining' ? 'pickaxe' : action.skillId === 'woodcutting' ? 'axe' : action.skillId === 'fishing' ? 'fishing_rod' : null;
                            if(requiredToolType) {
                                toolBonus = Math.max(0, ...workingState.player.inventory.filter(i => i.toolType === requiredToolType).map(i => i.efficiencyBonus || 0));
                            }
                            effectiveTime = resource.timeToGather * (1 - Math.min(reduction + toolBonus, 0.8));
                            xpPerTick = resource.xp;
                            playerXpPerTick = Math.ceil(xpPerTick * 0.005);
                            itemGains.push({ id: resource.itemId, quantity: 1 });
                        }
                    } else { // Crafting
                        const recipe = craftingRecipes[action.skillId]?.find(r => r.id === action.targetId);
                        if (recipe) {
                            actionName = recipe.name;
                            summaryIcon = recipe.icon;
                            effectiveTime = recipe.timeToCraft;
                            xpPerTick = recipe.xp;
                            playerXpPerTick = Math.ceil(xpPerTick * 0.005);
                            itemGains.push({ id: recipe.outputId, quantity: recipe.outputQuantity });
                            ingredientCosts = recipe.ingredients;
                        }
                    }
                    
                    // GÜVENLİK: Eylem süresi sıfır veya negatifse, "bölme sıfıra" hatasını ve sonsuz döngüleri önle.
                    if (effectiveTime <= 0) {
                        console.warn("Sıfır süreli bir eylem için çevrimdışı ilerleme hesaplaması atlandı.", action);
                        actionShouldBeCleared = true;
                    } else {
                        if (action.actionType === 'gathering') {
                            ticks = Math.floor(offlineDuration / effectiveTime);
                            actionShouldBeCleared = false; // Gathering can run indefinitely
                        } else { // Crafting
                             const recipe = craftingRecipes[action.skillId]?.find(r => r.id === action.targetId);
                             if(recipe) {
                                const maxTicksFromTime = Math.floor(offlineDuration / effectiveTime);
                                let maxTicksFromIngredients = Infinity;
                                const tempInventory = new Map(workingState.player.inventory.map(item => [item.id, item.quantity]));
                                for (const ing of recipe.ingredients) {
                                    const available = tempInventory.get(ing.itemId) || 0;
                                    maxTicksFromIngredients = Math.min(maxTicksFromIngredients, Math.floor(available / ing.quantity));
                                }
                                ticks = Math.min(maxTicksFromTime, maxTicksFromIngredients);
                                
                                if (ticks < maxTicksFromTime) {
                                    actionShouldBeCleared = true; // Ran out of ingredients
                                }
                             }
                        }
                    }

                    if (ticks > 0) {
                        const totalItemGains = new Map<string, number>();
                        itemGains.forEach(gain => totalItemGains.set(gain.id, (totalItemGains.get(gain.id) || 0) + gain.quantity * ticks));
                        
                        const inventoryMap = new Map(workingState.player.inventory.map(item => [item.id, item]));
                        
                        ingredientCosts.forEach(cost => {
                            const item = inventoryMap.get(cost.itemId);
                            if(item) item.quantity -= cost.quantity * ticks;
                        });

                        totalItemGains.forEach((qty, id) => {
                            const item = inventoryMap.get(id);
                            if (item) item.quantity += qty;
                            else {
                                const template = itemDatabase[id];
                                if (template) inventoryMap.set(id, { ...template, quantity: qty });
                            }
                        });

                        workingState.player.inventory = Array.from(inventoryMap.values()).filter(i => i.quantity > 0);

                        const skill = workingState.player.skills.find(s => s.id === action.skillId);
                        if (skill) {
                            skill.xp += xpPerTick * ticks;
                            while (skill.xp >= skill.xpToNextLevel) {
                                skill.xp -= skill.xpToNextLevel;
                                skill.level++;
                                skill.xpToNextLevel = Math.floor(skill.xpToNextLevel * 1.15);
                            }
                        }

                        workingState.player.xp += playerXpPerTick * ticks;
                        while (workingState.player.xp >= workingState.player.xpToNextLevel && workingState.player.level < 30) {
                            workingState.player.xp -= workingState.player.xpToNextLevel;
                            workingState.player.level++;
                            workingState.player.xpToNextLevel = Math.floor(workingState.player.xpToNextLevel * 1.25);
                            workingState.player.statPoints = (workingState.player.statPoints || 0) + 3;
                        }

                        const mainGainedItem = itemDatabase[itemGains[0].id];
                        const totalItemsCount = (totalItemGains.get(mainGainedItem.id) || 0);
                        const translatedItemName = tGame('items', mainGainedItem.id, 'name', mainGainedItem.name);
                        summaryMessage = t('offlineGatheringSummary', { itemCount: totalItemsCount, itemName: translatedItemName, xpGained: ticks * xpPerTick });
                        
                        // Add offline gains to session gains
                        workingState.currentAction.sessionGains.xp += xpPerTick * ticks;
                        workingState.currentAction.sessionGains.items += totalItemsCount;
                    }
                    if (actionShouldBeCleared) {
                        workingState.currentAction = null;
                    } else if (workingState.currentAction && effectiveTime > 0) {
                        // Update next tick time for seamless continuation
                        const timeIntoCurrentTick = offlineDuration % effectiveTime;
                        workingState.currentAction.nextTickTime = now + (effectiveTime - timeIntoCurrentTick);
                    }

                } else if (workingState.huntingSession && workingState.huntingSession.isActive && !workingState.huntingSession.isReturning) {
                    const session = workingState.huntingSession;
                    const effectiveDuration = Math.min(offlineDuration, HUNT_MAX_DURATION);
                    const encounters = Math.floor(effectiveDuration / 510000); // Avg 8.5 min

                    if (encounters > 0) {
                        summaryIcon = 'fa-solid fa-paw';
                        const availableCreatures = (creaturesByLocation[session.locationId] || []).filter(c => c.levelReq <= workingState.player.skills.find(s => s.id === 'hunting')!.level);
                        if (availableCreatures.length > 0) {
                            let currentHealth = workingState.player.health;
                            const luckBonus = 1 + (workingState.player.stats.luck / 500);
                            const totalGains = { xp: 0, loot: new Map<string, number>() };
                            let defeated = false;
                            
                            for (let i = 0; i < encounters; i++) {
                                const creature = availableCreatures[Math.floor(Math.random() * availableCreatures.length)];
                                const damageTaken = Math.max(1, creature.levelReq - Math.floor(workingState.player.stats.endurance / 5));
                                currentHealth -= damageTaken;
                                if (currentHealth <= 0) {
                                    defeated = true;
                                    break;
                                }

                                totalGains.xp += creature.xp;
                                creature.lootTable.forEach(drop => {
                                    if (Math.random() < drop.chance * luckBonus) {
                                        totalGains.loot.set(drop.itemId, (totalGains.loot.get(drop.itemId) || 0) + 1);
                                    }
                                });
                            }
                            
                            const inventoryMap = new Map(workingState.player.inventory.map(item => [item.id, item]));
                            if (session.huntSlot) {
                                const item = inventoryMap.get(session.huntSlot.id);
                                if (item) item.quantity += 1;
                                else inventoryMap.set(session.huntSlot.id, { ...session.huntSlot, quantity: 1 });
                            }
                            
                            totalGains.loot.forEach((qty, id) => {
                                const item = inventoryMap.get(id);
                                if (item) item.quantity += qty;
                                else {
                                    const template = itemDatabase[id];
                                    if (template) inventoryMap.set(id, { ...template, quantity: qty });
                                }
                            });
                            workingState.player.inventory = Array.from(inventoryMap.values());
                            
                            const lootCount = Array.from(totalGains.loot.values()).reduce((a, b) => a + b, 0);

                            if (defeated) {
                                workingState.player.health = 1;
                                summaryMessage = t('offlineHuntSummaryDefeat', { lootCount });
                            } else {
                                workingState.player.health = workingState.player.maxHealth;
                                summaryMessage = t('offlineHuntSummarySuccess', { encounters, lootCount, xp: totalGains.xp });
                            }
                        }
                    }
                     workingState.huntingSession = null;
                }

                if (summaryMessage) {
                    const notification: Notification = {
                        id: uuidv4(),
                        message: summaryMessage,
                        icon: summaryIcon,
                        timestamp: now,
                        read: false,
                    };
                    return { updatedState: workingState, summaryNotification: notification };
                }

                return { updatedState: loadedState, summaryNotification: null };
            };


            let finalStateToLoad: GameState | null = null;

            if (stateToLoad) {
                console.log(`Oyun ${loadedFrom} kaynağından yükleniyor.`);
                
                const { updatedState, summaryNotification } = calculateOfflineProgress(stateToLoad);
                finalStateToLoad = updatedState;

                const initialState = getInitialGameState();
                const lastSavedDate = finalStateToLoad.lastSaved ? new Date(finalStateToLoad.lastSaved) : null;
                const mergedState = safeMergeDeep(initialState, finalStateToLoad);
                mergedState.lastSaved = lastSavedDate;

                if (mergedState.player.skills && Array.isArray(mergedState.player.skills)) {
                    const defaultSkills = initialState.player.skills;
                    const defaultSkillMap = new Map(defaultSkills.map(s => [s.id, s]));
                    mergedState.player.skills = mergedState.player.skills.map(savedSkill => {
                        const defaultSkill = defaultSkillMap.get(savedSkill.id);
                        if (defaultSkill) return { ...savedSkill, icon: defaultSkill.icon };
                        return savedSkill;
                    });
                }
                
                if (summaryNotification) {
                    if (!mergedState.notifications) mergedState.notifications = [];
                    mergedState.notifications.unshift(summaryNotification);
                }

                if (loadedFrom === 'cloud') {
                    saveGameStateToLocal(user, character.id, mergedState);
                }
                
                const finalState = { ...mergedState, isLoading: false, isSaving: false };
                setGameState(finalState);

                // If local save was newer, sync it back to the cloud now.
                if (isLocalNewer) {
                    console.log("Yerel kayıt daha yeni, bulutla eşitleniyor...");
                    saveGameToCloud(user, character, finalState)
                        .then(cloudSaveTime => {
                             const stateWithNewSaveTime = { ...finalState, lastSaved: cloudSaveTime };
                             saveGameStateToLocal(user, character.id, stateWithNewSaveTime);
                             setGameState(prev => ({...prev, lastSaved: cloudSaveTime}));
                             addNotification(t('offlineProgressSynced'), "fa-solid fa-cloud-arrow-up");
                        })
                        .catch(e => {
                            console.error("Yükleme sonrası bulut eşitlemesi başarısız oldu:", e);
                            addNotification(t('offlineSyncFailed'), "fa-solid fa-triangle-exclamation");
                        });
                }

            } else {
                console.log('Kayıt bulunamadı, yeni oyun başlatılıyor.');
                setGameState(prev => ({...prev, isLoading: false}));
            }
        };

        loadGame();
        autoSaveIntervalRef.current = setInterval(() => saveGame(false), 5 * 60 * 1000);

        return () => {
            if (actionIntervalRef.current) clearInterval(actionIntervalRef.current);
            if (huntTimeoutRef.current) clearTimeout(huntTimeoutRef.current);
            if (travelTimeoutRef.current) clearTimeout(travelTimeoutRef.current);
            if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
            
            // CRITICAL FIX: Use the ref to save the most up-to-date state on unmount.
            // This prevents saving stale state from a closure.
            console.log("GameProvider unmounting, saving state to local storage.");
            const stateToSave = { ...gameStateRef.current, isSaving: false, isLoading: false, lastSaved: new Date() };
            saveGameStateToLocal(user, character.id, stateToSave);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, character.id, t]);

    useEffect(() => {
        // This effect runs once after the initial game state has been loaded
        // to resume any ongoing actions (professions, hunting, or travel).
        if (!gameState.isLoading && !gameLoadedRef.current) {
            gameLoadedRef.current = true;
            
            // Resume any active profession action
            if (gameState.currentAction) {
                console.log("Devam eden eylem sürdürülüyor:", gameState.currentAction.name);
                startActionInterval(gameState.currentAction);
            }
            
            // Resume any active hunting session
            if (gameState.huntingSession?.isActive && !gameState.huntingSession.isReturning) {
                console.log("Avlanma oturumu sürdürülüyor.");
                if(huntTimeoutRef.current) clearTimeout(huntTimeoutRef.current);
                // Schedule the next encounter check to resume the hunting loop.
                huntTimeoutRef.current = setTimeout(performHuntEncounter, 5000); 
            }

            // Resume any active travel timer
            if (gameState.currentTravel) {
                const now = Date.now();
                const remainingTime = gameState.currentTravel.endTime - now;
                if (remainingTime > 0) {
                    console.log(`Seyahat sürdürülüyor, kalan süre: ${remainingTime}ms`);
                    if(travelTimeoutRef.current) clearTimeout(travelTimeoutRef.current);
                    travelTimeoutRef.current = setTimeout(() => {
                         setGameState(prev => {
                            if (!prev.currentTravel) return prev;
                            const destinationId = prev.currentTravel.destinationId;
                            const destination = mapRegions.find(r => r.id === destinationId);
                             return {
                                ...prev,
                                player: {
                                    ...prev.player,
                                    currentLocationId: destinationId
                                },
                                currentTravel: null,
                                actionLog: [`${destination?.name || 'hedefe'} ulaşıldı.`, ...prev.actionLog].slice(0, 50)
                            };
                        });
                        addNotification(t('travelFinished', { destinationName: mapRegions.find(r => r.id === gameState.currentTravel?.destinationId)?.name || '' }), 'fa-solid fa-map-location-dot');
                    }, remainingTime);
                }
            }
        }
    }, [gameState.isLoading, gameState.currentAction, gameState.huntingSession, gameState.currentTravel, startActionInterval, performHuntEncounter, addNotification, t]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            // CRITICAL FIX: Use the ref to save the most up-to-date state on beforeunload.
             console.log("beforeunload event, saving state to local storage.");
             const stateToSave = { ...gameStateRef.current, isSaving: false, isLoading: false, lastSaved: new Date() };
             saveGameStateToLocal(user, character.id, stateToSave);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user, character.id]);
    
    const handleGoBackToCharSelect = useCallback(() => {
        onBackToCharSelect();
    }, [onBackToCharSelect]);


    const value = {
        user,
        character,
        gameState,
        currentView,
        activeSkillId,
        setCurrentView,
        saveGame: () => saveGame(false),
        logout: onLogout,
        goBackToCharSelect: handleGoBackToCharSelect,
        startAction,
        startCraftingAction,
        stopAction,
        setActiveSkillId,
        setPlayerInventory,
        updatePlayerStats,
        travelTo,
        startHuntingSession,
        refreshHuntingSession,
        cancelHuntingSession,
        markNotificationsAsRead,
        clearAllNotifications,
        equipItem,
        unequipItem,
        useItem,
        updateSettings,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};