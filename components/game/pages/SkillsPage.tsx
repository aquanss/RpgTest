import React from 'react';
import SkillsGrid from '../panels/skills/SkillsGrid';
import SkillDetail from '../panels/skills/SkillDetail';
import type { Skill } from '../../../types';
import { useGame } from '../../../context/GameContext';
import CurrentActionPanel from '../panels/CurrentActionPanel';

const SkillsPage: React.FC = () => {
    const { gameState, activeSkillId, setActiveSkillId } = useGame();
    const { currentAction, player: { skills } } = gameState;

    const activeSkill = activeSkillId ? skills.find(s => s.id === activeSkillId) : null;

    if (activeSkill) {
        const showCurrentActionPanel = currentAction && currentAction.skillId === activeSkill.id;

        return (
            <div className="space-y-6">
                {showCurrentActionPanel && <CurrentActionPanel />}
                <SkillDetail skill={activeSkill} onBack={() => setActiveSkillId(null)} />
            </div>
        );
    }

    return <SkillsGrid onSkillSelect={(skill) => setActiveSkillId(skill.id)} />;
};

export default SkillsPage;
