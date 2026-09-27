# Divan: Sadrazam — Proje Rehberi

Bu dosya, küçük değişiklik/talep isteklerinde tüm kod tabanını baştan keşfetmeden
hızlıca doğru yere gidebilmek için var. **Her oturumda önce bunu oku.** Burada
yazan bir şey artık doğru değilse (kod değişmiş), gerçek dosyayı kontrol edip
BU DOSYAYI GÜNCELLE — bayatlamasın.

## 0. TEK PROJE — burası (kritik, en önemli kural)

- **`/Users/mac/Projects/sadrazam-web` (→ GitHub `rakuappdigital/sadrazam`) tüm
  iOS Sadrazam işleri için TEK ve YEGANE proje.** Bütün güncelleme, ekleme ve
  düzeltmeler burada yapılır. Karışıklık istenmiyor. Kullanıcı hangi pencerede/
  terminalde olursa olsun "sadrazam" dediğinde DOĞRUDAN burayı aç — başka
  hiçbir path'i varsayma, sorma, kontrol etme: burası.
- **`/Users/mac/Projects/sadrazamtest` (→ GitHub `rakuappdigital/sadrazamtest`)
  2 Eylül 2026'dan beri buradan KOPMUŞ, bayatlamış, terk edilmiş bir çatal.**
  Yerel klasörü silindi ama GitHub deposu hâlâ duruyor (silinmesi riskli
  bulunduğu için bilerek silinmedi — bkz. 2026-09-19 kararı). **BUNDAN
  BİR DAHA ASLA build/archive alınmayacak, ASLA klonlanmayacak, ASLA senkron
  hedefi ya da "diğer kopya" olarak kullanılmayacak.** 2026-09-19'da anlaşıldı
  ki App Store'a yüklenen bir build (1.3.7/build 20) yanlışlıkla oradan
  alınmıştı — bu üzerinden bir daha ASLA tekrarlanmayacak bir hata. Referans
  almak (özellik karşılaştırması için okumak) istisnai olarak gerekebilir ama
  bunun için bile yerel klonlama YERİNE `git show <repo-url>:<dosya>` gibi
  salt-okunur yöntemler tercih edilsin, ve kullanıcıya açıkça söylenmeden asla
  yapılmasın. Hangi klasörde olduğundan HER ZAMAN emin ol (`pwd`), `git
  remote -v` ile `rakuappdigital/sadrazam.git` (sadrazamtest DEĞİL) olduğunu
  doğrula.
- Başka bir dosya/sürüm/repo ile karıştırıp yanlış yere commit ya da deploy
  etmek — bunu bir daha yapma. Şüphede kalırsan işleme başlamadan önce
  `pwd` + `git remote -v` ile doğrula, sonra devam et.
- Sorun bildirildiğinde önce ilgili kodu/çağrı zincirini tam izleyip kanıtla,
  sonra cevap ver — tahmin/varsayımla ilk cevabı verme.
- Her düzeltme/ekleme sonrası **mutlaka commit ve deploy** yapılır (aşağıdaki
  §8'deki eski "commit sadece açıkça istenince" talimatı artık GEÇERSİZ —
  commit her zaman yapılır, deploy/App Store gönderimi gibi geri dönüşü zor
  adımlar için hâlâ kısa onay istenir).

## 1. En kritik kural: 2 kopya senkron sorunu (ARTIK 2, 3 DEĞİL)

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

# 5) Upload (.p8 ~/.appstoreconnect/private_keys/ içinde, altool otomatik bulur)
xcrun altool --upload-app -f /tmp/SadrazamExport/App.ipa -t ios --apiKey CPP9BC37NY --apiIssuer bd32dbb1-cdfc-446b-8553-84464c16d280
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
- App Store Connect API: Issuer ID `bd32dbb1-cdfc-446b-8553-84464c16d280`, Key ID `CPP9BC37NY`, `.p8` dosyası `~/.appstoreconnect/private_keys/AuthKey_CPP9BC37NY.p8` (altool orayı otomatik bulur, kopyalamaya gerek yok)
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

## 3b. Gecikmeli sonuçlar ve birleşik sonuç (düğüm) — 26 Eylül 2026

**Oyunda "iplik/düğüm" kelimesi GEÇMEZ** (kullanıcı kararı). Kod içi ad: knot.

