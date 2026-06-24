// ═══════════════════════════════════════════════════════════════════
//  SADRAZAM — game.js  (v3.0)
// ═══════════════════════════════════════════════════════════════════

const CARDS_PER_YEAR = 10;
const PASSIVE_HAZINE_DRAIN = 2;

// ── Osmanlı Takvimi ───────────────────────────────────────────────
const HICRI_MONTHS = [
  "Muharrem","Safer","Rebiülevvel","Rebiülahir",
  "Cemaziyelevvel","Cemaziyelahir","Recep","Şaban",
  "Ramazan","Şevval","Zilkade","Zilhicce"
];
const SULTAN_HICRI_START = { kanuni: 927, yavuz: 918, murad3: 982 };

// ── Dinamik başlıklar ─────────────────────────────────────────────
const DYNAMIC_SUBTITLES = [
  "Boğaz'da Fırtınanın Başladığı Yıl",
  "Karanlık Koridorların Saltanatı",
  "Divan'ın Susmayı Seçtiği Günler",
  "Topkapı'da Gölgelerin Dansı",
  "Yıldızların Yanlış Hizalandığı Mevsim",
  "Rüzgarın Kıble'den Estiği Yıl",
  "Vezirler Arasındaki Sessiz Savaş",
  "Hazinenin Ağırlaştığı Günler",
  "Dua Ile Kılıcın Aynı Kefede Tutulduğu An",
  "Sarayın Duvarlarının Kulak Kesildiği Yıl",
  "Altın ve Kan Arasındaki Denge",
  "Hilal'in Eksildiği Geceler",
  "Beylerbeyi'nin Unvanının Tartıldığı Devir",
  "Halkın Susmayı Bıraktığı Sezon",
  "Celladın Gölgesinin Uzadığı Günler",
  "Mürekkep ve Kılıcın Yarıştığı Çağ",
  "Sultanın Gözlerinde Okunan Şüphe",
  "Kırmızı Tuğranın Titrediği Sabahlar",
  "Saray Bahçesinde Güller Değil Dikenler",
  "Osmanlı'nın Nefes Tuttuğu An"
];

const DEATH_TABLE = {
  saray:      { 0: "Sultan sana idam fermanı gönderdi. Başın gövdenden ayrıldı.", 100: "Sultan gücünden korktu. Kafanı daha önce davranarak aldı." },
  "yeniçeri": { 0: "Ordun dağıldı. Düşman ordusu İstanbul surlarına dayandı.", 100: "Yeniçeriler saraya yürüdü. Tahtı devirdi. Seni de." },
  ulema:      { 0: "Şeyhülislam dinsizlikle itham etti. Halk seni linç etti.", 100: "Ulema artık senden değil, Şeyhülislam'dan emir alıyor." },
  hazine:     { 0: "Devlet iflas etti. Asker maaşını alamadı. Herkes kaçtı.", 100: "Hazinede bu kadar altın tehlikeli. Sultan seni zimmetçilikle suçladı." },
};

// ── Sultan tanımları ──────────────────────────────────────────────
const SULTANS = [
  {
    id: "kanuni",
    name: "Kanuni Sultan Süleyman",
    desc: "Dengeli başlangıç",
    stats: { saray: 55, "yeniçeri": 50, ulema: 55, hazine: 50 },
    sultanSabir: 50
  },
  {
    id: "yavuz",
    name: "Yavuz Sultan Selim",
    desc: "Güçlü ama sabırsız. Hazine düşük.",
    stats: { saray: 65, "yeniçeri": 65, ulema: 60, hazine: 35 },
    sultanSabir: 35
  },
  {
    id: "murad3",
    name: "III. Murad",
    desc: "Zengin hazine, zayıf otorite.",
    stats: { saray: 40, "yeniçeri": 40, ulema: 45, hazine: 65 },
    sultanSabir: 60
  }
];

// ── Danışman tanımları ────────────────────────────────────────────
const ADVISORS = [
  {
    id: "sokollu",
    name: "Sokollu Mehmed Paşa",
    icon: '<img src="assets/advisors/advisor-sokollu.png" alt="Sokollu">',
    title: "Deneyimli Vezir",
    desc: "Tüm stat değişimleri %15 azalır",
    effect: "reduce_all_15"
  },
  {
    id: "piri_reis",
    name: "Piri Reis",
    icon: '<img src="assets/advisors/advisor-piri-reis.png" alt="Piri Reis">',
    title: "Kaptan-ı Derya",
    desc: "Her yıl Hazine +6",
    effect: "hazine_per_year_6"
  },
  {
    id: "sinan",
    name: "Mimar Sinan",
    icon: '<img src="assets/advisors/advisor-sinan.png" alt="Sinan">',
    title: "Baş Mimar",
    desc: "Saray ve Ulema etkileri %20 güçlenir",
    effect: "saray_ulema_boost_20"
  },
  {
    id: "semsi",
    name: "Şemsi Paşa",
    icon: '<img src="assets/advisors/advisor-semsi.png" alt="Şemsi">',
    title: "Saray Kâtibi",
    desc: "Sultan sabrı azalması %50 yavaşlar",
    effect: "sultan_sabir_slow_50"
  },
  {
    id: "hurrem",
    name: "Hürrem Haseki Sultan",
    icon: '<img src="assets/advisors/advisor-hurrem.png" alt="Hürrem">',
    title: "Has Kadın",
    desc: "Yeniçeri negatif etkileri %25 azalır",
    effect: "yeniceri_neg_reduce_25"
  }
];

// ── Arc tanımları ─────────────────────────────────────────────────
const ARCS = {
  venedik: ["venedik_1", "venedik_2", "venedik_3"],
  dogu_seferi: ["dogu_1", "dogu_2", "dogu_3"]
};

// ── Başarımlar ────────────────────────────────────────────────────
// ── BAŞARIMLAR ────────────────────────────────────────────────────
// tier: bronze | silver | gold | platinum | secret
const ACHIEVEMENTS = [
  // ── BRONZ ──
  { id: "first_step",     tier:"bronze", icon:"📜", name:"İlk Adım",             desc:"İlk oyununu tamamla.",                        check: s => s.year >= 1 },
  { id: "three_years",    tier:"bronze", icon:"⚔️", name:"Üç Yıl Direniş",       desc:"3 yıl hayatta kal.",                          check: s => s.year >= 3 },
  { id: "five_chars",     tier:"bronze", icon:"👥", name:"Saray Tanıdıkları",     desc:"Tek oyunda 5 farklı karakter gör.",            check: s => (s.seenCharacters||new Set()).size >= 5 },
  { id: "first_letter",   tier:"bronze", icon:"🔏", name:"Sultan'dan Haber",      desc:"Sultan'dan mektup al.",                       check: s => s.receivedLetters > 0 },
  { id: "first_chance",   tier:"bronze", icon:"🪙", name:"Kader Sınavı",          desc:"Bir şans kartını tamamla.",                   check: s => s.chanceCardsPlayed > 0 },
  { id: "first_death",    tier:"bronze", icon:"☠️", name:"İlk Son",               desc:"Oyunu bir kez bitir.",                        check: s => true },
  { id: "item_user",      tier:"bronze", icon:"🪙", name:"Hazır Hazineci",        desc:"İlk item'ını kullan.",                        check: s => s.itemsUsed > 0 },

  // ── GÜMÜŞ ──
  { id: "five_years",     tier:"silver", icon:"🌙", name:"Beş Yıl Sadrazam",     desc:"5 yıl hayatta kal.",                          check: s => s.year >= 5 },
  { id: "balanced",       tier:"silver", icon:"⚖️", name:"Denge Ustası",          desc:"Oyun bitiminde tüm statlar 40-65 arası.",     check: s => Object.values(s.stats).every(v=>v>=40&&v<=65) },
  { id: "hazine_guard",   tier:"silver", icon:"💰", name:"Hazine Bekçisi",        desc:"5 yıl hazine hiç 30'un altına düşmesin.",     check: s => s.year >= 5 && s.minHazine >= 30 },
  { id: "saray_high",     tier:"silver", icon:"👑", name:"Sultan'ın Gözdesi",     desc:"Saray 80+'a çıksın.",                        check: s => s.maxSaray >= 80 },
  { id: "chain_complete", tier:"silver", icon:"⛓️", name:"İplik Takipçisi",       desc:"Bir zincirleme karar dizisi tamamla.",        check: s => s.chainsCompleted > 0 },
  { id: "traitor_found",  tier:"silver", icon:"🕵️", name:"Haini Buldun",         desc:"Gizli haini tespit et (2+ soruştur).",       check: s => s.traitorInvestigated >= 2 },
  { id: "war_victory",    tier:"silver", icon:"🏹", name:"Zafer Habercisi",       desc:"Savaşı kabul et ve zaferi gör.",              check: s => s.warVictory },
  { id: "all_letters",    tier:"silver", icon:"📨", name:"Tüm Mektuplar",         desc:"Tek oyunda 4 sultan mektubunu al.",           check: s => s.receivedLetters >= 4 },

  // ── ALTIN ──
  { id: "ten_years",      tier:"gold",   icon:"🏛️", name:"On Yıl Sadrazam",     desc:"10 yıl hayatta kal.",                         check: s => s.year >= 10 },
  { id: "kanuni_ten",     tier:"gold",   icon:"🌟", name:"Kanunî'nin Mirası",    desc:"Kanuni ile 10 yıl hayatta kal.",              check: s => s.sultanId==="kanuni" && s.year>=10 },
  { id: "yavuz_eight",    tier:"gold",   icon:"⚡", name:"Yavuz'a Layık",        desc:"Yavuz ile 8 yıl hayatta kal.",               check: s => s.sultanId==="yavuz" && s.year>=8 },
  { id: "murad_treasure", tier:"gold",   icon:"💎", name:"Murad'ın Serveti",     desc:"III. Murad ile hazineyi 80+'a çıkar.",       check: s => s.sultanId==="murad3" && s.maxHazine>=80 },
  { id: "all_deaths",     tier:"gold",   icon:"💀", name:"Her Şeyi Gördüm",      desc:"8 farklı ölüm sebebini yaşa.",               check: s => (s.deathsSeen||[]).length >= 6 },
  { id: "curse_master",   tier:"gold",   icon:"🔥", name:"Lanet Ustası",          desc:"Toplamda 3 kez lanet tetikle.",               check: s => s.totalCurses >= 3 },
  { id: "chance_streak",  tier:"gold",   icon:"🎰", name:"Şans Tanrısı",          desc:"Arka arkaya 3 şans kartı kazan.",             check: s => s.chanceStreak >= 3 },
  { id: "no_curse",       tier:"silver", icon:"🕊️", name:"Lanet Yok",            desc:"Bir oyunu lanet tetiklemeden bitir.",         check: s => !s.cursedEver },
  { id: "sabir_imtihani",tier:"platinum",icon:"⏳", name:"Sabır İmtihanı",       desc:"15 yıl boyunca lanet tetiklemeden hayatta kal.", check: s => !s.cursedEver && s.year>=15 },

  // ── PLATİN ──
  { id: "legend",         tier:"platinum", icon:"✨", name:"Efsane Sadrazam",     desc:"20 yıl hayatta kal.",                         check: s => s.year >= 20 },
  { id: "all_chars",      tier:"platinum", icon:"🗺️", name:"Osmanlı Ansiklopedisi",desc:"Tek oyunda tüm 26 karakteri gör.",           check: s => (s.seenCharacters||new Set()).size >= 26 },
  { id: "no_low_stat",    tier:"platinum", icon:"🔱", name:"Sıfır Kriz",          desc:"Hiçbir stat 15'in altına inmeden 10 yıl.",   check: s => s.year>=10 && s.minAnyStat>=15 },
  { id: "pasa_mode",      tier:"platinum", icon:"📜", name:"Paşadan Sultana",     desc:"Paşalık modunda Sadrazam ol ve 5 yıl devam et.", check: s => s.isPasaMode && s.pasaPromoted && s.year>=8 },
  { id: "item_collector", tier:"platinum", icon:"🎭", name:"Koleksiyoncu",        desc:"Tek oyunda 5 farklı item topla.",             check: s => s.uniqueItemsCollected >= 5 },

  // ── GİZLİ ──
  { id: "rival_five",     tier:"secret",   icon:"🗡️", name:"Rakibin Rakibi",     desc:"Rakip Vezir ile 5 kez yüzleş.",              check: s => (s.characterMemory?.["8-rakip-vezir"]?.left||0)+(s.characterMemory?.["8-rakip-vezir"]?.right||0) >= 5 },
  { id: "zimmet",         tier:"secret",   icon:"💸", name:"Zimmet Şüphelisi",    desc:"Zimmet suçuyla öl.",                          check: s => s.deathReason?.includes("zimmet") },
  { id: "valide_loyal",   tier:"secret",   icon:"💫", name:"Valide'nin Gözdesi",  desc:"Tek oyunda Valide Sultan'ın tüm isteklerini kabul et.", check: s => (s.characterMemory?.["5-valide-sultan"]?.left||0)===0 && (s.characterMemory?.["5-valide-sultan"]?.right||0)>=3 },
  { id: "diplomat",       tier:"secret",   icon:"🤝", name:"Zekice Elçi",         desc:"Yabancı Elçi ile 4+ kez müzakere yap.",      check: s => (s.characterMemory?.["7-yabanci-elci"]?.left||0)+(s.characterMemory?.["7-yabanci-elci"]?.right||0) >= 4 },
  { id: "deli_dervis_right", tier:"secret", icon:"🔮", name:"Kehanet Tuttu",      desc:"Deli Derviş'i 2 kez ziyaret et.",            check: s => (s.characterMemory?.["25-deli_dervis"]?.left||0)+(s.characterMemory?.["25-deli_dervis"]?.right||0) >= 2 },
];

