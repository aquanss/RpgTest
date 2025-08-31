import type { GameState, User, Character } from '../types';

const getCharListKey = (userId: string): string => `characterList_${userId}`;
const getGameStateKey = (userId: string, characterId: string): string => `gameState_${userId}_${characterId}`;
const getFullCharListKey = (userId: string): string => `fullCharacterList_${userId}`;

/**
 * Saves the list of character IDs to local storage for a user.
 * @param user The current user.
 * @param characters The user's list of characters.
 */
export const saveCharacterList = (user: User, characters: Character[]): void => {
    if (!user || !user.id) return;
    try {
        const key = getCharListKey(user.id);
        const ids = characters.map(c => c.id);
        localStorage.setItem(key, JSON.stringify(ids));
    } catch (error) {
        console.error("Failed to save character list to local storage:", error);
    }
};

/**
 * Loads the list of character IDs from local storage for a user.
 * @param user The current user.
 * @returns An array of character IDs.
 */
export const loadCharacterList = (user: User): string[] => {
    if (!user || !user.id) return [];
    try {
        const key = getCharListKey(user.id);
        const ids = localStorage.getItem(key);
        return ids ? JSON.parse(ids) : [];
    } catch (error) {
        console.error("Failed to load character list from local storage:", error);
        return [];
    }
};

/**
 * Saves the full character objects for a user to local storage.
 * @param user The current user.
 * @param characters The user's list of characters.
 */
export const saveCharactersToLocal = (user: User, characters: Character[]): void => {
    if (!user || !user.id) return;
    try {
        const key = getFullCharListKey(user.id);
        localStorage.setItem(key, JSON.stringify(characters));
    } catch (error) {
        console.error("Failed to save full character list to local storage:", error);
    }
};

/**
 * Loads the full character objects for a user from local storage.
 * @param user The current user.
 * @returns An array of Character objects.
 */
export const loadCharactersFromLocal = (user: User): Character[] => {
    if (!user || !user.id) return [];
    try {
        const key = getFullCharListKey(user.id);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to load full character list from local storage:", error);
        return [];
    }
};


/**
 * Saves the game state to the browser's local storage for a specific character.
 * @param user The current user.
 * @param characterId The ID of the character being saved.
 * @param gameState The current game state.
 */
export const saveGameStateToLocal = (user: User, characterId: string, gameState: GameState): void => {
    if (!user || !user.id) {
        console.error("Cannot save to local storage: invalid user.");
        return;
    }
    try {
        const key = getGameStateKey(user.id, characterId);
        const serializedState = JSON.stringify(gameState);
        localStorage.setItem(key, serializedState);
    } catch (error) {
        console.error("Failed to save game state to local storage:", error);
    }
};

/**
 * Loads the game state from the browser's local storage for a specific character.
 * @param user The current user.
 * @param characterId The ID of the character being loaded.
 * @returns The saved GameState or null if not found.
 */
export const loadGameStateFromLocal = (user: User, characterId: string): GameState | null => {
     if (!user || !user.id) {
        console.error("Cannot load from local storage: invalid user.");
        return null;
    }
    try {
        const key = getGameStateKey(user.id, characterId);
        const serializedState = localStorage.getItem(key);
        if (serializedState === null) {
            return null;
        }
        const savedState = JSON.parse(serializedState);
        // Ensure date objects are correctly reconstructed from strings
        if (savedState.lastSaved) {
            savedState.lastSaved = new Date(savedState.lastSaved);
        }
        return savedState as GameState;
    } catch (error) {
        console.error("Failed to load game state from local storage:", error);
        return null;
    }
};

/**
 * Clears the game state from local storage for a specific character.
 * @param user The user who owns the character.
 * @param characterId The ID of the character whose data should be cleared.
 */
export const clearLocalGameState = (user: User, characterId: string): void => {
    if (!user || !user.id) return;
    try {
        const key = getGameStateKey(user.id, characterId);
        localStorage.removeItem(key);
        console.log(`Local game state cleared for character ${characterId}.`);
    } catch (error) {
        console.error("Failed to clear local game state:", error);
    }
};

/**
 * Clears all local data for a specific user, including all character saves.
 * Typically used on logout.
 * @param user The user whose data should be cleared.
 */
export const clearAllLocalDataForUser = (user: User): void => {
    if (!user || !user.id) return;
    try {
        const charIds = loadCharacterList(user);
        for (const charId of charIds) {
            localStorage.removeItem(getGameStateKey(user.id, charId));
        }
        localStorage.removeItem(getCharListKey(user.id));
        localStorage.removeItem(getFullCharListKey(user.id));
        console.log(`All local data cleared for user ${user.id}.`);
    } catch (error) {
        console.error("Failed to clear all local data for user:", error);
    }
};