- **Gecikmeli sonuç kaynakları:** (1) kartta `triggers_on_left/right` +
  `trigger_delay`, (2) `CHAIN_RULES` (bayrak → kart; bayrak adı cards.json'daki
  `*_flags_set` ile BİREBİR aynı olmalı, `altCardId` = asıl kart engelliyse
  alternatif), (3) grup baskısı. Hepsi `scheduleConsequence()` ile kuyruğa girer
  (`playsAtSchedule` saklanır).
- **Korumalar:** zamanlanmış kart beklerken destede rastgele çekilmez
  (`getEligible`), bu arada oynandıysa ya da "çözüldü" bayrağı açıksa vakti
  gelince gösterilmez (`_resolveDueConsequence`), `once` zinciri
  `activeFlags._chain_fired_<kart>` ile bir kez.
- **Sonuç kartı şablonu:** `weight: 1` (sadece zamanlı gelir),
  `required_flags: [kaynak bayrağı]`, iki tarafta da `<id>_resolved` bayrağı +
  `excluded_flags: [<id>_resolved]`. TR ≤ ~160, EN ≤ ~180 karakter.
- **Birleşik kart:** cards.json'da `knot_of: [A, B]` + `knot_characters:
  [portre1, portre2]` (FARKLI iki portre; `character` = portre1). A'nın vakti
  gelince B `KNOT_WINDOW` (8) kart içinde bekliyorsa ikisi yerine birleşik kart
  gelir, A ve B'nin çözüldü bayrakları açılır. Metin TR ≤ 150 / EN ≤ 170 (üstte
  "İki kararınız aynı gün geri döndü" satırı var).
- **Tematik çekim:** bekleyen sonucun birleşik ortağının kaynak kartı, bu oyunda
  hiç çıkmadıysa destede `KNOT_PULL_BOOST` (25x). Doğal oyunda ölçüm: her 2-3
  oyunda bir birleşme. Daha sık yapma — sadece 15 birleşik kart var.
- **Denge (27 Eylül 2026 simülasyonu, 80 oyun, %70 dengeci oyuncu):** yeni
  sürüm medyan 78 kart (eski 74), hazine ölümü %24 (eski %25). Yeni sonuç
  kartı yazarken: her kartta hazineyi koruyan bir seçenek olsun (iki seçenek de
  hazine eksi → sadece bilinçli ikilem kartında), tek etki ≤ 15.
- **Soruşturma:** 18 hain adayının her kartında büyüteç (TRAITOR_CANDIDATES).
  Sultan sabrı −3 cezası SADECE kendi `investigate_text`'i olan kartlarda —
  her kartta olunca her şeyi soruşturan oyuncu 28 kartta azlediliyordu.
- **Görünüm:** `renderKnotVisual()` (dealNext, flyOff, Padişah ziyaretinde
  sıfırlanır); `#card-image-knot` + `#card-knot-seam` absolute +
  pointer-events:none; birleşik kartta nefes animasyonu kapalı.