// Cross-game tracking için localStorage yardımcıları
function getCrossGameData() {
  try { return JSON.parse(localStorage.getItem('sadrazam_crossgame') || '{}'); } catch(e) { return {}; }
}
function saveCrossGameData(d) {
  try { localStorage.setItem('sadrazam_crossgame', JSON.stringify(d)); } catch(e) {}
}
function updateCrossGame(updates) {
  const d = getCrossGameData();
  for (const [k,v] of Object.entries(updates)) {
    if (Array.isArray(v)) {
      d[k] = [...new Set([...(d[k]||[]), ...v])];
    } else if (typeof v === 'number') {
      d[k] = (d[k]||0) + v;
    } else {
      d[k] = v;
    }
  }
  saveCrossGameData(d);
}

// ── Görev Havuzu ──────────────────────────────────────────────────
const MISSION_POOL = [
  {
    id: "denge_ustasi",
    name: "Denge Ustası",
    desc: "Tüm statların aynı anda 40-65 arasında olması",
    check: () => Object.values(stats).every(v => v >= 40 && v <= 65)
  },
  {
    id: "yeniceri_dostu",
    name: "Yeniçeri Dostu",
    desc: "Yeniçeri kartlarına 3 kez sağ cevap ver",
    check: () => (characterMemory["2-yeniceri"] || {right:0}).right >= 3
  },
  {
    id: "hazine_bekci",
    name: "Hazine Bekçisi",
    desc: "Hazineyi 5 yıl boyunca 40+ tutmak",
    check: () => year >= 5 && stats.hazine >= 40
  },
  {
    id: "sultanin_gozu",
    name: "Sultanın Gözü",
    desc: "Sultan kartlarına 3 kez evet de",
    check: () => (characterMemory["1-sultan"] || {right:0}).right >= 3
  },
  {
    id: "halkin_sesi",
    name: "Halkın Sesi",
    desc: "Halk fraksiyonu kartlarına 4 kez sağ cevap ver",
    check: () => (factionFavors.halk || 0) >= 4
  },
  {
    id: "dini_lider",
    name: "Dini Lider",
    desc: "Ulema'yı 60+ tutmak",
    check: () => stats.ulema >= 60
  },
  {
    id: "baris_elcisi",
    name: "Barış Elçisi",
    desc: "Lanet sistemini hiç tetiklememek",
    check: () => !cursedEver
  },
  {
    id: "bilge_sadrazam",
    name: "Bilge Sadrazam",
    desc: "Soruştur butonunu 3 kez kullan",
    check: () => traitorInvestigated >= 3
  }
];

let activeMissions = [];
let completedMissions = [];

function initMissions() {
  const pool = [...MISSION_POOL];
  activeMissions = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    activeMissions.push({ ...pool[idx], completed: false });
    pool.splice(idx, 1);
  }
  completedMissions = [];
  updateMissionBar();
}

function checkMissions() {
  activeMissions.forEach((m, i) => {
    if (!m.completed && m.check()) {
      m.completed = true;
      completedMissions.push(m);
      updateMissionSlot(i, true);
      Haptics.missionComplete();
      if (window.playAchievement) setTimeout(playAchievement, 200);
    }
  });
}

function updateMissionBar() {
  activeMissions.forEach((m, i) => updateMissionSlot(i, m.completed));
}

function updateMissionSlot(i, completed) {
  const slot = document.getElementById("mission-slot-" + i);
  if (!slot) return;
  const check = slot.querySelector(".mission-check");
  if (completed) {
    slot.classList.add("completed");
    if (check) check.textContent = "✓";
  } else {
    if (check) check.textContent = "?";
  }
}

function getMissionSummary() {
  return completedMissions.length + "/" + activeMissions.length + " gizli görev tamamlandı";
}

function getMissionDetails() {
  return activeMissions.map(m => ({
    name: m.name,
    completed: m.completed
  }));
}

// ── State ─────────────────────────────────────────────────────────
let allCards = [];
let stats = { saray: 50, "yeniçeri": 50, ulema: 50, hazine: 50 };
let year = 1;
let cardsPlayed = 0;
let activeFlags = {};
let isGameOver = false;
let playCounts = {};
let forcedQueue = [];
let scheduledCards = [];
let characterMemory = {};
let activeArcs = {};
let triggeredArcs = {};
let sultanSabir = 50;
let selectedSultan = null;
let selectedAdvisors = [];
let isPasaMode = false;
let pasaPromoted = false;
let currentTitle = "SADRAZAM";

// Yeni özellik state'leri
let isNight = false;
let nightCardCount = 0;
// Achievement tracking
let seenCharacters = new Set();
let receivedLetters = 0;
let chanceCardsPlayed = 0;
let chanceStreak = 0;
let chainsCompleted = 0;
let warVictory = false;
let itemsUsed = 0;
let uniqueItemsCollected = new Set();
let minHazine = 100;
let maxSaray = 0;
let maxHazine = 0;
let minAnyStat = 100;
let consecutiveSameDir = 0;
let lastDir = null;
let cursedEver = false;
let hiddenTraitor = null;
let traitorInvestigated = 0;
let traitorRevealed = false;
let factionFavors = { saray: 0, ordu: 0, din: 0, halk: 0 };
let factionPressureSent = { saray: false, ordu: false, din: false, halk: false };
let hicriYear = 927;
let hicriMonth = 0; // 0-11
let deathCharacterKey = null;
let isInvestigating = false;
let originalCardText = "";
let dangerPulseActive = false;
let letterCardsPending = [];
let currentDeathTitle = "SADRAZAMLIK SONA ERDİ";

// ── Item Sistemi ──────────────────────────────────────────────────
const ITEMS = {
  altin_muhur:    { icon: '<img src="assets/icons/item-altin-muhur.png">',    name: "Altın Mühür",    desc: "Sonraki hazine cezasını sıfırla",  effect: "block_hazine" },
  sultan_ferman:  { icon: '<img src="assets/icons/item-sultan-ferman.png">',  name: "Sultan Fermanı", desc: "Sonraki saray cezasını sıfırla",   effect: "block_saray" },
  yeniceri_nisan: { icon: '<img src="assets/icons/item-yeniceri-nisan.png">', name: "Yeniçeri Nişanı",desc: "Sonraki ordu cezasını sıfırla",    effect: "block_yeniceri" },
  sifa_otu:       { icon: '<img src="assets/icons/item-sifa-otu.png">',       name: "Şifa Otu",       desc: "Herhangi 1 stat +20",              effect: "heal_20" },
  casus_maskesi:  { icon: '<img src="assets/icons/item-casus-maskesi.png">', name: "Casus Maskesi",  desc: "Bir sonraki kartı atla",            effect: "skip_card" },
  dervis_muska:   { icon: '<img src="assets/icons/item-dervis-muska.png">',  name: "Derviş Muskası", desc: "Sultan sabrı değişmez (1 kart)",   effect: "block_sabir" },
};

let playerItems = [null, null, null];
let activeItemIndex = null;
let pendingItemEffect = null;

// ── DOM ───────────────────────────────────────────────────────────
const card        = document.getElementById("card");
const cardImage   = document.getElementById("card-image");
const charName    = document.getElementById("card-char-name");
const cardText    = document.getElementById("card-text");
const choiceLeft  = document.getElementById("choice-left");
const choiceRight = document.getElementById("choice-right");
const yearLabel   = document.getElementById("year-label");
const overlayL    = document.getElementById("card-overlay-left");
const overlayR    = document.getElementById("card-overlay-right");
const gameoverScreen = document.getElementById("gameover-screen");
const gameoverReason = document.getElementById("gameover-reason");
const gameoverYear   = document.getElementById("gameover-year");
const titleLabel     = document.getElementById("title-label");

const introScreen      = document.getElementById("intro-screen");
const howtoScreen      = document.getElementById("howto-screen");
const gameScreen       = document.getElementById("game");
const sultanScreen     = document.getElementById("sultan-screen");
const advisorScreen    = document.getElementById("advisor-screen");
const negotiationPanel = document.getElementById("negotiation-panel");
const cardChoices      = document.getElementById("card-choices");

// ── Ekran Geçişleri ───────────────────────────────────────────────
document.getElementById("btn-start").addEventListener("click", () => {
  isPasaMode = false;
  introScreen.style.display = "none";
  showSultanScreen();
});

document.getElementById("btn-pasa-mode").addEventListener("click", () => {
  isPasaMode = true;
  introScreen.style.display = "none";
  showSultanScreen();
});

document.getElementById("btn-howto").addEventListener("click", () => {
  introScreen.style.display = "none";
  howtoScreen.classList.add("visible");
});

document.getElementById("btn-play-now").addEventListener("click", () => {
  howtoScreen.classList.remove("visible");
  showSultanScreen();
});

document.getElementById("restart-btn").addEventListener("click", restartGame);

// ── Sultan Seçim Ekranı ───────────────────────────────────────────
function showSultanScreen() {
  sultanScreen.classList.remove("hidden");
  const grid = document.getElementById("sultan-grid");
  grid.innerHTML = "";
  SULTANS.forEach(s => {
    const btn = document.createElement("div");
    btn.className = "sultan-card";
    btn.innerHTML = `
      <div class="sc-name">${s.name}</div>
      <div class="sc-desc">${s.desc}</div>
      <div class="sc-stats">
        <span>👑 ${s.stats.saray}</span>
        <span>⚔️ ${s.stats["yeniçeri"]}</span>
        <span>🕌 ${s.stats.ulema}</span>
        <span>💰 ${s.stats.hazine}</span>
      </div>
    `;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sultan-card").forEach(el => el.classList.remove("selected"));
      btn.classList.add("selected");
      selectedSultan = s;
    });
    grid.appendChild(btn);
  });

  document.getElementById("btn-sultan-confirm").onclick = () => {
    if (!selectedSultan) { alert("Lütfen bir sultan seçin."); return; }
    sultanScreen.classList.add("hidden");
    showAdvisorScreen();
  };
}

// ── Danışman Seçim Ekranı ─────────────────────────────────────────
function showAdvisorScreen() {
  selectedAdvisors = [];
  advisorScreen.classList.remove("hidden");
  const grid = document.getElementById("advisor-grid");
  grid.innerHTML = "";
  ADVISORS.forEach(a => {
    const btn = document.createElement("div");
    btn.className = "advisor-card";
    btn.innerHTML = `
      <div class="ac-icon">${a.icon}</div>
      <div>
        <div class="ac-name">${a.name}</div>
        <div class="ac-title">${a.title}</div>
        <div class="ac-desc">${a.desc}</div>
      </div>
    `;
    btn.addEventListener("click", () => {
      if (btn.classList.contains("selected")) {
        btn.classList.remove("selected");
        selectedAdvisors = selectedAdvisors.filter(x => x.id !== a.id);
      } else {
        if (selectedAdvisors.length >= 2) { alert("En fazla 2 danışman seçebilirsiniz."); return; }
        btn.classList.add("selected");
        selectedAdvisors.push(a);
      }
      document.getElementById("advisor-count").textContent = selectedAdvisors.length + "/2 seçildi";
    });
    grid.appendChild(btn);
  });

  document.getElementById("btn-advisor-confirm").onclick = () => {
    if (selectedAdvisors.length !== 2) { alert("Lütfen tam olarak 2 danışman seçin."); return; }
    advisorScreen.classList.add("hidden");
    startGame();
  };
}

// ── Oyunu Başlat ──────────────────────────────────────────────────
function startGame() {
  stats = { ...selectedSultan.stats };
  sultanSabir = selectedSultan.sultanSabir;

  if (isPasaMode) {
    stats = { saray: 35, "yeniçeri": 35, ulema: 35, hazine: 40 };
    currentTitle = "PAŞA";
    pasaPromoted = false;
  } else {
    currentTitle = "SADRAZAM";
    pasaPromoted = true;
  }

  year = 1;
  cardsPlayed = 0;
  activeFlags = {};
  isGameOver = false;
  playCounts = {};
  forcedQueue = [];
  scheduledCards = [];
  characterMemory = {};
  activeArcs = {};
  triggeredArcs = {};
  isNight = false;
  nightCardCount = 0;
  consecutiveSameDir = 0;
  lastDir = null;
  cursedEver = false;
  factionFavors = { saray: 0, ordu: 0, din: 0, halk: 0 };
  factionPressureSent = { saray: false, ordu: false, din: false, halk: false };
  traitorInvestigated = 0;
  traitorRevealed = false;
  deathCharacterKey = null;
  isInvestigating = false;
  letterCardsPending = [];
  dangerPulseActive = false;
  playerItems = [null, null, null];
  activeItemIndex = null;
  pendingItemEffect = null;
  updateItemBar();
  // Achievement tracking sıfırla
  seenCharacters = new Set();
  receivedLetters = 0;
  chanceCardsPlayed = 0;
  chanceStreak = 0;
  chainsCompleted = 0;
  warVictory = false;
  itemsUsed = 0;
  uniqueItemsCollected = new Set();
  minHazine = 100;
  maxSaray = 0;
  maxHazine = 0;
  minAnyStat = 100;

  // Hicri takvim başlangıcı
  const sultanId = selectedSultan ? selectedSultan.id : "kanuni";
  hicriYear = SULTAN_HICRI_START[sultanId] || 927;
  hicriMonth = 0;

  // Gizli hain seç
  const characterKeys = ["2-yeniceri", "3-Seyhulislam", "4. Defterdar",
    "5. Valide Sultan", "6. Kaptan-ı Derya", "7. Yabancı Elçi",
    "8. Rakip Vezir", "10-hekimbasi", "11-sipahi_agasi",
    "12-saray_sairi", "13-buyuk_tuccar", "14-casuslar_basi",
    "15-halk_temsilcisi", "16-saray_agasi", "22-yahudi_bankaci",
    "24-korsanbasi", "25-deli_dervis", "26-genc_pasa"];
  hiddenTraitor = characterKeys[Math.floor(Math.random() * characterKeys.length)];

  if (titleLabel) titleLabel.textContent = currentTitle;

  // Remove night mode
  gameScreen.classList.remove("night-mode");

  updateYearLabel();
  updateStatUI();
  updateDynamicSubtitle();
  ensureFateBar();
  initMissions();

  gameScreen.classList.remove("hidden");

  // Tutorial — ilk oyunda göster
  if (!localStorage.getItem('sadrazam_tutorial_done')) {
    showTutorial(() => { dealNext(); });
  } else {
    dealNext();
  }

  startAmbientMusic();
}

// ── TUTORIAL ──────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    stat: "saray",
    icon: "assets/icons/icon-saray.png",
    title: "Saray",
    desc: "Sultanın sana güveni. Sıfırlanırsa idam, yüze çıkarsa tehdit."
  },
  {
    stat: "yeniceri",
    icon: "assets/icons/icon-ordu.png",
    title: "Ordu",
    desc: "Yeniçerilerin sadakati. Zayıflarsa düşman, güçlenirse isyan."
  },
  {
    stat: "ulema",
    icon: "assets/icons/icon-ulema.png",
    title: "Ulema",
    desc: "Dini otoritenin desteği. Yitirirsen linç, çok güçlenirse bağımsızlaşır."
  },
  {
    stat: "hazine",
    icon: "assets/icons/icon-hazine.png",
    title: "Hazine",
    desc: "Devlet kasası. Boşalırsa iflas, taşarsa zimmet suçlaması."
  },
  {
    stat: null,
    icon: null,
    title: "Nasıl Oynanır?",
    desc: "Kartları sola kaydır → Hayır. Sağa kaydır → Evet.\nYa da klavyede ← → tuşlarını kullan.\nDört gücü dengede tut — ne kadar uzun kalabilirsin?"
  }
];

function showTutorial(onDone) {
  let step = 0;
  const overlay = document.createElement('div');
  overlay.id = 'tutorial-overlay';

  function renderStep() {
    const s = TUTORIAL_STEPS[step];
    const isLast = step === TUTORIAL_STEPS.length - 1;
    overlay.innerHTML = `
      <div id="tutorial-box">
        ${s.icon ? `<img src="${s.icon}" id="tutorial-icon" alt="${s.title}">` : '<div id="tutorial-icon-placeholder">✦</div>'}
        <div id="tutorial-title">${s.title}</div>
        <div id="tutorial-desc">${s.desc.replace(/\n/g,'<br>')}</div>
        <div id="tutorial-progress">${TUTORIAL_STEPS.map((_,i) => `<span class="${i===step?'active':''}"></span>`).join('')}</div>
        <button id="tutorial-next">${isLast ? 'BAŞLA' : 'İLERİ →'}</button>
        ${s.stat ? `<div id="tutorial-stat-highlight" data-stat="${s.stat}"></div>` : ''}
      </div>`;

    // Stat barını highlight et
    if (s.stat) {
      const fill = document.querySelector(`.stat[data-stat="${s.stat}"]`);
      if (fill) fill.classList.add('tutorial-highlight');
    }

    overlay.querySelector('#tutorial-next').onclick = () => {
      if (s.stat) {
        const fill = document.querySelector(`.stat[data-stat="${s.stat}"]`);
        if (fill) fill.classList.remove('tutorial-highlight');
      }
      step++;
      if (step >= TUTORIAL_STEPS.length) {
        overlay.remove();
        localStorage.setItem('sadrazam_tutorial_done', '1');
        onDone();
      } else {
        renderStep();
      }
    };
  }

  document.body.appendChild(overlay);
  renderStep();
}

// ── AMBIENT MÜZİK ─────────────────────────────────────────────────
let ambientCtx = null;
let ambientNodes = [];
let ambientRunning = false;

function startAmbientMusic() {
  if (ambientRunning) return;
  try {
    ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
    ambientRunning = true;
    // iOS/Chrome: context suspend'den çık
    const resumeAndPlay = () => {
      ambientCtx.resume().then(() => playAmbientLayer());
    };
    if (ambientCtx.state === 'suspended') {
      resumeAndPlay();
    } else {
      playAmbientLayer();
    }
  } catch(e) {}
}

function playAmbientLayer() {
  if (!ambientCtx || !ambientRunning) return;
  if (ambientCtx.state === 'suspended') { ambientCtx.resume(); return; }

  const now = ambientCtx.currentTime;

  // Drone — ney benzeri, güçlendirilmiş
  const osc1 = ambientCtx.createOscillator();
  const gain1 = ambientCtx.createGain();
  const filter1 = ambientCtx.createBiquadFilter();
  osc1.type = 'sine';
  osc1.frequency.value = isNight ? 110 : 123;
  filter1.type = 'lowpass';
  filter1.frequency.value = 600;
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.12, now + 1.5); // fade in
  osc1.connect(filter1);
  filter1.connect(gain1);
  gain1.connect(ambientCtx.destination);
  osc1.start(now);

  // Harmonik tremolo
  const osc2 = ambientCtx.createOscillator();
  const gain2 = ambientCtx.createGain();
  const lfo = ambientCtx.createOscillator();
  const lfoGain = ambientCtx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.value = isNight ? 165 : 185;
  lfo.frequency.value = 0.3;
  lfoGain.gain.value = 0.03;
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.06, now + 2);
  lfo.connect(lfoGain);
  lfoGain.connect(gain2.gain);
  osc2.connect(gain2);
  gain2.connect(ambientCtx.destination);
  osc2.start(now);
  lfo.start(now);

  // Çok hafif yüksek frekans (saray atmosferi)
  const osc3 = ambientCtx.createOscillator();
  const gain3 = ambientCtx.createGain();
  osc3.type = 'sine';
  osc3.frequency.value = isNight ? 330 : 370;
  gain3.gain.setValueAtTime(0, now);
  gain3.gain.linearRampToValueAtTime(0.025, now + 3);
  osc3.connect(gain3);
  gain3.connect(ambientCtx.destination);
  osc3.start(now);

  ambientNodes = [osc1, osc2, osc3, lfo];

  // Fade out öncesinde yenile
  const duration = 9000;
  setTimeout(() => {
    ambientNodes.forEach(n => {
      try {
        if (ambientCtx && gain1) {
          const t = ambientCtx.currentTime;
          gain1.gain.linearRampToValueAtTime(0, t + 1);
          gain2.gain.linearRampToValueAtTime(0, t + 1);
          gain3.gain.linearRampToValueAtTime(0, t + 1);
        }
        setTimeout(() => { try { n.stop(); } catch(e) {} }, 1200);
      } catch(e) {}
    });
    ambientNodes = [];
    if (ambientRunning && !isGameOver) setTimeout(playAmbientLayer, 300);
  }, duration);
}

function stopAmbientMusic() {
  ambientRunning = false;
  ambientNodes.forEach(n => { try { n.stop(); } catch(e) {} });
  ambientNodes = [];
}

// ── Boot ──────────────────────────────────────────────────────────
fetch("data/cards.json")
  .then(r => r.json())
  .then(data => {
    allCards = data.cards;
    checkResumeAvailable();
  });

// ── SAVE / RESUME ─────────────────────────────────────────────────
function saveGameState() {
  if (!selectedSultan || isGameOver) return;
  try {
    const state = {
      stats, year, cardsPlayed, hicriYear, hicriMonth,
      activeFlags: Object.keys(activeFlags),
      isNight, sultanSabir, currentTitle, isPasaMode, pasaPromoted,
      playerItems, selectedSultanId: selectedSultan?.id,
      selectedAdvisorIds: selectedAdvisors.map(a => a.id),
      characterMemory, factionFavors, factionPressureSent,
      playCounts, cursedEver, traitorInvestigated, hiddenTraitor,
      scheduledCards, forcedQueueIds: forcedQueue.map(c => c.id),
      activeMissions: activeMissions.map(m => ({...m, check: undefined})),
      completedMissionIds: completedMissions.map(m => m.id),
      v: 2
    };
    localStorage.setItem('sadrazam_save', JSON.stringify(state));
  } catch(e) {}
}

function clearSave() {
  localStorage.removeItem('sadrazam_save');
}

