// ═══════════════════════════════════════════════════════════════════
//  SADRAZAM — game.js  (v3.1)
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

// ★ GOD MODE — test için geçici. Kaldırmak için ★ GOD MODE etiketli tüm satırları sil.
let godMode = false; // ★ GOD MODE
function toggleGodMode() { // ★ GOD MODE
  godMode = !godMode; // ★ GOD MODE
  const badge = document.getElementById('god-badge'); // ★ GOD MODE
  if (godMode) { // ★ GOD MODE
    if (!badge) { const b = document.createElement('div'); b.id='god-badge'; b.textContent='⚡ GOD'; document.body.appendChild(b); } // ★ GOD MODE
  } else { // ★ GOD MODE
    if (badge) badge.remove(); // ★ GOD MODE
  } // ★ GOD MODE
} // ★ GOD MODE

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

// 30+ bağlam duyarlı ölüm metni havuzu
const DEATH_TEXTS = {
  saray_0: [
    "Sultan sana idam fermanı gönderdi. Cellat kapında bekliyordu.",
    "Bir sabah Topkapı'dan haberci geldi — güven bitmişti.",
    "Sarayın kapıları kapandı. Bir daha açılmadı senin için.",
    "Sultan'ın gözünde kaybolmak, imparatorlukta ölmektir.",
    "Yıllar içinde birikenler tek bir kelimeyle silindi: idam."
  ],
  saray_100: [
    "Çok güçlendin. Sultan bu gölgeyi kaldıramadı.",
    "Tahtın gölgesine giren ya taht olur ya toz. Sen toz oldun.",
    "Sultan geceleri senin gücünü düşündü — ve sabah kararını verdi.",
    "Hükümdarın gözüne giren sonunda çıkamaz. Çıkamazdın.",
    "Sarayda çok parlak yanarsan, biri söndürür. Söndürüldün."
  ],
  yeniceri_0: [
    "Ordu dağıldı. Düşman İstanbul surlarını gördüğünde artık geç kalmıştı.",
    "Yeniçeri maaşsız kalınca sadakati de bitirdi. Ardından sen de bittin.",
    "Sınırlar çözülünce her şey çözülür. Çözüldü.",
    "Ordu olmayan imparatorluk kağıt üzerinde kalır. Kaldın."
  ],
  yeniceri_100: [
    "Yeniçeriler saraya yürüdü. Tahtı devirdiler. Seni de.",
    "Kılıç elden çıkınca kılıç sahibini seçer. Seni seçmedi.",
    "Askeri güç, kontrol edilemeyince imhaya döner. Döndü.",
    "Çok güçlü bir ordu sadrazamını da yer. Yedi."
  ],
  ulema_0: [
    "Şeyhülislam dinsizlikle itham etti. Halk seni linç etti.",
    "Cuma hutbesinde adın okunmadı — bu sessizlik her şeydi.",
    "Dini otorite kaybedince, halk seni kaybeder. Kaybettiler.",
    "İmamlar döndü, halk döndü. Sen yapayalnız kaldın."
  ],
  ulema_100: [
    "Ulema artık senden değil, Şeyhülislam'dan emir alıyor.",
    "Din bir araçtı; sonunda araca ihtiyaç kalmadı.",
    "Şeyhülislam Divan'da ayağa kalktı — bundan sonrası şeriat.",
    "Dini güç siyasi güçten ayrıldığında sadrazam gereksizleşir."
  ],
  hazine_0: [
    "Devlet iflas etti. Asker maaşını alamadı. Herkes kaçtı.",
    "Boş kasa, boş vaatler, boş saray. Hepsi birlikte geldi.",
    "Hazine bitince güç biter, güç bitince devlet biter.",
    "Para yokken kararlar da anlamsızlaşır. Anlamsızlaştın."
  ],
  hazine_100: [
    "Bu kadar altın tehlikelidir. Sultan zimmetçilikle suçladı.",
    "Hazinedeki fazla devleti değil, sadrazamı yok eder.",
    "Serveti gizleyemedin. Saray gizliyi sevmez.",
    "Sultan altınların nereden geldiğini sordu. Cevap yoktu."
  ]
};

function getRichDeathText(reason, statKey, statVal) {
  const key = statKey === "yeniçeri" ? "yeniceri" : statKey;
  const poolKey = key + "_" + (statVal <= 0 ? "0" : "100");
  const isEN = window.LANG === 'en';
  const enPools = window.EN_DEATH_TEXTS;
  const pool = (isEN && enPools && enPools[poolKey]) ? enPools[poolKey] : DEATH_TEXTS[poolKey];
  let base = pool ? pool[Math.floor(Math.random() * pool.length)] : reason;

  // Yıl bazlı ek bağlam
  if (year >= 15)     base += isEN ? " You had surpassed fifteen years — that is no small feat." : " On beş yılı aşmıştın — az değil.";
  else if (year >= 10) base += isEN ? " You saw ten years. Very few endure that long." : " On yılı gördün. Çok az kişi bu kadar dayanır.";
  else if (year <= 2)  base += isEN ? " The Divan had barely come to know you." : " Divan seni henüz tanıyamamıştı.";

  return base;
}

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
    desc: "Her yıl Hazine +8",
    effect: "hazine_per_year_8"
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
  { id: "gizli_ustat",   tier:"platinum", icon:"🌟", name:"Gizli Üstat",          desc:"Tek oyunda 3 gizli görevi tamamla.",          check: s => s.allMissionsCompleted },

  // ── GİZLİ ──
  { id: "rival_five",     tier:"secret",   icon:"🗡️", name:"Rakibin Rakibi",     desc:"Rakip Vezir ile 5 kez yüzleş.",              check: s => (s.characterMemory?.["8-rakip-vezir"]?.left||0)+(s.characterMemory?.["8-rakip-vezir"]?.right||0) >= 5 },
  { id: "zimmet",         tier:"secret",   icon:"💸", name:"Zimmet Şüphelisi",    desc:"Zimmet suçuyla öl.",                          check: s => s.deathReason?.includes("zimmet") },
  { id: "valide_loyal",   tier:"secret",   icon:"💫", name:"Valide'nin Gözdesi",  desc:"Tek oyunda Valide Sultan'ın tüm isteklerini kabul et.", check: s => (s.characterMemory?.["5-valide-sultan"]?.left||0)===0 && (s.characterMemory?.["5-valide-sultan"]?.right||0)>=3 },
  { id: "diplomat",       tier:"secret",   icon:"🤝", name:"Zekice Elçi",         desc:"Yabancı Elçi ile 4+ kez müzakere yap.",      check: s => (s.characterMemory?.["7-yabanci-elci"]?.left||0)+(s.characterMemory?.["7-yabanci-elci"]?.right||0) >= 4 },
  { id: "deli_dervis_right", tier:"secret", icon:"🔮", name:"Kehanet Tuttu",      desc:"Deli Derviş'i 2 kez ziyaret et.",            check: s => (s.characterMemory?.["25-deli_dervis"]?.left||0)+(s.characterMemory?.["25-deli_dervis"]?.right||0) >= 2 },
];

// ── Rakip Vezir Dinamik Diyalog ──────────────────────────────────
const RAKIP_GUCLU = [
  "önünüzde eğildi, gözlerini kaçırdı.",
  "sizi selamlayıp hızla çekildi.",
  "söyleyeceklerini yarım bıraktı.",
  "çekinerek yaklaştı, sesiniz yükselince geriledi."
];
const RAKIP_ZAYIF = [
  "sizi umursamadan geçip gitti.",
  "gülümseyerek koltuğunuza yaslandı.",
  "sesini yükseltmekten çekinmedi.",
  "doğrudan gözlerinizin içine baktı."
];

function getRakipSuffix() {
  const avg = Object.values(stats).reduce((a,b)=>a+b,0)/4;
  const isEN = window.LANG === 'en';
  const prefix = isEN ? " — The Rival Vizier " : " — Rakip vezir ";
  if (avg >= 58) {
    const pool = (isEN && window.EN_RAKIP_GUCLU) ? window.EN_RAKIP_GUCLU : RAKIP_GUCLU;
    return prefix + pool[Math.floor(Math.random()*pool.length)];
  }
  if (avg <= 42) {
    const pool = (isEN && window.EN_RAKIP_ZAYIF) ? window.EN_RAKIP_ZAYIF : RAKIP_ZAYIF;
    return prefix + pool[Math.floor(Math.random()*pool.length)];
  }
  return "";
}

// ── Dönüm Noktası + Miras ────────────────────────────────────────
const DONUM_CHOICES = [
  { bar: "saray",    barLabel: "Saray ↑",   label: "Sarayı pekiştirdim",         desc: "Sultan'la bağları güçlendirdim, tahtı sağlamlaştırdım." },
  { bar: "yeniçeri", barLabel: "Ordu ↑",    label: "Orduyu güçlendirdim",         desc: "Yeniçerilerin sadakatini kazandım, sınırları korudum." },
  { bar: "ulema",    barLabel: "Ulema ↑",   label: "Dini otoriteyi destekledim",  desc: "Ulema ile barış içinde hükmettim, halkın güvenini aldım." },
  { bar: "hazine",   barLabel: "Hazine ↑",  label: "Hazineyi büyüttüm",           desc: "Devlet kasasını doldurdum, ticareti canlandırdım." }
];

let _donumNextCard = 42;
let _donumShownThisGame = false;

function getDonumCard() {
  const isEN = window.LANG === 'en';
  return {
    id: "donum_noktasi_" + cardsPlayed,
    type: "easter",
    easter_type: "donum",
    character: "donum-noktasi",
    character_name: isEN ? "Turning Point" : "Dönüm Noktası",
    text: isEN
      ? "Years have passed. The Divan is listening. What you focused on in this era will live on in the words of historians."
      : "Yıllar geçti. Divan sizi dinliyor. Bu dönemde ne üzerine yoğunlaştığınız tarihçilerin dilinde yaşayacak.",
    button: null,
    stat_effect: null
  };
}

function getMirasCard() {
  const bar = localStorage.getItem("sadrazam_miras_bar");
  const label = localStorage.getItem("sadrazam_miras_label");
  if (!bar || !label) return null;
  const isEN = window.LANG === 'en';
  // EN label: ters çeviri tablosu (donum seçimindeki label → EN karşılığı)
  const EN_DONUM_LABEL_MAP = {
    "Sarayı pekiştirdim":          "I strengthened the Palace",
    "Orduyu güçlendirdim":         "I strengthened the Army",
    "Dini otoriteyi destekledim":  "I supported religious authority",
    "Hazineyi büyüttüm":           "I grew the Treasury"
  };
  const displayLabel = (isEN && EN_DONUM_LABEL_MAP[label]) ? EN_DONUM_LABEL_MAP[label] : label;
  return {
    id: "miras_kart",
    type: "easter",
    easter_type: "miras",
    character: "miras-habercisi",
    character_name: isEN ? "Legacy Herald" : "Miras Habercisi",
    text: isEN
      ? `Your legacy has found its place. "${displayLabel}" — that decision still echoes today.`
      : `Bıraktığın miras yerini buldu. "${displayLabel}" — bu karar bugün hâlâ yankılanıyor.`,
    button: isEN ? "WE ARE GRATEFUL" : "MİNNETTARIZ",
    stat_effect: () => {
      const delta = 15;
      stats[bar] = Math.min(95, (stats[bar] || 50) + delta);
      showStatDelta(bar, delta);
      updateStatUI();
      // Miras kullanıldı, bir daha çıkmasın
      localStorage.removeItem("sadrazam_miras_bar");
      localStorage.removeItem("sadrazam_miras_label");
    }
  };
}

// ── Easter Egg Sabit Verileri ─────────────────────────────────────

const KEHANET_TEXTS = [
  "Bu şehir bir gün müzeye dönecek, Paşam.",
  "Boğaz bir gün Rus gemilerine açılacak.",
  "Yeniçeriler bir gün kendi elleriyle sona erdirilecek.",
  "Bu minarelerden hoparlörle ezan okunacak.",
  "İnsanlar bir gün ceplerinde dünya taşıyacak.",
  "Bu sarayın kapıları düşmana değil, ziyaretçiye açılacak.",
  "Osmanlı toprakları küçülecek küçülecek...",
  "Bir gün padişah olmayacak, Paşam.",
  "Anadolu'da Türkçe konuşulacak ama alfabe değişecek.",
  "Denizlerden geçen gemiler bir gün dumansız olacak.",
  "Bu savaşlar müzelerde cam arkasında sergilenecek.",
  "Her şey görüntüyle aktarılacak — haber, müzik, şiir hepsi.",
  "Halifenin makamı kaldırılacak.",
  "Bu imparatorluğun torunları cumhuriyet kuracak.",
  "Bir gün insanlar gökyüzünde metal kuşlarla seyahat edecek."
];
let _kehanetIdx = 0;
function getKehanetCard() {
  const isEN = window.LANG === 'en';
  const pool = (isEN && window.EN_KEHANET_TEXTS) ? window.EN_KEHANET_TEXTS : KEHANET_TEXTS;
  const text = pool[_kehanetIdx % pool.length];
  _kehanetIdx++;
  return {
    id: "easter_kehanet_" + _kehanetIdx,
    type: "easter",
    easter_type: "kehanet",
    character: "25-deli_dervis",
    character_name: isEN ? "Mad Dervish" : "Deli Derviş",
    text,
    button: isEN ? "BEGONE, MADMAN!" : "YIKIL ZINNIK!",
    stat_effect: null
  };
}

// ── Tarihsel Figür Kartları ───────────────────────────────────────
const BARBAROS_TEXTS = [
  "Venedik'i dört bir yandan sardım, Paşam. Doğu Akdeniz artık bizim. Batılılar haritayı değiştiremiyor.",
  "Preveze'de karşımda seksen iki gemi vardı. Şimdi hangisi nerede? Ben hâlâ buradayım.",
  "Korsanlık mı dediniz? Osmanlı amiraline 'korsan' diyene kılıcımı yollardım eskiden. Şimdi gülüp geçiyorum.",
  "Fransa ittifakı bazen işe yarar ama rüzgâr döner. Denizde bunu öğrendim, size de öğretirim.",
  "Denizcileri kara askeriyle karıştırma sakın. Birinin işi plan yapmak, benimki plan bozmak.",
  "Cerbe, Preveze, Tunus — her zafer bir sonrakine kapı açar. Durmak yok, Paşam.",
  "Doğu kıyılarını ihmal ettiniz. Bu hata bedelini öder. Deniz af etmez.",
  "Gemilerim için kereste lazım. Yeniçerilere sormayın, orman onların işi değil. Ben bilirim nerede bulunur."
];
let _barbarosIdx = 0;
function getBarbarosCard() {
  const isEN = window.LANG === 'en';
  const pool = (isEN && window.EN_BARBAROS_TEXTS) ? window.EN_BARBAROS_TEXTS : BARBAROS_TEXTS;
  const text = pool[_barbarosIdx % pool.length];
  _barbarosIdx++;
  return { id:"easter_barbaros_"+_barbarosIdx, type:"easter", easter_type:"tarihsel",
    character:"barbaros-hayreddin",
    character_name: isEN ? "Barbarossa Hayreddin Pasha" : "Barbaros Hayreddin Paşa",
    text, button: isEN ? "WELL SAID, ADMIRAL!" : "EYVALLAH REİS", stat_effect:null };
}

