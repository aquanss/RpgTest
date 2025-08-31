import { GameState, Item, GatherableResource, MapRegion, CraftingRecipe } from '../types';
import { itemDatabase } from './itemData';

const initialEquipment = {
    helmet: null,
    chest: null,
    legs: null,
    boots: null,
    weapon: { ...itemDatabase['starter_sword'], quantity: 1 },
    shield: null,
    gloves: null,
};

// --- GATHERABLE RESOURCES DATA ---
const woodcuttingResources: GatherableResource[] = [
    { id: 'oak_log', name: 'Meşe Odunu', levelReq: 1, xp: 2, icon: 'https://files.catbox.moe/bqezuv.png', itemId: 'oak_log', timeToGather: 10000 },
    { id: 'acacia_log', name: 'Akasya Odunu', levelReq: 5, xp: 3, icon: 'https://files.catbox.moe/bndym9.png', itemId: 'acacia_log', timeToGather: 16000 },
    { id: 'ebony_log', name: 'Abanoz Odunu', levelReq: 15, xp: 6, icon: 'https://files.catbox.moe/nvqdwf.png', itemId: 'ebony_log', timeToGather: 22000 },
    { id: 'birch_log', name: 'Huş Odunu', levelReq: 30, xp: 8, icon: 'https://files.catbox.moe/9x3dsr.png', itemId: 'birch_log', timeToGather: 28000 },
    { id: 'bloodwood_log', name: 'Kan Odunu', levelReq: 40, xp: 12, icon: 'https://files.catbox.moe/4mxfdv.png', itemId: 'bloodwood_log', timeToGather: 38000 },
    { id: 'enchanted_log', name: 'Efsunlu Odun', levelReq: 50, xp: 18, icon: 'https://files.catbox.moe/on04oo.png', itemId: 'enchanted_log', timeToGather: 52000 },
    { id: 'dragontree_log', name: 'Ejderha Ağacı Odunu', levelReq: 70, xp: 28, icon: 'https://files.catbox.moe/vl81ik.png', itemId: 'dragontree_log', timeToGather: 60000 },
    { id: 'mystic_log', name: 'Mistik Odun', levelReq: 80, xp: 45, icon: 'https://files.catbox.moe/b99lgn.png', itemId: 'mystic_log', timeToGather: 70000 },
];

const miningResources: GatherableResource[] = [
    { id: 'stone', name: 'Taş', levelReq: 1, xp: 1, icon: 'https://files.catbox.moe/v18l2q.png', itemId: 'stone', timeToGather: 6000 },
    { id: 'coal', name: 'Kömür', levelReq: 5, xp: 2, icon: 'https://files.catbox.moe/15muc6.png', itemId: 'coal', timeToGather: 10000 },
    { id: 'copper_ore', name: 'Bakır Cevheri', levelReq: 10, xp: 4, icon: 'https://files.catbox.moe/hlgk8e.png', itemId: 'copper_ore', timeToGather: 18000 },
    { id: 'iron_ore', name: 'Demir Cevheri', levelReq: 20, xp: 7, icon: 'https://files.catbox.moe/6e2j38.png', itemId: 'iron_ore', timeToGather: 30000 },
    { id: 'steel_ore', name: 'Çelik Cevheri', levelReq: 30, xp: 11, icon: 'https://files.catbox.moe/5e8csk.png', itemId: 'steel_ore', timeToGather: 45000 },
    { id: 'rom_ore', name: 'Rom Cevheri', levelReq: 45, xp: 18, icon: 'https://files.catbox.moe/3gvwvg.png', itemId: 'rom_ore', timeToGather: 68000 },
    { id: 'ent_ore', name: 'Ent Cevheri', levelReq: 60, xp: 25, icon: 'https://files.catbox.moe/q0s08z.png', itemId: 'ent_ore', timeToGather: 95000 },
    { id: 'kingdom_ore', name: 'Krallık Cevheri', levelReq: 75, xp: 40, icon: 'https://files.catbox.moe/071w7i.png', itemId: 'kingdom_ore', timeToGather: 145000 },
];

export const rareFishingResources: { itemId: string; chance: number }[] = [
    { itemId: 'cursed_fish', chance: 0.001 }, // 1 in 1000 for Epic
];

export const rareWoodcuttingResources: { itemId: string; chance: number }[] = [];

const fishingResources: GatherableResource[] = [
    { id: 'trout', name: 'Alabalık', levelReq: 1, xp: 2, icon: 'https://files.catbox.moe/di34wx.png', itemId: 'raw_trout', timeToGather: 7000 },
    { id: 'herring', name: 'Ringa Balığı', levelReq: 5, xp: 2, icon: 'https://files.catbox.moe/hlfl0k.png', itemId: 'raw_herring', timeToGather: 12000 },
    { id: 'tuna', name: 'Ton Balığı', levelReq: 10, xp: 4, icon: 'https://files.catbox.moe/wvajri.png', itemId: 'raw_tuna', timeToGather: 17000 },
    { id: 'cod', name: 'Morina', levelReq: 20, xp: 6, icon: 'https://files.catbox.moe/y7b55m.png', itemId: 'raw_cod', timeToGather: 25000 },
    { id: 'sea_bass', name: 'Levrek', levelReq: 30, xp: 8, icon: 'https://files.catbox.moe/2c3kop.png', itemId: 'raw_sea_bass', timeToGather: 34000 },
    { id: 'salmon', name: 'Somon', levelReq: 40, xp: 11, icon: 'https://files.catbox.moe/ugsdst.png', itemId: 'raw_salmon', timeToGather: 45000 },
    { id: 'crab', name: 'Yengeç', levelReq: 50, xp: 15, icon: 'https://files.catbox.moe/smxw0d.png', itemId: 'raw_crab', timeToGather: 62000 },
];

