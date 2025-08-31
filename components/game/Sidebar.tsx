import React, { useState } from 'react';
import type { GameView } from '../../types';
import { useGame } from '../../context/GameContext';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useTranslation } from '../../App';

interface NavItemData {
  view: GameView;
  label: string; // This will now be the fallback
  icon: string;
}

export const navItems: NavItemData[] = [
    { view: 'character', label: 'Karakter', icon: 'fa-user-shield' },
    { view: 'inventory', label: 'Envanter', icon: 'fa-box-archive' },
    { view: 'professions', label: 'Meslekler', icon: 'fa-hammer' },
    { view: 'map', label: 'Harita', icon: 'fa-map-location-dot' },
    { view: 'hunting', label: 'Avcılık', icon: 'fa-paw' },
    { view: 'settings', label: 'Ayarlar', icon: 'fa-cog' },
];

const Sidebar: React.FC = () => {
    const { currentView, setCurrentView, setActiveSkillId, logout, goBackToCharSelect } = useGame();
    const { t, tGame } = useTranslation();
    const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [isCharSelectConfirmOpen, setCharSelectConfirmOpen] = useState(false);

    const handleNavItemClick = (view: GameView) => {
        if (view === 'professions') {
            setActiveSkillId(null);
        }
        setCurrentView(view);
    };
    
    const NavItem: React.FC<NavItemData> = ({ view, label, icon }) => {
        const isActive = currentView === view;
        const translatedLabel = tGame('sidebar', view, 'label', label);
        return (
            <li>
                <button
                    onClick={() => handleNavItemClick(view)}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-[var(--accent-blue)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'}`}
                >
                    <i className={`fa-solid ${icon} w-6 mr-4 text-xl text-center`}></i>
                    <span className="font-semibold">{translatedLabel}</span>
                </button>
            </li>
        );
    };

    return (
        <>
            <ConfirmDialog 
                isOpen={isLogoutConfirmOpen} 
                title={t('logoutConfirmTitle')} 
                message={t('logoutConfirmMessage')} 
                onConfirm={logout} 
                onCancel={() => setLogoutConfirmOpen(false)}
                confirmText={t('logout')}
                cancelText={t('noCancel')}
            />
            <ConfirmDialog
                isOpen={isCharSelectConfirmOpen}
                title={t('charSelectConfirmTitle')}
                message={t('charSelectConfirmMessage')}
                onConfirm={goBackToCharSelect}
                onCancel={() => setCharSelectConfirmOpen(false)}
                confirmText={t('yesReturn')}
                cancelText={t('noCancel')}
            />
            <aside className="w-64 bg-[var(--background-medium)] flex-col shadow-lg border-r border-[var(--border-color)] hidden md:flex">
                <div className="p-4 border-b border-[var(--border-color)] text-center h-16 flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-[var(--accent-gold)]" style={{ fontFamily: 'var(--font-fantasy)' }}>
                        {t('authTitle')}
                    </h1>
                </div>
                <nav className="flex-1 px-4 py-4">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <NavItem key={item.view} {...item} />
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-[var(--border-color)] space-y-2">
                    <button onClick={() => setCharSelectConfirmOpen(true)} className="w-full flex items-center p-3 rounded-lg text-left text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors">
                        <i className="fa-solid fa-users w-6 mr-4 text-xl text-center"></i>
                        <span className="font-semibold">{t('changeCharacter')}</span>
                    </button>
                    <button onClick={() => setLogoutConfirmOpen(true)} className="w-full flex items-center p-3 rounded-lg text-left text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors">
                        <i className="fa-solid fa-right-from-bracket w-6 mr-4 text-xl text-center"></i>
                        <span className="font-semibold">{t('logout')}</span>
                    </button>
                </div>
                <div className="p-4 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-secondary)]">
                    <p>Idle Realms v0.1.0</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
