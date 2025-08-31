
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { navItems } from './Sidebar';
import type { GameView } from '../../types';
import ConfirmDialog from '../ui/ConfirmDialog';
import WorldMapPanel from './panels/map/WorldMapPanel';
import { useTranslation } from '../../App';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    const { currentView, setCurrentView, setActiveSkillId, saveGame, logout, goBackToCharSelect, gameState } = useGame();
    const { t, tGame } = useTranslation();
    const { isSaving } = gameState;
    const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [isCharSelectConfirmOpen, setCharSelectConfirmOpen] = useState(false);

    const handleNavItemClick = (view: GameView) => {
        if (view === 'professions') {
            setActiveSkillId(null);
        }
        setCurrentView(view);
        onClose();
    };

    const NavItem: React.FC<{ view: GameView; label: string; icon: string; }> = ({ view, label, icon }) => {
        const isActive = currentView === view;
        const translatedLabel = tGame('sidebar', view, 'label', label);
        return (
            <li>
                <button
                    onClick={() => handleNavItemClick(view)}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 ${isActive ? 'bg-[var(--accent-blue)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'}`}
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

            <div className="md:hidden">
                {/* Overlay */}
                {isOpen && <div className="fixed inset-0 bg-black/60 z-30" onClick={onClose} aria-hidden="true"></div>}
                
                {/* Menu */}
                <aside 
                    className={`fixed top-0 left-0 h-full w-64 bg-[var(--background-medium)] flex flex-col shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-hidden={!isOpen}
                >
                    <div className="p-4 border-b border-[var(--border-color)] text-center h-16 flex items-center justify-center">
                        <h1 className="text-2xl font-bold text-[var(--accent-gold)]" style={{ fontFamily: 'var(--font-fantasy)' }}>
                            {t('authTitle')}
                        </h1>
                    </div>
                    <nav className="flex-1 px-4 py-4">
                        <ul className="space-y-2">
                            {navItems.map(item => <NavItem key={item.view} {...item} />)}
                        </ul>
                    </nav>
                    <div className="p-4 border-t border-[var(--border-color)] space-y-2">
                         <button onClick={() => { setCharSelectConfirmOpen(true); onClose(); }} className="w-full flex items-center p-3 rounded-lg text-left text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors">
                            <i className="fa-solid fa-users w-6 mr-4 text-xl text-center"></i>
                            <span className="font-semibold">{t('changeCharacter')}</span>
                        </button>
                         <button onClick={()=> saveGame()} disabled={isSaving} className="w-full flex items-center p-3 rounded-lg text-left text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50">
                            <i className={`fa-solid fa-floppy-disk w-6 mr-4 text-xl text-center ${isSaving ? 'animate-spin' : ''}`}></i>
                            <span className="font-semibold">{isSaving ? t('saving') : t('saveGameMobile')}</span>
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
            </div>
        </>
    );
};

export default MobileMenu;