const LEONARDO_TEXTS = [
  "Köprü teklifimi III. Bayezid kabul etmedi. Ben hâlâ beklemedeyim. İstanbul'un üzerinde bir köprü şart.",
  "Sizin tüfekleriniz ilginç, Paşam. Mekanizmayı inceleyebilir miyim? Floransa'da bunu kimse görmedi.",
  "Osmanlı minyatürcüleri perspektif kullanmıyor. Ben buna başka bir açıdan bakıyorum — kelimenin tam anlamıyla.",
  "Uçan bir makine tasarladım. Batılılar güldü. Siz de gülün. Ama beş yüz yıl sonra anlayacaksınız.",
  "Su kanallarınız mükemmel, ama pompa sistemi eski. İzin verirseniz sadece bir-iki not alayım.",
  "Atölye açmak istiyorum İstanbul'da, Topkapı yakınları ideal. Işık iyi, ilham çok.",
  "Floransalı Osmanlı'ya çalışır mı diye sordular. 'Emeğin dini yoktur' dedim. Hem de Latince.",
  "Şu gece gökyüzü net. Yıldızlarınızı çiziyorum. Bilim mezhep tanımaz, Paşam."
];
let _leonardoIdx = 0;
function getLeonardoCard() {
  const isEN = window.LANG === 'en';
  const pool = (isEN && window.EN_LEONARDO_TEXTS) ? window.EN_LEONARDO_TEXTS : LEONARDO_TEXTS;
  const text = pool[_leonardoIdx % pool.length];
  _leonardoIdx++;
  return { id:"easter_leonardo_"+_leonardoIdx, type:"easter", easter_type:"tarihsel",
    character:"leonardo-davinci", character_name:"Leonardo da Vinci",
    text, button: isEN ? "WELL DONE, LEO!" : "ALA LEO!", stat_effect:null };
}

// Mahidevran kaldırıldı

const HALIT_TEXTS = [
  "Sadrazam, Hürrem bugün üç mektup gönderdi. Üçü de senin aleyhine. Şaşırma.",
  "Ben Halit Ergenç değilim. Halit Ergenç beni oynuyor. İnce fark ama önemli, Sadrazam.",
  "İbrahim'e de güvendim. Sonunu biliyorsun. Seninle benzerlik hissediyorum — bu iyi değil.",
  "Harem'de yine bir şeyler oluyor. Her zaman bir şeyler oluyor. Artık şaşırmıyorum.",
  "Şehzade Mustafa seninle görüşmek istiyordu. Müsait değildi. Artık hiç müsait olmayacak.",
  "Muhteşem Yüzyıl'da beni yanlış gösterdiler. Hürrem o kadar da güçlü değildi. Yüzde seksendir diyelim.",
  "Set'te yönetmen 'Daha dramatik!' diye bağırırdı. Şimdi sen sakin duruyorsun. İkimiz de yanlış yerdeyiz.",
  "Osmanlı'yı omzumda taşıdım. Dizide de, tarihte de. İkisi de ağırdı ama dizi daha uzun sürdü."
];
let _halitIdx = 0;
function getHalitCard() {
  const isEN = window.LANG === 'en';
  const pool = (isEN && window.EN_HALIT_TEXTS) ? window.EN_HALIT_TEXTS : HALIT_TEXTS;
  const text = pool[_halitIdx % pool.length];
  _halitIdx++;
  return { id:"easter_halit_"+_halitIdx, type:"easter", easter_type:"tarihsel",
    character:"halit-ergenc", character_name:"Kanuni Sultan Süleyman",
    text, button: isEN ? "MAGNIFICENT!" : "MUHTEŞEM!", stat_effect:null };
}

// ── Felaket / Mucize Kartları ─────────────────────────────────────
const FELAKET_TEXTS = [
  "Doğu'dan korkunç haberler geldi — veba, kıtlık ve isyan, hepsi aynı anda.",
  "Saray yangını, hazine kayıpları, yeniçeri huzursuzluğu. Tanrı bu devleti sınamaktadır.",
  "Deprem Konstantiniyye'yi sarstı. Her şey bir anda değişti.",
  "Düşman saldırısı, salgın ve sel felaketi birlikte geldi. Divan dağıldı.",
  "Hazine yağmalandı, surlar çatladı, ulema kriz ilan etti. Kaçış yok."
];
const MUCIZE_TEXTS = [
  "Beklenmedik bir zafer haberi. İmparatorluk nefes aldı, her şey yoluna girdi.",
  "Hazineden kayıp altınlar bulundu, ordu sadakatini yeniledi, ulema şükür duasına durdu.",
  "Sultan fermanıyla tüm anlaşmazlıklar çözüldü. Osmanlı yeniden güçlendi.",
  "Yüzyılın en büyük hasat haberi. Bereket her tarafa yayıldı.",
  "Düşman geri çekildi, ticaret canlandı, sarayda barış hâkim oldu."
];
let _felaketIdx = 0, _mucizeIdx = 0;
function getFelaketCard() {
  const isEN = window.LANG === 'en';
  const pool = (isEN && window.EN_FELAKET_TEXTS) ? window.EN_FELAKET_TEXTS : FELAKET_TEXTS;
  const text = pool[_felaketIdx % pool.length]; _felaketIdx++;
  return { id:"felaket_"+_felaketIdx, type:"easter", easter_type:"felaket",
    character:"kader-felaket", character_name: isEN ? "Fate" : "Kader",
    text, button: isEN ? "SO BE IT" : "PEKÂLÂ", stat_effect: () => {
      for (const s of Object.keys(stats)) {
        const delta = -Math.round(stats[s] * 0.30);
        stats[s] = Math.max(5, stats[s] + delta);
        showStatDelta(s, delta);
      }
      updateStatUI();
    }
  };
}
function getMucizeCard() {
  const isEN = window.LANG === 'en';
  const pool = (isEN && window.EN_MUCIZE_TEXTS) ? window.EN_MUCIZE_TEXTS : MUCIZE_TEXTS;
  const text = pool[_mucizeIdx % pool.length]; _mucizeIdx++;
  return { id:"mucize_"+_mucizeIdx, type:"easter", easter_type:"mucize",
    character:"kader-mucize", character_name: isEN ? "Fate" : "Kader",
    text, button: isEN ? "SO BE IT" : "PEKÂLÂ", stat_effect: () => {
      for (const s of Object.keys(stats)) {
        const delta = Math.round(stats[s] * 0.30);
        stats[s] = Math.min(95, stats[s] + delta);
        showStatDelta(s, delta);
      }
      updateStatUI();
    }
  };
}

// ── Zaman Yolcusu ────────────────────────────────────────────────
// ── Fısıltı Karakteri ────────────────────────────────────────────
const FISILDAYAN_TEXTS = [
  "Yarın birisi sizi Sultan'a şikâyet edecek. Dikkatli olun, Paşam.",
  "Hazinede bir şeyler eksik. Kimse görmüyor, ama ben görüyorum.",
  "Divan'da bir hain var. Henüz kim olduğunu bilmiyorum ama yakında anlayacaksınız.",
  "Bu gece sarayda kimseye güvenmeyin. Sadece kendiniize.",
  "Bir sonraki kararınız her şeyi değiştirebilir. Sabırsızlanmayın.",
  "Yeniçeriler memnun değil. Bunu yüzünüze söyleyen olmaz ama kulak verin.",
  "Sultan geceleri sizin hakkınızda konuşuyor. Hayırlısı olsun."
];
let _fisildayanIdx = 0;
let _easterFisildayanNext = 110;

function getFisildayanCard() {
  const isEN = window.LANG === 'en';
  const pool = (isEN && window.EN_FISILDAYAN_TEXTS) ? window.EN_FISILDAYAN_TEXTS : FISILDAYAN_TEXTS;
  const text = pool[_fisildayanIdx % pool.length];
  _fisildayanIdx++;
  return { id:"fisildayan_"+_fisildayanIdx, type:"easter", easter_type:"fisildayan",
    character:"fisildayan", character_name:"???",
    text, button:"...", stat_effect: null };
}

const ZAMAN_TEXTS = [
  "Paşam, insanlar cebinde bir şey taşıyor — telefon diyorlar. Tüm kütüphane içinde. Ama 'selam nasılsın' mesajına iki günde cevap veriyorlar.",
  "Bir hastalık çıktı, tüm dünya evine kapandı. İki yıl. Veba bu kadar bile yapamamıştı. Üstelik ekmek maya stokları tükendi önce.",
  "Yapay zeka icat ettiler. Şiir yazıyor, resim çiziyor, sadrazam bile olabilir. Sizi tehdit etmesini istedim ama reddetti, 'etik kaygılarım var' dedi.",
  "Paşam, bir adam 'influencer' oluyor — yani hiçbir şey yapmadan güzel görünerek para kazanıyor. Divan'da neden böyle bir kadro yok anlamıyorum.",
  "Kripto para denen görünmez altın icat ettiler. Değeri bir gecede yarıya indi. İnsanlar yine de aldı. Hazinedar olsaydınız ağlardınız.",
  "Uzaya tur satılıyor Paşam. Padişah değil, sıradan zengin gidiyor. Yedi kat semaya çıkıyorlar, sonra dönüyorlar ve bunu herkese anlatıyorlar.",
  "Sosyal medya var, milyonlar birbirine bakıyor. Bir kedi videosu Divan fermanından daha fazla insan görüyor. Kedi ünlü, sizin adınızı bilmiyor.",
  "İnsanlar telefona bakarak yürüyor, direğe çarpıyor, nehre düşüyor. Kimse durmuyor çünkü herkes telefona bakıyor. Şehir böyle işliyor.",
  "Paşam, seçimler var — her vatandaş oy kullanıyor. Siz de Divan'da böyle yapmayı düşündünüz mü? Neyse, tavsiye etmiyorum.",
  "Bir adam internette 'benim günlük rutinom' diye video çekiyor — sabah kahvesi, spor, öğle yemeği. Bunu milyonlar izliyor. Ben de izledim, itiraf ediyorum.",
  "Otonom araçlar icat ettiler Paşam. Arabalar kendi kendine gidiyor. Sürücü içinde uyuyor. Atlı haberci diyeceksiniz, evet, o da uyuyordu aslında.",
  "Bir adam Mars'a yerleşmek istiyor. Mars. İstanbul'da daire bulamadığı için değil, orada buluyor demek ki.",
  "Paşam, 'podcast' denen şey var. Birisi konuşuyor, milyonlar kulaklıkla dinliyor. Ben de Seyahatname'yi okusaydım podcast yapardım.",
  "Online alışveriş var — her şey eve geliyor. Çarşı neredeyse kapandı. Bakkal yıkıldı. Hazinedar mı olacaksınız, düşünün.",
  "Bir uygulama var, yüzünüzü çekip 30 yıl sonrasını gösteriyor. Herkes baktı, herkes üzüldü. Paşam sizin de bakmanızı önermiyorum.",
  "İnsanlar artık 'burnout' oluyorlar — çok çalışmaktan bitiyorlar. Divan'da bu kavram yoktur, burada ya çalışırsınız ya idam edilirsiniz.",
  "Bir kutu oyunu var, 'Catan' diyorlar — kaynak topluyorsunuz, yol kuruyorsunuz. Osmanlı aynısını gerçekte yaptı, üstelik sürüm 1.0'dı.",
  "Filistin'de hâlâ savaş var. Osmanlı zamanında da vardı. Bazı şeyler değişmiyor Paşam.",
  "Yapay zeka resim çiziyor. Bir ressam 'beni kopyaladılar' diye mahkemeye verdi. Mahkeme anlamadı. Cellat'a sorsaydılar daha pratik çözerdi.",
  "Paşam, 'influencer'lar artık siyaset yapıyor. Takipçileri var, programları var, saçları var. Bizim Divan'dan tek farkı saçları."
];

// Shuffle yardımcısı — Fisher-Yates
function _shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let _zamanShuffled = [];
let _zamanIdx = 0;

function _initZamanShuffle() {
  _zamanShuffled = _shuffleArray(ZAMAN_TEXTS);
  _zamanIdx = 0;
}

function getZamanCard() {
  const isEN = window.LANG === 'en';
  const srcTexts = (isEN && window.EN_ZAMAN_TEXTS) ? window.EN_ZAMAN_TEXTS : ZAMAN_TEXTS;
  if (_zamanIdx >= _zamanShuffled.length) {
    // Tüm cümleler bitti — yeniden karıştır (ilk eleman son kullanılandan farklı olsun)
    const last = _zamanShuffled[_zamanShuffled.length - 1];
    _zamanShuffled = _shuffleArray(srcTexts);
    if (_zamanShuffled[0] === last) _zamanShuffled.push(_zamanShuffled.shift());
    _zamanIdx = 0;
  }
  const text = _zamanShuffled[_zamanIdx++];
  return { id:"zaman_"+_zamanIdx, type:"easter", easter_type:"zaman",
    character:"zaman-yolcusu",
    character_name: isEN ? "Time Traveler" : "Zaman Yolcusu",
    text, button: isEN ? "WHAT DO YOU THINK, MADMAN?" : "NE DERSİN ZINNIK?", stat_effect: null };
}

const _HIST_GETTERS = [getBarbarosCard, getLeonardoCard, getHalitCard];
function getNextHistoricalCard() {
  const fn = _HIST_GETTERS[_easterHistIdx % _HIST_GETTERS.length];
  _easterHistIdx++;
  return fn();
}

const EVLIYA_TEXTS = [
  "Topkapı'ya geldim, gördüm, yazdım. Şimdi İstanbul'da oturduğum yer bilinmiyor ama dünyanın en güzel şehri burası.",
  "Yemen'de gördüm ki develer kadıyı tanıyor. İstanbul'daysa kadı develeri tanımıyor. Enteresan, efendim.",
  "Seksen yedi yılda yüz kırk dört bin kilometre yol yaptım. Paşam, sen hiç seyahat etmeden nasıl idare ediyorsun?",
  "Nil'de timsahla yüzdüm. Şişman olduğu için yavaştı, ben de kaçtım. Hayat bir macera, efendim.",
  "Gürcistan'da bir müzisyen yirmi dil biliyordu. Ben sadece on dört. Mahçup oldum, not aldım, yola devam ettim.",
  "Kırım'da bir hanın sarayında kaldım. Yemekleri mükemmeldi ama misafirperverlik dörtte birdi. Osmanlı'da yetişince anlarsınız.",
  "Rüyamda Hazreti Peygamber'e 'şefaat' dedim, 'seyahat' çıktı. İşte bu yüzden hâlâ yoldayım, Paşam.",
  "Buhara'dan getirdiğim baharatı Venedikli'ye sattım, o Fransız'a. Fiyat yüzde seksen arttı. Piyasa böyle işliyor.",
  "Avrupalıların da vezirleri birbirini gammazlıyor, Paşam. Evrensel bir meslek bu, teselliye bak.",
  "On yedi yıldır her şeyi yazdım. Seyahatnameyi bitirince ne yapacağımı bilmiyorum. Sanırım yeni bir seyahat."
];

const EASTER_CARDS = {
  saray_kedisi: {
    id: "easter_saray_kedisi",
    type: "easter",
    easter_type: "kedi",
    character: "easter-kedi",
    character_name: "Saray Kedisi",
    text: "Topkapı'nın meşhur kedisi divanı bastı ve kararname tomarını devirdi.",
    button: "ÂLÂ",
    stat_effect: () => {
      const statKeys = Object.keys(stats);
      const target = statKeys[Math.floor(Math.random() * statKeys.length)];
      const delta = Math.random() < 0.5 ? 3 : -3;
      stats[target] = Math.min(100, Math.max(0, stats[target] + delta));
      showStatDelta(target, delta);
      updateStatUI();
    }
  },
  yanlis_adam: {
    id: "easter_yanlis_adam",
    type: "easter",
    easter_type: "yanlis",
    character: "easter-yanlis",
    character_name: "Yanlış Adam",
    text: "Yanlış odaya girdim efendim, özür dilerim.",
    button: "DEVRÜL KARŞIMDAN",
    stat_effect: null
  },
  kehanet: {
    id: "easter_kehanet",
    type: "easter",
    easter_type: "kehanet",
    character: "25-deli_dervis",
    character_name: "Deli Derviş",
    text: "Bu imparatorluk 1453 yıl sonra sona erecek, Paşam.",
    button: "YIKIL ZINNIK!",
    stat_effect: null
  },
  pargali: {
    id: "easter_pargali",
    type: "easter",
    easter_type: "pargali",
    character: "pargali-ibrahim",
    character_name: "Pargalı İbrahim Paşa",
    text: "Sen beni unuttun mu, Süleyman?.. Topkapı'nın koridorları hâlâ beni biliyor.",
    button: "PARGALI?",
    stat_effect: null
  }
};

// Evliya'yı her 30 kartta bir tetikle
let _evliyaTextIdx = 0;
function getEvliyaCard() {
  const isEN = window.LANG === 'en';
  const pool = (isEN && window.EN_EVLIYA_TEXTS) ? window.EN_EVLIYA_TEXTS : EVLIYA_TEXTS;
  const text = pool[_evliyaTextIdx % pool.length];
  _evliyaTextIdx++;
  return {
    id: "easter_evliya_" + _evliyaTextIdx,
    type: "easter",
    easter_type: "evliya",
    character: "evliya-celebi",
    character_name: "Evliya Çelebi",
    text,
    button: isEN ? "My Regards" : "Eyvallah",
    stat_effect: null
  };
}

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
// Gizli görevler sistemi kaldırıldı

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

// Easter egg sayaçları (oyun başında sıfırlanır)
let _easterKediNext    = 65;
let _easterYanlisNext  = 55;
let _easterYanlisCount = 0;
let _easterKehanetNext = 60;
let _easterEvliyaNext  = 45;
let _easterPargaliDone = false;
let _easterHistNext    = 70;  // Barbaros / Leonardo / Mahidevran
let _easterHistIdx     = 0;
let _easterZamanNext   = 80;  // Zaman Yolcusu
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

// ── Item Koşul Tablosu ────────────────────────────────────────────
// Her kart için item kazanmak amacıyla gereken ek koşullar.
// check(stats, year, sultanSabir) → true ise item verilir.
const ITEM_GRANT_CONDITIONS = {
  'sultan_tımar_ödülü': {
    desc: "Saray ≥ 55 ve en az 3. yıl",
    check: () => stats.saray >= 55 && year >= 3
  },
  'yeniceri_tüfek_talebi': {
    desc: "Ordu ≥ 50 ve en az 2. yıl",
    check: () => stats["yeniçeri"] >= 50 && year >= 2
  },
  'defterdar_borç_teklifi': {
    desc: "Hazine ≥ 50 ve en az 3. yıl",
    check: () => stats.hazine >= 50 && year >= 3
  },
  'hekimbasi_darüşşifa': {
    desc: "Herhangi bir stat ≤ 35 (kritik durumda)",
    check: () => Object.values(stats).some(v => v <= 35)
  },
  'derviş_kıyamet': {
    desc: "Ulema ≤ 40 veya Sultan sabrı ≤ 40",
    check: () => stats.ulema <= 40 || sultanSabir <= 40
  },
  'casuslar_gizli_kimlik': {
    desc: "En az 4. yıl ve Saray 25-65 arası",
    check: () => year >= 4 && stats.saray >= 25 && stats.saray <= 65
  },
};

function checkItemGrantCondition(cardId) {
  const cond = ITEM_GRANT_CONDITIONS[cardId];
  if (!cond) return true; // koşulsuz kart
  return cond.check();
}

// ── Item Sistemi ──────────────────────────────────────────────────
const ITEMS = {
  altin_muhur:    { icon: "assets/icons/item-altin-muhur.png",    name: "Altın Mühür",    desc: "Sonraki hazine cezasını sıfırla",      effect: "block_hazine",  color: "#C9A227" },
  sultan_ferman:  { icon: "assets/icons/item-sultan-ferman.png",  name: "Sultan Fermanı", desc: "Sonraki saray cezasını sıfırla",       effect: "block_saray",   color: "#9b59b6" },
  yeniceri_nisan: { icon: "assets/icons/item-yeniceri-nisan.png", name: "Yeniçeri Nişanı",desc: "Sonraki ordu cezasını sıfırla",       effect: "block_yeniceri",color: "#e74c3c" },
  sifa_otu:       { icon: "assets/icons/item-sifa-otu.png",       name: "Şifa Otu",       desc: "En düşük stat +20 (anlık)",           effect: "heal_20",       color: "#27ae60" },
  casus_maskesi:  { icon: "assets/icons/item-casus-maskesi.png",  name: "Casus Maskesi",  desc: "Bu kartı atla, sonraki kart gelsin",  effect: "skip_card",     color: "#2980b9" },
  dervis_muska:   { icon: "assets/icons/item-dervis-muska.png",   name: "Derviş Muskası", desc: "Bu kart Sultan sabrını etkilemez",    effect: "block_sabir",   color: "#8e44ad" },
};

// Her item için oyuncu rehberi
const ITEM_HOW_TO_USE = {
  altin_muhur:    "Hazineni korumak için kullan. Bir sonraki kartta hazine cezası gelecekse eşyayı önceden aktive et — ceza sıfırlanır. Hazinen kritik düşeceği anlarda can simidi.",
  sultan_ferman:  "Saray puanın tehlikede olduğu anlarda kullan. Bir sonraki kartta saray cezası gelecekse aktive et, ceza geçmez. Sultan'ın gözünden düşmek üzereyken kullan.",
  yeniceri_nisan: "Orduyu kaybetmek üzere olduğun anlarda kullan. Bir sonraki kartta ordu cezası gelecekse aktive et, zarar gelmez. Yeniçeri isyanı ya da savaş kartlarına karşı güçlü.",
  sifa_otu:       "Hemen etkili! Aktive ettiğin anda en düşük statına +20 ekler. Tükenmek üzereyken veya kritik durumlarda anlık kurtarıcı.",
  casus_maskesi:  "İstemediğin bir kart geldiğinde kullan. Aktive edince mevcut kartı tamamen atlar, bir sonraki kart gelir. Tehlikeli bir karakterden kaçmak için ideal.",
  dervis_muska:   "Sultan sabrı azaltıcı kartlara karşı kullan. Aktive edince bir sonraki kart Sultan sabrını hiç etkilemez. Sultan'ın sabrı azalıyorken hayat kurtarır.",
};

let playerItems = [null, null, null];
let playerItemExpiry = [null, null, null]; // Her item için kalan kart sayısı (3'ten geri sayar)
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
// ★ GOD MODE — intro footer'a 3 hızlı tap ile toggle
(function() { // ★ GOD MODE
  let tapCount = 0, tapTimer = null; // ★ GOD MODE
  document.getElementById("intro-footer").addEventListener("click", () => { // ★ GOD MODE
    tapCount++; // ★ GOD MODE
    clearTimeout(tapTimer); // ★ GOD MODE
    tapTimer = setTimeout(() => { tapCount = 0; }, 600); // ★ GOD MODE
    if (tapCount >= 20) { tapCount = 0; toggleGodMode(); } // ★ GOD MODE
  }); // ★ GOD MODE
})(); // ★ GOD MODE

// Splash ekranı bitince (3 sn) menü müziğini başlat
// iOS'ta AudioContext kullanıcı etkileşimi gerektirir — ilk dokunuşta başlat ama splash sonrası hazır ol
let _menuMusicReady = false;
let _menuMusicRequested = false;

setTimeout(() => {
  _menuMusicReady = true;
  if (_menuMusicRequested) playMenuMusic(); // Kullanıcı zaten dokunmuşsa hemen başlat
}, 3000);

function _tryStartMenuMusic() {
  if (_menuMusicReady) {
    playMenuMusic();
  } else {
    _menuMusicRequested = true; // Hazır olunca başlasın
  }
}

// İlk kullanıcı etkileşimini yakala (iOS AudioContext için şart)
document.addEventListener('touchstart', function _firstTouch() {
  _menuMusicRequested = true;
  if (_menuMusicReady) playMenuMusic();
  document.removeEventListener('touchstart', _firstTouch);
}, { once: true, passive: true });
document.addEventListener('mousedown', function _firstClick() {
  _menuMusicRequested = true;
  if (_menuMusicReady) playMenuMusic();
  document.removeEventListener('mousedown', _firstClick);
}, { once: true });

document.getElementById("btn-start").addEventListener("click", () => {
  if (window.playSelectConfirm) playSelectConfirm();
  isPasaMode = false;
  introScreen.style.display = "none";
  showSultanScreen();
});

document.getElementById("btn-pasa-mode").addEventListener("click", () => {
  if (window.playSelectConfirm) playSelectConfirm();
  isPasaMode = true;
  introScreen.style.display = "none";
  showSultanScreen();
});

document.getElementById("btn-akcesystem").addEventListener("click", () => {
  const overlay = document.createElement("div");
  overlay.id = "akcesystem-overlay";
  overlay.innerHTML = `
    <div id="akcesystem-box">
      <div id="akcesystem-icon">🪙</div>
      <div id="akcesystem-title">YAKINDA!</div>
      <div id="akcesystem-divider"></div>
      <div id="akcesystem-text">Bazen işler yolunda gitmediğinde biraz akçeyle bu işi çözebilirsin. Yakında burada olacak!</div>
      <button id="akcesystem-close">ANLADIM</button>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => { overlay.style.opacity="0"; overlay.style.transition="opacity 0.25s"; setTimeout(()=>overlay.remove(),260); };
  document.getElementById("akcesystem-close").onclick = close;
  overlay.addEventListener("click", e => { if(e.target===overlay) close(); });
});

document.getElementById("btn-howto").addEventListener("click", () => {
  introScreen.style.display = "none";
  howtoScreen.classList.add("visible");
});

document.getElementById("btn-howto-back").addEventListener("click", () => {
  howtoScreen.classList.remove("visible");
  introScreen.style.display = "";
});

document.getElementById("btn-play-now").addEventListener("click", () => {
  howtoScreen.classList.remove("visible");
  introScreen.style.display = "";
});

document.getElementById("restart-btn").addEventListener("click", restartGame);

// ── Sultan Seçim — Global Fonksiyonlar ───────────────────────────
function confirmSultan() {
  if (!selectedSultan) { alert("Lütfen bir sultan seçin."); return; }
  if (window.playSelectConfirm) playSelectConfirm();
  sultanScreen.classList.add("hidden");
  showAdvisorScreen();
}
function backToIntro() {
  sultanScreen.classList.add("hidden");
  introScreen.style.display = "";
}
function backToSultan() {
  advisorScreen.classList.add("hidden");
  showSultanScreen();
}
function confirmAdvisor() {
  if (selectedAdvisors.length !== 2) { alert("Lütfen tam olarak 2 danışman seçin."); return; }
  if (window.playSelectConfirm) playSelectConfirm();
  advisorScreen.classList.add("hidden");
  startGame();
}

// ── Sultan Seçim Ekranı ───────────────────────────────────────────
function showSultanScreen() {
  sultanScreen.classList.remove("hidden");
  selectedSultan = null;
  const grid = document.getElementById("sultan-grid");
  grid.innerHTML = "";
  SULTANS.forEach(s => {
    const btn = document.createElement("div");
    btn.className = "sultan-card";
    const enS = (window.LANG === 'en' && window.EN_SULTANS && window.EN_SULTANS[s.id]) || {};
    const sName = enS.name || s.name;
    const sDesc = enS.desc || s.desc;
    btn.innerHTML = `
      <div class="sc-name">${sName}</div>
      <div class="sc-desc">${sDesc}</div>
      <div class="sc-stats">
        <span>👑 ${s.stats.saray}</span>
        <span>⚔️ ${s.stats["yeniçeri"]}</span>
        <span>🕌 ${s.stats.ulema}</span>
        <span>💰 ${s.stats.hazine}</span>
      </div>
    `;
    btn.onclick = () => {
      document.querySelectorAll(".sultan-card").forEach(el => el.classList.remove("selected"));
      btn.classList.add("selected");
      selectedSultan = s;
    };
    grid.appendChild(btn);
  });
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
    const enA = (window.LANG === 'en' && window.EN_ADVISORS && window.EN_ADVISORS[a.id]) || {};
    const aName  = enA.name  || a.name;
    const aTitle = enA.title || a.title;
    const aDesc  = enA.desc  || a.desc;
    btn.innerHTML = `
      <div class="ac-icon">${a.icon}</div>
      <div>
        <div class="ac-name">${aName}</div>
        <div class="ac-title">${aTitle}</div>
        <div class="ac-desc">${aDesc}</div>
      </div>
    `;
    btn.onclick = () => {
      if (btn.classList.contains("selected")) {
        btn.classList.remove("selected");
        selectedAdvisors = selectedAdvisors.filter(x => x.id !== a.id);
      } else {
        if (selectedAdvisors.length >= 2) { alert(window.t('advisor.max_alert')); return; }
        btn.classList.add("selected");
        selectedAdvisors.push(a);
      }
      const countEl = document.getElementById("advisor-count");
      if (countEl) countEl.textContent = window.LANG === 'en'
        ? (selectedAdvisors.length + "/2 selected")
        : (selectedAdvisors.length + "/2 seçildi");
    };
    grid.appendChild(btn);
  });
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

  // Easter egg sayaçları sıfırla
  _easterKediNext    = 65;
  _easterYanlisNext  = 55;
  _easterYanlisCount = 0;
  _easterKehanetNext = 60;
  _easterEvliyaNext  = 45;
  _easterPargaliDone = false;
  _padisahZiyaretiNext  = 50;
  _padisahZiyaretiCount = 0;
  _sultanWarningShown   = false;
  _easterHistNext    = 70;
  _easterHistIdx     = 0;
  _easterZamanNext   = 80;
  _easterFisildayanNext = 95;
  _fisildayanIdx     = 0;
  _donumNextCard     = 42;
  _donumShownThisGame = false;
  _evliyaTextIdx     = 0;
  _initZamanShuffle();
  _kehanetIdx        = 0;
  _felaketIdx        = 0;
  _mucizeIdx         = 0;
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
  playerItemExpiry = [null, null, null];
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

  gameScreen.classList.remove("hidden");

  dealNext();

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

// ── MP3 MÜZİK SİSTEMİ (Playlist + Shuffle + Fade) ───────────────
const MUSIC_VOL = 0.60;   // Genel ses seviyesi — rahatsız etmeyecek düzeyde
const FADE_MS   = 1500;   // Kategori geçiş süresi (ms)
const FADE_END  = 3.0;    // Parça bitmeden kaç saniye önce fade-out başlar

// ── Playlist tanımları ────────────────────────────────────────────
const _MENU_TRACKS = [
  'assets/music/menu.mp3',
  'assets/music/menu1.mp3'
];
const _GAME_TRACKS = [
  'assets/music/oyunici.mp3',
  'assets/music/oyun1.mp3',
  'assets/music/oyun2.mp3',
  'assets/music/oyun3.mp3'
];

// Her kategori için durum nesnesi
const _music = {
  menu: { audio: null, tracks: _MENU_TRACKS, queue: [], qi: 0, fading: false },
  game: { audio: null, tracks: _GAME_TRACKS, queue: [], qi: 0, fading: false }
};
let _activeMusicTarget = null;

// Fisher-Yates karıştırma
function _shuffleTracks(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sıradaki parçayı al — liste bitince yeniden karıştır
function _nextTrack(m) {
  if (m.qi >= m.queue.length) {
    m.queue = _shuffleTracks(m.tracks);
    m.qi = 0;
  }
  return m.queue[m.qi++];
}

// Audio element'e parça-sonu handler ekle (fade out → fade in next)
function _attachEndHandler(audio, m) {
  audio.ontimeupdate = function() {
    if (m.fading || !audio.duration) return;
    if (audio.currentTime >= audio.duration - FADE_END) {
      m.fading = true;
      _fadeVol(audio, 0, 2000, () => {
        audio.src = _nextTrack(m);
        audio.load();
        m.fading = false;
        audio.play().catch(() => {});
        _fadeVol(audio, MUSIC_VOL, 1800);
      });
    }
  };
}

function _ensureAudio() {
  ['menu', 'game'].forEach(cat => {
    const m = _music[cat];
    if (!m.audio && m.tracks.length > 0) {
      m.audio = new Audio(_nextTrack(m));
      m.audio.volume = 0;
      _attachEndHandler(m.audio, m);
    }
  });
}

function _fadeVol(audio, target, duration, callback) {
  if (!audio) return;
  clearInterval(audio._fadeInterval);
  const start = audio.volume;
  const diff  = target - start;
  const steps = Math.max(1, Math.round(duration / 30));
  let count = 0;
  audio._fadeInterval = setInterval(() => {
    count++;
    audio.volume = Math.max(0, Math.min(1, start + (diff / steps) * count));
    if (count >= steps) {
      clearInterval(audio._fadeInterval);
      audio.volume = target;
      if (target <= 0.001) { audio.pause(); }
      if (callback) callback();
    }
  }, 30);
}

function _switchMusic(target) {
  _ensureAudio();
  if (_activeMusicTarget === target) return;
  _activeMusicTarget = target;

  const mIn  = _music[target];
  const mOut = _music[target === 'menu' ? 'game' : 'menu'];

  // Çıkan müziği fade out — fading flag'i set et, sonraki parça tetiklenmesin
  if (mOut.audio && !mOut.audio.paused) {
    mOut.fading = true;
    _fadeVol(mOut.audio, 0, FADE_MS, () => {
      if (mOut.audio) { mOut.audio.pause(); mOut.audio.currentTime = 0; }
      mOut.fading = false;
    });
  }

  // Gelen müziği yarı-geçiş sonrası fade in
  const delay = (mOut.audio && !mOut.audio.paused) ? FADE_MS / 2 : 0;
  setTimeout(() => {
    if (!mIn.audio) return;
    mIn.audio.play().catch(() => {});
    _fadeVol(mIn.audio, MUSIC_VOL, FADE_MS);
  }, delay);
}

function playMenuMusic() { _switchMusic('menu'); }
function playGameMusic()  { _switchMusic('game'); }
function stopAllMusic() {
  _activeMusicTarget = null;
  _ensureAudio();
  ['menu', 'game'].forEach(cat => {
    const m = _music[cat];
    if (m.audio) {
      m.fading = true;
      _fadeVol(m.audio, 0, FADE_MS, () => {
        if (m.audio) { m.audio.pause(); m.audio.currentTime = 0; }
        m.fading = false;
      });
    }
  });
}

// Uygulama background'a geçince duraklat, geri gelince devam et
document.addEventListener('visibilitychange', () => {
  const ma = _music.menu.audio, ga = _music.game.audio;
  if (!ma && !ga) return;
  if (document.hidden) {
    if (ma && !ma.paused) { ma.pause(); ma._wasPlaying = true; }
    if (ga && !ga.paused) { ga.pause(); ga._wasPlaying = true; }
  } else {
    if (_activeMusicTarget === 'menu' && ma && ma._wasPlaying) { ma.play().catch(() => {}); ma._wasPlaying = false; }
    if (_activeMusicTarget === 'game' && ga && ga._wasPlaying) { ga.play().catch(() => {}); ga._wasPlaying = false; }
  }
});

// ── AMBIENT MÜZİK (Web Audio — efekt sesleri için korundu) ───────
let ambientCtx = null;
let ambientNodes = [];
let ambientRunning = false;

function startAmbientMusic() {
  playGameMusic(); // MP3 oyun müziğine geç
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

  const c = ambientCtx;
  const now = c.currentTime;
  const DUR = 14; // saniye
  const nodes = [];

  // Reverb (window.createReverb sounds.js'de global olarak tanımlı)
  const rev = (window.createReverb ? window.createReverb(c, 2.5, 2.5) : null) || c.createGain();
  rev.connect(c.destination);

  // ── 1. NEY DRONE ──────────────────────────────────────────────────
  // Hicaz makamı: gündüz D3 (146.83), gece C3 (130.81) temel
  const neyBase = isNight ? 130.81 : 146.83;

  const neyOsc = c.createOscillator();
  neyOsc.type = 'triangle';
  neyOsc.frequency.value = neyBase;

  // Vibrato (ney titreşimi)
  const vibOsc = c.createOscillator();
  vibOsc.frequency.value = 5.5;
  const vibGain = c.createGain();
  vibGain.gain.value = 2.5;
  vibOsc.connect(vibGain);
  vibGain.connect(neyOsc.frequency);

  // Nefes sesi (ney'in hava sesi)
  const noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const noiseSrc = c.createBufferSource();
  noiseSrc.buffer = noiseBuf; noiseSrc.loop = true;
  const noiseBp = c.createBiquadFilter();
  noiseBp.type = 'bandpass'; noiseBp.frequency.value = neyBase * 3; noiseBp.Q.value = 10;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.008;
  noiseSrc.connect(noiseBp); noiseBp.connect(noiseGain);

  const neyMaster = c.createGain();
  neyMaster.gain.setValueAtTime(0, now);
  neyMaster.gain.linearRampToValueAtTime(0.07, now + 2);
  neyMaster.gain.setValueAtTime(0.1, now + DUR - 2);
  neyMaster.gain.linearRampToValueAtTime(0, now + DUR);

  neyOsc.connect(neyMaster); noiseGain.connect(neyMaster);
  neyMaster.connect(rev); neyMaster.connect(c.destination);
  neyOsc.start(now); vibOsc.start(now); noiseSrc.start(now);
  nodes.push(neyOsc, vibOsc, noiseSrc);

  // ── 2. HİCAZ MAKAM MELODİSİ ─────────────────────────────────────
  // D Hicaz: D Eb F# G A Bb C D
  const HICAZ = [
    neyBase,            // D
    neyBase * 1.0595,   // Eb (minor second)
    neyBase * 1.2599,   // F# (augmented second — karakteristik Hicaz aralığı)
    neyBase * 1.3348,   // G
    neyBase * 1.4983,   // A
    neyBase * 1.5874,   // Bb
    neyBase * 1.7818,   // C
    neyBase * 2         // D (üst oktav)
  ];

  const noteCount = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < noteCount; i++) {
    const t = now + 2.5 + Math.random() * (DUR - 5);
    const freq = HICAZ[Math.floor(Math.random() * HICAZ.length)];
    const useHighOct = Math.random() < 0.25;

    const mOsc = c.createOscillator();
    mOsc.type = 'triangle';
    mOsc.frequency.value = freq * (useHighOct ? 2 : 1);

    const mVib = c.createOscillator();
    mVib.frequency.value = 5 + Math.random() * 1.2;
    const mVibG = c.createGain();
    mVibG.gain.value = 3;
    mVib.connect(mVibG); mVibG.connect(mOsc.frequency);

    const mGain = c.createGain();
    const noteDur = 0.6 + Math.random() * 0.8;
    mGain.gain.setValueAtTime(0, t);
    mGain.gain.linearRampToValueAtTime(0.055, t + 0.12);
    mGain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);

    mOsc.connect(mGain); mGain.connect(rev); mGain.connect(c.destination);
    mOsc.start(t); mVib.start(t);
    mOsc.stop(t + noteDur + 0.1); mVib.stop(t + noteDur + 0.1);
    nodes.push(mOsc, mVib);
  }

  // ── 3. DEF (Çerçeve davulu) — gündüz, %60 olasılık ──────────────
  if (!isNight && Math.random() < 0.6) {
    // Basit usul: düm tek tek düm tek
    const defPattern = [0, 0.75, 1.1, 1.5, 2.25, 2.6, 3.0, 3.75, 4.1];
    const defStart = now + 3;
    defPattern.forEach(offset => {
      const t = defStart + offset;
      const isDum = offset % 1.5 < 0.2; // güçlü vuruş
      const dOsc = c.createOscillator();
      dOsc.type = 'sine';
      dOsc.frequency.setValueAtTime(isDum ? 170 : 120, t);
      dOsc.frequency.exponentialRampToValueAtTime(isDum ? 55 : 70, t + 0.09);
      const dGain = c.createGain();
      dGain.gain.setValueAtTime(isDum ? 0.04 : 0.025, t);
      dGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      dOsc.connect(dGain); dGain.connect(c.destination);
      dOsc.start(t); dOsc.stop(t + 0.15);
      nodes.push(dOsc);
    });
  }

  // ── 4. TAMBUR TELI — yumuşak, sporadic ───────────────────────────
  if (Math.random() < 0.4) {
    const tamburFreqs = [HICAZ[0], HICAZ[2], HICAZ[4], HICAZ[7]];
    const t = now + 5 + Math.random() * 4;
    const freq = tamburFreqs[Math.floor(Math.random() * tamburFreqs.length)];
    const tOsc = c.createOscillator();
    tOsc.type = 'sawtooth';
    tOsc.frequency.value = freq;
    const tFilter = c.createBiquadFilter();
    tFilter.type = 'lowpass'; tFilter.frequency.value = 800;
    const tGain = c.createGain();
    tGain.gain.setValueAtTime(0.06, t);
    tGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    tOsc.connect(tFilter); tFilter.connect(tGain);
    tGain.connect(rev); tGain.connect(c.destination);
    tOsc.start(t); tOsc.stop(t + 1.3);
    nodes.push(tOsc);
  }

  ambientNodes = nodes;

  setTimeout(() => {
    nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    ambientNodes = [];
    if (ambientRunning && !isGameOver) setTimeout(playAmbientLayer, 400);
  }, DUR * 1000);
}

function stopAmbientMusic() {
  playMenuMusic(); // Game Over / Restart → menü müziğine geri dön
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
      sultanWarningShown: _sultanWarningShown,
      playerItems, playerItemExpiry, selectedSultanId: selectedSultan?.id,
      selectedAdvisorIds: selectedAdvisors.map(a => a.id),
      characterMemory, factionFavors, factionPressureSent,
      playCounts, cursedEver, traitorInvestigated, hiddenTraitor,
      scheduledCards, forcedQueueIds: forcedQueue.map(c => c.id),
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
  playerItemExpiry = s.playerItemExpiry || [null,null,null];
  characterMemory = s.characterMemory || {};
  factionFavors = s.factionFavors || {saray:0,ordu:0,din:0,halk:0};
  factionPressureSent = s.factionPressureSent || {saray:false,ordu:false,din:false,halk:false};
  playCounts = s.playCounts || {};
  cursedEver = s.cursedEver;
  traitorInvestigated = s.traitorInvestigated;
  hiddenTraitor = s.hiddenTraitor;
  scheduledCards = s.scheduledCards || [];
  forcedQueue = (s.forcedQueueIds || []).map(id => allCards.find(c => c.id === id)).filter(Boolean);
  _sultanWarningShown = s.sultanWarningShown || false;
  isGameOver = false;
  activeArcs = {};
  triggeredArcs = {};
  deathCharacterKey = null;
  isInvestigating = false;
  dangerPulseActive = false;

  if (titleLabel) titleLabel.textContent = currentTitle;
  if (isNight) gameScreen.classList.add("night-mode");
  else gameScreen.classList.remove("night-mode");

  updateItemBar();
  updateYearLabel();
  updateStatUI();
  updateDynamicSubtitle();
  ensureFateBar();
  // Tutorial atlansın — devam ediyoruz
  localStorage.setItem('sadrazam_tutorial_done', '1');
  gameScreen.classList.remove("hidden");
  dealNext();
}

// ── Osmanlı Takvimi ───────────────────────────────────────────────
function updateYearLabel() {
  if (!yearLabel) return;
  const months = (window.LANG === 'en' && window.EN_HICRI_MONTHS) ? window.EN_HICRI_MONTHS : HICRI_MONTHS;
  const monthName = months[hicriMonth % 12];
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
  const isEN = window.LANG === 'en';
  const ctx = isEN ? window.EN_CONTEXT_SUBTITLES : {};
  const arr = isEN ? window.EN_DYNAMIC_SUBTITLES : DYNAMIC_SUBTITLES;

  if (stats.hazine < 25)           subtitle = isEN ? ctx.hazine_low    : "Hazinenin Dibini Gördüğümüz Yıl";
  else if (stats["yeniçeri"] > 75) subtitle = isEN ? ctx.yeniceri_high : "Orduların Gözde Sadrazamı";
  else if (stats.saray < 25)       subtitle = isEN ? ctx.saray_low     : "Gözden Düştüğümüz Günler";
  else if (stats.ulema > 75)       subtitle = isEN ? ctx.ulema_high    : "Dinin Gölgesinde Saltanat";
  else if (stats.hazine > 75)      subtitle = isEN ? ctx.hazine_high   : "Bereketin Yılı";
  else {
    const idx = (year + cardsPlayed) % (arr ? arr.length : DYNAMIC_SUBTITLES.length);
    subtitle = arr ? arr[idx] : DYNAMIC_SUBTITLES[idx];
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
    // Sultan kartları: ilk 3 yıl çıkmasın, kriz/rahat anda gelsin
    if (c.character === "1-sultan") {
      if (year < 3) return false;
      const avg = Object.values(stats).reduce((a,b)=>a+b,0)/4;
      if (avg > 38 && avg < 62) return false; // Dengeli — sultan rahatsız etmez
    }
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

// Karakter görsel versiyonu sistemi
// MADDE 7: Belli karakterler yıllar içinde görsel değiştiriyor (v2 dosyası gerekir)
// MADDE 8: Vatandaş (halk_temsilcisi) için farklı görseller rastgele seçilir
const CHARACTER_EVOLUTIONS = {
  // 50+ kartta görsel değişiyor (assets/characters/9-cellat_v2.jpg gerekir)
  "9-cellat":   { threshold: 50, version: "9-cellat_v2" },
  // 50+ kartta görsel değişiyor (assets/characters/2-yeniceri_v2.jpg gerekir)
  "2-yeniceri": { threshold: 50, version: "2-yeniceri_v2" },
};

// Vatandaş için birden fazla görsel (2-3-4 eklenebilir)
const HALK_TEMSILCISI_VARIANTS = [
  "15-halk_temsilcisi",
  "15-halk_temsilcisi_2",
  "15-halk_temsilcisi_3",
  "15-halk_temsilcisi_4",
];
// Oyun boyunca her vatandaş kartında rastgele bir görsel seç
let _halkTemsilcisiCurrent = 0;

function getCharacterImageName(key) {
  // Vatandaş: görseller arasında döner
  if (key === "15-halk_temsilcisi") {
    const idx = Math.floor(Math.random() * HALK_TEMSILCISI_VARIANTS.length);
    return HALK_TEMSILCISI_VARIANTS[idx];
  }

  // Karakter evrimi: yeterli kart oynanmışsa v2'yi dene
  const evo = CHARACTER_EVOLUTIONS[key];
  if (evo && cardsPlayed >= evo.threshold) {
    return evo.version; // Dosya yoksa preload.onerror gizler, sorun yok
  }

  return key;
}

function dealNext() {
  if (isGameOver) return;

  // Item expiry: her kart açılışında sayacı azalt
  for (let i = 0; i < 3; i++) {
    if (playerItems[i] !== null && playerItemExpiry[i] !== null) {
      playerItemExpiry[i]--;
      if (playerItemExpiry[i] <= 0) {
        const expiredId = playerItems[i];
        playerItems[i] = null;
        playerItemExpiry[i] = null;
        if (activeItemIndex === i) { activeItemIndex = null; pendingItemEffect = null; card.style.boxShadow = ""; }
        updateItemBar();
        showItemExpiredToast(expiredId);
      }
    }
  }

  // Her kart geçişinde no-swipe ve artık görünmemesi gereken panelleri temizle
  card.classList.remove("no-swipe", "pargali-ghost");
  if (card._ghostTimer) { clearTimeout(card._ghostTimer); card._ghostTimer = null; }
  if (card._ghostReveal) {
    card.removeEventListener("touchstart", card._ghostReveal);
    card.removeEventListener("mousedown",  card._ghostReveal);
    card._ghostReveal = null;
  }
  const chancePanel = document.getElementById("chance-panel");
  if (chancePanel) chancePanel.classList.add("hidden");
  const devamBtn = document.getElementById("letter-devam-btn");
  if (devamBtn) devamBtn.classList.add("hidden");
  if (cardChoices) cardChoices.style.display = "";

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

  // Easter egg kartı
  if (c.type === "easter") {
    showEasterCard(c);
    return;
  }

  // Sultan olay kartı — letter/normal ayrımından önce yakala
  if (c.character === "1-sultan") {
    showSultanEventCard(c);
    return;
  }

  // Müzakere kartı
  if (c.type === "negotiation") {
    showNegotiationCard(c);
    return;
  }

  // Mektup kartı (sultan mektupları artık gösterilmiyor)
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

  const imgName = getCharacterImageName(key) + ".jpg";
  const imgPath = "assets/characters/" + encodeURIComponent(imgName);

  const _isEN = window.LANG === 'en';

  // Gizli hain hint
  let displayText = (_isEN && c.text_en) ? c.text_en : (c.text || "");
  if (key === hiddenTraitor && !traitorRevealed) {
    const mem = characterMemory[key] || {};
    const totalMem = (mem.left || 0) + (mem.right || 0);
    if (totalMem > 0 && totalMem % 7 === 0) {
      displayText += _isEN ? " — his eyes caught on something for a moment." : " — gözleri anlık bir şeye takıldı.";
    }
  }

  // Rakip vezir: stat'a göre davranış ipucu ekle
  if (key === "8-rakip-vezir") {
    displayText += getRakipSuffix();
  }

  charName.textContent = (_isEN && c.character_name_en) ? c.character_name_en : (c.character_name || "");
  cardText.textContent = displayText;
  choiceLeft.textContent  = (_isEN && c.left_text_en)  ? c.left_text_en  : (c.left_text  || (_isEN ? "No"  : "Hayır"));
  choiceRight.textContent = (_isEN && c.right_text_en) ? c.right_text_en : (c.right_text || (_isEN ? "Yes" : "Evet"));

  choiceLeft.style.opacity  = "0";
  choiceRight.style.opacity = "0";
  overlayL.style.opacity = "0";
  overlayR.style.opacity = "0";

  // Mektup stili kaldır
  card.classList.remove("letter-card");

  // Soruşturma butonu kaldırıldı
  const _invBtn = document.getElementById("investigate-btn");
  if (_invBtn) _invBtn.classList.add("hidden");

  // Görseli yükle — hazır olunca göster, yoksa gizle (spinner çıkmasın)
  cardImage.removeAttribute("src");
  cardImage.style.visibility = "hidden";
  const preload = new Image();
  preload.onload = () => {
    cardImage.src = imgPath;
    cardImage.style.visibility = "";
  };
  preload.onerror = () => {
    cardImage.style.visibility = "hidden";
  };
  preload.src = imgPath;

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
        cardText.textContent = (window.LANG === 'en' && c.investigate_text_en) ? c.investigate_text_en : c.investigate_text;
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

// ── Sultan Öfkesi (1. Aşama: Karanlık + Metin) ───────────────────
function triggerSultanRage(parentOverlay, onDone) {
  Haptics.gameOver();

  // Önce overlay içeriğini gizle, sadece karanlık kalsın
  const box = parentOverlay.querySelector("#sultan-event-box");
  if (box) box.style.display = "none";

  const rage = document.createElement("div");
  rage.id = "sultan-rage";
  rage.innerHTML = `
    <div id="sultan-rage-text">SEN CİHANLAR HÜKÜMDARINI<br>REDDETMEYE NASIL CÜRRET EDERSİN<br><em>BRE DEYYUS!</em></div>`;
  parentOverlay.appendChild(rage);

  // Tekrar eden sarsıntı (2 sn boyunca)
  let shakeCount = 0;
  const shakeInterval = setInterval(() => {
    parentOverlay.classList.add("sultan-shake");
    setTimeout(() => parentOverlay.classList.remove("sultan-shake"), 500);
    shakeCount++;
    if (shakeCount >= 3) clearInterval(shakeInterval);
  }, 650);

  // 2 sn sonra söndür, onDone çağır
  setTimeout(() => {
    rage.style.opacity = "0";
    rage.style.transition = "opacity 0.5s ease";
    parentOverlay.style.opacity = "0";
    parentOverlay.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
      clearInterval(shakeInterval);
      rage.remove();
      onDone();
    }, 520);
  }, 2000);
}

// ── İdam Animasyonu (2. Aşama: Kılıç + Kan) ──────────────────────
function showExecutionAnimation(onDone) {
  const el = document.createElement("div");
  el.id = "execution-overlay";
  el.innerHTML = `
    <div id="exec-flash"></div>
    <div id="exec-sword-wrap">
      <svg id="exec-sword" viewBox="0 0 320 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M30,28 L295,8 L300,20 L30,34 Z" fill="rgba(201,162,39,0.95)"/>
        <path d="M275,9 L300,14 L295,21 Z" fill="#fff" opacity="0.65"/>
        <rect x="6" y="22" width="30" height="14" rx="3" fill="rgba(110,70,15,0.95)"/>
        <rect x="28" y="13" width="9" height="32" rx="2" fill="rgba(150,100,25,0.95)"/>
        <ellipse cx="260" cy="21" rx="5" ry="7" fill="rgba(180,0,0,0.85)"/>
        <ellipse cx="240" cy="23" rx="3" ry="5" fill="rgba(180,0,0,0.6)"/>
      </svg>
    </div>
    <div id="exec-blood-spray"></div>`;
  document.body.appendChild(el);

  // Kan damlacıkları
  const spray = document.getElementById("exec-blood-spray");
  for (let i = 0; i < 20; i++) {
    const dot = document.createElement("div");
    dot.className = "exec-drop";
    dot.style.cssText = `
      left:${30+Math.random()*40}%;top:${25+Math.random()*50}%;
      width:${5+Math.random()*10}px;height:${5+Math.random()*10}px;
      animation-delay:${0.7+Math.random()*0.3}s;
      animation-duration:${0.6+Math.random()*0.5}s;
      --tx:${(Math.random()-0.5)*160}px;--ty:${30+Math.random()*100}px;`;
    spray.appendChild(dot);
  }

  // 2.5 sn görünür kal — önce onDone başlat, sonra overlay sol
  setTimeout(() => {
    onDone(); // game over başlasın, arkada cinematic death hazırlansın
    el.style.opacity = "0";
    el.style.transition = "opacity 0.6s ease";
    setTimeout(() => el.remove(), 620);
  }, 2500);
}

// ── Easter Egg Kart Gösterici ─────────────────────────────────────
function showEasterCard(c) {
  hideNegotiationPanel();

  const isPargali = c.easter_type === "pargali";
  const isYanlis  = c.easter_type === "yanlis";
  const isDonum   = c.easter_type === "donum";

  // Dönüm Noktası: özel seçim ekranı
  if (isDonum) {
    showDonumEkrani();
    return;
  }

  // Pargalı özel müzik
  if (isPargali && window.playPargaliSad) playPargaliSad();

  // Görsel
  const imgPath = "assets/characters/" + encodeURIComponent(c.character + ".jpg");
  cardImage.style.visibility = "hidden";
  const preload = new Image();
  preload.onload  = () => { cardImage.src = imgPath; cardImage.style.visibility = ""; };
  preload.onerror = () => { cardImage.style.visibility = "hidden"; };
  preload.src = imgPath;

  charName.textContent = c.character_name || "";
  cardText.textContent = c.text || "";
  choiceLeft.style.opacity = "0";
  choiceRight.style.opacity = "0";
  overlayL.style.opacity = "0";
  overlayR.style.opacity = "0";
  card.classList.remove("letter-card");
  card.classList.add("no-swipe");

  // Pargalı ghost efekti
  if (isPargali) {
    card.classList.add("pargali-ghost");
    // Dokunca 2 sn blur kalkar, sonra geri gelir — timer card üzerinde saklanır, dealNext temizler
    const _ghostReveal = () => {
      card.classList.remove("pargali-ghost");
      clearTimeout(card._ghostTimer);
      card._ghostTimer = setTimeout(() => card.classList.add("pargali-ghost"), 2000);
    };
    card.addEventListener("touchstart", _ghostReveal, { passive: true, once: false });
    card.addEventListener("mousedown",  _ghostReveal, { once: false });
    card._ghostReveal = _ghostReveal;
  } else {
    card.classList.remove("pargali-ghost");
    if (card._ghostReveal) {
      card.removeEventListener("touchstart", card._ghostReveal);
      card.removeEventListener("mousedown",  card._ghostReveal);
      card._ghostReveal = null;
    }
  }

  // Soruştur butonu gizle
  const invBtn = document.getElementById("investigate-btn");
  if (invBtn) invBtn.classList.add("hidden");

  // Özel buton
  let easterBtn = document.getElementById("easter-action-btn");
  if (!easterBtn) {
    easterBtn = document.createElement("button");
    easterBtn.id = "easter-action-btn";
    document.getElementById("card-bottom").appendChild(easterBtn);
  }
  easterBtn.textContent = c.easter_type === "yanlis_idam" ? "İDAM EDİN!" : (c.button || "DEVAM");
  easterBtn.className = "easter-btn " + (c.easter_type || "");
  easterBtn.classList.remove("hidden");

  let fired = false;
  const doAction = () => {
    if (fired) return; fired = true;

    // Buton tık sesi
    if (window.playButtonTap) playButtonTap();
    // Ses
    if (c.easter_type === "kedi"        && window.playCatMeow)         playCatMeow();
    if ((c.easter_type === "yanlis" || c.easter_type === "yanlis_idam") && window.playWhipCrack) playWhipCrack();
    if (c.easter_type === "kehanet"     && window.playRunningFootsteps) playRunningFootsteps();
    if (c.easter_type === "evliya"      && window.playWindGust)         playWindGust();

    // Efekt
    if (c.stat_effect) c.stat_effect();

    // Yanlış Adam idam: kan ekranı + game over
    if (c.easter_type === "yanlis_idam") {
      easterBtn.classList.add("hidden");
      triggerYanlisIdam();
      return;
    }

    // Pargalı: yavaşça silinerek geç
    if (isPargali) {
      card.style.transition = "opacity 1.2s ease";
      card.style.opacity = "0";
      easterBtn.classList.add("hidden");
      setTimeout(() => {
        card.classList.remove("pargali-ghost");
        card.style.opacity = "";
        card.style.transition = "";
        advanceEasterCard(c);
      }, 1250);
      return;
    }

    easterBtn.classList.add("hidden");
    card.classList.remove("no-swipe");
    const delay = (c.easter_type === "yanlis" || c.easter_type === "kehanet") ? 400 : 150;
    setTimeout(() => advanceEasterCard(c), delay);
  };

  easterBtn.onclick = doAction;

  animateCardIn();
}

function showDonumEkrani() {
  _donumShownThisGame = true;
  const overlay = document.createElement("div");
  overlay.id = "donum-overlay";
  const isEN = window.LANG === 'en';
  const donumChoices = (isEN && window.EN_DONUM_CHOICES) ? window.EN_DONUM_CHOICES : DONUM_CHOICES;
  overlay.innerHTML = `
    <div id="donum-box">
      <div id="donum-ornament">✦</div>
      <div id="donum-title">${isEN ? "TURNING POINT" : "DÖNÜM NOKTASI"}</div>
      <div id="donum-divider"></div>
      <div id="donum-text">${isEN ? "Years have passed, the Divan has been watching. What will be the legacy of this era?" : "Yıllar geçti, divan sizi izledi. Bu dönemin mirası ne olacak?"}</div>
      <div id="donum-choices">
        ${donumChoices.map((ch, i) => `
          <button class="donum-btn" data-idx="${i}">
            <div class="donum-btn-top">
              <span class="donum-label">${ch.label}</span>
              <span class="donum-bar-badge">${ch.barLabel}</span>
            </div>
            <span class="donum-desc">${ch.desc}</span>
          </button>`).join("")}
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelectorAll(".donum-btn").forEach(btn => {
    btn.onclick = () => {
      if (window.playSelectConfirm) playSelectConfirm();
      // Her zaman orijinal (TR) DONUM_CHOICES'dan bar ve label al (localStorage tutarlılığı için)
      const chOrig = DONUM_CHOICES[parseInt(btn.dataset.idx)];
      localStorage.setItem("sadrazam_miras_bar", chOrig.bar);
      localStorage.setItem("sadrazam_miras_label", chOrig.label);
      const isENDonum = window.LANG === 'en';
      const displayLbl = (isENDonum && window.EN_DONUM_CHOICES) ? window.EN_DONUM_CHOICES[parseInt(btn.dataset.idx)].label : chOrig.label;
      showItemToast(isENDonum ? ("✦ Your legacy has been recorded: " + displayLbl) : ("✦ Mirasın kaydedildi: " + displayLbl));
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.3s ease";
      setTimeout(() => {
        overlay.remove();
        advanceEasterCard({ id:"donum" });
      }, 320);
    };
  });
}

function advanceEasterCard(c) {
  card.classList.remove("pargali-ghost", "no-swipe");
  cardsPlayed++;
  advanceHicriMonth();
  if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
  if (!isGameOver) { saveGameState(); setTimeout(dealNext, 200); }
}

function triggerYanlisIdam() {
  // Ekran yavaşça kırmızıya dolar
  const bloodEl = document.createElement("div");
  bloodEl.id = "yanlis-blood-overlay";
  document.body.appendChild(bloodEl);
  // Ses
  if (window.playGameOver) playGameOver();
  Haptics.gameOver();
  setTimeout(() => {
    bloodEl.remove();
    deathCharacterKey = "easter-yanlis";
    triggerGameOver("O 'yanlış oda' hikayesi sona erdi. Kimliğini öğrendiler — ve seni de.");
  }, 2200);
}

// ── Padişah Ziyareti — bizzat gelip konuşur, reddedince ölürsün ──
let _padisahZiyaretiNext = 50; // ilk ziyaret ~50. kartta
let _padisahZiyaretiCount = 0;

const PADISAH_ZIYARET_TEXTS = [
  { text: "Sadrazam. Seninle yüz yüze konuşmak istedim. Osmanlı'ya olan bağlılığın sürecek mi?", evet: "Canım ve kanım Devlet'e feda, Hünkarım.", hayir_trigger: true },
  { text: "Divan'dan haberler geldi. Seni doğrudan sormak istedim — bana sadık mısın?", evet: "Sadakatimden şüphe etmeyin Padişahım.", hayir_trigger: true },
  { text: "Vezirler hakkında söylentiler dolaşıyor. Sen bu söylentilerin dışında mısın, Sadrazam?", evet: "Evet Efendim, her zaman hizmetinizdeyim.", hayir_trigger: true },
  { text: "Bu gece sarayda kalmam gerekiyordu. Seninle oturup düşündüm. Seçimlerinden memnun musun?", evet: "Her kararım Devlet'in hayrınadır, Sultanım.", hayir_trigger: true },
  { text: "Topkapı'nın duvarları çok şey duyar. Ve ben çok şey bilirim. Anlıyor musun beni, Sadrazam?", evet: "Her zaman anlıyorum Efendim. Emrinizdeyim.", hayir_trigger: true },
];

function tryPadisahZiyareti() {
  if (isGameOver) return;
  if (cardsPlayed < _padisahZiyaretiNext) return;
  if (year < 3) return; // İlk 3 yıl gelmesin
  _padisahZiyaretiNext = cardsPlayed + Math.round(45 * (0.75 + Math.random() * 0.5));
  _padisahZiyaretiCount++;
  showPadisahZiyareti();
}

function showPadisahZiyareti() {
  const data = PADISAH_ZIYARET_TEXTS[Math.floor(Math.random() * PADISAH_ZIYARET_TEXTS.length)];

  hideNegotiationPanel();
  Haptics.crisisCard();
  if (window.playLetterArrival) playLetterArrival();

  // Normal kart boyutunda göster — sultan görseli tam ekran
  cardImage.removeAttribute("src");
  cardImage.style.visibility = "hidden";
  const preload = new Image();
  preload.onload = () => { cardImage.src = "assets/characters/1-sultan.jpg"; cardImage.style.visibility = ""; };
  preload.onerror = () => { cardImage.style.visibility = "hidden"; };
  preload.src = "assets/characters/1-sultan.jpg";

  charName.textContent = "Padişahım";
  cardText.textContent = data.text;
  choiceLeft.textContent  = "Reddet";
  choiceRight.textContent = "Biat Et";
  choiceLeft.style.opacity  = "0";
  choiceRight.style.opacity = "0";
  overlayL.style.opacity = "0";
  overlayR.style.opacity = "0";
  card.classList.remove("letter-card", "no-swipe", "pargali-ghost");

  // Kart tipini özel olarak işaretle — decide() bu tipi yakalar
  currentCard = { type: "padisah_ziyaret", character: "padisah-ziyaret", _data: data };
  deathCharacterKey = "1-sultan";

  // Onay butonu
  let easterBtn = document.getElementById("easter-action-btn");
  if (!easterBtn) {
    easterBtn = document.createElement("button");
    easterBtn.id = "easter-action-btn";
    document.getElementById("card-bottom").appendChild(easterBtn);
  }
  easterBtn.textContent = data.evet;
  easterBtn.className = "easter-btn padisah-ziyaret";
  easterBtn.classList.remove("hidden");
  easterBtn.onclick = () => {
    easterBtn.classList.add("hidden");
    flyOff("right");
  };

  const invBtn = document.getElementById("investigate-btn");
  if (invBtn) invBtn.classList.add("hidden");

  animateCardIn();
}

// ── Sultan Olay Kartı ─────────────────────────────────────────────
function showSultanEventCard(c) {
  hideNegotiationPanel();
  Haptics.letterArrival();
  if (window.playLetterArrival) playLetterArrival();

  // Stat değerlendirmesi
  const statValues = Object.values(stats);
  const avgStat = statValues.reduce((a, b) => a + b, 0) / statValues.length;
  const minStat = Math.min(...statValues);
  const isPositive = avgStat >= 55 && minStat >= 35;

  // BEYAN metinleri (soru değil)
  const positiveTexts = [
    "Devlet işleri yolunda gidiyor, Sadrazam. Bu dengeyi koruyun.",
    "Taht sizi layık buluyor. Osmanlı sizinle güçlü.",
    "Hazinemiz dolu, ordumuz sağlam. Memnuniyetimizi bildirmek istedik.",
    "Divan'ın bu sükûneti bizi memnun ediyor. Böyle devam edin."
  ];
  const negativeTexts = [
    "Bu gidişat bizi rahatsız ediyor, Sadrazam. Durumu toparlamanızı bekliyoruz.",
    "İmparatorluk zayıflıyor. Bu yük omuzlarınızda, bunu bilin.",
    "Divan'dan gelen haberler iç açıcı değil. Tedbirinizi vakit geçirmeden alın.",
    "Sabır taşı çatlamak üzere. Bunu son uyarı olarak kabul edin."
  ];

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const eventText = isPositive ? rand(positiveTexts) : rand(negativeTexts);
  const effectLabel = isPositive ? "Tüm güçler +20" : "Tüm güçler −10";
  const effectClass = isPositive ? "positive" : "negative";

  // Overlay — sadece onay butonu, swipe/ret yok
  const overlay = document.createElement("div");
  overlay.id = "sultan-event-overlay";
  overlay.innerHTML = `
    <div id="sultan-event-box">
      <div id="sultan-event-label">SULTAN'DAN HABER</div>
      <img id="sultan-event-img" src="assets/characters/1-sultan.jpg" alt="Sultan">
      <div id="sultan-event-title">${c.character_name || "Sultan"}</div>
      <div id="sultan-event-divider"></div>
      <div id="sultan-event-text">${eventText}</div>
      <div id="sultan-event-effect" class="sultan-event-effect-box ${effectClass}">${effectLabel}</div>
      <button id="sultan-event-devam">Başüstüne Hünkarım</button>
    </div>`;

  document.body.appendChild(overlay);

  const box = document.getElementById("sultan-event-box");
  let fired = false;

  const doAccept = () => {
    if (fired) return; fired = true;
    box.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    box.style.transform = "translateX(120%) rotate(12deg)";
    box.style.opacity = "0";
    setTimeout(() => {
      overlay.remove();
      applySultanEffect(isPositive, c, "right");
    }, 320);
  };

  document.getElementById("sultan-event-devam").onclick = doAccept;
}

function applySultanEffect(positive, c, dir) {
  const change = positive ? 20 : -10;
  for (const stat of Object.keys(stats)) {
    const newVal = positive
      ? Math.min(95, stats[stat] + change)
      : Math.max(5, stats[stat] + change);
    stats[stat] = newVal;
    showStatDelta(stat, newVal - stats[stat] + change);
  }
  updateStatUI();

  sultanSabir = Math.min(100, Math.max(0, sultanSabir + (positive ? 5 : -8)));
  checkSultanSabir();
  if (isGameOver) return;

  const charKey = c.character || "";
  if (!characterMemory[charKey]) characterMemory[charKey] = { left: 0, right: 0, last: null };
  characterMemory[charKey][dir]++;
  characterMemory[charKey].last = dir;
  seenCharacters.add(charKey);

  cardsPlayed++;
  advanceHicriMonth();
  if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
  if (!isGameOver) { saveGameState(); setTimeout(dealNext, 200); }
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

  card.classList.add("no-swipe");
  animateCardIn();

  // DEVAM butonu göster
  const devamBtn = document.getElementById("letter-devam-btn");
  if (devamBtn) devamBtn.classList.remove("hidden");

  window._letterDevamCard = c;

  // Ekrana herhangi bir yere dokunmak da geçiyor (iOS güvenilir yöntem)
  const tapAnywhere = (e) => {
    if (e.target.id === "letter-devam-btn") return; // buton zaten handle ediyor
    clearLetterTapHandler();
    handleLetterDevam();
  };
  window._letterTapHandler = tapAnywhere;
  // 600ms sonra aktif et (animasyon bitsin, yanlışlıkla kapanmasın)
  setTimeout(() => {
    document.getElementById("game")?.addEventListener("touchend", tapAnywhere, { once: true, passive: true });
  }, 600);
}

function clearLetterTapHandler() {
  if (window._letterTapHandler) {
    document.getElementById("game")?.removeEventListener("touchend", window._letterTapHandler);
    window._letterTapHandler = null;
  }
}

function handleLetterDevam() {
  clearLetterTapHandler();
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

  card.classList.add("no-swipe");
  animateCardIn();

  const panel = document.getElementById("negotiation-panel");
  const optList = document.getElementById("negotiation-options");
  optList.innerHTML = "";
  c.negotiation_options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "negot-btn";
    btn.textContent = opt.label;
    btn.style.cssText += ";cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;";

    btn.onclick = () => {
      if (btn.dataset.used) return;
      btn.dataset.used = "1";
      if (window.playButtonTap) playButtonTap();
      Haptics.tap();
      for (const f of (opt.flags_set || [])) activeFlags[f] = true;
      applyEffects(opt.effects || {});
      card.classList.remove("no-swipe");
      hideNegotiationPanel();
      if (!isGameOver) {
        cardsPlayed++;
        advanceHicriMonth();
        if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
        if (!isGameOver) setTimeout(dealNext, 150);
      }
    };
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
    if (val <= 15)       fill.className = "stat-fill danger";
    else if (val >= 80)  fill.className = "stat-fill success";
    else if (val <= 30 || val >= 68) fill.className = "stat-fill warn";
    else                 fill.className = "stat-fill";
    if (val <= 15 || val >= 80) anyDanger = true;
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
  const slot = emptySlot === -1 ? 0 : emptySlot;
  playerItems[slot] = itemId;
  playerItemExpiry[slot] = 3; // 3 kart sonra tükenir
  updateItemBar();
  showItemUnlockAnimation(itemId);
}

function showItemUnlockAnimation(itemId) {
  const itm = ITEMS[itemId];
  if (!itm) return;

  // Overlay — karartma
  const overlay = document.createElement("div");
  overlay.id = "item-unlock-overlay";
  overlay.innerHTML = `
    <div id="iu-glow"></div>
    <img id="iu-img" src="${itm.icon}" alt="${itm.name}">
    <div id="iu-label">YENİ EŞYA</div>`;
  document.body.appendChild(overlay);

  // Ses + haptik
  Haptics.achievement();
  if (window.playAchievement) playAchievement();

  // 2.8 sn ekranda kal, sonra popup'a geç
  setTimeout(() => {
    overlay.classList.add("iu-fade-out");
    setTimeout(() => {
      overlay.remove();
      showItemInfoPopup(itemId);
    }, 400);
  }, 2800);
}

function showItemInfoPopup(itemId) {
  const itm = ITEMS[itemId];
  if (!itm) return;

  const howToUse = ITEM_HOW_TO_USE[itemId] || itm.desc;
  const cond = ITEM_GRANT_CONDITIONS[itemId];

  const popup = document.createElement("div");
  popup.id = "item-info-popup";
  popup.innerHTML = `
    <div id="iip-box">
      <div id="iip-header">
        <img id="iip-img" src="${itm.icon}" alt="${itm.name}">
        <div id="iip-titles">
          <div id="iip-tag">YENİ EŞYA KAZANILDI</div>
          <div id="iip-name">${itm.name}</div>
        </div>
      </div>
      <div id="iip-divider"></div>
      <div id="iip-section-title">NE İŞE YARAR?</div>
      <div id="iip-desc">${howToUse}</div>
      <div id="iip-section-title">NASIL KULLANILIR?</div>
      <div id="iip-how">Ekranın altındaki eşya slotuna dokun → "Kullan" seç → Sonraki kart geldiğinde otomatik devreye girer.</div>
      ${cond ? `<div id="iip-condition">✦ Kazanım koşulu: <em>${cond.desc}</em></div>` : ""}
      <button id="iip-ok">ANLADIM →</button>
    </div>`;
  document.body.appendChild(popup);

  const close = () => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 300);
  };
  const okBtn = document.getElementById("iip-ok");
  okBtn.addEventListener("click",    close);
  okBtn.addEventListener("touchend", close, { passive: true });
}

