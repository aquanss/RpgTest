

import React, { useState, useEffect } from 'react';
import { useGame } from '../../../../context/GameContext';
import { mapRegions } from '../../../../utils/initialGameState';
import { creaturesByLocation } from '../../../../utils/huntingData';
import type { MapRegion, Creature } from '../../../../types';
import { useTranslation } from '../../../../App';

interface WorldMapPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sub-component for region details
const RegionDetailView: React.FC<{ 
    region: MapRegion; 
    onBack: () => void;
    onTravel: (regionId: string) => void;
    onClose: () => void;
}> = ({ region, onBack, onTravel, onClose }) => {
    const { gameState } = useGame();
    const { t, tGame } = useTranslation();
    const { player, currentTravel } = gameState;
    const creatures = creaturesByLocation[region.id] || [];
    const isTraveling = !!currentTravel;
    const isCurrentLocation = player.currentLocationId === region.id;
    const hasEnoughGold = player.gold >= region.travelCost;
    
    const handleTravel = () => {
        onTravel(region.id);
        onClose();
    }
    
    const translatedRegionName = tGame('mapRegions', region.id, 'name', region.name);
    const translatedRegionDesc = tGame('mapRegions', region.id, 'description', region.description);

    return (
        <div className="flex flex-col h-full animate-fade-in text-stone-800">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 flex-shrink-0">
                <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-amber-900" style={{ fontFamily: 'var(--font-fantasy)' }}>
                        {translatedRegionName}
                    </h3>
                    <p className="text-sm text-stone-700 mt-1">{translatedRegionDesc}</p>
                </div>
                <button
                    onClick={onBack}
                    className="bg-amber-800/10 hover:bg-amber-800/20 text-amber-900 font-semibold py-1 px-3 rounded text-sm transition-colors duration-300 flex items-center gap-2 ml-4 border border-amber-800/20"
                >
                    &larr; {t('backToMap')}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                {/* Creatures List */}
                <div className="flex-1 md:flex-initial md:w-2/3 bg-black/5 p-4 rounded-lg overflow-y-auto border border-amber-900/20 max-h-64 md:max-h-80">
                    <h4 className="text-lg font-bold text-amber-900 mb-3 border-b border-amber-900/20 pb-2">{t('creaturesInRegion')}</h4>
                    {creatures.length > 0 ? (
                        <ul className="space-y-3">
                            {creatures.map(creature => {
                                const translatedCreatureName = tGame('creatures', creature.id, 'name', creature.name);
                                return (
                                <li key={creature.id} className="flex items-center bg-black/5 p-2 rounded-md">
                                    <img src={creature.icon} alt={translatedCreatureName} className="w-12 h-12 mr-4 object-contain flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-stone-800">{translatedCreatureName}</p>
                                        <p className="text-sm text-stone-600">{t('level')} {creature.levelReq}</p>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    ) : (
                        <p className="text-center text-stone-600 py-8">{t('noCreaturesHere')}</p>
                    )}
                </div>

                {/* Travel Info */}
                <div className="md:w-1/3 bg-black/5 p-4 rounded-lg flex flex-col border border-amber-900/20">
                    <h4 className="text-lg font-bold text-amber-900 mb-3 border-b border-amber-900/20 pb-2">{t('travelInfo')}</h4>
                    <div className="space-y-2 text-sm flex-1">
                        <div className="flex justify-between">
                            <span className="text-stone-700">{t('levelReqWithColon')}</span>
                            <span className={`font-bold ${player.level < region.levelReq ? 'text-red-600' : 'text-green-600'}`}>{region.levelReq}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-stone-700">{t('cost')}</span>
                            <span className={`font-bold ${!hasEnoughGold ? 'text-red-600' : 'text-amber-700'}`}>{region.travelCost} {t('gold')}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-stone-700">{t('duration')}</span>
                            <span className="font-bold text-stone-800">{region.travelTime / 1000}s</span>
                        </div>
                    </div>
                    {isCurrentLocation ? (
                         <div className="w-full mt-4 bg-amber-800/10 text-amber-900 font-bold py-3 rounded-lg text-center border border-amber-800/20">
                            {t('youAreHere')}
                        </div>
                    ) : (
                        <button 
                            onClick={handleTravel}
                            disabled={isTraveling || !hasEnoughGold || player.level < region.levelReq}
                            className="w-full mt-4 bg-amber-800 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:bg-stone-500 disabled:cursor-not-allowed shadow-md"
                        >
                            {isTraveling ? t('traveling') : t('travelToRegion')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


// Sub-component for the markers on the map
const MapMarker: React.FC<{ region: MapRegion, onSelect: (region: MapRegion) => void }> = ({ region, onSelect }) => {
    const { gameState } = useGame();
    const { t, tGame } = useTranslation();
    const { player, currentTravel } = gameState;
    const isCurrentLocation = player.currentLocationId === region.id;
    const isDangerous = player.level < region.levelReq;
    const isTraveling = !!currentTravel;

    const [tooltipPosition, setTooltipPosition] = useState({ v: 'top', h: 'center' });
    const translatedRegionName = tGame('mapRegions', region.id, 'name', region.name);

    useEffect(() => {
        const topPercent = parseInt(region.coordinates.top, 10);
        const leftPercent = parseInt(region.coordinates.left, 10);

        const newPos = { v: 'top' as 'top' | 'bottom', h: 'center' as 'left' | 'center' | 'right' };

        if (topPercent < 30) {
            newPos.v = 'bottom';
        }
        
        if (leftPercent > 70) {
            newPos.h = 'right';
        } else if (leftPercent < 30) {
            newPos.h = 'left';
        }

        setTooltipPosition(newPos);
    }, [region.coordinates.top, region.coordinates.left]);

    const markerClasses = isCurrentLocation 
        ? 'border-yellow-500 bg-yellow-400/30 animate-pulse-strong shadow-lg shadow-yellow-500/50' 
        : isDangerous
        ? 'border-red-600 bg-red-500/30'
        : `border-dashed border-amber-900/60 ${!isTraveling ? 'hover:border-amber-700 hover:bg-amber-700/20' : ''}`;
    
    const isDisabled = isTraveling;
    
    const getTooltipPositionClasses = () => {
        const vClass = tooltipPosition.v === 'top' ? 'bottom-full mb-3' : 'top-full mt-3';
        const hClassMap = {
            center: 'left-1/2 -translate-x-1/2',
            left: 'left-0',
            right: 'right-0',
        };
        return `${vClass} ${hClassMap[tooltipPosition.h]}`;
    };

    return (
        <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ ...region.coordinates }}
        >
            <button
                onClick={() => onSelect(region)}
                className={`w-full h-full rounded-full border-4 transition-all duration-300 flex items-center justify-center ${markerClasses} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={isDisabled}
                aria-label={`Detayları gör: ${translatedRegionName}`}
            >
                {isCurrentLocation ? <i className="fa-solid fa-star text-yellow-300 text-3xl drop-shadow-lg"></i> : isDangerous && <i className="fa-solid fa-skull text-red-600 text-3xl drop-shadow-lg"></i>}
            </button>
            <div className={`absolute w-max bg-[var(--background-dark)] text-[var(--text-primary)] text-sm rounded-lg py-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg z-10 whitespace-nowrap border border-[var(--border-color)] ${getTooltipPositionClasses()}`}>
                <p className="font-bold text-base text-[var(--accent-gold)] border-b border-[var(--border-color)] pb-1 mb-2">{translatedRegionName}</p>
                 <div className="space-y-1 text-left text-xs">
                     <p>{t('levelReqWithColon')} {region.levelReq}</p>
                     {isCurrentLocation && <p className="text-yellow-400 mt-1">{t('youAreHere')}</p>}
                     {!isCurrentLocation && <p className="text-gray-400 mt-1">{t('clickForDetails')}</p>}
                 </div>
            </div>
        </div>
    );
};


const WorldMapPanel: React.FC<WorldMapPanelProps> = ({ isOpen, onClose }) => {
    const { gameState, travelTo } = useGame();
    const { t, tGame } = useTranslation();
    const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(null);
    const currentRegion = mapRegions.find(r => r.id === gameState.player.currentLocationId);
    
    const translatedCurrentRegionName = currentRegion ? tGame('mapRegions', currentRegion.id, 'name', currentRegion.name) : '';
    const translatedCurrentRegionDesc = currentRegion ? tGame('mapRegions', currentRegion.id, 'description', currentRegion.description) : '';


    // Reset selected region when panel is closed
    useEffect(() => {
        if (!isOpen) {
            setSelectedRegion(null);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-sans"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col p-4 md:p-8 border-8 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ 
                    backgroundColor: '#e6dccf', // A less harsh cream color
                    borderColor: 'var(--accent-gold-darker)',
                }}
            >
                {selectedRegion ? (
                    <RegionDetailView 
                        region={selectedRegion} 
                        onBack={() => setSelectedRegion(null)}
                        onTravel={travelTo}
                        onClose={onClose}
                    />
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4 flex-shrink-0">
                             <div>
                                <h2 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'var(--font-fantasy)' }}>
                                    {t('worldMap')}
                                </h2>
                                {currentRegion && (
                                     <p className="text-sm text-stone-700 mt-1">{t('youAreHere')}: <strong className="font-semibold">{translatedCurrentRegionName}</strong>. {translatedCurrentRegionDesc}</p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-full bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 flex-shrink-0 ml-4 border border-amber-900/20"
                                aria-label={t('closeMap')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>

                        {/* Map */}
                        <div className="relative aspect-video rounded-md overflow-hidden border-2 border-amber-900/30 flex-1 shadow-inner">
                            <img
                                src="https://files.catbox.moe/edfbxd.png"
                                alt="Dünya Haritası"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10"></div>
                            {mapRegions.map(region => (
                                <MapMarker key={region.id} region={region} onSelect={setSelectedRegion} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WorldMapPanel;