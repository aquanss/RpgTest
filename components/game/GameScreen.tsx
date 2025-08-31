import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import MobileNavBar from './MobileNavBar';
import MobileMenu from './MobileMenu'; // Yeni menü bileşeni
import { useGame } from '../../context/GameContext';
import HeaderActionDisplay from './HeaderActionDisplay';
import { useTranslation } from '../../App';

const GameScreen: React.FC = () => {
    const { gameState } = useGame();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const { t } = useTranslation();

    if (gameState.isLoading) {
        return (
          <div className="flex items-center justify-center h-screen bg-[var(--background-dark)]">
            <div className="text-2xl text-[var(--text-primary)] animate-pulse">{t('loadingGameData')}</div>
          </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[var(--background-dark)] text-[var(--text-primary)] font-sans overflow-hidden">
            <div className="max-w-screen-2xl mx-auto h-full flex flex-col">
                <Header onMenuToggle={() => setMenuOpen(true)} />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto pb-24 md:pb-6">
                        <MainContent />
                    </main>
                </div>

                {/* Mobile-only Action Display */}
                <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center px-4 pointer-events-none">
                    <div className="pointer-events-auto">
                         <HeaderActionDisplay />
                    </div>
                </div>

                <MobileNavBar />
                <MobileMenu isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
            </div>
        </div>
    );
};

export default GameScreen;
