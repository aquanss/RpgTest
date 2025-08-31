import React, { useState } from 'react';
import type { User, Character } from '../../types';
import { createCharacter } from '../../services/gameService';
import Card from '../ui/Card';
import { useTranslation } from '../../App';

interface CharacterCreationScreenProps {
  user: User;
  onCharacterCreated: (character: Character) => void;
  onBack?: () => void;
}

const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({ user, onCharacterCreated, onBack }) => {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || name.length < 3) {
            setError(t('nameMinLength'));
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const newCharacter = await createCharacter(user, name);
            onCharacterCreated(newCharacter);
        } catch (err: any) {
            setError(err.message || 'Karakter oluşturulamadı.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background-dark)] flex items-center justify-center p-4 font-sans text-[var(--text-primary)]">
            <div className="w-full max-w-md">
                 <Card title={t('createHeroTitle')}>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <img 
                                src="https://files.catbox.moe/9n32jw.png" 
                                alt={t('newCharacter')}
                                className="w-32 h-32 rounded-full border-4 border-[var(--accent-gold)] mx-auto mb-4 object-cover"
                            />
                            <p className="text-center text-[var(--text-secondary)]">
                               {t('createHeroDescription')}
                            </p>
                        </div>
                        
                        <div>
                            <label htmlFor="char-name" className="block text-[var(--text-secondary)] text-sm font-bold mb-2">{t('characterName')}</label>
                            <input
                                id="char-name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-[var(--background-dark)] text-[var(--text-primary)] rounded py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                                placeholder={t('characterNamePlaceholder')}
                                required
                                minLength={3}
                                maxLength={16}
                            />
                        </div>

                        {error && <p className="text-center text-[var(--accent-red)] text-sm">{error}</p>}
                        
                        <div className="flex justify-between items-center">
                           {onBack ? (
                             <button
                                type="button"
                                onClick={onBack}
                                className="bg-transparent hover:bg-[var(--border-color)] text-[var(--text-secondary)] font-bold py-2 px-4 rounded"
                             >
                                &larr; {t('back')}
                             </button>
                           ) : <div />}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[var(--accent-green)] hover:brightness-110 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 disabled:bg-[var(--border-color)] disabled:cursor-not-allowed"
                            >
                                {isLoading ? t('creating') : t('startAdventure')}
                            </button>
                        </div>
                    </form>
                 </Card>
            </div>
        </div>
    );
};

export default CharacterCreationScreen;
