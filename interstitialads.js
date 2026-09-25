// interstitialads.js — Google AdMob geçiş (interstitial) reklamı entegrasyonu (native, iOS)
// Paket: @capacitor-community/admob@8.1.0
//
// GÜVENLİK KİLİDİ: gerçek Ad Unit ID girilmeden native AdMob SDK'sı hiç
// çağrılmaz — rewardedads.js'teki aynı desen (bkz. o dosyadaki yorum).
//
// Ne zaman gösterilir: "Oyuna Başla" butonuna (confirmAdvisor(), game.js)
// basıldığında, TEK YERDE sayılan bir sayaçla HER 2. seferde bir. Reklam
// başarısız olsa/hiç yüklenemese bile oyun ASLA bloklanmaz — show() her
// koşulda onDone() çağırır.

const InterstitialAds = (() => {
  const INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-7882143822556333/7014017328"; // AdMob > Ad units > Interstitial
  const ADMOB_ENABLED = INTERSTITIAL_AD_UNIT_ID !== "INTERSTITIAL_AD_UNIT_ID_BURAYA";

  let _cap = null;
  if (ADMOB_ENABLED && window.Capacitor?.isNativePlatform?.()) {
    try { _cap = window.Capacitor.Plugins.AdMob; } catch (e) {}
  }

  let _ready = false;     // initialize() tamamlandı, native çağrı yapılabilir
  let _adLoaded = false;  // gerçek bir reklam yüklendi ve gösterilmeyi bekliyor
  let _loading = false;   // prepareInterstitial() hâlâ devam ediyor

  const init = () => {
    if (!_cap) return; // ID girilmeden veya web/tarayıcıda hiç başlatılmaz

    _cap.addListener("interstitialAdLoaded", () => { _adLoaded = true; _loading = false; });
    // rewardedads.js'teki aynı gerçek sorun: yükleme başarısız olursa bir daha
    // hiç yeniden denenmezse o oturumda reklam gelirinin tamamı kaybolur.
    _cap.addListener("interstitialAdFailedToLoad", () => {
      _adLoaded = false; _loading = false;
      setTimeout(prepare, 30000);
    });

    // RewardedAds zaten AdMob'u initialize + ATT izni ile başlatmış olabilir;
    // aynı native SDK'yı iki kez initialize etmek zararsız ama gereksiz —
    // yine de kendi ready bayrağımızı burada set ediyoruz.
    _cap.initialize()
      .then(() => { _ready = true; prepare(); })
      .catch((e) => console.warn('AdMob (interstitial) init hatası:', e));
  };

  const prepare = () => {
    if (!_cap || !_ready || _loading || _adLoaded) return;
    _loading = true;
    _cap.prepareInterstitial({ adId: INTERSTITIAL_AD_UNIT_ID }).catch((e) => {
      _loading = false;
      console.warn('Geçiş reklamı hazırlanamadı:', e);
    });
  };

  // onDone: reklam kapandı, gösterilemedi ya da hiç hazır değildi — HER
  // KOŞULDA çağrılır, çağıran taraf (game.js) buna bakmadan oyuna devam eder.
  const show = async (onDone) => {
    if (!_cap || !_ready || !_adLoaded) {
      _showSimulatedAd(onDone);
      return;
    }
    _adLoaded = false; // bu reklam artık tüketiliyor, tekrar hazır değil
    let done = false;
    let dismissListener, failListener;
    const cleanup = () => { dismissListener?.remove(); failListener?.remove(); };
    const finish = () => {
      if (done) return; done = true;
      cleanup();
      prepare(); // sıradaki gösterim için yeniden hazırla
      onDone();
    };
    [dismissListener, failListener] = await Promise.all([
      _cap.addListener("interstitialAdDismissed", finish),
      _cap.addListener("interstitialAdFailedToShow", finish),
    ]);
    _cap.showInterstitial().catch(finish);
  };

  // ── Simülasyon modu (ID girilene / gerçek cihazda test edilene kadar) ──
  const _showSimulatedAd = (onDone) => {
    const isEN = window.LANG === 'en';
    const overlay = document.createElement("div");
    overlay.id = "simulated-ad-overlay";
    overlay.innerHTML = `
      <div id="simulated-ad-box">
        <div id="simulated-ad-label">${isEN ? "SIMULATED INTERSTITIAL AD (test mode)" : "SİMÜLE GEÇİŞ REKLAMI (test modu)"}</div>
        <div id="simulated-ad-spinner"></div>
        <div id="simulated-ad-countdown">3</div>
      </div>`;
    document.body.appendChild(overlay);
    let n = 3;
    const countdownEl = overlay.querySelector("#simulated-ad-countdown");
    const timer = setInterval(() => {
      n--;
      if (countdownEl) countdownEl.textContent = String(Math.max(n, 0));
      if (n <= 0) {
        clearInterval(timer);
        overlay.remove();
        onDone();
      }
    }, 500);
  };

  return { init, show };
})();

InterstitialAds.init();
