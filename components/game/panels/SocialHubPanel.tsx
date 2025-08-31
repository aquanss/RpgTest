

import React from 'react';
import Card from '../../ui/Card';

const SocialHubPanel: React.FC = () => {
    return (
        <Card title="Community Hub">
            <div className="text-center py-16">
                <p className="text-5xl mb-4"><i className="fa-solid fa-users"></i></p>
                <h3 className="text-2xl font-bold text-[var(--parchment-bg)]">Community Features Coming Soon!</h3>
                <p className="text-[var(--stone-600)] mt-2">Stay tuned for guilds, friend lists, and more.</p>
            </div>
        </Card>
    );
};

export default SocialHubPanel;