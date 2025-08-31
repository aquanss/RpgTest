# Idle Realms - Sunucu Tarafı Realm Fonksiyonları (Referans)

Bu dosya, Idle Realms oyununun MongoDB Realm üzerinde çalışan sunucu tarafı fonksiyonlarının bir referansını içerir. Bu kod, istemci tarafı projesinin bir parçası değildir, ancak istemcinin çağırdığı API'lerin nasıl çalıştığını anlamak için buradadır.

---

### 1. `saveGame` (Çoklu Karakter Desteği ile)

Bu fonksiyon, bir oyuncunun oyun durumunu, basit hile karşıtı kontroller uyguladıktan sonra veritabanına kaydeder. Artık karakter adını da kaydeder.

**Realm Arayüzü Ayarları:**
- **Function Name:** `saveGame`
- **Authentication:** `System`
- **Can be called by:** Herhangi bir kimliği doğrulanmış kullanıcı

```javascript
exports = async function({ characterId, characterName, gameState: clientGameState }) {
  const userId = context.user.id;
  if (!userId) { throw new Error("Kullanıcı kimliği doğrulanamadı."); }
  if (!characterId) { throw new Error("Karakter ID'si sağlanmadı."); }

  const collection = context.services.get("mongodb-atlas").db("game_data").collection("saves");

  // Önceki 'serverGameState' getirme işlemi, artık kullanılmadığı için kaldırıldı.
  // Mevcut yaklaşım, istemci verisine güvenmektir ve yalnızca temel "sağduyu" kontrolleri yapar.
  
  const clientPlayer = clientGameState.player;
  if (!clientPlayer) {
    throw new Error(`Geçersiz oyun durumu: İstemciden oyuncu verisi alınamadı.`);
  }

  // Temel bir "sağduyu" kontrolü: Karakter seviyesi oyunun izin verdiği maksimum seviyeyi geçemez.
  // Idle oyunlarda çevrimdışı ilerleme nedeniyle daha katı kontroller (altın/TP artışı gibi)
  // yanıltıcı olabilir ve meşru oyuncuları engelleyebilir. Bu nedenle bu yaklaşım daha güvenilirdir.
  const MAX_LEVEL = 30; 
  if (clientPlayer.level > MAX_LEVEL) {
      throw new Error(`Hile Tespiti: Karakter seviyesi (${clientPlayer.level}) maksimum seviyeyi (${MAX_LEVEL}) aşıyor.`);
  }

  // Tüm kontrollerden geçerse, veriyi kaydet/güncelle
  console.log(`Doğrulama başarılı: ${userId}/${characterId}. Oyun kaydediliyor.`);
  const { isSaving, isLoading, ...stateToSave } = clientGameState;
  const saveTime = new Date();
  
  const updateData = { 
    ...stateToSave, 
    userId: userId, 
    characterId: characterId, 
    characterName: characterName, // Karakter adını her zaman güncelle
    lastSaved: saveTime 
  };
  
  // Belge mevcut değilse oluşturur, mevcutsa günceller. Bu, findOne + insert/update'den daha sağlamdır.
  await collection.updateOne(
    { userId: userId, characterId: characterId },
    { $set: updateData },
    { upsert: true } // Belge yoksa oluşturur
  );
  
  return saveTime.toISOString();
};
```

---

### 2. `loadGame` (Çoklu Karakter Desteği ile)

Bu fonksiyon, belirli bir karakter için kaydedilmiş oyun durumunu veritabanından alır.

**Realm Arayüzü Ayarları:**
- **Function Name:** `loadGame`
- **Authentication:** `System`
- **Can be called by:** Herhangi bir kimliği doğrulanmış kullanıcı

```javascript
exports = async function({ characterId }) {
  const userId = context.user.id;
  if (!userId) { throw new Error("Kullanıcı kimliği doğrulanamadı."); }
  if (!characterId) { throw new Error("Karakter ID'si sağlanmadı."); }
  
  const savesCollection = context.services.get("mongodb-atlas").db("game_data").collection("saves");
  
  // Hem kullanıcı hem de karakter ID'si ile doğru kaydı bul
  const savedData = await savesCollection.findOne({ userId: userId, characterId: characterId });
  
  if (savedData) {
    const { _id, ...gameState } = savedData;
    if (gameState.lastSaved) {
      gameState.lastSaved = new Date(gameState.lastSaved).toISOString();
    }
    return gameState;
  } else {
    return null; // İstemci tarafı bunu yeni bir oyun olarak ele alacaktır.
  }
};
```

---

### 3. `getCharacterList` (YENİ)

Bu fonksiyon, bir kullanıcıya ait tüm karakterlerin bir listesini buluttan alır.