export const skillResourceMap: Record<string, GatherableResource[]> = {
    woodcutting: woodcuttingResources,
    mining: miningResources,
    fishing: fishingResources,
};

const smeltingRecipes: CraftingRecipe[] = [
    { id: 'copper_bar', name: 'Bakır Külçesi', outputId: 'copper_bar', outputQuantity: 1, levelReq: 1, xp: 3, timeToCraft: 7000, ingredients: [{ itemId: 'copper_ore', quantity: 1 }, { itemId: 'coal', quantity: 1 }], icon: itemDatabase['copper_bar'].icon },
    { id: 'iron_bar', name: 'Demir Külçesi', outputId: 'iron_bar', outputQuantity: 1, levelReq: 20, xp: 8, timeToCraft: 12000, ingredients: [{ itemId: 'iron_ore', quantity: 1 }, { itemId: 'coal', quantity: 1 }], icon: itemDatabase['iron_bar'].icon },
    { id: 'steel_bar', name: 'Çelik Külçesi', outputId: 'steel_bar', outputQuantity: 1, levelReq: 30, xp: 12, timeToCraft: 17000, ingredients: [{ itemId: 'steel_ore', quantity: 1 }, { itemId: 'coal', quantity: 2 }], icon: itemDatabase['steel_bar'].icon },
    { id: 'rom_bar', name: 'Rom Külçesi', outputId: 'rom_bar', outputQuantity: 1, levelReq: 45, xp: 18, timeToCraft: 25000, ingredients: [{ itemId: 'rom_ore', quantity: 1 }, { itemId: 'coal', quantity: 2 }], icon: itemDatabase['rom_bar'].icon },
    { id: 'ent_bar', name: 'Ent Külçesi', outputId: 'ent_bar', outputQuantity: 1, levelReq: 60, xp: 26, timeToCraft: 34000, ingredients: [{ itemId: 'ent_ore', quantity: 1 }, { itemId: 'coal', quantity: 2 }], icon: itemDatabase['ent_bar'].icon },
    { id: 'kingdom_bar', name: 'Krallık Külçesi', outputId: 'kingdom_bar', outputQuantity: 1, levelReq: 75, xp: 45, timeToCraft: 50000, ingredients: [{ itemId: 'kingdom_ore', quantity: 1 }, { itemId: 'coal', quantity: 2 }], icon: itemDatabase['kingdom_bar'].icon },
];