function checkResumeAvailable() {
  const raw = localStorage.getItem('sadrazam_save');
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    if (!s.v || s.v < 2) { clearSave(); return; }
    // Resume banner göster
    const banner = document.createElement('div');
    banner.id = 'resume-banner';
    banner.innerHTML = `
      <div id="resume-content">
        <div id="resume-text">Kayıtlı oyun: <strong>${s.year}. Yıl · ${HICRI_MONTHS[s.hicriMonth % 12]} ${s.hicriYear}</strong></div>
        <div id="resume-btns">
          <button id="resume-btn">DEVAM ET</button>
          <button id="resume-discard">Yeni Oyun</button>
        </div>
      </div>`;
    document.body.appendChild(banner);
    document.getElementById('resume-btn').onclick = () => {
      banner.remove();
      // Tüm seçim ekranlarını gizle, direkt oyuna geç
      introScreen.style.display = "none";
      const sultanSc = document.getElementById("sultan-screen");
      const advisorSc = document.getElementById("advisor-screen");
      if (sultanSc) sultanSc.classList.add("hidden");
      if (advisorSc) advisorSc.classList.add("hidden");
      loadGameState(s);
      startAmbientMusic();
    };
    document.getElementById('resume-discard').onclick = () => {
      clearSave();
      banner.remove();
    };
  } catch(e) { clearSave(); }
}

function loadGameState(s) {
  // Sultan ve danışmanları geri yükle
  selectedSultan = SULTANS.find(su => su.id === s.selectedSultanId) || SULTANS[0];
  selectedAdvisors = (s.selectedAdvisorIds || []).map(id => ADVISORS.find(a => a.id === id)).filter(Boolean);

  stats = s.stats;
  year = s.year;
  cardsPlayed = s.cardsPlayed;
  hicriYear = s.hicriYear;
  hicriMonth = s.hicriMonth;
  activeFlags = {};
  (s.activeFlags || []).forEach(f => activeFlags[f] = true);
  isNight = s.isNight;
  sultanSabir = s.sultanSabir;
  currentTitle = s.currentTitle || "SADRAZAM";
  isPasaMode = s.isPasaMode;
  pasaPromoted = s.pasaPromoted;
  playerItems = s.playerItems || [null,null,null];
  characterMemory = s.characterMemory || {};
  factionFavors = s.factionFavors || {saray:0,ordu:0,din:0,halk:0};
  factionPressureSent = s.factionPressureSent || {saray:false,ordu:false,din:false,halk:false};
  playCounts = s.playCounts || {};
  cursedEver = s.cursedEver;
  traitorInvestigated = s.traitorInvestigated;
  hiddenTraitor = s.hiddenTraitor;
  scheduledCards = s.scheduledCards || [];
  forcedQueue = (s.forcedQueueIds || []).map(id => allCards.find(c => c.id === id)).filter(Boolean);
  isGameOver = false;
  activeArcs = {};
  triggeredArcs = {};
  deathCharacterKey = null;
  isInvestigating = false;
  dangerPulseActive = false;

  // Missions
  activeMissions = (s.activeMissions || []).map(m => {
    const poolItem = MISSION_POOL.find(p => p.id === m.id);
    return poolItem ? { ...poolItem, completed: m.completed } : null;
  }).filter(Boolean);
  completedMissions = activeMissions.filter(m => m.completed);

  if (titleLabel) titleLabel.textContent = currentTitle;
  if (isNight) gameScreen.classList.add("night-mode");
  else gameScreen.classList.remove("night-mode");

  updateItemBar();
  updateYearLabel();
  updateStatUI();
  updateDynamicSubtitle();
  ensureFateBar();
  updateMissionBar();
  // Tutorial atlansın — devam ediyoruz
  localStorage.setItem('sadrazam_tutorial_done', '1');
  gameScreen.classList.remove("hidden");
  dealNext();
}

// ── Osmanlı Takvimi ───────────────────────────────────────────────
function updateYearLabel() {
  if (!yearLabel) return;
  const monthName = HICRI_MONTHS[hicriMonth % 12];
  yearLabel.textContent = `${monthName} ${hicriYear}`;
}

function advanceHicriMonth() {
  hicriMonth++;
  if (hicriMonth >= 12) {
    hicriMonth = 0;
    hicriYear++;
  }
  updateYearLabel();
}

// ── Dinamik Subtitle ──────────────────────────────────────────────
function updateDynamicSubtitle() {
  let subtitle = "";

  if (stats.hazine < 25)      subtitle = "Hazinenin Dibini Gördüğümüz Yıl";
  else if (stats["yeniçeri"] > 75) subtitle = "Orduların Gözde Sadrazamı";
  else if (stats.saray < 25)  subtitle = "Gözden Düştüğümüz Günler";
  else if (stats.ulema > 75)  subtitle = "Dinin Gölgesinde Saltanat";
  else if (stats.hazine > 75) subtitle = "Bereketin Yılı";
  else {
    const idx = (year + cardsPlayed) % DYNAMIC_SUBTITLES.length;
    subtitle = DYNAMIC_SUBTITLES[idx];
  }

  let el = document.getElementById("dynamic-subtitle");
  if (!el) {
    el = document.createElement("div");
    el.id = "dynamic-subtitle";
    const headerRow = document.getElementById("header-row");
    if (headerRow) headerRow.appendChild(el);
  }
  el.textContent = subtitle;
}

// ── Fate Bar (Kader İpleri) ───────────────────────────────────────
function ensureFateBar() {
  if (!document.getElementById("fate-bar")) {
    const fb = document.createElement("div");
    fb.id = "fate-bar";
    const statsBar = document.getElementById("stats-bar");
    if (statsBar && statsBar.parentNode) {
      statsBar.parentNode.insertBefore(fb, statsBar.nextSibling);
    }
  }
  updateFateBar();
}

function updateFateBar() {
  const fb = document.getElementById("fate-bar");
  if (!fb) return;
  fb.innerHTML = "";
  if (!scheduledCards.length) return;

  // Group by cardId
  const groups = {};
  scheduledCards.forEach(sc => {
    const c = allCards.find(x => x.id === sc.cardId);
    const label = c ? (c.character_name || sc.cardId) : sc.cardId;
    if (!groups[label]) groups[label] = 0;
    groups[label]++;
  });

  scheduledCards.forEach(sc => {
    const c = allCards.find(x => x.id === sc.cardId);
    const remaining = Math.max(0, sc.afterCardsPlayed - cardsPlayed);
    const chip = document.createElement("div");
    chip.className = "fate-thread";
    chip.textContent = `⧖ ${remaining} kart`;
    // Bilinmezlik korunuyor — karakter adı gösterilmez
    chip.title = `Bir kararının yankısı ${remaining} kart içinde gelecek…`;
    chip.setAttribute('data-tooltip', `Bir kararının yankısı ${remaining} kart içinde gelecek…`);
    chip.addEventListener('click', () => showFateTooltip(chip));
    fb.appendChild(chip);
  });
}

function showFateTooltip(chip) {
  const existing = document.getElementById('fate-tooltip');
  if (existing) { existing.remove(); return; }
  const tip = document.createElement('div');
  tip.id = 'fate-tooltip';
  tip.textContent = chip.getAttribute('data-tooltip');
  chip.appendChild(tip);
  setTimeout(() => tip.remove(), 2500);
}

// ── Deck ──────────────────────────────────────────────────────────
function getEventCards() {
  return allCards.filter(c => c.is_event);
}

function getNextCard() {
  checkScheduledCards();
  if (forcedQueue.length) return forcedQueue.shift();

  // Arc kontrolü
  for (const [arcId, idx] of Object.entries(activeArcs)) {
    const arcCards = ARCS[arcId];
    if (arcCards && idx < arcCards.length) {
      const cardId = arcCards[idx];
      activeArcs[arcId]++;
      const arcCard = allCards.find(c => c.id === cardId);
      if (arcCard) return arcCard;
    } else {
      delete activeArcs[arcId];
    }
  }

  let eligible = getEligible();
  if (!eligible.length) { playCounts = {}; eligible = getEligible(); }
  if (!eligible.length) return null;
  return weightedPick(eligible);
}

function checkScheduledCards() {
  const due = scheduledCards.filter(sc => cardsPlayed >= sc.afterCardsPlayed);
  scheduledCards = scheduledCards.filter(sc => cardsPlayed < sc.afterCardsPlayed);
  due.forEach(sc => {
    const c = allCards.find(x => x.id === sc.cardId);
    if (c) forcedQueue.unshift(c);
  });
  updateFateBar();
}

function getEligible() {
  return allCards.filter(c => {
    if (c.is_pasa_terfi && (!isPasaMode || pasaPromoted)) return false;
    if (c.is_event) return false;
    if (c.arc_id) return false;
    if (c.is_traitor_reveal) return false;
    if (c.type === "letter") return false;
    // Faction baskı kartları sadece tetiklenince
    if (c.required_faction_pressure && !activeFlags["faction_pressure_" + c.required_faction_pressure]) return false;
    // weight:1 özel kartlar arc dışında çıkmasın
    if (c.weight === 1 && !c.arc_id) return false;
    // Gece kartları gece önceliği (ama hepsi karışabilir)
    if (c.time === "night" && !isNight) return false;
    return passesFilters(c);
  }).map(c => {
    const times = playCounts[c.id] || 0;
    if (times > 0) {
      return { ...c, weight: Math.max(1, Math.floor((c.weight || 10) / (times * 2))) };
    }
    return c;
  });
}

function passesFilters(c) {
  if ((c.min_year || 1) > year) return false;
  if ((c.max_year || 9999) < year) return false;
  for (const f of (c.required_flags || [])) if (!activeFlags[f]) return false;
  for (const f of (c.excluded_flags || [])) if (activeFlags[f]) return false;
  for (const [stat, cond] of Object.entries(c.stat_conditions || {})) {
    const val = stats[stat] ?? 50;
    if (cond.min !== undefined && val < cond.min) return false;
    if (cond.max !== undefined && val > cond.max) return false;
  }
  if (c.requires_memory) {
    const mem = characterMemory[c.requires_memory.character];
    if (!mem) return false;
    if (mem.last !== c.requires_memory.decision) return false;
  }
  return true;
}

function weightedPick(cards) {
  const total = cards.reduce((s, c) => s + (c.weight || 10), 0);
  let roll = Math.random() * total;
  for (const c of cards) {
    roll -= (c.weight || 10);
    if (roll <= 0) { playCounts[c.id] = (playCounts[c.id] || 0) + 1; return c; }
  }
  const last = cards[cards.length - 1];
  playCounts[last.id] = (playCounts[last.id] || 0) + 1;
  return last;
}

// ── Card Display ──────────────────────────────────────────────────
let currentCard = null;

function dealNext() {
  if (isGameOver) return;

  // Gece modu toggle (her 3 kartta)
  nightCardCount++;
  if (nightCardCount % 3 === 0) {
    isNight = !isNight;
    if (isNight) {
      gameScreen.classList.add("night-mode");
    } else {
      gameScreen.classList.remove("night-mode");
    }
  }

  const c = getNextCard();
  if (!c) return;
  currentCard = c;
  isInvestigating = false;

  // Müzakere kartı
  if (c.type === "negotiation") {
    showNegotiationCard(c);
    return;
  }

  // Mektup kartı
  if (c.type === "letter") {
    showLetterCard(c);
    return;
  }

  // Şans kartı
  if (c.type === "chance") {
    hideNegotiationPanel();
    const key = c.character || "";
    cardImage.src = "assets/characters/" + encodeURIComponent(key + ".jpg");
    cardImage.onerror = () => { cardImage.src = ""; };
    charName.textContent = c.character_name || "";
    cardText.textContent = c.text || "";
    choiceLeft.style.opacity = "0";
    choiceRight.style.opacity = "0";
    overlayL.style.opacity = "0";
    overlayR.style.opacity = "0";
    card.classList.remove("letter-card");
    card.classList.add("no-swipe");
    const invBtn = document.getElementById("investigate-btn");
    if (invBtn) invBtn.classList.add("hidden");
    animateCardIn();
    showChanceCard(c);
    return;
  }

  hideNegotiationPanel();

  const key = c.character || "";
  deathCharacterKey = key;

  const imgName = key + ".jpg";
  const imgPath = "assets/characters/" + encodeURIComponent(imgName);
  // Preload ile flash önle
  const preload = new Image();
  preload.onload = () => { cardImage.src = imgPath; };
  preload.onerror = () => { cardImage.src = ""; };
  preload.src = imgPath;

  // Gizli hain hint
  let displayText = c.text || "";
  if (key === hiddenTraitor && !traitorRevealed) {
    const mem = characterMemory[key] || {};
    const totalMem = (mem.left || 0) + (mem.right || 0);
    if (totalMem > 0 && totalMem % 7 === 0) {
      displayText += " — gözleri anlık bir şeye takıldı.";
    }
  }

  charName.textContent = c.character_name || "";
  cardText.textContent = displayText;
  choiceLeft.textContent  = c.left_text  || "Hayır";
  choiceRight.textContent = c.right_text || "Evet";

  choiceLeft.style.opacity  = "0";
  choiceRight.style.opacity = "0";
  overlayL.style.opacity = "0";
  overlayR.style.opacity = "0";

  // Mektup stili kaldır
  card.classList.remove("letter-card");

  // Soruşturma butonu
  setupInvestigateBtn(c, displayText);

  // Ses
  if (isNight || c.time === "night") {
    if (window.playNightCard) playNightCard();
  } else {
    if (window.playCardDraw) playCardDraw();
  }
  if (c.sound === "veba" && window.playEvent_veba) playEvent_veba();
  if (c.sound === "savas" && window.playEvent_savas) playEvent_savas();
  if (c.sound === "hasat" && window.playEvent_hasat) playEvent_hasat();
  if (c.character === "14-casuslar_basi" && c.text && c.text.includes("mektup") && window.playLetterArrival) playLetterArrival();

  // Kriz kartı haptiği
  if (c.is_crisis) Haptics.crisisCard();

  animateCardIn();
  updateDynamicSubtitle();
}

