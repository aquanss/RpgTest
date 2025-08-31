import React from 'react';
import { useGame } from '../../context/GameContext';
import { useTranslation } from '../../App';

const ActionLog: React.FC = () => {
    const { gameState } = useGame();
    const { t } = useTranslation();

    return (
        <aside className="w-72 bg-[var(--stone-800)] p-4 flex flex-col shadow-inner hidden lg:flex border-l border-[var(--stone-700)]">
            <h2 className="text-lg font-bold border-b border-[var(--stone-700)] pb-2 mb-4 text-[var(--gold-accent)]" style={{ fontFamily: 'var(--font-fantasy)'}}>Action Log</h2>
            <div className="flex-1 overflow-y-auto pr-2">
                <ul>
                    {gameState.actionLog.map((log, index) => (
                        <li key={index} className={`text-sm mb-2 ${index === 0 ? 'text-[var(--parchment-bg)]' : 'text-[var(--stone-600)]'}`}>
                            {log}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default ActionLog;