const forgeRecipes: CraftingRecipe[] = [
    // TIER 1: Worn / Starter
    { id: 'craft_worn_helmet', name: 'Eskipüskü Başlık', outputId: 'worn_helmet', outputQuantity: 1, levelReq: 1, xp: 4, timeToCraft: 10000, ingredients: [{ itemId: 'stone', quantity: 10 }], icon: itemDatabase['worn_helmet'].icon },
    { id: 'craft_worn_chest', name: 'Eskipüskü Göğüslük', outputId: 'worn_chest', outputQuantity: 1, levelReq: 1, xp: 6, timeToCraft: 15000, ingredients: [{ itemId: 'stone', quantity: 15 }], icon: itemDatabase['worn_chest'].icon },
    { id: 'craft_worn_legs', name: 'Dermeçatma Pantolon', outputId: 'worn_legs', outputQuantity: 1, levelReq: 1, xp: 5, timeToCraft: 12000, ingredients: [{ itemId: 'stone', quantity: 12 }], icon: itemDatabase['worn_legs'].icon },
    { id: 'craft_worn_gloves', name: 'Yırtılmış Eldiven', outputId: 'worn_gloves', outputQuantity: 1, levelReq: 1, xp: 2, timeToCraft: 8000, ingredients: [{ itemId: 'stone', quantity: 8 }], icon: itemDatabase['worn_gloves'].icon },
    { id: 'craft_worn_boots', name: 'Eskipüskü Bot', outputId: 'worn_boots', outputQuantity: 1, levelReq: 1, xp: 2, timeToCraft: 8000, ingredients: [{ itemId: 'stone', quantity: 8 }], icon: itemDatabase['worn_boots'].icon },
    { id: 'craft_worn_shield', name: 'Eskimiş Kalkan', outputId: 'worn_shield', outputQuantity: 1, levelReq: 1, xp: 4, timeToCraft: 11000, ingredients: [{ itemId: 'stone', quantity: 10 }, { itemId: 'oak_log', quantity: 5 }], icon: itemDatabase['worn_shield'].icon },
    { id: 'craft_starter_sword', name: 'Acemi Kılıcı', outputId: 'starter_sword', outputQuantity: 1, levelReq: 1, xp: 4, timeToCraft: 10000, ingredients: [{ itemId: 'oak_log', quantity: 10 }], icon: itemDatabase['starter_sword'].icon },
    { id: 'craft_starter_bow', name: 'Acemi Yayı', outputId: 'starter_bow', outputQuantity: 1, levelReq: 1, xp: 4, timeToCraft: 10000, ingredients: [{ itemId: 'oak_log', quantity: 10 }], icon: itemDatabase['starter_bow'].icon },
    
    // Tools
    { id: 'craft_worn_pickaxe', name: 'Eskipüskü Kazma', outputId: 'worn_pickaxe', outputQuantity: 1, levelReq: 1, xp: 4, timeToCraft: 10000, ingredients: [{ itemId: 'stone', quantity: 5 }, { itemId: 'oak_log', quantity: 2 }], icon: itemDatabase['worn_pickaxe'].icon },
    { id: 'craft_worn_axe', name: 'Eskipüskü Balta', outputId: 'worn_axe', outputQuantity: 1, levelReq: 1, xp: 4, timeToCraft: 10000, ingredients: [{ itemId: 'stone', quantity: 5 }, { itemId: 'oak_log', quantity: 2 }], icon: itemDatabase['worn_axe'].icon },
    { id: 'craft_aged_rod', name: 'Yıllanmış Olta', outputId: 'aged_fishing_rod', outputQuantity: 1, levelReq: 1, xp: 5, timeToCraft: 12000, ingredients: [{ itemId: 'oak_log', quantity: 5 }], icon: itemDatabase['aged_fishing_rod'].icon },

    // TIER 2: Copper
    { id: 'craft_copper_helmet', name: 'Bakır Başlık', outputId: 'copper_helmet', outputQuantity: 1, levelReq: 5, xp: 9, timeToCraft: 22000, ingredients: [{ itemId: 'copper_bar', quantity: 8 }, { itemId: 'oak_log', quantity: 5 }], icon: itemDatabase['copper_helmet'].icon },
    { id: 'craft_copper_chest', name: 'Bakır Göğüslük', outputId: 'copper_chest', outputQuantity: 1, levelReq: 7, xp: 15, timeToCraft: 33000, ingredients: [{ itemId: 'copper_bar', quantity: 15 }, { itemId: 'oak_log', quantity: 10 }], icon: itemDatabase['copper_chest'].icon },
    { id: 'craft_copper_legs', name: 'Bakır Pantolon', outputId: 'copper_legs', outputQuantity: 1, levelReq: 6, xp: 11, timeToCraft: 28000, ingredients: [{ itemId: 'copper_bar', quantity: 12 }, { itemId: 'oak_log', quantity: 8 }], icon: itemDatabase['copper_legs'].icon },
    { id: 'craft_copper_gloves', name: 'Bakır Eldiven', outputId: 'copper_gloves', outputQuantity: 1, levelReq: 5, xp: 7, timeToCraft: 17000, ingredients: [{ itemId: 'copper_bar', quantity: 6 }, { itemId: 'oak_log', quantity: 4 }], icon: itemDatabase['copper_gloves'].icon },
    { id: 'craft_copper_boots', name: 'Bakır Bot', outputId: 'copper_boots', outputQuantity: 1, levelReq: 5, xp: 7, timeToCraft: 17000, ingredients: [{ itemId: 'copper_bar', quantity: 6 }, { itemId: 'oak_log', quantity: 4 }], icon: itemDatabase['copper_boots'].icon },
    { id: 'craft_copper_shield', name: 'Bakır Kalkan', outputId: 'copper_shield', outputQuantity: 1, levelReq: 6, xp: 10, timeToCraft: 24000, ingredients: [{ itemId: 'copper_bar', quantity: 10 }, { itemId: 'oak_log', quantity: 15 }], icon: itemDatabase['copper_shield'].icon },
    { id: 'craft_copper_sword', name: 'Bakır Kılıç', outputId: 'copper_sword', outputQuantity: 1, levelReq: 8, xp: 14, timeToCraft: 31000, ingredients: [{ itemId: 'copper_bar', quantity: 12 }, { itemId: 'acacia_log', quantity: 5 }], icon: itemDatabase['copper_sword'].icon },
    { id: 'craft_copper_bow', name: 'Bakır Yay', outputId: 'copper_bow', outputQuantity: 1, levelReq: 8, xp: 14, timeToCraft: 31000, ingredients: [{ itemId: 'copper_bar', quantity: 8 }, { itemId: 'acacia_log', quantity: 15 }], icon: itemDatabase['copper_bow'].icon },
    
    // TIER 3: Iron
    { id: 'craft_iron_helmet', name: 'Demir Başlık', outputId: 'iron_helmet', outputQuantity: 1, levelReq: 15, xp: 18, timeToCraft: 45000, ingredients: [{ itemId: 'iron_bar', quantity: 16 }, { itemId: 'copper_bar', quantity: 6 }, { itemId: 'blood_clot', quantity: 5 }], icon: itemDatabase['iron_helmet'].icon },
    { id: 'craft_iron_chest', name: 'Demir Göğüslük', outputId: 'iron_chest', outputQuantity: 1, levelReq: 17, xp: 30, timeToCraft: 66000, ingredients: [{ itemId: 'iron_bar', quantity: 28 }, { itemId: 'copper_bar', quantity: 12 }, { itemId: 'blood_clot', quantity: 10 }], icon: itemDatabase['iron_chest'].icon },
    { id: 'craft_iron_legs', name: 'Demir Pantolon', outputId: 'iron_legs', outputQuantity: 1, levelReq: 16, xp: 24, timeToCraft: 55000, ingredients: [{ itemId: 'iron_bar', quantity: 22 }, { itemId: 'copper_bar', quantity: 9 }, { itemId: 'blood_clot', quantity: 8 }], icon: itemDatabase['iron_legs'].icon },
    { id: 'craft_iron_gloves', name: 'Demir Eldiven', outputId: 'iron_gloves', outputQuantity: 1, levelReq: 15, xp: 12, timeToCraft: 33000, ingredients: [{ itemId: 'iron_bar', quantity: 12 }, { itemId: 'copper_bar', quantity: 5 }, { itemId: 'blood_clot', quantity: 4 }], icon: itemDatabase['iron_gloves'].icon },
    { id: 'craft_iron_boots', name: 'Demir Bot', outputId: 'iron_boots', outputQuantity: 1, levelReq: 15, xp: 12, timeToCraft: 33000, ingredients: [{ itemId: 'iron_bar', quantity: 12 }, { itemId: 'copper_bar', quantity: 5 }, { itemId: 'blood_clot', quantity: 4 }], icon: itemDatabase['iron_boots'].icon },
    { id: 'craft_iron_shield', name: 'Demir Kalkan', outputId: 'iron_shield', outputQuantity: 1, levelReq: 16, xp: 20, timeToCraft: 50000, ingredients: [{ itemId: 'iron_bar', quantity: 20 }, { itemId: 'copper_bar', quantity: 10 }, { itemId: 'acacia_log', quantity: 20 }], icon: itemDatabase['iron_shield'].icon },
    { id: 'craft_iron_sword', name: 'Demir Kılıç', outputId: 'iron_sword', outputQuantity: 1, levelReq: 18, xp: 26, timeToCraft: 60000, ingredients: [{ itemId: 'iron_bar', quantity: 24 }, { itemId: 'copper_bar', quantity: 12 }, { itemId: 'acacia_log', quantity: 10 }], icon: itemDatabase['iron_sword'].icon },
    { id: 'craft_iron_bow', name: 'Demir Yay', outputId: 'iron_bow', outputQuantity: 1, levelReq: 18, xp: 26, timeToCraft: 60000, ingredients: [{ itemId: 'iron_bar', quantity: 18 }, { itemId: 'copper_bar', quantity: 7 }, { itemId: 'ebony_log', quantity: 20 }], icon: itemDatabase['iron_bow'].icon },
    
    // TIER 4: Steel
    { id: 'craft_steel_helmet', name: 'Çelik Başlık', outputId: 'steel_helmet', outputQuantity: 1, levelReq: 25, xp: 35, timeToCraft: 88000, ingredients: [{ itemId: 'steel_bar', quantity: 28 }, { itemId: 'iron_bar', quantity: 12 }, { itemId: 'spider_web', quantity: 6 }], icon: itemDatabase['steel_helmet'].icon },
    { id: 'craft_steel_chest', name: 'Çelik Göğüslük', outputId: 'steel_chest', outputQuantity: 1, levelReq: 27, xp: 60, timeToCraft: 132000, ingredients: [{ itemId: 'steel_bar', quantity: 45 }, { itemId: 'iron_bar', quantity: 18 }, { itemId: 'spider_web', quantity: 12 }], icon: itemDatabase['steel_chest'].icon },
    { id: 'craft_steel_legs', name: 'Çelik Pantolon', outputId: 'steel_legs', outputQuantity: 1, levelReq: 26, xp: 48, timeToCraft: 110000, ingredients: [{ itemId: 'steel_bar', quantity: 38 }, { itemId: 'iron_bar', quantity: 15 }, { itemId: 'spider_web', quantity: 9 }], icon: itemDatabase['steel_legs'].icon },
    { id: 'craft_steel_gloves', name: 'Çelik Eldiven', outputId: 'steel_gloves', outputQuantity: 1, levelReq: 25, xp: 24, timeToCraft: 66000, ingredients: [{ itemId: 'steel_bar', quantity: 22 }, { itemId: 'iron_bar', quantity: 10 }, { itemId: 'spider_web', quantity: 5 }], icon: itemDatabase['steel_gloves'].icon },
    { id: 'craft_steel_boots', name: 'Çelik Bot', outputId: 'steel_boots', outputQuantity: 1, levelReq: 25, xp: 24, timeToCraft: 66000, ingredients: [{ itemId: 'steel_bar', quantity: 22 }, { itemId: 'iron_bar', quantity: 10 }, { itemId: 'spider_web', quantity: 5 }], icon: itemDatabase['steel_boots'].icon },
    { id: 'craft_steel_shield', name: 'Çelik Kalkan', outputId: 'steel_shield', outputQuantity: 1, levelReq: 26, xp: 42, timeToCraft: 99000, ingredients: [{ itemId: 'steel_bar', quantity: 34 }, { itemId: 'iron_bar', quantity: 18 }, { itemId: 'ebony_log', quantity: 30 }], icon: itemDatabase['steel_shield'].icon },
    { id: 'craft_steel_sword', name: 'Çelik Kılıç', outputId: 'steel_sword', outputQuantity: 1, levelReq: 28, xp: 52, timeToCraft: 120000, ingredients: [{ itemId: 'steel_bar', quantity: 40 }, { itemId: 'iron_bar', quantity: 22 }, { itemId: 'ebony_log', quantity: 20 }], icon: itemDatabase['steel_sword'].icon },
    { id: 'craft_steel_bow', name: 'Çelik Yay', outputId: 'steel_bow', outputQuantity: 1, levelReq: 28, xp: 52, timeToCraft: 120000, ingredients: [{ itemId: 'steel_bar', quantity: 35 }, { itemId: 'iron_bar', quantity: 12 }, { itemId: 'birch_log', quantity: 30 }], icon: itemDatabase['steel_bow'].icon },
    
    // TIER 5: Rom
    { id: 'craft_rom_helmet', name: 'Rom Başlığı', outputId: 'rom_helmet', outputQuantity: 1, levelReq: 35, xp: 70, timeToCraft: 175000, ingredients: [{ itemId: 'rom_bar', quantity: 38 }, { itemId: 'steel_bar', quantity: 18 }, { itemId: 'rusty_iron_piece', quantity: 12 }, { itemId: 'recipe_book_rom_helmet', quantity: 1 }], icon: itemDatabase['rom_helmet'].icon },
    { id: 'craft_rom_chest', name: 'Rom Göğüslük', outputId: 'rom_chest', outputQuantity: 1, levelReq: 37, xp: 118, timeToCraft: 260000, ingredients: [{ itemId: 'rom_bar', quantity: 55 }, { itemId: 'steel_bar', quantity: 28 }, { itemId: 'rusty_iron_piece', quantity: 22 }, { itemId: 'recipe_book_rom_chest', quantity: 1 }], icon: itemDatabase['rom_chest'].icon },
    { id: 'craft_rom_legs', name: 'Rom Pantolon', outputId: 'rom_legs', outputQuantity: 1, levelReq: 36, xp: 94, timeToCraft: 220000, ingredients: [{ itemId: 'rom_bar', quantity: 48 }, { itemId: 'steel_bar', quantity: 24 }, { itemId: 'rusty_iron_piece', quantity: 18 }, { itemId: 'recipe_book_rom_legs', quantity: 1 }], icon: itemDatabase['rom_legs'].icon },
    { id: 'craft_rom_gloves', name: 'Rom Eldiveni', outputId: 'rom_gloves', outputQuantity: 1, levelReq: 35, xp: 48, timeToCraft: 132000, ingredients: [{ itemId: 'rom_bar', quantity: 33 }, { itemId: 'steel_bar', quantity: 12 }, { itemId: 'rusty_iron_piece', quantity: 10 }, { itemId: 'recipe_book_rom_gloves', quantity: 1 }], icon: itemDatabase['rom_gloves'].icon },
    { id: 'craft_rom_boots', name: 'Rom Ayakkabısı', outputId: 'rom_boots', outputQuantity: 1, levelReq: 35, xp: 48, timeToCraft: 132000, ingredients: [{ itemId: 'rom_bar', quantity: 33 }, { itemId: 'steel_bar', quantity: 12 }, { itemId: 'rusty_iron_piece', quantity: 10 }, { itemId: 'recipe_book_rom_boots', quantity: 1 }], icon: itemDatabase['rom_boots'].icon },
    { id: 'craft_rom_shield', name: 'Rom Kalkanı', outputId: 'rom_shield', outputQuantity: 1, levelReq: 36, xp: 82, timeToCraft: 195000, ingredients: [{ itemId: 'rom_bar', quantity: 44 }, { itemId: 'steel_bar', quantity: 22 }, { itemId: 'birch_log', quantity: 40 }, { itemId: 'recipe_book_rom_shield', quantity: 1 }], icon: itemDatabase['rom_shield'].icon },
    { id: 'craft_rom_sword', name: 'Rom Kılıcı', outputId: 'rom_sword', outputQuantity: 1, levelReq: 38, xp: 105, timeToCraft: 240000, ingredients: [{ itemId: 'rom_bar', quantity: 55 }, { itemId: 'steel_bar', quantity: 28 }, { itemId: 'rusty_iron_piece', quantity: 28 }, { itemId: 'birch_log', quantity: 25 }, { itemId: 'recipe_book_rom_sword', quantity: 1 }], icon: itemDatabase['rom_sword'].icon },
    { id: 'craft_rom_bow', name: 'Rom Yayı', outputId: 'rom_bow', outputQuantity: 1, levelReq: 38, xp: 105, timeToCraft: 240000, ingredients: [{ itemId: 'rom_bar', quantity: 50 }, { itemId: 'steel_bar', quantity: 18 }, { itemId: 'bloodwood_log', quantity: 40 }, { itemId: 'recipe_book_rom_bow', quantity: 1 }], icon: itemDatabase['rom_bow'].icon },
    
    // TIER 6: Ent
    { id: 'craft_ent_helmet', name: 'Ent Başlık', outputId: 'ent_helmet', outputQuantity: 1, levelReq: 45, xp: 135, timeToCraft: 350000, ingredients: [{ itemId: 'ent_bar', quantity: 60 }, { itemId: 'rom_bar', quantity: 30 }, { itemId: 'bone_particles', quantity: 18 }, { itemId: 'recipe_book_ent_helmet', quantity: 1 }], icon: itemDatabase['ent_helmet'].icon },
    { id: 'craft_ent_chest', name: 'Ent Göğüslük', outputId: 'ent_chest', outputQuantity: 1, levelReq: 47, xp: 220, timeToCraft: 525000, ingredients: [{ itemId: 'ent_bar', quantity: 82 }, { itemId: 'rom_bar', quantity: 40 }, { itemId: 'bone_particles', quantity: 28 }, { itemId: 'recipe_book_ent_chest', quantity: 1 }], icon: itemDatabase['ent_chest'].icon },
    { id: 'craft_ent_legs', name: 'Ent Pantolon', outputId: 'ent_legs', outputQuantity: 1, levelReq: 46, xp: 180, timeToCraft: 440000, ingredients: [{ itemId: 'ent_bar', quantity: 70 }, { itemId: 'rom_bar', quantity: 35 }, { itemId: 'bone_particles', quantity: 22 }, { itemId: 'recipe_book_ent_legs', quantity: 1 }], icon: itemDatabase['ent_legs'].icon },
    { id: 'craft_ent_gloves', name: 'Ent Eldiveni', outputId: 'ent_gloves', outputQuantity: 1, levelReq: 45, xp: 90, timeToCraft: 265000, ingredients: [{ itemId: 'ent_bar', quantity: 50 }, { itemId: 'rom_bar', quantity: 22 }, { itemId: 'bone_particles', quantity: 12 }, { itemId: 'recipe_book_ent_gloves', quantity: 1 }], icon: itemDatabase['ent_gloves'].icon },
    { id: 'craft_ent_boots', name: 'Ent Bot', outputId: 'ent_boots', outputQuantity: 1, levelReq: 45, xp: 90, timeToCraft: 265000, ingredients: [{ itemId: 'ent_bar', quantity: 50 }, { itemId: 'rom_bar', quantity: 22 }, { itemId: 'bone_particles', quantity: 12 }, { itemId: 'recipe_book_ent_boots', quantity: 1 }], icon: itemDatabase['ent_boots'].icon },
    { id: 'craft_ent_shield', name: 'Ent Kalkanı', outputId: 'ent_shield', outputQuantity: 1, levelReq: 46, xp: 155, timeToCraft: 395000, ingredients: [{ itemId: 'ent_bar', quantity: 66 }, { itemId: 'rom_bar', quantity: 33 }, { itemId: 'bloodwood_log', quantity: 50 }, { itemId: 'recipe_book_ent_shield', quantity: 1 }], icon: itemDatabase['ent_shield'].icon },
    { id: 'craft_ent_sword', name: 'Ent Kılıcı', outputId: 'ent_sword', outputQuantity: 1, levelReq: 48, xp: 205, timeToCraft: 480000, ingredients: [{ itemId: 'ent_bar', quantity: 82 }, { itemId: 'rom_bar', quantity: 44 }, { itemId: 'bone_particles', quantity: 55 }, { itemId: 'bloodwood_log', quantity: 30 }, { itemId: 'recipe_book_ent_sword', quantity: 1 }], icon: itemDatabase['ent_sword'].icon },
    { id: 'craft_ent_bow', name: 'Ent Yayı', outputId: 'ent_bow', outputQuantity: 1, levelReq: 48, xp: 205, timeToCraft: 480000, ingredients: [{ itemId: 'ent_bar', quantity: 77 }, { itemId: 'rom_bar', quantity: 28 }, { itemId: 'enchanted_log', quantity: 50 }, { itemId: 'recipe_book_ent_bow', quantity: 1 }], icon: itemDatabase['ent_bow'].icon },
    
    // TIER 7: Kingdom
    { id: 'craft_kingdom_helmet', name: 'Krallık Kaskı', outputId: 'kingdom_helmet', outputQuantity: 1, levelReq: 55, xp: 270, timeToCraft: 700000, ingredients: [{ itemId: 'kingdom_bar', quantity: 85 }, { itemId: 'ent_bar', quantity: 45 }, { itemId: 'sharp_claw', quantity: 7 }, { itemId: 'recipe_book_kingdom_helmet', quantity: 1 }], icon: itemDatabase['kingdom_helmet'].icon },
    { id: 'craft_kingdom_chest', name: 'Krallık Zırhı', outputId: 'kingdom_chest', outputQuantity: 1, levelReq: 57, xp: 440, timeToCraft: 1050000, ingredients: [{ itemId: 'kingdom_bar', quantity: 110 }, { itemId: 'ent_bar', quantity: 55 }, { itemId: 'sharp_claw', quantity: 12 }, { itemId: 'griffon_feather', quantity: 1 }, { itemId: 'recipe_book_kingdom_chest', quantity: 1 }], icon: itemDatabase['kingdom_chest'].icon },
    { id: 'craft_kingdom_legs', name: 'Krallık Pantolonu', outputId: 'kingdom_legs', outputQuantity: 1, levelReq: 56, xp: 355, timeToCraft: 880000, ingredients: [{ itemId: 'kingdom_bar', quantity: 98 }, { itemId: 'ent_bar', quantity: 50 }, { itemId: 'sharp_claw', quantity: 10 }, { itemId: 'recipe_book_kingdom_legs', quantity: 1 }], icon: itemDatabase['kingdom_legs'].icon },
    { id: 'craft_kingdom_gloves', name: 'Krallık Eldiveni', outputId: 'kingdom_gloves', outputQuantity: 1, levelReq: 55, xp: 180, timeToCraft: 525000, ingredients: [{ itemId: 'kingdom_bar', quantity: 77 }, { itemId: 'ent_bar', quantity: 38 }, { itemId: 'sharp_claw', quantity: 5 }, { itemId: 'recipe_book_kingdom_gloves', quantity: 1 }], icon: itemDatabase['kingdom_gloves'].icon },
    { id: 'craft_kingdom_boots', name: 'Krallık Botu', outputId: 'kingdom_boots', outputQuantity: 1, levelReq: 55, xp: 180, timeToCraft: 525000, ingredients: [{ itemId: 'kingdom_bar', quantity: 77 }, { itemId: 'ent_bar', quantity: 38 }, { itemId: 'sharp_claw', quantity: 5 }, { itemId: 'recipe_book_kingdom_boots', quantity: 1 }], icon: itemDatabase['kingdom_boots'].icon },
    { id: 'craft_kingdom_shield', name: 'Krallık Kalkanı', outputId: 'kingdom_shield', outputQuantity: 1, levelReq: 56, xp: 310, timeToCraft: 790000, ingredients: [{ itemId: 'kingdom_bar', quantity: 92 }, { itemId: 'ent_bar', quantity: 44 }, { itemId: 'enchanted_log', quantity: 60 }, { itemId: 'recipe_book_kingdom_shield', quantity: 1 }], icon: itemDatabase['kingdom_shield'].icon },
    { id: 'craft_kingdom_sword', name: 'Krallık Kılıcı', outputId: 'kingdom_sword', outputQuantity: 1, levelReq: 58, xp: 410, timeToCraft: 960000, ingredients: [{ itemId: 'kingdom_bar', quantity: 110 }, { itemId: 'ent_bar', quantity: 55 }, { itemId: 'sharp_claw', quantity: 18 }, { itemId: 'enchanted_log', quantity: 40 }, { itemId: 'recipe_book_kingdom_sword', quantity: 1 }], icon: itemDatabase['kingdom_sword'].icon },
    { id: 'craft_kingdom_bow', name: 'Krallık Yayı', outputId: 'kingdom_bow', outputQuantity: 1, levelReq: 58, xp: 410, timeToCraft: 960000, ingredients: [{ itemId: 'kingdom_bar', quantity: 105 }, { itemId: 'ent_bar', quantity: 44 }, { itemId: 'mystic_log', quantity: 60 }, { itemId: 'griffon_feather', quantity: 5 }, { itemId: 'recipe_book_kingdom_bow', quantity: 1 }], icon: itemDatabase['kingdom_bow'].icon },
];

