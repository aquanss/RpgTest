
import React from 'react';
import Card from '../../../ui/Card';
import { useGame } from '../../../../context/GameContext';
import type { Skill } from '../../../../types';
import ProgressBar from '../../../ui/ProgressBar';
import { formatNumber } from '../../../../utils/formatNumber';
import { useTranslation } from '../../../../App';

interface SkillsGridProps {
    onSkillSelect: (skill: Skill) => void;
}

const SkillButton = ({ skill, onSelect }: { skill: Skill; onSelect: (skill: Skill) => void; }) => {
    const { t, tGame } = useTranslation();
    const xpPercentage = skill.xpToNextLevel > 0 ? (skill.xp / skill.xpToNextLevel) * 100 : 0;
    const translatedName = tGame('skills', skill.id, 'name', skill.name);
    return (
        <button
            onClick={() => onSelect(skill)}
            className="bg-[var(--background-medium)] p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300 hover:bg-[var(--border-color)] hover:scale-105 border border-[var(--border-color)] hover:border-[var(--accent-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
        >
            <img src={skill.icon} alt={translatedName} className="w-16 h-16 mb-3 object-contain" loading="lazy" decoding="async" />
            <p className="text-lg font-semibold text-[var(--text-primary)]">{translatedName}</p>
            <p className="text-sm text-[var(--accent-gold)] font-bold mb-2">{t('levelWithNumber', { level: skill.level })}</p>
            <div className="w-full mt-auto">
                 <ProgressBar value={xpPercentage} color="bg-[var(--accent-blue)]" className="h-1.5" />
                 <p className="text-xs text-[var(--text-secondary)] mt-1">{formatNumber(skill.xp)} / {formatNumber(skill.xpToNextLevel)}</p>
            </div>
        </button>
    );
};


const SkillsGrid: React.FC<SkillsGridProps> = ({ onSkillSelect }) => {
    const { gameState } = useGame();
    const { t } = useTranslation();
    const { skills } = gameState.player;

    const gatheringSkillIds = ['woodcutting', 'mining', 'fishing'];
    const craftingSkillIds = ['alchemy', 'smelting', 'cooking', 'forge'];

    const gatheringSkills = skills.filter(s => gatheringSkillIds.includes(s.id));
    const craftingSkills = skills.filter(s => craftingSkillIds.includes(s.id));

    const title = (
        <div className="flex items-center">
            <i className="fa-solid fa-hammer text-2xl mr-4 text-[var(--accent-gold)]"></i>
            <span>{t('professions')}</span>
        </div>
    );

    return (
        <Card title={title}>
            <div className="space-y-10">
                <div>
                    <h3 className="text-2xl font-bold text-[var(--accent-gold)] mb-2 pb-2 border-b-2 border-[var(--border-color)]" style={{ fontFamily: 'var(--font-fantasy)' }}>{t('gathering')}</h3>
                    <p className="mb-6 text-[var(--text-secondary)]">{t('gatheringDesc')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {gatheringSkills.map((skill) => (
                           <SkillButton key={skill.id} skill={skill} onSelect={onSkillSelect} />
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-[var(--accent-gold)] mb-2 pb-2 border-b-2 border-[var(--border-color)]" style={{ fontFamily: 'var(--font-fantasy)' }}>{t('production')}</h3>
                    <p className="mb-6 text-[var(--text-secondary)]">{t('productionDesc')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {craftingSkills.map((skill) => (
                           <SkillButton key={skill.id} skill={skill} onSelect={onSkillSelect} />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default SkillsGrid;