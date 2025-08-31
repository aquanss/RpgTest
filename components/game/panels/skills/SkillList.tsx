import React, { useState } from 'react';
import { useGame } from '../../../../context/GameContext';
import type { Skill } from '../../../../types';

interface SkillListProps {
    selectedSkill: Skill | null;
    onSkillSelect: (skill: Skill) => void;
}

const SkillList: React.FC<SkillListProps> = ({ selectedSkill, onSkillSelect }) => {
    const { gameState } = useGame();
    const { skills } = gameState.player;
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-[var(--background-medium)]/70 backdrop-blur-sm rounded-lg shadow-xl border border-[var(--border-color)]">
            <button
                className="w-full flex items-center justify-between text-2xl font-bold text-[var(--text-primary)] p-4"
                style={{ fontFamily: 'var(--font-fantasy)'}}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    <img src="https://files.catbox.moe/514s38.png" alt="Skills" className="w-6 h-6 mr-3" />
                    <span>Skills</span>
                </div>
                <svg className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-2">
                    <ul className="space-y-1">
                        {skills.map(skill => (
                            <li key={skill.id}>
                                <button 
                                    onClick={() => onSkillSelect(skill)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 text-left ${selectedSkill?.id === skill.id ? 'bg-[var(--accent-blue)] text-white' : 'hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    <div className="flex items-center">
                                        <img src={skill.icon} alt={skill.name} className="w-6 h-6 mr-4 object-contain" />
                                        <span className="font-semibold">{skill.name}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${selectedSkill?.id === skill.id ? 'bg-white/20' : 'bg-[var(--border-color)] text-[var(--text-primary)]'}`}>
                                        Lv. {skill.level}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SkillList;