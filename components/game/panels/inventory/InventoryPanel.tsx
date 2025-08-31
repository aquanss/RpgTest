

import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../../ui/Card';
import { useGame } from '../../../../context/GameContext';
import { Item, Stats, RarityKey, EquipmentSlot } from '../../../../types';
import { rarityColors } from '../../../../utils/itemData';
import { useTranslation } from '../../../../App';

type ItemType = Item['type'];

const statNames: Record<keyof Stats, string> = {
    strength: 'stat_strength',
    agility: 'stat_agility',
    tactics: 'stat_tactics',
    endurance: 'stat_endurance',
    charisma: 'stat_charisma',
    luck: 'stat_luck',
};

const itemTypeNames: Record<string, string> = {
    equipment: 'itemType_equipment',
    potion: 'itemType_potion',
    material: 'itemType_material',
    misc: 'itemType_misc',
    tool: 'itemType_tool',
    weapon: 'itemType_weapon',
    helmet: 'itemType_helmet',
    chest: 'itemType_chest',
    legs: 'itemType_legs',
    boots: 'itemType_boots',
    gloves: 'itemType_gloves',
    shield: 'itemType_shield',
};

const getItemScore = (item: Item | null): number => {
    if (!item) return 0;
    const rarityValue: Record<RarityKey, number> = { 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5 };
    const statSum = Object.values(item.stats || {}).reduce((sum, val) => sum + (val || 0), 0);
    // Give much more weight to stats than rarity
    return statSum * 100 + rarityValue[item.rarity];
};


