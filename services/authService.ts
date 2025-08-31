import type { User } from '../types';
import { 
  app, 
  loginWithUsernamePassword, 
  registerWithUsernamePassword, 
  logout as realmLogout 
} from './realmService';

export const login = async (username: string, password_unused: string): Promise<User | null> => {
  try {
    const realmUser = await loginWithUsernamePassword(username, password_unused);
    if (realmUser) {
      // Custom data, oturum açtıktan hemen sonra kullanılabilir olması için yenilenmelidir.
      await realmUser.refreshCustomData();
      const customUsername = (realmUser.customData.username as string) || username;
      return { id: realmUser.id, username: customUsername };
    }
    return null;
  } catch (error) {
    console.error("Login failed:", error);
    
    if (error instanceof Error) {
        // Sunucu tarafından gönderilen spesifik "yanlış şifre" mesajını yakala
        if (error.message.includes('Geçersiz kullanıcı adı veya şifre')) {
            throw new Error('Geçersiz kullanıcı adı veya şifre.');
        }
    }
    
    // Diğer tüm durumlar için genel bir ağ/sunucu hatası mesajı
    throw new Error('Giriş yapılamadı. Sunucuya ulaşılamıyor veya beklenmedik bir hata oluştu.');
  }
};

export const register = async (username: string, password_unused: string): Promise<User | null> => {
  try {
    // Adım 1: Kullanıcıyı realm servisi aracılığıyla kaydet.
    await registerWithUsernamePassword(username, password_unused);
    
    // Adım 2: Başarılı kayıttan sonra, bir oturum ve kullanıcı nesnesi almak için giriş yap.
    const user = await login(username, password_unused);
    return user;
  } catch (error) {
    console.error("Registration failed:", error);
     // Sunucudan gelen 'zaten kullanılıyor' mesajını yakalayarak kullanıcı dostu bir hata fırlat.
     if (error instanceof Error && error.message.includes('zaten kullanılıyor')) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
    }
    throw new Error('Kayıt sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
};

export const logout = async (): Promise<void> => {
  await realmLogout();
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (app.currentUser) {
    // Gerekirse token'ı yenile
    try {
      await app.currentUser.refreshCustomData();
      // Kullanıcı adının, arka uç fonksiyonu tarafından kayıt sırasında customData'ya saklandığını varsayıyoruz
      const username = (app.currentUser.customData.username as string) || 'Kullanıcı';
      return { id: app.currentUser.id, username: username };
    } catch(e) {
      // Yenileme başarısız olursa, kullanıcının tekrar giriş yapması gerekebilir
      console.error("Session refresh failed", e);
      await realmLogout();
      return null;
    }
  }
  return null;
};