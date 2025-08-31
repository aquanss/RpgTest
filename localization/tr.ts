

// localization/tr.ts
import { itemDatabase } from '../utils/itemData';
import { creaturesByLocation } from '../utils/huntingData';
import { mapRegions } from '../utils/initialGameState';
import { getInitialGameState, craftingRecipes } from '../utils/initialGameState';
import type { RarityKey } from '../types';

// Helper to extract original Turkish names from game data
const getGameTranslations = () => {
    const items: Record<string, { name: string, description: string }> = {};
    for (const key in itemDatabase) {
        items[key] = {
            name: itemDatabase[key].name,
            description: itemDatabase[key].description || ''
        };
    }

    const creatures: Record<string, { name: string }> = {};
    for (const location in creaturesByLocation) {
        for (const creature of creaturesByLocation[location]) {
            creatures[creature.id] = { name: creature.name };
        }
    }

    const mapRegionsData: Record<string, { name: string, description: string }> = {};
    for (const region of mapRegions) {
        mapRegionsData[region.id] = { name: region.name, description: region.description };
    }

    const skills: Record<string, { name: string, description: string }> = {};
    const initialSkills = getInitialGameState().player.skills;
    for (const skill of initialSkills) {
        skills[skill.id] = { name: skill.name, description: '' };
    }
    // Specific descriptions
    skills['gathering'].description = "Toplama verimliliğini ve hızını artırır.";
    skills['melee_combat'].description = "Yakın dövüş silahlarındaki ustalığını artırır.";
    skills['intuition'].description = "Tehlikeleri sezme ve nadir fırsatları fark etme yeteneğini geliştirir.";
    skills['ranged_combat'].description = "Menzilli silahlardaki isabet ve kritik vuruş şansını artırır.";
    skills['prowess'].description = "Genel dövüş yeteneklerini ve taktiksel zekanı geliştirir.";


    const sidebar: Record<string, { label: string }> = {
        character: { label: 'Karakter' },
        inventory: { label: 'Envanter' },
        professions: { label: 'Meslekler' },
        map: { label: 'Harita' },
        hunting: { label: 'Avcılık' },
        settings: { label: 'Ayarlar' },
    };
    
    const recipes: Record<string, { name: string }> = {};
    for (const skill in craftingRecipes) {
        for (const recipe of craftingRecipes[skill]) {
            recipes[recipe.id] = { name: recipe.name };
        }
    }

    return { items, creatures, mapRegions: mapRegionsData, skills, sidebar, recipes };
};

const rarityTranslations: Record<RarityKey, string> = {
    'common': 'Sıradan',
    'uncommon': 'Sıradışı',
    'rare': 'Nadir',
    'epic': 'Epik',
    'legendary': 'Efsanevi'
};