function activateItem(slotIndex) {
  if (isGameOver) return;
  const itemId = playerItems[slotIndex];
  if (!itemId) return;
  const item = ITEMS[itemId];
  Haptics.tap();
  showItemConfirm(slotIndex, item);
}

function showItemConfirm(slotIndex, item) {
  // Var olan popup'ı kaldır
  document.getElementById("item-confirm-popup")?.remove();

  const popup = document.createElement("div");
  popup.id = "item-confirm-popup";
  popup.innerHTML = `
    <div class="icp-icon"><img src="${item.icon}" alt="${item.name}"></div>
    <div class="icp-name">${item.name}</div>
    <div class="icp-desc">${item.desc}</div>
    <div class="icp-btns">
      <button class="icp-use" id="icp-use-btn">Kullan ✓</button>
      <button class="icp-cancel" id="icp-cancel-btn">Vazgeç</button>
    </div>`;

  document.getElementById("game")?.appendChild(popup);

  const doUse = (e) => {
    if(e) e.preventDefault();
    popup.remove();
    executeItem(slotIndex, item);
  };
  const doCancel = (e) => {
    if(e) e.preventDefault();
    popup.remove();
  };

  const useBtn    = document.getElementById("icp-use-btn");
  const cancelBtn = document.getElementById("icp-cancel-btn");
  useBtn   ?.addEventListener("click",    doUse);
  useBtn   ?.addEventListener("touchend", doUse,    { passive: false });
  cancelBtn?.addEventListener("click",    doCancel);
  cancelBtn?.addEventListener("touchend", doCancel, { passive: false });

  // Dışarı tıklama kapatır
  setTimeout(() => {
    const outside = (e) => {
      if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener("touchend", outside); }
    };
    document.addEventListener("touchend", outside, { passive: true });
  }, 200);
}

