import React from 'react';
import Card from '../../ui/Card';

const MarketplacePanel: React.FC = () => {
    return (
        <Card title="Player Marketplace">
            <div className="text-center py-16">
                <p className="text-5xl mb-4"><i className="fa-solid fa-gavel"></i></p>
                <h3 className="text-2xl font-bold text-[var(--parchment-bg)]">Marketplace is Currently Closed</h3>
                <p className="text-[var(--stone-600)] mt-2">This feature will be added in a future update.</p>
            </div>
        </Card>
    );
};

export default MarketplacePanel;