function setupInvestigateBtn(c, displayText) {
  let btn = document.getElementById("investigate-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "investigate-btn";
    btn.textContent = "🔍";
    btn.title = "Soruştur";
    card.appendChild(btn);
  }

  if (c.investigate_text) {
    btn.classList.remove("hidden");
    btn.onclick = () => {
      if (isInvestigating) {
        // Geri dön
        cardText.textContent = displayText;
        btn.textContent = "🔍";
        isInvestigating = false;
      } else {
        // Soruştur
        cardText.textContent = c.investigate_text;
        btn.textContent = "↩";
        isInvestigating = true;
        // Traitor sayacı
        if (c.character === hiddenTraitor || c.character_name === hiddenTraitor) {
          traitorInvestigated++;
        }
      }
    };
  } else {
    btn.classList.add("hidden");
  }
}

function animateCardIn() {
  card.style.transform = "translateY(40px)";
  card.style.opacity = "0";
  card.style.transition = "transform 0.4s ease, opacity 0.3s ease";
  card.style.pointerEvents = "auto";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    card.style.transform = "translateY(0) rotate(0deg)";
    card.style.opacity = "1";
  }));
}

// ── Mektup Kartı ─────────────────────────────────────────────────
function showLetterCard(c) {
  Haptics.letterArrival();
  hideNegotiationPanel();

  const key = c.character || "";
  cardImage.src = "assets/characters/" + encodeURIComponent(key + ".jpg");
  cardImage.onerror = () => { cardImage.src = ""; };

  charName.textContent = c.character_name || "Sultan";
  cardText.textContent = c.text || "";
  choiceLeft.textContent  = "";
  choiceRight.textContent = "";
  choiceLeft.style.opacity  = "0";
  choiceRight.style.opacity = "0";
  overlayL.style.opacity = "0";
  overlayR.style.opacity = "0";

  card.classList.add("letter-card");

  const btn = document.getElementById("investigate-btn");
  if (btn) btn.classList.add("hidden");

  if (window.playLetterArrival) playLetterArrival();

  // no-swipe: swipe'ı engeller ama pointer events açık kalır — DEVAM butonu çalışır
  card.classList.add("no-swipe");
  animateCardIn();

  const devamBtn = document.getElementById("letter-devam-btn");
  if (devamBtn) devamBtn.classList.remove("hidden");

  window._letterDevamCard = c;
}

function handleLetterDevam() {
  const devamBtn = document.getElementById("letter-devam-btn");
  if (devamBtn) devamBtn.classList.add("hidden");

  const c = window._letterDevamCard;
  card.classList.remove("letter-card");
  card.classList.remove("no-swipe");

  if (c) {
    // Stat efektleri (mektup etkileri artık gerçek stat'ları etkiliyor)
    const effects = { ...(c.right_effects || {}) };
    delete effects.sultanSabir; // sultansabir ayrı işleniyor
    if (Object.keys(effects).length > 0) applyEffects(effects);

    // Sultan sabır etkisi
    if (c.right_effects && c.right_effects.sultanSabir) {
      sultanSabir = Math.min(100, Math.max(0, sultanSabir + c.right_effects.sultanSabir));
    }
    for (const f of (c.right_flags_set || [])) activeFlags[f] = true;

    if (!isGameOver) {
      cardsPlayed++;
      advanceHicriMonth();
      if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
      if (!isGameOver) setTimeout(dealNext, 150);
    }
  }
  window._letterDevamCard = null;
}

// ── Müzakere ─────────────────────────────────────────────────────
function showNegotiationCard(c) {
  const key = c.character || "";
  cardImage.src = "assets/characters/" + encodeURIComponent(key + ".jpg");
  cardImage.onerror = () => { cardImage.src = ""; };
  charName.textContent = c.character_name || "";
  cardText.textContent = c.text || "";
  choiceLeft.style.opacity  = "0";
  choiceRight.style.opacity = "0";
  overlayL.style.opacity = "0";
  overlayR.style.opacity = "0";

  card.classList.remove("letter-card");
  const btn = document.getElementById("investigate-btn");
  if (btn) btn.classList.add("hidden");

  animateCardIn();
  card.style.pointerEvents = "none";

  const panel = document.getElementById("negotiation-panel");
  const optList = document.getElementById("negotiation-options");
  optList.innerHTML = "";
  c.negotiation_options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "negot-btn";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      for (const f of (opt.flags_set || [])) activeFlags[f] = true;
      applyEffects(opt.effects || {});
      hideNegotiationPanel();
      if (!isGameOver) {
        cardsPlayed++;
        if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
        if (!isGameOver) setTimeout(dealNext, 150);
      }
    });
    optList.appendChild(btn);
  });
  panel.classList.remove("hidden");
  cardChoices.style.display = "none";

  // Hide devam button if visible
  const devamBtn = document.getElementById("letter-devam-btn");
  if (devamBtn) devamBtn.style.display = "none";
}

function hideNegotiationPanel() {
  if (negotiationPanel) negotiationPanel.classList.add("hidden");
  if (cardChoices) cardChoices.style.display = "";
  const devamBtn = document.getElementById("letter-devam-btn");
  if (devamBtn) devamBtn.style.display = "none";
}

function showChanceCard(c) {
  document.getElementById("card-choices").style.display = "none";
  const panel = document.getElementById("chance-panel");
  if (panel) panel.classList.remove("hidden");

  const coin = document.getElementById("chance-coin");
  if (!coin) return;
  coin.classList.remove("spinning");
  coin.style.setProperty("--coin-end", "1800deg");

  coin.onclick = () => {
    if (coin.classList.contains("spinning")) return;
    const win = Math.random() < 0.5;
    coin.style.setProperty("--coin-end", win ? "1800deg" : "1980deg");
    coin.classList.add("spinning");
    Haptics.coinSpin();

    if (window.playSwipeRight && win) playSwipeRight();
    if (window.playSwipeLeft && !win) playSwipeLeft();

    setTimeout(() => {
      if (panel) panel.classList.add("hidden");
      document.getElementById("card-choices").style.display = "";
      coin.classList.remove("spinning");
      coin.onclick = null;
      card.classList.remove("no-swipe");

      if (win) Haptics.chanceWin();
      else Haptics.chanceLose();

      const effects = win ? (c.chance_win_effects || {}) : (c.chance_lose_effects || {});
      const flags = win ? (c.chance_win_flags || []) : (c.chance_lose_flags || []);
      for (const f of flags) activeFlags[f] = true;
      applyEffects(effects);
      if (!isGameOver) {
        cardsPlayed++;
        advanceHicriMonth();
        checkMissions();
        if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
        if (!isGameOver) setTimeout(dealNext, 200);
      }
    }, 1100);
  };
}

// ── Stats ─────────────────────────────────────────────────────────
function updatePortraitExpression() {
  const img = document.getElementById("card-image");
  if (!img) return;
  const vals = Object.values(stats);
  const hasDanger  = vals.some(v => v <= 20);
  const hasExcess  = vals.some(v => v >= 80);
  const isBlessed  = vals.every(v => v >= 45 && v <= 72);
  img.classList.remove("state-danger","state-excess","state-blessed","state-normal");
  if (hasDanger)      img.classList.add("state-danger");
  else if (hasExcess) img.classList.add("state-excess");
  else if (isBlessed) img.classList.add("state-blessed");
  else                img.classList.add("state-normal");
}

function updateStatUI() {
  const map = { saray: "saray", "yeniçeri": "yeniceri", ulema: "ulema", hazine: "hazine" };
  let anyDanger = false;
  for (const [key, id] of Object.entries(map)) {
    const val = stats[key];
    const fill = document.getElementById("fill-" + id);
    if (!fill) continue;
    fill.style.width = val + "%";
    fill.className = "stat-fill" + (val <= 20 || val >= 80 ? " danger" : val <= 35 || val >= 65 ? " warn" : "");
    if (val <= 20 || val >= 80) anyDanger = true;
  }

  // Danger pulse
  if (anyDanger && !dangerPulseActive) {
    dangerPulseActive = true;
    if (window.startDangerPulse) startDangerPulse();
  Haptics.statDanger();
  } else if (!anyDanger && dangerPulseActive) {
    dangerPulseActive = false;
    if (window.stopDangerPulse) stopDangerPulse();
  }
  updatePortraitExpression();
}

function hasAdvisor(id) {
  return selectedAdvisors.some(a => a.id === id);
}

function amplify(stat, delta) {
  const val = stats[stat] ?? 50;
  if (delta === 0) return 0;

  if (delta > 0) {
    // Stat yükselirken: 65+ üzerinde yavaşla (saray 100'e gitmesin)
    if (val >= 75) return Math.round(delta * 0.5);
    if (val >= 65) return Math.round(delta * 0.75);
    return delta;
  } else {
    // Stat düşerken: 30- altında hafif güçlen (tehlike gerçek hissettirsin)
    if (val <= 25) return Math.round(delta * 1.3);
    if (val <= 35) return Math.round(delta * 1.15);
    return delta;
  }
}

function showStatDelta(statKey, delta) {
  if (delta === 0) return;
  // Haptik
  if (delta > 0) Haptics.statPositive();
  else Haptics.statNegative();

  const statMap = { saray: "saray", "yeniçeri": "yeniceri", ulema: "ulema", hazine: "hazine" };
  const id = statMap[statKey];
  if (!id) return;
  const el = document.querySelector(`.stat[data-stat="${id}"]`);
  if (!el) return;
  const d = document.createElement("div");
  d.className = "stat-delta " + (delta > 0 ? "positive" : "negative");
  d.textContent = (delta > 0 ? "+" : "") + delta;
  el.appendChild(d);
  setTimeout(() => d.remove(), 1300);
}

function gainItem(itemId) {
  if (!ITEMS[itemId]) return;
  uniqueItemsCollected.add(itemId);
  const emptySlot = playerItems.indexOf(null);
  if (emptySlot === -1) {
    playerItems[0] = itemId;
    updateItemBar();
    showItemToast("🔄 " + ITEMS[itemId].icon + " " + ITEMS[itemId].name + " (slot güncellendi)");
    return;
  }
  playerItems[emptySlot] = itemId;
  updateItemBar();
  showItemToast("✨ " + ITEMS[itemId].icon + " " + ITEMS[itemId].name + " kazandın!");
}

