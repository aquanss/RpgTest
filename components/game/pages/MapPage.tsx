import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import WorldMapPanel from '../panels/map/WorldMapPanel';
import { useTranslation } from '../../../App';
import { useGame } from '../../../context/GameContext';
import { mapRegions } from '../../../utils/initialGameState';

const MapPage: React.FC = () => {
    const { gameState } = useGame();
    const { t, tGame } = useTranslation();
    const { player } = gameState;
    const [isMapOpen, setMapOpen] = useState(true);

    const currentRegion = mapRegions.find(r => r.id === player.currentLocationId);
    const translatedRegionName = currentRegion ? tGame('mapRegions', currentRegion.id, 'name', currentRegion.name) : '';
    const translatedRegionDesc = currentRegion ? tGame('mapRegions', currentRegion.id, 'description', currentRegion.description) : '';


    // This component always ensures the map is open on render
    useEffect(() => {
        setMapOpen(true);
    }, []);

    return (
        <>
            <WorldMapPanel isOpen={isMapOpen} onClose={() => setMapOpen(false)} />
            <Card title={t('worldMap')}>
                <div className="text-center py-16">
                    <p className="text-5xl mb-4 text-[var(--accent-gold)]"><i className="fa-solid fa-map-marked-alt"></i></p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{t('youAreIn', { regionName: translatedRegionName })}</h3>
                    <p className="text-[var(--text-secondary)] mt-2 max-w-xl mx-auto">{translatedRegionDesc}</p>
                    <button 
                        onClick={() => setMapOpen(true)}
                        className="mt-6 bg-[var(--accent-blue)] hover:brightness-110 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300"
                    >
                        {t('openWorldMap')}
                    </button>
                </div>
            </Card>
        </>
    );
};

export default MapPage;