const InventoryPanel: React.FC = () => {
    const { gameState, setPlayerInventory, equipItem, useItem } = useGame();
    const { t, tGame, tRarity } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<ItemType | 'all'>('all');
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: Item } | null>(null);

    const filterCategories: { label: string; type: ItemType | 'all' }[] = [
        { label: t('allItems'), type: 'all' },
        { label: t('equipment'), type: 'equipment' },
        { label: t('potions'), type: 'potion' },
        { label: t('materials'), type: 'material' },
        { label: t('miscItems'), type: 'misc' },
    ];

    const { inventory } = gameState.player;
    const totalSlots = 30;

    const isDnDEnabled = useMemo(() => activeFilter === 'all' && searchTerm === '', [activeFilter, searchTerm]);

    const filteredInventory = useMemo(() => {
        return inventory
            .filter(item => {
                if (activeFilter === 'all') return true;
                return item.type === activeFilter;
            })
            .filter(item => {
                const translatedName = tGame('items', item.id, 'name', item.name);
                return translatedName.toLowerCase().includes(searchTerm.toLowerCase())
            });
    }, [inventory, searchTerm, activeFilter, tGame]);

    const upgradeableItems = useMemo(() => {
        const equippedScores: Partial<Record<EquipmentSlot, number>> = {};
        for (const slot in gameState.player.equipment) {
            const item = gameState.player.equipment[slot as EquipmentSlot];
            equippedScores[slot as EquipmentSlot] = getItemScore(item);
        }

        const upgrades = new Set<string>();
        inventory.forEach((item, index) => {
            if (item.equipmentType && item.equipmentType !== 'tool') {
                const slot = item.equipmentType as EquipmentSlot;
                const itemScore = getItemScore(item);
                const equippedScore = equippedScores[slot] ?? 0;
                if (itemScore > equippedScore) {
                    upgrades.add(`${item.id}-${index}`);
                }
            }
        });
        return upgrades;
    }, [inventory, gameState.player.equipment]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, item: Item) => {
        setDraggedItemIndex(index);
        e.dataTransfer.setData("itemIndex", index.toString());
        e.dataTransfer.effectAllowed = 'move';
        
        const dragIcon = document.createElement('img');
        dragIcon.src = item.icon;
        dragIcon.style.width = '48px';
        dragIcon.style.height = '48px';
        dragIcon.style.position = 'absolute';
        dragIcon.style.left = '-1000px'; 
        document.body.appendChild(dragIcon);
        e.dataTransfer.setDragImage(dragIcon, 24, 24);

        setTimeout(() => {
            if (document.body.contains(dragIcon)) {
                document.body.removeChild(dragIcon);
            }
        }, 0);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
        if (draggedItemIndex === null || !isDnDEnabled) return;

        const fromIndex = draggedItemIndex;
        if (fromIndex === toIndex) {
            setDraggedItemIndex(null);
            return;
        };
        
        const newInventory = [...inventory];
        const [draggedItem] = newInventory.splice(fromIndex, 1);
        newInventory.splice(toIndex, 0, draggedItem);
        
        setPlayerInventory(newInventory);
        setDraggedItemIndex(null);
    };
    
    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    }
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }

    const handleSortInventory = () => {
        const itemTypeOrder: Record<string, number> = {
            'equipment': 1,
            'potion': 2,
            'material': 3,
            'misc': 4,
        };

        const sortedInventory = [...inventory].sort((a, b) => {
            const typeA = a.type ?? 'misc';
            const typeB = b.type ?? 'misc';
            const orderA = itemTypeOrder[typeA];
            const orderB = itemTypeOrder[typeB];

            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return a.name.localeCompare(b.name);
        });
        setPlayerInventory(sortedInventory);
    };

    const handleContextMenu = (e: React.MouseEvent, item: Item) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    useEffect(() => {
        window.addEventListener('click', closeContextMenu);
        window.addEventListener('contextmenu', closeContextMenu);
        return () => {
            window.removeEventListener('click', closeContextMenu);
            window.removeEventListener('contextmenu', closeContextMenu);
        };
    }, []);

    const ContextMenu = () => {
        if (!contextMenu) return null;

        const menuStyle = {
            top: contextMenu.y,
            left: contextMenu.x,
        };
        
        const { item } = contextMenu;

        return (
            <div 
                style={menuStyle} 
                className="fixed bg-[var(--background-dark)] border border-[var(--border-color)] rounded-md shadow-lg z-50 text-[var(--text-primary)] text-sm py-1 animate-fade-in-up w-36" 
                onClick={(e) => e.stopPropagation()}
            >
                {item.type === 'equipment' && item.equipmentType !== 'tool' && (
                    <button onClick={() => equipItem(item)} className="flex items-center gap-3 w-full text-left px-3 py-1.5 hover:bg-[var(--accent-blue)] transition-colors">
                        <i className="fa-solid fa-shirt w-4 text-center"></i>
                        <span>{t('equip')}</span>
                    </button>
                )}
                {item.type === 'potion' && (
                     <button onClick={() => useItem(item)} className="flex items-center gap-3 w-full text-left px-3 py-1.5 hover:bg-[var(--accent-blue)] transition-colors">
                        <i className="fa-solid fa-flask w-4 text-center"></i>
                        <span>{t('use')}</span>
                     </button>
                )}
                <button disabled className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-gray-500 cursor-not-allowed">
                    <i className="fa-solid fa-dollar-sign w-4 text-center"></i>
                    <span>{t('sell')}</span>
                </button>
            </div>
        );
    };

    const renderTitle = () => (
        <div className="flex justify-between items-center w-full">
            <span>{t('inventory')}</span>
             <div className="flex items-center gap-3">
                <button
                    onClick={handleSortInventory}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-md bg-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors"
                    title={t('sort')}
                >
                    <i className="fa-solid fa-sort-alpha-down w-5 h-5"></i>
                    <span className="font-semibold text-sm">{t('sort')}</span>
                </button>
                <span className="text-lg font-normal text-[var(--text-secondary)]">
                    {inventory.length} / {totalSlots} {t('slot')}
                </span>
            </div>
        </div>
    );

    const gridClasses = "grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2";
    const slotClasses = "relative group aspect-square bg-[var(--background-dark)]/50 rounded-md flex flex-col items-center justify-center p-1 border-2 border-solid hover:border-[var(--accent-blue)] transition-all duration-200";
    const emptySlotClasses = "aspect-square bg-[var(--background-dark)]/30 rounded-md border-2 border-dashed border-[var(--border-color)]/50";

    return (
        <Card title={renderTitle()}>
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder={t('searchItems')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--border-color)] text-[var(--text-primary)] rounded-lg py-2 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[var(--text-secondary)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center bg-[var(--background-dark)]/50 p-1 rounded-lg space-x-1 flex-shrink-0">
                    {filterCategories.map(({ label, type }) => (
                        <button
                            key={type}
                            onClick={() => setActiveFilter(type)}
                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200 ${
                                activeFilter === type
                                    ? 'bg-[var(--accent-blue)] text-white'
                                    : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={gridClasses}>
                {filteredInventory.map((item, index) => {
                    const originalIndex = inventory.indexOf(item);
                    const isUpgrade = upgradeableItems.has(`${item.id}-${originalIndex}`);
                    const translatedName = tGame('items', item.id, 'name', item.name);
                    const translatedDescription = tGame('items', item.id, 'description', item.description || '');

                    return (
                        <div
                            key={`${item.id}-${originalIndex}`}
                            draggable={isDnDEnabled}
                            onDragStart={isDnDEnabled ? (e) => handleDragStart(e, originalIndex, item) : undefined}
                            onDrop={isDnDEnabled ? (e) => handleDrop(e, originalIndex) : undefined}
                            onDragOver={isDnDEnabled ? handleDragOver : undefined}
                            onDragEnd={isDnDEnabled ? handleDragEnd : undefined}
                            onContextMenu={(e) => handleContextMenu(e, item)}
                            className={`${slotClasses} ${isDnDEnabled ? 'cursor-move' : ''}`}
                            style={{ borderColor: rarityColors[item.rarity] }}
                        >
                            <img src={item.icon} alt={translatedName} className="w-14 h-14 object-contain pointer-events-none" loading="lazy" decoding="async" />
                            {item.quantity > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 text-xs font-bold bg-[var(--background-medium)] px-1 rounded">{item.quantity}</span>
                            )}
                             {isUpgrade && (
                                <div className="absolute top-0.5 right-0.5 text-green-400 animate-pulse" title={t('betterEquipment')}>
                                    <i className="fa-solid fa-circle-arrow-up text-lg"></i>
                                </div>
                            )}
                            {/* Smart Tooltip */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-48 bg-[var(--background-dark)] text-[var(--text-primary)] text-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg z-20 border border-[var(--border-color)]">
                                <p className="font-bold text-base" style={{ color: rarityColors[item.rarity] }}>{translatedName}</p>
                                <p className="text-xs text-[var(--text-secondary)] capitalize">{t(itemTypeNames[item.type || 'misc'] as any)}</p>
                                {translatedDescription && <p className="text-xs text-gray-400 italic mt-1">{translatedDescription}</p>}
                                {item.stats && (
                                    <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-left text-xs space-y-0.5">
                                        {Object.entries(item.stats).map(([stat, value]) => (
                                            <p key={stat} className="text-green-400">
                                                +{value} {t(statNames[stat as keyof Stats] as any)}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                {Array.from({ length: totalSlots - filteredInventory.length }).map((_, i) => (
                    <div key={`empty-${i}`} className={emptySlotClasses} onDrop={(e) => handleDrop(e, inventory.length + i)} onDragOver={handleDragOver}></div>
                ))}
            </div>
            <ContextMenu />
        </Card>
    );
};

export default InventoryPanel;