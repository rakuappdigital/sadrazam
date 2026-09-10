# Divan: Sadrazam — Proje Rehberi

Bu dosya, küçük değişiklik/talep isteklerinde tüm kod tabanını baştan keşfetmeden
hızlıca doğru yere gidebilmek için var. **Her oturumda önce bunu oku.** Burada
yazan bir şey artık doğru değilse (kod değişmiş), gerçek dosyayı kontrol edip
BU DOSYAYI GÜNCELLE — bayatlamasın.

## 1. En kritik kural: 3 kopya senkron sorunu

Web dosyaları (`game.js`, `index.html`, `style.css`, `translations.js`,
`rewardedads.js`, `gamecenter.js`, `sounds.js`, `haptics.js`,
`revenuecat.bundle.js`, `data/cards.json`, `assets/`) **üç ayrı yerde** durur:

1. **Kök dizin** (`/Users/mac/Projects/sadrazam-web/`) — asıl düzenleme yeri, HER ZAMAN burayı düzenle.
2. **`www/`** — Capacitor'ın gerçek `webDir`'i (`capacitor.config.json`'da tanımlı). `cap sync ios` buradan okur.
3. **`ios/App/App/public/`** — Xcode'un derlediği gerçek kopya, `cap sync` ile (2)'den gelir.

**Bir dosyayı değiştirdikten sonra HER ZAMAN:**
```bash
cd /Users/mac/Projects/sadrazam-web
cp <değişen dosya(lar)> www/<aynı yol>
cp <değişen dosya(lar)> ios/App/App/public/<aynı yol>
cp <değişen dosya(lar)> /Users/mac/Projects/sadrazamtest/<aynı yol> 2>/dev/null   # ayrı, eski test kopyası — varsa senkronla
./node_modules/.bin/cap sync ios
diff <dosya> www/<dosya> && diff <dosya> ios/App/App/public/<dosya> && echo OK
```
`cp a b www/ ios/App/App/public/` gibi çoklu-hedef syntax YANLIŞ ÇALIŞIR (cp
birden fazla hedefe kopyalamaz) — her hedefe ayrı `cp` komutu at, yoksa
`www/cards.json` gibi yanlış yere serpiştirilmiş "stray" dosyalar oluşur.

## 2. Build alma / App Store Connect'e gönderme

Kullanıcı "build al" dediğinde Xcode'u elle açmasını beklemez — komut satırından
tam otomatik yapılır. **Her archive öncesi build numarasını artır** (aynı
versiyon+build ASC'de zaten varsa upload reddedilir).

```bash
# 1) Versiyon/build güncelle (gerekirse)
sed -i '' 's/CURRENT_PROJECT_VERSION = ESKİ;/CURRENT_PROJECT_VERSION = YENİ;/g; s/MARKETING_VERSION = ESKİ;/MARKETING_VERSION = YENİ;/g' ios/App/App.xcodeproj/project.pbxproj

# 2) Sync
./node_modules/.bin/cap sync ios

# 3) Archive
cd ios/App
xcodebuild -project App.xcodeproj -scheme App -configuration Release -archivePath /tmp/Sadrazam.xcarchive archive

# 4) Export (ExportOptions.plist'i /tmp'ye yaz, aşağıdaki içerikle)
xcodebuild -exportArchive -archivePath /tmp/Sadrazam.xcarchive -exportPath /tmp/SadrazamExport -exportOptionsPlist /tmp/ExportOptions.plist

# 5) Upload (API key'i geçici olarak ~/private_keys/'e kopyala, işten sonra SİL)
mkdir -p ~/private_keys && cp ~/Desktop/AuthKey_CPP9BC37NY.p8 ~/private_keys/
xcrun altool --upload-app -f /tmp/SadrazamExport/App.ipa -t ios --apiKey CPP9BC37NY --apiIssuer bd32dbb1-cdfc-446b-8553-84464c16d280
rm -f ~/private_keys/AuthKey_CPP9BC37NY.p8; rmdir ~/private_keys 2>/dev/null
rm -rf /tmp/Sadrazam.xcarchive /tmp/SadrazamExport /tmp/ExportOptions.plist
```

**ExportOptions.plist içeriği (sabit, değişmez):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>teamID</key><string>JF86RYY9ZS</string>
  <key>signingStyle</key><string>manual</string>
  <key>signingCertificate</key><string>Apple Distribution</string>
  <key>provisioningProfiles</key><dict>
    <key>com.rakuappdigital.sadrazam</key><string>Divan Sadrazam AppStore</string>
  </dict>
  <key>uploadSymbols</key><true/>
</dict></plist>
```

**Kimlik bilgileri:**
- Bundle ID: `com.rakuappdigital.sadrazam` · App Store Connect App ID: `6783881003`
- Team ID: `JF86RYY9ZS` · İmzalama sertifikası: keychain'de "Apple Distribution: DOGUS LUTFU TELATAR" olarak zaten kurulu
- Provisioning profile: "Divan Sadrazam AppStore" (`~/Library/MobileDevice/Provisioning Profiles/791268a5-0afd-493b-99c6-71cdbf7855f0.mobileprovision`, orijinali `~/Desktop/Divan_Sadrazam_AppStore.mobileprovision`)
- App Store Connect API: Issuer ID `bd32dbb1-cdfc-446b-8553-84464c16d280`, Key ID `CPP9BC37NY`, `.p8` dosyası `~/Desktop/AuthKey_CPP9BC37NY.p8` (kalıcı olarak orada duruyor, sadece upload sırasında geçici kopya `~/private_keys/`'e alınır, iş bitince silinir)
- ASC API read-only sorgular için `asc_common.py` yardımcı script'ini scratchpad'e yazıp kullan (issuer/key id'leri yukarıdaki gibi, `BASE = "https://api.appstoreconnect.apple.com/v1"`)

**Upload sonrası:** Build işlenmesi (Apple tarafında) dakikalar-saatler sürebilir.
İşlenince ASC'de ilgili versiyona **build manuel/API ile bağlanmalı** — otomatik
olmuyor. `GET /v1/appStoreVersions/{id}/build` ile kontrol edilebilir.

**Simülatörde gerçek çalıştırma testi** (build hatasını gerçekten yakalamak için,
"muhtemelen çalışır" demek yerine): ayrı bir `-sdk iphonesimulator -destination
'id=<simülatör-udid>'` build alıp `xcrun simctl install/launch` ile aç, PID'in
canlı kaldığını (`ps -p <pid>`) ve ekran görüntüsünü (`xcrun simctl io <udid>
screenshot`) kontrol et. Archive ile üretilen `.app` **simülatörde çalışmaz**
(device mimarisi farklı) — ayrı bir simülatör build'i gerekir.

## 3. Card sistemi mimarisi (game.js)

- **Tek kaynak:** `data/cards.json` → `{ "cards": [...] }`, her kart:
  `id, character, character_name(+_en), text(+_en), left/right_text(+_en),
  left/right_effects, left/right_flags_set, required_flags, excluded_flags,
  min_year, weight, category, type(opsiyonel), triggers_on_left/right,
  trigger_delay, faction, stat_conditions, sultan_specific`
- `character` alanı = `assets/characters/<character>.jpg` dosya adı (uzantısız).
  Yeni karakter/kart eklerken bu görsel gerçekten var mı **HTTP fetch ile
  doğrula**, "muhtemelen vardır" deme.
- **`type` alanı yoksa** → normal sağa/sola kaydırılan karar kartı.
- **`type: "letter"`** → `showLetterCard()`, tek "DEVAM" butonu, sadece
  `right_effects`/`right_flags_set` uygulanır (sol seçenek yok). **DİKKAT:**
  `showLetterCard()` kendi içinde `hideNegotiationPanel()` çağırır, bu da
  `#letter-devam-btn`'e `style.display="none"` (inline) uygular — fonksiyonun
  SONUNDA bunu `devamBtn.style.display = ""` ile **açıkça geri almak** şart,
  yoksa buton görünür boyuta hiç gelmez (bu gerçek, canlıda görülmüş bir bug'dı).
  Ayrıca mektup metni uzun olabiliyor — `.letter-card #card-text` `max-height`
  + `overflow-y:auto` ile sınırlı, `.letter-card #card-image` küçültülmüş,
  `#card-bottom` altta butona yer ayırıyor (`padding-bottom`). Bunlara dokunma.
- **`type: "chance"`** → `showChanceCard()`, şans/kader kartı.
- **`type: "negotiation"`** → `showNegotiationCard()`, çoklu seçenek paneli.
- **`type: "padisah_ziyaret"`** → sadece `decide()` içinde özel dallanma,
  `showPadisahZiyareti()` ile tetiklenir, görsel her zaman hardcoded `1-sultan.jpg`.
- **`type: "easter"`** → `showEasterCard()`, tek özel buton (`easter_type` alt
  tiplere göre dallanır: `hekim_dinlenme`, `sehzade_meydan`, `eyalet_trigger`,
  `year_summary`, `divan_sahnesi`, `donum`, `gizli_nitelik`, `golge`,
  `eyalet_isyan`, vb.). Bu kartlar genelde `cards.json`'da DEĞİL, `game.js`
  içinde `getXxxCard()` fonksiyonlarıyla ÇALIŞMA ANINDA üretilir.
- **`character: "1-sultan"`** kartları (kararlar + mektuplar + `kader_zar_5`)
  `dealNext()`'te ÖZEL sıraya tabi: önce `type` bazlı dispatch (easter →
  negotiation → letter → chance) çalışır, KALANLAR (gerçek `type`'ı olmayan
  13 karar kartı) `showSultanEventCard()`'a düşer. **Bu sıra bilinçli** — daha
  önce `character==="1-sultan"` kontrolü her şeyden ÖNCE geliyordu ve mektup
  ile şans kartlarını da yanlışlıkla generic bir "jenerik mood mesajı"na
  yönlendiriyordu (13 karar kartı + 4 mektup gerçek oyunda HİÇ çalışmıyordu,
  aylarca fark edilmedi). Bu sırayı asla eskisine çevirme.
- **`getEligible()` özel kuralları:** `weight===1 && !arc_id` olan kartlar
  normal rastgele havuzdan asla çıkmaz (sadece `forcedQueue`/zincirleme ile
  gelir — "trigger-only" kart idiomu budur). `character==="1-sultan"` kararları
  `year>=3` VE stat ortalaması dengesizken (ort<38 veya >62) gelir.
- **`weightedPick()`** gerçek ağırlıklı rastgele (mevsim çarpanı dahil) —
  sorunlu değil, sağlıklı çalışıyor.
- **`forcedQueue`** = FIFO zorla-gösterme kuyruğu (`push`=arkaya ekle,
  `getNextCard()` içinde `shift()`=önden al). `scheduledCards` = gecikmeli
  (kart sayısına göre) zamanlanmış tetikleyiciler, `checkScheduledCards()` her
  `dealNext()`'te kontrol edip süresi dolanları `forcedQueue`'ya aktarır.

## 4. Kritik sabitler

- `CARDS_PER_YEAR = 24` (satır ~6) — **çok önemli**, yeni bir "N kartta bir
  gelsin" eşiği yazarken bunu referans al, yoksa özel kartlar 1. yıla sıkışır
  (mektup zamanlamasında tam bu hata oldu, düzeltildi — bkz. `_mektup*Threshold`).
- `FREE_YEAR_LIMIT = 3` — ücretsiz sürüm yıl sınırı (paywall burada tetiklenir).
- `DECLINED_YEAR_LIMIT = 2` — paywall bir kez reddedilince (kalıcı
  `sadrazam_paywall_declined` flag), sonraki TÜM oyunlar bu yılda **kesin**
  ölümle biter (`_actuallyTriggerGameOver` çağrılır, `triggerGameOver` DEĞİL —
  aksi halde İkinci Şans reklam/akçe ile bu sınır bedavaya atlatılabiliyordu,
  gerçek bug'dı, düzeltildi).
- Restart-count paywall: her 3 yeniden başlatmada bir (`sadrazam_restart_count
  % 3 === 0`), Tam Sürüm yoksa VE daha önce hiç reddedilmediyse, oyun
  başlamadan **kesin/reddedilemez** paywall gösterilir (`_paywallAtGameStart`).
  Eskiden "Oynamaya Devam Et" ile bedavaya geçilebilen bir tuzaktı, düzeltildi.
- Sıhhat: sadece Hekimbaşı'nın dinlenme teklifi (sağlık ≤40, kritikte ≤20)
  artırabilir (+20, karşılığında 2 tur boyunca 4 stat da -5). Başka HİÇBİR
  şey (item/danışman/kart) sıhhatı artırmaz. Azalma: her karar -1, yıl sonu
  pasif -3 (zorluk çarpanlı).

## 5. Monetizasyon

- **RevenueCat** (`@revenuecat/purchases-capacitor`) → Tam Sürüm (entitlement:
  `full_version`) + 4 akçe paketi (consumable: `akce10/20/50/100`).
  `FREEMIUM_ENABLED` gerçek API key girilince otomatik `true` olur (güvenlik
  kilidi, placeholder'la asla tetiklenmez).
- **Akçe kredisi TEK bir yerden işlenir:** `processAkceTransactions(customerInfo)`
  — `nonSubscriptionTransactions` listesindeki `transactionIdentifier`'a göre
  tekilleştirir (`localStorage: sadrazam_akce_tx_processed`). Hem normal
  satın alma (`purchaseAkcePack`) hem promosyon kodu (native redemption sheet,
  `RC.addCustomerInfoUpdateListener`) hem `restorePurchases` BU fonksiyona
  akar. **`addAkce()`'i asla doğrudan bir satın alma sonucunda çağırma** —
  promosyon kodları o zaman hiç kredilenmiyordu (gerçek bug'dı, düzeltildi).
- **AdMob** (`@capacitor-community/admob`) → İkinci Şans'taki ödüllü reklam.
  `rewardedads.js`'te `REWARDED_AD_UNIT_ID !== "REWARDED_AD_UNIT_ID_BURAYA"`
  güvenlik kilidi var — gerçek ID girilmeden native SDK hiç başlamaz (yanlış
  App ID ile `GADMobileAds.start()` çökebilir). Gerçek ID'ler zaten girili:
  App ID `ca-app-pub-7882143822556333~2272928163`, Rewarded Unit
  `ca-app-pub-7882143822556333/2394900440`. `Info.plist`'te
  `GADApplicationIdentifier`/`SKAdNetworkItems`/`NSUserTrackingUsageDescription`
  ayarlı. `app-ads.txt` hem kökte hem `www/`'de (`google.com,
  pub-7882143822556333, DIRECT, f08c47fec0942fa0`).
- **Promosyon kodu UI'ı:** Ayarlar'da "PROMOSYON KODU" butonu →
  `RC.presentCodeRedemptionSheet()` (Apple'ın NATİF kod giriş ekranı — kendi
  metin kutusu YAPMA, iOS'ta bu şekilde çalışmıyor).

## 6. Web sitesi (sadrazam-web.vercel.app)

- Aynı Vercel projesi hem **gerçek oyunun web/test versiyonunu** (`www/`
  içeriği = kök `index.html`) hem **support.html/privacy.html/app-ads.txt**'i
  aynı domainde barındırıyor.
- Kök adres (`/`) artık genel ziyaretçilere KAPALI — `index.html`'de
  `#gate-screen`/`#real-app` mekanizması var: `?access=SadrazamGizli37`
  parametresiyle bir kez girilince `localStorage.sadrazam_web_access='1'`
  kalıcı olarak set edilir, o tarayıcıda bir daha parametre gerekmez.
  Kullanıcının kendi erişimi için bu link. **Support/privacy/app-ads.txt bu
  kapıdan etkilenmez, her zaman herkese açık.**
- Deploy: `vercel --prod --yes` (proje köründen). **Bu canlıya çıkan bir
  işlem — kullanıcıdan onay almadan deploy etme.**

## 7. Test metodolojisi

- Puppeteer, `/Users/mac/Projects/sadrazamtest/node_modules/puppeteer`
  yolundan `require` edilir (ayrı bir proje ama paket oradan kullanılıyor).
- Yerel sunucu: `python3 -m http.server <port> --directory
  /Users/mac/Projects/sadrazam-web` (kökten servis et, `www/`'den değil —
  kaynak dosyaları test ediyoruz).
- **Gerçek oyun akışını simüle ederken:**
  - `localStorage.setItem('sadrazam_tutorial_done','1')` yoksa `startGame()`
    tutorial'da takılı kalır, `dealNext()` hiç çağrılmaz.
  - `startGame()` `introScreen`'i KENDİSİ gizlemez (gerçek UI akışı
    `confirmAdvisor()` gibi bir yerde yapar) — DOM tıklama/hit-test testi
    yapıyorsan `introScreen.style.display = "none"` elle ekle, yoksa
    z-index/element-üstte-kim-var testleri yanlış sonuç verir.
  - `_setFullVersionUnlocked(true)` yapmadan uzun (yıl 3+) bir oynanış testi
    koşarsan paywall'a takılırsın ve `decide()` aynı karta döngüsel takılı
    kalabilir gibi görünür (**gerçek bug değil**, testin paywall UI'ını
    handle etmemesi) — bu tam olarak yaşandı, mektup zamanlaması ilk seferde
    "bozuk" göründü ama sebebi buydu.
  - `page.evaluate()` içinde DOM `.click()` gerçek fare/touch stacking'ini
    test ETMEZ (element gizli/0-boyutlu olsa bile tetiklenir) — gerçek
    tıklanabilirlik testi için `page.mouse.click(x, y)` + `elementFromPoint`
    kullan (letter-devam-btn'nin inline-style bug'ı böyle bulundu).
  - Rastgele eşik/gecikme testlerinde TEK bir `startGame()` yetmez — 5-8 kez
    çalıştırıp değerlerin gerçekten değiştiğini doğrula.
- Her testten sonra: `pkill -f "http.server <port>"`, scratchpad'deki geçici
  `.js`/`.png` dosyalarını sil.

## 8. Genel kural

Değişiklik sonrası HER ZAMAN: `node --check game.js` (syntax) → ilgili
Puppeteer testi (gerçek senaryo, gerçek tıklama/timing) → 3 kopyaya senkron
(§1) → (native etkiliyorsa) `cap sync ios` + gerekirse simülatör smoke-test
(§2). Commit sadece açıkça istenince yapılır. Deploy/build-gönderim gibi
görünürlüğü olan işlemler öncesi kısa bir onay iste (zaten sık talep
ediliyorsa tekrar sorma, ama versiyon numarası gibi somut kararları kullanıcı
belirtmediyse sorup netleştir).
