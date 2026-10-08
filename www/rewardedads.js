// rewardedads.js — Google AdMob ödüllü reklam entegrasyonu (native, iOS)
// Paket: @capacitor-community/admob@8.1.0 (Capacitor 8 ile uyumlu)
//
// GÜVENLİK KİLİDİ: gerçek App ID / Ad Unit ID girilmeden native AdMob SDK'sı
// hiç başlatılmaz — yoksa geçersiz App ID ile GADMobileAds.start() çağrısı
// gerçek cihazda çökmeye yol açabilir. ID'ler doldurulunca bu otomatik true olur.
// (Bkz. ios/App/App/Info.plist — GADApplicationIdentifier de doldurulmalı.)

const RewardedAds = (() => {
  const REWARDED_AD_UNIT_ID = "ca-app-pub-7882143822556333/2394900440"; // AdMob > Ad units > Rewarded
  const ADMOB_ENABLED = REWARDED_AD_UNIT_ID !== "REWARDED_AD_UNIT_ID_BURAYA";

  let _cap = null;
  if (ADMOB_ENABLED && window.Capacitor?.isNativePlatform?.()) {
    try { _cap = window.Capacitor.Plugins.AdMob; } catch (e) {}
  }

  let _ready = false;     // initialize() + ATT tamamlandı, native çağrı yapılabilir
  let _adLoaded = false;  // gerçek bir reklam yüklendi ve gösterilmeyi bekliyor
  let _loading = false;   // prepareRewardVideoAd() hâlâ devam ediyor
  let _loadedAt = 0;      // reklamın yüklendiği an (bayatlık kontrolü)

  // Google yüklenen reklamı ~1 saat sonra geçersiz sayar; bayat reklam
  // açılmayabilir ya da gösterim sayılmaz. 55 dakikayı geçen reklam atılıp
  // yenisi istenir (uygulamaya dönüşte, dakikada bir ve göstermeden önce).
  const STALE_MS = 55 * 60 * 1000;
  const _dropIfStale = () => {
    if (_adLoaded && Date.now() - _loadedAt > STALE_MS) { _adLoaded = false; prepare(); }
  };

  // App Store reddi (30 Eylül 2026, 1.5.0 build 28, iOS/iPadOS 27): ATT
  // penceresi incelemede hiç görünmedi. OLASI NEDEN (iOS 27'de doğrulanamadı):
  // izin, script yüklenir yüklenmez (uygulama henüz "active" olmadan, açılış
  // ekranı sürerken) isteniyordu — iOS bu durumda pencere göstermeden sessizce
  // "notDetermined" döner. Ayrıca AdMob SDK'sı izinden ÖNCE başlatılıyordu.
  // Şimdi: uygulama görünür + açılış ekranı bittikten sonra sorulur; hâlâ
  // "notDetermined" ise (istek yutulduysa) birkaç kez daha denenir. Hiç
  // cevap alınamazsa AdMob yine başlar ama IDFA'sız (izin yok = takip yok).
  const ATT_DELAY_MS = 2500;   // AppDelegate'teki 2 sn'lik Raku açılış ekranı + pay
  const ATT_MAX_TRIES = 4;

  const _attStatus = () =>
    _cap.trackingAuthorizationStatus().then((r) => r?.status).catch(() => null);

  const _whenVisible = (delay) => new Promise((resolve) => {
    const go = () => setTimeout(resolve, delay);
    if (document.visibilityState === "visible") return go();
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", onVis);
      go();
    };
    document.addEventListener("visibilitychange", onVis);
  });

  const _requestATT = async () => {
    for (let i = 0; i < ATT_MAX_TRIES; i++) {
      if ((await _attStatus()) !== "notDetermined") return;
      await _whenVisible(ATT_DELAY_MS);
      await _cap.requestTrackingAuthorization().catch(() => {});
    }
  };

  const init = () => {
    if (!_cap) return; // ID'ler girilmeden veya web/tarayıcıda hiç başlatılmaz

    // Reklam gerçekten yüklenmeden _adLoaded true olmasın — eskiden bu bayrak
    // initialize() biter bitmez true oluyordu (reklam daha yüklenmeden), bu da
    // henüz hazır olmayan bir reklamı göstermeye çalışıp native tarafta
    // sessizce reddedilmesine yol açabiliyordu.
    _cap.addListener("onRewardedVideoAdLoaded", () => { _adLoaded = true; _loading = false; _loadedAt = Date.now(); });
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") _dropIfStale(); });
    setInterval(_dropIfStale, 60000);
    // Yükleme başarısız olursa (ağ/doldurma sorunu) eskiden bir daha ASLA
    // yeniden denenmiyordu — kullanıcı bir daha o oturumda hiç reklam
    // göremiyor, dolayısıyla ne ödül ne de reklam geliri oluyordu. Şimdi
    // otomatik olarak yeniden dener.
    _cap.addListener("onRewardedVideoAdFailedToLoad", () => {
      _adLoaded = false; _loading = false;
      setTimeout(prepare, 30000);
    });

    // ATT izni AdMob başlatılmadan ÖNCE sorulur; reklam istekleri ATT
    // cevabından sonra yapılır. interstitialads.js de aynı promise'i bekler
    // (bkz. window.__admobReady).
    window.__admobReady = _requestATT()
      .then(() => _cap.initialize());
    window.__admobReady
      .then(() => { _ready = true; prepare(); })
      .catch((e) => console.warn('AdMob init hatası:', e));
  };

  const prepare = () => {
    if (!_cap || !_ready || _loading || _adLoaded) return;
    _loading = true;
    _cap.prepareRewardVideoAd({ adId: REWARDED_AD_UNIT_ID }).catch((e) => {
      _loading = false;
      console.warn('Reklam hazırlanamadı:', e);
    });
  };

  // onReward: reklam izlendi → ödülü ver.  onCancel: reklam hiç gösterilemedi.
  // onShow (opsiyonel): reklam gerçekten tam ekrana çıktı.
  //
  // KÖK NEDEN (26 Eylül 2026, simülatörde Google test reklamıyla loglanarak
  // KANITLANDI): eskiden game.js reklam açıldıktan 45 sn sonra "takıldı" deyip
  // teklif ekranını yeniden açıyor ve akışı kapatıyordu. WebView'daki JS
  // zamanlayıcıları reklam ekrandayken de ÇALIŞIYOR; gerçek (yayındaki) ödüllü
  // reklamlar video + tanıtım kartı + "Ödül verildi" ekranıyla 45 sn'yi rahatça
  // aşıyor. Sonuç: reklam izleniyor, native ödül event'i geliyor (eskiden boş
  // bir fonksiyonla yok sayılıyordu), ama kapatınca gelen "dismissed" event'i
  // "zaten bitti" diye atılıyordu → ödül yok, sayaç 5/5. TestFlight'ta kısa
  // test reklamları geldiği için görünmüyordu.
  //
  // KURAL: reklam ekrana çıktıktan sonra HİÇBİR zamanlayıcı akışı bitiremez.
  // Akış yalnızca native event'lerle biter:
  //   - onRewardedVideoAdReward / showRewardVideoAd() resolve → ödül kazanıldı
  //   - onRewardedVideoAdDismissed → reklam kapandı → ödül verilir
  //   - onRewardedVideoAdFailedToShow → gösterilemedi → iptal
  // Tek yedek: reklam kapanıp uygulama tekrar görünür olduğu hâlde 2 sn içinde
  // dismissed event'i gelmezse (event kaybı) yine ödül verilir — bu, reklamın
  // süresine değil, reklamın gerçekten kapanmasına bağlıdır.
  const LOAD_WAIT_MS = 10000;   // reklam henüz yüklenmediyse en fazla bu kadar bekle
  const LAUNCH_TIMEOUT_MS = 10000; // show çağrısından sonra reklam hiç açılmazsa

  const _waitForLoad = () => new Promise((resolve) => {
    if (_adLoaded) return resolve(true);
    prepare();
    const start = Date.now();
    const iv = setInterval(() => {
      if (_adLoaded) { clearInterval(iv); resolve(true); return; }
      if (Date.now() - start > LOAD_WAIT_MS) { clearInterval(iv); resolve(false); return; }
      prepare(); // yükleme düştüyse (30 sn'lik otomatik denemeyi beklemeden) hemen tekrar dene
    }, 300);
  });

  const _overlay = (text, withSpinner) => {
    const el = document.createElement("div");
    el.id = "simulated-ad-overlay";
    el.innerHTML = `<div id="simulated-ad-box">
        ${withSpinner ? '<div id="simulated-ad-spinner"></div>' : ""}
        <div id="simulated-ad-label">${text}</div>
      </div>`;
    document.body.appendChild(el);
    return el;
  };

  // onEarned (opsiyonel, 8 Ekim 2026): native "ödül kazanıldı" olayı geldiği AN bir kez çağrılır —
  // reklam henüz ekrandayken. Ödülü kalıcı yazmak için: reklam sırasında iOS web içeriğini
  // bellekten atıp yeniden yüklerse (Capacitor otomatik reload) kapanıştaki onReward hiç çalışmaz.
  const show = async (onReward, onCancel, onShow, onEarned) => {
    let _earnedFired = false;
    const _earn = () => { if (_earnedFired) return; _earnedFired = true; try { if (onEarned) onEarned(); } catch (e) {} };
    try { window.Analytics?.track('ad_shown', { kind: 'rewarded' }); } catch (e) {} // ölçüm; reklam akışını etkilemez
    if (!_cap) { // web/tarayıcı geliştirme ortamı — native AdMob yok
      _showSimulatedAd(() => { _earn(); onReward(); }, onCancel);
      return;
    }
    const isEN = window.LANG === 'en';
    _dropIfStale(); // bayatsa aşağıdaki "Reklam yükleniyor…" yolu tazesini bekler

    // Canlıda ASLA sahte reklam gösterilmez (eskiden reklam yüklenmemişse
    // "SİMÜLE REKLAM" gösterilip bedava ödül veriliyordu → AdMob'a gösterim
    // gitmiyordu). Gerçek reklam yüklenene kadar kısa bir süre bekle.
    if (!_ready || !_adLoaded) {
      const loadingEl = _overlay(isEN ? "Loading ad…" : "Reklam yükleniyor…", true);
      const ok = await _waitForLoad();
      loadingEl.remove();
      if (!ok) {
        const msg = _overlay(isEN ? "No ad available right now. Please try again shortly."
                                  : "Şu an reklam bulunamadı. Lütfen biraz sonra tekrar deneyin.", false);
        setTimeout(() => { msg.remove(); onCancel(); }, 2200);
        return;
      }
    }

    _adLoaded = false; // bu reklam artık tüketiliyor
    let done = false, shown = false, earned = false;
    let launchTimer = null, visTimer = null;
    const handles = [];

    const onVis = () => {
      if (done || !shown || document.visibilityState !== "visible") return;
      clearTimeout(visTimer);
      visTimer = setTimeout(() => finish(true), 2000);
    };
    const finish = (rewarded) => {
      if (done) return; done = true;
      clearTimeout(launchTimer); clearTimeout(visTimer);
      document.removeEventListener("visibilitychange", onVis);
      handles.forEach((h) => { try { h?.remove(); } catch (e) {} });
      prepare(); // sıradaki gösterim için yeniden hazırla
      if (rewarded) { _earn(); onReward(); } else onCancel();
    };

    handles.push(...await Promise.all([
      _cap.addListener("onRewardedVideoAdShowed", () => {
        shown = true; clearTimeout(launchTimer);
        try { window.Analytics?.track('ad_impression', { kind: 'rewarded' }); } catch (e) {} // gerçekten ekrana çıktı
        if (onShow) onShow();
      }),
      _cap.addListener("onRewardedVideoAdReward", () => { earned = true; _earn(); }),
      _cap.addListener("onRewardedVideoAdDismissed", () => finish(true)),
      _cap.addListener("onRewardedVideoAdFailedToShow", () => { if (!earned) finish(false); else finish(true); }),
    ]));
    document.addEventListener("visibilitychange", onVis);

    // Reklam hiç açılmazsa (native çağrı sessizce düşerse) arayüz kilitli
    // kalmasın. Uygulama görünür değilse reklam ekrandadır → asla iptal etme.
    launchTimer = setTimeout(() => {
      if (!shown && document.visibilityState === "visible") finish(false);
    }, LAUNCH_TIMEOUT_MS);

    // Native taraf bu promise'i kullanıcı ödülü kazandığında resolve eder;
    // reject yalnızca reklam hiç sunulamadığında olur.
    _cap.showRewardVideoAd()
      .then(() => { earned = true; _earn(); })
      .catch(() => { if (!shown) finish(false); });
  };

  // ── Simülasyon modu (ID'ler girilene / gerçek cihazda test edilene kadar) ──
  const _showSimulatedAd = (onReward, onCancel) => {
    const isEN = window.LANG === 'en';
    const overlay = document.createElement("div");
    overlay.id = "simulated-ad-overlay";
    overlay.innerHTML = `
      <div id="simulated-ad-box">
        <div id="simulated-ad-label">${isEN ? "SIMULATED AD (test mode)" : "SİMÜLE REKLAM (test modu)"}</div>
        <div id="simulated-ad-spinner"></div>
        <div id="simulated-ad-countdown">5</div>
      </div>`;
    document.body.appendChild(overlay);
    let n = 5;
    const countdownEl = overlay.querySelector("#simulated-ad-countdown");
    const timer = setInterval(() => {
      n--;
      if (countdownEl) countdownEl.textContent = String(Math.max(n, 0));
      if (n <= 0) {
        clearInterval(timer);
        overlay.remove();
        onReward();
      }
    }, 500);
  };

  return { init, show };
})();

RewardedAds.init();
