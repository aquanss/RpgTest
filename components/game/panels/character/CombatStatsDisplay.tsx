
import React, { useMemo } from 'react';
import { useGame } from '../../../../context/GameContext';
import type { Stats } from '../../../../types';
import { calculateProfessionBonuses, calculateEquipmentBonuses, calculateSetBonuses } from '../../../../utils/statBonuses';
import { useTranslation } from '../../../../App';

const combatStatIcons: Record<string, string> = {
    attackPower: 'fa-solid fa-gavel',
    defense: 'fa-solid fa-shield-halved',
    critChance: 'fa-solid fa-crosshairs',
    critDamage: 'fa-solid fa-burst',
    evasionChance: 'fa-solid fa-person-running',
};

const calculateCombatStats = (stats: Stats) => {
    const attackPower = Math.round(stats.strength * 2.5 + stats.agility * 0.5);
    const defense = Math.round(stats.endurance * 2.5 + stats.strength * 0.5);
    const critChance = (stats.agility * 0.1 + stats.luck * 0.2).toFixed(2);
    const critDamage = (50 + stats.tactics * 1.5).toFixed(0); // Base 50%
    const evasionChance = (stats.agility * 0.15 + stats.luck * 0.1).toFixed(2);

    return {
        attackPower,
        defense,
        critChance: `${critChance}%`,
        critDamage: `+${critDamage}%`,
        evasionChance: `${evasionChance}%`,
    };
};


const CombatStatsDisplay: React.FC = () => {
    const { gameState } = useGame();
    const { t } = useTranslation();
    const { stats, skills, equipment } = gameState.player;
    
    const totalStats = useMemo(() => {
        const professionBonuses = calculateProfessionBonuses(skills);
        const equipmentBonuses = calculateEquipmentBonuses(equipment);
        const setBonuses = calculateSetBonuses(equipment);
        
        const combined: Stats = { ...stats };
        const allBonuses = [professionBonuses, equipmentBonuses, setBonuses];
        
        for (const bonusSource of allBonuses) {
            for (const key in bonusSource) {
                const statKey = key as keyof Stats;
                if (bonusSource[statKey]) {
                    combined[statKey] += bonusSource[statKey]!;
                }
            }
        }
        
        return combined;
    }, [stats, skills, equipment]);

    const combatStats = calculateCombatStats(totalStats);
    const orderedStats: (keyof typeof combatStats)[] = ['attackPower', 'defense', 'critChance', 'critDamage', 'evasionChance'];

    return (
        <div className="bg-[var(--background-dark)]/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-[var(--accent-gold)] mb-4 border-b border-[var(--border-color)] pb-2" style={{fontFamily: 'var(--font-fantasy)'}}>{t('combatValues')}</h3>
            <ul className="space-y-3">
                {orderedStats.map((statKey) => (
                    <li key={statKey} className="flex items-center justify-between text-lg">
                        <div className="flex items-center">
                             <div className="w-8 h-8 mr-3 text-2xl flex items-center justify-center text-[var(--text-secondary)]" aria-hidden="true">
                                <i className={combatStatIcons[statKey]}></i>
                             </div>
                             <span className="text-[var(--text-secondary)]">{t(statKey as any)}</span>
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">{combatStats[statKey]}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CombatStatsDisplay;
