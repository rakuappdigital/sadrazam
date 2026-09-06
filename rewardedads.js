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

  let _ready = false;

  const init = () => {
    if (!_cap) return; // ID'ler girilmeden veya web/tarayıcıda hiç başlatılmaz
    _cap.initialize()
      .then(() => _cap.requestTrackingAuthorization().catch(() => {})) // iOS 14+ ATT izni
      .then(() => { _ready = true; prepare(); })
      .catch((e) => console.warn('AdMob init hatası:', e));
  };

  const prepare = () => {
    if (!_cap) return;
    _cap.prepareRewardVideoAd({ adId: REWARDED_AD_UNIT_ID }).catch((e) => console.warn('Reklam hazırlanamadı:', e));
  };

  // onReward: reklam sonuna kadar izlendi, ödülü ver
  // onCancel: reklam izlenmeden kapatıldı / kullanılamıyor
  const show = (onReward, onCancel) => {
    if (!_cap || !_ready) {
      _showSimulatedAd(onReward, onCancel);
      return;
    }
    let rewarded = false;
    const rewardListener = _cap.addListener("onRewardedVideoAdReward", () => { rewarded = true; });
    const dismissListener = _cap.addListener("onRewardedVideoAdDismissed", () => {
      rewardListener.remove(); dismissListener.remove();
      prepare(); // sıradaki gösterim için yeniden hazırla
      if (rewarded) onReward(); else onCancel();
    });
    _cap.showRewardVideoAd().catch(() => {
      rewardListener.remove(); dismissListener.remove();
      onCancel();
    });
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