- Test betikleri (Puppeteer, scratchpad'te yeniden yazılabilir): her zincir
  için zamanlama + negatif taraf, kaydet/kapat/devam (eski kayıt biçimi dahil),
  birleşik kartlar uçtan uca, 375x667 TR/EN taşma, uzun doğal oyun.

## 3c. Karar-sonucu karakterleri + Büyük İstanbul Yangını (27 Eylül 2026)

Hepsi oyuncunun kararına bağlı gelir (rastgele değil). Kaynak bayraklar mevcut
kartlara eklendi; zamanlama `CHAIN_RULES` / kartın `triggers_on_*` alanı.

- **Celali Reisi** (`celali-reisi`): `celali_kivilcimi` ← köylüyü zorla geri
  gönderme (`koylu_topraktan_kacti`/`dugum_koyler_bosaliyor` sol) ya da ağa
  zulmüne göz yumma (`aga_zulum_buyudu` sol) → 12 kart → `celali_1` → sefer
  (`celali_2_sefer`) / pazarlık (`celali_2_pazarlik` → ret: `celali_3_kusatma`).
  Affedilirse `celali_sancakbeyi` → iki tekrar eden kart.
- **Sürgünden Dönen Genç** (`surgun-genc`): `cocuk_geri_donuyor` sağ →
  `genc_sadik` → 3 istihbarat kartı. `genc_hain_ipucu` metnindeki `{HAIN}`
  dealNext'te gizli hainin adıyla değişir; "izle" → `traitorInvestigated ≥ 2`
  (hain fark edilmiş sayılır). Hain açıklanınca/55. karttan sonra gelmez
  (`getEligible` özel kuralı).
- **Ceneviz Podestası** (`ceneviz-podestasi`): `ceneviz_borc_ertelendi` ←
  `borc_vadesi_geldi` sol / `dugum_iki_alacakli` sol → 10 kart → `podesta_1`
  → depolar verilirse 12 kart → `podesta_2_depolar`.
- **Hint Tabibi** (`hint-tabibi`): `ilac_tartismasi` sağ → `hint_tabibi_davet`
  → 6 kart → `hint_tabibi_gelis` → kabul: `hint_tabibi_saraya`. Salgın
  bayrağı açıkken (veba_önlemi / kriz_veba_karantina / saray_salgini_gormezden
  / su_sorunu_birakildi) daha iyi seçenekli tabip kartları.
- **Müneccimbaşı** (`muneccimbasi`): kodla kuyruğa girer
  (`_maybeQueueMuneccim`, decide sonunda). ≥2 okunmamış sonuç, 20. karttan
  sonra, 30 kart ara, %35, oyun başına 2. İlki (`muneccim_fal_1`) en yakın
  sonucu bedava açar; ikincisi Kâtibin Notu penceresini (başlık MÜNECCİMBAŞI)
  reklam/1 akçe ile açar. Sayaçlar `_muneccimN/_muneccimAt` kayıtta.
  **Not:** kayıt `activeFlags`'i sadece ANAHTAR listesi olarak saklar —
  bayraklara sayı/değer yazma, yüklenince `true` olur.
- **Büyük İstanbul Yangını** (`buyuk_istanbul_yangini`, portre
  `felaket-yangin`): `CHAIN_RULES_MULTI` — `göç_dalgası` + (`kanal_yapılmadı`
  ya da `su_sorunu_birakildi`), sıra fark etmez → 14 kart. Vakti gelmeden su
  yolu yaptırılırsa (`su_yolu_yapildi`) çıkmaz. → 6 kart → `yangin_sonrasi`.
- **Portreler (27 Eylül 2026 eklendi):** kullanıcının ürettiği 766x1024
  görsellerin sol/üst krem kenarı ve sağ bakır şeridi kırpılıp 1200x1600 (3:4,
  kartın gösterim oranı) yapıldı. `CHARACTER_IMAGE_FALLBACK` güvenlik ağı
  olarak duruyor (dosya bir gün eksik olursa benzer portre).
- Test: scratchpad `chars_test.js` (20 senaryo) + `ov_chars.js` (375x667 TR/EN).

## 3d. Görsel paket (27 Eylül 2026)

- **Mevsim atmosferi:** `SeasonFx` (game.js, mevsim sisteminin yanında).
  `#season-fx` canvas'ı `#game`'in İLK çocuğu, `z-index:-1` → kart/barlar
  her zaman üstte, dokunmayı engellemez. Kış kar / bahar lale / yaz toz zerresi
  + huzme / sonbahar yaprak; mevsim değişince eskiler ~1 sn'de söner. Zamana
  bağlı hareket (dt). Oyun ekranı gizliyken, `document.hidden`, `isGameOver`,
  ayar kapalı (`sadrazam_season_fx='off'`, Ayarlar → Mevsim Efekti) ya da
  "hareketi azalt" açıkken çizmez. `SeasonFx._state()` test için.
- **Boş eşya kutuları:** `updateItemBar` boş kutuya `EMPTY_SLOT_GHOSTS`
  eşyasının soluk silueti + "+" koyar (`.item-slot.empty.ghost`);
  `activateItem` boş kutuda `showEmptySlotTip` (eşya bilgisi + Eşya Dükkânı
  düğmesi) açar. Kutudaki eşya adı artık EN'de İngilizce.
- **Vakayiname:** `chronicle` (kayıtla saklanır) `_recordChronicle` ile
  decide içinde dolar; ölümde `renderEpilog` → `_chronicleHTML` en önemli 7
  olayı parşömen sayfaya yazar (puan: birleşik 5, kriz/geri dönen sonuç 4,
  sonuç doğuran karar/olay 3, iz bırakan karar 1; sığmayan grup saltanata
  yayılır). Tarihçilerin Notu cümleleri sayfanın açılış/kapanışı.
- **Yaşlanan portreler:** `CHARACTER_EVOLUTIONS` (sadece `_v2.jpg`'si OLAN
  karakterler — dosyasız satır ekleme). `AGING_V2_YEAR = 10` (eskiden 50.
  kart), `--age-f` ile yıllarla solma/sepya (durum filtrelerine eklenir),
  ilk yaşlı gelişte `#card-image-age` ile genç→yaşlı geçiş (birleşik kartta yok).
- Testler (scratchpad): `season_test`, `slot_test`, `vk_test`, `vk_pick`, `age_test`.

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
- Sıhhat (18 Eylül 2026'dan beri): artık tek yönlü değil, `governanceHealthDelta()`
  ile kart başına 4 ana gücün (saray/yeniçeri/ulema/hazine) merkeze (50) olan
  uzaklığına bağlı — hepsi 35-65 arası (±15) ise kart başına **+1**, 25-75
  arası (±25) ise **0**, biri bile daha uçtaysa eski **-1** düşüş. Yıl sonu
  hâlâ pasif -3 (zorluk çarpanlı). Hekimbaşı'nın dinlenme teklifi (sağlık ≤40,
  kritikte ≤20) hâlâ +20 verir (karşılığında 2 tur 4 stat -5). Eskiden sağlık
  yapısal olarak geri dönüşsüz tükeniyordu (her oyun er ya da geç sağlıktan
  bitiyordu) — artık dört barı sıkı dengede tutan usta bir oyuncu sınırsız
  hayatta kalabilir (200 yıllık simülasyonla doğrulandı).

## 4b. İkon sistemi (18 Eylül 2026'dan beri)

Stok emoji ikonlar yerine `game.js`'de `GAME_ICONS` sabiti (ince altın çizgi
SVG'ler, `AKCE_COIN_SVG` ile aynı dil — `viewBox 24x24`, `stroke=currentColor`)
kullanılıyor: 34 başarım rozeti + 5 eyalet ikonu + 2 sadakat rozeti + 3 meydan
okuma aksiyonu + kupa + kilit. CSS'te `.gi { width:1em; height:1em; ... }`
kuralıyla eskiden emoji'nin oturduğu font-size bağlamına otomatik uyuyor. Yeni
bir emoji/stok ikon eklemen gerekirse aynı `_gi('<path .../>')` kalıbını kullan,
dışarıda bir görsel üretici gerekmiyor.

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
- **KRİTİK — İkinci Şans reklam ödülü verilmeme sorunu (25 Eylül 2026'da
  düzeltildi, 2 ayrı kök nedeni vardı, ikisi de gerçek kullanıcı kaybına yol
  açmıştı):**
  1. `game.js`'teki "reklam takıldıysa" güvenlik zaman aşımı SADECE reklam
     hiç açılmadıysa (native `onRewardedVideoAdShowed` event'i hiç
     gelmediyse) çalışmalı — reklam gerçek ekrana çıktıktan sonra ASLA kısa
     sabit bir süreyle (eskiden 8sn) sınırlanmamalı, çünkü gerçek rewarded
     video'lar 15-30+ sn sürüyor. Kısa tutulursa reklam hâlâ oynarken kod
     "takıldı" sanıp ikinci bir teklif ekranı açıyor, asıl `Dismissed`/ödül
     sonucu geldiğinde `settled` bayrağı zaten true olduğu için ödül hiç
     verilmiyordu.
  2. **Daha ciddisi:** `@capacitor-community/admob`'un iOS native kaynağında
     (`AdRewardExecutor.swift`) reklam gösterimi başarısız olursa
     (`didFailToPresentFullScreenContentWithError`), plugin JS tarafındaki
     `showRewardVideoAd()` promise'ini HİÇ resolve/reject ETMİYOR — sadece
     `onRewardedVideoAdFailedToShow` event'i yayınlıyor. Bu event eskiden hiç
     dinlenmiyordu, yani bu senaryoda arayüz SÜRESİZ kilitli kalıyordu (ne
     ödül ne iptal). `rewardedads.js`'te artık bu event de dinleniyor.
     Ayrıca `_adLoaded` artık sadece gerçek `onRewardedVideoAdLoaded`
     event'inde true oluyor (eskiden `initialize()` biter bitmez, reklam
     daha yüklenmeden true oluyordu) ve `onRewardedVideoAdFailedToLoad`
     olursa 30sn sonra otomatik yeniden deneniyor (eskiden bir yükleme
     hatasından sonra o oturumda bir daha asla reklam hazırlanmıyordu).

  `rewardedads.js`'teki `show(onReward, onCancel, onShow)` imzasını ve
  `onRewardedVideoAdShowed`/`onRewardedVideoAdFailedToShow`/
  `onRewardedVideoAdLoaded`/`onRewardedVideoAdFailedToLoad` dinleyicilerini
  kaldırma — hepsi gerçek, doğrulanmış bug'ları kapatıyor.
