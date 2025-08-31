import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
}

export type GameView = 'character' | 'inventory' | 'professions' | 'hunting' | 'settings' | 'map';

export type EquipmentSlot = 'helmet' | 'chest' | 'legs' | 'boots' | 'weapon' | 'shield' | 'gloves';

export type RarityKey = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Character {
  id: string;
  name: string;
  level: number;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  icon: string;
  type?: 'potion' | 'material' | 'equipment' | 'misc';
  rarity: RarityKey;
  description?: string;
  toolType?: 'pickaxe' | 'axe' | 'fishing_rod';
  efficiencyBonus?: number; // e.g., 0.05 for 5%
  equipmentType?: 'tool' | 'weapon' | 'helmet' | 'chest' | 'legs' | 'boots' | 'gloves' | 'shield';
  healAmount?: number; // Percentage of max health, e.g., 0.25 for 25%
  stats?: Partial<Stats>;
  levelReq?: number; // Ekipmanı giymek için gereken karakter seviyesi
  set?: string; // Ekipman setinin adı (örn: "copper", "iron")
}

export interface Stats {
  strength: number;
  agility: number;
  tactics: number;
  endurance: number;
  charisma: number;
  luck: number;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  icon: string;
}

export interface Equipment {
    helmet: Item | null;
    chest: Item | null;
    legs: Item | null;
    boots: Item | null;
    weapon: Item | null;
    shield: Item | null;
    gloves: Item | null;
}

export interface PlayerState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  health: number;
  maxHealth: number;
  gold: number;
  inventory: Item[];
  skills: Skill[];
  stats: Stats;
  statPoints: number;
  equipment: Equipment;
  currentLocationId: string;
}

export interface ActiveAction {
  name: string;
  skillId: string;
  targetId: string; // resourceId or recipeId
  actionType: 'gathering' | 'crafting';
  startTime: number;
  nextTickTime: number;
  sessionGains: {
      items: number;
      xp: number;
  };
}

export interface TravelState {
    destinationId: string;
    destinationName: string;
    startTime: number;
    endTime: number;
}

export type HuntingLogEntryType = 'event' | 'loot' | 'milestone' | 'error' | 'health' | 'damage' | 'encounter';

export interface HuntingLogEntry {
  timestamp: number;
  message: string;
  type: HuntingLogEntryType;
  icon?: string;
  creatureId?: string;
}

export interface HuntingSession {
  isActive: boolean;
  startTime: number;
  endTime: number;
  locationId: string; 
  log: HuntingLogEntry[];
  loot: Record<string, Item>; 
  huntSlot: Item | null;
  isReturning: boolean;
  returnEndTime: number;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon?: string;
}

export interface Settings {
    disableLevelUpNotifications: boolean;
    disableMilestoneNotifications: boolean;
    enableHighContrastMode: boolean;
}

export interface GameState {
  player: PlayerState;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  currentAction: ActiveAction | null;
  actionLog: string[];
  currentTravel: TravelState | null;
  huntingSession: HuntingSession | null;
  notifications: Notification[];
  settings: Settings;
}

export interface GatherableResource {
  id: string;
  name: string;
  levelReq: number;
  xp: number;
  icon: string;
  itemId: string;
  timeToGather: number; // in milliseconds
}

export interface CraftingIngredient {
    itemId: string;
    quantity: number;
}

export interface CraftingRecipe {
    id: string;
    name: string;
    outputId: string;
    outputQuantity: number;
    levelReq: number;
    xp: number;
    timeToCraft: number;
    ingredients: CraftingIngredient[];
    icon: string;
}


export interface MapRegion {
  id: string;
  name: string;
  levelReq: number;
  coordinates: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
  travelCost: number;
  travelTime: number; // in milliseconds
  description: string;
}

// Fix: Moved Creature and LootDrop interfaces here from huntingData.ts to fix import error.
export interface LootDrop {
  itemId: string;
  chance: number; // 0 to 1
}

export interface Creature {
  id: string;
  name: string;
  icon: string;
  levelReq: number;
  xp: number;
  lootTable: LootDrop[];
}