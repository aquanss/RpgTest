import type { LootDrop, Creature } from '../types';

export const creaturesByLocation: Record<string, Creature[]> = {
    'liman_kenti': [
        { 
            id: 'akrep', name: 'Akrep', icon: 'https://files.catbox.moe/2mseye.png', levelReq: 1, xp: 30, 
            lootTable: [
                { itemId: 'scorpion_stinger', chance: 0.75 },
                { itemId: 'scorpion_venom', chance: 0.35 },
            ]
        },
        { 
            id: 'sican', name: 'Sıçan', icon: 'https://files.catbox.moe/bhz9up.png', levelReq: 2, xp: 24, 
            lootTable: [
                { itemId: 'blood_clot', chance: 0.85 },
            ]
        },
        { 
            id: 'goblin', name: 'Goblin', icon: 'https://files.catbox.moe/425zke.png', levelReq: 4, xp: 42, 
            lootTable: [
                { itemId: 'goblin_totem', chance: 0.55 },
                { itemId: 'dirty_coin', chance: 0.25 },
                { itemId: 'rusty_iron_piece', chance: 0.15 },
                { itemId: 'bone_particles', chance: 0.15 },
                { itemId: 'basic_health_potion', chance: 0.12 },
                { itemId: 'oz_tozu', chance: 0.04 },
            ]
        },
        { 
            id: 'yilan', name: 'Yılan', icon: 'https://files.catbox.moe/q7dn3q.png', levelReq: 5, xp: 48, 
            lootTable: [
                { itemId: 'snake_skin', chance: 0.65 },
                { itemId: 'poison_sac', chance: 0.45 },
            ]
        },
        { 
            id: 'azili_haydut', name: 'Azılı Haydut', icon: 'https://files.catbox.moe/iqow7m.png', levelReq: 5, xp: 60, 
            lootTable: [
                { itemId: 'torn_map_piece', chance: 0.75 },
                { itemId: 'rusty_iron_piece', chance: 0.35 },
                { itemId: 'basic_health_potion', chance: 0.18 },
            ]
        }
    ],
    'sof_kasabasi': [
        { 
            id: 'tavuk', name: 'Tavuk', icon: 'https://files.catbox.moe/pq0h8r.png', levelReq: 6, xp: 58, 
            lootTable: [
                { itemId: 'chicken_meat', chance: 0.50 },
                { itemId: 'chicken_feather', chance: 0.30 },
                { itemId: 'chicken_egg', chance: 0.10 },
                { itemId: 'healing_herb', chance: 0.10 },
            ]
        },
        { 
            id: 'domuz', name: 'Domuz', icon: 'https://files.catbox.moe/mx13xa.png', levelReq: 6, xp: 70, 
            lootTable: [
                { itemId: 'healing_herb', chance: 0.80 },
            ]
        },
        { 
            id: 'fare', name: 'Fare', icon: 'https://files.catbox.moe/bs3sbh.png', levelReq: 7, xp: 65, 
            lootTable: [
                { itemId: 'blood_clot', chance: 0.60 },
                { itemId: 'bone_particles', chance: 0.40 },
            ]
        },
        { 
            id: 'ayi', name: 'Ayı', icon: 'https://files.catbox.moe/j1onfl.png', levelReq: 8, xp: 95, 
            lootTable: [
                { itemId: 'bear_pelt', chance: 0.60 },
                { itemId: 'blood_clot', chance: 0.40 },
                { itemId: 'basic_health_potion', chance: 0.12 },
                { itemId: 'recipe_book_rom_shield', chance: 0.004 },
            ]
        },
         { 
            id: 'inek', name: 'İnek', icon: 'https://files.catbox.moe/hbnicz.png', levelReq: 9, xp: 80, 
            lootTable: [
                { itemId: 'raw_cow_meat', chance: 0.50 },
                { itemId: 'healing_herb', chance: 0.50 },
            ]
        },
        { 
            id: 'geyik_rom', name: 'Geyik', icon: 'https://files.catbox.moe/3ll055.png', levelReq: 10, xp: 105, 
            lootTable: [
                { itemId: 'deer_horn', chance: 0.40 },
                { itemId: 'deer_meat', chance: 0.30 },
                { itemId: 'deer_pelt', chance: 0.20 },
                { itemId: 'healing_herb', chance: 0.10 },
                { itemId: 'recipe_book_rom_legs', chance: 0.004 },
                { itemId: 'recipe_book_rom_boots', chance: 0.004 },
            ]
        },
        { 
            id: 'yaban_domuzu_rom', name: 'Yaban Domuzu', icon: 'https://files.catbox.moe/pmx3nx.png', levelReq: 12, xp: 130, 
            lootTable: [
                { itemId: 'raw_boar_meat', chance: 0.50 },
                { itemId: 'boar_pelt', chance: 0.50 },
                { itemId: 'ivory', chance: 0.30 },
                { itemId: 'healing_herb', chance: 0.20 },
                { itemId: 'basic_health_potion', chance: 0.15 },
                { itemId: 'recipe_book_rom_helmet', chance: 0.004 },
                { itemId: 'recipe_book_rom_chest', chance: 0.004 },
                { itemId: 'recipe_book_rom_gloves', chance: 0.004 },
                { itemId: 'recipe_book_rom_sword', chance: 0.0025 },
                { itemId: 'recipe_book_rom_bow', chance: 0.0025 },
            ]
        }
    ],
    'krallar_sehri': [ // This ID maps to "Kimsesizler Bölgesi"
        { 
            id: 'yarasa', name: 'Yarasa', icon: 'https://files.catbox.moe/65kq7u.png', levelReq: 15, xp: 120, 
            lootTable: [
                { itemId: 'bat_wing', chance: 0.50 },
                { itemId: 'blood_clot', chance: 0.50 },
                { itemId: 'ruh_tozu', chance: 0.05 },
            ]
        },
        { 
            id: 'kacak_avci', name: 'Kaçak Avcı', icon: 'https://files.catbox.moe/qsc5iq.png', levelReq: 17, xp: 155, 
            lootTable: [
                { itemId: 'bone_particles', chance: 0.40 },
                { itemId: 'rusty_iron_piece', chance: 0.30 },
                { itemId: 'blood_clot', chance: 0.30 },
                { itemId: 'greater_health_potion', chance: 0.05 },
                { itemId: 'lanet_tozu', chance: 0.25 },
                { itemId: 'recipe_book_ent_boots', chance: 0.003 },
                { itemId: 'recipe_book_ent_gloves', chance: 0.003 },
            ]
        },
        { 
            id: 'kimsesiz_haydut', name: 'Kimsesiz Haydut', icon: 'https://files.catbox.moe/3e8qb6.png', levelReq: 18, xp: 165, 
            lootTable: [
                { itemId: 'dirty_coin', chance: 0.50 },
                { itemId: 'bone_particles', chance: 0.30 },
                { itemId: 'rusty_iron_piece', chance: 0.20 },
                { itemId: 'ruh_esansi', chance: 0.08 },
                { itemId: 'greater_health_potion', chance: 0.07 },
                { itemId: 'recipe_book_ent_helmet', chance: 0.003 },
                { itemId: 'recipe_book_ent_legs', chance: 0.003 },
            ]
        },
        { 
            id: 'dev_orumcek', name: 'Dev Örümcek', icon: 'https://files.catbox.moe/cmokel.png', levelReq: 20, xp: 215, 
            lootTable: [
                { itemId: 'spider_web', chance: 0.9 },
                { itemId: 'oz_tozu', chance: 0.15 },
                { itemId: 'recipe_book_ent_chest', chance: 0.003 },
                { itemId: 'recipe_book_ent_shield', chance: 0.003 },
                { itemId: 'recipe_book_ent_sword', chance: 0.0015 },
                { itemId: 'recipe_book_ent_bow', chance: 0.0015 },
            ]
        }
    ],
    'donmuslar': [ // This ID maps to "Krallar Şehri"
        { 
            id: 'geyik_kral', name: 'Geyik', icon: 'https://files.catbox.moe/3ll055.png', levelReq: 25, xp: 200, 
            lootTable: [
                { itemId: 'deer_horn', chance: 0.40 },
                { itemId: 'deer_meat', chance: 0.30 },
                { itemId: 'deer_pelt', chance: 0.20 },
                { itemId: 'healing_herb', chance: 0.10 },
            ]
        },
        { 
            id: 'yaban_domuzu_kral', name: 'Yaban Domuzu', icon: 'https://files.catbox.moe/pmx3nx.png', levelReq: 26, xp: 225, 
            lootTable: [
                { itemId: 'boar_pelt', chance: 0.50 },
                { itemId: 'ivory', chance: 0.30 },
                { itemId: 'healing_herb', chance: 0.20 },
            ]
        },
        { 
            id: 'kral_kurt', name: 'Kral Kurt', icon: 'https://files.catbox.moe/esz9bf.png', levelReq: 27, xp: 260, 
            lootTable: [
                { itemId: 'wolf_pelt', chance: 0.60 },
                { itemId: 'blood_clot', chance: 0.40 },
                { itemId: 'ruh_esansi', chance: 0.12 },
                { itemId: 'greater_health_potion', chance: 0.10 },
                { itemId: 'recipe_book_kingdom_boots', chance: 0.002 },
                { itemId: 'recipe_book_kingdom_gloves', chance: 0.002 },
            ]
        },
        { 
            id: 'griffon', name: 'Griffon', icon: 'https://files.catbox.moe/kvnfk9.png', levelReq: 28, xp: 330, 
            lootTable: [
                { itemId: 'griffon_feather', chance: 0.60 },
                { itemId: 'sharp_claw', chance: 0.40 },
                { itemId: 'ruh_esansi', chance: 0.15 },
                { itemId: 'greater_health_potion', chance: 0.12 },
                { itemId: 'recipe_book_kingdom_helmet', chance: 0.002 },
                { itemId: 'recipe_book_kingdom_legs', chance: 0.002 },
            ]
        },
        { 
            id: 'goblin_krali', name: 'Goblin Kralı', icon: 'https://files.catbox.moe/2r1b6j.png', levelReq: 30, xp: 420, 
            lootTable: [
                { itemId: 'dirty_coin', chance: 0.40 },
                { itemId: 'goblin_totem', chance: 0.20 },
                { itemId: 'goblin_king_crown', chance: 0.30 },
                { itemId: 'rusty_iron_piece', chance: 0.10 },
                { itemId: 'greater_health_potion', chance: 0.30 },
                { itemId: 'ruh_esansi', chance: 0.20 },
                { itemId: 'lanet_tozu', chance: 0.40 },
                { itemId: 'oz_tozu', chance: 0.20 },
                { itemId: 'ruh_tozu', chance: 0.15 },
                { itemId: 'recipe_book_kingdom_chest', chance: 0.002 },
                { itemId: 'recipe_book_kingdom_shield', chance: 0.002 },
                { itemId: 'recipe_book_kingdom_sword', chance: 0.0008 },
                { itemId: 'recipe_book_kingdom_bow', chance: 0.0008 },
            ]
        }
    ]
};