- **Market + Reklamsız (25 Eylül 2026):** Ana menüdeki eski "AKÇE AL" butonu
  (`#btn-akcesystem`, id değişmedi) artık "MARKET". Aynı `#akce-screen`
  içinde iki bölüm var: **Reklamsız** (non-consumable
  `com.rakuappdigital.sadrazam.noads`, ₺59,99 / $1.99) ve **Akçe Keseleri**.
  Reklamsız alınınca `localStorage.sadrazam_noads='1'` →
  `_maybeShowInterstitialThenStartGame()` geçiş reklamını hiç göstermez;
  İkinci Şans'taki ödüllü reklam isteğe bağlı olduğu için etkilenmez.
  RevenueCat'te ayrı entitlement YOK — sahiplik
  `customerInfo.allPurchasedProductIdentifiers`/`nonSubscriptionTransactions`
  üzerinden `_applyNoAdsFromCustomerInfo()` ile okunuyor (her customerInfo
  güncellemesinde `_applyCustomerInfo` içinden). Market'te "Satın Almaları Geri
  Yükle" linki var (non-consumable için Apple şartı). Yetersiz akçe yüzünden
  `redirectToAkcePurchase()` ile gelindiyse `#akce-screen.from-need` sınıfı
  Reklamsız bölümünü gizler.
