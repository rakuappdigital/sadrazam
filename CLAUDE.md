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
# 0) ZORUNLU denetimler — biri hata verirse build ALMA
python3 tools/denge.py          # kart dengesi (baskın/bedelsiz/etkisiz kart, biçim) — çıkış kodu 1 = hata
node --check game.js && node --check analytics.js

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
- **Sonuç kartında mühür damgası (28 Eylül 2026, kullanıcı seçimi):**
  `checkScheduledCards` normal sonuç kartını `_stampMeta`'ya yazar
  (`{src, at}`; `at` = kararın `cardsPlayed`'i, `scheduleConsequence`'ta),
  dealNext `renderKnotVisual`'dan sonra `_playConsequenceStamp`: 0,5 sn sonra
  `#card-stamp` (SONUÇ/RESULT) + `#card-stamp-ring` + `#card-stamp-band`
  ("“karar” kararınız · N kart/yıl önce"). Birleşik kartta yok. Portre <190px
  ise `#card.stamp-compact`. Kayıttan dönülünce sıradaki karta damga çıkmaz.
- **Kenar sekmeleri (28 Eylül 2026):** `#swipe-hint-left/right` artık
  `.side-tab` (kırmızı/yeşil dikey sekme, içinde kartın seçenek metni + ok).
  SADECE GÖRÜNTÜ: `pointer-events:none` — kaydırma kartta. `_setSideTabs`
  (dealNext; özel butonlu kartlarda `#card-area.tabs-off`), `_sideTabsDrag`
  (onMove/snapBack/flyOff). Kart genişliği eskisiyle aynı kalsın diye
  sekmelerin kart tarafında 21px (≤360px ekranda 25px) boşluk var.
- **Görsel boyutları (28 Eylül 2026):** karakterler 1080 px (yatay 1440)
  JPEG q80; danışmanlar 192 px, eşya ikonları 384 px PNG (saydam). Yeni
  görsel eklerken aynı boyutlara getir. Kullanılmayan dosyalar paket dışında
  `design-sources/` (icon-1024/512/192, intro-bg, 4 font). assets 113→56 MB.
  Müzik (8 Ekim 2026): MP3 aslında ~190 kbps'ydi → AAC 112 kbps .m4a (39 → 29 MB). Bkz. §3i.
- Testler (scratchpad): `season_test`, `slot_test`, `vk_test`, `vk_pick`, `age_test`, `stamp_test`, `tabs_test`.

## 3e. 3–4 Ekim 2026 sistemleri (hepsi game.js, `hasAdvisor` fonksiyonunun hemen üstünde modüller)

- **Kriz nabzı** `_updateCrisisPulse` (updateStatUI içinde): güç ≤15/≥85 → `#game.crisis-on`,
  `#crisis-vignette` (pointer-events:none), `.stat-track.crisis-shake`.
- **Titreyen etki bölgesi** `_effectShimmer(side)`: onMove'da |dx|>20; snapBack/flyOff/dealNext'te
  kapanır. Sadece normal karar kartı; Deneyimli Mod açıksa yok.
- **Lanet uyarısı** `_showCurseWhisper` (checkCurse, 2. aynı yön). `_timeout`/`_noCurse` kartları
  lanete sayılmaz.
- **İdam sahnesi**: `_actuallyTriggerGameOver` saray_0'da önce `showExecutionAnimation`.
- **Zamanlı kriz kartı** `_maybeStartFuse` / `_stopFuse` / `_fuseTimeout`: kaydırılabilir kriz
  kartı (is_crisis ya da category crisis, 1-sultan DEĞİL), yılda 1 (`_timedUsedYear`, kayıtta).
  Süre dolunca kart kopyası `_timeout:true` + `_timeoutEffects` ile sola uçar, bayrak/zincir yok.
  `_fusePaused` listesine yeni modal eklersen ekle. Ayar `sadrazam_timed` normal/slow/off.
- **Sefer oku** `_showSeferMap`: savaş sonuç kartı forcedQueue'ya `{..., _sefer}` kopyası olarak girer.
- **3. yıl kilidi**: dealNext başında `_freeYearLimitReached()` → `_enforceFreeYearLimit()`
  (`_paywallFromGuard` → satın alınınca yıl ilerletilmez).
- **Paywall**: `PAYWALL_COPY` (limit/start/menu), `_updatePaywallTiles`, `_pwSel`, `_paywallBuy`;
  iki seçenek ortak `.ferman` mühürüyle. Bütün satın alma yüzeyleri `.ferman` (ferman-sm/-tile).
- **Market Eşyalar**: `renderMarketItems`, sandık `sadrazam_item_stash` (≤3), startGame'de
  `_applyStashToSlots` (expiry null). `gainItem(id, persistent)` — akçeyle alınan kalıcı.
  Kritik An: eşik 20, yılda 2 (`_criticalYear`).
