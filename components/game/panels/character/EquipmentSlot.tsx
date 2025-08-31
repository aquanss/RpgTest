import React from 'react';
import type { Item, EquipmentSlot as SlotType, Stats } from '../../../../types';
import { rarityColors } from '../../../../utils/itemData';
import { useTranslation } from '../../../../App';

interface EquipmentSlotProps {
  item: Item | null;
  slotType: SlotType;
  isLit: boolean;
  onOpenPicker: (slotType: SlotType, target: HTMLDivElement) => void;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({ item, slotType, isLit, onOpenPicker }) => {
    const { t, tGame, tRarity } = useTranslation();

    const translatedItemName = item ? tGame('items', item.id, 'name', item.name) : '';
    const translatedDescription = item ? tGame('items', item.id, 'description', item.description || '') : '';
    const translatedSlotName = t(`slot_${slotType}` as any);

    const tooltipText = item ? translatedItemName : translatedSlotName;
    const itemRarityColor = item ? rarityColors[item.rarity] : 'var(--border-color)';
    
    const slotStateClasses = item 
        ? "bg-[var(--background-medium)] shadow-md" 
        : "bg-[var(--background-dark)]/60 shadow-inner";
        
    const borderColor = isLit ? 'var(--accent-gold)' : itemRarityColor;
    const shadow = isLit ? '0 0 8px var(--accent-gold)' : 'none';
    const iconTransform = slotType === 'weapon' ? 'rotate-6' : slotType === 'shield' ? '-rotate-6' : '';

    return (
        <div className="relative group aspect-square w-full">
             <div 
                onClick={(e) => onOpenPicker(slotType, e.currentTarget)}
                className={`w-full h-full rounded-lg border-2 flex items-center justify-center transition-all duration-200 group-hover:border-[var(--accent-gold)] ${slotStateClasses} cursor-pointer`}
                style={{ borderColor, boxShadow: shadow }}
             >
                {item ? (
                    <img src={item.icon} alt={item.name} className={`w-16 h-16 object-contain transition-transform duration-200 group-hover:scale-110 ${iconTransform}`} />
                ) : null}
             </div>
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max max-w-xs bg-[var(--background-dark)] text-white text-sm rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg z-20 text-center border border-[var(--border-color)]">
                <p className="font-bold" style={{ color: item ? itemRarityColor : 'white' }}>{tooltipText}</p>
                {item && <p className="text-xs text-[var(--text-secondary)] capitalize">{tRarity(item.rarity)}</p>}
                {translatedDescription && <p className="text-xs text-gray-400 italic mt-1">{translatedDescription}</p>}
                {item && item.stats && (
                    <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-left text-xs space-y-0.5">
                        {Object.entries(item.stats).map(([stat, value]) => (
                            <p key={stat} className="text-green-400">
                                +{value} {t(`stat_${stat}` as any)}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentSlot;