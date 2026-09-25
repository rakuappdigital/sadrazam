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

  const init = () => {
    if (!_cap) return; // ID'ler girilmeden veya web/tarayıcıda hiç başlatılmaz

    // Reklam gerçekten yüklenmeden _adLoaded true olmasın — eskiden bu bayrak
    // initialize() biter bitmez true oluyordu (reklam daha yüklenmeden), bu da
    // henüz hazır olmayan bir reklamı göstermeye çalışıp native tarafta
    // sessizce reddedilmesine yol açabiliyordu.
    _cap.addListener("onRewardedVideoAdLoaded", () => { _adLoaded = true; _loading = false; });
    // Yükleme başarısız olursa (ağ/doldurma sorunu) eskiden bir daha ASLA
    // yeniden denenmiyordu — kullanıcı bir daha o oturumda hiç reklam
    // göremiyor, dolayısıyla ne ödül ne de reklam geliri oluyordu. Şimdi
    // otomatik olarak yeniden dener.
    _cap.addListener("onRewardedVideoAdFailedToLoad", () => {
      _adLoaded = false; _loading = false;
      setTimeout(prepare, 30000);
    });

    _cap.initialize()
      .then(() => _cap.requestTrackingAuthorization().catch(() => {})) // iOS 14+ ATT izni
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

  // onReward: reklam sonuna kadar izlendi, ödülü ver
  // onCancel: reklam izlenmeden kapatıldı / hiç gösterilemedi
  //
  // KRİTİK: ödülü SADECE "onRewardedVideoAdReward" olayına bağlamıyoruz.
  // Bu olay bazı cihaz/ağ koşullarında hiç gelmiyor (@capacitor-community/admob
  // ve altındaki GoogleMobileAds SDK'sında bilinen, gerçek kullanıcılarda
  // görülmüş bir tutarsızlık) — gerçek kullanıcı reklamı baştan sona izlemesine
  // rağmen bu event gelmeyince ödül reddediliyordu. AdMob'un "rewarded" reklam
  // formatı, native SDK seviyesinde ödül eşiğine ulaşılmadan reklamın
  // kapatılmasına zaten izin vermiyor — yani "dismissed" olayının gelmesi TEK
  // BAŞINA ödülün hak edildiğini gösterir, ayrı bir onay beklemeye gerek yok.
  //
  // onShow: native "onRewardedVideoAdShowed" — reklam gerçekten tam ekrana
  // çıktı. Çağıran taraf (game.js) bunu, "reklam hiç açılmadı" için koyduğu
  // kısa güvenlik zaman aşımını iptal etmek için kullanır.
  //
  // KRİTİK — ikinci bug: native Swift tarafında (AdRewardExecutor.swift)
  // reklam gösterimi başarısız olursa (`didFailToPresentFullScreenContentWithError`)
  // sadece "onRewardedVideoAdFailedToShow" event'i yayınlanıyor, JS tarafındaki
  // showRewardVideoAd() promise'i HİÇ resolve/reject edilmiyor. Bu event
  // dinlenmezse (eskiden dinlenmiyordu) bu senaryoda .catch() asla tetiklenmez
  // ve arayüz sonsuza dek kilitli kalır — ne ödül verilir ne oyuna dönülür.
  const show = async (onReward, onCancel, onShow) => {
    if (!_cap || !_ready || !_adLoaded) {
      _showSimulatedAd(onReward, onCancel);
      return;
    }
    _adLoaded = false; // bu reklam artık tüketiliyor, tekrar hazır değil
    let done = false;
    let showedListener, rewardListener, dismissListener, failListener;
    const cleanup = () => {
      showedListener?.remove(); rewardListener?.remove();
      dismissListener?.remove(); failListener?.remove();
    };
    [showedListener, rewardListener, dismissListener, failListener] = await Promise.all([
      _cap.addListener("onRewardedVideoAdShowed", () => { if (onShow) onShow(); }),
      _cap.addListener("onRewardedVideoAdReward", () => {}),
      _cap.addListener("onRewardedVideoAdDismissed", () => {
        if (done) return; done = true;
        cleanup();
        prepare(); // sıradaki gösterim için yeniden hazırla
        onReward();
      }),
      _cap.addListener("onRewardedVideoAdFailedToShow", () => {
        if (done) return; done = true;
        cleanup();
        prepare();
        onCancel();
      }),
    ]);
    _cap.showRewardVideoAd().catch(() => {
      if (done) return; done = true;
      cleanup();
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
