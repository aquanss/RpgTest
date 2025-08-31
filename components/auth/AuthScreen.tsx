import React, { useState } from 'react';
import type { User } from '../../types';
import { login, register } from '../../services/authService';
import { useTranslation } from '../../App';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'register';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="inline-flex items-center bg-black/30 backdrop-blur-sm p-1 rounded-full border border-white/10 mt-4">
      <button 
        onClick={() => setLanguage('tr')}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${language === 'tr' ? 'bg-white/90 text-black' : 'text-white'}`}
      >
        TR
      </button>
      <button 
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${language === 'en' ? 'bg-white/90 text-black' : 'text-white'}`}
      >
        EN
      </button>
    </div>
  );
};


const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (mode === 'register' && password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      setIsLoading(false);
      return;
    }
    
    try {
        let user: User | null = null;
        if (mode === 'login') {
            user = await login(username, password);
            if (!user) setError(t('invalidCredentials'));
        } else {
            user = await register(username, password);
            if (!user) setError(t('registrationFailed'));
        }

        if (user) {
            onLogin(user);
        }
    } catch (err: any) {
        const message = err.message || '';
        if (message.includes('Invalid username or password')) {
            setError(t('invalidCredentials'));
        } else if (message.includes('already exists')) {
             setError(t('registrationFailed'));
        }
        else {
            setError(message || t('unexpectedError'));
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div 
        className="min-h-screen flex items-center justify-center p-4 font-sans bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://files.catbox.moe/ns65yv.jpg')" }}
    >
      <div 
        className="w-full max-w-md animate-fade-in-up"
        style={{ animationDelay: '200ms', opacity: 0 }}
      >
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "var(--font-fantasy)" }}>{t('authTitle')}</h1>
            <p className="text-[var(--accent-gold)] drop-shadow-md">{t('authSubtitle')}</p>
            <LanguageSwitcher />
        </div>
        <div className="bg-black/60 backdrop-blur-lg shadow-2xl rounded-lg p-8 border border-white/10">
          <div className="flex border-b border-[var(--border-color)] mb-6">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 text-lg font-semibold transition-colors duration-300 ${mode === 'login' ? 'text-[var(--accent-blue)] border-b-2 border-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-white'}`}>
              {t('login')}
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 text-lg font-semibold transition-colors duration-300 ${mode === 'register' ? 'text-[var(--accent-blue)] border-b-2 border-[var(--accent-blue)]' : 'text-[var(--text-secondary)] hover:text-white'}`}>
              {t('register')}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[var(--text-secondary)] text-sm font-bold mb-2" htmlFor="username">
                {t('username')}
              </label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]"></i>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/30 text-white rounded-lg py-2 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:bg-black/50 transition-all border border-transparent focus:border-[var(--accent-blue)]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] text-sm font-bold mb-2" htmlFor="password">
                {t('password')}
              </label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]"></i>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 text-white rounded-lg py-2 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:bg-black/50 transition-all border border-transparent focus:border-[var(--accent-blue)]"
                  required
                />
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-[var(--text-secondary)] text-sm font-bold mb-2" htmlFor="confirm-password">
                  {t('confirmPassword')}
                </label>
                 <div className="relative">
                    <i className="fa-solid fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]"></i>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/30 text-white rounded-lg py-2 pl-10 pr-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:bg-black/50 transition-all border border-transparent focus:border-[var(--accent-blue)]"
                      required
                    />
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/40 border border-red-500/50 text-red-300 p-3 rounded-md flex items-center gap-3 animate-fade-in">
                <i className="fa-solid fa-circle-exclamation"></i>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--accent-blue)] hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 disabled:bg-[var(--border-color)] disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center h-12"
            >
              {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              ) : (mode === 'login' ? t('login') : t('createAccount'))}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