function executeItem(slotIndex, item) {
  itemsUsed++;
  uniqueItemsCollected.add(Object.keys(ITEMS).find(k => ITEMS[k] === item));

  if (item.effect === "heal_20") {
    const lowestStat = Object.entries(stats).reduce((a, b) => b[1] < a[1] ? b : a);
    stats[lowestStat[0]] = Math.min(100, stats[lowestStat[0]] + 20);
    showStatDelta(lowestStat[0], 20);
    updateStatUI();
    playerItems[slotIndex] = null;
    playerItemExpiry[slotIndex] = null;
    updateItemBar();
    showItemToast(item.name + " — +" + 20 + " " + lowestStat[0]);
    Haptics.statPositive();
    return;
  }
  if (item.effect === "skip_card") {
    playerItems[slotIndex] = null;
    playerItemExpiry[slotIndex] = null;
    updateItemBar();
    showItemToast(item.name + " — Kart geçildi");
    card.style.opacity = "0";
    setTimeout(dealNext, 300);
    return;
  }

  // Pasif efektler (bir sonraki kart için)
  if (activeItemIndex === slotIndex) {
    activeItemIndex = null;
    pendingItemEffect = null;
  } else {
    activeItemIndex = slotIndex;
    pendingItemEffect = item.effect;
    showItemToast(item.name + " — Sonraki karar için hazır");
    // Kart üzerinde aktif gösterge
    card.style.boxShadow = `0 0 0 2px ${item.color || "var(--gold)"}, 0 8px 40px rgba(0,0,0,0.8)`;
  }
  updateItemBar();
}