- **Başlangıç Kesesi (27 Eylül 2026):** consumable
  `com.rakuappdigital.sadrazam.akce30start` (ASC id `6816653153`, TR ₺14,99 /
  ABD $1,49 baz, 175 ülke, READY_TO_SUBMIT — ilk kez eklendiği için bir
  sonraki App Store sürümü incelemeye gönderilirken sürüme EKLENMELİ).
  `AKCE_PACKS`'te `starter:true`, kredi yine `processAkceTransactions`.
  5 oyun bittikten sonra ana menüye dönüşte (`restartGame` → 
  `maybeShowStarterOffer`) BİR KEZ "Ferman Mührü" penceresi
  (`showStarterOffer`); ürün mağazadan gelmediyse hak yanmaz, sonraki dönüşte.
  Alınana kadar Market'te `#starter-pack-btn`. Alındı bilgisi
  `sadrazam_starter_bought` (geri yüklemede işlem görülünce de set edilir).
  Karşılaştırma fiyatı = 20'lik kese × 1,5 (kuruş cinsinden tam sayı).
- **Promosyon kodu UI'ı:** Ayarlar'da "PROMOSYON KODU" butonu →
  `RC.presentCodeRedemptionSheet()` (Apple'ın NATİF kod giriş ekranı — kendi
  metin kutusu YAPMA, iOS'ta bu şekilde çalışmıyor; Apple'ın ASC'de ürettiğin
  IAP promo kodları — non-consumable dahil — SADECE bu native ekrandan
  redeem edilebilir, üçüncü parti bir kutucuktan asla doğrulanamaz).
  **18 Eylül 2026'dan beri buton `disabled` — Simülatör'de ve "Designed for
  iPad" Mac modunda bu native çağrı hatasız ama sessizce hiçbir şey açmıyor
  (Web Inspector ile doğrulandı: `presentCodeRedemptionSheet` `undefined` ile
  "başarılı" dönüyor ama ekran açılmıyor). Gerçek iPhone'da davranışı
  doğrulanana kadar görsel olarak soluk/tıklanamaz bırakıldı.**
