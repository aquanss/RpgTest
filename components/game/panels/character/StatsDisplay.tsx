
import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../../../context/GameContext';
import type { Stats } from '../../../../types';
import { calculateProfessionBonuses, calculateEquipmentBonuses } from '../../../../utils/statBonuses';
import { useTranslation } from '../../../../App';

const statIcons: Record<keyof Stats, string> = {
    strength: 'https://files.catbox.moe/f792u9.png',
    agility: 'https://files.catbox.moe/6q87st.png',
    tactics: 'https://files.catbox.moe/zbilx0.png',
    endurance: 'https://files.catbox.moe/esd1j7.png',
    charisma: 'https://files.catbox.moe/gwcrdb.png',
    luck: 'https://files.catbox.moe/bo2r5p.png',
};

const StatsDisplay: React.FC = () => {
    const { gameState, updatePlayerStats } = useGame();
    const { t } = useTranslation();
    const { stats, statPoints, skills, equipment } = gameState.player;

    const [pendingStats, setPendingStats] = useState<Stats>(stats);
    const [pointsToAllocate, setPointsToAllocate] = useState(statPoints);
    
    const professionBonuses = useMemo(() => calculateProfessionBonuses(skills), [skills]);
    const equipmentBonuses = useMemo(() => calculateEquipmentBonuses(equipment), [equipment]);

    useEffect(() => {
        setPendingStats(stats);
        setPointsToAllocate(statPoints);
    }, [stats, statPoints]);

    const hasPendingChanges = useMemo(() => {
        return JSON.stringify(pendingStats) !== JSON.stringify(stats);
    }, [pendingStats, stats]);

    const handleIncrement = (statKey: keyof Stats) => {
        if (pointsToAllocate > 0) {
            setPendingStats(prev => ({ ...prev, [statKey]: prev[statKey] + 1 }));
            setPointsToAllocate(prev => prev - 1);
        }
    };

    const handleDecrement = (statKey: keyof Stats) => {
        if (pendingStats[statKey] > stats[statKey]) {
            setPendingStats(prev => ({ ...prev, [statKey]: prev[statKey] - 1 }));
            setPointsToAllocate(prev => prev + 1);
        }
    };
    
    const handleSaveChanges = () => {
        updatePlayerStats(pendingStats, pointsToAllocate);
    };

    const handleResetChanges = () => {
        setPendingStats(stats);
        setPointsToAllocate(statPoints);
    };

    return (
        <div className="bg-[var(--background-dark)]/50 p-4 md:p-6 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 p-3 bg-[var(--background-medium)] rounded-lg border border-[var(--border-color)]">
                <h3 className="text-xl font-bold text-[var(--accent-gold)]">{t('statPoints', { points: pointsToAllocate })}</h3>
                 {hasPendingChanges && (
                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                        <button onClick={handleResetChanges} className="bg-[var(--border-color)] hover:bg-gray-600 text-[var(--text-primary)] font-semibold py-2 px-4 rounded transition-colors duration-200">
                            {t('reset')}
                        </button>
                        <button onClick={handleSaveChanges} className="bg-[var(--accent-green)] hover:brightness-110 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                            {t('saveChanges')}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Object.keys(pendingStats) as Array<keyof Stats>).map((statKey) => {
                    const baseValue = pendingStats[statKey];
                    const profBonus = professionBonuses[statKey] || 0;
                    const equipBonus = equipmentBonuses[statKey] || 0;
                    const totalBonus = profBonus + equipBonus;
                    const translatedStatName = t(`stat_${statKey}` as any);

                    return (
                        <div key={statKey} className="bg-[var(--background-medium)]/60 p-4 rounded-lg border border-[var(--border-color)] flex items-start">
                            <img src={statIcons[statKey]} alt={translatedStatName} className="w-12 h-12 mr-4 object-contain flex-shrink-0" loading="lazy" decoding="async" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-bold text-[var(--text-primary)]">{translatedStatName}</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="relative group flex items-baseline justify-end min-w-[80px]" title={t('detailsTooltip')}>
                                            <span className="text-2xl font-bold text-[var(--accent-gold)]">{baseValue}</span>
                                            {totalBonus > 0 && (
                                                <span className="text-lg font-bold text-[var(--accent-green)] ml-1">+{totalBonus}</span>
                                            )}
                                            {/* Smart Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-[var(--background-dark)] text-white text-sm rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg z-20 border border-[var(--border-color)]">
                                                <p className="font-bold text-base text-center pb-1 mb-1 border-b border-[var(--border-color)]">{translatedStatName}</p>
                                                <div className="grid grid-cols-2 gap-x-4 text-left">
                                                    <span>{t('base')}</span><span className="text-right font-semibold">{stats[statKey]}</span>
                                                    {(pendingStats[statKey] - stats[statKey]) > 0 &&
                                                        <><span>{t('assigned')}</span><span className="text-right font-semibold text-yellow-400">+{pendingStats[statKey] - stats[statKey]}</span></>}
                                                    {equipBonus > 0 && <><span>{t('equipment')}</span><span className="text-right font-semibold text-cyan-400">+{equipBonus}</span></>}
                                                    {profBonus > 0 && <><span>{t('profession')}</span><span className="text-right font-semibold text-purple-400">+{profBonus}</span></>}
                                                </div>
                                                <div className="mt-1 pt-1 border-t border-[var(--border-color)] grid grid-cols-2 gap-x-4">
                                                    <span className="font-bold">{t('total')}</span><span className="text-right font-bold text-[var(--accent-green)]">{baseValue + totalBonus}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleDecrement(statKey)} disabled={pendingStats[statKey] <= stats[statKey]} className="w-7 h-7 bg-[var(--border-color)] text-white rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600">-</button>
                                            <button onClick={() => handleIncrement(statKey)} disabled={pointsToAllocate <= 0} className="w-7 h-7 bg-[var(--border-color)] text-white rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600">+</button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">{t(`stat_${statKey}_desc` as any)}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default StatsDisplay;
