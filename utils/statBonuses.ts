
import type { Skill, Stats, Equipment, Item } from '../types';

// Hangi mesleğin hangi stat'ı ne sıklıkla artıracağını tanımlar
export const bonusMap: Record<string, { stat: keyof Stats; levelPerPoint: number }> = {
    // Professions
    woodcutting: { stat: 'strength', levelPerPoint: 5 },
    mining: { stat: 'endurance', levelPerPoint: 5 },
    fishing: { stat: 'luck', levelPerPoint: 5 },
    hunting: { stat: 'agility', levelPerPoint: 5 },
    alchemy: { stat: 'charisma', levelPerPoint: 8 },
    smelting: { stat: 'strength', levelPerPoint: 8 },
    cooking: { stat: 'endurance', levelPerPoint: 8 },
    forge: { stat: 'tactics', levelPerPoint: 5 },
    
    // Passive Skills
    gathering: { stat: 'endurance', levelPerPoint: 10 },
    melee_combat: { stat: 'strength', levelPerPoint: 5 },
    ranged_combat: { stat: 'agility', levelPerPoint: 5 },
    intuition: { stat: 'luck', levelPerPoint: 5 },
    prowess: { stat: 'tactics', levelPerPoint: 5 }
};

// Her set için bonuslar ve gereken parça sayısı
export const setBonusConfig: Record<string, { pieces: number; bonus: Partial<Stats> }> = {
    worn: { pieces: 5, bonus: { endurance: 2 } },
    copper: { pieces: 5, bonus: { endurance: 3, strength: 1 } },
    iron: { pieces: 5, bonus: { endurance: 5, strength: 2 } },
    steel: { pieces: 5, bonus: { endurance: 7, tactics: 2 } },
    rom: { pieces: 5, bonus: { endurance: 10, luck: 3 } },
    ent: { pieces: 5, bonus: { endurance: 15, strength: 4, agility: 4 } },
    kingdom: { pieces: 5, bonus: { endurance: 20, strength: 6, agility: 6, tactics: 4, luck: 5 } },
};
// Set bonusu için sayılan ekipman türleri
export const setBonusEquipmentSlots: (keyof Equipment)[] = ['helmet', 'chest', 'legs', 'boots', 'gloves'];


/**
 * Verilen yetenek listesine göre pasif stat bonuslarını hesaplar.
 * @param skills Oyuncunun yetenek listesi.
 * @returns Stat bonuslarını içeren bir nesne.
 */
export const calculateProfessionBonuses = (skills: Skill[]): Partial<Stats> => {
    const bonuses: Partial<Stats> = {};

    for (const skill of skills) {
        const mapping = bonusMap[skill.id];
        if (mapping) {
            const bonusAmount = Math.floor(skill.level / mapping.levelPerPoint);
            if (bonusAmount > 0) {
                bonuses[mapping.stat] = (bonuses[mapping.stat] || 0) + bonusAmount;
            }
        }
    }
    return bonuses;
};

/**
 * Giyilen ekipmanlardan gelen stat bonuslarını hesaplar.
 * @param equipment Oyuncunun ekipman yuvaları.
 * @returns Stat bonuslarını içeren bir nesne.
 */
export const calculateEquipmentBonuses = (equipment: Equipment): Partial<Stats> => {
    const bonuses: Partial<Stats> = {};
    for (const slot in equipment) {
        const item = equipment[slot as keyof Equipment];
        if (item && item.stats) {
            for (const stat in item.stats) {
                const statKey = stat as keyof Stats;
                const value = item.stats[statKey];
                if (value) {
                    bonuses[statKey] = (bonuses[statKey] || 0) + value;
                }
            }
        }
    }
    return bonuses;
};

/**
 * Giyilen ekipmanlardan gelen set bonuslarını hesaplar.
 * @param equipment Oyuncunun ekipman yuvaları.
 * @returns Aktif set bonuslarını içeren bir nesne.
 */
export const calculateSetBonuses = (equipment: Equipment): Partial<Stats> => {
    const setCounts: Record<string, number> = {};
    
    // Sadece zırh parçalarını say
    for (const slot of setBonusEquipmentSlots) {
        const item = equipment[slot];
        if (item && item.set) {
            setCounts[item.set] = (setCounts[item.set] || 0) + 1;
        }
    }

    const activeBonuses: Partial<Stats> = {};
    for (const setName in setCounts) {
        const config = setBonusConfig[setName];
        if (config && setCounts[setName] >= config.pieces) {
            // Set bonusunu uygula
            for (const stat in config.bonus) {
                const statKey = stat as keyof Stats;
                const value = config.bonus[statKey];
                if (value) {
                    activeBonuses[statKey] = (activeBonuses[statKey] || 0) + value;
                }
            }
        }
    }
    
    return activeBonuses;
};