- **Deneyimli Mod** (kart üstünde etki önizlemesi, `window.previewMode`)
  toggle butonları da aynı tarihte `disabled` yapıldı (kullanıcı isteğiyle,
  fonksiyonel bir sorun yok — sadece geçici olarak kapatıldı).

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

- **GÜNCELLEME (25 Eylül 2026):** `/Users/mac/Projects/sadrazamtest/`
  yerel klasörü artık tamamen silinmiş durumda — `node_modules/puppeteer`
  da onunla gitti. Aşağıdaki puppeteer yolu artık ÇALIŞMIYOR, önce
  `find / -iname puppeteer -path "*/node_modules/*"` ile başka bir kurulum
  var mı kontrol et, yoksa gerekirse `npm install puppeteer` ile bu projeye
  (`sadrazam-web`) kur. Native (Capacitor/AdMob gibi) davranışları test
  etmen gerekiyorsa zaten puppeteer/tarayıcı bunu test edemez — bkz. §9'daki
  "reklam ödülü" fix'inde native köprüyü Node `vm` ile taklit eden birim testi
  örneği.
- Puppeteer, `/Users/mac/Projects/sadrazamtest/node_modules/puppeteer`
  yolundan `require` edilir (ayrı bir proje ama paket oradan kullanılıyor,
  yukarıdaki güncellemeye bkz — bu artık geçerli değil).
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
Puppeteer testi (gerçek senaryo, gerçek tıklama/timing) → 2 kopyaya senkron
(§1) → (native etkiliyorsa) `cap sync ios` + gerekirse simülatör smoke-test
(§2) → **commit + deploy** (§0 — artık her zaman, "sadece istenince" değil).
App Store'a gönderim (archive/upload) gibi geri dönüşü zor adımlar öncesi
kısa bir onay iste (zaten sık talep ediliyorsa tekrar sorma, ama versiyon
numarası gibi somut kararları kullanıcı belirtmediyse sorup netleştir).

## 8b. Bekleyen (TODO)

