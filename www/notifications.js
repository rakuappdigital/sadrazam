// notifications.js — yerel bildirimler (8 Ekim 2026)
// @capacitor/local-notifications — sunucu yok; bildirimler cihazda zamanlanır, uygulama kapalıyken de gelir.
// Web/tarayıcıda hiçbir şey yapmaz. game.js'ten SONRA yüklenir (getDailyGiftStatus vb. kullanır).
//
// Kurallar:
//  - Günde EN FAZLA 2 bildirim (8 Ekim 2026, kullanıcı seçimi):
//      10:00  hediye + Günün Sorusu (hangisi bekliyorsa; ikisi birden tek bildirimde)
//      19:30  geri çağırma (N1 N2 N3 N7 N9 sırayla) — o gün oynandıysa gitmez
//      21:00  seri uyarısı (N-E1): seri 3+ gündeyse ve o gün hediye alınmadıysa geri çağırmanın YERİNE
//      Pazar 19:30 haftalık özet (N-E4): o hafta en az bir saltanat oynandıysa geri çağırmanın YERİNE
//  - Plan uygulama her açıldığında / öne geldiğinde baştan kurulur (bekleyenler silinir, 7 gün yeniden yazılır).
//    Böylece oyuncu o gün oynadıysa "geri dön" bildirimi gitmez, hediyesini aldıysa hediye hatırlatması gitmez.
//  - İzin: önce oyun içi yumuşak soru (_notifAsk), "Evet" denirse iOS izni. Reddedilirse bir daha sorulmaz;
//    Ayarlar → Bildirimler'den açılabilir (iOS izni kapalıysa uyarı).
//  - Bildirime dokununca uygulama açılır (iOS varsayılanı); hediye bildirimiyse ana menüde hediye penceresi açılır.
const Notif = (() => {
  const KEY = "sadrazam_notif";            // "on" | "off" | yok (henüz sorulmadı)
  const ASKED = "sadrazam_notif_asked";    // yumuşak soru gösterildi mi
  const ID_BASE = 7100;                    // 7100–7139: bizim bildirimlerimiz (iOS sınırı 64)
  const DAYS = 7;
  const GIFT_HOUR = [10, 0], CALL_HOUR = [19, 30];
  // Geri çağırma metinleri (kullanıcı seçimi: N1 N2 N3 N7 N9), sırayla döner.
  const CALLS = [
    ["Divan toplandı, makamın boş duruyor. Mühür seni bekliyor Sadrazam.", "The Divan has gathered and your seat stands empty. The seal awaits you, Grand Vizier."],
    ["Yeniçeriler kazan kaldırmadan bir uğra Paşam.", "Drop by before the Janissaries overturn their cauldrons, Pasha."],
    ["Padişah'ın sabrı taşmak üzere. Divan seni bekliyor.", "The Sultan's patience is running thin. The Divan awaits you."],
    ["Bir ulak kapında: Sultan'dan mühürlü bir mektup var.", "A messenger is at your door with a sealed letter from the Sultan."],
    ["Kahvehanelerde adın konuşuluyor. Ne dediklerini merak etmiyor musun?", "Your name is on every tongue in the coffeehouses. Don't you wonder what they say?"],
  ];
  const STREAK_HOUR = [21, 0];
  const plugin = () => {
    try { return window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins.LocalNotifications : null; } catch (e) { return null; }
  };
  const en = () => window.LANG === 'en';
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const enabled = () => get(KEY) === "on";

  async function permission() {
    const p = plugin(); if (!p) return "web";
    try { const r = await p.checkPermissions(); return r?.display || "prompt"; } catch (e) { return "denied"; }
  }
  async function request() {
    const p = plugin(); if (!p) return false;
    try { const r = await p.requestPermissions(); return r?.display === "granted"; } catch (e) { return false; }
  }

  // Önümüzdeki 7 günün planı (saf fonksiyon — test edilebilir).
  // st: { gift: getDailyGiftStatus(), trivia: bugün cevaplandı mı, week: {wk,games,best}, best: rekor yıl }
  function plan(now, st) {
    const out = [], E = en() ? 1 : 0, gift = st.gift;
    // Saatler verilen "now"a göre (9 Ekim 2026: eskiden gerçek saatten hesaplanıyordu; oyunda fark yoktu, testte tarih değişince sapıyordu)
    const at = (dayOffset, [h, m]) => { const d = new Date(now.getTime()); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d; };
    const nextDay = gift.claimed ? (gift.day % DAILY_GIFT_DAYS) + 1 : 1; // yarın gelirse serinin günü
    const T = { gift: ["Divan Hediyesi", "Divan Gift"], trivia: ["Günün Sorusu", "Question of the Day"], call: ["Divan: Sadrazam", "Divan: Grand Vizier"] };
    for (let d = 0; d < DAYS; d++) {
      // ── Sabah: hediye + soru ──
      let mAt = null, kind = null, amt = 0;
      if (d === 0) {
        const gP = !gift.claimed, tP = !st.trivia;
        if (gP || tP) {
          const t10 = at(0, GIFT_HOUR), t2 = new Date(now.getTime() + 2 * 3600 * 1000);
          mAt = t10 > now ? t10 : t2; if (mAt.getHours() >= 21 || mAt.getDate() !== now.getDate()) mAt = null;
          kind = gP && tP ? "both" : gP ? "gift" : "trivia"; amt = gift.reward;
        }
      } else { mAt = at(d, GIFT_HOUR); kind = "both"; amt = d === 1 ? _dailyGiftReward(nextDay) : 0; }
      if (mAt) {
        const body = kind === "trivia" ? ["Günün sorusu hazır, Divan seni bekliyor!", "The question of the day is ready, the Divan awaits!"][E]
          : kind === "gift" ? (amt ? [`Hediyen hazır: bugün +${amt} akçe. Seriyi bozma!`, `Your gift is ready: +${amt} akce today. Keep the streak!`][E] : ["Hazineden bugünün akçesi seni bekliyor. Seriyi bozma!", "Today's akce from the treasury awaits you. Keep the streak!"][E])
          : (amt ? [`Hediyen (+${amt} akçe) ve günün sorusu hazır. Divan seni bekliyor!`, `Your gift (+${amt} akce) and the question of the day are ready. The Divan awaits!`][E] : ["Günün hediyesi ve sorusu hazır. Divan seni bekliyor!", "Today's gift and question of the day are ready. The Divan awaits!"][E]);
        out.push({ at: mAt, extra: { kind }, title: T[kind === "trivia" ? "trivia" : "gift"][E], body });
      }
      // ── Akşam: seri uyarısı / haftalık özet / geri çağırma ──
      if (d === 0) {
        if (!gift.claimed && gift.day >= 4) { const t = at(0, STREAK_HOUR); if (t > now) out.push({ at: t, extra: { kind: "streak" }, title: T.gift[E], body: [`Bugün gelmezsen ${gift.day - 1} günlük serin bozulur. Hediyen seni bekliyor.`, `Miss today and your ${gift.day - 1}-day streak breaks. Your gift is waiting.`][E] }); }
        continue; // bugün oynandı: geri çağırma yok
      }
      if (d === 1 && gift.claimed && gift.day >= 3) {
        out.push({ at: at(1, STREAK_HOUR), extra: { kind: "streak" }, title: T.gift[E], body: [`Bugün gelmezsen ${gift.day} günlük serin bozulur. Hediyen seni bekliyor.`, `Miss today and your ${gift.day}-day streak breaks. Your gift is waiting.`][E] });
        continue;
      }
      const ev = at(d, CALL_HOUR);
      const w = st.week || {};
      if (ev.getDay() === 0 && w.games > 0 && _weekKey(ev) === w.wk) {
        const rec = st.best > 0 ? [` Rekorun ${st.best} yıl; kırmaya ne dersin?`, ` Your record is ${st.best} years; care to beat it?`][E] : "";
        out.push({ at: ev, extra: { kind: "week" }, title: T.call[E], body: [`Bu hafta ${w.games} saltanat, en uzunu ${w.best} yıl.`, `This week: ${w.games} reign${w.games > 1 ? "s" : ""}, the longest ${w.best} year${w.best === 1 ? "" : "s"}.`][E] + rec });
        continue;
      }
      const i = Math.floor(ev.getTime() / 864e5) % CALLS.length;
      out.push({ at: ev, extra: { kind: "call" }, title: T.call[E], body: CALLS[i][E] });
    }
    // Günde en fazla 2 (güvence) ve yalnız gelecekteki anlar
    const perDay = {};
    return out.filter(n => n.at > now).filter(n => { const k = n.at.toDateString(); perDay[k] = (perDay[k] || 0) + 1; return perDay[k] <= 2; })
      .map((n, i) => ({ id: ID_BASE + i, title: n.title, body: n.body, schedule: { at: n.at, allowWhileIdle: true }, extra: n.extra }));
  }
  function state() {
    let best = 0; try { best = parseInt(localStorage.getItem("sadrazam_best_year") || "0", 10) || 0; } catch (e) {}
    let trivia = true; try { trivia = _triviaAnsweredToday(); } catch (e) {}
    let week = null; try { week = _weekGet(); } catch (e) {}
    return { gift: getDailyGiftStatus(), trivia, week, best };
  }

  async function cancelOurs() {
    const p = plugin(); if (!p) return;
    try {
      const pend = await p.getPending();
      const ids = (pend?.notifications || []).filter(n => n.id >= ID_BASE && n.id < ID_BASE + 40).map(n => ({ id: n.id }));
      if (ids.length) await p.cancel({ notifications: ids });
    } catch (e) {}
  }
  let _busy = null;
  async function reschedule() {
    const p = plugin(); if (!p) return 0;
    if (_busy) return _busy; // üst üste çağrılar tek iş
    _busy = (async () => {
      try {
        await cancelOurs();
        if (!enabled() || (await permission()) !== "granted") return 0;
        const list = plan(new Date(), state());
        if (list.length) await p.schedule({ notifications: list });
        return list.length;
      } catch (e) { console.warn("[notif]", e); return 0; }
      finally { setTimeout(() => { _busy = null; }, 0); }
    })();
    return _busy;
  }

  // Yumuşak soru: oyun içinde, iOS sorusundan önce. once=true ise yalnız bir kez.
  function ask(reason) {
    if (!plugin() || get(ASKED) === "1" || get(KEY)) return false;
    if (document.querySelector("#notif-ask, #starter-offer, #rating-overlay, #katib-overlay, #resume-ask, #full-owned")) return false;
    if (reason === "menu" && document.getElementById("daily-gift-overlay")) return false;
    set(ASKED, "1");
    const E = en();
    const ov = document.createElement("div");
    ov.id = "notif-ask"; ov.className = "info-panel-overlay";
    ov.innerHTML = `<div class="ip-box na-box">
        <div class="ip-title">${E ? "SHALL THE DIVAN CALL YOU?" : "DİVAN SENİ ÇAĞIRSIN MI?"}</div><div class="ip-div"></div>
        <p>${E ? "We will remind you when your daily gift is ready and when the Divan needs you. At most twice a day." : "Günlük hediyen hazır olduğunda ve Divan sana ihtiyaç duyduğunda haber verelim. Günde en fazla iki kez."}</p>
        <button type="button" class="na-yes">${E ? "YES, NOTIFY ME" : "EVET, HABER VER"}</button>
        <button type="button" class="na-no">${E ? "Not now" : "Şimdilik hayır"}</button></div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add("on"));
    const close = () => { ov.classList.remove("on"); setTimeout(() => ov.remove(), 250); };
    ov.querySelector(".na-yes").onclick = async () => {
      close();
      const ok = await request();
      set(KEY, ok ? "on" : "off");
      try { window._an && _an("notif_permission", { ok: ok ? 1 : 0, reason: reason || "" }); } catch (e) {}
      if (ok) reschedule();
      try { if (typeof _settUpdateUI === "function") _settUpdateUI(); } catch (e) {}
    };
    ov.querySelector(".na-no").onclick = () => { set(KEY, "off"); close(); try { window._an && _an("notif_permission", { ok: 0, soft: 1, reason: reason || "" }); } catch (e) {} };
    return true;
  }

  // Ayarlar anahtarı
  async function setEnabled(on) {
    if (!plugin()) { set(KEY, on ? "on" : "off"); return on; }
    if (on) {
      let perm = await permission();
      if (perm === "prompt" || perm === "prompt-with-rationale") perm = (await request()) ? "granted" : "denied";
      if (perm !== "granted") {
        set(KEY, "off");
        try { showItemToast(en() ? "Notifications are turned off in iPhone Settings › Divan: Sadrazam." : "Bildirimler iPhone Ayarlar › Divan: Sadrazam bölümünde kapalı."); } catch (e) {}
        return false;
      }
    }
    set(KEY, on ? "on" : "off");
    await reschedule();
    return on;
  }

  // Bildirime dokunuldu: uygulama zaten açıldı (iOS). Hediye/soru bildirimiyse ana menüde ilgili pencere açılır.
  // Oyun ekranındaysa (kayıtlı oyuna dönmüş vb.) pencere açılmaz; HEDİYE düğmesindeki nokta bekler.
  function onTap(action) {
    const kind = action?.notification?.extra?.kind;
    try { window._an && _an("notif_open", { kind: kind || "" }); } catch (e) {}
    if (!["gift", "streak", "trivia", "both"].includes(kind)) return;
    const tryOpen = (n) => {
      try {
        const intro = document.getElementById("intro-screen");
        const onMenu = intro && intro.style.display !== "none" && !document.getElementById("brand-splash"); // açılış logosu kalkınca
        if (onMenu) {
          const gP = !getDailyGiftStatus().claimed, tP = !_triviaAnsweredToday();
          if (kind === "trivia") { if (tP) showTrivia(); return; }
          if (gP || tP) { if (!document.getElementById("daily-gift-overlay")) showDailyGift(); if (kind === "both" && tP && !gP) setTimeout(() => showTrivia(), 350); }
          return;
        }
      } catch (e) {}
      if (n > 0) setTimeout(() => tryOpen(n - 1), 700);
    };
    setTimeout(() => tryOpen(8), 600);
  }

  function init() {
    const p = plugin(); if (!p) return;
    try { p.addListener("localNotificationActionPerformed", onTap); } catch (e) {}
    reschedule();
    // Öne gelince ve arka plana geçerken planı tazele (o gün oynandı / hediye alındı bilgisi işlensin)
    document.addEventListener("visibilitychange", () => { reschedule(); });
  }

  return { init, ask, reschedule, setEnabled, enabled, permission, plan, state, CALLS, _tap: onTap }; // _tap: test için
})();
window.Notif = Notif;
Notif.init();