**Realm Arayüzü Ayarları:**
- **Function Name:** `getCharacterList`
- **Authentication:** `System`
- **Can be called by:** Herhangi bir kimliği doğrulanmış kullanıcı

```javascript
exports = async function() {
  const userId = context.user.id;
  if (!userId) {
    throw new Error("Kullanıcı kimliği doğrulanamadı.");
  }
  
  const savesCollection = context.services.get("mongodb-atlas").db("game_data").collection("saves");

  // Kullanıcıya ait tüm belgeleri getirerek karakter bilgilerini al
  const charactersData = await savesCollection.find({ userId: userId }).toArray();
  
  if (!charactersData || charactersData.length === 0) {
    return [];
  }

  // Character türüne göre maple: { id, name, level }
  const characters = charactersData.map(doc => {
    // characterName eski kayıtlarda olmayabilir, bu yüzden bir yedek sağlıyoruz.
    const characterName = doc.characterName || `Karakter ${doc.characterId.substring(0, 4)}`;
    const characterLevel = doc.player && doc.player.level ? doc.player.level : 1;
    
    return {
      id: doc.characterId,
      name: characterName,
      level: characterLevel,
    };
  });

  return characters;
};
```

---

### 4. `createCharacter` (YENİ)

Bu fonksiyon, bir kullanıcı için yeni bir karakter kaydı oluşturur. Sunucu tarafında ID oluşturur ve karakter limitlerini zorunlu kılar.

**Realm Arayüzü Ayarları:**
- **Function Name:** `createCharacter`
- **Authentication:** `System`
- **Can be called by:** Herhangi bir kimliği doğrulanmış kullanıcı

```javascript
exports = async function({ characterName }) {
  const userId = context.user.id;
  if (!userId) { throw new Error("Kullanıcı kimliği doğrulanamadı."); }
  if (!characterName || characterName.trim().length < 3) { throw new Error("Karakter adı en az 3 karakter olmalıdır."); }
  if (characterName.length > 16) { throw new Error("Karakter adı en fazla 16 karakter olabilir."); }

  const collection = context.services.get("mongodb-atlas").db("game_data").collection("saves");

  // Karakter limitini kontrol et
  const characterCount = await collection.count({ userId: userId });
  if (characterCount >= 5) {
    throw new Error("Maksimum karakter limitine ulaşıldı (5).");
  }

  // Önce characterId olmadan yeni bir karakter belgesi oluştur
  const newCharacterDoc = {
    userId: userId,
    characterName: characterName.trim(),
    player: { level: 1 }, // Minimal başlangıç verisi
    createdAt: new Date(),
    lastSaved: new Date()
  };

  const result = await collection.insertOne(newCharacterDoc);
  const newCharacterId = result.insertedId.toString();

  // Şimdi, tutarlılık için belgenin kendi ID'sini characterId olarak eklemek üzere güncelle
  await collection.updateOne(
    { _id: result.insertedId },
    { $set: { characterId: newCharacterId } }
  );
  
  console.log(`Yeni karakter başarıyla oluşturuldu: ${userId}/${newCharacterId}`);

  // İstemciye yeni karakter nesnesini döndür
  return {
    id: newCharacterId,
    name: characterName.trim(),
    level: 1
  };
};
```

---

### 5. `registerUser` (Özel Kimlik Doğrulama için)

Bu fonksiyon, yeni bir kullanıcıyı kaydeder ve şifrelerini güvenli bir şekilde hash'ler.

**Realm Arayüzü Ayarları:**
- **Function Name:** `registerUser`
- **Authentication:** `System`
- **Can be called by:** Herhangi bir kullanıcı (anonim dahil)

```javascript
exports = async function({ username, password }) {
  if (!username || !password) { throw new Error("Kullanıcı adı ve şifre gereklidir."); }
  if (password.length < 6) { throw new Error("Şifre en az 6 karakter olmalıdır."); }


  // Realm Functions'da bulunan yerleşik kripto kütüphanesini kullanıyoruz.
  const crypto = require('crypto');
  const util = require('util');
  const scrypt = util.promisify(crypto.scrypt);

  const usersCollection = context.services.get("mongodb-atlas").db("game_data").collection("users");

  const existingUser = await usersCollection.findOne({ username: username });
  if (existingUser) { throw new Error(`Kullanıcı adı '${username}' zaten kullanılıyor.`); }

  // Güvenli bir şekilde şifreyi hash'le
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64)).toString('hex');
  
  const newUser = {
    username: username,
    salt: salt,
    hash: hash,
    createdAt: new Date(),
  };
  
  const result = await usersCollection.insertOne(newUser);
  
  // Custom Data'nın düzgün çalışması için userId alanını belgenin kendi _id'si ile güncelle
  // Bu, Realm'in kimliği doğrulanmış kullanıcıyı tanıması için kararlı bir kimlik sağlar.
  await usersCollection.updateOne(
    { _id: result.insertedId },
    { $set: { userId: result.insertedId.toString() } }
  );

  return { status: 'success', userId: result.insertedId.toString() };
};
```

