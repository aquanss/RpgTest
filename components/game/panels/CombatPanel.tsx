import React from 'react';
import Card from '../../ui/Card';
import { useTranslation } from '../../../App';

const CombatPanel: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Card title="Combat Zone">
            <div className="text-center py-16">
                <p className="text-5xl mb-4"><i className="fa-solid fa-swords"></i></p>
                <h3 className="text-2xl font-bold text-[var(--parchment-bg)]">Combat System Coming Soon!</h3>
                <p className="text-[var(--stone-600)] mt-2">Ready your weapons and spells for epic battles.</p>
            </div>
        </Card>
    );
};

export default CombatPanel;