function activateItem(slotIndex) {
  if (!playerItems[slotIndex]) return;
  const itemId = playerItems[slotIndex];
  const item = ITEMS[itemId];

  if (item.effect === "heal_20") {
    const lowestStat = Object.entries(stats).reduce((a, b) => b[1] < a[1] ? b : a);
    stats[lowestStat[0]] = Math.min(100, stats[lowestStat[0]] + 20);
    showStatDelta(lowestStat[0], 20);
    updateStatUI();
    playerItems[slotIndex] = null;
    updateItemBar();
    showItemToast(item.icon + " " + item.name + " kullanıldı! +20");
    return;
  }
  if (item.effect === "skip_card") {
    playerItems[slotIndex] = null;
    updateItemBar();
    showItemToast(item.icon + " Kart atlandı!");
    setTimeout(dealNext, 100);
    return;
  }

  if (activeItemIndex === slotIndex) {
    activeItemIndex = null;
    pendingItemEffect = null;
  } else {
    activeItemIndex = slotIndex;
    pendingItemEffect = item.effect;
  }
  updateItemBar();
}

function consumeActiveItem() {
  if (activeItemIndex === null) return;
  itemsUsed++;
  playerItems[activeItemIndex] = null;
  activeItemIndex = null;
  pendingItemEffect = null;
  updateItemBar();
}

function updateItemBar() {
  for (let i = 0; i < 3; i++) {
    const slot = document.getElementById("item-slot-" + i);
    if (!slot) continue;
    const itemId = playerItems[i];
    const icon = slot.querySelector(".item-icon");
    const name = slot.querySelector(".item-name");
    if (itemId && ITEMS[itemId]) {
      icon.textContent = ITEMS[itemId].icon;
      name.textContent = ITEMS[itemId].name;
      slot.classList.remove("empty");
      slot.classList.toggle("active", activeItemIndex === i);
    } else {
      icon.textContent = "—";
      name.textContent = "";
      slot.classList.add("empty");
      slot.classList.remove("active");
    }
  }
}

