import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../../context/GameContext';
import { skillResourceMap, craftingRecipes } from '../../../utils/initialGameState';
import ProgressBar from '../../ui/ProgressBar';

const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const formatSeconds = (ms: number) => {
    return `0:${Math.ceil(ms / 1000).toString().padStart(2, '0')}`;
}

const CurrentActionPanel: React.FC = () => {
    const { gameState, stopAction } = useGame();
    const { currentAction } = gameState;
    
    const [sessionDuration, setSessionDuration] = useState('00:00:00');
    const [nextItemIn, setNextItemIn] = useState('0:00');
    const [progress, setProgress] = useState(0);

    const actionDetails = useMemo(() => {
        if (!currentAction) return null;
        if (currentAction.actionType === 'gathering') {
            const resource = skillResourceMap[currentAction.skillId]?.find(r => r.id === currentAction.targetId) || null;
            if (!resource) return null;

            const gatheringSkill = gameState.player.skills.find(s => s.id === 'gathering');
            const gatheringLevel = gatheringSkill ? gatheringSkill.level : 1;
            const reductionPerLevel = 0.01;
            const maxReduction = 0.5;
            let reduction = (gatheringLevel - 1) * reductionPerLevel;
            if (reduction > maxReduction) reduction = maxReduction;

            let toolBonus = 0;
            const equippedWeapon = gameState.player.equipment.weapon;
            if (equippedWeapon && typeof equippedWeapon.efficiencyBonus === 'number') {
                const { skillId } = currentAction;
                if (skillId === 'mining' && equippedWeapon.toolType === 'pickaxe') toolBonus = equippedWeapon.efficiencyBonus;
                else if (skillId === 'woodcutting' && equippedWeapon.toolType === 'axe') toolBonus = equippedWeapon.efficiencyBonus;
                else if (skillId === 'fishing' && equippedWeapon.toolType === 'fishing_rod') toolBonus = equippedWeapon.efficiencyBonus;
            }
            const totalReduction = reduction + toolBonus;
            const maxTotalReduction = 0.8;
            const effectiveTime = resource.timeToGather * (1 - Math.min(totalReduction, maxTotalReduction));
            
            return {
                name: resource.name,
                icon: resource.icon,
                duration: effectiveTime
            };
        } else { // 'crafting'
            const recipe = craftingRecipes[currentAction.skillId]?.find(r => r.id === currentAction.targetId) || null;
            if (!recipe) return null;
            return {
                name: recipe.name,
                icon: recipe.icon,
                duration: recipe.timeToCraft
            };
        }
    }, [currentAction, gameState.player.skills, gameState.player.equipment.weapon]);

    useEffect(() => {
        if (!currentAction || !actionDetails) return;

        const intervalId = setInterval(() => {
            const now = Date.now();
            setSessionDuration(formatTime(now - currentAction.startTime));
            
            const remaining = currentAction.nextTickTime - now;
            setNextItemIn(formatSeconds(Math.max(0, remaining)));
            
            const totalDuration = actionDetails.duration;
            const elapsed = totalDuration - remaining;
            setProgress(Math.max(0, Math.min(100, (elapsed / totalDuration) * 100)));

        }, 200);

        return () => clearInterval(intervalId);
    }, [currentAction, actionDetails]);

    if (!currentAction || !actionDetails) {
        return null;
    }
    
    const expPerSecond = useMemo(() => {
        const durationSeconds = (Date.now() - currentAction.startTime) / 1000;
        if (durationSeconds < 1) return '0.00';
        return (currentAction.sessionGains.xp / durationSeconds).toFixed(2);
    }, [currentAction.startTime, currentAction.sessionGains.xp, sessionDuration]);


    return (
        <div className="bg-[var(--background-medium)]/80 backdrop-blur-sm rounded-lg shadow-xl border border-[var(--border-color)] p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Mevcut Eylem</h3>
                <div className="flex items-center bg-[var(--background-dark)]/50 rounded-lg px-2 py-1">
                    <span className="font-mono text-lg text-white">{sessionDuration}</span>
                    <button onClick={stopAction} className="ml-3 text-[var(--text-secondary)] hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div className="flex items-center">
                <img src={actionDetails.icon} alt={actionDetails.name} className="w-16 h-16 mr-4 object-contain" />
                <div className="flex-1">
                    <div className="flex items-center mb-2">
                        <div className="w-4 h-4 border-2 border-[var(--accent-blue)] rounded-full mr-2 flex items-center justify-center">
                           <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-xl font-bold text-white">{actionDetails.name}</span>
                    </div>
                    <ProgressBar value={progress} color="bg-[var(--accent-gold)]" className="h-2.5" />
                    <div className="flex justify-between items-center mt-2 text-sm text-[var(--text-secondary)]">
                        <span className="bg-[var(--background-dark)]/50 px-2 py-1 rounded font-mono text-green-400">+{currentAction.sessionGains.items}</span>
                        <span>Sonraki: {nextItemIn}</span>
                        <span className="font-semibold">{expPerSecond} TP/s</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentActionPanel;