

import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import { useGame } from '../../../context/GameContext';
import { clearLocalGameState } from '../../../services/storageService';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { useTranslation } from '../../../App';

const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    id: string;
}> = ({ checked, onChange, id }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input 
            type="checkbox" 
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            id={id} 
            className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-[var(--border-color)] rounded-full peer peer-focus:ring-2 peer-focus:ring-[var(--accent-blue)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-blue)]"></div>
    </label>
);

const SettingsRow: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ title, description, children }) => (
    <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)] last:border-b-0">
        <div className="pr-4">
            <h4 className="font-semibold text-base text-[var(--text-primary)]">{title}</h4>
            <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
        <div className="flex-shrink-0">{children}</div>
    </div>
);


const SettingsPanel: React.FC = () => {
    const { user, character, goBackToCharSelect, gameState, updateSettings } = useGame();
    const { settings } = gameState;
    const { t, language, setLanguage } = useTranslation();

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('animationsDisabled') === 'true');
    const [colorblindMode, setColorblindMode] = useState(() => localStorage.getItem('colorblindMode') === 'true');

    const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [isCharSelectConfirmOpen, setCharSelectConfirmOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-animations-disabled', String(performanceMode));
        localStorage.setItem('animationsDisabled', String(performanceMode));
    }, [performanceMode]);

    useEffect(() => {
        document.documentElement.setAttribute('data-colorblind-mode', String(colorblindMode));
        localStorage.setItem('colorblindMode', String(colorblindMode));
    }, [colorblindMode]);


    const performClear = () => {
        clearLocalGameState(user, character.id);
        window.location.reload();
    };

    return (
        <>
            <ConfirmDialog
                isOpen={isClearConfirmOpen}
                title={t('clearLocalDataTitle')}
                message={t('clearLocalDataMessage')}
                onConfirm={performClear}
                onCancel={() => setClearConfirmOpen(false)}
                confirmText={t('yesClear')}
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
            <div className="space-y-6">
                 <Card title={t('preferences')}>
                     <div className="divide-y divide-[var(--border-color)]">
                         <SettingsRow title={t('language')} description="">
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}
                                className="bg-[var(--background-dark)] text-[var(--text-primary)] rounded py-1 px-2 border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                            >
                                <option value="tr">Türkçe</option>
                                <option value="en">English</option>
                            </select>
                         </SettingsRow>
                         <SettingsRow title={t('levelUpNotifications')} description={t('levelUpNotificationsDesc')}>
                            <ToggleSwitch 
                                id="level-up-notifs"
                                checked={!settings.disableLevelUpNotifications}
                                onChange={checked => updateSettings({ disableLevelUpNotifications: !checked })}
                            />
                         </SettingsRow>
                         <SettingsRow title={t('milestoneNotifications')} description={t('milestoneNotificationsDesc')}>
                             <ToggleSwitch 
                                id="milestone-notifs"
                                checked={!settings.disableMilestoneNotifications}
                                onChange={checked => updateSettings({ disableMilestoneNotifications: !checked })}
                            />
                         </SettingsRow>
                     </div>
                 </Card>

                 <Card title={t('appearance')}>
                    <div className="divide-y divide-[var(--border-color)]">
                        <SettingsRow title={t('theme')} description="">
                           <select 
                                value={theme} 
                                onChange={(e) => setTheme(e.target.value)}
                                className="bg-[var(--background-dark)] text-[var(--text-primary)] rounded py-1 px-2 border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                            >
                                <option value="dark">{t('themeMedieval')}</option>
                                <option value="light">{t('themeLight')}</option>
                            </select>
                        </SettingsRow>
                    </div>
                 </Card>

                 <Card title={t('accessibility')}>
                    <div className="divide-y divide-[var(--border-color)]">
                        <SettingsRow title={t('colorblindMode')} description={t('colorblindDesc')}>
                           <ToggleSwitch 
                                id="colorblind-toggle"
                                checked={colorblindMode}
                                onChange={setColorblindMode}
                            />
                        </SettingsRow>
                         <SettingsRow title={t('performanceMode')} description={t('performanceDesc')}>
                           <ToggleSwitch 
                                id="performance-toggle"
                                checked={performanceMode}
                                onChange={setPerformanceMode}
                            />
                        </SettingsRow>
                    </div>
                 </Card>

                 <Card title={t('account')}>
                    <div className="divide-y divide-[var(--border-color)]">
                        <div className="p-4">
                            <h4 className="font-semibold text-base text-[var(--text-primary)]">{t('sessionManagement')}</h4>
                            <p className="text-sm text-[var(--text-secondary)] my-2">
                                {t('sessionManagementDesc')}
                            </p>
                            <button
                                onClick={() => setCharSelectConfirmOpen(true)}
                                className="bg-[var(--accent-blue)] hover:brightness-110 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                            >
                                {t('changeCharacter')}
                            </button>
                        </div>
                         <div className="p-4">
                            <h4 className="font-semibold text-base text-[var(--text-primary)]">{t('dataManagement')}</h4>
                            <p className="text-sm text-[var(--text-secondary)] my-2">
                                {t('dataManagementDesc')}
                            </p>
                            <button
                                onClick={() => setClearConfirmOpen(true)}
                                className="bg-[var(--accent-red)] hover:brightness-110 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                            >
                                {t('clearLocalData')}
                            </button>
                        </div>
                    </div>
                 </Card>
            </div>
        </>
    );
};

export default SettingsPanel;