function consumeActiveItem() {
  if (activeItemIndex === null) return;
  playerItems[activeItemIndex] = null;
  playerItemExpiry[activeItemIndex] = null;
  activeItemIndex = null;
  pendingItemEffect = null;
  card.style.boxShadow = "";
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
      const itm = ITEMS[itemId];
      icon.innerHTML = `<img src="${itm.icon}" alt="${itm.name}" onerror="this.parentElement.textContent='?'">`;
      icon.style.fontSize = "";
      name.textContent = itm.name;
      slot.style.borderColor = activeItemIndex === i ? (itm.color || "var(--gold)") : "";
      slot.classList.remove("empty");
      slot.classList.toggle("active", activeItemIndex === i);
      // Expiry sayacı badge
      let badge = slot.querySelector(".item-expiry-badge");
      const exp = playerItemExpiry[i];
      if (exp !== null && exp <= 3) {
        if (!badge) { badge = document.createElement("span"); badge.className = "item-expiry-badge"; slot.appendChild(badge); }
        badge.textContent = exp;
        badge.style.color = exp <= 1 ? "#e05555" : exp <= 2 ? "#e0a020" : "rgba(201,162,39,0.7)";
      } else if (badge) {
        badge.remove();
      }
    } else {
      icon.textContent = "";
      icon.style.fontSize = "";
      name.textContent = "";
      slot.style.borderColor = "";
      slot.classList.add("empty");
      slot.classList.remove("active");
      // Badge varsa kaldır
      const oldBadge = slot.querySelector(".item-expiry-badge");
      if (oldBadge) oldBadge.remove();
    }
  }
}

function showItemExpiredToast(itemId) {
  const itm = ITEMS[itemId];
  if (!itm) return;
  const toast = document.createElement("div");
  toast.className = "item-expired-toast";
  toast.innerHTML = `<img src="${itm.icon}" alt="${itm.name}"><span>Tükendi</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
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

    if (godMode && raw < 0) raw = 0; // ★ GOD MODE — negatif stat değişimini engelle
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

let _sultanWarningShown = false; // Çok güçlenince uyarı mektubu

function checkSultanSabir() {
  if (isGameOver) return;
  if (sultanSabir <= 0) {
    triggerGameOver("Sultan seni azletti. Hac yolculuğuna — sürgün olarak — gönderildin.");
  } else if (sultanSabir >= 85 && !_sultanWarningShown) {
    _sultanWarningShown = true;
    showGucUyarisi();
  } else if (sultanSabir >= 100) {
    triggerSultanGucOlumu();
  }
}

function showGucUyarisi() {
  const overlay = document.createElement("div");
  overlay.id = "guc-uyarisi-overlay";
  overlay.innerHTML = `
    <div id="guc-uyarisi-box">
      <div id="guc-uyarisi-label">BİLİNMEYEN BİR EL'DEN</div>
      <img id="guc-uyarisi-img" src="assets/characters/mysterious-letter.jpg" alt="Mektup" onerror="this.style.display='none'">
      <div id="guc-uyarisi-divider"></div>
      <div id="guc-uyarisi-text">"Gölgeniz fazla uzuyor, Paşa. Bazı gölgeler çok büyüyünce sahibini yer. Dikkat edin."</div>
      <div id="guc-uyarisi-imza">— İsmini bilmenize gerek yok</div>
      <button id="guc-uyarisi-kapat">Mektubu Yak</button>
    </div>`;
  document.body.appendChild(overlay);
  Haptics.crisisCard();
  setTimeout(() => {
    const btn = document.getElementById("guc-uyarisi-kapat");
    if (btn) btn.onclick = () => { overlay.style.opacity = "0"; overlay.style.transition = "opacity 0.3s"; setTimeout(() => overlay.remove(), 320); };
  }, 200);
}

function triggerSultanGucOlumu() {
  if (isGameOver) return;
  isGameOver = true;
  stopAllMusic();
  if (window.playCinematicDeath) playCinematicDeath();
  Haptics.gameOver();

  // Göz kırpma — 2 kez kapanıp açılır, 3. açılışta cellatlar görünür
  const eyeEl = document.createElement("div");
  eyeEl.id = "eye-blink-overlay";
  document.body.appendChild(eyeEl);

  let blinkCount = 0;
  const doNextBlink = () => {
    eyeEl.classList.add("blink-closed");
    setTimeout(() => {
      eyeEl.classList.remove("blink-closed");
      blinkCount++;
      if (blinkCount < 2) {
        setTimeout(doNextBlink, 650);
      } else {
        // Son açılış: urgan animasyonu başlasın
        setTimeout(() => {
          eyeEl.remove();
          showHangingAnimation(() => {
            triggerGameOver("Sarayın en güçlü sadrazamıydın. Bu yüzden urganı iki cellat getirdi.");
          });
        }, 500);
      }
    }, 220);
  };

  eyeEl.classList.add("blink-closed");
  setTimeout(doNextBlink, 500);
}

function showHangingAnimation(onDone) {
  const el = document.createElement("div");
  el.id = "hanging-overlay";
  el.innerHTML = `
    <div id="hang-flash"></div>
    <svg id="hang-svg" viewBox="0 0 320 520" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <!-- Sol maskeli cellat -->
      <g class="hang-cellat" id="hang-left">
        <path d="M68,520 L32,215 Q52,145 68,133 Q84,145 104,215 Z" fill="#0d0808"/>
        <ellipse cx="68" cy="120" rx="28" ry="33" fill="#0d0808"/>
        <rect x="55" y="109" width="11" height="6" rx="3" fill="rgba(170,8,8,0.8)"/>
        <rect x="72" y="109" width="11" height="6" rx="3" fill="rgba(170,8,8,0.8)"/>
        <rect x="53" y="127" width="30" height="4" rx="2" fill="rgba(40,0,0,0.5)"/>
        <path d="M93,175 Q132,188 156,210" stroke="#0d0808" stroke-width="19" fill="none" stroke-linecap="round"/>
      </g>
      <!-- Sağ maskeli cellat -->
      <g class="hang-cellat" id="hang-right">
        <path d="M252,520 L216,215 Q236,145 252,133 Q268,145 288,215 Z" fill="#0d0808"/>
        <ellipse cx="252" cy="120" rx="28" ry="33" fill="#0d0808"/>
        <rect x="239" y="109" width="11" height="6" rx="3" fill="rgba(170,8,8,0.8)"/>
        <rect x="256" y="109" width="11" height="6" rx="3" fill="rgba(170,8,8,0.8)"/>
        <rect x="237" y="127" width="30" height="4" rx="2" fill="rgba(40,0,0,0.5)"/>
        <path d="M227,175 Q188,188 164,210" stroke="#0d0808" stroke-width="19" fill="none" stroke-linecap="round"/>
      </g>
      <!-- Urgan (yukarıdan düşüyor, ilik düğümü) -->
      <g id="hang-rope-wrap">
        <line x1="160" y1="0" x2="160" y2="215" stroke="#7a5615" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M160,215 Q178,222 181,238 Q184,256 170,263 Q156,271 142,263 Q128,255 131,238 Q134,222 160,215 Z"
              stroke="#7a5615" stroke-width="4.5" fill="none"/>
        <path d="M142,263 Q130,280 137,292 Q144,305 160,302 Q176,305 183,292 Q190,280 178,263"
              stroke="#7a5615" stroke-width="4" fill="none"/>
      </g>
    </svg>`;
  document.body.appendChild(el);

  // Urgan ses efekti (mevcut sistemi kullan)
  if (window.playGameOver) playGameOver();

  setTimeout(() => {
    onDone();
    el.style.opacity = "0";
    el.style.transition = "opacity 0.7s ease";
    setTimeout(() => el.remove(), 720);
  }, 2800);
}

function checkGameOver() {
  if (isGameOver) return false;
  for (const stat of Object.keys(stats)) {
    if (stats[stat] <= 0)   { triggerGameOver(getRichDeathText(DEATH_TABLE[stat]?.[0]   || "Oyun bitti.", stat, 0));   return true; }
    if (stats[stat] >= 100) { triggerGameOver(getRichDeathText(DEATH_TABLE[stat]?.[100] || "Oyun bitti.", stat, 100)); return true; }
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

  // Padişah bizzat ziyaret — sağ = kabul, sol = ölüm
  if (currentCard.type === "padisah_ziyaret") {
    const btn = document.getElementById("easter-action-btn");
    if (btn) btn.classList.add("hidden");
    if (dir === "right") {
      sultanSabir = Math.min(100, sultanSabir + 5);
      cardsPlayed++;
      advanceHicriMonth();
      if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
      if (!isGameOver) { saveGameState(); setTimeout(dealNext, 200); }
    } else {
      deathCharacterKey = "1-sultan";
      const rageOvl = document.createElement("div");
      rageOvl.style.cssText = "position:fixed;inset:0;z-index:100;";
      document.body.appendChild(rageOvl);
      triggerSultanRage(rageOvl, () => {
        rageOvl.remove();
        showExecutionAnimation(() => {
          triggerGameOver("Sen bana nasıl karşı gelirsin BRE DEYYUS! — Son sözlerin bunlar oldu.");
        });
      });
    }
    return;
  }

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

  // Item grant — koşul kontrolü
  const grantKey = "grants_item_on_" + dir;
  if (currentCard[grantKey] && checkItemGrantCondition(currentCard.id)) {
    gainItem(currentCard[grantKey]);
  }

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

  // Easter egg injection'ları (sayaç bazlı — seyrek)
  if (!isGameOver) {
    // ★ GOD MODE — her 3 kartta rastgele easter egg
    if (godMode && cardsPlayed > 0 && cardsPlayed % 3 === 0) { // ★ GOD MODE
      const godEggs = [ // ★ GOD MODE
        () => ({ ...EASTER_CARDS.saray_kedisi }), // ★ GOD MODE
        () => ({ ...EASTER_CARDS.yanlis_adam }), // ★ GOD MODE
        () => ({ ...EASTER_CARDS.pargali }), // ★ GOD MODE
        getEvliyaCard, getZamanCard, getFisildayanCard, // ★ GOD MODE
        getBarbarosCard, getLeonardoCard, getHalitCard, // ★ GOD MODE
        getKehanetCard, getDonumCard, // ★ GOD MODE
        () => getFelaketCard(), () => getMucizeCard() // ★ GOD MODE
      ]; // ★ GOD MODE
      const fn = godEggs[Math.floor(Math.random() * godEggs.length)]; // ★ GOD MODE
      forcedQueue.unshift(fn()); // ★ GOD MODE
    } // ★ GOD MODE

    // Rastgele varyasyon: hedef aralığın ±%25'i
    const _rndIv = (base) => Math.round(base * (0.75 + Math.random() * 0.5));

    // Saray Kedisi: ortalama 65 kart, aralık 49-81
    if (cardsPlayed >= _easterKediNext) {
      _easterKediNext = cardsPlayed + _rndIv(65);
      forcedQueue.push({ ...EASTER_CARDS.saray_kedisi });
    }
    // Yanlış Adam: ortalama 55 kart, aralık 41-69
    if (cardsPlayed >= _easterYanlisNext) {
      _easterYanlisNext = cardsPlayed + _rndIv(55);
      _easterYanlisCount++;
      const yanlis = { ...EASTER_CARDS.yanlis_adam };
      if (_easterYanlisCount >= 3) yanlis.easter_type = "yanlis_idam";
      forcedQueue.push(yanlis);
    }
    // Tarihsel Kehanet: ortalama 60 kart, aralık 45-75
    if (cardsPlayed >= _easterKehanetNext) {
      _easterKehanetNext = cardsPlayed + _rndIv(60);
      forcedQueue.push(getKehanetCard());
    }
    // Evliya Çelebi: ortalama 45 kart, aralık 34-56
    if (cardsPlayed > 0 && cardsPlayed >= _easterEvliyaNext) {
      _easterEvliyaNext = cardsPlayed + _rndIv(45);
      forcedQueue.push(getEvliyaCard());
    }
    // Tarihsel figürler (Barbaros / Leonardo / Mahidevran): ortalama 70 kart, aralık 53-88
    if (cardsPlayed >= _easterHistNext) {
      _easterHistNext = cardsPlayed + _rndIv(70);
      forcedQueue.push(getNextHistoricalCard());
    }
    // Zaman Yolcusu: ortalama 80 kart, aralık 60-100
    if (cardsPlayed >= _easterZamanNext) {
      _easterZamanNext = cardsPlayed + _rndIv(80);
      forcedQueue.push(getZamanCard());
    }
    // Fısıltı karakteri: ortalama 95 kart, aralık 71-119, sadece gece
    if (isNight && cardsPlayed >= _easterFisildayanNext) {
      _easterFisildayanNext = cardsPlayed + _rndIv(95);
      forcedQueue.push(getFisildayanCard());
    }
    // Dönüm Noktası: oyun başına 1 kez, 42. kartta
    if (!_donumShownThisGame && cardsPlayed >= _donumNextCard) {
      forcedQueue.push(getDonumCard());
    }
    // Miras Kartı: bir önceki oyunda miras bırakıldıysa 15. karttan sonra 1 kez
    if (cardsPlayed >= 15 && localStorage.getItem("sadrazam_miras_bar")) {
      const mirasCard = getMirasCard();
      if (mirasCard) {
        forcedQueue.push(mirasCard);
        localStorage.removeItem("sadrazam_miras_bar"); // kuyruktan sonra sil (duplicate önle)
      }
    }
    // Pargalı İbrahim: en erken 35. kart, oyun başına 1 kez, %4
    if (!_easterPargaliDone && cardsPlayed >= 35 && Math.random() < 0.04) {
      _easterPargaliDone = true;
      forcedQueue.push({ ...EASTER_CARDS.pargali });
    }

    // Felaket kartı: ortalama stat ≥ 65 ve %6
    // Mucize kartı: ortalama stat ≤ 40 ve %6
    const _avgStat = Object.values(stats).reduce((a,b) => a+b, 0) / 4;
    if (_avgStat >= 65 && Math.random() < 0.06) {
      forcedQueue.unshift(getFelaketCard());
    } else if (_avgStat <= 40 && Math.random() < 0.06) {
      forcedQueue.unshift(getMucizeCard());
    }

    // Padişah ziyareti: her ~45 kartta 1, yıl 3+
    tryPadisahZiyareti();
  }

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
  if (currentCard && currentCard.character === "1-sultan") return; // sultan event overlay gösteriliyor
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
      const _spEN = window.LANG === 'en';
      const text = dx < 0
        ? ((_spEN && currentCard.speech_left_en)  ? currentCard.speech_left_en  : (currentCard.speech_left  || ""))
        : ((_spEN && currentCard.speech_right_en) ? currentCard.speech_right_en : (currentCard.speech_right || ""));
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
  // Sultan overlay açıkken ok tuşları sultana yönlendir
  if (document.getElementById("sultan-event-overlay")) {
    if (e.key === "ArrowRight" && window._sultanAccept) { e.preventDefault(); window._sultanAccept(); }
    if (e.key === "ArrowLeft"  && window._sultanReject) { e.preventDefault(); window._sultanReject(); }
    return;
  }
  if (card.classList.contains('no-swipe') || isAnimating || isGameOver || currentCard === null) return;
  if (currentCard && (currentCard.type === "negotiation" || currentCard.type === "letter")) return;
  if (currentCard && currentCard.character === "1-sultan") return;
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
    stats.hazine = Math.min(100, stats.hazine + 8);
  }

  stats.hazine = Math.max(0, stats.hazine - PASSIVE_HAZINE_DRAIN);
  updateStatUI();
  if (checkGameOver()) return;

  // Paşa terfi (yıl 3)
  if (isPasaMode && !pasaPromoted && year === 3) {
    const terfiCard = allCards.find(c => c.is_pasa_terfi);
    if (terfiCard) forcedQueue.unshift(terfiCard);
  }

  // Sultan mektupları kaldırıldı — sultan kartları showSultanEventCard ile yönetiliyor

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

  const months = (window.LANG === 'en' && window.EN_HICRI_MONTHS) ? window.EN_HICRI_MONTHS : HICRI_MONTHS;
  const isEN = window.LANG === 'en';
  let yearText = isEN
    ? `${year} years, ${months[hicriMonth % 12]} ${hicriYear}`
    : `${year} yıl, ${months[hicriMonth % 12]} ${hicriYear}`;
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
    recBanner.textContent = isEN ? "🏆 NEW RECORD!" : "🏆 YENİ REKOR!";
    recBanner.style.display = "block";
  } else {
    recBanner.style.display = "none";
    const oldBest = document.getElementById("gameover-year");
    if (oldBest) oldBest.textContent += isEN ? ` · Record: ${best} years` : ` · Rekor: ${best} yıl`;
  }

  // Achievement badge'ler
  renderAchievementBadges();

  // Ölüm arşivi
  renderDeathArchive();

  gameoverScreen.classList.add("visible");

  // Rating prompt — her 3. oyundan sonra, en az 2 yıl hayatta kaldıysa göster
  const gamesPlayed = parseInt(localStorage.getItem('sadrazam_games_played') || '0') + 1;
  localStorage.setItem('sadrazam_games_played', String(gamesPlayed));
  const alreadyRated = localStorage.getItem('sadrazam_rated');
  if (!alreadyRated && gamesPlayed % 3 === 0 && year >= 2) {
    setTimeout(() => showRatingPrompt(), 2500);
  }
}

function getDynamicDeathTitle(reason) {
  const isEN = window.LANG === 'en';
  if (reason.includes("idam"))                                    return isEN ? "EXECUTION ORDER ARRIVED"              : "İDAM FERMANI GELDİ";
  if (reason.includes("cellat"))                                  return isEN ? "MIDNIGHT'S END"                       : "GECE YARISI SONU";
  if (reason.includes("isyan") || reason.includes("Yeniçeri"))    return isEN ? "THE THRONE HAS FALLEN"                : "TAHT DEVRİLDİ";
  if (reason.includes("linç") || reason.includes("dinsizlik"))    return isEN ? "THE PEOPLE RISE"                      : "HALK AYAKTA";
  if (reason.includes("düşman") || reason.includes("surlarına"))  return isEN ? "ISTANBUL HAS FALLEN"                  : "İSTANBUL DÜŞTÜ";
  if (reason.includes("iflas"))                                   return isEN ? "THE TREASURY IS EMPTY"                : "HAZİNE BOŞALDI";
  if (reason.includes("zimmet"))                                  return isEN ? "THE ACCUSATION ARRIVED"               : "SUÇLAMA GELDİ";
  if (reason.includes("ihanet") || reason.includes("şikâyet"))    return isEN ? "BETRAYAL EXPOSED"                     : "İHANET AÇIĞA ÇIKTI";
  if (reason.includes("sürgün") || reason.includes("azletti"))    return isEN ? "THE DISMISSAL ORDER"                  : "AZIL FERMANI";
  return isEN ? "YOUR TENURE AS GRAND VIZIER HAS ENDED" : "SADRAZAMLIK SONA ERDİ";
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
      badge.className = "achievement-badge tier-" + a.tier;
      badge.textContent = a.icon + " " + a.name;
      badge.title = a.desc;
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
document.getElementById("share-btn").addEventListener("click", showShareMenu);

function getShareText() {
  const sultanName = selectedSultan ? selectedSultan.name : "Sultan";
  return `Divan: Sadrazam'da ${sultanName} döneminde ${year} yıl ayakta kalabildim! Sen kaç yıl dayanabilirsin? 🗡️\n\nApp Store'dan İndir!\nhttps://apps.apple.com/tr/app/divan-sadrazam/id6783881003`;
}

