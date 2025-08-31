import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import ProgressBar from '../ui/ProgressBar';
import { formatNumber } from '../../utils/formatNumber';
import HeaderActionDisplay from './HeaderActionDisplay';
import WorldMapPanel from './panels/map/WorldMapPanel';
import NotificationPanel from './NotificationPanel';
import { useTranslation } from '../../App';

interface HeaderProps {
    onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
    const { character, gameState, saveGame, markNotificationsAsRead, clearAllNotifications } = useGame();
    const { t, tGame } = useTranslation();
    const { player, isSaving, lastSaved, notifications } = gameState;
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    
    const xpPercentage = player.xpToNextLevel > 0 ? (player.xp / player.xpToNextLevel) * 100 : 0;
    const hpPercentage = player.maxHealth > 0 ? (player.health / player.maxHealth) * 100 : 0;
    const avatar = 'https://files.catbox.moe/9n32jw.png';

    const hasUnreadNotifications = useMemo(() => notifications.some(n => !n.read), [notifications]);
    const notificationRef = useRef<HTMLDivElement>(null);

    const handleNotificationToggle = () => {
        setNotificationsOpen(prev => {
            if (!prev && hasUnreadNotifications) {
                markNotificationsAsRead();
            }
            return !prev;
        });
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const mapLabel = tGame('sidebar', 'map', 'label', 'Harita');

    return (
        <>
            <WorldMapPanel isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
            {/* Header yüksekliği mobil için daha kompakt hale getirildi (h-20) */}
            <header className="relative bg-[var(--background-medium)] p-2 shadow-md flex items-center justify-between z-10 border-b border-[var(--border-color)] h-20 md:h-auto md:min-h-[4rem] flex-shrink-0">
                
                {/* --- Left Side --- */}
                <div className="flex items-center gap-4">
                    {/* Hamburger on mobile */}
                    <button onClick={onMenuToggle} className="md:hidden text-2xl p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label={t('openMenu')}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    {/* Desktop player info block */}
                    <div className="hidden md:flex items-center gap-3">
                        <img src={avatar} alt={character.name} className="w-10 h-10 rounded-full border-2 border-[var(--accent-gold)]" />
                        <div className="flex-1 w-48">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--text-primary)] text-base truncate">{character.name}</span>
                                <span className="text-sm bg-[var(--border-color)] text-[var(--accent-gold)] font-bold px-2 py-0.5 rounded-full">
                                {t('level_short')} {player.level}
                                </span>
                            </div>
                            <div className="w-full space-y-1 mt-1">
                                <div title={`${player.health} / ${player.maxHealth} ${t('health')}`}>
                                    <ProgressBar value={hpPercentage} color="bg-[var(--accent-red)]" className="h-1.5" />
                                </div>
                                <div title={`${player.xp} / ${player.xpToNextLevel} ${t('xpUnit')}`}>
                                    <ProgressBar value={xpPercentage} color="bg-[var(--accent-blue)]" className="h-1.5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <img src="https://files.catbox.moe/mzjexr.webp" alt={t('gold')} className="w-4 h-4"/>
                                <span className="font-semibold text-sm text-[var(--accent-gold)]">{formatNumber(player.gold)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Mobile Center & Bottom (More compact positioning) --- */}
                <div className="md:hidden absolute left-1/2 top-2 -translate-x-1/2 flex items-center gap-2">
                     <img src={avatar} alt={character.name} className="w-8 h-8 rounded-full border-2 border-[var(--accent-gold)]" />
                     <div className="flex flex-col items-start">
                        <span className="font-bold text-[var(--text-primary)] text-sm truncate">{character.name}</span>
                         <span className="text-xs bg-[var(--border-color)] text-[var(--accent-gold)] font-bold px-2 py-0.5 rounded-full">
                           {t('level_short')} {player.level}
                        </span>
                     </div>
                </div>
                <div className="md:hidden absolute bottom-2 left-4 right-4">
                     <div className="w-full space-y-1">
                        <div title={`${player.health} / ${player.maxHealth} ${t('health')}`}>
                            <ProgressBar value={hpPercentage} color="bg-[var(--accent-red)]" className="h-1.5" />
                        </div>
                        <div title={`${player.xp} / ${player.xpToNextLevel} ${t('xpUnit')}`}>
                            <ProgressBar value={xpPercentage} color="bg-[var(--accent-blue)]" className="h-1.5" />
                        </div>
                    </div>
                </div>

                {/* --- Center Actions (Desktop) --- */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center">
                    <HeaderActionDisplay />
                </div>


                {/* --- Right Side (Unified & Refactored for Desktop) --- */}
                <div className="flex items-center">
                    {/* Mobile Gold */}
                    <div className="md:hidden flex items-center justify-center font-bold text-base text-[var(--accent-gold)] bg-[var(--background-dark)]/50 px-3 py-1 rounded-full border border-[var(--border-color)]">
                        <img src="https://files.catbox.moe/mzjexr.webp" alt={t('gold')} className="w-5 h-5 mr-1"/>
                        <span>{formatNumber(player.gold)}</span>
                    </div>

                    {/* Desktop Right Group (Refactored) */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-4">
                        <button onClick={() => setIsMapOpen(true)} className="text-sm font-semibold flex items-center gap-2 p-2 rounded-md bg-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors" title={mapLabel}>
                            <i className="fa-solid fa-map-location-dot text-xl"></i>
                            <span className="hidden xl:inline">{mapLabel}</span>
                        </button>

                        <div className="text-center">
                            <button onClick={() => saveGame()} disabled={isSaving} className="text-sm font-semibold flex items-center gap-2 p-2 rounded-md bg-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50" title={t('saveGameTitle')}>
                                <i className={`fa-solid fa-floppy-disk text-xl ${isSaving ? 'animate-spin' : ''}`}></i>
                                <span className="hidden xl:inline">{isSaving ? t('saving') : t('saveGame')}</span>
                            </button>
                            {lastSaved && (
                                <p className="text-xs text-[var(--text-secondary)]/70 mt-0.5 pointer-events-none">
                                    {lastSaved.toLocaleTimeString(t('justNow') === 'just now' ? 'en-US' : 'tr-TR')}
                                </p>
                            )}
                        </div>
                        <div className="relative" ref={notificationRef}>
                            <button onClick={handleNotificationToggle} className="relative text-sm font-semibold flex items-center gap-2 p-2 rounded-md bg-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors" title={t('notifications')}>
                                <i className="fa-solid fa-bell text-xl"></i>
                                {hasUnreadNotifications && (
                                    <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--background-medium)]"></div>
                                )}
                            </button>
                            <NotificationPanel 
                                isOpen={isNotificationsOpen}
                                notifications={notifications}
                                onClose={() => setNotificationsOpen(false)}
                                onClearAll={clearAllNotifications}
                            />
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
