import React, { useMemo, useState, useEffect } from 'react';
import { useGame } from '../../../../context/GameContext';
import EquipmentSlot from './EquipmentSlot';
import type { Equipment, EquipmentSlot as SlotType, Item, RarityKey, Stats } from '../../../../types';
import { setBonusConfig } from '../../../../utils/statBonuses';
import { rarityColors } from '../../../../utils/itemData';
import { useTranslation } from '../../../../App';

const setBonusEquipmentSlots: (keyof Equipment)[] = ['helmet', 'chest', 'legs', 'boots', 'gloves'];

const getItemScore = (item: Item | null): number => {
    if (!item) return 0;
    const rarityValue: Record<RarityKey, number> = { 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5 };
    const statSum = Object.values(item.stats || {}).reduce((sum, val) => sum + (val || 0), 0);
    return statSum * 100 + rarityValue[item.rarity];
};

const EquipmentPickerPopover: React.FC<{
    anchorEl: HTMLDivElement | null;
    slotType: SlotType | null;
    onClose: () => void;
}> = ({ anchorEl, slotType, onClose }) => {
    const { gameState, equipItem, unequipItem } = useGame();
    const { t, tGame, tRarity } = useTranslation();
    const { inventory, equipment } = gameState.player;
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const equippableItems = useMemo(() => {
        if (!slotType) return [];
        return inventory.filter(item => item.equipmentType === slotType);
    }, [inventory, slotType]);
    
    const equippedItem = slotType ? equipment[slotType] : null;
    const equippedItemScore = useMemo(() => getItemScore(equippedItem), [equippedItem]);
    
    useEffect(() => {
        const updatePosition = () => {
            if (anchorEl && window.innerWidth >= 768) { // Sadece masaüstü için çalıştır
                const rect = anchorEl.getBoundingClientRect();
                const popoverWidth = 288; // w-72
                let left = rect.right + 8; 
                if (left + popoverWidth > window.innerWidth - 10) { 
                    left = rect.left - popoverWidth - 8;
                }
                
                const popoverHeight = 500; // Tahmini yükseklik
                let top = rect.top;
                if (top + popoverHeight > window.innerHeight - 10) {
                    top = window.innerHeight - popoverHeight - 10;
                }
                setPosition({ top: Math.max(10, top), left });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [anchorEl]);

    if (!anchorEl || !slotType) return null;

    const handleEquip = (item: Item) => {
        equipItem(item);
        onClose();
    };

    const handleUnequip = () => {
        unequipItem(slotType);
        onClose();
    };
    
    const ItemStat = ({ stat, value }: { stat: string, value: number}) => (
        <p className="text-[var(--accent-green)]">
            +{value} {t(`stat_${stat}` as any)}
        </p>
    );

    const translatedSlotName = t(`slot_${slotType}` as any);

    return (
        <div 
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none flex items-start justify-center p-4 pt-24 md:pt-0 md:items-start md:justify-start md:p-0" 
            onClick={onClose}
        >
            <div
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
                className="bg-[var(--background-medium)] rounded-lg shadow-2xl w-full max-w-sm border border-[var(--border-color)] animate-fade-in-up flex flex-col max-h-[80vh] md:absolute md:w-72"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[var(--accent-gold)] capitalize">{t('slotAndType', { slotType: translatedSlotName })}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--border-color)] md:hidden" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                {equippedItem && (
                    <div className="p-3 bg-[var(--background-dark)]/50 border-b border-[var(--border-color)]">
                        <p className="text-xs text-[var(--text-secondary)] mb-2">{t('equipped')}</p>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[var(--background-medium)] rounded-md p-1 border-2 flex-shrink-0" style={{ borderColor: rarityColors[equippedItem.rarity] }}>
                                <img src={equippedItem.icon} alt={equippedItem.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="text-sm">
                                <p className="font-bold" style={{color: rarityColors[equippedItem.rarity]}}>{tGame('items', equippedItem.id, 'name', equippedItem.name)}</p>
                                {equippedItem.stats && <div className="text-xs space-y-0.5">{Object.entries(equippedItem.stats).map(([stat, value]) => <ItemStat key={stat} stat={stat} value={value!} />)}</div>}
                            </div>
                        </div>
                         <button onClick={handleUnequip} className="w-full mt-3 text-sm font-semibold text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 py-1.5 px-3 rounded-md transition-colors">
                            {t('unequip')}
                        </button>
                    </div>
                )}
                
                <div className="p-3 flex-1 overflow-y-auto">
                    <p className="text-xs text-[var(--text-secondary)] mb-2">{t('inventory')}</p>
                    {equippableItems.length > 0 ? (
                        <ul className="space-y-2">
                            {equippableItems.map(item => {
                                const itemScore = getItemScore(item);
                                const isUpgrade = itemScore > equippedItemScore;
                                const isDowngrade = equippedItemScore > 0 && itemScore < equippedItemScore;
                                const translatedName = tGame('items', item.id, 'name', item.name);
                                return (
                                <li key={item.id}>
                                    <button onClick={() => handleEquip(item)} className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors text-left">
                                        <div className="w-14 h-14 bg-[var(--background-dark)] rounded-md p-1 border-2 flex-shrink-0" style={{ borderColor: rarityColors[item.rarity] }}>
                                            <img src={item.icon} alt={translatedName} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="text-sm flex-1">
                                            <p className="font-bold" style={{color: rarityColors[item.rarity]}}>{translatedName}</p>
                                            {item.stats && <div className="text-xs space-y-0.5">{Object.entries(item.stats).map(([stat, value]) => <ItemStat key={stat} stat={stat} value={value!} />)}</div>}
                                        </div>
                                         <div className="flex-shrink-0">
                                            {isUpgrade && <i className="fa-solid fa-circle-arrow-up text-xl text-[var(--accent-green)]" title={t('better')}></i>}
                                            {isDowngrade && <i className="fa-solid fa-circle-arrow-down text-xl text-[var(--accent-red)]" title={t('worse')}></i>}
                                        </div>
                                    </button>
                                </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <p className="text-center text-sm text-[var(--text-secondary)] py-8">{t('noItemsForSlot')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};


const PaperDoll: React.FC = () => {
    const { gameState } = useGame();
    const { equipment, inventory } = gameState.player;
    const [pickerState, setPickerState] = useState<{ anchorEl: HTMLDivElement | null, slotType: SlotType | null }>({ anchorEl: null, slotType: null });


    const activeSetName = useMemo(() => {
        const setCounts: Record<string, number> = {};

        for (const slot of setBonusEquipmentSlots) {
            const item = equipment[slot];
            if (item && item.set) {
                setCounts[item.set] = (setCounts[item.set] || 0) + 1;
            }
        }
        
        for (const setName in setCounts) {
            const config = setBonusConfig[setName];
            if (config && setCounts[setName] >= config.pieces) {
                return setName;
            }
        }
        
        return '';
    }, [equipment]);

    const handleOpenPicker = (slotType: SlotType, target: HTMLDivElement) => {
        const itemInSlot = equipment[slotType];
        const equippableItemsFromInventory = inventory.filter(item => item.equipmentType === slotType);
        
        // Picker'ı sadece çıkarılacak bir eşya varsa VEYA kuşanılacak alternatifler varsa aç.
        if (itemInSlot || equippableItemsFromInventory.length > 0) {
            setPickerState({ anchorEl: target, slotType });
        }
    };

    const handleClosePicker = () => {
        setPickerState({ anchorEl: null, slotType: null });
    };

    const createSlot = (slotType: SlotType) => (
         <EquipmentSlot 
            item={equipment[slotType]} 
            slotType={slotType} 
            isLit={(equipment[slotType]?.set === activeSetName && activeSetName !== '') || (setBonusEquipmentSlots.includes(slotType) && equipment[slotType]?.set === activeSetName)}
            onOpenPicker={handleOpenPicker}
        />
    );
     const createWeaponSlot = (slotType: SlotType) => (
         <EquipmentSlot 
            item={equipment[slotType]} 
            slotType={slotType} 
            isLit={false}
            onOpenPicker={handleOpenPicker}
        />
    );

    return (
        <>
        {pickerState.anchorEl && (
            <EquipmentPickerPopover 
                anchorEl={pickerState.anchorEl}
                slotType={pickerState.slotType}
                onClose={handleClosePicker}
            />
        )}
        <div className="relative w-full max-w-xs mx-auto aspect-[3/4]">
             <img 
                src="https://files.catbox.moe/52m6tl.png" 
                alt="Character Equipment Background"
                className="absolute inset-0 w-full h-full object-cover opacity-40 rounded-lg"
             />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-1 md:gap-2 p-2">
                <div className="flex justify-center items-center"></div> 
                <div className="flex justify-center items-center">{createSlot('helmet')}</div>
                <div className="flex justify-center items-center"></div> 
                <div className="flex justify-center items-center">{createWeaponSlot('weapon')}</div>
                <div className="flex justify-center items-center">{createSlot('chest')}</div>
                <div className="flex justify-center items-center">{createWeaponSlot('shield')}</div>
                <div className="flex justify-center items-center">{createSlot('gloves')}</div>
                <div className="flex justify-center items-center">{createSlot('legs')}</div>
                <div className="flex justify-center items-center"></div>
                <div className="col-start-2 flex justify-center items-center">{createSlot('boots')}</div>
            </div>
        </div>
        </>
    );
};

export default PaperDoll;