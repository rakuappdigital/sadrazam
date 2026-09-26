# Sadrazam — TODO

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

## Tespit edilen hata (26 Eylül 2026, henüz düzeltilmedi)

- **`game.js` `CHAIN_RULES` içindeki 7 gecikmeli sonucun HİÇBİRİ oyunda
  tetiklenmiyor**: kuralların beklediği bayrakları (`yeni_kışla_reddedildi`,
  `venedik_1_sinirlendi`, `defterdar_borc_alındı`, `casuslar_op_baslatildi`,
  `veba_gormezden_gelindi_2`, `sehzade_affedildi`, `kaptan_filo_izni`)
  `data/cards.json`'daki hiçbir kart set etmiyor (isimler uyuşmuyor; ör.
  kartlarda `kışla_reddedildi` var). Ayrıca `venedik_geri_dondu` kartı hiç yok.
  Düzeltme: bayrak adlarını kartlardakiyle eşleştir + eksik kartı yaz.

## Düğüm mekaniği (kullanıcı demo gördü, içerik planı konuşuldu, henüz kodlanmadı)

Demo: https://claude.ai/artifact/NpiW7iiJccUHkoeTeJEVzw — yerel dal
`onizleme/hatirlatma-satiri` (hatırlatma satırı denemesi, push edilmedi).

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
