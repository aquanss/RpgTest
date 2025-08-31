import React from 'react';
import { useGame } from '../../context/GameContext';
import { navItems } from './Sidebar';
import type { GameView } from '../../types';
import { useTranslation } from '../../App';

const MobileNavBar: React.FC = () => {
    const { currentView, setCurrentView, setActiveSkillId } = useGame();
    const { tGame } = useTranslation();

    // Hızlı erişim için alt barda en önemli görünümleri göster.
    const bottomNavItems = navItems.filter(item =>
        ['character', 'inventory', 'professions', 'map', 'hunting'].includes(item.view)
    );

    const handleSelect = (view: GameView) => {
        if (view === 'professions') {
            setActiveSkillId(null);
        }
        setCurrentView(view);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--background-medium)] border-t border-[var(--border-color)] shadow-lg z-20">
            <ul className="flex justify-around items-center h-16">
                {bottomNavItems.map(item => {
                    const isActive = currentView === item.view;
                    const translatedLabel = tGame('sidebar', item.view, 'label', item.label);
                    return (
                        <li key={item.view} className="flex-1 h-full">
                            <button
                                onClick={() => handleSelect(item.view)}
                                className={`w-full h-full flex flex-col items-center justify-center transition-all duration-200 focus:outline-none active:scale-95 ${
                                    isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                                aria-label={translatedLabel}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <i className={`fa-solid ${item.icon} text-2xl`}></i>
                                <span className="text-xs mt-1 font-semibold">{translatedLabel}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default MobileNavBar;