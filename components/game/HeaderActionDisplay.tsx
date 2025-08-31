import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { skillResourceMap, craftingRecipes } from '../../utils/initialGameState';
import ProgressBar from '../ui/ProgressBar';
import { useTranslation } from '../../App';

const HeaderActionDisplay: React.FC = () => {
    const { gameState, setCurrentView, setActiveSkillId } = useGame();
    const { t, tGame } = useTranslation();
    const { currentAction, currentTravel, huntingSession } = gameState;
    const [travelProgress, setTravelProgress] = useState(0);

    useEffect(() => {
        if (!currentTravel) return;
        
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - currentTravel.startTime;
            const total = currentTravel.endTime - currentTravel.startTime;
            const progress = total > 0 ? (elapsed / total) * 100 : 100;
            setTravelProgress(Math.min(100, progress));
        }, 100);

        return () => clearInterval(interval);
    }, [currentTravel]);
    
    const actionDetails = useMemo(() => {
        if (!currentAction) return null;
        if (currentAction.actionType === 'gathering') {
            const resource = skillResourceMap[currentAction.skillId]?.find(r => r.id === currentAction.targetId) || null;
            if (!resource) return null;
            return {
                id: resource.itemId,
                name: tGame('items', resource.itemId, 'name', resource.name),
                icon: resource.icon,
            };
        } else { // crafting
            const recipe = craftingRecipes[currentAction.skillId]?.find(r => r.id === currentAction.targetId) || null;
            if (!recipe) return null;
             return {
                id: recipe.outputId,
                name: tGame('items', recipe.outputId, 'name', recipe.name),
                icon: recipe.icon,
            };
        }
    }, [currentAction, tGame]);

    if (huntingSession?.isActive && !huntingSession.isReturning) {
        const huntingLabel = tGame('sidebar', 'hunting', 'label', 'Avcılık');
        return (
             <button 
                onClick={() => setCurrentView('hunting')} 
                className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-medium)] focus:ring-[var(--accent-blue)] rounded-full"
                title={t('goToHuntingDetails', { huntingLabel })}
                aria-label={t('activeActionHunting')}
            >
                <div className="bg-orange-600 text-white flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border-2 border-orange-400">
                    <i className="fa-solid fa-paw w-5 h-5"></i>
                    <span className="font-semibold text-base">{huntingLabel}</span>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                </div>
            </button>
        );
    }

    if (currentTravel) {
        const translatedDestName = tGame('mapRegions', currentTravel.destinationId, 'name', currentTravel.destinationName);
        return (
            <div className="relative" title={t('travelingTo', { destinationName: translatedDestName })}>
                 <div className="bg-[var(--accent-blue)] text-white flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full shadow-lg border-2 border-blue-400 w-48">
                    <span className="font-semibold text-base truncate flex-1 text-left">{t('traveling')}</span>
                     <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 h-1 px-1 -mb-0.5">
                    <ProgressBar value={travelProgress} color="bg-white/70" className="h-0.5" />
                 </div>
            </div>
        );
    }

    if (!currentAction || !actionDetails) {
        return null;
    }

    const handleClick = () => {
        setCurrentView('professions');
        if (currentAction) {
            setActiveSkillId(currentAction.skillId);
        }
    };

    return (
        <button 
            onClick={handleClick} 
            className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-medium)] focus:ring-[var(--accent-blue)] rounded-full"
            title={t('goToProfessionDetails')}
            aria-label={t('activeActionProfession', { actionName: actionDetails.name })}
        >
            <div className="bg-[var(--accent-green)] text-white flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border-2 border-green-400">
                <img src={actionDetails.icon} alt={actionDetails.name} className="w-5 h-5 object-contain" />
                <span className="font-semibold text-base">{actionDetails.name}</span>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            </div>
             {currentAction.sessionGains.items > 0 && (
                <div className="absolute -top-1.5 -right-1.5 bg-[var(--background-medium)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-400 pointer-events-none">
                    {currentAction.sessionGains.items}
                </div>
            )}
        </button>
    );
};

export default HeaderActionDisplay;