- **Padişah Fermanı**: `_ferman`, `_fermanNew` (dealNext'te yoksa), `_fermanTrack` (decide),
  `_fermanCloseYear` (advanceYear'ın İLK satırı, paywall'dan önce), `_fermanEnqueue`/kuyruk,
  `#ferman-overlay` z 270, rozet `#ferman-chip` (#dynamic-subtitle'ı gizler). Kişi talepleri
  "geri çevirme" biçiminde. Gazap kartı `_getGazapCard` (1-sultan → Sultan penceresi).
- **Vezirler Defteri**: localStorage `sadrazam_defter` {seals, fermans, claimed, pages, deaths};
  `_defterGet` HER alanı döndürmeli (claimed eksikken ihsan her ölümde tekrar veriliyordu).
  `_defterRecordReign` showGameOver'da; `showDefter`. Her 5 mühürde 3 akçe (`_defterClaimIhsan`).
- **Ana Kadro**: `CAST` (6 karakter), `relPoints` (−6..6, kayıtta), `relLevel`, `_relAdjustEffects`
  (decide'da applyEffects'ten önce), `_relOnDecision`, `_relTryRescue` (checkGameOver,
  checkSultanSabir), `_relDueKomplo` (decide enjeksiyon bloğu), `_renderCardRel` (#card-rel),
  `showDivanHalkasi` (oyun menüsü). İlk kademe değişiminde tek seferlik açıklama `sadrazam_rel_tip`.
- **Divan Oturumu**: `DIVAN_ISSUES` (8), `_maybeQueueDivan` (yılın 12. kartı, `type:"divan"`),
  `showDivanOturumu` → sentetik kart `_divan/_noCurse` ile `decide("right")`. Kimlik
  **`#divan-oturumu`** — `#divan-overlay` 5./10. yıl "Divan Sahnesi"nin, KARIŞTIRMA.
- Testler (scratchpad, `pw.js` sessiz Playwright sarmalayıcısı ile — testlerde ses ÇIKMAZ):
  ach/flow/guard/fx/fuse/sefer/bundle/pw_new/items/ferman/kadro/defter_test.js.
- Masaüstü: `~/Desktop/olumler/PROMPTLAR.txt` (death-<anahtar>), `~/Desktop/yeni/PROMPTLAR.txt`.
  Ölüm sahneleri ÇERÇEVESİZ (kullanıcı kararı, 4 Ekim): kartlarla aynı çizim dili ama tam ekran,
  kenara kadar dolu; alt üçte bir metin için sakin. Gelen görselde çerçeve varsa kırp ya da kullanıcıya söyle.

## 3f. 4 Ekim 2026 (2. tur) sistemleri

- **Ölüm sahneleri**: `_playDeathScene` (game.js) — HER ölüm tam ekran sahne; görseller
  `assets/deaths/death-<sebep>.jpg` (1080x1440, kullanıcı üretimi, çerçevesiz). `DEATH_SCENE_ALIAS`:
  yanlis_oda→sultan_guc, emeklilik→free_limit, bilinmeyen→saray_0. Eski portre sinematiği
  (`#cinematic-death` büyüyüp solma) KULLANICI İSTEĞİYLE KALDIRILDI — geri getirme.
- **Göreve başlama** `_playCulus` (startGame → `begin`): kapılar, isim levhası, tuğralı mum mühür
  `_imperialSealSVG`, MÜHRÜ AL; ilk oyunda tam, sonra yarı süre, dokununca atlar. Akan flex düzen.
- **Yaşayan Divan** `_updateDivanBg` (kriz nabzından çağrılır): `#divan-bg` z −2, önceden
  bulanık `assets/divan-bg.jpg` (canlı blur YOK), data-mode calm/tense/crisis. Kullanıcının
  `divan-salonu` görseli gelince aynı işlemle (kırp, GaussianBlur 9, parlaklık .62) değiştir.
- **Kişisel mühür** `SEAL_KEY sadrazam_seal`, `_personalSealSVG`, `renderMarketCosmetics`,
  `showSealEditor`: ferman kabulü (`.fm-pseal`), Divan MÜHÜRLE, Defter, Vakayiname.
- **Sonlar** `ENDINGS` (7), `_endState` (kayıtta), `_endYearClose` (advanceYear'da ferman
  kapanışından hemen sonra, paywall'dan önce), `_endReach`, `_nisan(id)` (1 / Miras 0.5),
  `_nisanAdjustEffects` (decide), `_nisanYearStart`, `_nisanUlemaRescue`, `_pickMiras`
  (göreve başlamadan sonra), `showKaderYollari` (Defter), `askRetirement` (menü, 3 son + 20. yıl).
  Kalıcı ilerleme `sadrazam_defter.end` {p, done, wars, dvSeyh, retired} — `_defterGet` bu
  alanı da döndürmeli. Son görselleri `assets/endings/end-<id>.jpg` (yoksa madalyalı sahne).
- Test sarmalayıcısı `pw.js` göreve başlama sahnesini otomatik geçer (`test_keep_culus=1` kapatır).
- Prompt dosyaları: `~/Desktop/olumler`, `~/Desktop/yeni` (10 karakter + divan-salonu),
  `~/Desktop/sonlar` (7 son + emeklilik).

## 3h. 5 Ekim 2026 — çekirdek (1.7): Kayırma Dengesi, Tahkik, Arz, kart dengesi, ölçüm

- **Kayırma Dengesi** eski LANET kuralının yerini aldı (aynı YÖNE 3 kaydırma → 4 güç −5 artık YOK).
  `checkCurse(dir)` (ad korundu, decide'da `_timeout`/`_noCurse` olmayan kartlarda): seçilen tarafın
  en büyük artısı olan zümre `_favOf`; son `FAV_WINDOW`=4 kararın `FAV_NEED`=3'ünde aynı zümre →
  `triggerCurse(f)`: öteki üç güç −`FAV_COST`=6 ("DİVAN BÖLÜNDÜ"). 2. kayırmada `_showCurseWhisper(f)` +
  barda `.fav-warn`. Kalibrasyon: scratchpad sim2.py (rastgele oyunda medyan 38 → 41 kart; eski lanet
  zorluğun büyük kısmını taşıyordu — değerleri düşürme). `cursedEver` ve başarım kimlikleri
  (curse_master/no_curse/sabir_imtihani) aynı; adları "Divanı Bölen / Adil Vezir".
- **Tahkik** `setupTahkikBtn` (dealNext normal kart, `#tahkik-btn` kartın SAĞ üst köşesi; büyüteç
  `#investigate-btn` SOL üstte, ona DOKUNULMADI). Yılda `TAHKIK_PER_YEAR`=3 hak (+1 Casuslar Başı
  Müttefik), `_tahkikYearStart` advanceYear'da. Kullanınca sabır −2 (Şemsi −1), iki seçenekte
  `getEffectPreviewHTML` (Usturlap ile aynı görünüm), `_tahkikCard` → `_previewOn` true.
- **Arz** cards.json `"arz": true` (38 büyük devlet kararı). `setupArzChip` (`#arz-chip`, pointer-events
  none, kabul olasılığı `_arzChance`: sabır ≥60 %85, ≥30 %65, altı %45). `decide()` EN BAŞTA
  `dir = _arzResolve(currentCard, dir)`: reddedilirse öbür taraf uygulanır, `_arzPending`'e sonuç
  (8–15 kart), `_arzDue` enjeksiyon bloğunda `arz_sonuc` easter kartı (haklıysan sabır +8 Saray +3,
  değilsen sabır +3). Reddedilen kararlar hafızaya (`_memOnDecision`) YAZILMAZ. İlk 2 Arz'da açıklama.
- Kayıt: `cag: _cagSave()` / `_cagReset(s.cag)`; startGame `_cagReset(null)`. Bildirim `_cagToast`
  (`.cag-toast`, satır kırar; `.rel-toast` tek satırdı).
- **Kart dengesi**: 218 seçenek yeniden yazıldı (baskın ve bedelsiz seçenekler). 22 kart bilerek ödül
  veren sonuç kartı → `"denge_muaf": "ödül"`. **`tools/denge.py` her build öncesi (§2 adım 0).**
  Yeni kart eklerken: her seçenekte en az bir güç düşmeli; gizli sonuç (bayrak/zincir/arc/dönem/eşya)
  taşıyan taraf istisna sayılır (uyarı). Bugün: 662 karar kartı, 606 gerçek ikilem, 0 hata.
- **Tam Sürüm = reklamsız** `isAdFreeUnlocked()` → `sadrazam_noads==='1' || isFullVersionUnlocked()`.
  Tam Sürüm + Reklamsız paketi (`fullnoads`) SATIŞTAN KALDIRILDI: `_bundleAvailable()` hep false;
  sahiplik kontrolleri duruyor. Ödeme ekranında 4. madde REKLAMSIZ (`paywall.v4t/v4d`). Reklamsız ürünü
  ayrıca satılmaya devam ediyor; Tam Sürüm sahibine Market'te "TAM SÜRÜMDE" yazar.
- **Ölçüm** `analytics.js` (TelemetryDeck, game.js'ten ÖNCE yüklenir). `APP_ID` yer tutucuyken HİÇ ağ
  isteği yok. game.js'te `_an(type, payload)` (try/catch, beklemez). Olaylar: session_start,
  game_start, card_decided (%15 örnek; ms, tahkik, arz), investigate_used, arz_result, favor_triggered,
  year_end, game_over, paywall_shown, purchase, ad_shown (interstitial + rewardedads.js), settings_changed,
  secret_progress, ending. Web'de `isTestMode: true`. Pano: dashboard.telemetrydeck.com.
- **Pargalı yan görevi**: `PARGALI_CONDITIONS` başına `ilk` (18. kart) — herkes ilk sayfayı alır;
  mektupta eksik sayfalar için `PARGALI_HINTS` ipuçları, başlıkta YAN GÖREV.
- Testler (scratchpad t/): `cag_test.js` (Tahkik, Kayırma, Arz, kayıt, Tam Sürüm reklamsız, paket yok,
  ödeme ekranı, Pargalı, ölçüm açık/kapalı + ağ hatası; Chromium+WebKit, TR/EN, ses açık/kapalı).
  fx/bundle/money/pw_new/mem testleri yeni kurallara göre güncellendi.

### 3h-2. 5 Ekim 2026 (2. tur): Asırlar, Reklamsız gizli, ölçüm canlı

- **Asırlar (oyunun TEMEL HEDEFİ)** game.js `ASIR_KNOTS` (5 düğüm: misir/yavuz 2. yıl, viyana/kanuni,
  beylerbeyi/murad3, bagdat/murad4, patrona/ahmed3 — hepsi 4. yıl). Kalıcı: localStorage
  `sadrazam_asirlar` {knots:{id:{r: kept|changed|lost|history, n}}, finalSeen}. Saltanat durumu
  `_asirRun` (kayıtta `cag.asir`). Akış: 2. karttan sonra giriş kartı (hedef + hazırlık şartları) →
  düğüm yılının `ASIR_AT_CARD`=10. kartında sahne: SEFERE → 2 seçim kartı → sonuç (hazırlık 0–3 +
  karar 0–2; ≥4 başarı, 3'te %50). Kartlar `easter_type:"asir"`, seçimler `c._choices`
  (getEasterChoices'ın İLK satırı). decide() enjeksiyon bloğunda `_asirTick()` (kayıttan dönüşte yarım
  sahneyi yeniden kuyruğa koyar — forcedQueue kayda yalnız kimlikle yazılır). `_asirYearClose()` Yıl
  Sonu'na hazırlık satırı. `_asirStartBonus()` yeni saltanatta ÖNCEKİ dönemlerin sonucundan miras
  (_cagReset(null) içinde). Sultan ekranında `.sc-knot` rozeti, menüde `#btn-asir` → `showAsirlar()`
  (5/5 olunca "Senin Osmanlın"). Kötü biten düğüm aynı sultanla yeniden oynanır; iyi biten bir daha
  gelmez. Paşa modunda düğüm yok. Test: scratchpad t/asir_test.js.
- **Reklamsız Market'te GİZLİ** (`#market-noads.gone`, kullanıcı kararı: yalnız Tam Sürüm avantajı).
  Kod/ürün duruyor; geri açmak için index.html'de `gone` sınıfını kaldır.
- **fullnoads IAP** (6818863680): inceleme gönderimi iptal edildi, ürün READY_TO_SUBMIT, adı
  "KULLANILMIYOR - Tam+Reklamsiz". Apple API ile silmeye izin vermiyor (409). Sürüme EKLEME.
- **Ölçüm canlı**: APP_ID `F3B8B209-FB1A-4FAB-B53D-5FB4DE179E3D`, namespace `com.sadrazam`
  (adres `nom.telemetrydeck.com/v2/namespace/com.sadrazam/`). Yerel test sunucusunda (localhost, native
  değil) gönderim KAPALI; testte açmak için `localStorage.sadrazam_an_test="1"`. iOS da
  capacitor://localhost kullanır — onu `isNativePlatform()` ayırır, bu ayrımı bozma.
  privacy.html'de "Anonymous Usage Analytics" bölümü var; ASC gizlilik etiketi: Kullanım Verisi ·
  Ürün Etkileşimi · bağlantısız · izleme yok.

### 3h-3. 5 Ekim 2026 (3. tur): dünya yayını kalite kontrolü — bulunan ve düzeltilen hatalar

- **Dil**: ilk açılışta cihazın BİRİNCİ dili Türkçe ise TR, değilse HER ZAMAN EN (kullanıcı kuralı).
  translations.js başında; daha önce oynamış (sadrazam_* verisi olan) oyuncu TR'de kalır. iOS'ta
  Info.plist CFBundleLocalizations [en, tr] + pbxproj knownRegions'a tr eklendi. Simülatörde doğrulandı
  (sistem dili Almanca → EN, Türkçe → TR). Testte simülatörde ESKİ veri kalırsa "eski oyuncu" sayılır.
- **ATT izin metni** Info.plist'te İngilizce (varsayılan), `tr.lproj/InfoPlist.strings` Türkçe,
  `en.lproj/InfoPlist.strings` İngilizce (pbxproj'a PBXVariantGroup olarak eklendi; derleme doğrulandı).
- **EN sızıntıları düzeltildi**: Sultan mektupları (1.5.0'dan beri EN'de TR'ydi; showLetterCard text_en),
  mektup DEVAM düğmesi, sabit sürpriz kartlar (EASTER_CARDS *_en alanları; showEasterCard okur),
  4 sabit ölüm metni + EN ölüm başlığı _deathCause'tan, eşya bildirimleri, "YENİ EŞYA", sonuç damgası,
  kayıtlı oyun bandı, sultan/danışman seçim uyarıları, paylaşım bağlantısı (EN: apps.apple.com/app/id…).
- **Küçük ekran kilitleri** (CSS, dosya sonunda): `.ip-box/.rr-box` en fazla ekran kadar + içi kayar
  (Divan Halkası 375×667'de Kapat düğmesi ekran dışındaydı → oyun kilitleniyordu); Market, Ayarlar,
  sultan/danışman/başarımlar ve ana menü "ortalanmış + kaydırılabilir" kapsayıcıda üstü kesiliyordu →
  güvenli ortalama (kapsayıcı flex-start, iç panel margin:auto). Paylaşılan #id kuralını sınıfla ezmeye
  çalışma (özgüllük) — #id ile yaz.
- **Ölçüm testleri gerçek panoya yazmasın**: analytics.js LOCAL_DEV adres ŞEMASINA bakar (http(s)://localhost
  → kapalı; iOS capacitor:// → açık). pw.js test sarmalayıcısı telemetrydeck isteklerini engeller.
  5 Ekim'de bundan önce bir test turu appVersion 1.6.0 ile sahte olay gönderdi (panoda 1.6.0'ı ele).
- **Reklamsız ürünü** App Store'da var ama Market'te gizli; Tam Sürüm/Hoşgeldin IAP açıklamaları ASC
  API ile değiştirilemiyor (ACTIVE localization 409) — elle. App Privacy etiketi API'de yok — elle.
- **Test grupları (scratchpad t/)**: `nativefake.js` (sahte iPhone: AdMob olay sırası senaryoları, RevenueCat,
  Haptics), `native_ads_test.js` (günlük hediye/İkinci Şans/Kâtip/Kritik An × ok/noreward/failshow/
  reject/noload/loadfail1/long/nodismiss + geçiş reklamı), `native_iap_test.js` (her ürün, iptal/hata,
  geri yükleme, promosyon, yeniden kurulum, ürün yok, ücretsiz sınır), `overlay_fit_test.js` (40 pencere
  × 320/375/390 genişlik: her düğmeye ulaşılabiliyor mu), `fuzz_test.js` (rastgele gerçek oyun: hata,
  takılma, değişmez, 404, EN sızıntısı), `an_guard_test.js`.

### 3h-4. 6 Ekim 2026 (akşam): reklam düzeni

- **Geçiş reklamı HER oyun bitişinde** (kullanıcı isteği): `_actuallyTriggerGameOver` → ölüm sahnesi →
  `_gameOverInterstitial(next)` → `showGameOver`. Oyun başında artık reklam YOK
  (`_maybeShowInterstitialThenStartGame` yalnızca `sadrazam_start_count` sayar + startGame).
  Tam Sürüm / Reklamsız sahibine hiç gösterilmez; `interstitialads.js` `prepare()` onlar için reklam
  İSTEMEZ (`window.isAdFreeUnlocked`).
- **Bayat reklam**: iki reklam dosyasında `STALE_MS` 55 dk — Google ~1 saatte geçersiz sayar; görünür
  olunca, dakikada bir ve göstermeden önce `_dropIfStale` yenisini ister.
- **Ölçüm**: `ad_shown` = deneme (eskisi gibi), `ad_impression` = native "Showed" geldi (gerçek gösterim).
  AdMob gösterimiyle karşılaştırılacak olan `ad_impression`.
- **Tahkik reklamı**: hak bitince yılda 1 kez `_offerTahkikAd` (item-confirm-popup, sınıf `tahkik-ad`),
  izlenirse `_tahkikLeft++` ve kart hâlâ aynıysa hemen kullanılır; `_tahkikAdYear` kayıtta (`cag.tka`).
- Ödüllü reklam yerleri (5): İkinci Şans, günlük Divan hediyesi, Kâtibin Notu/Müneccim, Kritik An
  (Şifa Otu), Tahkik.
- Test: scratchpad `ad_test.js`, `long_test.js`, `native_ads_test.js` (E: oyun sonu reklamı, F: Tahkik).

### 3h-5. 6–7 Ekim 2026: arayüz düzeltmeleri S1–S8, D1–D8 (build 43)

- Duraklat (showGameMenu): gm-resume primary en üstte; gm-mus/gm-sfx; gm-quit → gm-confirm (gm-quit-yes doQuit).
- Ana menü: #intro-footer akışta; kısa ekran sıkıştırması style.css sonunda (@media max-height 880 / 740).
- Dokunma alanları: #game-menu-btn/#investigate-btn/#tahkik-btn/#ferman-chip ::before (bu öğelere başka ::before
  ekleme). Büyüteç/Tahkik ::after D1 etiketi için kullanılıyor.
- .negot-card: showNegotiationCard ekler; dealNext başında ve tüm letter-card temizliklerinde kalkar.
- _cagToast konumu JS'te hesaplanır (header-row / ferman-chip alt kenarı + 6px).
- previewMode (Deneyimli Mod) her açılışta false; ayarlarda yok. getEffectPreviewHTML yalnız Usturlap/Tahkik için.
- #scroll-hint: initScrollHint (game.js sonu, Init'ten önce) — liste yalnız intro/akce/achievements.
- Nasıl Oynanır: howto.t_*_t / _d çeviri anahtarları; html.native sınıfı howtoScreen tanımının yanında eklenir.
- Test: scratchpad ux_fix_test.js.

## 3i. 8 Ekim 2026 sistemleri (build 45 adayı)

- **Akçe ödemesi kuralı:** akçe tek adımda (`spendAkce`) düşer ve hemen ardından etki uygulanır. Etki karar anına kadar
  bekliyorsa (Kader Mührü, yatıştırma) `_paidPending(kind, cost)` yazılır, uygulanınca `_paidDone()`. Kayıttan dönüşte
  (`_paidRecover`) ya da yeni oyunda bekleyen ödeme İADE edilir (kayıt ekrandaki kartı saklamaz). Akçe yetmezse
  `redirectToAkcePurchase(cb)`; Market (z 150) bir pencerenin altında kalacaksa pencere önce `display:none`, cb'de geri.
- **Yeni saltanat durumları** tek blokta: `_v8Reset/_v8Save/_v8Load` (kayıtta `v8`): `_kaderYear, _lutufYear,
  _fermanWatch, _fermanNoReroll, _fermanAfUsed, _sootheYear/_sootheN/_sootheCardId`. Yeni durum eklersen buraya ekle.
- **Kader Mührü** (R1-A): `_kaderPay`, `_kaderAvailable` (yılda 1, şans+sefer ortak). Şans kartı `showChanceCard` (#kader-row;
  sayaçlar artık burada artar — eskiden hiç artmıyordu). Sefer: `_savasSonucSchedule` zamanı gelince `_seferZarCard()`
  (easter_type sefer_zar → `_showSeferZar`); zamanlama karar verilene kadar kayıtta durur. `_savasChance()`.
- **Sultan'ın Lütfu** (R3-A): `_showLutuf` ferman kuyruğu `kind:"lutuf"` (advanceYear'da, 3'ün katı yıllar, bir güç <40 →
  en düşük 70'e). Reklam: `RewardedAds.show(onReward, onCancel, null, onEarned)`; `_lutufApply` çift uygulanmaz;
  `sadrazam_lutuf_pending` → `_lutufRecover` (loadGameState). Görseller assets/lutuf/.
- **Ferman** (F2): `_fermanCloseYear` kademeli (1.: −12 + `_fermanWatch` → sonraki ferman 2 madde; 2.: gazap; 3+: −25 +
  `noRr`). Değiştirme hakkı 2 (`FERMAN_REROLLS`, `_fermanRerollsUsed` eski `rerolled` kaydını da okur). Af:
  `_fermanAfHTML/_fermanAfBind` (sonuç penceresi + Yıl Sonu), 2 akçe, saltanatta 1.
- **Yatıştırma** (A2): `setupSootheChip` (dealNext; yalnız `_isCrisisCard`), `_sootheAdjust` decide'daki applyEffects zincirinin
  EN DIŞINDA. Şerit her dealNext başında silinir.
- **Günlük hediye**: `DAILY_GIFT_REWARDS` [1,1,2,2,3,3,5]; `_claimDailyGift` tek yazım noktası; `_recoverPendingDailyGift`.
- **Günün Sorusu** (T-A): `data/trivia.json` (55, TR/EN, şıklar günlük karışık `_seededPerm`), `_triviaAnswer` tek yazım
  noktası (önce "cevaplandı", sonra akçe). Menüde ayrı kutu YOK: HEDİYE penceresi `#dg-trivia`; `showTrivia` (z 950 > hediye 900).
- **Bildirimler**: `notifications.js` (game.js'ten sonra). `Notif.plan(now, Notif.state())` saf fonksiyon; günde ≤2;
  kimlikler 7100–7139; her öne gelişte/arka plana geçişte yeniden kurulur. Dokunma `onTap` (gift/streak/trivia/both).
  İzin: `Notif.ask(reason)` yumuşak soru (ilk hediye / ilk saltanat sonu), Ayarlar `#sett-notif-*`. Haftalık özet için
  `_weekLogGame` (showGameOver). Plugin `@capacitor/local-notifications` 8.3.1.
- **Market kozmetik**: `CINI_FRAMES` (5, tek tek; eski `{cini:true}` = ilk 3), `_ciniOwned/_ciniBuy`, `showCiniPreview`,
  `showKaftanPreview`, mühür `renderMarketCosmetics` (satır içi, anında kayıt), `_renderCosmTab`. Çerçeve CSS
  `#card.has-frame.frame-<k>::after` border-image (13 px; dilim değerleri görsellere göre). `tugra` (K2, assets/tugra,
  fermanda maske ile kırmızı, kart arkasında seçilen) ve `kedi` (K7, `DivanCat`, `DIVAN_CAT_SVG`).
- **Devletin Kaderi** 10 düğüm: her sultana 2. düğüm (`n:2`, y 6). `_asirKnotFor` iyi bitmemiş ilk düğümü verir;
  `ASIR_SULTANS` sırası başlangıç mirası için. Düğüm seçenekleri rastgele sırada. Koşullar `_asirPrepChips` (#card-chips).
- **Mevsim tonu** `#season-tint` (#game ilk çocuğu, z −1, canvas'tan önce) `_seasonTint()` dealNext'te.
- **Ortak menü dili** (T1-A) style.css sonunda `--menu-bg/--menu-line/--menu-shadow`.
- **Başarım ilerlemesi** `ACH_PROGRESS`, `_achBestUpdate` (checkAchievements), `sadrazam_ach_best`.
- **Müzik** artık AAC 112 kbps `.m4a` (orijinal MP3'ler design-sources/music-mp3). Eski not "64 kbps" yanlıştı (190 kbps'ydi).
- Testler (scratchpad t/): v8_money_test, v8_feat_test, daily_test, ui8_test, overflow_test (FRAME=iznik|rustem …).

## 3g. 4 Ekim 2026 (3. tur) sistemleri

- **Dönemler** `ERA_DEFS`, `_eraState` (kayıtta `era`), `_eraPick` (getNextCard'da, %30, ayrı kanal;
  cards.json `era` alanlı kartlar getEligible'dan HARİÇ), `_eraAdjustEffects`/`_eraOnDecision` (decide),
  `_eraYearClose` (aynı yıl iki kez işlemez — paywall'dan satın alınca advanceYear tekrar çağrılır).
  Sultanlar `murad4` (6 mühür), `ahmed3` (15 mühür) — `unlockSeals`, sultan ekranında kilit. Kart
  alanları: `era`, `era_min`, `era_forced`, `left/right_era: {m, rel, chance}`. Çip `#era-chip`.
- **Yıl Sonu** `advanceYear` = `_ysStart` + `_advanceYearInner` + `_ysFinish`. Ekran `#yil-sonu`
  ferman kuyruğunun `yearend` öğesi; HİÇBİR PENCERE KENDİLİĞİNDEN KAPANMAZ (kullanıcı kuralı). Sıra:
  Yıl Sonu → Son → paywall (`kind:"call"`) → yeni ferman. Kuyruk tek zamanlayıcılı (`_fermanKick`,
  `_fermanNext` açık pencere varken çıkmaz). Ertelenen kartlar `_ysDefer(card, n)` (kayıtta). Yıl
  Özeti kartı kaldırıldı; vergi reformu yıllık havuzda yok. Yılın ilk kartında fitil yok, Padişah ilk
  3 kartta gelmez, eşya animasyonu/bilgi penceresi `_ysModalOpen()` iken bekler (yeni modal eklersen
  oraya da ekle).
- **Hafıza kartları** `_memLog` (karar: id+taraf+kart, varyant metni `tx`), `_maybeQueueMemory`
  (decide sonunda), `_memBuild` (sinav/yuzlesme/tuzak/dedikodu), `_memOnDecision`. Kartlar `_mem` +
  `_noCurse`: ilişkiye otomatik puan yazmaz, Vakayiname'ye girmez, büyüteç çıkmaz. Başarım
  `memory_sharp` (crossgame `memCorrect`). ESKİ iOS: regex'te lookbehind KULLANMA (sözdizimi hatası).
- **Metin varyantları** cards.json `text_variants: [{text, text_en}]`, `_applyTextVariant` (dealNext;
  aynı oyunda sıradaki sahne). Etki/seçenek değişmez.
- **Market eşyaları** ITEMS'ta `price` (`_itemPrice`; iki dükkân da okur), `passive` (kum_saati
  `_kumSaatiMul` fitilde, mehter_kosu `_mehterCheck` applyEffects sonunda). usturlap `_usturlapLeft`,
  muhurlu_zarf scheduledCards'ı +8, lale_sogani dönem sayacı/Saray.
- **Kozmetikler** `COSMETICS`, localStorage `sadrazam_cosmetics`, `renderCosmeticRows` (Market),
  `_applyCosmetics` (#card `frame-*`, ::before/::after — kart boyutunu değiştirmez), `_kaftanImg`
  (Defter, ölüm, son), Hattat Kalemi `.vakayiname.gilded` + paylaşım tuvali.
- **Diplomasi** `DIP_STATES` (5 muadil, portreler `assets/characters/<char>.jpg`), `_dipState`
  (kayıtta `dip`; itibar −6..6, kademe trunc/2), mektup/tehdit/davet kartları `_dip`,
  `_dipYearStart` (advanceYear'da ertelemelerden sonra), görüşme `#dip-summit` (ferman kuyruğu
  `kind:"summit"`), `_dipAdjustEffects`, Habsburg `rollSavasSonucu` +%15. Oyunlar arası
  `sadrazam_diplomasi` {met, refused}. Defter sayfasında `tr` (antlaşmalar). Başarımlar dip_*.
- **Görünüş**: font Alegreya (metin) + Alegreya SC (başlık), Cinzel Decorative yalnız logo/büyük
  başlık; dosyalar `assets/fonts` (latin + latin-ext). `*` için `lining-nums` (Alegreya'nın eski usul
  rakamları barlarda okunmuyordu). Ana ekran amblemi `assets/emblem-tugra.png` (118px). Hakkında
  `#about-*` (rakamlar showAboutOverlay'de canlı). Müzik: menu5/6 yalnız `_MENU_TRACKS`, oyun5/6
  yalnız `_GAME_TRACKS`.
- Testler (scratchpad): era/ys/music/mem/var/market/cosm/dip_test.js + önceki 17 grup. `pw.js`
  `__ysClose()` yardımcısı Yıl Sonu'nu (gerekirse önce açık fermanı) kapatır.

## 4. Kritik sabitler

- `CARDS_PER_YEAR = 24` (satır ~6) — **çok önemli**, yeni bir "N kartta bir
  gelsin" eşiği yazarken bunu referans al, yoksa özel kartlar 1. yıla sıkışır
  (mektup zamanlamasında tam bu hata oldu, düzeltildi — bkz. `_mektup*Threshold`).
- **Ücretsiz sürüm (3 Ekim 2026'dan beri):** `FREE_YEAR_LIMIT = 2`. Tam Sürüm ekranı
  İLK KEZ ya 2. yılın sonunda (`advanceYear`) ya da 2 oyun bittikten sonraki oyun
  başında (`FREE_GAMES_BEFORE_PAYWALL`, `_paywallAtGameStart`) çıkar. Reddedilirse
  kalıcı `sadrazam_paywall_declined`; oyuncu OYNAMAYA DEVAM EDER, her saltanat 2.
  yılın sonunda `showFreeLimitPopup` ("Görev Süreniz Doldu": Tam Sürüm / Saltanatı
  Bitir) ile biter → `_endFreeReign` (ölüm sebebi `free_limit`). Eski "3 yeniden
  başlatmada bir kesin paywall" kaldırıldı. **Eskiden reddeden oyuncu hiç
  oynayamıyordu** (her başlangıçta kapatılamaz paywall) — tekrar o hale getirme.
  Test: scratchpad `flow_test.js` (36 senaryo).
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

  **8 Ekim 2026 DÜZELTMESİ — yarıda kapatılan reklam ödül VERMEZ:** 26 Eylül'den beri
  `onRewardedVideoAdDismissed` tek başına ödül sayılıyordu → reklamı 2 sn açıp kapatan da
  ödül alıyordu (6 ödül noktasının hepsinde; test de bunu "doğru" bekliyordu). Artık ödül YALNIZ
  native "ödül kazanıldı" sinyaliyle (`onRewardedVideoAdReward` / `showRewardVideoAd()` resolve);
  kapanışta sinyal yoksa 1,5 sn beklenir (sıra kayması), gelmezse `onCancel("skipped")` →
  `_adFailText` "Reklam sonuna kadar izlenmedi". **Kapanışı yeniden ödül sayma.** Testler:
  native_ads_test (noreward=0, dismissfirst=1, nodismissnr=0), ad_skip_test (Tahkik), v8_money (Lütuf).
  **Test beklentisini koddan değil iş kuralından yaz** — bu hata testin kodu kopyalamasından kaçtı.

  `rewardedads.js`'teki `show(onReward, onCancel, onShow)` imzasını ve
  `onRewardedVideoAdShowed`/`onRewardedVideoAdFailedToShow`/
  `onRewardedVideoAdLoaded`/`onRewardedVideoAdFailedToLoad` dinleyicilerini
  kaldırma — hepsi gerçek, doğrulanmış bug'ları kapatıyor.
- **Market + Reklamsız (25 Eylül 2026):** Ana menüdeki eski "AKÇE AL" butonu
  (`#btn-akcesystem`, id değişmedi) artık "MARKET". Aynı `#akce-screen`
  içinde iki bölüm var: **Reklamsız** (non-consumable
  `com.rakuappdigital.sadrazam.noads`, ₺59,99 / $1.99) ve **Akçe Keseleri**.
  Reklamsız alınınca `localStorage.sadrazam_noads='1'` →
  `_gameOverInterstitial()` geçiş reklamını hiç göstermez (6 Ekim'den beri oyun sonunda, §3h-4);
  İkinci Şans'taki ödüllü reklam isteğe bağlı olduğu için etkilenmez.
  RevenueCat'te ayrı entitlement YOK — sahiplik
  `customerInfo.allPurchasedProductIdentifiers`/`nonSubscriptionTransactions`
  üzerinden `_applyNoAdsFromCustomerInfo()` ile okunuyor (her customerInfo
  güncellemesinde `_applyCustomerInfo` içinden). Market'te "Satın Almaları Geri
  Yükle" linki var (non-consumable için Apple şartı). Yetersiz akçe yüzünden
  `redirectToAkcePurchase()` ile gelindiyse `#akce-screen.from-need` sınıfı
  Reklamsız bölümünü gizler.
- **Hoşgeldin Kesesi (29 Eylül 2026; eski adı Başlangıç Kesesi):** Tam Sürüm
  + 30 akçe, tek seferlik. **NON-CONSUMABLE**
  `com.rakuappdigital.sadrazam.welcome` (ASC id `6817474580`, taban ülke TUR
  ₺39,99, 175 ülke, READY_TO_SUBMIT — 1.5.0 incelemeye gönderilirken sürüme
  EKLENMELİ). Tam Sürüm'ü kalıcı açtığı için tüketilebilir OLAMAZ (geri
  yükleme getirmez, Apple 3.1.1 reddi). Eski consumable `akce30start` (id
  `6816653153`, hiç onaylanmadı) kodda KULLANILMIYOR, sürüme eklenmemeli.
  Tam Sürüm: `_applyCustomerInfo` = `full_version` entitlement **VEYA**
  `_customerOwnsProduct(info, STARTER_PRODUCT_ID)` (Reklamsız ile aynı yöntem,
  RevenueCat'te entitlement'a bağlı olmasa da çalışır); satın alınınca
  `purchaseAkcePack` hemen `_setFullVersionUnlocked(true)`. 30 akçe yine
  `processAkceTransactions` (AKCE_PACKS'te `starter:true`, transactionId ile
  tekil; yeniden kurulumda geri yükleme 30 akçeyi tekrar verir — akçe de
  yerel olduğu için bilinçli). Tam Sürüm sahibine gösterilmez
  (`_starterAvailable`). 5 oyun bittikten sonra ana menüye dönüşte
  (`restartGame` → `maybeShowStarterOffer`) BİR KEZ "Ferman Mührü" penceresi
  (`showStarterOffer`); ürün mağazadan gelmediyse (ör. henüz onaylanmadıysa)
  hak yanmaz, pencere de Market satırı da gizli kalır. Karşılaştırma fiyatı =
  Tam Sürüm + 20'lik kese × 1,5 (kuruş, aynı para birimi şartı) → ~~₺59,98~~
  %33. Test: scratchpad `shop_test.js` (44 senaryo, sahte RevenueCat, WebKit
  + Chrome, TR/EN).
- **Tam Sürüm + Reklamsız paketi (3 Ekim 2026):** NON-CONSUMABLE
  `com.rakuappdigital.sadrazam.fullnoads` (ASC id `6818863680`, TUR ₺69,99, 175
  ülke, READY_TO_SUBMIT — bir sonraki sürüm incelemeye giderken EKLENMELİ,
  RevenueCat'e import edilmeli). `_applyCustomerInfo` ve
  `_applyNoAdsFromCustomerInfo` sahipliği ürün listesinden okur, iki kilidi açar.
  Market'te `#market-bundle` sadece ikisine de sahip olmayana (`_bundleAvailable`),
  karşılaştırma fiyatı `_bundleCompare`. Test: scratchpad `bundle_test.js` (sahte
  RevenueCat: `window.Capacitor` ve `RevenueCatPurchases` `defineProperty` +
  `Object.freeze` ile kilitlenmeli, yoksa oyunun paketi taklidi ezer).
- **Ölüm sebebi anahtarı (3 Ekim 2026):** `triggerGameOver(reason, cause)` →
  `_deathCause` ("saray_0", "yeniceri_100", "saglik", "azil", "sultan_guc",
  "padisah_red", "sehzade", "yanlis_oda", "free_limit"). Başarımlar metinden değil
  bundan sayılır (`deathCauses` crossgame, eski metin kayıtları
  `_deathCausesFromCrossGame` ile çevrilir). Yeni ölüm eklersen anahtar ver.
- **İkinci Şans akçe bedeli (29 Eylül 2026): 2 akçe** (`SECOND_CHANCE_AKCE_COST`).
  Teklifin gösterilmesi (reklam hakkı yoksa bakiye ≥ 2), düğme metni ve
  harcama aynı sabiti kullanır. Kâtibin Notu, Şifa Otu, eşyalar 1 akçe kaldı.
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

## 7a. Ayar kombinasyonu testi — ZORUNLU (29 Eylül 2026)

Testler hep varsayılan ayarlarla (ses AÇIK, TR) koşulduğu için "Ses Efekti:
KAPALI" iken ilk kaydırmada oyunun donması 1.2.0'dan 1.5.0'a kadar hiç
yakalanmadı (bkz. §9, 29 Eylül). Oynanışa dokunan her değişiklikten ve HER
build'den önce ilk-kart + uzun oyun testi şu kombinasyonlarla koşulur:
`sadrazam_sfx` on/off, `sadrazam_music` on/off, TR/EN, sola/sağa. Ayrıca
Chrome'a ek olarak **WebKit** (Playwright `webkit` — iPhone/Mac uygulamasının
motoru) ile de koşulur. Ölçüt: `pageerror` sıfır, `cardsPlayed` artıyor,
`isAnimating` false'a dönüyor. Betikler scratchpad'te: `freeze_test.js`
(ilk kart, gerçek touch), `long_test.js` (100 kart; mektup/şans parası/eyalet/
kâtip notu/padişah dahil), `webkit_test.js`.

## 7b. Statik "tanımsız isim" denetimi (28 Eylül 2026)

Sadece bir dil kolunda çalışan tanımsız değişkenler (ör. `LANG==='en' ?
EN_ITEMS[expiredId]`) TR testlerinde HİÇ görünmez; 29 Haziran–28 Eylül arası
İngilizce oyunda eşya süresi dolunca dealNext bu yüzden patlıyordu. Denetim:
projedeki `node_modules/.bin/tsc` ile, scratchpad'e kopyalanan betikler
(translations, sounds, haptics, gamecenter, rewardedads, interstitialads,
game.js) üzerinde `allowJs+checkJs+noEmit`, `lib: es2020,dom`, `types: []`
(Node tipleri parse hatası verir). Çıktıda TS2304/TS2552 ("Cannot find name")
içinden `window.X =` ile tanımlananları ele → kalan her isim gerçek hatadır.
TS2448/2451 (tanımlanmadan kullanım / yeniden tanım) da bakılmalı.

## 8. Genel kural

Değişiklik sonrası HER ZAMAN: `node --check game.js` (syntax) → ilgili
Puppeteer testi (gerçek senaryo, gerçek tıklama/timing) → 2 kopyaya senkron
(§1) → (native etkiliyorsa) `cap sync ios` + gerekirse simülatör smoke-test
(§2) → **commit + deploy** (§0 — artık her zaman, "sadece istenince" değil).
App Store'a gönderim (archive/upload) gibi geri dönüşü zor adımlar öncesi
kısa bir onay iste (zaten sık talep ediliyorsa tekrar sorma, ama versiyon
numarası gibi somut kararları kullanıcı belirtmediyse sorup netleştir).

## 8b. Bekleyen (TODO)

- **v1.6.0 / build 40 (4 Ekim 2026, yüklendi, Delivery UUID `aca17f91-6674-4633-8afe-35fa0b4b020d`)** —
  dönemler, Yıl Sonu, hafıza kartları, 88 yeni kart, market eşyaları, kozmetikler, diplomasi
  (§3g). ASC ayarlarını kullanıcı yaptı; `fullnoads` IAP sürüme eklenmeli / RevenueCat'e import.
  **Build öncesi ZORUNLU kontrol** (ilk yükleme 90328 ile reddedildi: www/ ve public/ içinde
  zsh'ın tek yol sandığı listeden kalma, adında `\n` olan boş klasörler vardı):
  ```bash
  python3 -c "import os,re;print([os.path.join(r,f) for r,d,fs in os.walk('ios/App/App/public') for f in d+fs if not re.fullmatch(r'[A-Za-z0-9._-]+',f)])"
  ```
  Boş liste değilse build alma. zsh'ta dosya listelerini her zaman dizi olarak geçir.

- **v1.5.0 / build 29 (30 Eylül 2026, yüklendi, Delivery UUID `583a6571-7d53-4aa3-8f1d-ced35cc921c8`)** — build 28 + ATT düzeltmesi
  (App Store 2.1 reddi: iOS/iPadOS 27'de ATT penceresi görünmedi). İzin artık
  uygulama görünür + 2,5 sn sonra, AdMob başlatılmadan ÖNCE soruluyor
  (`rewardedads.js` `_requestATT`). İncelemeye **build 29** seçilmeli; Notes
  alanına fiziksel cihaz ekran kaydı (temiz kurulum → ATT penceresi → akış)
  eklenmeli. build 28 notlarındaki IAP maddeleri (welcome + noads) hâlâ geçerli.

- **v1.5.0 / build 28 (29 Eylül 2026, yüklendi, Delivery UUID `3ec279aa-a04e-4eea-8a74-03a1ed6e13ce`)** — build 27 + Hoşgeldin Kesesi (Tam
  Sürüm + 30 akçe, ₺39,99) + İkinci Şans 2 akçe. İncelemeye **build 28**
  seçilmeli; sürüme **`welcome` ve `noads` IAP'ları eklenmeli** (`noads`
  1.4.x'te eklenmediği için hiç onaylanmadı → yayındaki 1.4.1'de Reklamsız
  fiyatı boş, "ürün bulunamadı"). `akce30start` EKLENMEMELİ.

- **v1.5.0 / build 27 (29 Eylül 2026, yüklendi, Delivery UUID `01f48819-af94-4b28-b3d0-e25f15a96fb5`)** — build 26 + ses efektleri
  kapalıyken ilk kaydırmada donma düzeltmesi (§9). İncelemeye **build 27**
  seçilmeli, 26 değil.

- **v1.5.0 / build 26 (28 Eylül 2026'da yüklendi, Delivery UUID
  `7ae8f5dc-3ef2-45c4-ad92-d786e75bf29a`)** — büyük paket + görsel paket +
  mühür damgası + yaşlı portreler + kenar sekmeleri + görsel sıkıştırma + EN
  eşya süresi hatası düzeltmesi. (akce30start notu geçersiz — bkz.
  build 28.) Kullanıcı sürüm notlarını ve
  promosyon metnini kendisi girip gönderecek.

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

### 29 Eylül 2026 — Ses efektleri kapalıyken ilk kaydırmada oyun donuyordu (1.5.0, build 27)

**Belirti (iPhone + Mac, App Store sürümü):** oyun açılınca ilk kart sağa/sola
atılırken yarı yolda asılı kalıyor, bir daha hiçbir şey kaydırılamıyor.

**Kök neden:** `sounds.js`'teki `ctx()` ses efektleri kapalıyken (ya da
AudioContext açılamazsa) `null` döner; 21 `play*` fonksiyonunun 19'u bunu
kontrol etmeden `c.createOscillator()` çağırıyordu → TypeError. `flyOff`'ta
bu çağrı `isAnimating = true`'dan SONRA, kartı fırlatan satırlardan ÖNCE →
kart parmağın bıraktığı yerde kalıyor, `isAnimating` sonsuza dek true, her
yeni dokunuş `onStart`'ta reddediliyor. Aynı hata `dealNext`'teki
`playCardDraw` ve şans kartı parasında da vardı. 1 Eylül (1.2.0) beri kodda.

**Kanıt:** Chrome + WebKit'te build 25 (`7b310a3`) ve 1.5.0 kodu, ses
kapalı → `DONDU` (kart -200px/-14°, `isAnimating:true`, videodakiyle aynı);
ses açık → çalışıyor.

**Fix:** `sounds.js` sonunda tüm `play*` fonksiyonları tek noktadan sarıldı
(ctx null → sessiz çık, iç hata → yakala). `flyOff`'ta ses/haptik ayrıca
try/catch içinde. **Yeni bir `window.playXxx` eklersen o listeye ekle.**
Test: §7a; ses kapalı/açık 100 kart, 5 yıl, 0 hata; WebKit'te de geçti.

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
