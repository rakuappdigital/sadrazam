# Sadrazam — TODO

## SIRADAKİ SESSION — kullanıcının istediği 5 geliştirme (27 Eylül 2026)

Kullanıcının kuralı: yaratıcı ol, en uygun ve hatasız eklenebilecek örnekleri
seç; her eklemeyi TEST EDEREK, ADIM ADIM git (bu session'daki gibi: dal →
adım → Puppeteer gerçek akış testi → commit → yüzde ile ilerleme raporu).
"İplik" oyunda görünmeyen bir KAVRAM (kod: gecikmeli sonuç / knot) — oyunda
bu kelime geçmez. Mimari: CLAUDE.md §3b.

1. **Tek butonlu kartları iki seçenekli yap.** Önce tek butonla geçilen
   kartların listesini çıkar (Padişah ziyareti, saraya giren kedi vb. — ipucu:
   `type: "easter"` kartlar, `easter-action-btn`, `showEasterCard`,
   `showPadisahZiyareti`, `advanceEasterCard`, chance kartları). Sonra HER
   kart için kullanıcıyla konuş: iki seçeneğin metinleri, işleyiş mekaniği
   önerisi, hem anlık stat etkisi hem gecikmeli sonuç (oyunun genel gidişatı)
   etkisi. Liste onaylanmadan kod yazma.
2. **Görsel iyileştirme fikirleri öner.** Kullanıcı beğendiklerini seçecek,
   sonra web üzerinden (Artifact demo, oyuna uygulamadan) gösterilecek.
3. **Reklam izlemeyi ve akçe satışını artıracak çok pratik öneriler.** Akıllıca
   ve sürükleyici olmalı. (Mevcut: İkinci Şans 5/gün reklam veya 1 akçe, Eşya
   Dükkanı 1 akçe, geçiş reklamı her 2. oyun başı, Reklamsız IAP, akçe paketleri
   10/20/50/100. Önceki öneriler: memory project_sadrazam_kader_tezgahi.)
4. **Yeni karakterler ve olaylar öner.** Oyunu zengin gösterecek, oyuna etki
   edecek. Karakterler oyunda belli yerlerde, gecikmeli sonuçların yarattığı
   belli sonuçlarda ortaya çıkacak. Sonra görsel PROMPTLARIYLA birlikte yaz
   (kullanıcı görselleri üretecek), ardından oyuna eklenecek.
5. **Rakip oyun analizi.** Benzer oyunlardan (Reigns serisi vb.) eksik
   kaldığımız yerleri tespit et, iyileştirme öner; bize özgü güçlü yönleri de
   geliştir/ekle.

## SIRADAKİ (sonraki session buradan başlar)

**v1.4.1 / build 25** — 26 Eylül 2026'da ASC'ye yüklendi (Delivery UUID
`04631759-f487-44c9-8d66-b9e83f247f74`, durum VALID). Kullanıcı 1.4.1 sürüm
sayfasında build 25'i seçip review'a gönderiyor.

- [ ] Review sonucu: onaylandı mı / reddedildi mi? (Reddedildiyse gerekçeyi oku,
      ASC API ile `appStoreVersions` durumunu kontrol et.)
- [ ] Yayına çıkınca gerçek cihazda: İkinci Şans → Reklam İzle → reklamı sonuna
      kadar izle → X → ödül verildi mi, sayaç 5/5 → 4/5 düştü mü?
- [ ] Geçiş reklamı: her 2. "OYUNA BAŞLA"da gerçek reklam geliyor mu, kapanınca
      oyun başlıyor mu?
- [ ] Yayından 1 gün sonra AdMob panelinde: ödüllü + geçiş reklam birimlerinde
      gösterim (impression) ve gelir artıyor mu?
- [ ] 1.4.0 build 24'ten gelen Market + Reklamsız (noads) özellikleri de bu
      sürümde — hiç TestFlight doğrulaması yapılmadı: Market açılıyor mu,
      Reklamsız fiyatı (₺59,99) geliyor mu, satın alınca geçiş reklamı kesiliyor
      mu, "Geri Yükle" çalışıyor mu. `noads` IAP'ı sürüme eklendi mi kontrol et.

## Düğüm / gecikmeli sonuç sistemi — main'e birleştirildi (27 Eylül 2026), BUILD ALINMADI

Kullanıcı: "main'e birleştir ama build alma". Sonraki App Store build'inde
(1.4.1 incelemesi sonuçlandıktan sonra) bu değişiklikler de gidecek; build
öncesi simülatörde kısa bir oyun + birleşik kart + soruşturma kontrolü yap.
Ayrıntı: CLAUDE.md §3b.

Bu işte ayrıca düzeltilenler: 7 ölü zincir kuralı, sonuç kartı çift/tekrar
gelmesi, gizli hain (1/3 oyunda bozuk anahtar + soruşturma düğmesi yoktu →
ipucu sistemiyle geri geldi, tekrar-tıklama hilesi kapandı, İngilizce açıklama),
'Hiç borçlanma' başarımı, küçük ekranlarda (375x667 / 320x568) stat ve eşya
çubuklarının ekran dışında kalması, Şeyhülislam görseli (kökte büyük harf +
uygulamada sıkıştırılmamış kopya).

Açık kalan: Venedik Balyosu portresinin çerçevesi/stili diğerlerinden farklı
(yeni görsel gerekir — kullanıcı üretirse değiştir).

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