const cookingRecipes: CraftingRecipe[] = [
    { id: 'cook_trout', name: 'Izgara Alabalık', outputId: 'cooked_trout', outputQuantity: 1, levelReq: 1, xp: 2, timeToCraft: 5500, ingredients: [{ itemId: 'raw_trout', quantity: 1 }, { itemId: 'coal', quantity: 1 }], icon: itemDatabase['cooked_trout'].icon },
    { id: 'cook_herring', name: 'Izgara Ringa Balığı', outputId: 'cooked_herring', outputQuantity: 1, levelReq: 5, xp: 3, timeToCraft: 9000, ingredients: [{ itemId: 'raw_herring', quantity: 1 }, { itemId: 'coal', quantity: 1 }], icon: itemDatabase['cooked_herring'].icon },
    { id: 'cook_tuna', name: 'Pişmiş Ton Balığı', outputId: 'cooked_tuna', outputQuantity: 1, levelReq: 10, xp: 5, timeToCraft: 13000, ingredients: [{ itemId: 'raw_tuna', quantity: 1 }, { itemId: 'coal', quantity: 1 }], icon: itemDatabase['cooked_tuna'].icon },
    { id: 'cook_cod', name: 'Izgara Morina', outputId: 'cooked_cod', outputQuantity: 1, levelReq: 20, xp: 7, timeToCraft: 20000, ingredients: [{ itemId: 'raw_cod', quantity: 1 }, { itemId: 'coal', quantity: 1 }], icon: itemDatabase['cooked_cod'].icon },
    { id: 'cook_sea_bass', name: 'Izgara Levrek', outputId: 'cooked_sea_bass', outputQuantity: 1, levelReq: 30, xp: 9, timeToCraft: 28000, ingredients: [{ itemId: 'raw_sea_bass', quantity: 1 }, { itemId: 'coal', quantity: 1 }], icon: itemDatabase['cooked_sea_bass'].icon },
    { id: 'cook_salmon', name: 'Izgara Somon', outputId: 'cooked_salmon', outputQuantity: 1, levelReq: 40, xp: 13, timeToCraft: 38000, ingredients: [{ itemId: 'raw_salmon', quantity: 1 }, { itemId: 'coal', quantity: 1 }], icon: itemDatabase['cooked_salmon'].icon },
    { id: 'cook_crab', name: 'Pişmiş Yengeç', outputId: 'cooked_crab', outputQuantity: 1, levelReq: 50, xp: 18, timeToCraft: 55000, ingredients: [{ itemId: 'raw_crab', quantity: 1 }, { itemId: 'coal', quantity: 1 }], icon: itemDatabase['cooked_crab'].icon },
    { id: 'cook_chicken_meat', name: 'Pişmiş Tavuk Eti', outputId: 'cooked_chicken_meat', outputQuantity: 1, levelReq: 6, xp: 4, timeToCraft: 6000, ingredients: [{ itemId: 'chicken_meat', quantity: 1 }], icon: itemDatabase['cooked_chicken_meat'].icon },
    { id: 'cook_cow_meat', name: 'Biftek', outputId: 'cooked_cow_meat', outputQuantity: 1, levelReq: 9, xp: 6, timeToCraft: 8000, ingredients: [{ itemId: 'raw_cow_meat', quantity: 1 }], icon: itemDatabase['cooked_cow_meat'].icon },
    { id: 'cook_deer_meat', name: 'Pişmiş Geyik Eti', outputId: 'cooked_deer_meat', outputQuantity: 1, levelReq: 10, xp: 7, timeToCraft: 9000, ingredients: [{ itemId: 'deer_meat', quantity: 1 }], icon: itemDatabase['cooked_deer_meat'].icon },
    { id: 'cook_boar_meat', name: 'Pişmiş Yaban Domuzu Eti', outputId: 'cooked_boar_meat', outputQuantity: 1, levelReq: 12, xp: 8, timeToCraft: 10000, ingredients: [{ itemId: 'raw_boar_meat', quantity: 1 }], icon: itemDatabase['cooked_boar_meat'].icon },
];

