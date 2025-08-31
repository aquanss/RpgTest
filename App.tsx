
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import GameScreen from './components/game/GameScreen';
import AuthScreen from './components/auth/AuthScreen';
import CharacterSelectionScreen from './components/character/CharacterSelectionScreen';
import CharacterCreationScreen from './components/character/CharacterCreationScreen';
import { GameProvider } from './context/GameContext';
import type { User, Character, RarityKey } from './types';
import { getCurrentUser, logout as logoutUser } from './services/authService';
import { getCharactersForUser, deleteCharacter, getCharactersFromCloud } from './services/gameService';
import { clearAllLocalDataForUser, saveCharacterList, clearLocalGameState, saveCharactersToLocal } from './services/storageService';
import { v4 as uuidv4 } from 'uuid';
import tr from './localization/tr';
import en from './localization/en';

// LOCALIZATION (i18n) SETUP
const translations = { tr, en };

type Language = keyof typeof translations;
type UITranslationKey = keyof typeof translations.tr.ui;
type GameTranslationKey = keyof (typeof translations.tr.game);

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: UITranslationKey, options?: Record<string, string | number>) => string;
  tGame: (
      category: GameTranslationKey, 
      key: string, 
      // FIX: Added 'label' to the type to allow translating sidebar item labels.
      field: 'name' | 'description' | 'label', 
      fallback: string
  ) => string;
  tRarity: (key: RarityKey) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
};

// --- APP COMPONENT ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [appState, setAppState] = useState<'loading' | 'auth' | 'char_selection' | 'char_creation' | 'game'>('loading');
  const [loadingMessage, setLoadingMessage] = useState('Checking session...');
  const [error, setError] = useState('');
  
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'tr';
  });

  const setLanguage = (lang: Language) => {
      localStorage.setItem('language', lang);
      setLanguageState(lang);
  };
  
  const t = useCallback((key: UITranslationKey, options?: Record<string, string | number>): string => {
      let text = translations[language].ui[key] || translations['en'].ui[key] || String(key);
      if (options) {
          Object.keys(options).forEach(k => {
              text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(options[k]));
          });
      }
      return text;
  }, [language]);

  // FIX: Added 'label' to the type to allow translating sidebar item labels.
  const tGame = useCallback((category: GameTranslationKey, key: string, field: 'name' | 'description' | 'label', fallback: string): string => {
      const lang = language as Language;
      const categoryData = translations[lang].game[category] as any;
      if (categoryData && categoryData[key] && categoryData[key][field]) {
          return categoryData[key][field] || fallback;
      }
      return fallback;
  }, [language]);

  const tRarity = useCallback((key: RarityKey): string => {
      const lang = language as Language;
      return translations[lang].rarity[key] || key;
  }, [language]);


  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await loadUserCharacters(currentUser);
          setAppState('char_selection');
        } else {
          setAppState('auth');
        }
      } catch (e) {
        console.error("Session check failed, showing auth screen.", e);
        setAppState('auth');
      }
    };
    checkSession();
  }, []);
  
  const loadUserCharacters = async (currentUser: User) => {
     setLoadingMessage(t('loadingCharacters'));
     setAppState('loading');
     try {
       const cloudChars = await getCharactersFromCloud(currentUser);
       setCharacters(cloudChars);
       saveCharactersToLocal(currentUser, cloudChars);
     } catch (e: any) {
        setError(t('syncFailed', { error: e.message || '' }));
        const localChars = await getCharactersForUser(currentUser);
        setCharacters(localChars);
     } finally {
        setAppState('char_selection');
     }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    loadUserCharacters(loggedInUser);
  };
  
  const handleLogout = async () => {
    if (user) clearAllLocalDataForUser(user);
    await logoutUser();
    setUser(null);
    setCharacters([]);
    setSelectedCharacter(null);
    setAppState('auth');
  };

  const handleCharacterCreated = (newCharacter: Character) => {
    setCharacters(prev => [...prev, newCharacter]);
    setSelectedCharacter(newCharacter);
    setAppState('game');
  };
  
  const handleDeleteCharacter = async (characterId: string) => {
    if (!user) return;
    try {
        await deleteCharacter(user, characterId);
        setCharacters(prev => prev.filter(c => c.id !== characterId));
        clearLocalGameState(user, characterId);
    } catch(e: any) {
        setError(e.message || "Could not delete character.");
        console.error("Deletion failed:", e);
    }
  };
  
  const handleSyncCharacters = async () => {
      if(!user) return;
      await loadUserCharacters(user);
      // Maybe add a temporary success message/toast
  }

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-xl animate-pulse">{loadingMessage}</div>;
      case 'auth':
        return <AuthScreen onLogin={handleLogin} />;
      case 'char_selection':
        if (!user) return <AuthScreen onLogin={handleLogin} />; // Should not happen but as a fallback
        return (
            <>
                {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-800/80 backdrop-blur-sm text-white p-3 rounded-md shadow-lg z-10 animate-fade-in-up border border-red-500">{error}</div>}
                <CharacterSelectionScreen
                    user={user}
                    characters={characters}
                    onSelectCharacter={char => { setSelectedCharacter(char); setAppState('game'); }}
                    onCreateCharacter={() => setAppState('char_creation')}
                    onLogout={handleLogout}
                    onDeleteCharacter={handleDeleteCharacter}
                    onSyncCharacters={handleSyncCharacters}
                />
            </>
        );
      case 'char_creation':
        if (!user) return <AuthScreen onLogin={handleLogin} />;
        return <CharacterCreationScreen user={user} onCharacterCreated={handleCharacterCreated} onBack={() => setAppState('char_selection')} />;
      case 'game':
        if (!user || !selectedCharacter) return <AuthScreen onLogin={handleLogin} />;
        return (
            <GameProvider 
                user={user} 
                character={selectedCharacter} 
                onLogout={handleLogout}
                onBackToCharSelect={() => { setSelectedCharacter(null); setAppState('char_selection'); }}
            >
                <GameScreen />
            </GameProvider>
        );
      default:
        return <div>Error: Unknown App State</div>;
    }
  };
  
  const translationContextValue = {
      language,
      setLanguage,
      t,
      tGame,
      tRarity,
  };

  return (
    <TranslationContext.Provider value={translationContextValue}>
        {renderContent()}
    </TranslationContext.Provider>
  );
};

export default App;