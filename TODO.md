# Sadrazam — TODO

## SIRADAKİ — 1.7.0 / build 43 incelemede (7 Ekim 2026) + BÜYÜK YAMA seçimleri ← BURADAN DEVAM

**Durum:** 1.7.0 / **build 43** yüklendi (Delivery `023c907c-cd3d-4f8d-be4c-a6a97dca0bb2`), 1.7.0'a bağlanıp
incelemeye gönderildi: WAITING_FOR_REVIEW (7 Ekim 01:14 TR). Not: build 43'te export compliance boş kalmıştı
(usesNonExemptEncryption) → API ile false yapıldı (önceki build'lerle aynı); yeni build'lerde bunu kontrol et. Push (e3dd76c) + Vercel deploy yapıldı.
Build 42 hiç gönderilmedi (PREPARE_FOR_SUBMISSION'dayken 43 ile değiştirildi).

**Build 43'te olanlar (6–7 Ekim):** reklam düzenlemesi (aşağıda), EN şans/müzakere kartları, metin düzeltmeleri ve
arayüz düzeltmeleri S1–S8 + D1–D8 (commit ada0126; ayrıntı CLAUDE.md §3h-5):
- S1 Duraklat: Devam Et en üstte (primary), "Oyunu bitir…" onaylı (gm-confirm), touchend'de silme yok.
- S2 Duraklat'ta Müzik/Efektler (gm-mus / gm-sfx, Ayarlar'la aynı localStorage).
- S3 Ana menü: #intro-footer akışta (absolute değil); @media max-height 880/740 sıkıştırma; SE'de her şey sığıyor.
- S4 ::before görünmez dokunma alanları (☰, ferman çipi; büyüteç/Tahkik yalnız kart kenarına doğru).
- S5 Nasıl Oynanır: 8 araç (howto.t_*), sticky altın başla düğmesi, klavye satırı html.native'de gizli.
- S6 .negot-card (müzakerede portre küçük; dealNext başında ve letter-card ile birlikte temizlenir).
- S7 _cagToast başlığın (header-row / ferman-chip) altında açılır.
- S8 sultan kartı "SEÇİLDİ" rozeti (html[lang=en] → SELECTED), alt şerit geçişi.
- D1 _btnFirstHint (ilk 3 görüş etiketi), D2 Deneyimli Mod + Promosyon kaldırıldı, previewMode HERKESE false
  (Tahkik/Usturlap'ı işlevsiz kılıyordu), D3 başarım rozeti 0/N (.zero), D4 #restart-btn sticky,
  D5 başarım sekmeleri 3×2 / 40px, D6 #scroll-hint (intro/akce/achievements, eşik 48px), D7 ikincil yazı opaklığı,
  D8 Market sandık notu üstte + oyun içi dükkân .esya-note.
- Testler: scratchpad ux_fix_test.js (136 kontrol ×2 tur), ad_test, long_test, death_test, native_ads_test (164),
  fuzz 5 ayar × 600 adım — hepsi temiz.

**7 Ekim (öğleden sonra) — BÜYÜK YAMA UYGULANDI (commit fb71c05, build YOK):** kullanıcı seçimi
A1 A3 A4 A7 A9 · Y1 Y2 · K1 K2 K4 K6 K7 + G2-B. Önizleme: https://claude.ai/artifact/CdRnh1gUMFZuuvxcSEDRAT
- G2-B: showGameMenu alttan pencere (gm-* kimlikleri aynı; ses iki ayrı anahtar). 
- A1 _quickPack* (İkinci Şans'ta 10'luk kese, ürün yoksa görünmez; alınınca spendAkce retry, A9 bitince resolve).
- A3 #intro-wallet. A4 STARTER_BAND_AT (48 sa, #btn-full-version.starter-band). A7 _renderCosmPreview (ilk oyunda yok).
- A9 _akceCeremony (purchaseAkcePack başarıda). Y1 COACH_TIPS/_coach* (sadrazam_coach; #coach-overlay fitil ve klavyeyi
  durdurur). Y2 DEATH_LESSONS + _nextGoalHTML. K1 _reignFav (cag.rf) + REIGN_TITLES + paylaşım metni.
- K2 showKartKodeksi (KODEKS_OPEN_KEY, süzgeç, gölge). K4 _playCardBack (#card-back, kartın İÇİNDE katman).
- K6 TARIH_OLAYLARI (34; düğüm yılları, sultan ölümleri, sadrazam idamları bilerek yok). K7 .achievement-toast.ach-seal.
- Testler: scratchpad new_feat_test.js (hepsi geçti); ux_fix_test.js ve long_test.js ipuçlarını görülmüş sayacak ve
  G2-B'ye göre güncellendi. **Bekleyen seçim:** G1-A1/A2/A3 (önerim A2), G3-A1/A2/A3 (önerim A2). Seçimden sonra
  uygulanıp test, sonra build 44 (1.7.0'a mı 1.7.1'e mi — 43 incelemede).

**BÜYÜK YAMA — öneri sayfası:** https://claude.ai/artifact/CzTskzKzTzQ4ExW21JKKtH
(9 tasarım: G1 ana menü A/B/C, G2 duraklat A/B/C, G3 Market A/B/C — oyunun kendi style.css'iyle çizildi;
A1–A10 akçe satışı, Y1–Y6 yönlendirme, K1–K8 keyif). Taslak üreticiler: scratchpad demo/gen.py, gen2.py.
**Kullanıcı seçimi (7 Ekim):**
- G1 = A, ama "İlerlemen" kutucuklarıyla Tam Sürümü Aç arasında boşluk kalıyor; kutucuklar büyütülebilir →
  bunun için 3 alternatif daha istendi.
- G2 = B (uygula).
- G3 = A beğenildi ama "geliştirilebilir" → A'ya benzer 3 seçenek daha istendi.
- Akçe satışı listesi anlaşılmadı ("birini mi seçmeliyim?") → önce açıklama, sonra hepsi birlikte yapılacak.
Önerim: G1-A · G2-B · G3-A · A1 A2 A3 A4 · Y1 Y2 · K1 K2 K3. Önce web demo, onaydan sonra oyuna.

## SIRADAKİ — 1.7.0 / build 42 (6 Ekim 2026 gece) ← BURADAN DEVAM

**Durum:** 1.7.0 / **build 42** yüklendi (Delivery UUID `1056bc73-e8ed-4c42-a2b1-08efb521698c`, sürüm numarası
DEĞİŞMEDİ). Build 41 ile bekleyen inceleme gönderimi (`0e4bf5b5-…`, 6 Ekim 01:26) **iptal edildi**; build 42
işlendi (VALID) ve 1.7.0.a bağlandı; sürüm durumu PREPARE_FOR_SUBMISSION. **İncelemeye yeniden gönderim kullanıcıda.**
Gönderimde yalnız sürüm vardı, IAP yoktu (oyunun kullandığı tüm IAP'lar APPROVED; `fullnoads` / `akce30start`
SEÇİLMEMELİ). GitHub push (d1765a1) ve Vercel deploy yapıldı, canlıda yeni reklam kodu doğrulandı.

**Build 42'den SONRA yapılanlar (commit d0257b4 — build'de YOK, push/deploy YOK, bir sonraki build'e girer):**
- EN: şans kartları (5) ve müzakere kartları (2) İngilizce oyunda Türkçe yazıyordu → metin, karakter adı,
  6 seçenek çevirisi (`label_en`). Fuzz testi buldu.
- Metin: ödeme ekranı/Market "Oyun başında geçiş reklamı yok" → "Saltanat bitince çıkan geçiş reklamı yok"
  (TR+EN). Build 42'de eski metin var (yanlış ama zararsız).
- Metin: Nasıl Oynanır "Her 10 kartta bir yıl" → 24 (TR+EN; CARDS_PER_YEAR = 24).

**Oynanış doğrulaması (6 Ekim gece):** fuzz testi 4 ayar × 600 adım (Chrome/TR/Tam, WebKit/EN/Tam — 6. yıl,
WebKit/TR/sahte iPhone, Chrome/EN/ücretsiz) → hata, takılma, kural ihlali yok. Tek bulgu yukarıdaki EN sızıntısı.

**SIRADAKİ OTURUM — Arayüz (UX) incelemesi, kullanıcı seçimi bekleniyor:**
Rapor: https://claude.ai/artifact/ERTHhhCRCeftPAci2mk6BL (27 ekran × 390×844 / 375×667, ölçümlü).
Kullanıcı kod verecek (ör. "S1 · S2 · G2"). Özet:
- S1 KRİTİK: Duraklat'ta "Oyunu Bitir" ONAYSIZ kaydı siliyor (`doQuit` → clearSave, touchend'de de) ve
  "Devam Et"in hemen üstünde. S2: oyun içinden ses/müzik kapatılamıyor (Duraklat'ta Ayarlar yok).
- S3: ana menü iPhone SE'de 195 px taşıyor (Market/Hediye/Ayarlar/Tam Sürüm görünmüyor), `#intro-footer`
  (absolute bottom) düğmelerin üstüne biniyor. S4: ☰ 36×36, büyüteç 36×36, Tahkik 46×36, ferman çipi 25 px —
  görünmez dokunma alanı 44'e. S5: Nasıl Oynanır eksik (ferman/Tahkik/Arz/eşya yok), klavye satırı, düğme görünmüyor.
  S6: müzakere kartı eşya kutularını ekrandan itiyor. S7: SE'de ilk Arz açıklaması yıl+☰'yi örtüyor.
  S8: sultan seçiminde sabit düğmeler son kartı örtüyor.
- G1 ana menü (OYNA + mod seçici + 2×2 ilerleme + alt şerit), G2 Duraklat (devam üstte, ses, korumalı çıkış),
  G3 Market sekmeleri (Akçe/Eşyalar/Kozmetik, üstte ✕, "+ AL"). D1–D8 küçük dokunuşlar.
- Önerilen sıra: 1.7.1 küçük (S1 S2 S4 S7 D2 D3) → 1.7.1 orta (S3 S6 S8 D4 D5 D6) → 1.8 (G1 G2 G3 S5 D1 D7 D8;
  önce web demo). Mekanik/kural/fiyat/reklam DEĞİŞMEZ; #game ve kart kaydırma CSS'ine dokunma.
- Ekran görüntüsü betiği: scratchpad `ux_shots.js` (yeniden yazılabilir; ölçüm `measure.json`).

**Yayından sonra bakılacaklar:**
1. AdMob: gösterim / istek oranı yükselmeli (eskiden 39/311 ≈ %12,5). Reklam birimine göre böl.
2. TelemetryDeck: `ad_impression` (gerçek gösterim) ile AdMob gösterimini karşılaştır; `investigate_ad` kaç kez.
3. Gerçek cihazda: ölüm → geçiş reklamı → ölüm ekranı; Tam Sürüm'de reklam yok; Tahkik reklamı.
4. Oyun sonu reklamı oyuncuyu kaçırıyor mu (oturum başına oyun sayısı, ertesi gün dönüş) — gerekirse sıklığı düşür.

### 6 Ekim 2026 (akşam) — Reklam analizi ve düzenlemesi (commit ef3b991, d1765a1)

**Analiz (AdMob ekranı: 311 istek, 39 gösterim, eşleşme %100, ₺47,44):**
- Boş reklam DÖNMÜYOR (eşleşme %100). Kodda gösterimi yutan bir hata yok.
- Fark "hep hazır tutma"dan: her açılışta 1 ödüllü + 1 geçiş reklamı yükleniyordu; geçiş reklamı yalnız her
  3. "Oyuna Başla"da, ödüllü reklam yalnız isteğe bağlı gösterildiği için yüklenenlerin çoğu kullanılmadan
  uygulama kapanıyordu (gösterilme oranı ≈ %12,5).
- Tam Sürüm sahibi geçiş reklamı zaten görmüyordu (5 Ekim'den beri) ama reklam ona da yükleniyordu (boşa istek).
- Yüklenen reklam ~1 saat sonra geçersiz oluyor; kod bunu bilmediği için uzun oturumda gösterim kaybı olabiliyordu.
- `ad_shown` olayı reklam açılmadan (deneme anında) gönderildiği için gerçek gösterim sayısı ölçülemiyordu.

**Eklenenler / değişenler:**
- **Geçiş reklamı HER oyun bitişinde** (kullanıcı isteği; eskiden her 3 oyunda bir, oyun başında):
  ölüm sahnesi → reklam → ölüm ekranı (`_gameOverInterstitial`). Oyun başında artık reklam yok.
  Reklam hazır değilse/açılmazsa ölüm ekranı hemen gelir — oyun reklama asla bağlı kalmaz.
- **Tam Sürüm / Reklamsız sahibine reklam hiç istenmiyor** (yalnız gösterilmemesi değil).
- **Bayat reklam yenileme**: 55 dk'yı geçen reklam atılıp yenisi yükleniyor (uygulamaya dönüşte, dakikada
  bir ve göstermeden önce) — iki reklam türünde de.
- **Ölçüm**: yeni `ad_impression` olayı (reklam gerçekten ekrana çıkınca); `ad_shown` deneme sayısı olarak kaldı.
- **Yeni ödüllü reklam — Tahkik**: yılın 3 hakkı bitince yılda 1 kez "Reklam İzle · +1". İzlenirse hak o kartta
  hemen kullanılır, Sultan'ın sabrı yine düşer. Akçeyle satılan bir şeyin yerine geçmez. Kayıtta (`cag.tka`).
  Olay `investigate_ad`. Ödüllü reklam yerleri artık 5: İkinci Şans, günlük hediye, Kâtibin Notu/Müneccim,
  Kritik An (Şifa Otu), Tahkik.

**Bulunan ve düzeltilen sorunlar:**
- Tam Sürüm sahibine açılışta yine de geçiş reklamı isteniyordu (yukarıda).
- Bu düzeltmenin ilk halinde yarış durumu: reklam modülü game.js yüklenmeden sahipliği soruyordu → kayıtlı
  Tam Sürüm sahibinde bile 1 istek gidiyordu. Sahiplik artık doğrudan kayıttan da okunuyor (sahte iPhone testi buldu).
- Tahkik teklifi açıkken kart değişirse izlenen reklamın ödülü kaybolabilirdi → ödül yine verilir, sonraki karta
  "+1 TAHKİK" bildirimi; eski karttaki teklif penceresi yeni kartta kapanır.
- Bayat (1 saati geçen) reklamın açılmaması / gösterimin sayılmaması (yukarıda).

**Bilinen küçük durum:** temiz kurulumda Tam Sürüm sahibine açılışta en fazla 1 istek gidebilir (sahiplik
RevenueCat'ten reklam isteğinden sonra geliyor); sonraki açılışlarda yok.

**Testler (hepsi geçti):** `ad_test.js` 24 (Chrome+WebKit × TR/EN), `native_ads_test.js` 164 (sahte iPhone: AdMob
olay sıraları, gösterilemedi/yüklenemedi/uzun reklam, İkinci Şans/günlük hediye/Kâtip/Kritik An, oyun sonu reklamı,
Tahkik reklamı), ölüm sahnesi testi, `long_test.js` (ses açık/kapalı ilk kart + uzun oyun). Gerçek AdMob cihazda denenmedi.

## (ESKİ) 1.7.0 (build 41) — 6 Ekim'de incelemeye gönderilmişti, build 42 için gönderim iptal edildi

**Durum:** 1.7.0 / build 41 yüklendi (Delivery UUID `f9bed195-688d-4f4b-ba07-177ee8f26d3f`, işlendi: VALID).
ASC'de geri çekilmiş 1.6.0 sürüm kaydı **1.7.0** yapıldı ve build 41 bağlandı (17 dil yerelleştirmesi duruyor).
**İncelemeye gönderim kullanıcıda** (6 Ekim son kontrol: PREPARE_FOR_SUBMISSION, açık gönderim yok, oyunun
kullandığı tüm IAP'lar APPROVED). Gönderirken `fullnoads` ve `akce30start` SEÇİLMEMELİ (ikisi de kullanılmıyor).
GitHub'a push YAPILMADI (onay bekliyor).

**6 Ekim sonrası ASC durumu (kullanıcı yaptı / doğrulandı):**
- App Privacy: Usage Data → Product Interaction ZATEN ekli (amaç Analytics, not linked, not tracking olmalı).
- "What's New": 1.6 metni bırakıldı — 1.6 hiç yayınlanmadığı için 1.7'yi de kapsıyor (kullanıcı kararı).
- **Birincil dil tr → en-US yapıldı** (kullanıcı). Sebep: ekran görüntüleri yalnız tr / en-US / ar-SA'da (5 iPhone 6.7"
  + 5 iPad 12.9"); diğer 14 dil birincil dilin görsellerini gösterir — artık İngilizce. Yeni dile görsel
  eklenirse o dil kendi görselini kullanır.
- ASC'nin yeni arayüzünde görseller ilk bakışta görünmeyebilir; API'de hepsi COMPLETE.
- **Gizlilik politikası URL'si** de-DE ve ja'da eksikti (inceleme engeli) → API ile eklendi; 17 dilin hepsi
  `https://sadrazam-web.vercel.app/privacy.html`.
- **Canlı privacy.html eskiydi** ("No first-party analytics") → Vercel'e deploy edildi (6 Ekim, kullanıcı onaylı);
  canlıda "Anonymous Usage Analytics" + TelemetryDeck, Last updated: October 2026. Aynı deploy web/test
  sürümünü de 1.7 koduna güncelledi (web'den gelen ölçüm olayları isTestMode=true).

**Açık kalanlar:**
1. (İsteğe bağlı) Tam Sürüm / Hoşgeldin IAP açıklamasına "reklamsız / ad-free" — ASC arayüzünden elle (API 409).
2. TelemetryDeck panosunda appVersion **1.6.0** olan olayları ele (5 Ekim test turundan sahte veri).
3. GitHub push onayı.

### 5–6 Ekim 2026'da tek oturumda yapılanlar (ayrıntı: CLAUDE.md §3h, §3h-2, §3h-3)

**Analiz** — Oyun 66/100 puanlandı; Çağ Planı raporu: https://claude.ai/artifact/5T1k9DvNNHeZnuvTXNg6Z5
(5 zaaf: çekirdek özgünlük, karar gerilimi, hikâye/hedef, gelir modeli, ölçüm).

**1. Çekirdek mekanik** (decide() akışına dokunmadan)
- **Tahkik**: kartın sağ üstünde, yılda 3 hak (+1 Casuslar Başı Müttefik), sabır −2; iki seçeneğin etki
  yönünü gösterir (sürükleyince). Büyüteç/gizli hain sistemi aynen duruyor.
- **Arz**: 38 büyük karar (`"arz": true`); Sultan sabra göre kabul/ret (%85/%65/%45); ret → öbür taraf
  uygulanır, 8–15 kart sonra "haklı çıktın/Sultan haklıydı" kartı. Reddedilen karar hafızaya yazılmaz.
- **Lanet kaldırıldı → Kayırma Dengesi**: son 4 kararın 3'ünde aynı zümre kayrılırsa öteki üçü −6.
  Benzetimle eski zorluğa kalibre (rastgele oyun medyanı 38 → 40 kart). Başarım kimlikleri aynı.

**2. Karar gerilimi**
- 218 seçenek yeniden yazıldı; gerçek ikilem 451 → **606/662**. 22 ödül kartı `"denge_muaf"`.
- `tools/denge.py` her build öncesi zorunlu (CLAUDE.md §2 adım 0); 0 hata.
- Not: ilk raporda "198 bedelsiz" yazdı, doğrusu 134 (+54 baskın, 3 etkisiz).

**3. Asırlar (oyunun temel hedefi) + Pargalı yan görevi**
- 5 tarih düğümü: Mısır 1517 (Yavuz, 2. yıl, ücretsiz), Viyana 1529, Beylerbeyi 1589, Bağdat 1638,
  Patrona Halil 1730 (4. yıl). Hazırlık şartları + 2 karar → kalıcı sonuç, sonraki dönemlere miras,
  5/5'te "Senin Osmanlın". Menüde DEVLETİN KADERİ, sultan kartlarında düğüm rozeti, Yıl Sonu'nda satır.
- Pargalı: ilk sayfa herkese 18. kartta, mektupta ipuçları ve YAN GÖREV başlığı.

**4. Ürünler**
- Tam Sürüm artık reklamsızı içeriyor (ödeme ekranında 4. madde). Reklamsız ürünü Market'te GİZLİ
  (kod ve ASC ürünü duruyor). `fullnoads` paketi: inceleme iptal edildi, ASC'de "KULLANILMIYOR" adıyla
  READY_TO_SUBMIT (silinemiyor), oyunda hiç görünmüyor. **Fiyatlar değişmeyecek** (kullanıcı kararı;
  analiz: Apple eşleştirmesi $2,99 = ₺149,99, Tam Sürüm ₺29,99 → net ₺16,62).
- Ücretsiz oyuncuya her 3 oyunda bir geçiş reklamı sürüyor; Tam Sürüm / Reklamsız sahibine yok. (6 Ekim akşam: artık HER oyun bitişinde, bkz. en üst)

**5. Ölçüm (TelemetryDeck)**
- `analytics.js`, App ID `F3B8B209-FB1A-4FAB-B53D-5FB4DE179E3D`, namespace `com.sadrazam`. 15 olay (oyun,
  kart %15 örnek, yıl sonu, ölüm, ödeme ekranı, satın alma, reklam, Tahkik, Arz, kayırma, Asırlar…).
  Pano: dashboard.telemetrydeck.com. Yerel test adresinde kapalı (http://localhost), iOS'ta açık.
- privacy.html'e "Anonymous Usage Analytics" bölümü.

**Dünya yayını QA (6 Ekim) — bulunan ve düzeltilen hatalar**
- Dil: Türkçe olmayan her telefonda EN (kullanıcı kuralı), eski oyuncu TR kalır. Info.plist en/tr.
- ATT izin metni İngilizce varsayılan + tr.lproj Türkçe (önceden herkese Türkçeydi).
- EN'de Türkçe kalanlar: Sultan mektupları (1.5.0'dan beri), sürpriz kartlar, 4 ölüm metni + başlık,
  eşya bildirimleri, YENİ EŞYA, kayıtlı oyun bandı, seçim uyarıları, paylaşım bağlantısı (EN: bölgesiz).
- Küçük ekran kilidi: Divan Halkası kapatılamıyordu (SE/8). Market üstü, Ayarlar Kapat, sultan/başarımlar
  ekranı başı, ana menü tuğrası kesiliyordu → güvenli ortalama (style.css sonu).
- 1.5.0'dan beri değişmeyenler: rewardedads.js / interstitialads.js (yalnız ölçüm satırı), günlük hediye,
  Game Center, haptics, sounds, RevenueCat paketi, Swift dosyaları.

**Test (scratchpad t/ — oturum sonrası silinir; betikler CLAUDE.md §3h-3'te tarif edildi)**
- 26 eski grup + cag + asir: hepsi geçti (5 grup yeni kurallara göre güncellendi).
- native_ads (129 kontrol: 8 reklam senaryosu × 4 kullanım noktası + geçiş reklamı), native_iap (her ürün,
  iptal/hata, geri yükleme, promosyon, yeniden kurulum, ürün yok, ücretsiz sınır): hepsi geçti.
- overlay_fit: 40 pencere × 320/375/390 × WebKit/Chromium: her düğmeye ulaşılıyor.
- fuzz (rastgele gerçek oyun): ~9.000 adım, 8. yıla kadar; hata/takılma/değer bozulması/404 yok.
- Simülatör: sistem dili Almanca → EN, Türkçe → TR doğrulandı.

**Sıradaki fikirler (onay yok):** Asırlar'a yeni dönemler (III. Selim 1807, II. Mahmud 1826, Tanzimat),
4 dönem sonrası yeni sultanlar; ölçüm verisi geldikçe fiyat/ücretsiz sınır kararları; 52 "kör" kart
yerine denetçi çıktısına göre dönemsel denge turu.

## SIRADAKİ — 1.7 main'de, BUILD ALINMADI (5 Ekim 2026, 2. tur) (önceki)

Rapor: https://claude.ai/artifact/5T1k9DvNNHeZnuvTXNg6Z5. Ayrıntı CLAUDE.md §3h ve §3h-2.
- YAPILDI: Tahkik + Arz, kart dengesi + `tools/denge.py`, Kayırma Dengesi, Tam Sürüm = reklamsız,
  Reklamsız Market'te GİZLİ, ölçüm CANLI (TelemetryDeck, namespace com.sadrazam; test sinyali 200),
  privacy.html'e ölçüm bölümü, Pargalı yan görevi, **Asırlar** (5 tarih düğümü, Devletin Kaderi).
- ASC: `fullnoads` incelemeden çekildi (READY_TO_SUBMIT, adı "KULLANILMIYOR"); Apple silmeye izin
  vermiyor (409). 1.6.0 sürümü ASC'de DEVELOPER_REJECTED (kullanıcı geri çekmiş) — 1.7 ile gidilecek.
- KULLANICIDAN BEKLENEN: fiyat kararı (önerim Tam Sürüm ₺59,99, Hoşgeldin ₺69,99; ASC'den ben
  değiştirebilirim), 1.7.0 build + inceleme onayı, ASC gizlilik etiketine "Kullanım Verisi · Ürün
  Etkileşimi · bağlantısız · izleme yok", Tam Sürüm IAP açıklamasına "reklamsız". GitHub push onayı.
- Build öncesi: MARKETING_VERSION 1.7.0, intro-footer v1.7.0, `python3 tools/denge.py` 0 hata.

## SIRADAKİ — v1.6.0 / build 40 YÜKLENDİ (4 Ekim 2026) (önceki)

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