function showItemToast(msg) {
  const t = document.createElement("div");
  t.className = "item-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}

function applyEffects(effects) {
  const blockMap = { block_hazine: "hazine", block_saray: "saray", block_yeniceri: "yeniçeri" };
  let shouldConsumeItem = false;

  for (let [stat, raw] of Object.entries(effects || {})) {
    // sultanSabir özel işlem
    if (stat === "sultanSabir") {
      if (pendingItemEffect === "block_sabir") {
        shouldConsumeItem = true;
      } else {
        let sc = raw;
        if (hasAdvisor("semsi")) sc = Math.round(sc * 0.5);
        sultanSabir = Math.min(100, Math.max(0, sultanSabir + sc));
      }
      continue;
    }

    if (hasAdvisor("sokollu")) raw = Math.round(raw * 0.85);
    if (hasAdvisor("sinan") && (stat === "saray" || stat === "ulema")) raw = Math.round(raw * 1.2);
    if (hasAdvisor("hurrem") && stat === "yeniçeri" && raw < 0) raw = Math.round(raw * 0.75);

    // Item block kontrolü
    const blockedStat = blockMap[pendingItemEffect];
    if (blockedStat && stat === blockedStat && raw < 0) {
      raw = 0;
      shouldConsumeItem = true;
    }

    const amp = amplify(stat, raw);
    stats[stat] = Math.min(100, Math.max(0, (stats[stat] ?? 50) + amp));
    showStatDelta(stat, amp);

    if (stat === "saray" && pendingItemEffect !== "block_sabir") {
      let sabirChange = raw < 0 ? -3 : 2;
      if (hasAdvisor("semsi")) sabirChange = Math.round(sabirChange * 0.5);
      sultanSabir = Math.min(100, Math.max(0, sultanSabir + sabirChange));
    }
  }
  if (shouldConsumeItem) consumeActiveItem();
  updateStatUI();
  checkSultanSabir();
  checkGameOver();
}

function checkSultanSabir() {
  if (isGameOver) return;
  if (sultanSabir <= 0) {
    triggerGameOver("Sultan seni azletti. Hac yolculuğuna — sürgün olarak — gönderildin.");
  } else if (sultanSabir >= 100) {
    triggerGameOver("Sultan'ın gözünde fazla güçlendin. Gece yarısı cellat geldi.");
  }
}

function checkGameOver() {
  if (isGameOver) return false;
  for (const stat of Object.keys(stats)) {
    if (stats[stat] <= 0)   { triggerGameOver(DEATH_TABLE[stat]?.[0]   || "Oyun bitti."); return true; }
    if (stats[stat] >= 100) { triggerGameOver(DEATH_TABLE[stat]?.[100] || "Oyun bitti."); return true; }
  }
  return false;
}

// ── Lanet Sistemi ─────────────────────────────────────────────────
function checkCurse(dir) {
  if (lastDir === dir) {
    consecutiveSameDir++;
    if (consecutiveSameDir >= 3) {
      consecutiveSameDir = 0;
      triggerCurse();
    }
  } else {
    consecutiveSameDir = 1;
  }
  lastDir = dir;
}

function triggerCurse() {
  cursedEver = true;
  Haptics.curseTriggered();
  // Lanet overlay
  let overlay = document.getElementById("curse-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "curse-overlay";
    const ct = document.createElement("div");
    ct.className = "curse-text";
    ct.textContent = "DENGE BOZULDU";
    overlay.appendChild(ct);
    document.body.appendChild(overlay);
  }
  overlay.classList.remove("hidden");
  // Tüm statlara -5
  Object.keys(stats).forEach(s => {
    stats[s] = Math.max(0, stats[s] - 5);
  });
  updateStatUI();
  setTimeout(() => overlay.classList.add("hidden"), 1500);
}

// ── Karar ─────────────────────────────────────────────────────────
function decide(dir) {
  if (!currentCard) return;

  // İnvestigating state temizle - sultanSabir cezası
  if (isInvestigating) {
    let sabirPenalty = -3;
    if (hasAdvisor("semsi")) sabirPenalty = Math.round(sabirPenalty * 0.5);
    sultanSabir = Math.min(100, Math.max(0, sultanSabir + sabirPenalty));
    isInvestigating = false;
  }

  // Paşa terfi
  if (currentCard.is_pasa_terfi) {
    pasaPromoted = true;
    currentTitle = "SADRAZAM";
    if (titleLabel) titleLabel.textContent = currentTitle;
  }

  // Lanet kontrolü
  checkCurse(dir);

  // Zincirleme kartlar
  const triggerKey = "triggers_on_" + dir;
  if (currentCard[triggerKey]) {
    const delay = currentCard.trigger_delay ?? 3;
    scheduledCards.push({
      cardId: currentCard[triggerKey],
      afterCardsPlayed: cardsPlayed + delay
    });
    updateFateBar();
  }

  // Arc tetikleme
  const arcKey = "triggers_arc_on_" + dir;
  if (currentCard[arcKey]) {
    const arcId = currentCard[arcKey];
    if (!triggeredArcs[arcId] && ARCS[arcId]) {
      triggeredArcs[arcId] = true;
      activeArcs[arcId] = 0;
    }
  }

  // Flag'ler
  for (const f of (currentCard[dir + "_flags_set"] || [])) activeFlags[f] = true;

  // Item grant
  const grantKey = "grants_item_on_" + dir;
  if (currentCard[grantKey]) gainItem(currentCard[grantKey]);

  // Karakter hafızası
  const charKey = currentCard.character || "";
  const charNameKey = currentCard.character_name || "";
  [charKey, charNameKey].filter(Boolean).forEach(k => {
    if (!characterMemory[k]) characterMemory[k] = { left: 0, right: 0, last: null };
    characterMemory[k][dir]++;
    characterMemory[k].last = dir;
  });

  // Faction favor
  const faction = currentCard.faction;
  if (faction) {
    if (dir === "right") {
      factionFavors[faction] = (factionFavors[faction] || 0) + 1;
      checkFactionPressure(faction);
    }
  }

  applyEffects(currentCard[dir + "_effects"] || {});
  if (isGameOver) return;
  checkMissions();

  // ── Achievement tracking ──────────────────────────────────────
  if (charKey) seenCharacters.add(charKey);
  if (currentCard.type === 'chance') chanceCardsPlayed++;
  if (currentCard.type === 'letter') receivedLetters++;
  if (currentCard.type === 'chance' && dir === 'right') {
    chanceStreak = (chanceStreak||0) + 1;
  } else if (currentCard.type === 'chance') {
    chanceStreak = 0;
  }
  if (currentCard.id === 'savaş_zafer') warVictory = true;
  if (currentCard.triggers_on_right || currentCard.triggers_on_left) chainsCompleted++;

  // Stat min/max track
  for (const [s, v] of Object.entries(stats)) {
    if (s === 'hazine') { minHazine = Math.min(minHazine, v); maxHazine = Math.max(maxHazine, v); }
    if (s === 'saray') maxSaray = Math.max(maxSaray, v);
    minAnyStat = Math.min(minAnyStat, v);
  }

  // Ses
  if (dir === "right" && window.playSwipeRight) playSwipeRight();
  if (dir === "left"  && window.playSwipeLeft)  playSwipeLeft();

  cardsPlayed++;
  advanceHicriMonth();

  if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
  if (!isGameOver) {
    saveGameState();
    setTimeout(dealNext, 200);
  }

  // Hain açıklama kontrolü (yıl 6 = 60 kart)
  if (cardsPlayed >= 60 && !traitorRevealed) {
    traitorRevealed = true;
    const revCard = allCards.find(c => c.is_traitor_reveal);
    if (revCard) {
      const enriched = { ...revCard };
      if (window.playTraitorReveal) playTraitorReveal();
      if (traitorInvestigated >= 2) {
        enriched.text = `Paşam, yıllardır aramızda bir hain vardı: ${getCharacterDisplayName(hiddenTraitor)}. Ama siz bunu zaten fark etmişsiniz! Sultan'a rapor hazırlandı. Sarayınız güçlendi.`;
        enriched.right_effects = { saray: 10 };
      } else {
        enriched.text = `Paşam, çok geç! ${getCharacterDisplayName(hiddenTraitor)} bu gece sizi Sultan'a şikâyet etti. Belgeler sahte ama Sultan inanıyor...`;
        enriched.right_effects = { saray: -15 };
      }
      forcedQueue.unshift(enriched);
    }
  }
}

function getCharacterDisplayName(key) {
  if (!key) return "Bilinmeyen";
  const c = allCards.find(x => x.character === key);
  return c ? (c.character_name || key) : key;
}

// ── Faction Pressure ──────────────────────────────────────────────
const FACTION_RIVALS = { saray: "halk", halk: "saray", ordu: "din", din: "ordu" };

function checkFactionPressure(faction) {
  const count = factionFavors[faction] || 0;
  if (count >= 5) {
    const rival = FACTION_RIVALS[faction];
    if (rival && !factionPressureSent[rival]) {
      factionPressureSent[rival] = true;
      activeFlags["faction_pressure_" + rival] = true;
      // Baskı kartını kuyruğa ekle
      const pressureCard = allCards.find(c => c.required_faction_pressure === rival);
      if (pressureCard) {
        scheduledCards.push({
          cardId: pressureCard.id,
          afterCardsPlayed: cardsPlayed + 2
        });
        updateFateBar();
      }
    }
  }
}

// ── Swipe / Drag ──────────────────────────────────────────────────
const THRESHOLD = 100;
let startX = 0, startY = 0, curX = 0, isDragging = false, isAnimating = false;

let _haptThresholdFired = false;

function onStart(x, y) {
  if (card.classList.contains('no-swipe') || isAnimating || isGameOver) return;
  if (currentCard && (currentCard.type === "negotiation" || currentCard.type === "letter")) return;
  startX = x; startY = y; curX = x; isDragging = true;
  _haptThresholdFired = false;
  card.classList.add("dragging");
  card.style.transition = "none";
  Haptics.cardPickup();
}

function onMove(x) {
  if (!isDragging) return;
  curX = x;
  const dx = curX - startX;
  const rot = Math.max(-14, Math.min(14, dx * 14 / THRESHOLD));
  card.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;

  const progress = Math.min(1, Math.abs(dx) / THRESHOLD);

  // Eşik haptiği — %80'e ulaşınca bir kez tetikle
  if (progress >= 0.8 && !_haptThresholdFired) {
    _haptThresholdFired = true;
    Haptics.swipeThresholdCrossed();
  } else if (progress < 0.5) {
    _haptThresholdFired = false;
  }

  if (dx < -15) {
    overlayL.style.opacity = String(progress * 0.6);
    overlayR.style.opacity = "0";
    choiceLeft.style.opacity  = String(progress);
    choiceRight.style.opacity = "0";
  } else if (dx > 15) {
    overlayR.style.opacity = String(progress * 0.6);
    overlayL.style.opacity = "0";
    choiceRight.style.opacity = String(progress);
    choiceLeft.style.opacity  = "0";
  } else {
    overlayL.style.opacity = overlayR.style.opacity = "0";
    choiceLeft.style.opacity = choiceRight.style.opacity = "0";
  }

  // Söz balonu
  const bubble = document.getElementById("speech-bubble");
  const speechText = document.getElementById("speech-text");
  if (bubble && currentCard) {
    if (Math.abs(dx) > 50) {
      const text = dx < 0
        ? (currentCard.speech_left || "")
        : (currentCard.speech_right || "");
      if (text) {
        speechText.textContent = text;
        bubble.className = dx < 0 ? "left-dir" : "right-dir";
        bubble.style.opacity = String(Math.min(1, (Math.abs(dx) - 50) / 60));
      } else {
        bubble.style.opacity = "0";
      }
    } else {
      bubble.style.opacity = "0";
    }
  }
}

function onEnd() {
  if (!isDragging) return;
  isDragging = false;
  card.classList.remove("dragging");
  const dx = curX - startX;
  if (dx < -THRESHOLD) flyOff("left");
  else if (dx > THRESHOLD) flyOff("right");
  else snapBack();
}

function flyOff(dir) {
  const bubble = document.getElementById("speech-bubble");
  if (bubble) bubble.style.opacity = "0";
  if (isAnimating) return;
  isAnimating = true;
  if (dir === "right") Haptics.swipeRight();
  else Haptics.swipeLeft();
  const tx = dir === "left" ? -680 : 680;
  card.style.transition = "transform 0.28s ease-in, opacity 0.22s ease-in";
  card.style.transform = `translateX(${tx}px) rotate(${dir === "left" ? -22 : 22}deg)`;
  card.style.opacity = "0";
  setTimeout(() => {
    // Kartı sıfırla — içerik temizle
    card.style.transition = "none";
    card.style.transform = "translateX(0) rotate(0deg)";
    cardImage.src = "";
    charName.textContent = "";
    cardText.textContent = "";
    choiceLeft.style.opacity = "0";
    choiceRight.style.opacity = "0";
    overlayL.style.opacity = "0";
    overlayR.style.opacity = "0";
    isAnimating = false;
    decide(dir);
  }, 300);
}

function snapBack() {
  const bubble = document.getElementById("speech-bubble");
  if (bubble) bubble.style.opacity = "0";
  Haptics.snapBack();
  card.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s";
  card.style.transform = "translateX(0) rotate(0deg)";
  overlayL.style.opacity = overlayR.style.opacity = "0";
  choiceLeft.style.opacity = choiceRight.style.opacity = "0";
}

// Mouse
card.addEventListener("mousedown",  e => onStart(e.clientX, e.clientY));
window.addEventListener("mousemove", e => { if (isDragging) onMove(e.clientX); });
window.addEventListener("mouseup",   () => onEnd());

// Keyboard
window.addEventListener("keydown", e => {
  if (card.classList.contains('no-swipe') || isAnimating || isGameOver || currentCard === null) return;
  if (currentCard && (currentCard.type === "negotiation" || currentCard.type === "letter")) return;
  if (e.key === "ArrowLeft")  flyOff("left");
  if (e.key === "ArrowRight") flyOff("right");
});

// Touch
card.addEventListener("touchstart", e => {
  const t = e.touches[0];
  onStart(t.clientX, t.clientY);
}, { passive: true });
window.addEventListener("touchmove", e => {
  if (isDragging) { e.preventDefault(); onMove(e.touches[0].clientX); }
}, { passive: false });
window.addEventListener("touchend",  () => onEnd());

// ── Yıl Geçişi ───────────────────────────────────────────────────
function advanceYear() {
  year++;
  Haptics.yearAdvance();
  if (window.playYearAdvance) playYearAdvance();

  if (hasAdvisor("piri_reis")) {
    stats.hazine = Math.min(100, stats.hazine + 6);
  }

  stats.hazine = Math.max(0, stats.hazine - PASSIVE_HAZINE_DRAIN);
  updateStatUI();
  if (checkGameOver()) return;

  // Paşa terfi (yıl 3)
  if (isPasaMode && !pasaPromoted && year === 3) {
    const terfiCard = allCards.find(c => c.is_pasa_terfi);
    if (terfiCard) forcedQueue.unshift(terfiCard);
  }

  // Sultan mektubu (%30 ihtimal)
  if (Math.random() < 0.30) {
    const letterCards = allCards.filter(c => c.type === "letter" && !activeFlags["sultan_mektup_" + c.id + "_okundu"]);
    if (letterCards.length > 0) {
      const lc = letterCards[Math.floor(Math.random() * letterCards.length)];
      forcedQueue.push(lc);
    }
  }

  // Yıllık event kartı
  const eventCards = getEventCards();
  if (eventCards.length > 0) {
    const ev = eventCards[Math.floor(Math.random() * eventCards.length)];
    forcedQueue.push(ev);
    if (ev.sound === "veba" && window.playEvent_veba) playEvent_veba();
    if (ev.sound === "savas" && window.playEvent_savas) playEvent_savas();
    if (ev.sound === "hasat" && window.playEvent_hasat) playEvent_hasat();
  }

  // Sultan'a özgü kartlar (yılda 1 kez, %40 ihtimalle)
  if (selectedSultan && Math.random() < 0.40) {
    const sultanId = selectedSultan.id;
    const sultanSpecific = allCards.filter(c =>
      c.sultan_specific === sultanId &&
      (c.min_year || 1) <= year &&
      (c.max_year || 999) >= year &&
      !(playCounts[c.id] && playCounts[c.id] > 1)
    );
    if (sultanSpecific.length > 0) {
      const pick = sultanSpecific[Math.floor(Math.random() * sultanSpecific.length)];
      forcedQueue.push(pick);
    }
  }

  // 5 yılda bir vergi ödülü event'i
  if (year % 5 === 0) {
    const vergiEvent = allCards.find(c => c.id === 'event_vergi_reformu');
    if (vergiEvent) forcedQueue.unshift(vergiEvent);
  }

  // Tarihsel olaylar (sultan_specific olmayan, genel)
  const histCards = allCards.filter(c =>
    c.category === 'historical' && !c.sultan_specific &&
    (c.min_year || 1) <= year &&
    (c.max_year || 999) >= year &&
    !playCounts[c.id]
  );
  if (histCards.length > 0 && Math.random() < 0.25) {
    forcedQueue.push(histCards[Math.floor(Math.random() * histCards.length)]);
  }

  // ── ÖZELLİK 1: MÜTTEFİK FLAG'LERİNİ GÜNCELLE ───────────────────
  updateAllyFlags();

  // ── ÖZELLİK 2: SADAKAT / İNTİKAM MATEMATİĞİ ─────────────────
  checkRelationshipEffects();

  updateDynamicSubtitle();
  checkMissions();
}

// ── Müttefik Flag Sistemi ─────────────────────────────────────────
// Karakterle net pozitif ilişki kurulduysa ally flag'ini set et
const ALLY_THRESHOLDS = {
  "2-yeniceri":      { flag: "yeniceri_ally_ready",   threshold: 3 },
  "3-seyhulislam":   { flag: "ulema_ally_ready",       threshold: 3 },
  "4-defterdar":     { flag: "defterdar_ally_ready",   threshold: 3 },
  "5-valide-sultan": { flag: "valide_ally_ready",      threshold: 3 },
  "6-kaptan-i-derya":{ flag: "kaptan_ally_ready",      threshold: 3 },
};

function updateAllyFlags() {
  for (const [charKey, cfg] of Object.entries(ALLY_THRESHOLDS)) {
    const mem = characterMemory[charKey];
    if (!mem) continue;
    const netScore = (mem.right || 0) - (mem.left || 0);
    if (netScore >= cfg.threshold) {
      activeFlags[cfg.flag] = true;
    } else if (activeFlags[cfg.flag] && netScore < 1) {
      // İlişki bozulduysa flag'i kaldır
      delete activeFlags[cfg.flag];
    }
  }
}

// ── Sadakat / İntikam Matematiği ─────────────────────────────────
const CHAR_FACTION_MAP = {
  "2-yeniceri":       "yeniçeri",
  "18-yeniceri_isyancisi": "yeniçeri",
  "11-sipahi_agasi":  "yeniçeri",
  "3-seyhulislam":    "ulema",
  "10-hekimbasi":     "ulema",
  "25-deli_dervis":   "ulema",
  "1-sultan":         "saray",
  "5-valide-sultan":  "saray",
  "8-rakip-vezir":    "saray",
  "16-saray_agasi":   "saray",
  "4-defterdar":      "hazine",
  "13-buyuk_tuccar":  "hazine",
  "22-yahudi_bankaci":"hazine",
};

const LOYALTY_THRESHOLD = 4;
const REVENGE_THRESHOLD = -4;

function checkRelationshipEffects() {
  for (const [charKey, mem] of Object.entries(characterMemory)) {
    const netScore = (mem.right || 0) - (mem.left || 0);
    const loyaltyFlagKey = `loyalty_${charKey}`;
    const revengeFlagKey = `revenge_${charKey}`;

    // Sadakat flag'i — kart sistemini tetikler
    if (netScore >= LOYALTY_THRESHOLD && !activeFlags[loyaltyFlagKey]) {
      activeFlags[loyaltyFlagKey] = true;
    }

    // İntikam flag'i
    if (netScore <= REVENGE_THRESHOLD && !activeFlags[revengeFlagKey]) {
      activeFlags[revengeFlagKey] = true;
    }

    // Pasif etki: çok güçlü ilişkilerde küçük bonus/ceza
    const faction = CHAR_FACTION_MAP[charKey];
    if (faction && stats[faction] !== undefined) {
      if (netScore >= 7) {
        // Sadık dost: her yıl +2 ilgili stat
        stats[faction] = Math.min(100, stats[faction] + 2);
      } else if (netScore <= -7) {
        // Açık düşman: her yıl -2 ilgili stat
        stats[faction] = Math.max(0, stats[faction] - 2);
      }
    }
  }

  // Stat değişimi olduysa UI güncelle
  updateStatUI();
}

// ── Game Over ─────────────────────────────────────────────────────
function triggerGameOver(reason) {
  if (isGameOver) return;
  isGameOver = true;
  clearSave();
  stopAmbientMusic();
  Haptics.gameOver();
  if (window.stopDangerPulse) stopDangerPulse();

  // Sinematik ölüm
  if (window.playCinematicDeath) playCinematicDeath();

  const cinematicEl = document.getElementById("cinematic-death");
  const deathImg    = document.getElementById("death-char-img");

  if (cinematicEl && deathCharacterKey) {
    deathImg.src = "assets/characters/" + encodeURIComponent(deathCharacterKey + ".jpg");
    deathImg.onerror = () => { deathImg.src = ""; };
    cinematicEl.classList.remove("hidden");
    setTimeout(() => {
      deathImg.style.transition = "opacity 1.5s ease";
      deathImg.style.opacity = "0";
    }, 600);
    setTimeout(() => {
      cinematicEl.classList.add("hidden");
      deathImg.style.opacity = "";
      deathImg.style.transition = "";
      showGameOver(reason);
    }, 2200);
  } else {
    setTimeout(() => showGameOver(reason), 600);
  }
}

function showGameOver(reason) {
  if (window.playGameOver) playGameOver();

  saveHighScore();
  saveDeathArchive(reason);

  const newAchievements = checkAchievements(reason);
  if (newAchievements.length > 0) {
    newAchievements.forEach((a, i) => {
      setTimeout(() => showAchievementToast(a), 600 + i * 3600);
    });
  }

  const best = parseInt(localStorage.getItem("sadrazam_best_year") || "0");
  const isNewRecord = year >= best;

  // Dinamik başlık
  currentDeathTitle = getDynamicDeathTitle(reason);
  document.getElementById("gameover-title").textContent = currentDeathTitle;

  gameoverReason.textContent = reason;

  let yearText = `${year} yıl, ${HICRI_MONTHS[hicriMonth % 12]} ${hicriYear}`;
  document.getElementById("gameover-year").textContent = yearText;

  // Yeni rekor banner
  let recBanner = document.getElementById("new-record-banner");
  if (!recBanner) {
    recBanner = document.createElement("div");
    recBanner.id = "new-record-banner";
    const divider = document.getElementById("gameover-divider");
    if (divider) divider.parentNode.insertBefore(recBanner, divider.nextSibling);
  }
  if (isNewRecord) {
    recBanner.textContent = "🏆 YENİ REKOR!";
    recBanner.style.display = "block";
  } else {
    recBanner.style.display = "none";
    const oldBest = document.getElementById("gameover-year");
    if (oldBest) oldBest.textContent += ` · Rekor: ${best} yıl`;
  }

  // Achievement badge'ler
  renderAchievementBadges();

  // Ölüm arşivi
  renderDeathArchive();

  const missionSumEl = document.getElementById("mission-summary");
  if (missionSumEl) missionSumEl.textContent = getMissionSummary();
  const missionDetEl = document.getElementById("mission-details");
  if (missionDetEl) {
    missionDetEl.innerHTML = getMissionDetails().map(m =>
      `<div style="font-size:11px; color:${m.completed ? '#55dd66' : 'rgba(201,162,39,0.4)'}; font-family:'Cinzel'">${m.completed ? '✓' : '✗'} ${m.name}</div>`
    ).join("");
  }

  gameoverScreen.classList.add("visible");
}

function getDynamicDeathTitle(reason) {
  if (reason.includes("idam")) return "İDAM FERMANI GELDİ";
  if (reason.includes("cellat")) return "GECE YARISI SONU";
  if (reason.includes("isyan") || reason.includes("Yeniçeri")) return "TAHT DEVRILDI";
  if (reason.includes("linç") || reason.includes("dinsizlik")) return "HALK AYAKTA";
  if (reason.includes("düşman") || reason.includes("surlarına")) return "İSTANBUL DÜŞTÜ";
  if (reason.includes("iflas")) return "HAZİNE BOŞALDI";
  if (reason.includes("zimmet")) return "SUÇLAMA GELDİ";
  if (reason.includes("ihanet") || reason.includes("şikâyet")) return "İHANET AÇIĞA ÇIKTI";
  if (reason.includes("sürgün") || reason.includes("azletti")) return "AZIL FERMANI";
  return "SADRAZAMLIK SONA ERDİ";
}

// ── Başarımlar ────────────────────────────────────────────────────
function buildAchievementState(deathReason) {
  const cg = getCrossGameData();
  return {
    year, stats, isPasaMode, pasaPromoted, cursedEver, sultanId: selectedSultan?.id,
    traitorInvestigated, seenCharacters, receivedLetters, chanceCardsPlayed,
    chanceStreak, chainsCompleted, warVictory, itemsUsed, uniqueItemsCollected,
    minHazine, maxSaray, maxHazine, minAnyStat, characterMemory,
    deathReason: deathReason || "",
    // Cross-game
    deathsSeen: [...new Set([...(cg.deathsSeen||[]), ...(deathReason?[deathReason]:[])])],
    totalCurses: (cg.totalCurses||0) + (cursedEver?1:0),
  };
}

function checkAchievements(deathReason) {
  const state = buildAchievementState(deathReason);
  // Cross-game güncelle
  updateCrossGame({
    deathsSeen: state.deathsSeen,
    totalCurses: cursedEver ? 1 : 0,
  });

  const saved = JSON.parse(localStorage.getItem("sadrazam_achievements") || "[]");
  const newlyUnlocked = [];
  ACHIEVEMENTS.forEach(a => {
    if (!saved.includes(a.id) && a.check(state)) {
      saved.push(a.id);
      newlyUnlocked.push(a);
    }
  });
  localStorage.setItem("sadrazam_achievements", JSON.stringify(saved));
  return newlyUnlocked;
}

function showAchievementToast(a) {
  Haptics.achievement();
  const tierColors = { bronze:"#cd7f32", silver:"#aaa", gold:"#C9A227", platinum:"#e5e4e2", secret:"#9b59b6" };
  const color = tierColors[a.tier] || "#C9A227";
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.innerHTML = `<span style="font-size:18px">${a.icon}</span><span style="color:${color}">${a.name}</span><span style="font-size:10px;opacity:0.7">${a.tier === 'secret' ? 'Gizli Başarım' : a.tier.toUpperCase()}</span>`;
  toast.style.cssText += `border-color:${color};`;
  document.body.appendChild(toast);
  if (window.playAchievement) playAchievement();
  setTimeout(() => toast.remove(), 3400);
}

function renderAchievementBadges() {
  const saved = JSON.parse(localStorage.getItem("sadrazam_achievements") || "[]");
  if (!saved.length) return;

  let section = document.getElementById("achievements-section");
  if (!section) {
    section = document.createElement("div");
    section.id = "achievements-section";
    const panel = document.getElementById("gameover-panel");
    if (panel) {
      const restartBtn = document.getElementById("restart-btn");
      panel.insertBefore(section, restartBtn);
    }
  }
  section.innerHTML = "";

  const title = document.createElement("div");
  title.style.cssText = "font-family:'Cinzel',serif;font-size:10px;color:rgba(201,162,39,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;text-align:center;";
  title.textContent = "KAZANILAN BAŞARIMLAR";
  section.appendChild(title);

  const badgesDiv = document.createElement("div");
  badgesDiv.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;justify-content:center;";
  saved.forEach(id => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a) {
      const badge = document.createElement("div");
      badge.className = "achievement-badge";
      badge.textContent = a.label;
      badgesDiv.appendChild(badge);
    }
  });
  section.appendChild(badgesDiv);
}

