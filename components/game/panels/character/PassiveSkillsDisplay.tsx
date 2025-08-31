

import React from 'react';
import { useGame } from '../../../../context/GameContext';
import ProgressBar from '../../../ui/ProgressBar';
import { formatNumber } from '../../../../utils/formatNumber';
import { useTranslation } from '../../../../App';

const passiveSkillIds = ['gathering', 'melee_combat', 'intuition', 'ranged_combat', 'prowess'];

const PassiveSkillsDisplay: React.FC = () => {
    const { gameState } = useGame();
    const { t, tGame } = useTranslation();
    const passiveSkills = gameState.player.skills
        .filter(s => passiveSkillIds.includes(s.id))
        .sort((a, b) => passiveSkillIds.indexOf(a.id) - passiveSkillIds.indexOf(b.id));


    return (
        <div className="bg-[var(--background-dark)]/50 p-4 md:p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {passiveSkills.map((skill) => {
                    const xpPercentage = skill.xpToNextLevel > 0 ? (skill.xp / skill.xpToNextLevel) * 100 : 0;
                    const translatedName = tGame('skills', skill.id, 'name', skill.name);
                    const translatedDescription = tGame('skills', skill.id, 'description', '');

                    return (
                        <div key={skill.id} className="bg-[var(--background-medium)]/60 p-4 rounded-lg border border-[var(--border-color)] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <img src={skill.icon} alt={translatedName} className="w-10 h-10 mr-4 object-contain" loading="lazy" decoding="async" />
                                        <h4 className="text-lg font-bold text-[var(--text-primary)]">{translatedName}</h4>
                                    </div>
                                    <span className="text-xl font-bold text-[var(--accent-gold)]">{t('levelWithNumber', { level: skill.level })}</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] mb-3 min-h-[2.5rem]">{translatedDescription || t('skillToCome')}</p>
                            </div>
                            <div className="mt-auto">
                                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                                    <span>{t('xpUnit')}</span>
                                    <span>{formatNumber(skill.xp)} / {formatNumber(skill.xpToNextLevel)}</span>
                                </div>
                                <ProgressBar value={xpPercentage} color="bg-[var(--accent-blue)]" className="h-2"/>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PassiveSkillsDisplay;
