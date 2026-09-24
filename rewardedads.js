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
  //
  // KRİTİK: ödülü SADECE "onRewardedVideoAdReward" olayına bağlamıyoruz.
  // Bu olay bazı cihaz/ağ koşullarında hiç gelmiyor (@capacitor-community/admob
  // ve altındaki GoogleMobileAds SDK'sında bilinen, gerçek kullanıcılarda
  // görülmüş bir tutarsızlık) — gerçek kullanıcı reklamı baştan sona izlemesine
  // rağmen bu event gelmeyince ödül reddediliyordu. AdMob'un "rewarded" reklam
  // formatı, native SDK seviyesinde ödül eşiğine ulaşılmadan reklamın
  // kapatılmasına zaten izin vermiyor — yani "dismissed" olayının gelmesi TEK
  // BAŞINA ödülün hak edildiğini gösterir, ayrı bir onay beklemeye gerek yok.
  // onShow: native "onRewardedVideoAdShowed" — reklam gerçekten tam ekrana
  // çıktı. Çağıran taraf (game.js) bunu, "reklam hiç açılmadı" için koyduğu
  // kısa güvenlik zaman aşımını iptal etmek için kullanır — reklamın izlenme
  // süresi (15-30+ sn) boyunca ayrıca bir zaman aşımı OLMAMALI, yoksa reklam
  // hâlâ oynarken kod "takıldı" sanıp gerçek sonucu (dismiss/reward) görmezden
  // gelir (bu tam olarak yaşanan bug'dı).
  const show = (onReward, onCancel, onShow) => {
    if (!_cap || !_ready) {
      _showSimulatedAd(onReward, onCancel);
      return;
    }
    const showedListener = _cap.addListener("onRewardedVideoAdShowed", () => {
      showedListener.remove();
      if (onShow) onShow();
    });
    const rewardListener = _cap.addListener("onRewardedVideoAdReward", () => {});
    const dismissListener = _cap.addListener("onRewardedVideoAdDismissed", () => {
      showedListener.remove(); rewardListener.remove(); dismissListener.remove();
      prepare(); // sıradaki gösterim için yeniden hazırla
      onReward();
    });
    _cap.showRewardVideoAd().catch(() => {
      showedListener.remove(); rewardListener.remove(); dismissListener.remove();
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