function showShareMenu() {
  document.getElementById("share-menu")?.remove();
  const menu = document.createElement("div");
  menu.id = "share-menu";
  menu.innerHTML = `
    <div id="share-menu-box">
      <div id="share-menu-title">PAYLAŞ</div>
      <button class="share-opt" id="share-wp">WhatsApp</button>
      <button class="share-opt" id="share-x">X (Twitter)</button>
      <button class="share-opt" id="share-ferman">Ferman Olarak Paylaş</button>
      <button class="share-opt ghost" id="share-cancel">İptal</button>
    </div>`;
  document.body.appendChild(menu);

  const text = getShareText();
  const encoded = encodeURIComponent(text);

  document.getElementById("share-wp").onclick = () => {
    menu.remove();
    window.open("https://api.whatsapp.com/send?text=" + encoded, "_blank");
  };
  document.getElementById("share-x").onclick = () => {
    menu.remove();
    window.open("https://x.com/intent/tweet?text=" + encoded, "_blank");
  };
  document.getElementById("share-ferman").onclick = async () => {
    menu.remove();
    await shareFerman();
  };
  document.getElementById("share-cancel").onclick = () => menu.remove();
  menu.addEventListener("click", e => { if (e.target === menu) menu.remove(); });
}

async function shareFerman() {
  const canvas = document.createElement("canvas");
  canvas.width = 800; canvas.height = 1100;
  const c = canvas.getContext("2d");
  const sultanName = selectedSultan ? selectedSultan.name : "Sultan";
  const deathText = document.getElementById("gameover-reason")?.textContent || "";

  // Arka plan
  c.fillStyle = "#070511";
  c.fillRect(0, 0, 800, 1100);

  // Dış çerçeve (çift altın hat)
  c.strokeStyle = "rgba(201,162,39,0.7)";
  c.lineWidth = 2;
  c.strokeRect(18, 18, 764, 1064);
  c.strokeStyle = "rgba(201,162,39,0.3)";
  c.lineWidth = 1;
  c.strokeRect(28, 28, 744, 1044);

  // Köşe bezemeleri
  const corners = [[28,28],[772,28],[28,1072],[772,1072]];
  corners.forEach(([x,y]) => {
    c.beginPath();
    c.arc(x, y, 8, 0, Math.PI*2);
    c.strokeStyle = "rgba(201,162,39,0.6)";
    c.lineWidth = 1.5;
    c.stroke();
  });

  // Üst süsleme çizgisi
  c.strokeStyle = "rgba(201,162,39,0.25)";
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(50, 90); c.lineTo(750, 90); c.stroke();
  c.beginPath(); c.moveTo(50, 95); c.lineTo(750, 95); c.stroke();

  // Orta çizgi
  c.beginPath(); c.moveTo(80, 560); c.lineTo(720, 560); c.stroke();

  // Alt çizgi
  c.beginPath(); c.moveTo(50, 1005); c.lineTo(750, 1005); c.stroke();
  c.beginPath(); c.moveTo(50, 1010); c.lineTo(750, 1010); c.stroke();

  // Tuğra sembolü
  c.fillStyle = "rgba(201,162,39,0.15)";
  c.beginPath(); c.arc(400, 200, 70, 0, Math.PI*2); c.fill();
  c.strokeStyle = "rgba(201,162,39,0.5)"; c.lineWidth = 1.5;
  c.beginPath(); c.arc(400, 200, 70, 0, Math.PI*2); c.stroke();

  // Hilal
  c.beginPath(); c.arc(400, 200, 45, 0, Math.PI*2);
  c.strokeStyle = "rgba(201,162,39,0.7)"; c.lineWidth = 1.5; c.stroke();
  c.beginPath(); c.arc(415, 194, 36, 0, Math.PI*2);
  c.fillStyle = "#070511"; c.fill();

  // Metin fonksiyonu
  function drawText(text, y, size, color, align="center", maxW=680) {
    c.font = `${size}px Georgia, serif`;
    c.fillStyle = color;
    c.textAlign = align;
    // Uzun metni wrap et
    const words = text.split(" ");
    let line = "", lines = [];
    for (const w of words) {
      const test = line + w + " ";
      if (c.measureText(test).width > maxW && line !== "") { lines.push(line.trim()); line = w + " "; }
      else line = test;
    }
    if (line) lines.push(line.trim());
    lines.forEach((l, i) => c.fillText(l, align==="center" ? 400 : 60, y + i*(size*1.4)));
    return lines.length;
  }

  // İçerik
  drawText("✦  S A D R A Z A M  ✦", 60, 22, "rgba(201,162,39,0.55)");
  drawText("SADRAZAMLIK SONA ERDİ", 310, 28, "#C9A227");
  drawText(sultanName + " Dönemi · " + year + " Yıl", 360, 18, "rgba(240,230,208,0.7)");

  c.font = "italic 15px Georgia, serif";
  c.fillStyle = "rgba(201,162,39,0.4)";
  c.textAlign = "center";
  c.fillText("· · ·", 400, 410);

  const reasonLines = drawText(deathText, 440, 16, "rgba(240,230,208,0.85)");
  const barY = 440 + reasonLines * 22 + 30;

  // Stat barları (basit)
  const barStats = [
    { label:"SARAY",   val: Math.round(stats.saray || 0) },
    { label:"ORDU",    val: Math.round(stats["yeniçeri"] || 0) },
    { label:"ULEMA",   val: Math.round(stats.ulema || 0) },
    { label:"HAZİNE",  val: Math.round(stats.hazine || 0) }
  ];
  let by = Math.max(barY, 590);
  barStats.forEach(({label, val}) => {
    c.font = "11px Georgia, serif";
    c.fillStyle = "rgba(201,162,39,0.5)";
    c.textAlign = "left";
    c.fillText(label, 80, by);
    c.fillStyle = "rgba(255,255,255,0.08)";
    c.fillRect(200, by-12, 500, 10);
    c.fillStyle = val < 30 ? "#e05555" : val > 70 ? "#C9A227" : "rgba(201,162,39,0.6)";
    c.fillRect(200, by-12, Math.round(val * 5), 10);
    c.font = "11px Georgia, serif";
    c.fillStyle = "rgba(240,230,208,0.5)";
    c.textAlign = "right";
    c.fillText(val + "%", 720, by);
    by += 30;
  });

  // Alt imza
  drawText("App Store'dan İndir · apps.apple.com/tr/app/divan-sadrazam/id6783881003", 1040, 11, "rgba(201,162,39,0.3)");

  // Paylaş
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], "sadrazam-ferman.png", { type: "image/png" });
    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Sadrazam Fermanı" });
      } else {
        // Fallback: indir
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "sadrazam-ferman.png"; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch(e) {}
  }, "image/png");
}

// ── Rating Prompt ────────────────────────────────────────────────
function showRatingPrompt() {
  if (document.getElementById('rating-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'rating-overlay';
  overlay.innerHTML = `
    <div id="rating-box">
      <div id="rating-stars">⭐⭐⭐⭐⭐</div>
      <div id="rating-title">Beğendin mi?</div>
      <div id="rating-text">Değerlendirmeni duymak isteriz. App Store'da puan vermen oyunu büyütmeye yardım ediyor.</div>
      <button id="rating-yes">Puan Ver ✦</button>
      <button id="rating-no">Şimdi Değil</button>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('rating-yes').onclick = () => {
    localStorage.setItem('sadrazam_rated', '1');
    overlay.remove();
    window.open('itms-apps://itunes.apple.com/app/id6783881003?action=write-review', '_blank');
  };
  document.getElementById('rating-no').onclick = () => overlay.remove();
}

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

// ── Oyun İçi Menü ────────────────────────────────────────────────
function showGameMenu() {
  if (isGameOver) return;
  const overlay = document.createElement("div");
  overlay.id = "game-menu-overlay";
  const isENMenu = window.LANG === 'en';
  overlay.innerHTML = `
    <div id="game-menu-box">
      <div id="game-menu-title">${isENMenu ? "PAUSED" : "DURAKLAT"}</div>
      <div id="game-menu-divider"></div>
      <button class="game-menu-option danger" id="gm-quit">${isENMenu ? "END GAME" : "OYUNU BİTİR"}</button>
      <button class="game-menu-option secondary" id="gm-resume">${isENMenu ? "CONTINUE" : "DEVAM ET"}</button>
    </div>`;
  document.body.appendChild(overlay);

  let menuFired = false;
  const doQuit = () => {
    if (menuFired) return; menuFired = true;
    overlay.remove();
    clearSave();
    isGameOver = true;
    stopAmbientMusic();
    gameScreen.classList.add("hidden");
    gameoverScreen.classList.remove("visible");
    gameScreen.classList.remove("night-mode");
    card.style.opacity = "0";
    currentCard = null;
    selectedSultan = null;
    selectedAdvisors = [];
    hideNegotiationPanel();
    const cinematicEl = document.getElementById("cinematic-death");
    if (cinematicEl) cinematicEl.classList.add("hidden");
    introScreen.style.display = "";
  };

  const doResume = () => { if (!document.body.contains(overlay)) return; overlay.remove(); };

  document.getElementById("gm-quit").addEventListener("click",    doQuit);
  document.getElementById("gm-quit").addEventListener("touchend", doQuit, { passive: true });
  document.getElementById("gm-resume").addEventListener("click",    doResume);
  document.getElementById("gm-resume").addEventListener("touchend", doResume, { passive: true });
  overlay.addEventListener("click", e => { if (e.target === overlay) doResume(); });
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
  if (progText) progText.textContent = window.LANG === 'en'
    ? `${count} / ${total} Achievements · ${pct}%`
    : `${count} / ${total} Başarım · %${pct}`;
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
  const isEN = window.LANG === 'en';
  const tierLabels = isEN
    ? { bronze:"Bronze", silver:"Silver", gold:"Gold", platinum:"Platinum", secret:"Secret" }
    : { bronze:"Bronz",  silver:"Gümüş",  gold:"Altın", platinum:"Platin",   secret:"Gizli"  };

  const toShow = filterTier === "all"
    ? [...ACHIEVEMENTS].sort((a,b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
    : ACHIEVEMENTS.filter(a => a.tier === filterTier);

  toShow.forEach(a => {
    const isUnlocked = unlocked.includes(a.id);
    const isSecret = a.tier === "secret";
    const card = document.createElement("div");
    card.className = `ach-card ${a.tier} ${isUnlocked ? "unlocked" : "locked"} ${isSecret ? "secret" : ""}`;

    const icon = isUnlocked ? a.icon : (isSecret ? "🔒" : "🔒");
    const enA = (window.LANG === 'en' && window.EN_ACHIEVEMENTS && window.EN_ACHIEVEMENTS[a.id]) || {};
    const name = (isSecret && !isUnlocked) ? "???" : (enA.name || a.name);
    const desc = (isSecret && !isUnlocked)
      ? (window.LANG === 'en' ? "A mysterious achievement…" : "Gizemli bir başarım…")
      : (enA.desc || a.desc);

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
