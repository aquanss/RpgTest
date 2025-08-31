

import React, { useState, useMemo } from 'react';
import Card from '../../../ui/Card';
import { useGame } from '../../../../context/GameContext';
import type { Skill, GatherableResource, CraftingRecipe, Item } from '../../../../types';
import { skillResourceMap, craftingRecipes } from '../../../../utils/initialGameState';
import ProgressBar from '../../../ui/ProgressBar';
import { formatNumber } from '../../../../utils/formatNumber';
import { itemDatabase } from '../../../../utils/itemData';
import { useTranslation } from '../../../../App';

interface SkillDetailProps {
    skill: Skill;
    onBack: () => void;
}

const ResourceCard: React.FC<{
    resource: GatherableResource;
    skill: Skill;
    isCurrentAction: boolean;
    isTraveling: boolean;
    onStart: (resource: GatherableResource) => void;
    onStop: () => void;
}> = ({ resource, skill, isCurrentAction, isTraveling, onStart, onStop }) => {
    const { t, tGame } = useTranslation();
    const canGather = skill.level >= resource.levelReq;
    const isDisabled = !canGather || isTraveling;
    const translatedResourceName = tGame('items', resource.itemId, 'name', resource.name);

    const actionButton = () => {
        const label = isCurrentAction ? t('stop') : (canGather ? t('gather') : t('locked'));
        const action = isCurrentAction ? onStop : () => onStart(resource);
        const classes = isCurrentAction 
            ? 'bg-[var(--accent-red)] hover:brightness-110' 
            : 'bg-[var(--accent-green)] hover:brightness-110';
        
        return (
            <button
                onClick={action}
                disabled={isDisabled}
                className={`w-full mt-auto font-bold py-2 px-4 rounded-b-lg transition-colors duration-300 text-white ${classes} disabled:bg-[var(--border-color)] disabled:cursor-not-allowed`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className={`relative bg-[var(--background-medium)] rounded-lg flex flex-col text-center border-2 transition-all duration-300 ${
            isCurrentAction ? 'border-[var(--accent-blue)] scale-105 shadow-lg' : 'border-[var(--border-color)]'
        } ${!canGather ? 'opacity-60' : ''}`}>
            {!canGather && (
                 <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002 2V10a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" clipRule="evenodd" />
                    </svg>
                 </div>
            )}
            <div className="p-4 flex-grow">
                <img src={resource.icon} alt={translatedResourceName} className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 object-contain" loading="lazy" decoding="async" />
                <p className="font-semibold text-[var(--text-primary)]">{translatedResourceName}</p>
                <p className="text-sm text-[var(--text-secondary)] mb-2">{t('levelWithNumber', { level: resource.levelReq })}</p>
                 <div className="flex justify-center items-center gap-4 text-xs">
                    <span className="flex items-center text-[var(--text-secondary)]" title={t('gatherTime')}><img src="https://files.catbox.moe/837vu4.png" className="w-4 h-4 mr-1" alt="" loading="lazy" decoding="async" />{resource.timeToGather / 1000}s</span>
                    <span className="flex items-center text-[var(--accent-gold)] font-bold" title={t('xpGain')}><img src="https://files.catbox.moe/q9g8c6.png" className="w-4 h-4 mr-1" alt="" loading="lazy" decoding="async" />{resource.xp} {t('xpUnit')}</span>
                </div>
            </div>
            {actionButton()}
        </div>
    );
};

const RecipeCard: React.FC<{
    recipe: CraftingRecipe;
    skill: Skill;
    isCurrentAction: boolean;
    isTraveling: boolean;
    onStart: (recipe: CraftingRecipe) => void;
    onStop: () => void;
}> = ({ recipe, skill, isCurrentAction, isTraveling, onStart, onStop }) => {
    const { gameState } = useGame();
    const { t, tGame } = useTranslation();
    const canCraft = skill.level >= recipe.levelReq;
    
    const inventoryMap = new Map(gameState.player.inventory.map(item => [item.id, item.quantity]));
    const hasIngredients = recipe.ingredients.every(
        ing => (inventoryMap.get(ing.itemId) || 0) >= ing.quantity
    );
    
    const isDisabled = !canCraft || isTraveling || (!isCurrentAction && !hasIngredients);
    const translatedRecipeName = tGame('recipes', recipe.id, 'name', recipe.name);

    const actionButton = () => {
        const label = isCurrentAction ? t('stop') : (canCraft ? t('craft') : t('locked'));
        const action = isCurrentAction ? onStop : () => onStart(recipe);
        const classes = isCurrentAction 
            ? 'bg-[var(--accent-red)] hover:brightness-110' 
            : 'bg-[var(--accent-green)] hover:brightness-110';
        
        return (
            <button
                onClick={action}
                disabled={isDisabled}
                className={`w-full mt-auto font-bold py-2 px-4 rounded-b-lg transition-colors duration-300 text-white ${classes} disabled:bg-[var(--border-color)] disabled:cursor-not-allowed`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className={`relative bg-[var(--background-medium)] rounded-lg flex flex-col text-center border-2 transition-all duration-300 ${
            isCurrentAction ? 'border-[var(--accent-blue)] scale-105 shadow-lg' : 'border-[var(--border-color)]'
        } ${!canCraft ? 'opacity-60' : ''}`}>
             {!canCraft && (
                 <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002 2V10a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" clipRule="evenodd" />
                    </svg>
                 </div>
            )}
            <div className="p-4 flex-grow flex flex-col">
                {/* Top Part */}
                <div>
                    <img src={recipe.icon} alt={translatedRecipeName} className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 object-contain" loading="lazy" decoding="async" />
                    <p className="font-semibold text-[var(--text-primary)]">{translatedRecipeName}</p>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{t('levelWithNumber', { level: recipe.levelReq })}</p>
                    <div className="flex justify-center items-center gap-4 text-xs mb-2">
                        <span className="flex items-center text-[var(--text-secondary)]" title={t('craftTime')}><img src="https://files.catbox.moe/837vu4.png" className="w-4 h-4 mr-1" alt="" loading="lazy" decoding="async" />{recipe.timeToCraft / 1000}s</span>
                        <span className="flex items-center text-[var(--accent-gold)] font-bold" title={t('xpGain')}><img src="https://files.catbox.moe/q9g8c6.png" className="w-4 h-4 mr-1" alt="" loading="lazy" decoding="async" />{recipe.xp} {t('xpUnit')}</span>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-grow"></div> 

                {/* Bottom Part (ingredients) */}
                <div className="text-xs text-left pt-2 border-t border-[var(--border-color)] space-y-1">
                    {recipe.ingredients.map(ing => {
                        const hasAmount = inventoryMap.get(ing.itemId) || 0;
                        const hasEnough = hasAmount >= ing.quantity;
                        const itemInfo = itemDatabase[ing.itemId];
                        const translatedIngredientName = tGame('items', itemInfo.id, 'name', itemInfo.name);
                        return (
                             <div key={ing.itemId} className={`flex items-center justify-between ${hasEnough ? 'text-[var(--text-secondary)]' : 'text-red-400'}`}>
                                <div className="flex items-center">
                                    <img src={itemInfo.icon} alt={translatedIngredientName} className="w-4 h-4 mr-1.5" loading="lazy" decoding="async" />
                                    <span>{translatedIngredientName}</span>
                                </div>
                                <span>{formatNumber(hasAmount)}/{ing.quantity}</span>
                             </div>
                        )
                    })}
                </div>
            </div>
            {actionButton()}
        </div>
    )
}


const SkillDetail: React.FC<SkillDetailProps> = ({ skill, onBack }) => {
    const { gameState, startAction, startCraftingAction, stopAction } = useGame();
    const { t, tGame } = useTranslation();
    const { currentAction, player, currentTravel } = gameState;
    const [forgeFilter, setForgeFilter] = useState('all');

    const craftingSkillIds = ['smelting', 'forge', 'alchemy', 'cooking'];
    const isCraftingSkill = craftingSkillIds.includes(skill.id);

    const resources = skillResourceMap[skill.id] || [];
    const recipes = craftingRecipes[skill.id] || [];
    
    const currentSkillData = player.skills.find(s => s.id === skill.id);
    const gatheringSkill = player.skills.find(s => s.id === 'gathering');
    
    if (!currentSkillData) return null;

    const gatheringLevel = gatheringSkill ? gatheringSkill.level : 1;
    const reductionPerLevel = 0.01;
    const maxReduction = 0.5;
    let reduction = (gatheringLevel - 1) * reductionPerLevel;
    if (reduction > maxReduction) reduction = maxReduction;
    const efficiencyBonus = (reduction * 100).toFixed(0);

    let toolBonus = 0;
    const requiredToolType = 
        skill.id === 'mining' ? 'pickaxe' :
        skill.id === 'woodcutting' ? 'axe' :
        skill.id === 'fishing' ? 'fishing_rod' :
        null;

    if (requiredToolType) {
        const toolsInInventory = player.inventory.filter(
            item => item.toolType === requiredToolType && typeof item.efficiencyBonus === 'number'
        );
        if (toolsInInventory.length > 0) {
            toolBonus = Math.max(...toolsInInventory.map(tool => tool.efficiencyBonus!));
        }
    }
    const toolBonusPercentage = (toolBonus * 100).toFixed(0);

    const forgeCategories: { id: Item['equipmentType'] | 'all'; label: string }[] = [
        { id: 'all', label: t('filterAll') },
        { id: 'tool', label: t('filterTools') },
        { id: 'weapon', label: t('filterWeapons') },
        { id: 'helmet', label: t('filterHelmets') },
        { id: 'chest', label: t('filterChests') },
        { id: 'legs', label: t('filterLegs') },
        { id: 'boots', label: t('filterBoots') },
        { id: 'gloves', label: t('filterGloves') },
    ];
    
    const displayedRecipes = useMemo(() => {
        if (skill.id !== 'forge' || forgeFilter === 'all') {
            return recipes;
        }
        return recipes.filter(recipe => {
            const outputItem = itemDatabase[recipe.outputId];
            return outputItem && outputItem.equipmentType === forgeFilter;
        });
    }, [recipes, skill.id, forgeFilter]);

    const translatedSkillName = tGame('skills', skill.id, 'name', skill.name);
    const title = (
         <div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={skill.icon} alt={translatedSkillName} className="w-8 h-8 mr-4 object-contain" />
                    <span className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-fantasy)'}}>{translatedSkillName}</span>
                    <span className="ml-4 bg-[var(--border-color)] text-[var(--accent-gold)] text-base font-bold px-4 py-1 rounded-full shadow-sm">{currentSkillData.level}</span>
                </div>
                <button
                    onClick={onBack}
                    className="bg-[var(--border-color)] hover:bg-gray-600 text-[var(--text-primary)] font-semibold py-1 px-3 rounded text-sm transition-colors duration-300"
                >
                    &larr; {t('backToSkills')}
                </button>
            </div>
            <div className="mt-4 space-y-2">
                 <div>
                    <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                        <span>{t('xpProgress')}</span>
                        <span>{formatNumber(currentSkillData.xp)} / {formatNumber(currentSkillData.xpToNextLevel)}</span>
                    </div>
                    <ProgressBar value={(currentSkillData.xp / currentSkillData.xpToNextLevel) * 100} color="bg-[var(--accent-blue)]" className="h-2.5" showGradient={true} />
                </div>
                {gatheringSkill && ['woodcutting', 'mining', 'fishing'].includes(skill.id) && (
                    <div className="text-right text-xs text-green-400">
                        {t('gatheringEfficiency')}: +{efficiencyBonus}% {t('speed')}
                        {toolBonus > 0 && <span className="ml-2 text-cyan-400">| {t('toolBonus')}: +{toolBonusPercentage}%</span>}
                    </div>
                )}
            </div>
        </div>
    );
    
    return (
        <Card title={title}>
            {isCraftingSkill && skill.id === 'forge' && (
                <div className="mb-6 flex items-center bg-[var(--background-dark)]/50 p-1 rounded-lg space-x-1 flex-wrap">
                    {forgeCategories.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setForgeFilter(id)}
                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 ${
                                forgeFilter === id
                                    ? 'bg-[var(--accent-blue)] text-white'
                                    : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
            {isCraftingSkill ? (
                 displayedRecipes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {displayedRecipes.map(recipe => (
                             <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                skill={currentSkillData}
                                isCurrentAction={currentAction?.targetId === recipe.id}
                                isTraveling={!!currentTravel}
                                onStart={(rec) => startCraftingAction(skill.id, rec)}
                                onStop={stopAction}
                            />
                        ))}
                    </div>
                 ) : (
                    <p className="text-center text-[var(--text-secondary)] py-8">
                         {recipes.length > 0 ? t('noRecipesFilter') : t('noRecipesSkill')}
                    </p>
                 )
            ) : (
                resources.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {resources.map(resource => (
                            <ResourceCard
                                key={resource.id}
                                resource={resource}
                                skill={currentSkillData}
                                isCurrentAction={currentAction?.targetId === resource.id}
                                isTraveling={!!currentTravel}
                                onStart={(res) => startAction(skill.id, res)}
                                onStop={stopAction}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-[var(--text-secondary)] py-8">{t('noResourcesSkill')}</p>
                )
            )}
        </Card>
    );
};

export default SkillDetail;