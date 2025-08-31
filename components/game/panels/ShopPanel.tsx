import React from 'react';
import Card from '../../ui/Card';

const ShopPanel: React.FC = () => {
    return (
        <Card title="General Store">
            <div className="text-center py-16">
                <p className="text-5xl mb-4"><i className="fa-solid fa-store"></i></p>
                <h3 className="text-2xl font-bold text-[var(--parchment-bg)]">Shop Coming Soon!</h3>
                <p className="text-[var(--stone-600)] mt-2">Spend your hard-earned gold on powerful items and upgrades.</p>
            </div>
        </Card>
    );
};

export default ShopPanel;