export const craftingRecipes: Record<string, CraftingRecipe[]> = {
    smelting: smeltingRecipes,
    forge: forgeRecipes,
    alchemy: [],
    cooking: cookingRecipes,
};

export const mapRegions: MapRegion[] = [
    {
        id: 'sof_kasabasi',
        name: 'Rom Kasabası',
        levelReq: 5,
        coordinates: { top: '78%', left: '22%', width: '12%', height: '18%' },
        travelCost: 100,
        travelTime: 8000, // 8 saniye
        description: 'Bir zamanlar sakin olan bu kasaba, şimdi haydutların ve maceracıların uğrak yeri olmuş. Avcılık için ideal bir başlangıç noktası.'
    },
    {
        id: 'liman_kenti',
        name: 'Liman Kenti',
        levelReq: 1,
        coordinates: { top: '78%', left: '88%', width: '12%', height: '18%' },
        travelCost: 0,
        travelTime: 0,
        description: 'Sanırım tehlikeli bir yer değil... Daha çok balıkların ve gemi tüccarlarının gezindiği bir yer. Maceran burada başlıyor!'
    },
    {
        id: 'krallar_sehri',
        name: 'Kimsesizler Bölgesi',
        levelReq: 15,
        coordinates: { top: '55%', left: '68%', width: '12%', height: '18%' },
        travelCost: 300,
        travelTime: 15000, // 15 saniye
        description: 'Bu topraklarda tekinsiz söylentiler dolaşıyor. Dikkatli olsan iyi edersin.'
    },
    {
        id: 'donmuslar',
        name: 'Krallar Şehri',
        levelReq: 25,
        coordinates: { top: '40%', left: '25%', width: '12%', height: '18%' },
        travelCost: 500,
        travelTime: 20000, // 20 saniye
        description: 'Donmuş zirvelerin arasında, sadece en cesurların hayatta kalabildiği efsanevi bir kale.'
    },
];


