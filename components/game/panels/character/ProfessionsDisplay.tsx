
import React from 'react';
import { useGame } from '../../../../context/GameContext';
import ProgressBar from '../../../ui/ProgressBar';
import { bonusMap } from '../../../../utils/statBonuses';
import { useTranslation } from '../../../../App';

const ProfessionsDisplay: React.FC = () => {
    const { gameState } = useGame();
    const { t, tGame } = useTranslation();
    const { skills } = gameState.player;

    // Pasif yetenekleri meslekler listesinden çıkar
    const passiveSkillIds = ['gathering', 'melee_combat', 'intuition', 'ranged_combat', 'prowess'];
    const professionSkills = skills.filter(skill => !passiveSkillIds.includes(skill.id));

    return (
        <div className="bg-[var(--background-dark)]/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-[var(--accent-gold)] mb-4 border-b border-[var(--border-color)] pb-2" style={{fontFamily: 'var(--font-fantasy)'}}>{t('professions')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {professionSkills.map((skill) => {
                    const xpPercentage = skill.xpToNextLevel > 0 ? (skill.xp / skill.xpToNextLevel) * 100 : 0;
                    const bonusMapping = bonusMap[skill.id];
                    const bonusText = bonusMapping ? t(`profBonus_${bonusMapping.stat}` as any) : '';

                    const translatedName = tGame('skills', skill.id, 'name', skill.name);
                    return (
                        <div key={skill.id} className="relative group bg-[var(--background-medium)] p-3 rounded-lg flex flex-col text-center transition-all duration-200 hover:bg-[var(--border-color)] hover:scale-105">
                            <img src={skill.icon} alt={translatedName} className="w-10 h-10 mx-auto mb-2 object-contain" loading="lazy" decoding="async" />
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{translatedName}</p>
                            <p className="text-xs text-[var(--text-secondary)] mb-1">{t('levelWithNumber', { level: skill.level })}</p>
                            <div className="w-full mt-auto pt-1">
                                <ProgressBar 
                                    value={xpPercentage}
                                    color="bg-[var(--accent-gold)]"
                                    className="h-1.5"
                                    showGradient={true}
                                />
                            </div>
                             {bonusText && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-[var(--background-dark)] text-white text-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg z-10 border border-[var(--border-color)]">
                                    <div className="flex items-center gap-2">
                                        <img src={skill.icon} alt={translatedName} className="w-5 h-5" loading="lazy" decoding="async" />
                                        <span className="text-xs text-white">{bonusText}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfessionsDisplay;