- **v1.4.1/build 25 (26 Eylül 2026'da yüklendi, Delivery UUID
  `04631759-f487-44c9-8d66-b9e83f247f74`, ASC'de VALID)** — ödüllü reklam
  45sn hangGuard kök neden fix'i + canlıda sahte reklam kaldırıldı. Kullanıcı
  1.4.1 sürüm sayfasına build'i seçip review'a kendisi gönderecek. Yayına
  çıkınca: gerçek reklamda ödül + sayaç düşüşü, AdMob'da gösterim/gelir kontrolü.

- **v1.4.0/build 24 (25 Eylül 2026'da yüklendi, Delivery UUID
  `98a7a7b7-f668-4328-9129-b4b76573876a`) — build 23'ün üstüne Market +
  Reklamsız eklendi.** TestFlight'ta doğrulanacak: Market açılıyor mu,
  Reklamsız fiyatı (₺59,99) geliyor mu, satın alınca geçiş reklamı kesiliyor
  mu, "Geri Yükle" çalışıyor mu. `noads` IAP'ı ASC'de READY_TO_SUBMIT — ilk
  kez eklendiği için 1.4.0 App Store sürümü incelemeye gönderilirken sürüme
  eklenmeli. **Karar (kullanıcı):** Tam Sürüm alanlar geçiş reklamını görmeye
  devam eder, Reklamsız tamamen ayrı bir ürün — ikisini birleştirme.

- **v1.4.0/build 23 doğrulaması (25 Eylül 2026'da yüklendi, Delivery UUID
  `ac472189-bb59-42d3-8104-159c734c2416`):** Kullanıcı TestFlight'ta kendi
  kontrol edip sonucu bildirecek. Bildirdiğinde:
  1. Build App Store Connect'te işlendi mi, ilgili versiyona bağlandı mı
     (otomatik olmuyor — bkz. §2 "Upload sonrası") kontrol et/bağla.
  2. Geçiş reklamının (interstitial) gerçek cihazda **her 2. "OYUNA BAŞLA"
     basışında** doğru tetiklendiğini teyit et (`interstitialads.js`,
     `game.js` içindeki `_maybeShowInterstitialThenStartGame()`).
  3. Ayarlar → "HAKKINDA" panelinin (buton + açılır panel, TR/EN metin)
     gerçek cihazda düzgün açılıp kapandığını teyit et.
  - Kullanıcı bir sorun bildirirse: önce bu maddeyi ve ilgili commit'leri
    (`721a3eb`, `1c9171f`, `89c4555`, `a32fa06`) tara, kod tarafında zaten
    headless Chrome ile test edilmiş senaryoları (§7'ye bak) tekrar
    doğrulamak yerine gerçek cihaza özgü farkı (native SDK doldurma oranı,
    ATT izni, gerçek reklam süresi vb.) araştır.
  - Sonuç olumluysa bu maddeyi silip §9'a kısa bir kayıt düş.

## 9. Değişiklik Geçmişi (kronolojik, en yeni en üstte)

Her önemli düzeltme/özellik burada kısa bir kayıt olarak tutulur — "ne
bozulmuştu, neden, nasıl düzeltildi" hızlıca hatırlanabilsin diye. Bir konu
tekrar gündeme gelirse önce burayı tara.

### 26 Eylül 2026 — Ödüllü reklam ödülü HÂLÂ verilmiyordu (yayındaki 1.3.9 = 1.4.0/build 23 binary'si) — GERÇEK kök neden

**Belirti (yayındaki sürümde, TestFlight'ta değil):** reklam izleniyor, "Ödül
verildi" → X'e basınca teklif ekranına dönülüyor, ödül yok, sayaç 5/5 kalıyor.

**Kanıt (tahmin değil):** simülatörde Debug build + Google test rewarded unit
(`ca-app-pub-3940256099942544/1712485313`) + geçici `dbg.js` ile event'ler
zaman damgalı loglandı: Showed +22.0s → Reward +27.7s → **+67.3s'de
(Showed'dan tam 45 sn sonra) game.js'teki `hangGuard` reklam HÂLÂ ekrandayken
teklif ekranını yeniden açtı** (`used=0`). WebView JS zamanlayıcıları reklam
ekrandayken de çalışıyor. Sonra gelen Dismissed `settled` yüzünden atılıyordu;
Reward event'i ise boş fonksiyonla dinleniyordu. Gerçek reklamlar (video +
tanıtım kartı + "Ödül verildi") 45 sn'yi aşıyor, TestFlight'taki kısa
reklamlar aşmıyordu → sadece yayında görünüyordu.

**İkinci bulgu:** reklam yüklenmemişse gerçek kullanıcılara "SİMÜLE REKLAM
(test modu)" gösterilip bedava ödül veriliyordu (geçiş reklamında da sahte
ekran) → AdMob'a gösterim gitmiyor, gelir yok.

**Fix:** game.js'teki tüm zaman aşımları kaldırıldı. `rewardedads.js`:
reklam açıldıktan sonra hiçbir zamanlayıcı akışı bitiremez; yalnızca native
Dismissed/FailedToShow ya da "uygulama tekrar görünür oldu + 2 sn içinde
Dismissed gelmedi" yedeği bitirir. "Hiç açılmadı" zaman aşımı (10 sn) sadece
`document.visibilityState === 'visible'` iken çalışır. Native'de sahte reklam
yok: yüklenmemişse 10 sn gerçek reklam beklenir, gelmezse "reklam bulunamadı"
mesajı + ödülsüz dönüş. `interstitialads.js` aynı desen; yüklenmemişse oyun
reklamsız hemen başlar. **BİR DAHA reklam akışına sabit süreli zaman aşımı
EKLEME.** Test: scratchpad `adtest.js` (Node vm, 17 senaryo) + simülatörde 90+
sn açık tutulan reklamda teklif ekranının yeniden açılmadığı loglandı.

### 25 Eylül 2026 — İkinci Şans reklamında ödül verilmeme + gelir kaybı (v1.3.9, build 22)

**Şikayet (kullanıcı, defalarca yaşanmış, ciddi kullanıcı/gelir kaybına yol
açmış):** İkinci Şans'ta "Reklam İzle"ye basınca bazen 2 reklam üst üste
gösteriliyor, reklam bitince "ödül ver" gelmiyor ya da geldiğinde tıklanınca
oyuna dönmüyor — reklam izlense bile ne AdMob'da düzgün "izlendi" sayılıyor
ne de kullanıcıya ödül/oyuna devam veriliyor.

**Kök neden 1 — `game.js`'teki güvenlik zaman aşımı:** `RewardedAds.show()`
çağrısından sonra sabit **8 saniyelik** bir "reklam takıldı" zaman aşımı
vardı. Gerçek rewarded video reklamlar 15-30+ sn sürdüğü için bu süre reklam
HÂLÂ OYNARKEN doluyordu; kod erkenden "sonuçlandı" (`settled=true`) sayıp
ikinci bir teklif ekranı açıyordu. Reklam gerçekten bitip native
`onRewardedVideoAdDismissed` geldiğinde `if (settled) return` yüzünden asıl
ödül/oyuna-devam mantığı hiç çalışmıyordu.

**Kök neden 2 (daha ciddi) — `@capacitor-community/admob`'un iOS native
kaynağı (`node_modules/.../ios/.../Rewarded/AdRewardExecutor.swift`)
incelenerek bulundu:** Reklam gösterimi native tarafta başarısız olursa
(`didFailToPresentFullScreenContentWithError`), plugin JS'teki
`showRewardVideoAd()` promise'ini **hiç resolve/reject etmiyor** — sadece
ayrı bir `onRewardedVideoAdFailedToShow` event'i yayınlıyor. Bu event eskiden
HİÇ dinlenmiyordu, yani bu senaryoda arayüz **süresiz kilitli** kalıyordu.
Ayrıca `_ready`/`_adLoaded` bayrağı reklam gerçekten yüklenmeden (sadece
`initialize()` biter bitmez) true oluyordu, ve bir yükleme hatasından sonra
(`onRewardedVideoAdFailedToLoad`) o oturumda BİR DAHA HİÇ yeniden
denenmiyordu.

**Fix (`rewardedads.js` + `game.js`):**
- `show(onReward, onCancel, onShow)` — üçüncü `onShow` parametresi native
  `onRewardedVideoAdShowed` event'ine bağlı; `game.js`'teki zaman aşımı
  SADECE reklam hiç açılmadıysa (bu event hiç gelmediyse) devreye giriyor,
  reklam bir kez açıldı mı iptal ediliyor. Reklam açıldıktan sonra da
  native'in tamamen sessiz kalma ihtimaline karşı çok uzun (45sn) ayrı bir
  son çare (`hangGuard`) eklendi — normal reklam süresini asla kesmiyor.
- `onRewardedVideoAdFailedToShow` artık dinleniyor → bu durumda `onCancel()`
  çağrılıp kullanıcı teklif ekranına döndürülüyor (eskiden sonsuza dek
  kilitleniyordu).
- `_adLoaded` artık sadece gerçek `onRewardedVideoAdLoaded` event'inde true
  oluyor; `onRewardedVideoAdFailedToLoad` olursa 30sn sonra otomatik tekrar
  deneniyor.
- Doğrulama: Puppeteer mevcut değildi (`sadrazamtest` silinmiş — bkz. §7),
  bunun yerine Node `vm` ile sahte bir Capacitor/AdMob köprüsü kurulup 3
  senaryo test edildi: (a) uzun reklam + geç dismiss → ödül veriliyor,
  (b) native sessiz hata (FailedToShow) → kilitlenmeden `onCancel`
  çalışıyor, (c) reklam hiç yüklenmemiş → native çağrı hiç yapılmadan
  simüle reklama düşülüyor. Üçü de PASS.
- Versiyon 1.3.8 zaten onaylı/yayında olduğu için (ASC yeni build kabul
  etmiyor) **1.3.9, build 22** olarak TestFlight'a yüklendi
  (Delivery UUID `3d47ae49-bc3b-4512-a0d7-531f8ab31563`). Kullanıcı gerçek
  cihazda doğrulayacak.
- **Bu konu tekrar gündeme gelirse:** önce bu fix'in gerçekten TestFlight'ta
  doğrulanıp doğrulanmadığını sor/kontrol et — henüz doğrulanmadıysa aynı
  bug'ın tekrarı mı yoksa yeni bir varyant mı ayırt etmek için native
  event log'larına (Xcode konsolu / `NSLog` satırları
  `AdRewardExecutor.swift`'te zaten var) bakılmalı.