export const getInitialGameState = (): GameState => {
    const baseStats = { strength: 5, agility: 5, tactics: 5, endurance: 5, charisma: 5, luck: 5 };
    const equipment = { ...initialEquipment };
    const maxHealth = 80 + (baseStats.endurance * 2);

    return {
        player: {
            level: 1,
            xp: 0,
            xpToNextLevel: 300,
            health: maxHealth,
            maxHealth: maxHealth,
            gold: 50,
            inventory: [{ ...itemDatabase['starter_bow'], quantity: 1 }],
            skills: [
                // Pasif Yetenekler
                { id: 'gathering', name: 'Toplayıcılık', level: 1, xp: 0, xpToNextLevel: 100, icon: 'https://files.catbox.moe/iejh2i.png' },
                { id: 'melee_combat', name: 'Yakın Dövüş', level: 1, xp: 0, xpToNextLevel: 100, icon: 'https://files.catbox.moe/ubvotc.png' },
                { id: 'intuition', name: 'Sezgi', level: 1, xp: 0, xpToNextLevel: 100, icon: 'https://files.catbox.moe/sxt31e.png' },
                { id: 'ranged_combat', name: 'Uzak Dövüş', level: 1, xp: 0, xpToNextLevel: 100, icon: 'https://files.catbox.moe/u1q0hu.png' },
                { id: 'prowess', name: 'Hüner', level: 1, xp: 0, xpToNextLevel: 100, icon: 'https://files.catbox.moe/q2aokz.png' },
                // Meslekler
                { id: 'woodcutting', name: 'Odunculuk', level: 1, xp: 0, xpToNextLevel: 50, icon: 'https://files.catbox.moe/v0ns6o.png' },
                { id: 'mining', name: 'Madencilik', level: 1, xp: 0, xpToNextLevel: 50, icon: 'https://files.catbox.moe/sljgrw.png' },
                { id: 'fishing', name: 'Balıkçılık', level: 1, xp: 0, xpToNextLevel: 50, icon: 'https://files.catbox.moe/6bgxds.png' },
                { id: 'hunting', name: 'Avcılık', level: 1, xp: 0, xpToNextLevel: 100, icon: 'https://files.catbox.moe/6e835o.png' },
                { id: 'alchemy', name: 'Simyacılık', level: 1, xp: 0, xpToNextLevel: 50, icon: 'https://files.catbox.moe/lt1euo.png' },
                { id: 'smelting', name: 'Dökümcülük', level: 1, xp: 0, xpToNextLevel: 50, icon: 'https://files.catbox.moe/ksuzhq.png' },
                { id: 'cooking', name: 'Aşçılık', level: 1, xp: 0, xpToNextLevel: 50, icon: 'https://files.catbox.moe/j3ve6t.png' },
                { id: 'forge', name: 'Demircilik', level: 1, xp: 0, xpToNextLevel: 50, icon: 'https://files.catbox.moe/n8euzp.png' },
            ],
            stats: baseStats,
            statPoints: 0,
            equipment,
            currentLocationId: 'liman_kenti',
        },
        isSaving: false,
        isLoading: true,
        lastSaved: null,
        currentAction: null,
        actionLog: ['Maceraya hoş geldin!'],
        currentTravel: null,
        huntingSession: null,
        notifications: [],
        settings: {
            disableLevelUpNotifications: false,
            disableMilestoneNotifications: false,
            enableHighContrastMode: false,
        },
    };
};