import React from 'react';
import { useGame } from '../../../../context/GameContext';
import ProgressBar from '../../../ui/ProgressBar';

const SkillsDisplay: React.FC = () => {
    const { gameState } = useGame();
    const { skills } = gameState.player;

    return (
        <div className="bg-[var(--stone-900)]/50 p-6 rounded-lg">
            <ul className="space-y-4">
                {skills.map((skill) => {
                    const xpPercentage = (skill.xp / skill.xpToNextLevel) * 100;
                    return (
                        <li key={skill.id}>
                            <div className="flex items-center justify-between text-lg mb-1">
                                <div className="flex items-center">
                                    <img src={skill.icon} alt={skill.name} className="w-8 h-8 mr-3 object-contain" />
                                    <span className="text-[var(--stone-600)]">{skill.name}</span>
                                </div>
                                <span className="font-bold text-[var(--parchment-bg)]">Seviye {skill.level}</span>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-[var(--stone-600)] mb-1">
                                    <span>TP</span>
                                    <span>{skill.xp} / {skill.xpToNextLevel}</span>
                                </div>
                                <ProgressBar value={xpPercentage} color="bg-[var(--blue-accent)]" className="h-2"/>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SkillsDisplay;