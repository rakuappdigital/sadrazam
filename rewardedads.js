// rewardedads.js — Google AdMob ödüllü reklam entegrasyonu (native, iOS)
// AdMob native plugin henüz kurulu değilse simülasyon moduna düşer (test amaçlı).

const RewardedAds = (() => {
  let _cap = null;
  if (window.Capacitor?.isNativePlatform?.()) {
    try { _cap = window.Capacitor.Plugins.AdMob; } catch (e) {}
  }

  let _ready = false;
  const REWARDED_AD_UNIT_ID = "REWARDED_AD_UNIT_ID_BURAYA"; // TODO: AdMob hesabı kurulunca doldurulacak

  const init = () => {
    if (!_cap) return;
    _cap.initialize().then(() => { _ready = true; prepare(); }).catch(() => {});
  };

  const prepare = () => {
    if (!_cap) return;
    _cap.prepareRewardVideoAd({ adId: REWARDED_AD_UNIT_ID }).catch(() => {});
  };

  // onReward: reklam sonuna kadar izlendi, ödülü ver
  // onCancel: reklam izlenmeden kapatıldı / kullanılamıyor
  const show = (onReward, onCancel) => {
    if (!_cap) {
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

  // ── Simülasyon modu (AdMob kurulana kadar geliştirme/test için) ──
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
