import React, { useState } from 'react';
import type { User, Character } from '../../types';
import { useOnlineStatus } from '../../utils/useOnlineStatus';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useTranslation } from '../../App';

interface CharacterSelectionScreenProps {
  user: User;
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
  onCreateCharacter: () => void;
  onLogout: () => void;
  onDeleteCharacter: (characterId: string) => void;
  onSyncCharacters: () => Promise<void>;
}

const CharacterCard: React.FC<{
    character: Character; 
    onSelect: () => void; 
    onDelete: (characterId: string) => void;
    isOnline: boolean;
}> = ({ character, onSelect, onDelete, isOnline }) => {
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const { t } = useTranslation();
    const avatar = 'https://files.catbox.moe/9n32jw.png';
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Kart seçimini engelle
        setDeleteConfirmOpen(true);
    };

    const confirmMessage = (
      <div dangerouslySetInnerHTML={{ __html: t('deleteCharacterConfirmMessage', { characterName: character.name }) }} />
    );

    return (
        <>
            <ConfirmDialog
                isOpen={isDeleteConfirmOpen}
                title={t('deleteCharacterConfirmTitle')}
                message={confirmMessage}
                onConfirm={() => onDelete(character.id)}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText={t('yesDelete')}
                cancelText={t('noCancel')}
            />
            <div className="w-64 bg-[var(--background-medium)] rounded-lg shadow-lg p-4 flex flex-col items-center border border-[var(--border-color)] transition-all duration-300 hover:shadow-2xl hover:border-[var(--accent-gold)] relative group">
                {isOnline && (
                    <button
                        onClick={handleDeleteClick}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-900/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all duration-200"
                        aria-label={`${t('deleteCharacter')}: ${character.name}`}
                        title={t('deleteCharacter')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                <img src={avatar} alt={character.name} className="w-24 h-24 rounded-full border-4 border-[var(--accent-gold)] mb-4 object-cover" />
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{character.name}</h3>
                <div className="text-center text-[var(--text-secondary)] my-2">
                    <p>{t('level')} {character.level}</p>
                </div>
                <button
                    onClick={onSelect}
                    className="mt-auto w-full bg-[var(--accent-blue)] hover:brightness-110 text-white font-bold py-2 px-4 rounded transition-all duration-300"
                >
                    {t('play')}
                </button>
            </div>
        </>
    );
};


const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({ user, characters, onSelectCharacter, onCreateCharacter, onLogout, onDeleteCharacter, onSyncCharacters }) => {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = async () => {
      setIsSyncing(true);
      await onSyncCharacters();
      setIsSyncing(false);
  };

  return (
    <>
    <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title={t('logoutConfirmTitle')}
        message={t('logoutConfirmMessage')}
        onConfirm={onLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
        confirmText={t('logout')}
        cancelText={t('noCancel')}
    />
    <div className="min-h-screen bg-[var(--background-dark)] flex flex-col items-center justify-center p-4 font-sans text-[var(--text-primary)]">
        <header className="absolute top-0 right-0 p-4 z-10 flex items-center gap-4">
            <button
                onClick={handleSyncClick}
                disabled={!isOnline || isSyncing}
                className="bg-[var(--accent-blue)] hover:brightness-110 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-[var(--border-color)] disabled:cursor-not-allowed flex items-center gap-2"
                title={!isOnline ? "Eşitleme için çevrimiçi olmalısınız" : "Karakterleri bulutla eşitle"}
            >
                {isSyncing ? (
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <i className="fa-solid fa-cloud-arrow-down"></i>
                )}
                <span>{isSyncing ? t('syncing') : t('syncCharacters')}</span>
            </button>
            <button
                onClick={() => setLogoutConfirmOpen(true)}
                className="bg-[var(--accent-red)] hover:brightness-110 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
            >
                {t('logout')}
            </button>
        </header>

        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[var(--accent-gold)]" style={{ fontFamily: "var(--font-fantasy)" }}>{t('characterSelectionTitle')}</h1>
            <p className="text-[var(--text-secondary)] mt-2">{t('welcomeBack', { username: user.username })}</p>
        </div>

        <div className="w-full max-w-4xl">
            <div className="flex flex-wrap justify-center gap-6 mb-8">
                {characters.map(char => (
                    <CharacterCard 
                        key={char.id} 
                        character={char} 
                        onSelect={() => onSelectCharacter(char)} 
                        onDelete={onDeleteCharacter}
                        isOnline={isOnline}
                    />
                ))}
            </div>

            {characters.length < 5 ? (
                <div className="text-center">
                    <button
                        onClick={onCreateCharacter}
                        className="bg-[var(--accent-green)] hover:brightness-110 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300"
                    >
                        {t('newCharacter')}
                    </button>
                </div>
            ) : (
                <p className="text-center text-[var(--text-secondary)]">{t('maxCharactersReached')}</p>
            )}
        </div>
    </div>
    </>
  );
};

export default CharacterSelectionScreen;
