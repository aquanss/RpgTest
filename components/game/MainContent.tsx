import React from 'react';
import CharacterPanel from './panels/DashboardPanel'; // Repurposed DashboardPanel
import SettingsPanel from './panels/SettingsPanel';
import InventoryPanel from './panels/InventoryPanel';
import SkillsPage from './pages/SkillsPage';
import HuntingPage from './pages/HuntingPage';
import MapPage from './pages/MapPage';
import { useGame } from '../../context/GameContext';

const MainContent: React.FC = () => {
    const { currentView } = useGame();

    const renderView = () => {
        switch (currentView) {
            case 'character':
                return <CharacterPanel />;
            case 'inventory':
                return <InventoryPanel />;
            case 'professions':
                return <SkillsPage />;
            case 'hunting':
                return <HuntingPage />;
            case 'settings':
                return <SettingsPanel />;
            case 'map':
                return <MapPage />;
            default:
                return <CharacterPanel />;
        }
    };

    // This wrapper ensures consistent spacing between cards if a view ever has multiple.
    return (
        <div className="space-y-6">
            {renderView()}
        </div>
    );
};

export default MainContent;