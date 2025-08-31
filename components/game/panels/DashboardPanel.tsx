
import React, { useState } from 'react';
import Card from '../../ui/Card';
import PaperDoll from './character/PaperDoll';
import StatsDisplay from './character/StatsDisplay';
import CombatStatsDisplay from './character/CombatStatsDisplay';
import ProfessionsDisplay from './character/ProfessionsDisplay';
import PassiveSkillsDisplay from './character/PassiveSkillsDisplay';
import { useTranslation } from '../../../App';

type CharacterTab = 'profile' | 'stats' | 'skills';

const CharacterPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CharacterTab>('profile');
    const { t } = useTranslation();

    const renderTabContent = () => {
        // Add a wrapper with margin-top for spacing below the tabs
        return <div className="mt-6">{
            (() => {
                switch (activeTab) {
                    case 'profile':
                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="flex items-center justify-center">
                                    <PaperDoll />
                                </div>
                                <div className="space-y-6">
                                    <CombatStatsDisplay />
                                    <ProfessionsDisplay />
                                </div>
                            </div>
                        );
                    case 'stats':
                        return <StatsDisplay />;
                    case 'skills':
                        return <PassiveSkillsDisplay />;
                    default:
                        return null;
                }
            })()
        }</div>;
    };

    const TabButton = ({ tab, label }: { tab: CharacterTab; label:string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold rounded-lg transition-colors duration-200 text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-medium)] focus:ring-[var(--accent-blue)] ${
                activeTab === tab
                    ? 'bg-[var(--border-color)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <Card title={t('character')}>
            <div className="flex items-center space-x-2">
                <TabButton tab="profile" label={t('profile')} />
                <TabButton tab="stats" label={t('statistics')} />
                <TabButton tab="skills" label={t('skills')} />
            </div>
           
            {renderTabContent()}
        </Card>
    );
};

export default CharacterPanel;
