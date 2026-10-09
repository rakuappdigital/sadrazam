// ── Öteki Oda (8 Ekim 2026) ──────────────────────────────────────────────────────────────
// 4., 8., 12.… yılın 5. kartından sonra bir gece: oyuncu Rakip Vezir olur, Kara Kethüda ile
// Sadrazam'a (kendine) tuzak kurar. Seçimler: 1-C kafes açılışı + açıklama penceresi, 2-B hafızalı
// rakip, 3-A şafak + mühürlü zarf, 5-A kendi tuzağın (bozarsan Defter'e mühür).
// DEĞİŞMEZ KURALLAR: gece kartları oynanan kart sayılmaz, hiçbir güç/sabır değişmez; gece ferman
// kuyruğunun bir penceresidir (başka pencereyle çakışmaz). Tuzaklar data/cards.json'daki oteki_* karar
// kartlarıdır (denge denetçisinden geçer), en geç gecenin 90 kart sonrasında gelir. game.js'teki her
// çağrı try/catch içinde: bu modülde bir hata oyun akışını asla durdurmaz.
const OtekiOda = (() => {
  const EVERY = 4, AT_CARD = 5, DEADLINE = 90, SPACING = 6;
  const MULT = { 1: 1, 2: 1.4, 3: 1.8 }, CAP = { 1: 8, 2: 12, 3: 15 };
  const FAC = ["saray", "yeniçeri", "ulema", "hazine"];
  const FAC_ID = { saray: "saray", "yeniçeri": "ordu", ulema: "ulema", hazine: "hazine" };
  const FAC_TR = { saray: "Saray'ı", "yeniçeri": "Ocak'ı", ulema: "Ulema'yı", hazine: "Hazine'yi" };
  const FAC_EN = { saray: "the Palace", "yeniçeri": "the Janissaries", ulema: "the Ulema", hazine: "the Treasury" };
  const PEOPLE = {
    "5-valide-sultan":  { id: "valide",      tr: "Valide Sultan",  acc: "Valide Sultan'ı",   abl: "Valide Sultan'dan",   en: "the Valide Sultan" },
    "2-yeniceri":       { id: "yeniceri",    tr: "Yeniçeri Ağası", acc: "Yeniçeri Ağası'nı", abl: "Yeniçeri Ağası'ndan", en: "the Janissary Commander" },
    "3-seyhulislam":    { id: "seyhulislam", tr: "Şeyhülislam",    acc: "Şeyhülislam'ı",     abl: "Şeyhülislam'dan",     en: "the Şeyhülislam" },
    "4-defterdar":      { id: "defterdar",   tr: "Defterdar",      acc: "Defterdar'ı",       abl: "Defterdar'dan",       en: "the Treasurer" },
    "14-casuslar_basi": { id: "casus",       tr: "Casuslar Başı",  acc: "Casuslar Başı'nı",  abl: "Casuslar Başı'ndan",  en: "the Spymaster" },
  };
  const TIER_NAME = { 1: ["FISILTI GECESİ", "NIGHT OF WHISPERS"], 2: ["ORTAKLIK GECESİ", "NIGHT OF ALLIES"], 3: ["KANLI AY", "BLOOD MOON"] };
  const IMG = { k: "assets/oteki/kethuda-gece.jpg", rv: "assets/oteki/rakip-vezir-gece.jpg", lat: "assets/oteki/kafes.webp",
                bg: "assets/oteki/gece-koridor.jpg", blood: "assets/oteki/kanli-ay.jpg", dawn: "assets/oteki/safak.jpg", env: "assets/oteki/mektup.webp" };

  // traps: { id, at, made, night, s, m: "f"|"i", st: damgalı mı, nr: geri dönüş yok, k: {tr,en} karar metni }
  // hist: { n, beat, fell } her gece için   ·   exiled: Rakip Vezir sürgün   ·   letter: sürgün mektubu verildi
  let S = fresh();
  let _queued = false; // bu gece kuyrukta bekliyor (kaydedilmez: yüklenince yeniden kurulur)
  function fresh() { return { n: 0, lastYear: 0, traps: [], hist: [], exiled: false, letter: false, lastDeliver: -99 }; }
  const en = () => window.LANG === 'en';
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const cardById = (id) => (typeof allCards !== "undefined" ? allCards : []).find(c => c.id === id);

  function reset() { S = fresh(); _queued = false; }
  function save() { return JSON.parse(JSON.stringify(S)); }
  function load(o) {
    reset();
    if (!o || typeof o !== "object") return;
    S.n = +o.n || 0; S.lastYear = +o.lastYear || 0; S.exiled = !!o.exiled; S.letter = !!o.letter; S.lastDeliver = +o.lastDeliver || -99;
    S.hist = Array.isArray(o.hist) ? o.hist.filter(h => h && typeof h === "object").map(h => ({ n: +h.n || 0, beat: +h.beat || 0, fell: +h.fell || 0 })) : [];
    S.traps = Array.isArray(o.traps) ? o.traps.filter(t => t && cardById(t.id)).map(t => ({
      id: String(t.id), at: +t.at || 0, made: +t.made || 0, night: +t.night || 1, s: Math.max(1, Math.min(3, +t.s || 1)),
      m: t.m === "i" ? "i" : "f", st: t.st !== false, nr: !!t.nr, k: t.k && typeof t.k === "object" ? { tr: String(t.k.tr || ""), en: String(t.k.en || "") } : null })) : [];
    // Kayıtta kuyrukta duran ama artık bekleyen tuzağı olmayan oteki kartı gelmesin
    if (typeof forcedQueue !== "undefined" && Array.isArray(forcedQueue))
      forcedQueue = forcedQueue.filter(c => !c || !c.oteki || S.traps.some(t => t.id === c.id));
  }

  // ── Gece ne zaman gelir ──
  function _eligibleNow() {
    if (typeof isGameOver !== "undefined" && isGameOver) return false;
    if (!selectedSultan || isPasaMode || isChallengeMode) return false;
    try { if (typeof _nisan === "function" && _nisan("rakip") === 1) return false; } catch (e) {} // Boş Koltuk: rakip yok
    return year >= EVERY && year % EVERY === 0 && S.lastYear !== year && (cardsPlayed % CARDS_PER_YEAR) >= AT_CARD;
  }
  function due() { return _eligibleNow() && !_queued && S.traps.length === 0; }

  // decide() enjeksiyon bloğundan her kararda: vadesi gelen tuzak → kuyruğa; vakti gelen gece → pencere kuyruğuna
  function tick() {
    if (typeof isGameOver !== "undefined" && isGameOver) return;
    const pend = S.traps.slice().sort((a, b) => a.at - b.at);
    const queued = (id) => forcedQueue.some(c => c && c.id === id) || (currentCard && currentCard.id === id);
    for (const t of pend) {
      if (queued(t.id)) break; // kuyruktaki tuzak gelmeden ikincisi girmesin
      const late = cardsPlayed >= t.made + DEADLINE;
      if (cardsPlayed >= t.at && (late || cardsPlayed - S.lastDeliver >= SPACING)) {
        const c = cardById(t.id); if (!c) { S.traps = S.traps.filter(x => x !== t); continue; }
        if (late) forcedQueue.unshift(c); else forcedQueue.push(c);
        S.lastDeliver = cardsPlayed;
      }
      break; // her kararda en fazla bir tuzak
    }
    if (due()) { _queued = true; _fermanEnqueue({ kind: "oteki" }); }
  }

  // dealNext: kuyruktan gelen oteki kartı bekleyen tuzakla eşleşirse kademeye göre hazırla
  function prepare(c) {
    if (!c || !c.oteki) return c;
    const t = S.traps.find(x => x.id === c.id);
    if (!t) return c;
    const sc = (fx) => { const o = {}; for (const k of FAC) { const v = (fx && fx[k]) || 0; o[k] = v === 0 ? 0 : Math.sign(v) * Math.min(CAP[t.s], Math.round(Math.abs(v) * MULT[t.s])); } return o; };
    const out = { ...c, left_effects: sc(c.left_effects), right_effects: sc(c.right_effects), _oteki: t.id };
    if (c.text.includes("{KARAR}")) {
      const k = t.k || { tr: "Geçen yılki bir kararınız", en: "One of your decisions last year" };
      out.text = c.text.split("{KARAR}").join(k.tr); out.text_en = (c.text_en || "").split("{KARAR}").join(k.en);
    }
    if (t.st && typeof _stampMeta !== "undefined") _stampMeta.set(out, { oteki: true, at: t.made });
    return out;
  }
  const extraScaled = (t, v) => v === 0 ? 0 : Math.sign(v) * Math.min(CAP[t.s], Math.round(Math.abs(v) * MULT[t.s]));

  // decide(): kararın uygulanan yönü (Arz sonrası) ile — etkilerden ÖNCE çağrılır
  function onDecide(card, dir) {
    if (!card || !card._oteki) return;
    const t = S.traps.find(x => x.id === card._oteki);
    if (!t) return;
    S.traps = S.traps.filter(x => x !== t);
    const src = cardById(t.id) || card;
    const ox = src.oteki || {}, ex = (dir === "left" ? ox.xl : ox.xr) || {};
    if (ex.sabir) sultanSabir = Math.max(0, Math.min(100, sultanSabir + extraScaled(t, ex.sabir)));
    if (ex.rel && typeof CAST !== "undefined" && CAST[src.character]) relChange(src.character, ex.rel);
    const beat = dir === ox.beat;
    const h = S.hist.find(x => x.n === t.night); if (h) h[beat ? "beat" : "fell"]++;
    const E = en();
    let seals = 0, exile = false;
    if (beat) {
      seals = t.m === "i" ? 2 : 1;
      if (t.nr && /^oteki_hesap_/.test(t.id)) { exile = true; seals += 3; S.exiled = true; }
      try { const d = _defterGet(); d.seals += seals; _defterSet(d); } catch (e) {}
      try { updateCrossGame(exile ? { otekiBeat: 1, otekiExile: 1 } : { otekiBeat: 1 }); } catch (e) {}
    }
    const hidden = !t.st ? (E ? "This was the Rival Vizier's trap. " : "Bu, Rakip Vezir'in tuzağıydı. ") : "";
    const msg = beat
      ? `<b>${E ? "TRAP FOILED" : "TUZAK BOZULDU"}</b><span>${hidden}${E ? `Ledger +${seals} seal${seals > 1 ? "s" : ""}` : `Deftere +${seals} mühür`}${exile ? (E ? " · The Rival Vizier is exiled!" : " · Rakip Vezir sürgün!") : ""}</span>`
      : `<b>${E ? "YOU FELL FOR THE TRAP" : "TUZAĞA DÜŞTÜN"}</b><span>${hidden}${E ? "The Rival Vizier's plan worked." : "Rakip Vezir'in planı işledi."}</span>`;
    setTimeout(() => { try { _cagToast(msg, 3000); } catch (e) {} }, 650);
    try { _an("oteki_trap", { id: t.id, beat: beat ? 1 : 0, s: t.s, night: t.night, exile: exile ? 1 : 0 }); } catch (e) {}
    try { _renderFermanChip(); } catch (e) {}
  }

  // Ferman şeridinde bekleyen tuzak sayısı (ay işareti)
  function chipHTML() {
    if (!S.traps.length) return "";
    return `<span class="fc-ot" title="${en() ? "Traps waiting" : "Bekleyen tuzak"}"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M7.6 1.4a4.8 4.8 0 1 0 0 9.2 3.9 3.9 0 1 1 0-9.2z" fill="currentColor"/></svg>${S.traps.length}</span>`;
  }

  // ── Gecenin içeriği ──
  function _lastResult() {
    const h = S.hist[S.hist.length - 1];
    if (!h || h.beat + h.fell === 0) return null;
    return h.beat >= h.fell ? "beat" : "fell";
  }
  function _favored() {
    const sum = { saray: 0, "yeniçeri": 0, ulema: 0, hazine: 0 };
    (typeof _memLog !== "undefined" ? _memLog : []).slice(-10).forEach(e => {
      const c = cardById(e.id); const fx = c && c[e.dir + "_effects"]; if (!fx) return;
      FAC.forEach(k => { if ((fx[k] || 0) > 0) sum[k] += fx[k]; });
    });
    let best = null, bv = 0; FAC.forEach(k => { if (sum[k] > bv) { bv = sum[k]; best = k; } });
    if (best) return best;
    return FAC.reduce((a, k) => (stats[k] ?? 50) > (stats[a] ?? 50) ? k : a, "saray");
  }
  function _people() {
    const keys = Object.keys(PEOPLE).filter(k => typeof CAST === "undefined" || CAST[k]);
    const rp = (k) => (typeof relPoints !== "undefined" && relPoints[k]) || 0;
    const pick = (arr, better) => { let best = []; arr.forEach(k => { if (!best.length || better(rp(k), rp(best[0]))) best = [k]; else if (rp(k) === rp(best[0])) best.push(k); }); return best[Math.floor(Math.random() * best.length)]; };
    const foe = pick(keys, (a, b) => a < b);
    const friend = pick(keys.filter(k => k !== foe), (a, b) => a > b);
    return { foe, friend };
  }
  function _pastDecision() {
    const old = (typeof _memLog !== "undefined" ? _memLog : []).filter(e => e && e.at <= cardsPlayed - 24 && !/^oteki_/.test(e.id));
    for (let i = 0; i < 6 && old.length; i++) {
      const e = old[Math.floor(Math.random() * old.length)], c = cardById(e.id);
      const tr = c && c[e.dir + "_text"], te = c && c[e.dir + "_text_en"];
      if (tr && te) return { tr: `«${tr}» kararınız`, en: `Your decision "${te}"` };
    }
    return null;
  }
  function _ctx() {
    const tier = Math.min(3, S.n + 1), last = _lastResult();
    let s = tier, st = true;
    if (last === "beat") s = Math.min(3, s + 1);
    if (last === "fell") { s = Math.max(1, s - 1); st = false; }
    const p = _people();
    return { tier, last, s, st, fav: _favored(), foe: p.foe, friend: p.friend };
  }
  function _memoryLine(last, E) {
    if (last === "beat") return E ? "\"Last time our plan came to nothing, my lord. He read us. This time we hold the rope tight.\"" : "\"Geçen sefer planımız boşa çıktı paşam. Sadrazam bizi okudu. Bu kez ipi sıkı tutalım.\"";
    if (last === "fell") return E ? "\"Last time it worked, my lord. He still has no idea what is coming. This time we leave no trace at all.\"" : "\"Geçen sefer işe yaradı paşam. Sadrazam hâlâ neyin geldiğini bilmiyor. Bu kez iz bile bırakmayalım.\"";
    return "";
  }
  // Gece kartları: { img, who, text, L:[metin, ipucu, değer], R:[...], key }
  function _cards(x) {
    const E = en(), K = E ? "KARA KETHÜDA" : "KARA KETHÜDA", P = PEOPLE;
    const fr = P[x.friend], fo = P[x.foe];
    const hedef = {
      key: "target", img: IMG.k, who: K,
      text: E ? `The steward dims the candle: "My lord, the Grand Vizier keeps favouring ${FAC_EN[x.fav]}. We strike there, or at the one he trusts most: ${fr.en}."`
              : `Kethüda mumu kısıyor: "Paşam, Sadrazam son kararlarında hep ${FAC_TR[x.fav]} kolladı. Ya oradan vururuz ya da en güvendiği kişiden, ${fr.abl}."`,
      L: [E ? `Stir up ${FAC_EN[x.fav]}` : `${FAC_TR[x.fav]} kışkırt`, E ? "The trap comes through this power" : "Tuzak bu güçten gelir", "fac"],
      R: [E ? `Turn ${fr.en} against him` : `${fr.acc} ondan soğut`, E ? "The trap comes through this person" : "Tuzak bu kişiden gelir", "cast"] };
    const yontem = {
      key: "method", img: IMG.rv, who: E ? "RIVAL VIZIER" : "RAKİP VEZİR",
      text: E ? "\"How shall we do it? A whisper is enough, but slander burns faster.\"" : "\"Nasıl yapalım? Bir fısıltı yeter de, bir iftira daha çabuk yakar.\"",
      L: [E ? "A whisper" : "Fısıltı", E ? "Light trap · foil it for +1 seal" : "Hafif tuzak · bozarsan +1 mühür", "f"],
      R: [E ? "Slander" : "İftira", E ? "Harsh trap · foil it for +2 seals" : "Sert tuzak · bozarsan +2 mühür", "i"] };
    const zaman = {
      key: "time", img: IMG.k, who: K,
      text: E ? "\"When? This year, or once he believes himself safe?\"" : "\"Ne zaman? Bu yıl mı, yoksa kendini güvende sandığında mı?\"",
      L: [E ? "Within this year" : "Bu yıl içinde", E ? "In 6–20 cards" : "6–20 kart sonra", "now"],
      R: [E ? "Be patient" : "Sabırla bekle", E ? "In 30–80 cards" : "30–80 kart sonra", "later"] };
    if (x.tier === 3) {
      return [
        { key: "t3target", img: IMG.k, who: K,
          text: E ? "A blood moon has risen. The steward no longer whispers: \"Now or never, my lord. Do we win the Sultan's ear, or bring the Janissaries into the streets?\""
                  : "Kanlı bir ay doğdu. Kethüda artık fısıldamıyor: \"Ya şimdi ya hiç, paşam. Sultan'ın kulağına mı gireriz, Ocak'ı mı sokağa dökeriz?\"",
          L: [E ? "The Sultan's ear" : "Sultan'ın kulağı", E ? "Trap: the Sultan's patience" : "Tuzak: Sultan'ın sabrı", "sabir"],
          R: [E ? "Raise the Janissaries" : "Ocak'ı ayaklandır", E ? "Trap: the Army and the Palace" : "Tuzak: Ordu ve Saray", "ocak"] },
        { key: "t3proof", img: IMG.k, who: K,
          text: E ? "\"We need proof. Do we inflate a real mistake of his, or forge a seal?\"" : "\"Bir de belge lazım. Gerçek bir hatasını mı büyütelim, yoksa sahte bir mühür mü bastıralım?\"",
          L: [E ? "A real mistake" : "Gerçek hatası", E ? "Divan reckoning over a real decision · +1 seal" : "Divan'da Hesap: gerçek bir eski kararın · +1 mühür", "f"],
          R: [E ? "A forged seal" : "Sahte mühür", E ? "Harsher reckoning · +2 seals" : "Daha sert Hesap · +2 mühür", "i"] },
        { key: "t3back", img: IMG.rv, who: E ? "RIVAL VIZIER" : "RAKİP VEZİR",
          text: E ? "\"If we succeed, I become Grand Vizier. And if we fail?\"" : "\"Ve başarırsak ben Sadrazam olurum. Başaramazsak?\"",
          L: [E ? "Prepare a way out" : "Kaçış yolu hazırla", E ? "Traps one step lighter" : "Tuzaklar bir kademe hafif", "out"],
          R: [E ? "No way back" : "Geri dönüş yok", E ? "Foil the reckoning and he is exiled (+3 seals)" : "Hesap'ı bozarsan Rakip Vezir sürgün (+3 mühür)", "nr"] },
      ];
    }
    const list = [hedef, yontem, zaman];
    if (x.tier === 2) {
      list.unshift({ key: "ally", img: "assets/characters/" + x.foe + ".jpg", who: `${K} · ${E ? fo.en.replace(/^the /, "").toUpperCase() : fo.tr.toLocaleUpperCase("tr")}`,
        text: E ? `The steward opens the door: "My lord, we have a guest." In walks ${fo.en}: "I have no love for the Grand Vizier either. But what is my price?"`
                : `Kethüda kapıyı aralıyor: "Paşam, misafirimiz var." İçeri ${fo.tr} giriyor: "Sadrazam'ı ben de sevmem. Ama bunun bedeli ne?"`,
        L: [E ? "Promise a seat in the Divan" : "Divan'da yer vaat et", E ? "Willing ally: a harsh second trap" : "Gönüllü ortak: ikinci tuzak sert", "i"],
        R: [E ? "Remind them you know a secret" : "Sırrını bildiğini hatırlat", E ? "Unwilling ally: a light second trap" : "Zorla ortak: ikinci tuzak hafif", "f"] });
    }
    return list;
  }
  // Seçimlerden tuzakları kur
  function _build(x, ch, skipped) {
    const night = S.n + 1, made = cardsPlayed, traps = [];
    const add = (id, at, m, extra) => { if (cardById(id)) traps.push({ id, at, made, night, s: x.s, m, st: x.st, nr: false, k: null, ...(extra || {}) }); };
    if (skipped) {
      add(`oteki_${FAC_ID[x.fav]}_f`, made + (Math.random() < .5 ? rnd(6, 20) : rnd(30, 80)), "f", { s: Math.max(1, x.tier - 1), st: true });
    } else if (x.tier === 3) {
      const s = ch.t3back === "out" ? Math.max(1, x.s - 1) : x.s, m = ch.t3proof;
      add(ch.t3target === "sabir" ? "oteki_kanli_sabir" : "oteki_kanli_ocak", made + rnd(8, 20), m, { s });
      add(m === "i" ? "oteki_hesap_sahte" : "oteki_hesap_gercek", made + rnd(40, 70), m, { s, nr: ch.t3back === "nr", k: m === "f" ? _pastDecision() : null });
    } else {
      const m = ch.method, at = made + (ch.time === "now" ? rnd(6, 20) : rnd(30, 80));
      add(ch.target === "fac" ? `oteki_${FAC_ID[x.fav]}_${m}` : `oteki_kisi_${PEOPLE[x.friend].id}_${m}`, at, m);
      if (x.tier === 2 && ch.ally) {
        let at2 = made + rnd(12, 60); if (Math.abs(at2 - at) < SPACING) at2 = at + SPACING + rnd(2, 8);
        const id2 = `oteki_kisi_${PEOPLE[x.foe].id}_${ch.ally}`;
        if (!traps.some(t => t.id === id2)) add(id2, at2, ch.ally);
      }
    }
    traps.forEach(t => { t.at = Math.min(t.at, made + DEADLINE - 4); });
    return traps;
  }

  // ── Pencere ──
  let _ov = null;
  const esc = (t) => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const tap = () => { try { if (window.playButtonTap) playButtonTap(); } catch (e) {} };
  const reduced = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  function show(done, _w) {
    // Açık bir ipucu kutusu (z 600) varsa önce o kapansın; gece onun altında başlamasın
    if (document.getElementById("coach-overlay") && (_w || 0) < 120) { setTimeout(() => show(done, (_w || 0) + 1), 500); return; }
    _queued = false;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; try { _ov && _ov.remove(); } catch (e) {} _ov = null; try { _renderFermanChip(); } catch (e) {} done(); };
    if (!_eligibleNow() || S.traps.length) { finish(); return; }
    const E = en();
    if (S.exiled) { _letter(finish); return; }
    const x = _ctx();
    const ov = document.createElement("div"); _ov = ov;
    ov.id = "oteki-ov"; ov.className = "ot-t" + x.tier + (reduced() ? " ot-rm" : "");
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `<div class="ot-bg" style="background-image:url('${x.tier === 3 ? IMG.blood : IMG.bg}')"></div>
      <div class="ot-sil" style="background-image:url('${IMG.rv}')"></div>
      <div class="ot-lat l" style="--lat:url('${IMG.lat}')"></div><div class="ot-lat r" style="--lat:url('${IMG.lat}')"></div>
      <div class="ot-cap"><div class="ot-cap-k">${E ? `YEAR ${year} · NIGHT` : `${year}. YIL · GECE`}</div>
        <div class="ot-cap-t">${E ? "Behind the lattice, someone is watching you…" : "Kafesin ardından biri seni izliyor…"}</div></div>
      <div class="ot-stage"></div>`;
    document.body.appendChild(ov);
    try { Haptics.letterArrival(); } catch (e) {}
    try { _an("oteki_night", { tier: x.tier, s: x.s, last: x.last || "" }); } catch (e) {}
    // K-A (kullanıcı seçimi): tek parça kafes belirir → yazı kutusu 2,4 sn → kafes tam ortadan ikiye ayrılıp iki yana çıkar
    const T = reduced() ? { close: 0, cap: 2000, open: 0 } : { close: 650, cap: 2400, open: 1000 };
    ov.classList.add("closing");
    setTimeout(() => { if (!finished) ov.classList.add("cap-on"); }, T.close);
    setTimeout(() => { if (finished) return; ov.classList.remove("cap-on"); ov.classList.add("opening"); }, T.close + T.cap);
    setTimeout(() => { if (!finished) _intro(ov, x, finish); }, T.close + T.cap + T.open);
  }

  function _intro(ov, x, finish) {
    const E = en(), first = S.n === 0, stage = ov.querySelector(".ot-stage");
    const mood = x.last === "beat" ? (E ? "The Rival Vizier bears a grudge: his traps are one step harsher." : "Rakip Vezir kinli: tuzakları bir kademe sert.")
               : x.last === "fell" ? (E ? "The Rival Vizier is confident: his traps are lighter, but they come unmarked." : "Rakip Vezir kendinden emin: tuzakları hafif ama damgasız gelir.") : "";
    const bullets = first ? [
      E ? "Tonight your powers do not change, and these cards do not count." : "Bu gece güçlerin değişmez, bu kartlar sayılmaz.",
      E ? "The trap you set will reach you in the coming cards. The moon on the decree ribbon shows traps still waiting." : "Kurduğun tuzak önümüzdeki kartlarda karşına çıkar. Ferman şeridindeki ay, bekleyen tuzakları gösterir.",
      E ? "Foil it and you earn Ledger seals: a whisper 1, slander 2." : "Bozarsan Vezirler Defteri'ne mühür kazanırsın: fısıltı 1, iftira 2.",
    ] : [E ? "Tonight your powers do not change. Your traps will reach you before the next night." : "Bu gece güçlerin değişmez. Tuzakların bir sonraki geceden önce karşına çıkar."];
    if (mood) bullets.push(mood);
    stage.innerHTML = `<div class="ot-box ot-pop" role="document">
      <div class="ot-k">${E ? "THE OTHER ROOM" : "ÖTEKİ ODA"} · ${TIER_NAME[x.tier][E ? 1 : 0]}</div>
      <p class="ot-lead">${E ? "Tonight you are the <b>Rival Vizier</b>. With your steward, Kara Kethüda, you will set a trap for the Grand Vizier — yourself." : "Bu gece <b>Rakip Vezir</b>'sin. Kâhyan Kara Kethüda ile Sadrazam'a, yani kendine bir tuzak kuracaksın."}</p>
      <ul class="ot-ul">${bullets.map(b => `<li>${b}</li>`).join("")}</ul>
      <button type="button" class="ot-go">${E ? "OK" : "TAMAM"}</button>
      <button type="button" class="ot-skip">${E ? "Sleep through the night (the steward acts alone)" : "Bu gece uyu (Kethüda kendi kurar)"}</button></div>`;
    requestAnimationFrame(() => stage.querySelector(".ot-pop").classList.add("on"));
    stage.querySelector(".ot-go").onclick = () => { tap(); _night(ov, x, finish); };
    stage.querySelector(".ot-skip").onclick = () => { tap(); _complete(ov, x, null, finish); };
  }

  function _night(ov, x, finish) {
    const E = en(), cards = _cards(x), ch = {}, stage = ov.querySelector(".ot-stage");
    ov.classList.add("night");
    let i = 0, busy = false;
    const draw = () => {
      const c = cards[i], mem = i === 0 ? _memoryLine(x.last, E) : "";
      stage.innerHTML = `<div class="ot-top"><span class="ot-k">${E ? "THE OTHER ROOM" : "ÖTEKİ ODA"} · ${i + 1}/${cards.length}</span>
          <span class="ot-lock"><svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2.2" y="5.2" width="7.6" height="5.6" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3.8 5.2V3.8a2.2 2.2 0 0 1 4.4 0v1.4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>${E ? "Your powers do not change tonight" : "Bu gece güçlerin değişmez"}</span></div>
        <div class="ot-card">
          <div class="ot-pic" style="background-image:url('${c.img}')"></div>
          <div class="ot-body"><div class="ot-who">${esc(c.who)}</div>
            ${mem ? `<p class="ot-mem">${esc(mem)}</p>` : ""}
            <p class="ot-text">${esc(c.text)}</p></div>
          <div class="ot-ch">
            <button type="button" class="ot-c L" data-v="${c.L[2]}"><b>${esc(c.L[0])}</b><small>${esc(c.L[1])}</small></button>
            <button type="button" class="ot-c R" data-v="${c.R[2]}"><b>${esc(c.R[0])}</b><small>${esc(c.R[1])}</small></button>
          </div></div>`;
      requestAnimationFrame(() => stage.querySelector(".ot-card").classList.add("on"));
      stage.querySelectorAll(".ot-c").forEach(b => b.onclick = () => {
        if (busy) return; busy = true; tap();
        b.classList.add("picked");
        ch[c.key] = b.dataset.v;
        setTimeout(() => {
          busy = false; i++;
          if (i < cards.length) draw();
          else _complete(ov, x, { target: ch.target, method: ch.method, time: ch.time, ally: ch.ally, t3target: ch.t3target, t3proof: ch.t3proof, t3back: ch.t3back }, finish);
        }, 380);
      });
    };
    draw();
  }

  function _complete(ov, x, ch, finish) {
    // Önce durum yazılır (animasyon yarıda kesilse de gece tamamlanmış sayılır)
    const traps = _build(x, ch || {}, !ch);
    S.n++; S.lastYear = year; S.hist.push({ n: S.n, beat: 0, fell: 0 }); S.traps = S.traps.concat(traps);
    try { saveGameState(); } catch (e) {}
    try { _an("oteki_done", { tier: x.tier, skipped: ch ? 0 : 1, traps: traps.length }); } catch (e) {}
    _dawn(ov, traps.length, finish);
  }

  // 3-A: şafak + mühürlü zarf ferman şeridine uçar
  function _dawn(ov, n, finish) {
    const E = en(), stage = ov.querySelector(".ot-stage");
    stage.innerHTML = `<div class="ot-env" aria-hidden="true" style="background-image:url('${IMG.env}')"></div>`;
    if (!ov.querySelector(".ot-dawn")) { const d = document.createElement("div"); d.className = "ot-dawn"; d.style.backgroundImage = `url('${IMG.dawn}')`; ov.insertBefore(d, ov.querySelector(".ot-stage")); }
    ov.classList.add("dawn");
    try { _renderFermanChip(); } catch (e) {}
    const env = stage.querySelector(".ot-env");
    const chip = document.getElementById("ferman-chip");
    if (chip && env && !reduced()) {
      const a = chip.getBoundingClientRect(), b = env.getBoundingClientRect();
      env.style.setProperty("--dx", Math.round(a.left + a.width / 2 - (b.left + b.width / 2)) + "px");
      env.style.setProperty("--dy", Math.round(a.top + a.height / 2 - (b.top + b.height / 2)) + "px");
    }
    const ms = reduced() ? 600 : 2300;
    setTimeout(() => env && env.classList.add("fly"), reduced() ? 0 : 900);
    setTimeout(() => { ov.classList.add("out"); }, ms);
    setTimeout(() => {
      finish();
      const msg = `<b>${E ? "DAWN" : "ŞAFAK"}</b><span>${E ? `${n} trap${n === 1 ? "" : "s"} set. ${n === 1 ? "It" : "They"} will reach you in the coming cards.` : `${n} tuzak kuruldu. Önümüzdeki kartlarda karşına çıkacak.`}</span>`;
      try { _cagToast(msg, 3200); } catch (e) {}
    }, ms + 450);
  }

  // Sürgünden sonraki ilk gece yerine tek bir mektup; sonra gece bir daha gelmez
  function _letter(finish) {
    S.lastYear = year;
    if (S.letter) { finish(); return; }
    S.letter = true;
    const E = en(), ov = document.createElement("div"); _ov = ov;
    ov.id = "oteki-ov"; ov.className = "ot-letter night";
    ov.innerHTML = `<div class="ot-bg" style="background-image:url('${IMG.bg}')"></div><div class="ot-stage"><div class="ot-box ot-pop on">
      <div class="ot-k">${E ? "A LETTER FROM LEMNOS" : "LİMNİ'DEN BİR MEKTUP"}</div>
      <p class="ot-lead">${E ? "\"Grand Vizier, the sea here is cold and the nights are long. You read me well. But a vizier's chair is never empty for long.\" — your former rival" : "\"Sadrazam, burada deniz soğuk, geceler uzun. Beni iyi okudun. Ama bir vezirin koltuğu hiçbir zaman uzun süre boş kalmaz.\" — eski rakibin"}</p>
      <button type="button" class="ot-go">${E ? "CONTINUE" : "DEVAM"}</button></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector(".ot-go").onclick = () => { tap(); try { saveGameState(); } catch (e) {} finish(); };
  }

  return { reset, save, load, tick, prepare, onDecide, chipHTML, show, due,
           get _state() { return S; }, get _queued() { return _queued; }, _cards, _ctx, _build };
})();
window.OtekiOda = OtekiOda;
