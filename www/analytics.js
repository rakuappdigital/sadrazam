// ── Ölçüm (5 Ekim 2026) ─────────────────────────────────────────────
// TelemetryDeck'e anonim kullanım olayları gönderir. Pano: https://dashboard.telemetrydeck.com
//
// OYUNU ASLA ETKİLEMEZ: her çağrı try/catch içinde, hiçbir şey beklenmez (await yok),
// ağ hatası sessizce yutulur, oyun durumu okunur ama hiç değiştirilmez. APP_ID girilmeden
// (yer tutucu kaldıkça) hiçbir ağ isteği yapılmaz — Analytics.track() boş döner.
//
// Gizlilik: kişisel veri, reklam kimliği (IDFA), konum GÖNDERİLMEZ. Kullanıcı kimliği, cihazda
// üretilen rastgele bir sayının SHA-256 özetidir; başka uygulamalarla ilişkilendirilemez → ATT
// izni gerekmez. App Store gizlilik etiketi: "Kullanım Verisi · Ürün Etkileşimi · kullanıcıyla
// bağlantılı değil · izleme için kullanılmıyor".
//
// Kota: yeni hesaplarda ayda 50.000 olay ücretsiz. Kart kararlarının tamamı değil, yalnızca
// CARD_SAMPLE oranı gönderilir; geri kalan olaylar oyun/yıl başına birkaç tanedir
// (oyun başına ortalama ~15 olay).
(function () {
  const APP_ID = "F3B8B209-FB1A-4FAB-B53D-5FB4DE179E3D"; // TelemetryDeck > uygulama > Ayarlar > App ID
  const NAMESPACE = "com.sadrazam";                          // TelemetryDeck kuruluş namespace'i
  const ENDPOINT = "https://nom.telemetrydeck.com/v2/namespace/" + NAMESPACE + "/";
  // Yerel geliştirme/test sunucusunda (http://localhost) gönderim YOK — testler gerçek panoya ve kotaya
  // yazmasın. DİKKAT: iOS uygulaması da capacitor://localhost'ta çalışır; onu isNative() ayırır.
  // Testte bilerek açmak için localStorage.sadrazam_an_test = "1".
  const LOCAL_DEV = (() => { try { return !window.Capacitor?.isNativePlatform?.() && /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && localStorage.getItem("sadrazam_an_test") !== "1"; } catch (e) { return true; } })();
  const ENABLED = APP_ID !== "TELEMETRYDECK_APP_ID_BURAYA" && !LOCAL_DEV;
  const SALT = "sadrazam-divan-1520";
  const CARD_SAMPLE = 0.15;      // kart kararlarının yaklaşık %15'i gönderilir
  const FLUSH_MS = 20000;        // en geç 20 sn'de bir gönder
  const MAX_BATCH = 25;

  const queue = [];
  let hashedUser = null, timer = null;
  const sessionID = (() => { try { return crypto.randomUUID(); } catch (e) { return String(Date.now()) + Math.random().toString(16).slice(2); } })();

  function rawUser() {
    try {
      let id = localStorage.getItem("sadrazam_tdid");
      if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)); localStorage.setItem("sadrazam_tdid", id); }
      return id;
    } catch (e) { return "anon"; }
  }
  async function userHash() {
    if (hashedUser) return hashedUser;
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawUser() + SALT));
      hashedUser = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    } catch (e) { hashedUser = "anon"; }
    return hashedUser;
  }
  function isNative() { try { return !!window.Capacitor?.isNativePlatform?.(); } catch (e) { return false; } }
  function appVersion() {
    try { const m = (document.getElementById("intro-footer")?.textContent || "").match(/v(\d+\.\d+\.\d+)/); return m ? m[1] : "?"; } catch (e) { return "?"; }
  }
  function common() {
    const out = { appVersion: appVersion(), lang: window.LANG === "en" ? "en" : "tr", platform: isNative() ? "ios" : "web" };
    try {
      out.paid = localStorage.getItem("sadrazam_full_unlocked") === "1" ? "full" : "free";
      out.noads = localStorage.getItem("sadrazam_noads") === "1" ? "1" : "0";
    } catch (e) {}
    return out;
  }
  function str(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") { try { return JSON.stringify(v); } catch (e) { return ""; } }
    return String(v);
  }

  async function flush(keepalive) {
    if (!ENABLED || !queue.length) return;
    const batch = queue.splice(0, MAX_BATCH);
    try {
      const clientUser = await userHash();
      const body = batch.map(s => ({
        appID: APP_ID, clientUser, sessionID, type: s.type, payload: s.payload,
        telemetryClientVersion: "SadrazamJS 1.0",
        ...(isNative() ? {} : { isTestMode: true }),   // web/test sürümü panoda "test" olarak ayrılır
      }));
      fetch(ENDPOINT, { method: "POST", mode: "cors", keepalive: !!keepalive, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .catch(() => {});
    } catch (e) {}
    if (queue.length) schedule();
  }
  function schedule() {
    if (timer) return;
    timer = setTimeout(() => { timer = null; flush(false); }, FLUSH_MS);
  }

  function track(type, payload) {
    if (!ENABLED) return;
    try {
      const p = common();
      for (const [k, v] of Object.entries(payload || {})) p[k] = str(v);
      queue.push({ type, payload: p });
      if (queue.length > 200) queue.splice(0, queue.length - 200);
      if (queue.length >= MAX_BATCH) flush(false); else schedule();
    } catch (e) {}
  }
  // Kart kararı: örneklenir. ms = kartın ekrana gelişinden karara kadar geçen süre.
  function card(payload) {
    if (!ENABLED) return;
    try { if (Math.random() < CARD_SAMPLE) track("card_decided", payload); } catch (e) {}
  }

  try {
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(true); });
    window.addEventListener("pagehide", () => flush(true));
  } catch (e) {}

  window.Analytics = { track, card, flush, enabled: ENABLED };
  track("session_start", {});
})();