// ── Ölüm Arşivi ───────────────────────────────────────────────────
function saveDeathArchive(reason) {
  const archive = JSON.parse(localStorage.getItem("sadrazam_deaths") || "[]");
  archive.unshift({
    year,
    reason: reason.slice(0, 80),
    sultan: selectedSultan ? selectedSultan.name : "—",
    advisors: selectedAdvisors.map(a => a.name).join(", "),
    date: new Date().toLocaleDateString("tr")
  });
  // Max 10
  if (archive.length > 10) archive.pop();
  localStorage.setItem("sadrazam_deaths", JSON.stringify(archive));
}

function renderDeathArchive() {
  const archive = JSON.parse(localStorage.getItem("sadrazam_deaths") || "[]").slice(1, 4); // son 3 (1 = şimdiki)
  if (!archive.length) return;

  let section = document.getElementById("death-archive-section");
  if (!section) {
    section = document.createElement("div");
    section.id = "death-archive-section";
    const panel = document.getElementById("gameover-panel");
    if (panel) {
      const restartBtn = document.getElementById("restart-btn");
      panel.insertBefore(section, restartBtn);
    }
  }
  section.innerHTML = `<div class="death-archive-title">GEÇMİŞ ÖLÜMLER</div>`;

  archive.forEach(d => {
    const entry = document.createElement("div");
    entry.className = "death-entry";
    entry.innerHTML = `<strong>${d.sultan}</strong> · ${d.year} yıl · ${d.date}<br><span>${d.reason}</span>`;
    section.appendChild(entry);
  });
}

function saveHighScore() {
  const best = parseInt(localStorage.getItem("sadrazam_best_year") || "0");
  if (year > best) {
    localStorage.setItem("sadrazam_best_year", String(year));
  }
}

// ── Paylaşım ─────────────────────────────────────────────────────
document.getElementById("share-btn").addEventListener("click", () => {
  const sultanName = selectedSultan ? selectedSultan.name : "Sultan";
  const text = `Sadrazam'da ${sultanName} döneminde ${year} yıl ayakta kalabildim! 🗡️ Sen kaç yıl dayanabilirsin? sadrazam-web.vercel.app`;
  if (navigator.share) {
    navigator.share({ title: "Sadrazam", text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById("share-btn");
      const orig = btn.textContent;
      btn.textContent = "KOPYALANDI!";
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  }
});

// ── Restart ───────────────────────────────────────────────────────
function restartGame() {
  clearSave();
  gameoverScreen.classList.remove("visible");
  gameScreen.classList.add("hidden");
  gameScreen.classList.remove("night-mode");
  card.style.opacity = "0";
  currentCard = null;
  selectedSultan = null;
  selectedAdvisors = [];
  hideNegotiationPanel();

  // Clean up extra elements
  ["new-record-banner","death-archive-section","achievements-section"].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.parentNode) { /* keep for next round */ }
  });

  const cinematicEl = document.getElementById("cinematic-death");
  if (cinematicEl) cinematicEl.classList.add("hidden");

  introScreen.style.display = "";
}

// ── Başarımlar Ekranı ─────────────────────────────────────────────
const achievementsScreen = document.getElementById("achievements-screen");

function openAchievementsScreen() {
  introScreen.style.display = "none";
  achievementsScreen.classList.remove("hidden");
  renderAchievementsScreen("all");
}

function renderAchievementsScreen(filterTier) {
  const unlocked = JSON.parse(localStorage.getItem("sadrazam_achievements") || "[]");
  const total = ACHIEVEMENTS.length;
  const count = unlocked.length;
  const pct = Math.round(count / total * 100);

  // Progress
  const progText = document.getElementById("ach-progress-text");
  const progFill = document.getElementById("ach-progress-fill");
  if (progText) progText.textContent = `${count} / ${total} Başarım · %${pct}`;
  if (progFill) progFill.style.width = pct + "%";

  // Intro badge
  const badge = document.getElementById("ach-count-badge");
  if (badge) badge.textContent = `${count}/${total}`;

  // Filter tabs
  document.querySelectorAll(".ach-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tier === filterTier);
    tab.onclick = () => renderAchievementsScreen(tab.dataset.tier);
  });

  // Grid
  const grid = document.getElementById("ach-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const TIER_ORDER = ["bronze","silver","gold","platinum","secret"];
  const tierLabels = { bronze:"Bronz", silver:"Gümüş", gold:"Altın", platinum:"Platin", secret:"Gizli" };

  const toShow = filterTier === "all"
    ? [...ACHIEVEMENTS].sort((a,b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
    : ACHIEVEMENTS.filter(a => a.tier === filterTier);

  toShow.forEach(a => {
    const isUnlocked = unlocked.includes(a.id);
    const isSecret = a.tier === "secret";
    const card = document.createElement("div");
    card.className = `ach-card ${a.tier} ${isUnlocked ? "unlocked" : "locked"} ${isSecret ? "secret" : ""}`;

    const icon = isUnlocked ? a.icon : (isSecret ? "🔒" : "🔒");
    const name = (isSecret && !isUnlocked) ? "???" : a.name;
    const desc = (isSecret && !isUnlocked) ? "Gizemli bir başarım…" : a.desc;

    card.innerHTML = `
      <div class="ach-icon ${isUnlocked ? "" : "locked-icon"}">${icon}</div>
      <div class="ach-info">
        <div class="ach-name">${name}</div>
        <div class="ach-desc">${desc}</div>
      </div>
      <div class="ach-tier-badge tier-${a.tier}">${tierLabels[a.tier]}</div>
    `;
    grid.appendChild(card);
  });
}

// Ekran butonları
document.getElementById("btn-achievements")?.addEventListener("click", openAchievementsScreen);
document.getElementById("btn-ach-back")?.addEventListener("click", () => {
  achievementsScreen.classList.add("hidden");
  introScreen.style.display = "";
});

// Intro yüklendiğinde badge'i güncelle
(function initAchBadge() {
  const unlocked = JSON.parse(localStorage.getItem("sadrazam_achievements") || "[]");
  const badge = document.getElementById("ach-count-badge");
  if (badge && unlocked.length > 0) badge.textContent = `${unlocked.length}/${ACHIEVEMENTS.length}`;
})();

// ── Init ──────────────────────────────────────────────────────────
updateStatUI();
