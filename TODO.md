# Sadrazam — TODO

## SIRADAKİ — v1.6.0 / build 40 YÜKLENDİ (4 Ekim 2026) ← BURADAN DEVAM

**Durum:** 1.6.0 (build 40) App Store Connect'e yüklendi — Delivery UUID
`aca17f91-6674-4633-8afe-35fa0b4b020d`. ASC ayarlarını (görseller, metinler, IAP) kullanıcı
kendisi yaptı; incelemeye gönderimi kullanıcı yapacak. Kullanıcıdan beklenen: `fullnoads`
IAP'ı ayrı gönderimde incelemede (sorun değil; ret gelirse 1.6.0 yayındayken yeniden gönder) +
RevenueCat'e import önerilir. 1.6.0 sürümü build 40 ile "Waiting for Review". GitHub'a push YAPILDI (5 Ekim).
Yenilikler + promotional text: `~/Desktop/yenilikler-1.6.txt`; TR/EN ekran görüntüleri:
`~/Desktop/appstore-1.6/TR|EN`.

**İlk yükleme reddi ve çözümü:** altool 90328 "dosya adında geçersiz karakter". `www/` ve
`ios/App/App/public/` içinde, eski bir oturumda zsh'a dosya listesini tek yol olarak veren
`mkdir -p`'den kalma, adı `game.js assets/divan-bg.jpg …\nassets` olan BOŞ iç içe klasörler
vardı (git'te izlenmiyordu). Silindi. **Kural:** build öncesi `ios/App/App/public` içinde
`[A-Za-z0-9._-]` dışı ad var mı tara (CLAUDE.md §8b'de komut).

### 1.6.0'da neler var (hepsi main'de, commit'ler: dbacde1 → 99b6131)
- **Görseller:** 94 kart görseli kullanıcının yeni çizimleriyle (yanlardan eşit kırpma, 3:4);
  10 dönem karakteri + 8 yeni karakter + 5 diplomasi muadili portresi; ölüm/son sahneleri.
- **Dönemler:** IV. Murad (6 mühür) ve III. Ahmed (15 mühür); 35 dönem kartı; Harem Nüfuzu /
  Sultan'ın Gözü / Halkın Öfkesi sayaçları; Kanunî'ye Matrakçı Nasuh.
- **Yıl Sonu ekranı:** yıl dönümü tek ekranda, hiçbir pencere kendiliğinden kapanmaz
  (kullanıcı kuralı); vergi reformu çift gelme hatası düzeltildi; özel kartlar dağıtıldı.
- **Müzik:** menu5/menu6 yalnız menüde, oyun5/oyun6 yalnız oyunda (fade aynen).
- **Görünüş:** Hakkında 2B (Divan salonu + canlı rakamlar + kullanıcının metni + Puan Ver /
  Görüş Yaz), font Alegreya (3B), ana ekranda tuğralı amblem (4A, kompakt), v1.6.0 etiketi.
- **Hafıza kartları:** karakterler 15–40 kart önceki kararı sorar (sınav, yüzleşme, Rakip
  Vezir'in tuzağı, etkisiz kedi); oyun başına ≤3; Hafızası Kuvvetli başarımı.
- **Kart tekrarı:** 88 yeni kart (tek kartlı 10 karaktere 4'er + 8 yeni karakter 6'şar),
  en sık 35 karta ikişer sahne varyantı. Simülasyon: 4. oyunda yeni içerik %43 → %55.
- **Market:** Usturlap 3, Kum Saati 2, Mehter Kösü 3, Lale Soğanı 3, Mühürlü Zarf 2 akçe;
  kozmetikler Çini Kart Çerçevesi 8, Sadrazam Kaftanı 6, Hattat Kalemi 5 akçe.
- **Diplomasi:** 5 muadil (Venedik, Safevi, Habsburg, Fransa, Moskova), itibar, mektup/tehdit,
  nadir 3 turlu görüşme, antlaşmalar, Divan Halkası'nda Dış İlişkiler, 4 başarım.
- **Düzeltmeler:** Koleksiyoncu başarımı hiç açılmıyordu; "Fetvayı erteleyın" yazımı.
- **Test:** 26 grup (scratchpad) + para/akçe testi (88 kontrol: keseler, Tam Sürüm, Reklamsız,
  paket, Hoşgeldin, geri yükleme, tüm akçe harcamaları) Chromium+WebKit, TR+EN, ses açık/kapalı.

### Sonraki fikirler (kullanıcı onayı yok, istenirse)
- 52 "kör" kartın dengelenmesi (uyarı kalsın; 200'er oyun önce/sonra simülasyon).
- Antlaşmaların Miras olarak bir sonraki saltanata taşınması (demoda önerildi, yapılmadı).
- Kozmetik çerçeve seçimi şu an Market'te; istenirse Ayarlar'a da kısayol.

## (TAMAMLANDI) 4 Ekim 2026 sabah durumu — 1.5.0 yayında iken

1.5.0 YAYINDA. main'de BUILD ALINMAMIŞ çok şey var (1.5.1 adayı): başarım düzeltmeleri,
ücretsiz 2 yıl akışı + 3. yıl kilidi, Tam+Reklamsız paketi, yeni paywall + ortak mühür,
kriz nabzı, etki bölgesi, lanet uyarısı, idam sahnesi, zamanlı kriz kartı, sefer oku,
Market Eşyalar, Padişah Fermanı, Ana Kadro, Divan Oturumu, Vezirler Defteri (CLAUDE.md §3e).

Kullanıcıdan beklenen:
- Tasarım sayfası 2. tur seçimleri: https://claude.ai/artifact/WcWZgcg5QXLWLSWZ2vU9Ht
  (A mühür varyantı, C Yaşayan Divan 1/2/3, D Sonlar yapısı onayı, E kişisel mühür)
- Görseller: ~/Desktop/olumler (13 ölüm sahnesi), ~/Desktop/yeni (10 karakter). Gelince
  1080x1440 JPEG → assets/characters, ölüm sahnelerini _actuallyTriggerGameOver'daki
  sinematiğe bağla (yoksa mevcut portre davranışı sürer).
- RevenueCat'e `fullnoads` import + sürüme ekleme. ASC inceleme görüntüsü eski Market
  amblemiyle (yıldız) yüklendi; istenirse yenisiyle değiştir.

Sırada (onay gelince): Sonlar (3 duraklı yollar + Nişan + Emekliliğini İste), göreve başlama
sahnesi, yıl geçişi sahnesi, kişisel mühür + kozmetikler, 52 boş kararın dengelenmesi
(200'er oyun önce/sonra simülasyon), dönem kartları (Lale Devri ilk).

## SIRADAKİ — v1.5.0 / build 28 (29 Eylül 2026) ← BURADAN DEVAM

**Durum:** Build 28 ASC'ye yüklendi (Delivery UUID
`3ec279aa-a04e-4eea-8a74-03a1ed6e13ce`, commit `b9977ab`). Sürüm numarası
1.5.0 aynı; build 26 ve 27 de ASC'de ama **incelemeye build 28 gidecek**.
İncelemeye gönderimi kullanıcı yapacak. Build 28 = build 26 + aşağıdaki
"29 Eylül değişiklikleri".

### 29 Eylül değişiklikleri (build 27 + 28, hepsi test edildi)
- **KRİTİK HATA DÜZELTİLDİ — ses efektleri kapalıyken oyun donuyordu**
  (build 27). Ayarlar'da Ses Efekti KAPALI iken ilk kart kaydırılınca kart yarı
  yolda asılı kalıyor, oyun kilitleniyordu (iPhone + Mac, App Store sürümü).
  Kök neden: `sounds.js`'te `ctx()` ses kapalıyken `null` dönüyor, `play*`
  fonksiyonları kontrol etmeden `c.createOscillator()` çağırıyordu →
  `flyOff`'ta `isAnimating` sonsuza dek `true` kalıyordu. Aynı hata ilk kartın
  çekilişinde ve şans kartı parasında da vardı. **1.2.0'dan (1 Eylül) beri
  vardı**, testler hep ses AÇIK yapıldığı için yakalanmadı. Fix: tüm `play*`
  fonksiyonları tek noktadan korunuyor + `flyOff`'ta ses/haptik try/catch.
  Ayrıntı CLAUDE.md §9 (29 Eylül). **Yeni kural (CLAUDE.md §7a):** her
  build öncesi testler ses/müzik kapalı, TR/EN, Chrome + WebKit ile de koşulur.
- **İkinci Şans artık 2 akçe** (eskiden 1). Sadece `SECOND_CHANCE_AKCE_COST`
  değişti. Kural aynı: reklam hakkı varsa ya da bakiye ≥ 2 ise teklif çıkar;
  bakiye yetmezse akçe düğmesi Market'e götürür, akçe alınınca kurtarılır.
  Kâtibin Notu, Şifa Otu, eşyalar 1 akçe kaldı.
- **Hoşgeldin Kesesi (eski Başlangıç Kesesi): Tam Sürüm + 30 akçe, ₺39,99.**
  Yeni NON-CONSUMABLE ürün `com.rakuappdigital.sadrazam.welcome` (ASC id
  `6817474580`, taban ülke TUR ₺39,99, 175 ülke, TR/EN açıklama + inceleme
  görüntüsü yüklü, READY_TO_SUBMIT). Tek seferlik: alınınca pencere ve
  Market satırı kaybolur; geri yüklenebilir; Tam Sürüm sahibine gösterilmez.
  5. oyundan sonra ana menüde bir kez pencere, "Daha sonra" denirse Market'te
  kalır. Karşılaştırma: ~~₺59,98~~ %33 indirimli. Önizleme:
  https://claude.ai/artifact/18om2hXfuTVQUPXTWfeF1p
  Eski consumable `akce30start` (Başlangıç Kesesi, ₺14,99, id `6816653153`)
  artık KULLANILMIYOR (hiç onaylanmadı; kalıcı Tam Sürüm tüketilebilir ürünle
  verilemez).
- **Tespit: yayındaki 1.4.1'de Reklamsız fiyatı boş, "ürün bulunamadı"
  diyor.** Sebep RevenueCat değil: `noads` ürünü hiç incelemeye
  gönderilmemiş (READY_TO_SUBMIT), Apple onaysız ürünü yayındaki uygulamaya
  vermiyor. 1.5.0 ile birlikte gönderilince düzelir.
- Testler: `shop_test.js` 44 senaryo (satın alma/iptal/hata/Market/geri
  yükleme/paywall/İkinci Şans 1-2-3 akçe) WebKit + Chrome, TR/EN; ses
  kapalı/açık ilk kart + 100 kartlık oyun 4 kombinasyon; 320×568'e kadar
  pencere yerleşimi. Hepsi geçti, JS hatası sıfır.

### Göndermeden önce (kullanıcı)
- [ ] 1.5.0 sürüm sayfasında **build 28**'i seç (26/27 değil).
- [ ] Uygulama İçi Satın Almalar bölümüne **`welcome` (Hoşgeldin Kesesi)** ve
      **`noads` (Reklamsız)** eklenecek. **`akce30start` EKLENMEYECEK.**
- [ ] Sürüm notları ve promosyon metni TR/EN — aşağıda "1.5.0 metinleri"
      (29 Eylül'de Hoşgeldin Kesesi ve ses düzeltmesine göre güncellendi).
- [x] RevenueCat'e ürünler import edildi (kullanıcı, 29 Eylül). Onaydan sonra
      RC'de de approved görünecekler. Kod, RC entitlement'ına bağlı olmasa da
      Hoşgeldin Kesesi'ni Tam Sürüm sayar (satın alınmış ürün listesinden).
- [ ] (İsteğe bağlı) ASC'den eski `akce30start` ürününü silmek — kullanıcı
      isterse (hiç onaylanmadığı için güvenli).

### İnceleme / yayın sonrası kontrol
- [ ] Review sonucu (reddedilirse gerekçeyi oku, ASC API ile durum kontrolü).
- [ ] **TestFlight'ta (sandbox) Hoşgeldin Kesesi:** fiyat ₺39,99 geliyor mu,
      satın alınca Tam Sürüm açılıyor + 30 akçe geliyor mu, pencere/Market
      satırı kayboluyor mu, uygulamayı silip "Satın Almaları Geri Yükle" ile
      Tam Sürüm geri geliyor mu. (Bilgisayarda sahte mağazayla test edildi,
      gerçek ödeme akışı sadece cihazda denenebilir.)
- [ ] **Ses efektleri KAPALI iken** ilk kartı kaydır → donmamalı (build 27+).
- [ ] İkinci Şans: 2 akçeyle kurtarma, 1 akçede Market'e yönlendirme.
- [ ] Reklamsız (`noads`): fiyat ₺59,99, satın alınca geçiş reklamı kesiliyor
      mu, "Geri Yükle" çalışıyor mu.
- [ ] Gerçek cihazda reklamlar: İkinci Şans reklamı sonuna kadar izle → ödül +
      sayaç 5/5 → 4/5; geçiş reklamı **her 3.** "OYUNA BAŞLA"da. Günlük Divan
      Hediyesi, Kâtibin Notu / Müneccimbaşı, Kritik An — reklam sonrası ödül.
- [ ] Yayından 1 gün sonra AdMob panelinde gösterim ve gelir.
- [ ] Performans: mevsim parçacıkları eski cihazda akıcı mı (gerekirse
      Ayarlar → Mevsim Efekti kapatılabiliyor).

### Açık fikir (karar bekliyor, yapılmadı)
- [ ] Reklam hakkı bitmiş + bakiyesi 2'den az oyuncuya İkinci Şans teklifi
      hiç çıkmıyor (kural değişmedi, eskiden 0 akçede de böyleydi). İstenirse:
      teklif yine gösterilir, akçe düğmesi Market'e götürür → satış fırsatı.
      Kullanıcı onayı olmadan yapılmayacak; yapılırsa yeni build gerekir.

### 1.5.0'da ne var (1.4.1'den bu yana, hepsi test edildi)
**Mekanik / içerik**
- Gecikmeli sonuç sistemi + birleşik sonuç ("iki kararınız aynı gün geri
  döndü") — oyunda "iplik/düğüm" kelimesi geçmez (CLAUDE.md §3b).
- Tek butonlu özel kartlar iki seçenekli oldu (kedi, kehanet, Evliya, tarihî
  karakterler, felaket/mucize, Pargalı, gölge, miras, gizli nitelik…).
- 5 yeni karakter (Müneccimbaşı, Celali Reisi, Sürgünden Dönen Genç, Ceneviz
  Podestası, Hint Tabibi) + Büyük İstanbul Yangını olayı (CLAUDE.md §3c).
- Pargalı'nın Sırrı (7 sayfalık oyunlar arası gizem), Meydan Okuma Modu,
  Deneyimli Mod (etki önizlemesi), mod tanıtım pencereleri.
- Gizli hain soruşturması ipucu sistemiyle geri geldi.
**Monetizasyon**
- Günlük Divan Hediyesi (reklam → akçe, 7 gün serisi), Kritik An teklifi,
  Kâtibin Notu (reklam/1 akçe), Hoşgeldin Kesesi (Tam Sürüm + 30 akçe ₺39,99,
  5. oyundan sonra bir kez; 29 Eylül), İkinci Şans 2 akçe (29 Eylül), Tam Sürüm ekranında kişisel bağlam, ölüm/İkinci Şans
  ekranında "yarım kalan sonuçlar", geçiş reklamı 2 → 3 oyunda bir.
**Görsel**
- Mevsim atmosferi (kartın arkasında kar/lale/toz zerresi/yaprak, Ayarlar'dan
  kapatılabilir), sonuç kartında mühür damgası, ölüm ekranında Vakayiname,
  yaşlanan portreler (10. yılda yaşlı portre; 8 karakter), boş eşya kutularında
  silüet + bilgi, kartın yanlarında seçenek metinli kenar sekmeleri (sadece
  görüntü), Venedik Balyosu'nun yeni portresi, 5 yeni karakter portresi.
**Performans**
- Görseller sıkıştırıldı, kullanılmayanlar paket dışına alındı: assets
  113 MB → 56 MB (görsel ortalaması 796 KB → 300 KB), IPA 94 MB (CLAUDE.md §3d).
**Hata düzeltmeleri**
- Ses efektleri kapalıyken ilk kaydırmada oyun donuyordu (1.2.0'dan beri) —
  düzeltildi (29 Eylül, build 27).
- İngilizce oyunda eşya süresi dolunca oyun takılıyordu (29 Haziran'dan beri,
  tanımsız `expiredId`) — düzeltildi.
- EN'de eşya adı ve "Sıhhat" etiketi Türkçe kalıyordu; TR menüde Meydan Okuma
  "CHALLENGE" yazıyordu; oyunda kalan son "iplik" ifadeleri (başarım adı →
  "Kararın Yankısı"); ölümde açık kalan not penceresi; 20 kartın EN karakter
  adı; Kâtip metninde Türkçe ek hatası.
**Reklam altyapısı:** `rewardedads.js` ve native AdMob HİÇ değişmedi; İkinci
Şans reklam/ödül/sayaç kodu 1.4.1 ile birebir aynı (28 Eylül'de fonksiyon
fonksiyon karşılaştırıldı, 17 senaryoluk reklam testi geçti).

### Sonraki geliştirme için açık kalanlar / fikirler
- [ ] (İsteğe bağlı) Müzik 23 MB — zaten 64 kbps MP3; yeniden sıkıştırma
      kaliteyi bozar, ancak kullanıcı isterse daha düşük bitrate denenebilir.
- [ ] (Üslup) EN metinlerde "vakıfs" → "endowments" yapılabilir.
- [ ] Yeni yaşlı portre eklenecekse: `<anahtar>_v2.jpg` 1080 px JPEG q80 +
      `CHARACTER_EVOLUTIONS` satırı (dosyasız satır ekleme).

### 1.5.0 metinleri (kullanıcıya verildi, ASC'ye kullanıcı girecek)
**What's New — TR**
Divan'da büyük güncelleme!
• Kararlarınızın yankısı: Verdiğiniz kararların sonuçları aylar sonra kapınızı çalar; bazen iki kararınız aynı gün birlikte geri döner. Bir sonuç geldiğinde kartın üstüne mühür vurulur, hangi kararınızdan geldiği yazar.
• 5 yeni karakter: Müneccimbaşı, Celali Reisi, Sürgünden Dönen Genç, Ceneviz Podestası ve Hint Tabibi. Hepsi sizin kararlarınızla sahneye çıkar.
• Büyük İstanbul Yangını: Yanlış kararlar şehri alevlere teslim edebilir.
• Pargalı'nın Sırrı: Oyunlar boyunca yedi sayfalık gizemli bir mektubun izini sürün.
• Meydan Okuma Modu ve Deneyimli Mod: Hedeflerle oynayın, kararların etkisini önceden görün.
• Kâtibin Notu: Bekleyen bir sonucun ne getireceğini önceden öğrenin.
• Günlük Divan Hediyesi, Kritik An yardımı ve Hoşgeldin Kesesi (Tam Sürüm + 30 akçe).
• Özel kartlarda artık iki seçenek var.
• Yeni görünüm: Mevsimlere göre kar, lale ve yaprak yağan atmosfer; ölüm ekranında saltanatınızın vakayinamesi; yıllar geçtikçe yaşlanan portreler; kartın iki yanında seçenekleri gösteren işaretler.
• Uygulama boyutu yarıya indi, performans iyileştirildi, çeşitli hatalar düzeltildi. Ses efektleri kapalıyken oyunun donması giderildi.

**What's New — EN**
A major update to the Divan!
• Echoes of your decisions: The consequences of your choices return months later, and sometimes two decisions come back on the same day. When a result arrives, a seal is stamped on the card showing which decision it came from.
• 5 new characters: the Chief Astrologer, the Celali Chieftain, the Returned Exile, the Genoese Podestà and the Indian Physician. Each appears because of your own decisions.
• The Great Fire of Istanbul: The wrong choices can leave the city in flames.
• Pargalı's Secret: Follow a mysterious seven-page letter across your reigns.
• Challenge Mode and Experienced Mode: Play with goals and see the effects of your choices in advance.
• The Scribe's Note: Learn what a pending consequence will bring before it arrives.
• Daily Divan Gift, Critical Moment help and the Welcome Pouch (Full Version + 30 akce).
• Special cards now offer two choices.
• A new look: seasonal snow, tulip petals and falling leaves; a chronicle of your reign on the game over screen; portraits that age over the years; side markers that show each card's choices.
• The app is now half the size, with better performance and various bug fixes. Fixed a freeze when sound effects were turned off.

**Promosyon — TR:** Kararlarınız geri dönüyor! 5 yeni karakter, Büyük İstanbul Yangını, Pargalı'nın Sırrı ve yaşlanan portreler. Divan'da ne kadar ayakta kalabilirsiniz?
**Promosyon — EN:** Your decisions come back to haunt you! 5 new characters, the Great Fire of Istanbul, Pargalı's Secret and aging portraits. How long can you survive the Divan?

## Önceki sürümler (arşiv)

- **v1.4.1 / build 25** — 26 Eylül 2026 yüklendi, onaylandı, YAYINDA
  (READY_FOR_SALE). Ödüllü reklam 45 sn hangGuard kök neden fix'i + canlıda
  sahte reklam kaldırıldı. Ayrıntı: aşağıdaki 26 Eylül bölümü ve CLAUDE.md §9.
- 27 Eylül "5 geliştirme" isteği (iki seçenekli kartlar, görsel öneriler,
  reklam/akçe önerileri, yeni karakterler, rakip analizi) ve "büyük paket" +
  "düğüm sistemi" — hepsi tamamlandı, 1.5.0'a girdi.

## Bu session'da yapılanlar (26 Eylül 2026)

Commit'ler: `1cbce90`, `cb22f65`, `7b310a3`, `8ffee08` (hepsi push edildi).

1. **Ödüllü reklamda ödül verilmemesinin gerçek kök nedeni bulundu ve düzeltildi.**
   `game.js`'teki `hangGuard`, reklam açıldıktan 45 sn sonra reklam hâlâ
   ekrandayken teklif ekranını yeniden açıyordu; sonra gelen Dismissed event'i
   yok sayılıyordu → ödül yok, sayaç 5/5. Gerçek reklamlar 45 sn'yi aştığı için
   sadece yayında görülüyordu. Tüm zaman aşımları kaldırıldı; akış sadece native
   event'lerle (Dismissed / FailedToShow) ya da "uygulama tekrar görünür oldu"
   yedeğiyle biter.
2. **Canlıda sahte "SİMÜLE REKLAM (test modu)" kaldırıldı** (ödüllü + geçiş).
   Ödüllü: reklam yüklenmemişse 10 sn gerçek reklam beklenir, gelmezse "Şu an
   reklam bulunamadı" mesajı, ödül yok, hak düşmez. Geçiş: yüklenmemişse oyun
   hemen başlar. Simülasyon sadece web/tarayıcıda kaldı.
3. **Geçiş reklamı ilk isteği ATT cevabından sonra yapıyor** (`window.__admobReady`)
   → IDFA'lı istek, daha yüksek gelir.
4. Ana menü sürüm etiketi `v1.3.7` → `v1.4.1`.
5. Sürüm 1.4.1 (25), archive → export → validate → upload (CLI).

## Doğrulama (nasıl test edildi)

- Simülatörde Debug build + Google test reklam ID'leri + geçici `dbg.js` +
  geçici AppDelegate "kapat" tetikleyicisi (`notifyutil -p com.dbg.closead`,
  `GADCloseButton`'a `touchUpInside` gönderir). Hiçbiri commit edilmedi.
  Sonuç: ödüllü reklam 64 sn açık → kapat → ödül, `used=1`, buton 4/5;
  geçiş reklamı kapat → oyun başladı.
- Node `vm` senaryo testi (17 senaryo, hepsi geçti) — scratchpad'teki
  `adtest.js`, geçici; gerekirse CLAUDE.md'deki tarife göre yeniden yazılır.
- Web Puppeteer (puppeteer-core + sistem Chrome): sayaç 5/5 → 4/5, ödül verildi.
- Yüklenen archive içi kontrol edildi: gerçek ID'ler, test ID yok, dbg yok.

## Notlar

- Yayındaki eski "1.3.9" sürüm kaydının içindeki binary aslında 1.4.0/build 23.
- ASC API anahtarı `~/.appstoreconnect/private_keys/AuthKey_CPP9BC37NY.p8`
  (Masaüstünde değil — CLAUDE.md §2'deki `~/Desktop` yolu eski).
- Simülatörde tıklama (cliclick/System Events) erişilebilirlik izni olmadığı
  için çalışmıyor; reklam kapatma testi için yukarıdaki AppDelegate yöntemi.
- Taze kurulumda ATT penceresi cevaplanmadan ödüllü reklam yüklenmez (normal;
  pencere modal). Simülatör testinde ATT'yi sadece test kopyasında atla.
- AB (GDPR) kullanıcıları için UMP/CMP onay formu yok — AB'de reklam doldurma
  oranı düşük olabilir. İstenirse ayrı iş olarak eklenebilir.
