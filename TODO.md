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

## Düğüm / gecikmeli sonuç sistemi — dalda HAZIR, main'e birleştirilmedi

Dal: `ozellik/dugum` (push edilmedi). Kullanıcı onayı bekleniyor: main'e
birleştir → 2 kopya senkron → cap sync → simülatör smoke test → (istenirse) build.
Ayrıntı: CLAUDE.md §3b. 99/99 regresyon testi geçti (26 Eylül 2026).

Bu dalda ayrıca düzeltilen mevcut hatalar: 7 ölü zincir kuralı, sonuç kartı
çift/tekrar gelmesi, gizli hain oyunların 1/3'ünde bozuk, Şeyhülislam görsel
dosya adı (iPhone'da boş portre riski), 'Hiç borçlanma' başarımı.

Açık kalan (bu işten bağımsız, kullanıcıya bildirildi):
- 375x667 (iPhone SE/8) ekranda stat çubukları ekran dışında (canlıda da var)
- Gizli hain adaylarının 11/18'inin soruşturulabilir kartı yok (içerik eksiği)
- Venedik Balyosu portresi farklı çerçeve/stil (birleşik kartta uyumsuz)

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
