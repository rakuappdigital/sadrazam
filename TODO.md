# Sadrazam — TODO

## SIRADAKİ — v1.5.0 / build 26 (28 Eylül 2026)

**Durum:** ASC'ye yüklendi (Delivery UUID `7ae8f5dc-3ef2-45c4-ad92-d786e75bf29a`),
işlendi (VALID), 1.5.0 sürüm sayfasına BAĞLANDI, şifreleme uyumluluğu "hayır"
işaretlendi. Build commit'i `129687e` (main'deki her şeyi içeriyor — 21 özellik
tek tek doğrulandı). İncelemeye gönderimi kullanıcı yapacak.

### Göndermeden önce (kullanıcı)
- [ ] Sürüm notları (What's New) TR/EN ve promosyon metni TR/EN girilecek —
      metinler aşağıda "1.5.0 metinleri" başlığında.
- [ ] Sürüm sayfasındaki Uygulama İçi Satın Almalar bölümüne **`akce30start`
      (Başlangıç Kesesi)** ve **`noads` (Reklamsız)** eklenecek — ikisi de
      READY_TO_SUBMIT, ilk kez gönderiliyor; eklenmezse satın alınamaz.
- [ ] (İsteğe bağlı) RevenueCat panelinde `akce30start`'ı Consumable ürün olarak
      ekle — satın alma için şart değil, sadece RC raporlarında görünsün diye.

### İnceleme / yayın sonrası kontrol
- [ ] Review sonucu (reddedilirse gerekçeyi oku, ASC API ile durum kontrolü).
- [ ] Gerçek cihazda reklamlar: İkinci Şans reklamı sonuna kadar izle → ödül +
      sayaç 5/5 → 4/5; geçiş reklamı artık **her 3.** "OYUNA BAŞLA"da. Yeni
      reklamlı noktalar: Günlük Divan Hediyesi, Kâtibin Notu / Müneccimbaşı,
      Kritik An — hepsinde reklam sonrası ödül geliyor mu?
- [ ] Başlangıç Kesesi: 5. oyun bitince ana menüde bir kez çıkıyor mu, fiyat
      ₺14,99 geliyor mu, satın alınca +30 akçe ve teklif kayboluyor mu, Market'te
      satır görünüyor mu.
- [ ] Reklamsız (`noads`) — hiç TestFlight doğrulaması yapılmadı: fiyat ₺59,99,
      satın alınca geçiş reklamı kesiliyor mu, "Geri Yükle" çalışıyor mu.
- [ ] Yayından 1 gün sonra AdMob panelinde gösterim ve gelir.
- [ ] Performans: mevsim parçacıkları eski cihazda akıcı mı (gerekirse
      Ayarlar → Mevsim Efekti kapatılabiliyor).

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
  Kâtibin Notu (reklam/1 akçe), Başlangıç Kesesi (30 akçe ₺14,99, 5. oyundan
  sonra bir kez), Tam Sürüm ekranında kişisel bağlam, ölüm/İkinci Şans
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
• Günlük Divan Hediyesi, Kritik An yardımı ve Başlangıç Kesesi.
• Özel kartlarda artık iki seçenek var.
• Yeni görünüm: Mevsimlere göre kar, lale ve yaprak yağan atmosfer; ölüm ekranında saltanatınızın vakayinamesi; yıllar geçtikçe yaşlanan portreler; kartın iki yanında seçenekleri gösteren işaretler.
• Uygulama boyutu yarıya indi, performans iyileştirildi, çeşitli hatalar düzeltildi.

**What's New — EN**
A major update to the Divan!
• Echoes of your decisions: The consequences of your choices return months later, and sometimes two decisions come back on the same day. When a result arrives, a seal is stamped on the card showing which decision it came from.
• 5 new characters: the Chief Astrologer, the Celali Chieftain, the Returned Exile, the Genoese Podestà and the Indian Physician. Each appears because of your own decisions.
• The Great Fire of Istanbul: The wrong choices can leave the city in flames.
• Pargalı's Secret: Follow a mysterious seven-page letter across your reigns.
• Challenge Mode and Experienced Mode: Play with goals and see the effects of your choices in advance.
• The Scribe's Note: Learn what a pending consequence will bring before it arrives.
• Daily Divan Gift, Critical Moment help and the Starter Pouch.
• Special cards now offer two choices.
• A new look: seasonal snow, tulip petals and falling leaves; a chronicle of your reign on the game over screen; portraits that age over the years; side markers that show each card's choices.
• The app is now half the size, with better performance and various bug fixes.

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