const tr = {
    ui: {
        // Auth & General
        login: 'Giriş Yap',
        register: 'Kayıt Ol',
        username: 'Kullanıcı Adı',
        password: 'Şifre',
        confirmPassword: 'Şifreyi Onayla',
        passwordsDoNotMatch: 'Şifreler eşleşmiyor.',
        invalidCredentials: 'Geçersiz kullanıcı adı veya şifre.',
        registrationFailed: 'Kayıt başarısız oldu. Kullanıcı adı zaten alınmış olabilir.',
        unexpectedError: 'Beklenmedik bir hata oluştu.',
        createAccount: 'Hesap Oluştur',
        authTitle: 'Idle Realms',
        authSubtitle: 'Efsaneni Yarat',
        logout: 'Çıkış Yap',
        logoutConfirmTitle: 'Çıkış Yap',
        logoutConfirmMessage: 'Oturumu kapatmak istediğinizden emin misiniz?',
        back: 'Geri',
        level: 'Seviye',
        level_short: 'Sv.',
        levelWithNumber: 'Seviye {level}',
        yes: 'Evet',
        no: 'Hayır',
        
        // Character Screens
        characterSelectionTitle: 'Bir Kahraman Seç',
        welcomeBack: 'Hoş geldin, {username}. Maceraya devam etmek için bir kahraman seç.',
        play: 'Oyna',
        newCharacter: '+ Yeni Karakter Oluştur',
        maxCharactersReached: 'Maksimum karakter sayısına ulaştın (5/5).',
        deleteCharacter: 'Karakteri Sil',
        deleteCharacterConfirmTitle: 'Karakteri Sil',
        deleteCharacterConfirmMessage: '<strong>\'{characterName}\'</strong> karakterini ve ilgili tüm verileri kalıcı olarak silmek istediğinizden emin misiniz?<br/><br/><span class="font-bold text-[var(--accent-red)]">Bu işlem geri alınamaz.</span>',
        yesDelete: 'Evet, Sil',
        noCancel: 'Hayır, Vazgeç',
        syncCharacters: 'Eşitle',
        syncing: 'Eşitleniyor...',
        syncSuccess: 'Karakterler başarıyla eşitlendi!',
        syncFailed: 'Bulut ile senkronizasyon başarısız oldu: {error}. Çevrimdışı karakterler gösteriliyor.',
        createHeroTitle: 'Yeni Bir Kahraman Yarat',
        createHeroDescription: 'Maceraya atılacak kahramanına bir isim ver. Unutma, bu isim efsanelerde yankılanacak!',
        characterName: 'Karakter Adı',
        characterNamePlaceholder: 'Kahramanına bir isim ver...',
        nameMinLength: 'Karakter adı en az 3 harf olmalıdır.',
        startAdventure: 'Maceraya Başla',
        creating: 'Oluşturuluyor...',
        charSelectConfirmTitle: 'Karakter Seçimine Dön',
        charSelectConfirmMessage: 'Karakter seçim ekranına dönmek istediğinizden emin misiniz? Mevcut ilerlemeniz otomatik olarak kaydedilecektir.',
        yesReturn: 'Evet, Geri Dön',
        changeCharacter: 'Karakter Değiştir',

        // Loading States
        loadingSession: 'Oturum Kontrol Ediliyor...',
        loadingCharacters: 'Karakterler Eşitleniyor...',
        loadingGameData: 'Oyun Verileri Yükleniyor...',

        // Settings
        settings: 'Ayarlar',
        language: 'Dil',
        theme: 'Tema',
        themeMedieval: 'Orta Çağ (Karanlık)',
        themeLight: 'Açık',
        colorblindMode: 'Renk Körlüğü Modu',
        colorblindDesc: 'Renk kontrastını ve paletini ayarlar.',
        performanceMode: 'Performans Modu',
        performanceDesc: 'Görsel efektleri azaltarak performansı artırır.',
        resetAccount: 'Hesabı Sıfırla',
        resetDesc: 'Tüm ilerlemeni ve karakterlerini kalıcı olarak sil.',
        resetBtn: 'Hesabı Sıfırla',
        preferences: 'Tercihler',
        appearance: 'Görünüm',
        accessibility: 'Erişilebilirlik',
        account: 'Hesap',
        levelUpNotifications: 'Seviye Atlama Bildirimleri',
        levelUpNotificationsDesc: 'Karakter seviye atladığında bir bildirim göster.',
        milestoneNotifications: 'Meslek Kilometre Taşı Bildirimleri',
        milestoneNotificationsDesc: 'Bir meslek seviye atladığında bir bildirim göster.',
        sessionManagement: 'Oturum Yönetimi',
        sessionManagementDesc: 'Başka bir karakterle oynamak veya yeni bir karakter oluşturmak için karakter seçim ekranına dönebilirsiniz.',
        dataManagement: 'Veri Yönetimi',
        dataManagementDesc: 'Bu karakterle ilgili sorun yaşıyorsanız, tarayıcınızda depolanan tüm yerel oyun verilerini temizleyebilirsiniz.',
        clearLocalData: 'Yerel Verileri Temizle',
        clearLocalDataTitle: 'Yerel Verileri Temizle',
        clearLocalDataMessage: 'Emin misiniz? Bu karaktere ait tüm yerel ilerlemeniz silinecektir. Bir bulut kaydınız varsa, bir sonraki girişte yüklenecektir.',
        yesClear: 'Evet, Temizle',

        // Game Context Notifications & Logs
        levelUpMessage: 'Tebrikler! {level}. seviyeye ulaştın!',
        skillLevelUpMessage: '{skillName} yeteneğin {level}. seviyeye ulaştı!',
        actionStopped: '{actionName} eylemi durduruldu. Kazanımlar: {items} eşya, {xp} TP.',
        rareFind: 'Nadir bir bulgu! 1x {itemName} elde ettin!',
        craftingStoppedNoMats: '{recipeName} üretimi durduruldu: Malzemeler bitti!',
        notEnoughGold: 'Yeterli altının yok!',
        travelStarted: '{destinationName} bölgesine seyahat başladı...',
        travelFinished: '{destinationName} bölgesine vardın!',
        gameSavedCloud: 'Oyun başarıyla buluta kaydedildi!',
        gameSavedCloudAndLocal: 'Oyun buluta ve yerel olarak kaydedildi. ({time})',
        cloudSaveFailed: 'Buluta kaydetme başarısız! Oyun yerel olarak kaydedildi.',
        cloudSaveError: 'HATA: Buluta kaydedilemedi. ({error})',
        statsUpdated: 'İstatistikler güncellendi!',
        inventoryFull: 'Envanter dolu!',
        itemUsedHeal: '{itemName} kullanıldı, {healValue} can yenilendi.',
        settingsUpdated: 'Ayarlar güncellendi.',
        offlineProgressSynced: 'Çevrimdışı ilerleme bulutla eşitlendi!',
        offlineSyncFailed: 'Çevrimdışı ilerleme bulutla eşitlenemedi.',
        huntingNotReady: 'Avlanmaya hazır değilsin. Uygun bir bölgede olmalı ve bir silah kuşanmalısın.',
        huntingActionCancel: 'Bir mesleğe başlamak için av seferi durduruldu.',
        huntingDurationRefreshed: 'Av süresi yenilendi.',
        defeatedAndReturning: 'Yenildin! Topladığın ganimetlerle geri dönüyorsun.',
        returningFromHunt: 'Avdan dönülüyor. Ganimetler birazdan envanterinde olacak!',
        returnedFromHunt: 'Avdan döndün ve ganimetlerini topladın.',
        offlineHuntSummarySuccess: 'Çevrimdışıyken {encounters} yaratık avladın, {lootCount} ganimet ve {xp} TP kazandın!',
        offlineHuntSummaryDefeat: 'Çevrimdışıyken avda yenildin! Topladığın {lootCount} ganimetle geri döndün.',
        offlineGatheringSummary: 'Çevrimdışıyken {itemCount} {itemName} ürettin ve {xpGained} meslek TP kazandın!',

        // Header
        openMenu: 'Menüyü Aç',
        health: 'Can',
        xpUnit: 'TP',
        gold: 'Altın',
        saveGameTitle: 'Oyunu Kaydet',
        saving: 'Kaydediliyor...',
        saveGame: 'Kaydet',
        justNow: 'az önce',
        notifications: 'Bildirimler',
        saveGameMobile: 'Oyunu Kaydet',

        // Notifications Panel
        notificationsTitle: 'Bildirimler',
        noNewNotifications: 'Yeni bildirim yok.',
        clearAll: 'Tümünü Temizle',
        secondsAgo: '{count}s önce',
        minutesAgo: '{count}d önce',
        hoursAgo: '{count}s önce',
        daysAgo: '{count}g önce',
        monthsAgo: '{count}ay önce',
        yearsAgo: '{count}y önce',

        // Header Action Display
        goToHuntingDetails: '{huntingLabel} detaylarına git',
        activeActionHunting: 'Aktif Eylem: Avcılık',
        travelingTo: '{destinationName} bölgesine seyahat ediliyor',
        traveling: 'Seyahat Ediliyor',
        goToProfessionDetails: 'Meslek detaylarına git',
        activeActionProfession: 'Aktif Eylem: {actionName}',

        // Character Panel
        character: 'Karakter',
        profile: 'Profil',
        statistics: 'İstatistikler',
        skills: 'Yetenekler',
        professions: 'Meslekler',
        skillToCome: 'Bu yetenek için bir açıklama yakında eklenecektir.',

        // Combat Stats
        combatValues: 'Savaş Değerleri',
        attackPower: 'Saldırı Gücü',
        defense: 'Savunma',
        critChance: 'Kritik Şansı',
        critDamage: 'Kritik Hasar',
        evasionChance: 'Kaçınma Şansı',
        
        // Stat Names & Descriptions
        stat_strength: 'Güç',
        stat_agility: 'Çeviklik',
        stat_tactics: 'Taktik',
        stat_endurance: 'Dayanıklılık',
        stat_charisma: 'Karizma',
        stat_luck: 'Şans',
        stat_strength_desc: 'Fiziksel saldırı gücünü ve taşıma kapasitesini artırır.',
        stat_agility_desc: 'Saldırı hızını, kritik vuruş şansını ve kaçınmayı geliştirir.',
        stat_tactics_desc: 'Savaş alanı zekasını, kritik hasar bonusunu ve özel yeteneklerin etkinliğini artırır.',
        stat_endurance_desc: 'Maksimum can puanını ve fiziksel savunmayı artırır.',
        stat_charisma_desc: 'İkna ve ticaret yeteneğini artırır. Beklenmedik kapıları açabilir.',
        stat_luck_desc: 'Kritik vuruş şansını ve nadir eşya bulma olasılığını artırır.',
        statPoints: 'Dağıtılabilir Puan: {points}',
        reset: 'Sıfırla',
        saveChanges: 'Değişiklikleri Kaydet',
        detailsTooltip: 'Detaylar için üzerine gel',
        base: 'Temel:',
        assigned: 'Atanan:',
        equipment: 'Ekipman:',
        profession: 'Meslek:',
        total: 'Toplam:',
        
        // Inventory
        inventory: 'Envanter',
        allItems: 'Tümü',
        potions: 'İksirler',
        materials: 'Malzemeler',
        miscItems: 'Diğer',
        searchItems: 'Eşya ara...',
        slot: 'yuva',
        sort: 'Sırala',
        betterEquipment: 'Daha iyi ekipman!',
        equip: 'Kuşan',
        use: 'Kullan',
        sell: 'Sat',

        // Item Types
        itemType_equipment: 'Ekipman',
        itemType_potion: 'İksir',
        itemType_material: 'Malzeme',
        itemType_misc: 'Çeşitli',
        itemType_tool: 'Alet',
        itemType_weapon: 'Silah',
        itemType_helmet: 'Kask',
        itemType_chest: 'Göğüslük',
        itemType_legs: 'Pantolon',
        itemType_boots: 'Bot',
        itemType_gloves: 'Eldiven',
        itemType_shield: 'Kalkan',
        
        // Equipment Slots
        slot_helmet: 'Kask',
        slot_chest: 'Göğüslük',
        slot_legs: 'Pantolon',
        slot_boots: 'Bot',
        slot_weapon: 'Silah',
        slot_shield: 'Kalkan',
        slot_gloves: 'Eldiven',
        
        // Equipment Picker
        slotAndType: '{slotType} Yuvası',
        equipped: 'Kuşanılan',
        unequip: 'Çıkar',
        noItemsForSlot: 'Bu yuvaya uygun eşya yok.',
        better: 'Daha İyi',
        worse: 'Daha Kötü',

        // Skills Page
        gathering: 'Toplayıcılık',
        production: 'Üretim',
        gatheringDesc: 'Kaynak toplamak ve malzeme elde etmek için bu becerileri geliştirin.',
        productionDesc: 'Topladığınız malzemeleri değerli eşyalara dönüştürün.',
        backToSkills: 'Geri',
        xpProgress: 'TP İlerlemesi',
        gatheringEfficiency: 'Toplama Verimliliği',
        toolBonus: 'Alet Bonusu',
        speed: 'Hız',
        xpGain: 'Kazanılan TP',
        gatherTime: 'Toplama Süresi',
        craftTime: 'Üretim Süresi',
        gather: 'Topla',
        craft: 'Üret',
        stop: 'Durdur',
        locked: 'Kilitli',
        noRecipesFilter: 'Bu filtrede gösterilecek tarif yok.',
        noRecipesSkill: 'Bu meslek için henüz üretim tarifi yok.',
        noResourcesSkill: 'Bu meslekte toplanacak kaynak yok.',

        // Smithing Filters
        filterAll: 'Tümü',
        filterTools: 'Aletler',
        filterWeapons: 'Silahlar',
        filterHelmets: 'Kasklar',
        filterChests: 'Göğüslükler',
        filterLegs: 'Pantolonlar',
        filterBoots: 'Botlar',
        filterGloves: 'Eldivenler',

        // Hunting Page
        huntPreparation: 'Av Hazırlığı',
        safetyWarningSafe: 'Avcılık seviyeniz bu bölge için yeterli, güvenle avlanabilirsiniz.',
        safetyWarningDanger: 'Avcılık seviyeniz düşük olduğundan nadir yaratık ve ganimet yakalama şansınız düşük olup, ölüm riski bulunmaktadır.',
        wildernessOf: '{regionName} Vahşi Doğası',
        exploreCreaturesAndLoot: 'Bu bölgedeki yaratıkları ve potansiyel ganimetleri keşfedin.',
        possibleLoot: 'Olası Ganimetler',
        requirements: 'Gereksinimler',
        reqWeapon: 'Bir silah kuşanmış olmalısın.',
        reqCreatures: 'Bölgede avlanacak yaratıklar olmalı.',
        supportSlot: 'Destek Yuvası',
        selectItem: 'Eşya Seç',
        supportSlotDesc: 'Canın %30\'un altına düştüğünde otomatik olarak kullanılır.',
        selectSupportItem: 'Destek Eşyası Seç',
        noSuitableItems: 'Envanterde uygun eşya yok.',
        removeSelectedItem: 'Seçili Eşyayı Kaldır',
        startHunt: 'Avı Başlat',
        huntInProgress: 'Av Devam Ediyor',
        returningFromHuntTitle: 'Avdan Dönülüyor',
        returningToTown: 'Kasabaya Geri Dönülüyor...',
        lootAndXpSoon: 'Ganimet ve tecrübe puanları birazdan eklenecek.',
        timeRemaining: 'KALAN SÜRE',
        support: 'DESTEK',
        health_cap: 'SAĞLIK',
        activeSupport: 'Aktif Destek: {itemName}',
        refresh: 'Yenile',
        return: 'Geri Dön',
        fighting: 'Savaşılıyor: {creatureName}',
        exploringTheWilderness: 'Vahşi doğa keşfediliyor...',
        keepAnEyeOnTheLog: 'Detaylar için av günlüğünü takip et.',
        searchingForPrey: 'Av Aranıyor...',
        collectedLoot: 'Toplanan Ganimetler',
        noLootCollected: 'Henüz ganimet toplanmadı.',
        huntingLog: 'Av Günlüğü',
        lootObtained: '{quantity}x {itemName} elde edildi.',
        noLootFound: 'Yaratığın üzerinde değerli bir şey bulunamadı.',
        defeatedAndReturningLog: 'Yaralandın ve kasabaya geri çekiliyorsun...',
        returningFromHuntLog: 'Avdan dönülüyor. Toplam ganimet envantere eklenecek.',
        huntStarted: 'Av başladı. Bölgedeki yaratıklar aranıyor.',
        noSuitableCreaturesLeft: 'Bu alanda seviyene uygun yaratık kalmadı.',
        encounteredCreature: 'Vahşi bir {creatureName} ile karşılaştın!',
        itemUsedHealInHunt: '{itemName} kullanıldı ve {healAmount} can yenilendi.',
        searchingForNewPrey: 'Yeni av aranıyor...',
        huntFlavor_1: 'Çevreye bakınıyorsun...',
        huntFlavor_2: 'Hışırtılar duyuyorsun, ama sadece rüzgar.',
        huntFlavor_3: 'Bir an için bir gölge gördüğünü sandın. Gözlerin sana oyun oynuyor.',
        huntFlavor_4: 'İzler arıyorsun...',
        huntFlavor_5: 'Sessizlik... fazla sessizlik.',
        huntFlavor_6: 'Kırık bir dal parçası, yakınlarda bir şey olmalı.',
        huntFlavor_7: 'Uzakta bir uluma sesi yankılandı.',
        
        // Map Page
        worldMap: 'Dünya Haritası',
        exploreTheWorld: 'Dünyayı Keşfet',
        exploreTheWorldDesc: 'Yeni av sahaları ve maceralar seni bekliyor.',
        openWorldMap: 'Dünya Haritasını Aç',
        backToMap: 'Haritaya Geri Dön',
        creaturesInRegion: 'Bölgedeki Yaratıklar',
        noCreaturesHere: 'Bu bölgede bilinen bir yaratık yok.',
        travelInfo: 'Seyahat Bilgisi',
        levelReqWithColon: 'Gerekli Seviye:',
        cost: 'Maliyet:',
        duration: 'Süre:',
        travelToRegion: 'Bu Bölgeye Git',
        closeMap: 'Haritayı Kapat',
        seeDetails: 'Detayları gör: {regionName}',
        clickForDetails: 'Detaylar için tıkla',
        youAreHere: 'Buradasın',
        youAreIn: '{regionName} bölgesindesin',

        // Profession Bonus Descriptions
        profBonus_strength: 'Bu meslekteki ustalığın fiziksel saldırı gücünü ve taşıma kapasitesini artırır.',
        profBonus_agility: 'Bu meslekteki ustalığın saldırı hızını, kritik vuruş ve kaçınma şansını geliştirir.',
        profBonus_tactics: 'Bu meslekteki ustalığın kritik hasar bonusunu ve özel yeteneklerin etkinliğini artırır.',
        profBonus_endurance: 'Bu meslekteki ustalığın maksimum can puanını ve fiziksel savunmayı artırır.',
        profBonus_charisma: 'Bu meslekteki ustalığın ikna ve ticaret yeteneğini artırır.',
        profBonus_luck: 'Bu meslekteki ustalığın kritik vuruş ve nadir eşya bulma şansını artırır.',

        // Encounter Messages
        encounterPrelude_1: 'Çalılıklardan bir hışırtı duyuluyor...',
        encounterPrelude_2: 'Ufukta bir gölge belirdi.',
        encounterPrelude_3: 'Sessizliği keskin bir çığlık bozdu.',
        encounterPrelude_4: 'Toprak hafifçe titriyor, yakınlarda bir şey var.',
        encounterPrelude_5: 'İleride bir hareketlilik fark ettin.',
        encounterPrelude_6: 'Taze izler buldun, av yakın olmalı.',
        encounterPrelude_7: 'Etrafına bakarken bir av kokusu aldın.',
        encounterPrelude_8: 'Bir anlık sessizlik, fırtına öncesi gibi...',
        encounterPrelude_9: 'Yakınlarda bir su birikintisi gördün, hayvanlar su içmeye gelebilir.',
        encounterPrelude_10: 'Garip, doğal olmayan bir ses duydun.',
        encounterPrelude_11: 'Yanından hızla bir gölge geçti.',
        encounterPrelude_12: 'Bir akrep gördün, yaklaşıyorsun.',
        encounterPrelude_13: 'Etrafına bakınırken bir {creatureName} gördün.',
        
        encounterSuccessMessage_1: 'Zorlu bir mücadele sonrası {creatureName} avladın, ancak {damageTaken} hasar aldın.',
        encounterSuccessMessage_2: 'Hızlı bir saldırıyla {creatureName} avlayıp, {damageTaken} hasar aldın.',
        encounterSuccessMessage_3: 'Zorlu bir mücadele sonrası {creatureName} avlandı. Bu sırada {damageTaken} hasar aldın.',
        encounterSuccessMessage_4: 'Dikkatli bir takip sonrası {creatureName} avlandı. Çatışmada {damageTaken} hasar aldın.',
        encounterSuccessMessage_5: '{creatureName} saldırına hazırlıksız yakalandı ve avlandı. Bu sana sadece {damageTaken} hasara mal oldu.',
        encounterSuccessMessage_6: 'Uzun bir kovalama sonunda {creatureName} yoruldu ve av oldu. {damageTaken} hasar aldın.',
        encounterSuccessMessage_7: 'Sessizce yaklaşıp {creatureName} gafil avladın! Bu sana {damageTaken} hasara mal oldu.',
        encounterSuccessMessage_8: 'Kahramanca bir savaşın ardından {creatureName} mağlup edildi. {damageTaken} hasar aldın.',
    },
    game: getGameTranslations(),
    rarity: rarityTranslations,
};

export default tr;