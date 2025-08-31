// This is a global declaration, as we're loading Realm from a CDN
// In a real build environment, you would use `import * as Realm from "realm-web";`
declare const Realm: any;

const APP_ID = 'testrivalregions-jzpphkq';
export const app = new Realm.App({ id: APP_ID });

// Fix: Replaced Realm.User with any because Realm is declared as type any.
export const loginWithUsernamePassword = async (username: string, password_unused: string): Promise<any> => {
    // Custom Function kimlik doğrulaması ile, kimlik bilgilerini bir yük içinde iletiyoruz.
    // Realm, bu yükü sunucu tarafındaki 'authenticateUser' fonksiyonumuza gönderecektir.
    const credentials = Realm.Credentials.function({ username, password: password_unused });
    const user = await app.logIn(credentials);
    return user;
};

// Fix: Replaced Realm.User with any because Realm is declared as type any.
export const registerWithUsernamePassword = async (username: string, password_unused: string): Promise<void> => {
    // WORKAROUND: `app.functions` API'si beklenmedik bir şekilde tanımsız olduğundan,
    // güvenilir olan `callFunction` API'sine erişmek için geçici olarak anonim bir kullanıcıyla oturum açıyoruz.
    let anonymousUser = app.currentUser;
    let loggedInAnonymously = false;

    try {
        if (!anonymousUser) {
            await app.logIn(Realm.Credentials.anonymous());
            anonymousUser = app.currentUser;
            loggedInAnonymously = true;
        }

        if (!anonymousUser) {
            throw new Error("Kayıt için anonim oturum oluşturulamadı.");
        }
        
        // Bu, artık şifreyi hash'leyen ve kullanıcıyı 'users' koleksiyonuna kaydeden
        // yeni sunucu tarafı 'registerUser' fonksiyonumuzu çağırır.
        await anonymousUser.callFunction("registerUser", { username, password: password_unused });

    } finally {
        // Temizlik: Bu işlem için bir anonim kullanıcıyla oturum açtıysak, çıkış yap.
        if (loggedInAnonymously && anonymousUser) {
            if (app.currentUser && app.currentUser.id === anonymousUser.id) {
               await app.currentUser.logOut();
            }
        }
    }
};

export const logout = async (): Promise<void> => {
    if (app.currentUser) {
        await app.currentUser.logOut();
    }
};

export const getGameDataCollection = () => {
    if (!app.currentUser) {
        throw new Error("User must be logged in to access game data.");
    }
    const mongo = app.currentUser.mongoClient("mongodb-atlas");
    const collection = mongo.db("game_data").collection("saves");
    return collection;
};

// =====================================================================================
// SUNUCU TARAFI REALM FONKSİYONLARI
// =====================================================================================
// Sunucu tarafı fonksiyonlarının referans kodu, proje kök dizinindeki
// `SERVER_FUNCTIONS.md` dosyasına taşınmıştır.
// =====================================================================================