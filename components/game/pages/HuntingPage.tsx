

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import Card from '../../ui/Card';
import ProgressBar from '../../ui/ProgressBar';
import { Item, HuntingLogEntry, Creature } from '../../../types';
import { rarityColors, itemDatabase } from '../../../utils/itemData';
import { creaturesByLocation } from '../../../utils/huntingData';
import { mapRegions } from '../../../utils/initialGameState';
import { useTranslation } from '../../../App';

const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const HuntSlotPicker: React.FC<{
    selectedItem: Item | null;
    onSelectItem: (item: Item | null) => void;
}> = ({ selectedItem, onSelectItem }) => {
    const { gameState } = useGame();
    const { t, tGame } = useTranslation();
    const [isPickerOpen, setPickerOpen] = useState(false);

    const usableItems = useMemo(() => {
        return gameState.player.inventory.filter(item => item.healAmount);
    }, [gameState.player.inventory]);

    const handleSelect = (item: Item) => {
        onSelectItem(item);
        setPickerOpen(false);
    }
    
    const translatedSelectedItemName = selectedItem ? tGame('items', selectedItem.id, 'name', selectedItem.name) : '';

    const Modal = () => (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setPickerOpen(false)}
        >
            <div 
                className="bg-[var(--background-medium)] rounded-lg shadow-2xl w-full max-w-lg border-2 border-[var(--accent-gold)]/50 animate-fade-in-up flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[var(--accent-gold)]">{t('selectSupportItem')}</h3>
                    <button onClick={() => setPickerOpen(false)} className="p-1.5 rounded-full hover:bg-[var(--border-color)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2 max-h-64 overflow-y-auto pr-2">
                        {usableItems.length > 0 ? usableItems.map(item => {
                            const translatedName = tGame('items', item.id, 'name', item.name);
                            return (
                            <div key={item.id} onClick={() => handleSelect(item)} className="relative group aspect-square bg-[var(--background-dark)]/50 rounded-md p-1 border-2 border-[var(--border-color)] hover:border-[var(--accent-blue)] cursor-pointer">
                                <img src={item.icon} alt={translatedName} />
                                <span className="absolute bottom-0.5 right-0.5 text-xs font-bold bg-[var(--background-medium)] px-1 rounded">{item.quantity}</span>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-max bg-[var(--background-dark)] text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{translatedName}</div>
                            </div>
                        )}) : <p className="text-sm text-[var(--text-secondary)] col-span-full text-center p-4">{t('noSuitableItems')}</p>}
                    </div>
                </div>
                {selectedItem && (
                    <div className="p-3 bg-[var(--background-dark)]/50 rounded-b-lg flex justify-end">
                         <button onClick={() => { onSelectItem(null); setPickerOpen(false); }} className="text-sm font-semibold text-red-400 hover:text-red-300 bg-transparent hover:bg-red-900/20 py-1 px-3 rounded-md transition-colors">
                            {t('removeSelectedItem')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {isPickerOpen && <Modal />}
            <div className="flex flex-col items-center">
                <div 
                    onClick={() => setPickerOpen(true)}
                    className="w-24 h-24 bg-[var(--background-dark)]/70 rounded-lg border-2 border-dashed border-[var(--border-color)] flex items-center justify-center cursor-pointer hover:border-[var(--accent-gold)] transition-colors p-2"
                >
                    {selectedItem ? (
                        <img src={selectedItem.icon} alt={translatedSelectedItemName} title={translatedSelectedItemName} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-center">
                            <span className="text-4xl text-[var(--border-color)]">+</span>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{t('selectItem')}</p>
                        </div>
                    )}
                </div>
                 <p className="text-sm text-[var(--text-secondary)] mt-2 text-center max-w-xs">{t('supportSlotDesc')}</p>
            </div>
        </>
    );
};

const PreHuntView: React.FC<{ onStart: (slotItem: Item | null) => void }> = ({ onStart }) => {
    const { gameState } = useGame();
    const { t, tGame } = useTranslation();
    const { player } = gameState;
    const [slotItem, setSlotItem] = useState<Item | null>(null);

    const huntingSkill = player.skills.find(s => s.id === 'hunting');
    const region = mapRegions.find(r => r.id === player.currentLocationId);
    const creaturesInLocation = creaturesByLocation[player.currentLocationId] || [];
    const canHunt = creaturesInLocation.length > 0;
    const hasWeapon = player.equipment.weapon !== null;
    const isReady = canHunt && hasWeapon;
    
    const safetyWarning = useMemo(() => {
        if (!canHunt || !huntingSkill) return null;
        const avgLevel = creaturesInLocation.reduce((sum, c) => sum + c.levelReq, 0) / creaturesInLocation.length;
        if (huntingSkill.level < avgLevel - 5) {
            return { message: t('safetyWarningDanger'), type: 'danger' };
        }
        return { message: t('safetyWarningSafe'), type: 'safe' };
    }, [huntingSkill, canHunt, creaturesInLocation, t]);

    const Requirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
        <li className={`flex items-center transition-colors ${met ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                {met 
                    ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                }
            </svg>
            <span>{text}</span>
        </li>
    );
    
    const translatedRegionName = region ? tGame('mapRegions', region.id, 'name', region.name) : '';

    return (
        <Card title={t('huntPreparation')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-[var(--background-dark)]/40 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-3 text-[var(--accent-gold)] border-b border-[var(--border-color)] pb-2">{t('requirements')}</h4>
                        <ul className="space-y-2 text-sm">
                            <Requirement met={hasWeapon} text={t('reqWeapon')} />
                            <Requirement met={canHunt} text={t('reqCreatures')} />
                        </ul>
                    </div>

                    <div className="bg-[var(--background-dark)]/40 p-4 rounded-lg text-center">
                        <h4 className="font-bold text-lg mb-3 text-[var(--accent-gold)] border-b border-[var(--border-color)] pb-2">{t('supportSlot')}</h4>
                        <HuntSlotPicker selectedItem={slotItem} onSelectItem={setSlotItem} />
                    </div>
                     
                     {safetyWarning && (
                        <div className={`p-3 rounded-lg text-sm ${safetyWarning.type === 'danger' ? 'bg-red-900/50 text-[var(--accent-red)]' : 'bg-green-900/50 text-[var(--accent-green)]'}`}>
                            {safetyWarning.message}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 bg-[var(--background-dark)]/40 p-6 rounded-lg flex flex-col">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">{t('wildernessOf', { regionName: translatedRegionName })}</h3>
                        <p className="text-[var(--text-secondary)]">{t('exploreCreaturesAndLoot')}</p>
                    </div>
                    <div className="flex-1 pr-2 space-y-3 max-h-96 overflow-y-auto">
                        {creaturesInLocation.map(creature => {
                            const translatedCreatureName = tGame('creatures', creature.id, 'name', creature.name);
                            return (
                            <div key={creature.id} className="flex items-start bg-[var(--background-medium)] p-3 rounded-lg transition-colors hover:bg-[var(--border-color)]">
                                <img src={creature.icon} alt={translatedCreatureName} className="w-14 h-14 mr-4 object-contain flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-[var(--text-primary)] text-lg">{translatedCreatureName} <span className="text-sm font-normal text-[var(--text-secondary)]">({t('level_short')} {creature.levelReq})</span></p>
                                    <div className="text-xs text-[var(--text-secondary)]">
                                        <span className="font-semibold">{t('possibleLoot')}: </span>
                                        <div className="flex flex-wrap gap-x-2 mt-1">
                                            {creature.lootTable.map(loot => {
                                                const item = itemDatabase[loot.itemId];
                                                if (!item) return null;
                                                const translatedItemName = tGame('items', item.id, 'name', item.name);
                                                return (
                                                    <div key={loot.itemId} className="relative group">
                                                        <span className="text-blue-400 cursor-help underline decoration-dotted decoration-gray-500">{translatedItemName}</span>
                                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-[var(--background-dark)] text-white text-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-20 border border-[var(--border-color)] text-left">
                                                            <div className="flex items-center mb-2">
                                                                <img src={item.icon} alt={translatedItemName} className="w-8 h-8 mr-2 object-contain" />
                                                                <div>
                                                                    <p className="font-bold">{translatedItemName}</p>
                                                                    <p className="text-xs" style={{ color: rarityColors[item.rarity] }}>{item.rarity}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-[var(--text-secondary)] capitalize">{item.type}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                     <button 
                        onClick={() => onStart(slotItem)}
                        disabled={!isReady}
                        className="w-full mt-6 bg-[var(--accent-green)] hover:brightness-110 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 disabled:bg-[var(--border-color)] disabled:cursor-not-allowed"
                    >
                        {t('startHunt')}
                    </button>
                </div>
            </div>
        </Card>
    );
};

const LootDisplay: React.FC<{ loot: Record<string, Item> }> = ({ loot }) => {
    const { t, tGame } = useTranslation();
    const lootItems = useMemo(() => Object.values(loot), [loot]);
    return (
         <div>
            <h3 className="font-bold text-lg mb-2 text-[var(--accent-gold)]">{t('collectedLoot')}</h3>
            {lootItems.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2 bg-[var(--background-dark)]/50 p-2 rounded-lg max-h-48 overflow-y-auto">
                    {lootItems.map(item => {
                        const translatedName = tGame('items', item.id, 'name', item.name);
                        return (
                        <div key={item.id} className="relative group aspect-square bg-[var(--background-medium)] rounded-md p-1 border-2" style={{ borderColor: rarityColors[item.rarity] }}>
                            <img src={item.icon} alt={translatedName} className="w-full h-full object-contain" />
                            <span className="absolute bottom-0.5 right-0.5 text-xs font-bold bg-[var(--background-dark)] px-1 rounded text-white">{item.quantity}</span>
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-max bg-[var(--background-dark)] text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{translatedName}</div>
                        </div>
                    )})}
                </div>
            ) : (
                <p className="text-sm text-[var(--text-secondary)] text-center p-4">{t('noLootCollected')}</p>
            )}
        </div>
    );
};

const HuntingLog: React.FC<{ log: HuntingLogEntry[] }> = ({ log }) => {
    const logEndRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [log]);
    
    const typeInfo: Record<HuntingLogEntry['type'], { prefix: string; color: string; icon: string }> = {
        event: { prefix: 'INFO', color: 'text-gray-400', icon: 'fa-solid fa-info-circle' },
        loot: { prefix: 'LOOT', color: 'text-yellow-400', icon: 'fa-solid fa-treasure-chest' },
        milestone: { prefix: 'PROGRESS', color: 'text-cyan-400', icon: 'fa-solid fa-star' },
        error: { prefix: 'ERROR', color: 'text-[var(--accent-red)]', icon: 'fa-solid fa-exclamation-triangle' },
        health: { prefix: 'HEALTH', color: 'text-[var(--accent-green)]', icon: 'fa-solid fa-heart-pulse' },
        damage: { prefix: 'DAMAGE', color: 'text-orange-400', icon: 'fa-solid fa-gavel' },
        encounter: { prefix: 'ENCOUNTER', color: 'text-purple-400', icon: 'fa-solid fa-paw' },
    };

    return (
        <div>
            <h3 className="font-bold text-lg mb-2 text-[var(--accent-gold)]">{t('huntingLog')}</h3>
            <div className="bg-black/50 p-3 rounded-lg h-64 overflow-y-auto font-mono text-sm shadow-inner">
                <ul className="space-y-1">
                    {log.map((entry, index) => (
                         <li key={index} className={`flex items-start p-1 rounded transition-colors hover:bg-white/5 ${typeInfo[entry.type]?.color || 'text-gray-400'}`}>
                            <i className={`${typeInfo[entry.type]?.icon || 'fa-solid fa-circle-info'} w-5 text-center pt-0.5 flex-shrink-0`}></i>
                            <span className="ml-2 text-gray-300 break-words flex-1">{entry.message}</span>
                         </li>
                    ))}
                </ul>
                <div ref={logEndRef} />
            </div>
        </div>
    );
};

const HuntingSessionView: React.FC = () => {
    const { gameState, refreshHuntingSession, cancelHuntingSession } = useGame();
    const { t, tGame } = useTranslation();
    const { huntingSession, player } = gameState;
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentCreature, setCurrentCreature] = useState<Creature | null>(null);
    const [flavorText, setFlavorText] = useState(t('exploringTheWilderness'));

    useEffect(() => {
        if (!huntingSession) return;

        const findCurrentCreature = () => {
            const encounterLog = [...huntingSession.log].reverse().find(e => e.type === 'encounter' && e.creatureId);
            if (encounterLog && encounterLog.creatureId) {
                const allCreatures = Object.values(creaturesByLocation).flat();
                const foundCreature = allCreatures.find(c => c.id === encounterLog.creatureId);
                setCurrentCreature(foundCreature || null);
            } else {
                 setCurrentCreature(null);
            }
        };

        findCurrentCreature();

        const timerInterval = setInterval(() => {
            const remaining = huntingSession.endTime - Date.now();
            setTimeRemaining(Math.max(0, remaining));
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [huntingSession]);

    useEffect(() => {
        if (currentCreature) return; // Don't cycle texts if fighting

        const flavorTextKeys = ['huntFlavor_1', 'huntFlavor_2', 'huntFlavor_3', 'huntFlavor_4', 'huntFlavor_5', 'huntFlavor_6', 'huntFlavor_7'];
        
        const randomInitialKey = flavorTextKeys[Math.floor(Math.random() * flavorTextKeys.length)] as any;
        setFlavorText(t(randomInitialKey));

        const flavorInterval = setInterval(() => {
            const randomKey = flavorTextKeys[Math.floor(Math.random() * flavorTextKeys.length)] as any;
            setFlavorText(t(randomKey));
        }, 8000); // Change text every 8 seconds

        return () => clearInterval(flavorInterval);
    }, [currentCreature, t]);


    if (!huntingSession) return null;

    if (huntingSession.isReturning) {
         return (
             <Card title={t('returningFromHuntTitle')}>
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-12 h-12 border-4 border-t-transparent border-[var(--accent-blue)] rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('returningToTown')}</h3>
                    <p className="text-[var(--text-secondary)]">{t('lootAndXpSoon')}</p>
                </div>
             </Card>
         );
    }
    
    const hpPercentage = (player.health / player.maxHealth) * 100;
    const translatedCreatureName = currentCreature ? tGame('creatures', currentCreature.id, 'name', currentCreature.name) : '';
    const translatedHuntSlotName = huntingSession.huntSlot ? tGame('items', huntingSession.huntSlot.id, 'name', huntingSession.huntSlot.name) : '';

    return (
        <Card title={t('huntInProgress')}>
            <div className="bg-[var(--background-dark)]/50 p-3 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                 <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-xs text-[var(--text-secondary)]">{t('timeRemaining')}</div>
                        <div className="font-mono text-xl text-white font-bold">{formatTime(timeRemaining)}</div>
                    </div>
                     {huntingSession.huntSlot && (
                        <>
                        <div className="w-px h-10 bg-[var(--border-color)]"></div>
                        <div className="text-center" title={t('activeSupport', { itemName: translatedHuntSlotName })}>
                            <div className="text-xs text-[var(--text-secondary)]">{t('support')}</div>
                            <div className="w-10 h-10 bg-[var(--background-medium)] rounded-md p-1 border border-[var(--border-color)]">
                                <img src={huntingSession.huntSlot.icon} alt={translatedHuntSlotName} className="w-full h-full object-contain" />
                            </div>
                        </div>
                        </>
                    )}
                    <div className="w-px h-10 bg-[var(--border-color)]"></div>
                    <div className="flex-1 min-w-[12rem]">
                         <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                            <span>{t('health_cap')}</span>
                            <span>{player.health} / {player.maxHealth}</span>
                        </div>
                        <ProgressBar value={hpPercentage} color="bg-[var(--accent-red)]" className="h-2.5" />
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={refreshHuntingSession} className="bg-[var(--accent-blue)] hover:brightness-110 text-white font-semibold py-2 px-4 rounded transition-colors duration-300 flex items-center gap-2">
                        <i className="fa-solid fa-arrows-rotate"></i> {t('refresh')}
                    </button>
                    <button onClick={() => cancelHuntingSession(false)} className="bg-[var(--accent-red)] hover:brightness-110 text-white font-semibold py-2 px-4 rounded transition-colors duration-300">
                        {t('return')}
                    </button>
                </div>
            </div>

            <div className="my-6 flex flex-col items-center justify-center min-h-[148px] p-4 bg-black/20 rounded-lg border border-[var(--border-color)] animate-fade-in">
                {currentCreature ? (
                    <>
                        <img src={currentCreature.icon} alt={translatedCreatureName} className="w-24 h-24 object-contain" />
                        <p className="mt-2 text-xl font-bold text-white">{t('fighting', { creatureName: translatedCreatureName })}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{t('level')} {currentCreature.levelReq}</p>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-t-transparent border-[var(--accent-blue)] rounded-full animate-spin mb-4 mx-auto"></div>
                        <p className="text-xl font-bold text-white transition-opacity duration-500">{flavorText}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{t('keepAnEyeOnTheLog')}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LootDisplay loot={huntingSession.loot} />
                <HuntingLog log={huntingSession.log} />
            </div>
        </Card>
    );
};

const HuntingPage: React.FC = () => {
    const { gameState, startHuntingSession } = useGame();
    
    return (
        <div className="bg-center bg-cover bg-no-repeat rounded-lg" style={{ backgroundImage: "url('https://files.catbox.moe/us514l.png')" }}>
            <div className="bg-stone-900/70 backdrop-blur-sm rounded-lg p-0 md:p-2">
                {gameState.huntingSession ? (
                    <HuntingSessionView />
                ) : (
                    <PreHuntView onStart={startHuntingSession} />
                )}
            </div>
        </div>
    );
};

export default HuntingPage;