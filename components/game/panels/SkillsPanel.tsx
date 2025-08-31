import React from 'react';
import Card from '../../ui/Card';
import { useGame } from '../../../context/GameContext';
import ProgressBar from '../../ui/ProgressBar';
import { skillResourceMap } from '../../../utils/initialGameState';

const SkillsPanel: React.FC = () => {
    const { gameState, startAction, stopAction } = useGame();
    const { player, currentAction } = gameState;

    // Fix: Updated handleAction to work with the new resource-based action system, resolving both reported errors.
    // Error 1 (line 14): `startAction` was called with incorrect arguments. It now correctly receives a skillId and a resource object.
    // The logic finds the first available resource for a given skill and starts gathering it.
    const handleAction = (skillId: string) => {
        if (currentAction) {
            stopAction();
        } else {
            const resources = skillResourceMap[skillId];
            const skill = player.skills.find(s => s.id === skillId);
            if (resources && skill) {
                // Find first available resource
                const availableResource = resources.find(r => skill.level >= r.levelReq);
                if (availableResource) {
                    startAction(skillId, availableResource);
                } else {
                    console.log(`No resource available to train ${skillId} at level ${skill.level}`);
                }
            } else {
                console.log(`No resources configured for skill ${skillId}`);
            }
        }
    }

    return (
        <Card title="Yetenekler">
            <div className="space-y-6">
                {player.skills.map(skill => {
                    const xpPercentage = (skill.xp / skill.xpToNextLevel) * 100;
                    // Fix Error 2 (line 23): Correctly compare the current action's skillId with the skill id from the map.
                    // The previous comparison between an object and a string was invalid.
                    const isCurrentAction = currentAction?.skillId === skill.id;
                    return (
                        <div key={skill.id} className="bg-[var(--stone-900)]/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <img src={skill.icon} alt={skill.name} className="w-8 h-8 mr-4 object-contain" />
                                    <h3 className="text-xl font-semibold">{skill.name} - Seviye {skill.level}</h3>
                                </div>
                                <button
                                    onClick={() => handleAction(skill.id)}
                                    disabled={!!currentAction && !isCurrentAction}
                                    className={`font-bold py-2 px-4 rounded transition-colors duration-300 ${
                                        isCurrentAction 
                                        ? 'bg-[var(--red-accent)] hover:brightness-110 text-white' 
                                        : 'bg-[var(--green-accent)] hover:brightness-110 text-white'
                                    } disabled:bg-gray-600 disabled:cursor-not-allowed`}
                                >
                                    {isCurrentAction ? 'Durdur' : 'Eğit'}
                                </button>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-[var(--stone-600)] text-right">{skill.xp} / {skill.xpToNextLevel} TP</p>
                                <ProgressBar value={xpPercentage} color="bg-[var(--blue-accent)]" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default SkillsPanel;