---

### 6. `authenticateUser` (Özel Kimlik Doğrulama için)

Bu fonksiyon, özel kimlik doğrulama sağlayıcısı olarak kullanılır. Kullanıcı adı ve şifreyi doğrular.

**Realm Arayüzü Ayarları:**
- **Function Name:** `authenticateUser`
- **Authentication:** `System`
- **Realm Arayüzünde Bağlantı:** Bu fonksiyonu `AUTHENTICATION -> PROVIDERS -> CUSTOM FUNCTION` bölümüne bağlayın.

```javascript
exports = async function(loginData) {
  const { username, password } = loginData;
  if (!username || !password) {
    throw new Error("Kimlik doğrulama için kullanıcı adı ve şifre gereklidir.");
  }

  const crypto = require('crypto');
  const util = require('util');
  const scrypt = util.promisify(crypto.scrypt);

  const usersCollection = context.services.get("mongodb-atlas").db("game_data").collection("users");

  const user = await usersCollection.findOne({ username: username });
  if (!user) {
    console.error(`Kimlik doğrulama hatası: Kullanıcı bulunamadı - ${username}`);
    throw new Error("Geçersiz kullanıcı adı veya şifre.");
  }

  // Sağlanan şifreyi, veritabanında saklanan salt ile hash'le
  const providedHash = (await scrypt(password, user.salt, 64)).toString('hex');

  // Hata Düzeltmesi: Realm Functions ortamı `crypto.timingSafeEqual` desteklemiyor.
  // Bunun yerine standart bir dize karşılaştırması kullanıyoruz.
  if (providedHash === user.hash) {
    console.log(`Kullanıcı başarıyla doğrulandı: ${username}`);
    
    // GÜÇLENDİRİLMİŞ HATA DÜZELTMESİ: Eski kullanıcıların "userId" alanı olmayabilir VEYA
    // yanlış türde (örn. ObjectId) olabilir. Bu durum, giriş sırasında
    // alanı onararak eski kullanıcıları "lazy migrate" eder.
    if (!user.userId || typeof user.userId !== 'string') {
      const correctUserId = user._id.toString();
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { userId: correctUserId } }
      );
      console.log(`Eski kullanıcı geçişi/onarımı yapıldı: ${username}, userId dize olarak ayarlandı.`);
      return correctUserId;
    }
    
    // Başarılı olduğunda, Realm'in bu kullanıcı için kimlik oluşturmak üzere kullanacağı
    // kararlı bir ID döndürün. Bu, registerUser'da ayarladığımız userId'dir.
    return user.userId;
  } else {
    console.error(`Kimlik doğrulama hatası: Yanlış şifre - ${username}`);
    throw new Error("Geçersiz kullanıcı adı veya şifre.");
  }
};
```
---

### 7. `deleteCharacter` (YENİ)

Bu fonksiyon, bir kullanıcıya ait belirli bir karakterin kaydını veritabanından kalıcı olarak siler.

**Realm Arayüzü Ayarları:**
- **Function Name:** `deleteCharacter`
- **Authentication:** `System`
- **Can be called by:** Herhangi bir kimliği doğrulanmış kullanıcı

```javascript
exports = async function({ characterId }) {
  const userId = context.user.id;
  if (!userId) {
    throw new Error("Kullanıcı kimliği doğrulanamadı.");
  }
  if (!characterId) {
    throw new Error("Silinecek karakter ID'si sağlanmadı.");
  }
  
  const savesCollection = context.services.get("mongodb-atlas").db("game_data").collection("saves");
  
  const result = await savesCollection.deleteOne({ userId: userId, characterId: characterId });
  
  if (result.deletedCount === 1) {
    console.log(`Karakter başarıyla silindi: ${userId}/${characterId}`);
    return { status: "success", message: "Karakter silindi." };
  } else {
    console.warn(`Silinecek karakter bulunamadı: ${userId}/${characterId}`);
    // Hata atmak yerine, istemcinin devam etmesine izin vermek için bir uyarı durumu döndür.
    // İstemci tarafı, karakterin zaten silinmiş olabileceğini varsayabilir.
    return { status: "not_found", message: "Karakter bulunamadı veya zaten silinmiş." };
  }
};
```