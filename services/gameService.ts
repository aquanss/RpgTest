import type { User, Character } from '../types';
import { app } from './realmService';
import { v4 as uuidv4 } from 'uuid';
import { GameState } from '../types';
import { saveCharactersToLocal, loadCharactersFromLocal } from './storageService';


// Simulates fetching characters for a user from the cloud (now using localStorage for persistence)
export const getCharactersForUser = async (user: User): Promise<Character[]> => {
  console.log('Fetching characters for user from local persistence:', user.username);
  // This is a mock that reads from localStorage. In a real scenario, you'd call a Realm function.
  const characters = loadCharactersFromLocal(user);
  return Promise.resolve(characters);
};

/**
 * Creates a new character by calling a server-side Realm function.
 * This is now the single source of truth for character creation.
 * The server handles ID generation and initial data persistence.
 * @param user The current user.
 * @param name The desired name for the new character.
 * @returns A promise that resolves to the newly created Character object.
 */
export const createCharacter = async (user: User, name: string): Promise<Character> => {
    console.log(`Calling createCharacter Realm function for ${user.username} with name ${name}`);
    if (!app.currentUser) {
        throw new Error("User must be authenticated to create a character.");
    }
    try {
        // This function should return a Character object: { id: string, name: string, level: number }
        const newCharacter = await app.currentUser.callFunction('createCharacter', { characterName: name });
        if (!newCharacter || !newCharacter.id) {
          throw new Error("Server did not return character data.");
        }
        console.log("New character created successfully on server:", newCharacter);
        return newCharacter as Character;
    } catch (e: any) {
        console.error("Failed to create character via function", e);
        // Pass the specific error message from the Realm function (e.g., "Max characters reached")
        throw new Error(e.message || "An unknown server error occurred.");
    }
}

/**
 * Deletes a character from the cloud by calling a server-side Realm function.
 * This is now the single source of truth for character deletion.
 * @param user The current user.
 * @param characterId The ID of the character to delete.
 */
export const deleteCharacter = async (user: User, characterId: string): Promise<void> => {
    console.log(`Calling deleteCharacter Realm function for ${characterId}`);
    if (!app.currentUser) {
        throw new Error("User must be authenticated to delete a character.");
    }
    try {
        await app.currentUser.callFunction('deleteCharacter', { characterId });
        console.log(`Character ${characterId} deleted successfully on server.`);
    } catch (e: any) {
        console.error("Failed to delete character via function", e);
        // Pass a user-friendly error message.
        throw new Error(e.message || "Character could not be deleted due to an unknown server error.");
    }
};

// Saves game data to a cloud service via a Realm Function
export const saveGameToCloud = async (user: User, character: Character, gameState: GameState): Promise<Date> => {
  console.log(`Calling saveGame Realm function for user: ${user.username}, character: ${character.name}`);
  if (!app.currentUser) {
    throw new Error("User not authenticated.");
  }
  try {
    const result = await app.currentUser.callFunction('saveGame', { 
      characterId: character.id, 
      characterName: character.name, 
      gameState 
    });
    const saveTime = new Date(result);
    console.log('Game state saved successfully via function call.');
    return saveTime;
  } catch(e: any) {
    console.error("Failed to save game to cloud via function", e);
    const errorMessage = e.message || "An unknown server error occurred.";
    throw new Error(errorMessage);
  }
};

// Loads game data from a cloud service via a Realm Function
export const loadGameFromCloud = async (user: User, characterId: string): Promise<GameState | null> => {
  console.log(`Calling loadGame Realm function for user: ${user.username}, character: ${characterId}`);
   if (!app.currentUser) {
    throw new Error("User not authenticated.");
  }
   try {
    const savedData = await app.currentUser.callFunction('loadGame', { characterId });
    
    if (savedData) {
      console.log("Save data found, parsing...");
       if(savedData.lastSaved && typeof savedData.lastSaved === 'string') {
        savedData.lastSaved = new Date(savedData.lastSaved);
      }
      return savedData as GameState;
    } else {
      console.log("No save data found, starting new game for this character.");
      return null;
    }
   } catch(e) {
     console.error("Failed to load game from cloud via function", e);
     return null;
   }
};

// Fetches the complete character list for a user from the cloud.
export const getCharactersFromCloud = async (user: User): Promise<Character[]> => {
  console.log(`Calling getCharacterList Realm function for user: ${user.username}`);
  if (!app.currentUser) {
    throw new Error("User not authenticated.");
  }
  try {
    // This function should return a list of objects: {id, name, level}
    const cloudCharacters = await app.currentUser.callFunction('getCharacterList');
    if (Array.isArray(cloudCharacters)) {
      // Basic validation
      return cloudCharacters.filter(c => c && c.id && c.name && typeof c.level === 'number') as Character[];
    }
    console.warn("getCharacterList did not return an array.");
    return [];
  } catch (e: any) {
    console.error("Could not fetch characters from cloud", e);
    throw new Error(e.message || "Could not fetch characters from cloud.");
  }
};