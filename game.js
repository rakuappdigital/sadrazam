// ═══════════════════════════════════════════════════════════════════
//  SADRAZAM — game.js  (v3.1)
// ═══════════════════════════════════════════════════════════════════


const CARDS_PER_YEAR = 24;       // 24 kart = 1 oyun yılı
const SEASON_CARDS   = 8;        // 8 kartta 1 mevsim değişimi
const PASSIVE_HAZINE_DRAIN = 2;  // yıl başına hazine drain (değişmedi)

// ── Freemium: Ücretsiz Deneme Sınırı ──────────────────────────────
// (3 Ekim 2026) Ücretsiz sürümde her saltanat en fazla 2 yıl sürer. Tam Sürüm ekranı
// İLK KEZ ya 2. yılın sonunda ya da 2 oyun bittikten sonraki oyun başında çıkar
// (hangisi önce olursa). Reddedilirse (kalıcı sadrazam_paywall_declined) oyuncu
// oynamaya devam eder; her saltanat 2. yılın sonunda bir uyarı penceresiyle biter
// (showFreeLimitPopup). Eskiden reddeden oyuncu HİÇ oynayamıyordu (her başlangıçta
// kapatılamaz paywall) — metin "2 yıl oynayabilirsin" dese de.
const FREE_YEAR_LIMIT = 2;
const DECLINED_YEAR_LIMIT = FREE_YEAR_LIMIT;
const FREE_GAMES_BEFORE_PAYWALL = 2;

// ── Akçe & İkinci Şans ─────────────────────────────────────────────
const SECOND_CHANCE_DAILY_AD_LIMIT = 5;
const SECOND_CHANCE_AKCE_COST = 2;
// Hoşgeldin Kesesi (29 Eylül 2026): Tam Sürüm + 30 akçe, tek seferlik, ₺39,99.
// NON-CONSUMABLE (geri yüklenebilir): Tam Sürüm'ü kalıcı açtığı için tüketilebilir
// olamaz. Eski tüketilebilir akce30start (hiç yayına çıkmadı) artık kullanılmıyor.
const STARTER_PRODUCT_ID = "com.rakuappdigital.sadrazam.welcome";
const AKCE_PACKS = [
  { amount: 10,  productId: "com.rakuappdigital.sadrazam.akce10" },
  { amount: 20,  productId: "com.rakuappdigital.sadrazam.akce20" },
  { amount: 50,  productId: "com.rakuappdigital.sadrazam.akce50" },
  { amount: 100, productId: "com.rakuappdigital.sadrazam.akce100" },
  { amount: 30,  productId: STARTER_PRODUCT_ID, starter: true },
];
const AKCE_FALLBACK_PRICES = { 10: "₺9,99", 20: "₺19,99", 50: "₺39,99", 100: "₺59,99", 30: "₺39,99" }; // FREEMIUM_ENABLED=false test modunda
// Reklamsız: tek seferlik (non-consumable) satın alma, geçiş reklamlarını kalıcı kapatır.
// İkinci Şans'taki ödüllü reklam isteğe bağlı olduğu için etkilenmez.
const NOADS_PRODUCT_ID = "com.rakuappdigital.sadrazam.noads";
// Tam Sürüm + Reklamsız paketi (3 Ekim 2026): NON-CONSUMABLE, ₺69,99. Sahiplik
// Hoşgeldin Kesesi gibi satın alınmış ürün listesinden okunur, iki kilidi birden açar.
const BUNDLE_PRODUCT_ID = "com.rakuappdigital.sadrazam.fullnoads";
const BUNDLE_FALLBACK_PRICE = "₺69,99";
const NOADS_FALLBACK_PRICE = "₺59,99";
// Akçe simgesi — emoji yerine tema rengini (currentColor) alan tek SVG, her yerde tutarlı görünsün
const AKCE_COIN_SVG = '<svg class="akce-coin-svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="5.5" stroke="currentColor" stroke-width="1"/><path d="M12 8.3v7.4M9.8 10l2.2-1.7 2.2 1.7M9.8 14l2.2 1.7 2.2-1.7" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/></svg>';
// Stok emoji yerine geçen ince altın çizgi ikonlar — AKCE_COIN_SVG ile aynı dil
// (currentColor stroke, viewBox 24x24). ICON_PROMPTS.md'deki konu listesine göre.
const _gi = (inner) => `<svg class="gi" viewBox="0 0 24 24" fill="none">${inner}</svg>`;
const GAME_ICONS = {
  // ── Başarımlar ──
  first_step:      _gi('<path d="M4 8.5a2 2 0 1 0 0 4M20 9.5a2 2 0 1 1 0 4" stroke="currentColor" stroke-width="1.05"/><path d="M4 8.5c4-1 12-1 16 1M4 12.5c4 1 12 1 16-1" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/><path d="M10 9.6v4.3l2-1.3 2 1.3V9.6" stroke="currentColor" stroke-width="0.8" stroke-linejoin="round"/>'),
  three_years:     _gi('<g stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M12 20L12 4"/><path d="M9.6 6.2h4.8"/><path d="M12 20L6 6"/><path d="M4.3 8.6l3.4-1"/><path d="M12 20L18 6"/><path d="M16.3 7.6l3.4 1"/></g>'),
  five_chars:      _gi('<g stroke="currentColor" stroke-width="1" stroke-linejoin="round"><path d="M6 17c0-2.2 1.3-3.6 3-3.6s3 1.4 3 3.6v1H6v-1Z"/><circle cx="9" cy="10.5" r="2.4"/><path d="M13 17c0-2.2 1.3-3.6 3-3.6s3 1.4 3 3.6v1h-6v-1Z"/><circle cx="16" cy="10.5" r="2.4"/></g>'),
  first_letter:    _gi('<path d="M4 7h16v11H4z" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><circle cx="12" cy="14.2" r="2.1" stroke="currentColor" stroke-width="0.9"/><path d="M12 12.7v3M10.8 14.2h2.4" stroke="currentColor" stroke-width="0.7"/>'),
  first_chance:    _gi('<ellipse cx="12" cy="11" rx="4.2" ry="8" stroke="currentColor" stroke-width="1.1"/><path d="M12 5.2v11.6M9.3 8l2.7-2 2.7 2M9.3 14l2.7 2 2.7-2" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/><ellipse cx="12" cy="20.2" rx="5.5" ry="1.1" stroke="currentColor" stroke-width="0.8" opacity="0.55"/>'),
  first_death:     _gi('<path d="M12 3v11" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M9.5 4.5h5L12 3l-2.5 1.5Z" stroke="currentColor" stroke-width="0.9" stroke-linejoin="round"/><path d="M9.8 14h4.4l-1.1 4-1.1 1-1.1-1-1.1-4Z" stroke="currentColor" stroke-width="0.9" stroke-linejoin="round"/><path d="M17 8c-1.8 0-3 1.6-3 3.4 0-1.8-1.2-3.4-3-3.4 1 2.4 2.6 3.6 3 5.6.4-2 2-3.2 3-5.6Z" stroke="currentColor" stroke-width="0.85" stroke-linejoin="round"/>'),
  item_user:       _gi('<path d="M4 11h16v7H4z" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M4 11c0-3 2-5 4-5M20 11c0-3-2-5-4-5M8 6h8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M12 10l0.8 1.8 1.8.2-1.4 1.3.4 1.9-1.6-1-1.6 1 .4-1.9L9.4 12l1.8-.2z" stroke="currentColor" stroke-width="0.8" stroke-linejoin="round"/>'),
  five_years:      _gi('<path d="M14.5 4.2a8 8 0 1 0 0 15.6 9.4 9.4 0 0 1 0-15.6Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><path d="M17.3 10.2l0.7 1.6 1.7 0.5-1.4 1.1 0.3 1.8-1.3-1-1.4 1 0.4-1.8-1.4-1.1 1.7-0.4z" stroke="currentColor" stroke-width="0.85" stroke-linejoin="round"/>'),
  balanced:        _gi('<path d="M12 3v16M8 19h8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M4 6h16" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M4 6l-2.3 5.2a2.6 2.6 0 0 0 5.1 0L4 6ZM20 6l-2.3 5.2a2.6 2.6 0 0 0 5.1 0L20 6Z" stroke="currentColor" stroke-width="0.9" stroke-linejoin="round"/><circle cx="12" cy="4.4" r="1.2" stroke="currentColor" stroke-width="0.9"/>'),
  hazine_guard:    _gi('<path d="M4 10h16v8H4z" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M4 10c0-2.8 2-4.4 4-4.4M20 10c0-2.8-2-4.4-4-4.4M8 5.6h8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><rect x="10.6" y="10" width="2.8" height="2.4" stroke="currentColor" stroke-width="0.85"/><circle cx="3" cy="19.5" r="1" stroke="currentColor" stroke-width="0.7"/><circle cx="6" cy="20.3" r="1" stroke="currentColor" stroke-width="0.7"/><circle cx="20.5" cy="19.7" r="1" stroke="currentColor" stroke-width="0.7"/>'),
  saray_high:      _gi('<path d="M4 17l1.6-8 3 4 3.4-6 3.4 6 3-4L20 17H4Z" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M4 17h16v2H4z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M12 3v3" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>'),
  chain_complete:  _gi('<circle cx="5.5" cy="12" r="3.6" stroke="currentColor" stroke-width="1.05"/><circle cx="12" cy="12" r="3.6" stroke="currentColor" stroke-width="1.05"/><circle cx="18.5" cy="12" r="3.6" stroke="currentColor" stroke-width="1.05"/>'),
  traitor_found:   _gi('<circle cx="10" cy="10" r="5" stroke="currentColor" stroke-width="1.05"/><path d="M13.8 13.8L19 19" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M7.5 10c0-1.8 1.1-3 2.5-3s2.5 1.2 2.5 3-1 3.4-2.5 4.6C8.5 13.4 7.5 11.8 7.5 10Z" stroke="currentColor" stroke-width="0.75" stroke-linejoin="round"/>'),
  war_victory:     _gi('<path d="M6 3c4 3 4 15 0 18" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M6 3v18" stroke="currentColor" stroke-width="0.6" stroke-dasharray="1.5 1.5"/><path d="M4 12h15M17 12l-2.5-2M17 12l-2.5 2" stroke="currentColor" stroke-width="0.95" stroke-linecap="round"/>'),
  all_letters:     _gi('<g stroke="currentColor" stroke-width="0.95" stroke-linejoin="round"><rect x="3.5" y="9" width="6" height="8" transform="rotate(-18 6.5 13)"/><rect x="9" y="8" width="6" height="9" transform="rotate(-6 12 12.5)"/><rect x="14" y="8" width="6" height="9" transform="rotate(6 17 12.5)"/></g>'),
  ten_years:       _gi('<path d="M12 3l3 3H9l3-3Z" stroke="currentColor" stroke-width="0.95" stroke-linejoin="round"/><path d="M7 6h10v2H7z" stroke="currentColor" stroke-width="0.95"/><path d="M6 19V9M18 19V9M9 19v-6M15 19v-6M6 19h12" stroke="currentColor" stroke-width="0.95" stroke-linecap="round"/>'),
  kanuni_ten:      _gi('<path d="M12 2l1.6 6.2L20 10l-6.4 1.8L12 18l-1.6-6.2L4 10l6.4-1.8L12 2Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M12 2l1.6 6.2L20 10l-6.4 1.8L12 18l-1.6-6.2L4 10l6.4-1.8L12 2Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round" transform="rotate(45 12 10)"/><circle cx="12" cy="10" r="0.9" fill="currentColor" stroke="none"/>'),
  yavuz_eight:     _gi('<path d="M13 2L6 13h5l-2 9 9-13h-5l2-7Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>'),
  murad_treasure:  _gi('<path d="M8 8h8l3 4-7 8-7-8 3-4Z" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M5 12h14M9 12l3 8 3-8" stroke="currentColor" stroke-width="0.75" stroke-linejoin="round"/>'),
  all_deaths:      _gi('<circle cx="12" cy="10" r="5.2" stroke="currentColor" stroke-width="1.05"/><path d="M9 15v2.2M15 15v2.2M9.5 20h5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><circle cx="9.8" cy="9.5" r="1.1" stroke="currentColor" stroke-width="0.8"/><circle cx="14.2" cy="9.5" r="1.1" stroke="currentColor" stroke-width="0.8"/><path d="M11 12.2l1-1.6 1 1.6" stroke="currentColor" stroke-width="0.7"/>'),
  curse_master:    _gi('<path d="M12 3c2 3-1 4-1 7a3 3 0 1 0 6 0c0-1.5-1-2.4-1.8-3.2 1 2 .2 3.4-1 3.4-1.6 0-1-2-.4-3.4C14.6 5 13 4 12 3Z" stroke="currentColor" stroke-width="0.95" stroke-linejoin="round"/><path d="M8 12a4 4 0 1 0 8 0c0 2.2-1.8 4-4 4s-4-1.8-4-4Z" stroke="currentColor" stroke-width="0.95" stroke-linejoin="round"/>'),
  chance_streak:   _gi('<g stroke="currentColor" stroke-width="0.95"><circle cx="6" cy="6" r="2.6"/><circle cx="12" cy="12" r="2.6"/><circle cx="18" cy="18" r="2.6"/></g>'),
  no_curse:        _gi('<path d="M3 13c3-3 6-2 8 0 1-3 4-5 8-4-3 1-4 3-4 5 2 0 4 1 6 3-3 0-6 0-8-1-2 3-6 4-10 3 2-1 3-2 3-3-1-1-2-2-3-3Z" stroke="currentColor" stroke-width="0.9" stroke-linejoin="round"/>'),
  sabir_imtihani:  _gi('<path d="M7 3h10M7 21h10M7 3c0 5 4 6 5 8-1 2-5 3-5 8M17 3c0 5-4 6-5 8 1 2 5 3 5 8" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M12 11v2" stroke="currentColor" stroke-width="0.7" stroke-linecap="round"/>'),
  legend:          _gi('<path d="M12 3c0 3.8 1.2 6.4 3 8.2 1.8 1.8 4.4 3 8.2 3-3.8 0-6.4 1.2-8.2 3-1.8 1.8-3 4.4-3 8.2 0-3.8-1.2-6.4-3-8.2-1.8-1.8-4.4-3-8.2-3 3.8 0 6.4-1.2 8.2-3 1.8-1.8 3-4.4 3-8.2Z" stroke="currentColor" stroke-width="1"/><path d="M5 5l0.8 0.8M19 5l-0.8 0.8M5 19l0.8-0.8" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>'),
  all_chars:       _gi('<path d="M4 6l5-1.5 6 1.5 5-1.5v13l-5 1.5-6-1.5-5 1.5Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M9 4.5v13M15 6v13" stroke="currentColor" stroke-width="0.75"/><path d="M12 9l1 2-1 2-1-2Z" stroke="currentColor" stroke-width="0.7" stroke-linejoin="round"/>'),
  no_low_stat:     _gi('<path d="M12 3v15" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M12 3c-1.6 0-2.6 1.6-2 3.4M12 3c1.6 0 2.6 1.6 2 3.4" stroke="currentColor" stroke-width="0.95" stroke-linecap="round"/><path d="M8 21h8M9.5 21v-3M14.5 21v-3" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/><path d="M9 8.5a3 3 0 1 0 6 0" stroke="currentColor" stroke-width="0.85"/>'),
  pasa_mode:       _gi('<path d="M4 15a1.8 1.8 0 1 0 0 3.6h6.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M4 15h9v3.6H10.5" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M13 15V9M13 9l-2 3-2-3M13 9l2 3 2-3" stroke="currentColor" stroke-width="0.9" stroke-linejoin="round"/>'),
  item_collector:  _gi('<path d="M4 8c0-1.5 1.5-2.5 4-2.5S12 6.5 12 8v3c0 2.2-1.8 4-4 4S4 13.2 4 11V8Z" stroke="currentColor" stroke-width="0.95" stroke-linejoin="round"/><circle cx="6.3" cy="8.5" r="0.6" fill="currentColor" stroke="none"/><circle cx="9.3" cy="8.5" r="0.6" fill="currentColor" stroke="none"/><path d="M6 11.2Q8 13 10 11.2" stroke="currentColor" stroke-width="0.7" stroke-linecap="round"/><path d="M12 11c0-1.5 1.5-2.5 4-2.5s4 1 4 2.5v3c0 2.2-1.8 4-4 4s-4-1.8-4-4v-3Z" stroke="currentColor" stroke-width="0.95" stroke-linejoin="round"/><circle cx="14.3" cy="11.5" r="0.6" fill="currentColor" stroke="none"/><circle cx="17.3" cy="11.5" r="0.6" fill="currentColor" stroke="none"/><path d="M14 15.8Q16 14.3 18 15.8" stroke="currentColor" stroke-width="0.7" stroke-linecap="round"/>'),
  gizli_ustat:     _gi('<path d="M12 4l1.2 3.8H17l-3.1 2.3 1.2 3.8L12 11.6l-3.1 2.3 1.2-3.8L7 7.8h3.8L12 4Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M5 12c1 3 2 5 3 6M19 12c-1 3-2 5-3 6" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/><path d="M6 15c1 0 1.5.5 1.5 1M17.5 16c-1 0-1.5.5-1.5 1" stroke="currentColor" stroke-width="0.7" stroke-linecap="round"/>'),
  rival_five:      _gi('<path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M12 10.5l1.5 1.5-1.5 1.5-1.5-1.5z" stroke="currentColor" stroke-width="0.8" stroke-linejoin="round"/><path d="M5 5l2.2.5M19 5l-2.2.5M5 19l2.2-.5M19 19l-2.2-.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>'),
  zimmet:          _gi('<path d="M8.5 9c0-2.2 1.6-4 3.5-4s3.5 1.8 3.5 4" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/><path d="M6 9h12l1 3c.6 4-2.2 8-7 8s-7.6-4-7-8Z" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M10 13l1.2 1.4M14.5 12.5l-1 1.8" stroke="currentColor" stroke-width="0.7" stroke-linecap="round"/><circle cx="6" cy="20" r="1" stroke="currentColor" stroke-width="0.7"/><circle cx="4" cy="21.3" r="1" stroke="currentColor" stroke-width="0.7"/>'),
  valide_loyal:    _gi('<path d="M12 21v-7" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M12 14c-3 0-4.5-2.4-4.5-5.4 2 .6 3 1.8 3.4 3C11.2 9.4 11 7 12 5c1 2 .8 4.4 1.1 6.6.4-1.2 1.4-2.4 3.4-3 0 3-1.5 5.4-4.5 5.4Z" stroke="currentColor" stroke-width="0.95" stroke-linejoin="round"/><path d="M17 5l.5 1.3L19 6.8l-1.3.5L17 8.5l-.5-1.2L15 6.8l1.5-.5z" stroke="currentColor" stroke-width="0.7" stroke-linejoin="round"/>'),
  diplomat:        _gi('<path d="M4 15c3-1 5-4 8-4s5 3 8 4" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/><path d="M9 13l2 3M15 13l-2 3" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/><rect x="9.5" y="7" width="5" height="3.4" rx="0.5" stroke="currentColor" stroke-width="0.75"/>'),
  deli_dervis_right: _gi('<circle cx="12" cy="10" r="5" stroke="currentColor" stroke-width="1.05"/><path d="M12 5.2c-1.2 1.4-1.2 8.2 0 9.6M8.4 7.6c1.6 2 5.6 2 7.2 0M8.4 12.4c1.6-2 5.6-2 7.2 0" stroke="currentColor" stroke-width="0.55"/><path d="M9 15l-3 6M15 15l3 6M12 15v6" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>'),
  // ── Arayüz ikonları ──
  province_rumeli:   _gi('<path d="M12 21V5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M9.5 6.5L12 3l2.5 3.5" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M12 8l5 2-5 1.4z" stroke="currentColor" stroke-width="0.85" stroke-linejoin="round"/>'),
  province_anadolu:  _gi('<path d="M12 3v13M9 6l3-1 3 1M8 9l4-1 4 1M7 12l5-1 5 1" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/><path d="M9.5 16h5l-1 5h-3z" stroke="currentColor" stroke-width="0.85" stroke-linejoin="round"/>'),
  province_misir:    _gi('<path d="M4 20l4-7 4 7Z" stroke="currentColor" stroke-width="0.9" stroke-linejoin="round"/><ellipse cx="16" cy="13" rx="4" ry="1.4" stroke="currentColor" stroke-width="0.85"/><ellipse cx="16" cy="16" rx="4" ry="1.4" stroke="currentColor" stroke-width="0.85"/><ellipse cx="16" cy="19" rx="4" ry="1.4" stroke="currentColor" stroke-width="0.85"/>'),
  province_dogu:     _gi('<circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.05"/><path d="M14 7.5a5.4 5.4 0 1 0 0 9 6.4 6.4 0 0 1 0-9Z" stroke="currentColor" stroke-width="0.8" stroke-linejoin="round"/>'),
  province_akdeniz:  _gi('<circle cx="12" cy="6" r="1.6" stroke="currentColor" stroke-width="0.95"/><path d="M12 7.6v11M8 12H6a6 6 0 0 0 6 7 6 6 0 0 0 6-7h-2" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/><path d="M9 9.5h6" stroke="currentColor" stroke-width="0.95" stroke-linecap="round"/>'),
  loyalty_low:       _gi('<path d="M12 3c1.8 2.6-1 3.6-1 6.2a2.6 2.6 0 1 0 5.2 0c0-1.3-.8-2-1.4-2.7.8 1.7.1 2.9-.9 2.9-1.3 0-.8-1.7-.3-2.9C14 5.3 12.8 4.1 12 3Z" stroke="currentColor" stroke-width="0.85" stroke-linejoin="round"/><path d="M9 12a3.4 3.4 0 1 0 6.8 0c0 1.9-1.5 3.4-3.4 3.4S9 13.9 9 12Z" stroke="currentColor" stroke-width="0.85" stroke-linejoin="round"/>'),
  loyalty_high:      _gi('<path d="M12 20c0-6 2-9 6-12" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M14 11c1-1 1-2.4 0-3.2-.4 1.2-1.2 1.6-2 1.6M16 8.4c1-.6 1.4-1.8 1-2.8-.8.6-1.6.6-2.2.2M11.5 14c1-.6 1.3-1.8.8-2.8-.7.6-1.5.6-2 .2" stroke="currentColor" stroke-width="0.75" stroke-linecap="round"/>'),
  action_negotiate:  _gi('<path d="M4 15c3-1 5-4 8-4s5 3 8 4" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/><path d="M9 13l2 3M15 13l-2 3" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/>'),
  action_force:      _gi('<path d="M12 20V9" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M9.5 9.5h5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M12 9c1.5-2 1-4.5-1-6 2.5 0 4.5 2.2 4 5-1 .6-2 .8-3 1Z" stroke="currentColor" stroke-width="0.85" stroke-linejoin="round"/>'),
  action_gamble:     _gi('<rect x="5" y="10" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="0.95"/><circle cx="6.8" cy="11.8" r="0.5" fill="currentColor" stroke="none"/><circle cx="9.2" cy="14.2" r="0.5" fill="currentColor" stroke="none"/><rect x="12" y="8" width="6" height="6" rx="1.2" stroke="currentColor" stroke-width="0.95"/><circle cx="13.8" cy="9.8" r="0.5" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="0.5" fill="currentColor" stroke="none"/><circle cx="16.2" cy="12.2" r="0.5" fill="currentColor" stroke="none"/><path d="M3 18h18" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/>'),
  trophy:            _gi('<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" stroke="currentColor" stroke-width="1.05" stroke-linejoin="round"/><path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/><path d="M12 13v3M9 20h6M10 17h4l.5 3h-5z" stroke="currentColor" stroke-width="0.9" stroke-linejoin="round"/>'),
  locked:            _gi('<rect x="5.5" y="11" width="13" height="9" rx="1.6" stroke="currentColor" stroke-width="1.05"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.05"/><circle cx="12" cy="15" r="1.3" stroke="currentColor" stroke-width="0.85"/><path d="M12 16.3v1.8" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/>'),
};
let _secondChanceUsedThisDeath = false; // her ölümde sadece 1 kez teklif edilir
let _secondChanceOfferedThisGame = false; // İkinci Şans bir oyun boyunca sadece 1 kez teklif edilir

// ── Tek merkezi "akçe yetersiz → satın alma ekranına yönlendir" mekanizması ──
// Oyunda akçe harcayan HER yer (İkinci Şans, Eşya Dükkanı, ileride eklenecek
// her ne olursa) bakiye yetersizse bunu çağırır. Akçe ekranı kapanınca (satın
// alınsın ya da alınmasın) callback tetiklenir — kullanıcı kaldığı yere döner.
let _akceReturnCallback = null;
function redirectToAkcePurchase(returnCallback) {
  _akceReturnCallback = returnCallback || null;
  showAkceScreen();
}

function getAkceBalance() {
  return parseInt(localStorage.getItem("sadrazam_akce") || "0", 10);
}
function addAkce(n) {
  const bal = getAkceBalance() + n;
  localStorage.setItem("sadrazam_akce", String(bal));
  updateAkceUI();
  return bal;
}
function spendAkce(n) {
  const bal = getAkceBalance();
  if (bal < n) return false;
  localStorage.setItem("sadrazam_akce", String(bal - n));
  updateAkceUI();
  return true;
}
function updateAkceUI() {
  document.querySelectorAll(".akce-balance-display").forEach(el => {
    el.textContent = getAkceBalance();
  });
}

// ── Akçe işlemlerini TEK bir yerden, kaynağı ne olursa olsun işle ────
// (normal buton satın alması, App Store promosyon/hediye kodu, restore,
// başka bir cihazdan yapılan satın alma...) — RevenueCat'in customerInfo
// listener'ı bunların HEPSİNİ tetikler, ama sadece buton-satın-alma akışına
// bakan eski kod promosyon kodlarını hiç görmüyordu. Aynı transactionIdentifier
// iki kez işlenmesin diye kalıcı olarak (localStorage) kaydediliyor.
function _getProcessedAkceTxIds() {
  try { return new Set(JSON.parse(localStorage.getItem("sadrazam_akce_tx_processed") || "[]")); }
  catch (e) { return new Set(); }
}
function _markAkceTxProcessed(id) {
  const set = _getProcessedAkceTxIds();
  set.add(id);
  // Sınırsız büyümesin — sadece son 200 işlemi tut
  const arr = [...set];
  localStorage.setItem("sadrazam_akce_tx_processed", JSON.stringify(arr.slice(-200)));
}
function processAkceTransactions(customerInfo) {
  const txs = customerInfo?.nonSubscriptionTransactions;
  if (!Array.isArray(txs) || !txs.length) return;
  const processed = _getProcessedAkceTxIds();
  for (const tx of txs) {
    // Başlangıç Kesesi bir kez alındıysa (geri yüklemede de) bir daha teklif edilmez
    if (tx && tx.productIdentifier === STARTER_PRODUCT_ID) _markStarterBought();
    if (!tx || !tx.transactionIdentifier || processed.has(tx.transactionIdentifier)) continue;
    const pack = AKCE_PACKS.find(p => p.productId === tx.productIdentifier);
    if (!pack) continue;
    addAkce(pack.amount);
    _markAkceTxProcessed(tx.transactionIdentifier);
  }
}

function _todayKey() {
  // toISOString() UTC kullanır — Türkiye (UTC+3) yerel gece yarısından sonra (00:00-03:00
  // arası) UTC günü hâlâ dünmüş gibi davranır, 03:00'ı geçince ise UTC günü döner ve
  // "günlük" reklam sayacı aynı yerel günün İÇİNDE bir kez daha sıfırlanır — limit atlanır.
  // Cihazın kendi yerel tarihini kullanmak bu kaymayı ortadan kaldırır.
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
// ── Günlük Divan Hediyesi (27 Eylül 2026) ─────────────────────────────
// Günde bir kez ödüllü reklam → 1 akçe. 7 gün üst üste gelinirse 7. gün 1+3.
// Bir gün kaçırılırsa seri 1'den başlar; 7. günden sonra seri yeniden 1'e döner.
// Tarih: cihazın YEREL günü (_todayKey) — saat dilimi kaymasıyla hile/kayıp olmasın.
const DAILY_GIFT_KEY = "sadrazam_daily_gift";
const DAILY_GIFT_STREAK_BONUS = 3;
function _dateKeyOffset(days) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function _readDailyGift() {
  try { const o = JSON.parse(localStorage.getItem(DAILY_GIFT_KEY) || "{}"); return { last: o.last || "", streak: +o.streak || 0 }; }
  catch (e) { return { last: "", streak: 0 }; }
}
// { claimed: bugün alındı mı, day: bugünün seri günü (1-7), reward: bugünkü ödül, streakShown }
function getDailyGiftStatus() {
  const st = _readDailyGift(), today = _todayKey();
  if (st.last === today) return { claimed: true, day: st.streak, reward: 0 };
  const day = (st.last === _dateKeyOffset(-1)) ? (st.streak % 7) + 1 : 1;
  return { claimed: false, day, reward: day === 7 ? 1 + DAILY_GIFT_STREAK_BONUS : 1 };
}
function _claimDailyGift() {
  const stt = getDailyGiftStatus();
  if (stt.claimed) return 0;
  localStorage.setItem(DAILY_GIFT_KEY, JSON.stringify({ last: _todayKey(), streak: stt.day }));
  addAkce(stt.reward);
  return stt.reward;
}
function updateDailyGiftBadge() {
  const b = document.getElementById("btn-daily-gift");
  if (b) b.classList.toggle("ready", !getDailyGiftStatus().claimed);
}
function showDailyGift() {
  if (document.getElementById("daily-gift-overlay")) return;
  const isEN = window.LANG === 'en';
  const overlay = document.createElement("div");
  overlay.id = "daily-gift-overlay";
  const render = () => {
    const stt = getDailyGiftStatus();
    const seals = [1, 2, 3, 4, 5, 6, 7].map(i => {
      const done = stt.claimed ? i <= stt.day : i < stt.day;
      const today = !stt.claimed && i === stt.day;
      return `<div class="dg-seal${done ? " done" : ""}${today ? " today" : ""}${i === 7 ? " last" : ""}">
        <span class="dg-amt">${i === 7 ? "+" + (1 + DAILY_GIFT_STREAK_BONUS) : "+1"}</span><span class="dg-day">${isEN ? "Day" : "Gün"} ${i}</span></div>`;
    }).join("");
    overlay.innerHTML = `
      <div id="daily-gift-box">
        <div class="dg-title">${isEN ? "DIVAN GIFT" : "DİVAN HEDİYESİ"}</div>
        <div class="dg-sub">${isEN ? "Each day the treasury sends an akce to the grand vizier who attends the Divan. Seven days in a row brings a bonus." : "Divan'a her gün uğrayan sadrazama hazineden bir akçe. Yedi gün üst üste gelene bonus."}</div>
        <div class="dg-seals">${seals}</div>
        ${stt.claimed
          ? `<div class="dg-done">${isEN ? "Today's gift has been received. Come back tomorrow." : "Bugünün hediyesi alındı. Yarın yine gel."}</div>`
          : `<button id="dg-claim" class="dg-claim">${isEN ? "Watch Ad" : "Reklam İzle"} · +${stt.reward} ${isEN ? "AKCE" : "AKÇE"}</button>`}
        <div class="dg-msg" id="dg-msg"></div>
        <button id="dg-close" class="dg-close">${isEN ? "Close" : "Kapat"}</button>
      </div>`;
    overlay.querySelector("#dg-close").onclick = () => { overlay.classList.remove("visible"); setTimeout(() => overlay.remove(), 250); };
    const claim = overlay.querySelector("#dg-claim");
    if (claim) claim.onclick = () => {
      claim.disabled = true;
      overlay.querySelector("#dg-msg").textContent = "";
      RewardedAds.show(
        () => { // izlendi
          const got = _claimDailyGift();
          updateAkceUI(); updateDailyGiftBadge();
          if (window.playSelectConfirm) playSelectConfirm();
          render();
          overlay.querySelector("#dg-msg").textContent = isEN ? `+${got} akce added to your treasury.` : `+${got} akçe hazinene eklendi.`;
          overlay.querySelector("#dg-msg").classList.add("ok");
        },
        () => { // gösterilemedi
          claim.disabled = false;
          overlay.querySelector("#dg-msg").textContent = isEN ? "The ad could not be shown. Please try again shortly." : "Reklam gösterilemedi. Biraz sonra tekrar dene.";
        }
      );
    };
  };
  render();
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));
}

function getSecondChanceAdsUsedToday() {
  const today = _todayKey();
  if (localStorage.getItem("sadrazam_second_chance_date") !== today) {
    localStorage.setItem("sadrazam_second_chance_date", today);
    localStorage.setItem("sadrazam_second_chance_count", "0");
    return 0;
  }
  return parseInt(localStorage.getItem("sadrazam_second_chance_count") || "0", 10);
}
function incrementSecondChanceAdsUsedToday() {
  const used = getSecondChanceAdsUsedToday() + 1; // tarih sıfırlamasını da tetikler
  localStorage.setItem("sadrazam_second_chance_count", String(used));
}

// ── İkinci Şans metin kademeleri (yıla göre, stat mekaniğinden hiç bahsetmez) ──
const SECOND_CHANCE_TIERS_TR = [
  { max: 3,   text: "Bir karar seni bu noktaya getirdi. Devam etmek ister misin?" },
  { max: 7,   text: "{year} yıldır bu makamdasın. Bu kadar çabayı burada bırakma." },
  { max: 12,  text: "{year} yıllık bir saltanat tehlikede. Bırakmayacak mısın?" },
  { max: 19,  text: "Nadir görülen bir hükümdarlık yazıyorsun. Burada bitmesin." },
  { max: Infinity, text: "Efsanevi bir saltanat sona ermek üzere. Tarihe geçecek bu hikâyeyi burada bırakma." }
];
const SECOND_CHANCE_TIERS_EN = [
  { max: 3,   text: "One decision brought you here. Continue your reign?" },
  { max: 7,   text: "{year} years in this seat. Don't let it end here." },
  { max: 12,  text: "A {year}-year reign hangs in the balance. Will you let it fall?" },
  { max: 19,  text: "You're writing a rare legacy. Don't let it end now." },
  { max: Infinity, text: "A legendary reign is about to end. Don't let this story stop here." }
];

// Kişisel rekor kırılmaya yakınken (yıl >= rekor - 2) öncelikli gösterilir
const SECOND_CHANCE_RECORD_TR = [
  "Bugüne kadar en uzun yaşamış sadrazam olabilirsin. Bırakma.",
  "Rekorunu kırmana çok az kaldı. Devam et.",
  "Kayıtlara geçecek bir an bu — tarihe adını yazdır.",
  "Bugüne kadarki en uzun saltanatının eşiğindesin."
];
const SECOND_CHANCE_RECORD_EN = [
  "You could become the longest-reigning Grand Vizier yet. Don't stop now.",
  "You're on the verge of breaking your own record. Keep going.",
  "This moment could go down in history — make it yours.",
  "You're at the threshold of your longest reign yet."
];

// Reklam/akçe sonrası kısa "kurtuluş anı" — stat mekaniğinden bahsetmez, anlatıya bağlar
const SECOND_CHANCE_RESCUE_TR = [
  "Sadık bir danışmanın son anda araya girmesiyle felaket ertelendi.",
  "Divan'da kimse bilmeden, gizli bir el kaderini değiştirdi.",
  "Bir mucize mi, bir komplo mu? Saltanatın bir nefes daha aldı.",
  "Ölüm fermanı imzalanmadan geri çekildi.",
  "Kaderini bir kez daha kendi ellerinle yazıyorsun."
];
const SECOND_CHANCE_RESCUE_EN = [
  "A loyal advisor intervened just in time, and disaster was postponed.",
  "Unknown to the Divan, a hidden hand altered your fate.",
  "A miracle, or a conspiracy? Your reign draws one more breath.",
  "The execution order was withdrawn before it could be signed.",
  "Once again, you write your fate with your own hands."
];

// ── Şaka Onay Easter Egg ────────────────────────────────────────────
// Önemli, tek butonla geçilen kartlarda (mektup, padişah ziyareti vb.) 40'ta
// 1 ihtimalle tamamen anlamsız/eğlenceli, hiçbir mekanik sonucu olmayan bir
// "emin misin?" sorusu çıkar. Tek amacı gülümsetmek — reddedilemez, tek buton
// var ve o da zaten devam ettirir.
const FUNNY_CONFIRM_EASTER_ODDS = 1 / 40;
const FUNNY_CONFIRM_EASTER_TR = [
  "Bu kararı gerçekten anladın mı, yoksa sadece \"DEVAM\" yazdığı için mi tıkladın?",
  "Sadrazam Hazretleri, bir dahaki sefere biraz daha düşünseniz olmaz mı?",
  "Kâtip bu satırı iki kez okumanızı rica ediyor. Okudunuz mu gerçekten?",
  "Emin misiniz? Yani... GERÇEKTEN emin misiniz?",
  "Divan-ı Hümayun'da biri fısıldıyor: \"Acele etme...\" Ama siz zaten tıkladınız.",
  "Bu kadar hızlı karar veren bir sadrazam görmemiştim doğrusu.",
  "Tarihçiler bu anı not aldı: \"Ve düşünmeden ilerledi.\"",
  "Bir kahve molası vermek ister misiniz? Hayır mı? Peki, devam.",
  "Vezir-i Âzam, parmağınız mı kaydı yoksa gerçekten mi karar verdiniz?",
  "Saray mimarı bu ekranı sizi biraz bekletmek için özel tasarladı. İşe yaradı mı?"
];
const FUNNY_CONFIRM_EASTER_EN = [
  "Are you sure you understood that, or did you just click because it said CONTINUE?",
  "Your Excellency, perhaps a moment more of thought wouldn't hurt?",
  "The scribe kindly asks you to read that line twice. Did you, really?",
  "Are you sure? I mean... are you REALLY sure?",
  "Someone in the Imperial Council whispers \"Don't rush...\" But you already clicked.",
  "I've never seen a Grand Vizier decide quite this fast.",
  "The historians noted this moment: \"And he proceeded without a second thought.\"",
  "Would you like a coffee break first? No? Very well, proceed.",
  "Grand Vizier, did your finger slip, or was that truly a decision?",
  "The palace architect designed this very screen just to make you wait a little. Did it work?"
];

// Belirli bir olasılıkla şaka popup'ı gösterir; gösterildiyse true döner (çağıran
// fonksiyon asıl işlemi ERTELEMELİ, popup'ın tek butonu onProceed()'i çağırır).
// Gösterilmediyse false döner, çağıran fonksiyon normal akışına hemen devam eder.
function maybeShowFunnyConfirmEasterEgg(onProceed) {
  if (Math.random() >= FUNNY_CONFIRM_EASTER_ODDS) return false;
  const isEN = window.LANG === 'en';
  const text = _pickRandom(isEN ? FUNNY_CONFIRM_EASTER_EN : FUNNY_CONFIRM_EASTER_TR);
  const overlay = document.createElement("div");
  overlay.id = "funny-confirm-overlay";
  overlay.innerHTML = `
    <div id="funny-confirm-box">
      <div id="funny-confirm-text">${text}</div>
      <button id="funny-confirm-btn">${isEN ? "Yes, I'm Sure →" : "Evet, Eminim →"}</button>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));
  let _fired = false;
  document.getElementById("funny-confirm-btn").onclick = () => {
    if (_fired) return;
    _fired = true;
    overlay.classList.remove("visible");
    setTimeout(() => { overlay.remove(); onProceed(); }, 250);
  };
  return true;
}

function _pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function _getSecondChanceOfferText() {
  const isEN = window.LANG === 'en';
  const bestYear = parseInt(localStorage.getItem("sadrazam_best_year") || "0", 10);
  const isRecordThreat = bestYear > 0 && year >= bestYear - 2;

  if (isRecordThreat) {
    return _pickRandom(isEN ? SECOND_CHANCE_RECORD_EN : SECOND_CHANCE_RECORD_TR);
  }
  const tiers = isEN ? SECOND_CHANCE_TIERS_EN : SECOND_CHANCE_TIERS_TR;
  const tier = tiers.find(t => year <= t.max) || tiers[tiers.length - 1];
  return tier.text.replace("{year}", year);
}

function showSecondChanceOffer(reason) {
  const isEN = window.LANG === 'en';
  const adsLeft = SECOND_CHANCE_DAILY_AD_LIMIT - getSecondChanceAdsUsedToday();
  const akce = getAkceBalance();
  const offerText = _getSecondChanceOfferText();

  const overlay = document.createElement("div");
  overlay.id = "second-chance-overlay";
  overlay.innerHTML = `
    <div id="second-chance-box">
      <div id="second-chance-icon">⏳</div>
      <div id="second-chance-title">${isEN ? "SECOND CHANCE" : "İKİNCİ ŞANS"}</div>
      <div id="second-chance-text">${offerText}</div>
      ${_pendingConsequencesHTML(window.innerHeight <= 620 ? 2 : 3)}
      <button id="second-chance-ad-btn" class="second-chance-btn"${adsLeft <= 0 ? " disabled" : ""}>
        🎬 ${isEN ? "Watch Ad" : "Reklam İzle"} <span class="sc-sub">(${adsLeft}/${SECOND_CHANCE_DAILY_AD_LIMIT})</span>
      </button>
      ${AKCE_SYSTEM_ENABLED ? `<button id="second-chance-akce-btn" class="second-chance-btn">
        🪙 ${isEN ? `Use ${SECOND_CHANCE_AKCE_COST} Akce` : `${SECOND_CHANCE_AKCE_COST} Akçe Kullan`} <span class="sc-sub">(${isEN ? "Balance" : "Bakiye"}: ${akce})</span>
      </button>` : ""}
      <button id="second-chance-decline-btn" class="second-chance-btn ghost">${isEN ? "No, end the game" : "Hayır, oyunu bitir"}</button>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));

  // Butonlar bir kez tıklanınca hepsi kilitlenir — çift tıklama / native reklam
  // çağrısı takılırsa arayüzün tepkisiz kalmış gibi görünmesini engeller.
  let _handled = false;
  const closeOverlay = () => overlay.remove();
  const lockButtons = () => {
    overlay.querySelectorAll("button").forEach(b => b.disabled = true);
  };

  document.getElementById("second-chance-ad-btn").onclick = () => {
    if (adsLeft <= 0 || _handled) return;
    _handled = true;
    lockButtons();
    // Zaman aşımı YOK: reklam ekrandayken hiçbir zamanlayıcı akışı kesmemeli
    // (eski 45 sn'lik hangGuard gerçek reklamlarda ödülü yutuyordu — bkz.
    // rewardedads.js'teki KÖK NEDEN notu). "Reklam hiç açılmadı" güvenliği
    // artık rewardedads.js içinde ve sadece uygulama görünürken çalışıyor.
    let settled = false;
    RewardedAds.show(
      () => { // reklam izlendi → ödül
        if (settled) return;
        settled = true;
        incrementSecondChanceAdsUsedToday();
        _secondChanceUsedThisDeath = true;
        closeOverlay();
        resolveSecondChance();
      },
      () => { // reklam gösterilemedi → teklif ekranına dön
        if (settled) return;
        settled = true;
        closeOverlay();
        showSecondChanceOffer(reason);
      }
    );
  };
  if (AKCE_SYSTEM_ENABLED) {
    document.getElementById("second-chance-akce-btn").onclick = () => {
      if (_handled) return;
      _handled = true;
      lockButtons();
      // spendAkce() bakiye yetersizse false döner — dönüş değeri kontrol edilmeden
      // devam edilirse akçe düşmeden ödül verilmiş olur, bunu asla yapmıyoruz.
      if (!spendAkce(SECOND_CHANCE_AKCE_COST)) {
        // Bakiye yetersiz — satın alma ekranına yönlendir, kapanınca teklife geri dön
        closeOverlay();
        redirectToAkcePurchase(() => showSecondChanceOffer(reason));
        return;
      }
      closeOverlay();
      _secondChanceUsedThisDeath = true;
      resolveSecondChance();
    };
  }
  document.getElementById("second-chance-decline-btn").onclick = () => {
    if (_handled) return;
    _handled = true;
    lockButtons();
    closeOverlay();
    _actuallyTriggerGameOver(reason);
  };
}

function showSecondChanceRescueMoment(callback) {
  const isEN = window.LANG === 'en';
  const text = _pickRandom(isEN ? SECOND_CHANCE_RESCUE_EN : SECOND_CHANCE_RESCUE_TR);

  const overlay = document.createElement("div");
  overlay.id = "second-chance-rescue-overlay";
  overlay.innerHTML = `<div id="second-chance-rescue-text">${text}</div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));

  setTimeout(() => {
    overlay.classList.remove("visible");
    setTimeout(() => { overlay.remove(); callback(); }, 400);
  }, 2200);
}

function resolveSecondChance() {
  _secondChanceUsedThisDeath = false; // sıradaki (farklı) ölüm için tazele
  isGameOver = false; // triggerGameOver bunu true yapmıştı — oyun devam ediyor, geri aç

  // Ölüme hangi gösterge sebep olmuş olursa olsun (4 güç, sağlık ya da sultan
  // sabrı) onu güvenli bir seviyeye çekiyoruz — yoksa "kurtulduk" sanılan oyun
  // bir sonraki kartta aynı sebepten anında tekrar biter.
  Object.keys(stats).forEach(k => {
    if (stats[k] < 60) stats[k] = 60;
    else if (stats[k] >= 100) stats[k] = 60; // taşma tipi ölümler (stat %100) için de kurtar
  });
  updateStatUI();

  // Sağlık: ödül olarak +30 sağlık (0'dan ölündüyse 0 → 30 olur, tekrar hemen ölmez)
  if (sadrazamHealth <= 0) sadrazamHealth = Math.min(100, sadrazamHealth + 30);
  else if (sadrazamHealth < 30) sadrazamHealth = 30;
  updateHealthUI();

  // Sultan sabrı: 0'a inip azledilme ya da 100'e taşıp idam sebebiyse güvenli orta değere çek
  if (sultanSabir <= 0) sultanSabir = 40;
  else if (sultanSabir >= 100) sultanSabir = 60;

  if (window.playSelectConfirm) playSelectConfirm();
  saveGameState();
  showSecondChanceRescueMoment(() => { dealNext(); });
}

// ── Mevsim Sistemi ────────────────────────────────────────────────
const SEASONS_TR = ["Kış", "İlkbahar", "Yaz", "Sonbahar"];
const SEASONS_EN = ["Winter", "Spring", "Summer", "Autumn"];

// Mevsim index'i: her SEASON_CARDS kartta döngüsel artar
function getCurrentSeason() {
  return Math.floor(cardsPlayed / SEASON_CARDS) % 4;
}
function getSeasonLabel() {
  const idx = getCurrentSeason();
  return (window.LANG === 'en' ? SEASONS_EN : SEASONS_TR)[idx];
}

// Mevsim bazlı efekt katsayıları (1.0 = normal)
const SEASON_EFFECTS = {
  0: { military: 0.8, economic: 1.2, religious: 1.0, social: 0.9 },   // Kış
  1: { military: 1.2, economic: 1.0, religious: 1.0, social: 1.1 },   // İlkbahar
  2: { military: 1.1, economic: 1.1, religious: 0.9, social: 1.0 },   // Yaz
  3: { military: 0.9, economic: 1.0, religious: 1.2, social: 1.1 },   // Sonbahar
};

// ── Mevsim atmosferi: gerçekçi parçacıklar (27 Eylül 2026) ─────────────
// Oyun ekranının EN ARKASINDA (#season-fx, z-index:-1 → kart, barlar ve
// metin her zaman üstte) üç derinlik katmanında parçacık: kışın kar, baharda
// lale yaprağı, yazın güneş huzmesinde toz zerresi, sonbaharda yaprak.
// Mevsim değişince eski parçacıklar doğal biçimde ekrandan çıkar, yerlerine
// yenileri gelir. Hareket zamana bağlı (60/120 Hz aynı hız). Oyun ekranı
// kapalıyken, uygulama arka plandayken ya da ayar kapalıyken çizmez.
// Ayar: localStorage sadrazam_season_fx ('off' = kapalı). "Hareketi azalt"
// sistem ayarı açıksa hiç çalışmaz.
const SeasonFx = (() => {
  const COUNT = [60, 46, 60, 46]; // kış, bahar, yaz, sonbahar
  let cv = null, ctx = null, W = 0, H = 0, DPR = 1, parts = [], running = false, last = 0, t = 0, drawnSeason = -1;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const reduce = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const enabled = () => { try { return localStorage.getItem('sadrazam_season_fx') !== 'off'; } catch (e) { return true; } };
  const season = () => (typeof getCurrentSeason === 'function' ? getCurrentSeason() : 0);
  function size() {
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    DPR = Math.min(1.5, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width * DPR)), h = Math.max(1, Math.round(r.height * DPR));
    if (w !== W || h !== H) { W = cv.width = w; H = cv.height = h; }
  }
  function mk(init, s) {
    const layer = Math.random() < .45 ? 0 : (Math.random() < .6 ? 1 : 2); // 0 uzak · 1 orta · 2 yakın
    const k = [0.45, 0.75, 1.15][layer];
    const p = { s, layer, k, al: 1, x: rnd(0, W), y: init ? rnd(0, H) : rnd(-40, -10) * DPR, rot: rnd(0, 6.28), vr: rnd(-.03, .03), ph: rnd(0, 6.28), seed: Math.random() };
    if (s === 0) { p.r = rnd(1.2, 2.6) * k * DPR; p.vy = rnd(.35, .6) * k * DPR; }
    else if (s === 1) { p.r = rnd(3.5, 5) * k * DPR; p.vy = rnd(.4, .7) * k * DPR; p.vr = rnd(-.04, .04); }
    else if (s === 2) { p.r = rnd(.7, 1.6) * k * DPR; p.vy = -rnd(.05, .15) * k * DPR; if (!init) p.y = H + 10; }
    else { p.r = rnd(4, 7) * k * DPR; p.vy = rnd(.55, .9) * k * DPR; p.vr = rnd(-.05, .05); }
    return p;
  }
  function flake(p, a) {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 1.8);
    g.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g.addColorStop(.5, 'rgba(235,240,255,' + a * .55 + ')'); g.addColorStop(1, 'rgba(235,240,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.8, 0, 6.3); ctx.fill();
    if (p.layer === 2 && p.seed > .6) { // yakın katmanda kar kristali
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.strokeStyle = 'rgba(255,255,255,' + a * .8 + ')'; ctx.lineWidth = .6 * DPR;
      for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, p.r * 2.4); ctx.moveTo(0, p.r * 1.4); ctx.lineTo(p.r * .6, p.r * 1.9); ctx.moveTo(0, p.r * 1.4); ctx.lineTo(-p.r * .6, p.r * 1.9); ctx.stroke(); }
      ctx.restore();
    }
  }
  function petal(p, a) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(Math.cos(p.ph) * .9 + .1, 1);
    const g = ctx.createLinearGradient(0, -p.r, 0, p.r); g.addColorStop(0, 'rgba(236,120,140,' + a + ')'); g.addColorStop(1, 'rgba(178,34,64,' + a + ')');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.bezierCurveTo(p.r * .9, -p.r * .6, p.r * .7, p.r * .8, 0, p.r); ctx.bezierCurveTo(-p.r * .7, p.r * .8, -p.r * .9, -p.r * .6, 0, -p.r); ctx.fill(); ctx.restore();
  }
  const LEAF = [[196, 110, 30], [160, 62, 22], [205, 150, 40], [120, 50, 20]];
  function leaf(p, a) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(Math.cos(p.ph) * .85 + .15, 1);
    const c = LEAF[Math.floor(p.seed * 4)], r = p.r;
    ctx.fillStyle = 'rgba(' + c + ',' + a + ')';
    ctx.beginPath(); ctx.moveTo(0, -r);
    ctx.lineTo(r * .35, -r * .45); ctx.lineTo(r * .95, -r * .55); ctx.lineTo(r * .55, -r * .05); ctx.lineTo(r * .8, r * .45); ctx.lineTo(r * .2, r * .3); ctx.lineTo(0, r);
    ctx.lineTo(-r * .2, r * .3); ctx.lineTo(-r * .8, r * .45); ctx.lineTo(-r * .55, -r * .05); ctx.lineTo(-r * .95, -r * .55); ctx.lineTo(-r * .35, -r * .45); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(70,30,10,' + a * .6 + ')'; ctx.lineWidth = .7 * DPR; ctx.beginPath(); ctx.moveTo(0, -r * .8); ctx.lineTo(0, r * 1.25); ctx.stroke(); ctx.restore();
  }
  function mote(p, a) { ctx.fillStyle = 'rgba(255,226,140,' + a * (.4 + .6 * Math.abs(Math.sin(p.ph))) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill(); }
  function visible() {
    return enabled() && !reduce() && !document.hidden && typeof gameScreen !== 'undefined' && gameScreen && !gameScreen.classList.contains('hidden') && !isGameOver;
  }
  function frame(now) {
    if (!running) return;
    if (!visible()) { // görünmüyorsa çizme, seyrek kontrol et
      if (ctx && drawnSeason !== -1) { ctx.clearRect(0, 0, W, H); drawnSeason = -1; }
      last = 0; setTimeout(() => requestAnimationFrame(frame), 400); return;
    }
    size();
    const dt = last ? Math.min(3, (now - last) / 16.667) : 1; last = now; t += dt * 16.667;
    const s = season();
    if (drawnSeason === -1 || parts.length === 0) { parts = []; for (let i = 0; i < COUNT[s]; i++) parts.push(mk(true, s)); }
    else if (drawnSeason !== s) { // mevsim değişti: eskiler ~1 sn'de söner, yenileri her yerde yavaşça belirir
      for (let i = 0; i < COUNT[s]; i++) { const n = mk(true, s); n.al = 0; parts.push(n); }
    }
    drawnSeason = s;
    ctx.clearRect(0, 0, W, H);
    if (s === 2) { // yaz: hafif güneş huzmesi
      const gx = W * .65, g = ctx.createLinearGradient(gx, 0, gx - W * .3, H);
      g.addColorStop(0, 'rgba(255,214,120,.10)'); g.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(gx - W * .05, 0); ctx.lineTo(gx + W * .12, 0); ctx.lineTo(gx - W * .1, H); ctx.lineTo(gx - W * .5, H); ctx.fill();
    }
    const wind = Math.sin(t * .0004) * .6 + Math.sin(t * .0011) * .3;
    const night = gameScreen.classList.contains('night-mode') ? .7 : 1;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.ph += (.03 + p.seed * .02) * dt; p.rot += p.vr * dt;
      p.x += (wind * p.k + Math.sin(p.ph) * .25 * p.k) * DPR * (p.s === 2 ? .3 : 1) * dt; p.y += p.vy * dt;
      if (p.s !== s) p.al -= .018 * dt; else if (p.al < 1) p.al = Math.min(1, p.al + .012 * dt);
      const a = [.35, .6, .9][p.layer] * night * Math.max(0, p.al);
      if (p.s === 0) flake(p, a); else if (p.s === 1) petal(p, a); else if (p.s === 2) mote(p, a); else leaf(p, a);
      if (p.y > H + 30 || p.y < -50 || p.x < -40 || p.x > W + 40) parts[i] = mk(false, s);
    }
    parts = parts.filter(p => p.s === s || p.al > 0);
    while (parts.length < COUNT[s]) parts.push(mk(false, s));
    parts.sort((a, b) => a.layer - b.layer);
    requestAnimationFrame(frame);
  }
  function start() {
    cv = document.getElementById('season-fx');
    if (!cv || running) return;
    ctx = cv.getContext('2d'); if (!ctx) return;
    running = true; requestAnimationFrame(frame);
  }
  return { start, _state: () => ({ running, W, H, n: parts.length, season: drawnSeason, kinds: [...new Set(parts.map(p => p.s))] }) };
})();
setTimeout(() => SeasonFx.start(), 0);

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
  dogu_seferi: ["dogu_1", "dogu_2", "dogu_3"],
  rakip_devrilme: ["rakip_devrilme_1", "rakip_devrilme_2", "rakip_devrilme_3"]
};

// ── Başarımlar ────────────────────────────────────────────────────
// ── BAŞARIMLAR ────────────────────────────────────────────────────
// tier: bronze | silver | gold | platinum | secret
const ACHIEVEMENTS = [
  // ── BRONZ ──
  { id: "first_step",     tier:"bronze", icon:GAME_ICONS.first_step, name:"İlk Adım",             desc:"İlk oyununu tamamla.",                        check: s => s.year >= 1 },
  { id: "three_years",    tier:"bronze", icon:GAME_ICONS.three_years, name:"Üç Yıl Direniş",       desc:"3 yıl hayatta kal.",                          check: s => s.year >= 3 },
  { id: "five_chars",     tier:"bronze", icon:GAME_ICONS.five_chars, name:"Saray Tanıdıkları",     desc:"Tek oyunda 5 farklı karakter gör.",            check: s => (s.seenCharacters||new Set()).size >= 5 },
  { id: "first_letter",   tier:"bronze", icon:GAME_ICONS.first_letter, name:"Sultan'dan Haber",      desc:"Sultan'dan mektup al.",                       check: s => s.receivedLetters > 0 },
  { id: "first_chance",   tier:"bronze", icon:GAME_ICONS.first_chance, name:"Kader Sınavı",          desc:"Bir şans kartını tamamla.",                   check: s => s.chanceCardsPlayed > 0 },
  { id: "first_death",    tier:"bronze", icon:GAME_ICONS.first_death, name:"İlk Son",               desc:"Oyunu bir kez bitir.",                        check: s => true },
  { id: "item_user",      tier:"bronze", icon:GAME_ICONS.item_user, name:"Hazır Hazineci",        desc:"İlk item'ını kullan.",                        check: s => s.itemsUsed > 0 },

  // ── GÜMÜŞ ──
  { id: "five_years",     tier:"silver", icon:GAME_ICONS.five_years, name:"Beş Yıl Sadrazam",     desc:"5 yıl hayatta kal.",                          check: s => s.year >= 5 },
  { id: "balanced",       tier:"silver", icon:GAME_ICONS.balanced, name:"Denge Ustası",          desc:"Oyun bitiminde tüm statlar 40-65 arası.",     check: s => Object.values(s.stats).every(v=>v>=40&&v<=65) },
  { id: "hazine_guard",   tier:"silver", icon:GAME_ICONS.hazine_guard, name:"Hazine Bekçisi",        desc:"5 yıl hazine hiç 30'un altına düşmesin.",     check: s => s.year >= 5 && s.minHazine >= 30 },
  { id: "saray_high",     tier:"silver", icon:GAME_ICONS.saray_high, name:"Sultan'ın Gözdesi",     desc:"Saray 80+'a çıksın.",                        check: s => s.maxSaray >= 80 },
  { id: "chain_complete", tier:"silver", icon:GAME_ICONS.chain_complete, name:"Kararın Yankısı",       desc:"Bir zincirleme karar dizisi tamamla.",        check: s => s.chainsCompleted > 0 },
  { id: "traitor_found",  tier:"silver", icon:GAME_ICONS.traitor_found, name:"Haini Buldun",         desc:"Gizli haini tespit et (2+ soruştur).",       check: s => s.traitorInvestigated >= 2 },
  { id: "war_victory",    tier:"silver", icon:GAME_ICONS.war_victory, name:"Zafer Habercisi",       desc:"Savaşı kabul et ve zaferi gör.",              check: s => s.warVictory },
  { id: "all_letters",    tier:"silver", icon:GAME_ICONS.all_letters, name:"Tüm Mektuplar",         desc:"Tek oyunda 4 sultan mektubunu al.",           check: s => s.receivedLetters >= 4 },

  // ── ALTIN ──
  { id: "ten_years",      tier:"gold",   icon:GAME_ICONS.ten_years, name:"On Yıl Sadrazam",     desc:"10 yıl hayatta kal.",                         check: s => s.year >= 10 },
  { id: "kanuni_ten",     tier:"gold",   icon:GAME_ICONS.kanuni_ten, name:"Kanunî'nin Mirası",    desc:"Kanuni ile 10 yıl hayatta kal.",              check: s => s.sultanId==="kanuni" && s.year>=10 },
  { id: "yavuz_eight",    tier:"gold",   icon:GAME_ICONS.yavuz_eight, name:"Yavuz'a Layık",        desc:"Yavuz ile 8 yıl hayatta kal.",               check: s => s.sultanId==="yavuz" && s.year>=8 },
  { id: "murad_treasure", tier:"gold",   icon:GAME_ICONS.murad_treasure, name:"Murad'ın Serveti",     desc:"III. Murad ile hazineyi 80+'a çıkar.",       check: s => s.sultanId==="murad3" && s.maxHazine>=80 },
  { id: "all_deaths",     tier:"gold",   icon:GAME_ICONS.all_deaths, name:"Her Şeyi Gördüm",      desc:"8 farklı ölüm sebebini yaşa.",               check: s => (s.deathCauses||[]).length >= 8 },
  { id: "curse_master",   tier:"gold",   icon:GAME_ICONS.curse_master, name:"Lanet Ustası",          desc:"Toplamda 3 kez lanet tetikle.",               check: s => s.totalCurses >= 3 },
  { id: "chance_streak",  tier:"gold",   icon:GAME_ICONS.chance_streak, name:"Şans Tanrısı",          desc:"Arka arkaya 3 şans kartı kazan.",             check: s => s.chanceStreak >= 3 },
  { id: "no_curse",       tier:"silver", icon:GAME_ICONS.no_curse, name:"Lanet Yok",            desc:"Bir oyunu lanet tetiklemeden bitir.",         check: s => !s.cursedEver },
  { id: "sabir_imtihani",tier:"platinum",icon:GAME_ICONS.sabir_imtihani, name:"Sabır İmtihanı",       desc:"15 yıl boyunca lanet tetiklemeden hayatta kal.", check: s => !s.cursedEver && s.year>=15 },

  // ── PLATİN ──
  { id: "legend",         tier:"platinum", icon:GAME_ICONS.legend, name:"Efsane Sadrazam",     desc:"20 yıl hayatta kal.",                         check: s => s.year >= 20 },
  { id: "all_chars",      tier:"platinum", icon:GAME_ICONS.all_chars, name:"Osmanlı Ansiklopedisi",desc:"Tek oyunda 26 farklı karakter gör.",          check: s => (s.seenCharacters||new Set()).size >= 26 },
  { id: "no_low_stat",    tier:"platinum", icon:GAME_ICONS.no_low_stat, name:"Sıfır Kriz",          desc:"Hiçbir stat 15'in altına inmeden 10 yıl.",   check: s => s.year>=10 && s.minAnyStat>=15 },
  { id: "pasa_mode",      tier:"platinum", icon:GAME_ICONS.pasa_mode, name:"Paşadan Sultana",     desc:"Paşalık modunda Sadrazam ol ve 5 yıl devam et.", check: s => s.isPasaMode && s.pasaPromoted && s.year>=8 },
  { id: "item_collector", tier:"platinum", icon:GAME_ICONS.item_collector, name:"Koleksiyoncu",        desc:"Tek oyunda 5 farklı item topla.",             check: s => s.uniqueItemsCollected >= 5 },
  { id: "gizli_ustat",   tier:"platinum", icon:GAME_ICONS.gizli_ustat, name:"Gizli Üstat",          desc:"Tek oyunda 3 sır ortaya çıkar: Halkın Sevgisi, Casus Ağı, gizli hain, aynı gün dönen iki karar.", check: s => (s.secretsRevealed||0) >= 3 },

  // ── GİZLİ ──
  { id: "rival_five",     tier:"secret",   icon:GAME_ICONS.rival_five, name:"Rakibin Rakibi",     desc:"Rakip Vezir ile 5 kez yüzleş.",              check: s => (s.characterMemory?.["8-rakip-vezir"]?.left||0)+(s.characterMemory?.["8-rakip-vezir"]?.right||0) >= 5 },
  { id: "zimmet",         tier:"secret",   icon:GAME_ICONS.zimmet, name:"Zimmet Şüphelisi",    desc:"Zimmet suçuyla öl.",                          check: s => s.deathCause === "hazine_100" },
  { id: "valide_loyal",   tier:"secret",   icon:GAME_ICONS.valide_loyal, name:"Valide'nin Gözdesi",  desc:"Tek oyunda Valide Sultan'ın tüm isteklerini kabul et.", check: s => (s.characterMemory?.["5-valide-sultan"]?.left||0)===0 && (s.characterMemory?.["5-valide-sultan"]?.right||0)>=3 },
  { id: "diplomat",       tier:"secret",   icon:GAME_ICONS.diplomat, name:"Zekice Elçi",         desc:"Yabancı Elçi ile 4+ kez müzakere yap.",      check: s => (s.characterMemory?.["7-yabanci-elci"]?.left||0)+(s.characterMemory?.["7-yabanci-elci"]?.right||0) >= 4 },
  { id: "deli_dervis_right", tier:"secret", icon:GAME_ICONS.deli_dervis_right, name:"Kehanet Tuttu",      desc:"Deli Derviş'i 2 kez ziyaret et.",            check: s => (s.characterMemory?.["25-deli_dervis"]?.left||0)+(s.characterMemory?.["25-deli_dervis"]?.right||0) >= 2 },
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

let _donumNextCard = 80; // ~yıl 3 (24×3=72) civarı
let _donumShownThisGame = false; // ilk gösterim (eski tekil bayrak, geriye dönük uyumluluk için tutuluyor)
let _donumShownCount = 0;
const _donumMaxShows = 4;        // oyun başına en fazla 4 dönüm noktası (~yıl 3, 8, 13, 18)
const _donumRepeatGap = 120;     // her tekrar arası ~5 yıl (24×5)

// ── Eyalet Divanı — Dönüm Noktası'na paralel, kaydırılmış bir kaynak tahsis kararı ──
let _eyaletNextCard = 40;
let _eyaletShownCount = 0;
const _eyaletMaxShows = 4;
const _eyaletRepeatGap = 120;

// ── Ramazan içeriği — oyun-içi Hicri takvim Ramazan ayına girince bir kez ──
let _ramazanShownThisGame = false;

// ── Hanedan Hafızası — bir önceki oyunun ölüm hafızası, oyun başına 1 kez ──
let _golgeShownThisGame = false;
let _golgeThreshold = 5; // startGame()'de rastgele belirlenir, kartlar hep aynı sırada gelmesin

// ── Gizli Nitelikler — mevcut sessiz sayaçlara (factionFavors, traitorInvestigated)
//    dayalı, ekranda hiç gösterilmeyen eşiklerle açılan özel kartlar ──
let _halkSevgisiShownThisGame = false;
let _casusAgiShownThisGame = false;

// ── Sultan Mektupları — weight:1 olduğu için normal havuzdan hiç çıkmaz,
//    oyun başına birer kez, kart sayısına göre zamanlanmış olarak gelir.
//    Eşikler startGame()'de rastgele belirlenir (bkz. _mektupNThreshold) —
//    sabit sayı kullanılırsa kartlar her oyunda tam olarak aynı sırada gelir.
let _mektup1Shown = false, _mektup2Shown = false, _mektup3Shown = false, _mektup4Shown = false;
let _mektup1Threshold = 6, _mektup2Threshold = 15, _mektup3Threshold = 9, _mektup4Threshold = 25;
let _mirasThreshold = 15;

// ── Eyalet Divanı Uzun Vadeli Hafıza — ihmal edilen eyalet çok sonra isyan eder ──
let _eyaletIsyanSchedule = []; // { provinceId, afterCardsPlayed }

// ── Eyalet İsyanı sonrası Padişah Ödülü/Öfkesi ──────────────────────
let _sultanFavorSchedule = []; // { afterCardsPlayed, provinceLabel } — nezaketle reddedilince, memnun kalırsa gecikmeli ödül
let _sultanFavorTurns = 0;     // >0 iken 4 ana güçte HİÇBİR negatif etki uygulanmaz (Padişah Ödülü'nde kazanılan tılsım)

// ── Savaş Sonucu — rastgele gecikme (2-10 kart), sonuç askeri güce bağlı ──
let _savasSonucSchedule = null; // { afterCardsPlayed } | null

function rollSavasSonucu() {
  const ordu = stats["yeniçeri"] ?? 50;
  let chance = (ordu - 25) / 60; // ordu 25 -> ~%0, ordu 85 -> ~%100
  if (activeFlags["kaptan_ally_ready"]) chance += 0.15; // Kaptan-ı Derya'nın donanma desteği
  chance = Math.max(0.05, Math.min(0.92, chance)); // her zaman biraz şans/risk payı bırak
  return Math.random() < chance;
}

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

// ── Hanedan Hafızası ────────────────────────────────────────────────
function getGolgeCard() {
  const archive = JSON.parse(localStorage.getItem("sadrazam_deaths") || "[]");
  if (!archive.length) return null;
  const lastYear = archive[0].year || 1;
  const isEN = window.LANG === 'en';
  let textTR, textEN;
  if (lastYear <= 3) {
    textTR = "Selefiniz bu makama oturalı çok olmamıştı. Divan'da hâlâ onun adı anılıyor — bir uyarı gibi.";
    textEN = "Your predecessor had barely settled into this seat. The Divan still whispers his name — like a warning.";
  } else if (lastYear <= 10) {
    textTR = `Selefiniz ${lastYear} yıl bu makamda kaldı. Onun gölgesi hâlâ Divan'ın duvarlarında.`;
    textEN = `Your predecessor held this seat for ${lastYear} years. His shadow still lingers on the Divan's walls.`;
  } else {
    textTR = `Selefiniz ${lastYear} yıl boyunca bu makamı taşıdı — nadir bir başarı. Onun mirasına layık olabilecek misiniz?`;
    textEN = `Your predecessor carried this seat for ${lastYear} years — a rare feat. Can you live up to his legacy?`;
  }
  return {
    id: "golge_selef_" + cardsPlayed,
    type: "easter",
    easter_type: "golge",
    character: "gecmisin-golgesi",
    character_name: isEN ? "The Shadow of the Past" : "Geçmişin Gölgesi",
    text: isEN ? textEN : textTR,
    button: isEN ? "I UNDERSTAND" : "ANLADIM",
    stat_effect: null
  };
}

// ── Gizli Nitelikler ────────────────────────────────────────────────
function getHalkSevgisiCard() {
  const isEN = window.LANG === 'en';
  return {
    id: "gizli_halk_sevgisi_" + cardsPlayed,
    type: "easter",
    easter_type: "gizli_nitelik",
    character: "carsinin-fisiltisi",
    character_name: isEN ? "Whispers of the Bazaar" : "Çarşının Fısıltısı",
    text: isEN
      ? "In the bazaar, they no longer speak your name in fear — they speak it with respect. Word of your fairness has spread beyond the palace walls."
      : "Çarşıda artık adınızı korkuyla değil, saygıyla anıyorlar. Adaletli olduğunuz haberi saray duvarlarını çoktan aştı.",
    button: isEN ? "THE PEOPLE REMEMBER" : "HALK UNUTMAZ",
    stat_effect: null
  };
}
function getCasusAgiCard() {
  const isEN = window.LANG === 'en';
  return {
    id: "gizli_casus_agi_" + cardsPlayed,
    type: "easter",
    easter_type: "gizli_nitelik",
    character: "golgedeki-gozler",
    character_name: isEN ? "Eyes in the Shadows" : "Gölgedeki Gözler",
    text: isEN
      ? "Without you asking, a sealed report appears on your desk each week now. Somewhere along the way, you built a network that sees what you cannot."
      : "Sen istemeden, masana her hafta mühürlü bir rapor bırakılıyor artık. Fark etmeden, senin göremediğini gören bir ağ kurmuşsun.",
    button: isEN ? "TRUST NO ONE, BUT WATCH" : "KİMSEYE GÜVENME, AMA İZLE",
    stat_effect: null
  };
}

// ── Eyalet Divanı Uzun Vadeli Hafıza ─────────────────────────────────
function getEyaletIsyanCard(provinceId) {
  const prov = PROVINCES.find(p => p.id === provinceId);
  if (!prov) return null;
  const isEN = window.LANG === 'en';
  const label = getProvinceLabel(prov);
  return {
    id: "eyalet_isyan_" + provinceId + "_" + cardsPlayed,
    type: "easter",
    easter_type: "eyalet_isyan",
    provinceId,
    character: "uzak-haber",
    character_name: isEN ? "Distant Report" : "Uzak Haber",
    text: isEN
      ? `Years of neglect have taken their toll. ${label} has risen in revolt — a debt from the past, now due.`
      : `Yıllarca süren ihmalin bedeli geldi. ${label} isyan bayrağını kaldırdı — geçmişten kalma bir borç, şimdi ödeniyor.`,
  };
}

// ── Eyalet İsyanı görsel sahnesi: İstanbul'dan hedefe göre ordu/donanma ──
// Harita üzerindeki (viewBox 300x400) konumlar — kara eyaletlerinde ara nokta
// hep karada, deniz eyaletlerinde hep denizde kalacak şekilde elle seçildi.
const EYALET_ISYAN_ISTANBUL = { x: 162, y: 188 };
const EYALET_ISYAN_ROUTES = {
  rumeli:  { wx: 105, wy: 160, x: 60,  y: 172 },
  anadolu: { wx: 171, wy: 204, x: 186, y: 228 },
  dogu:    { wx: 204, wy: 212, x: 246, y: 224 },
  misir:   { wx: 132, wy: 240, x: 120, y: 292 },
  akdeniz: { wx: 132, wy: 212, x: 99,  y: 240 },
};
const EYALET_ISYAN_JANISSARY_SYMBOLS =
  '<symbol id="ei-janissary" viewBox="0 0 20 34">' +
    '<ellipse cx="10" cy="9.5" rx="3.6" ry="2.6" fill="#e8dcc0"/>' +
    '<path d="M6.6 9 Q6 15 9 17.5 Q7.5 18.5 8.5 20 L11.5 20 Q12.5 18.5 11 17.5 Q14 15 13.4 9 Z" fill="#f2ead6"/>' +
    '<rect x="9.3" y="8.6" width="1.4" height="10.5" fill="#C9A227" opacity="0.85"/>' +
    '<circle cx="10" cy="22.5" r="2.1" fill="#caa373"/>' +
    '<path d="M6.5 24.5 Q10 22.5 13.5 24.5 L14.5 33 L5.5 33 Z" fill="#274b6b"/>' +
    '<path d="M8 25 L12 25 L11.6 33 L8.4 33 Z" fill="#1b344a" opacity="0.6"/>' +
    '<rect x="8.9" y="26" width="2.2" height="7" fill="#8a1f1f" opacity="0.85"/>' +
    '<line x1="4" y1="20" x2="16.5" y2="28.5" stroke="#3a2a18" stroke-width="1.3" stroke-linecap="round"/>' +
    '<rect x="3" y="18.7" width="3" height="1.6" rx="0.5" fill="#5c4a2e"/>' +
  '</symbol>' +
  '<symbol id="ei-flagbearer" viewBox="0 0 22 36">' +
    '<ellipse cx="11" cy="9.5" rx="3.6" ry="2.6" fill="#e8dcc0"/>' +
    '<path d="M7.6 9 Q7 15 10 17.5 Q8.5 18.5 9.5 20 L12.5 20 Q13.5 18.5 12 17.5 Q15 15 14.4 9 Z" fill="#f2ead6"/>' +
    '<rect x="10.3" y="8.6" width="1.4" height="10.5" fill="#C9A227" opacity="0.85"/>' +
    '<circle cx="11" cy="22.5" r="2.1" fill="#caa373"/>' +
    '<path d="M7.5 24.5 Q11 22.5 14.5 24.5 L15.5 33 L6.5 33 Z" fill="#8a1f1f"/>' +
    '<rect x="9.9" y="26" width="2.2" height="7" fill="#5c1414" opacity="0.85"/>' +
    '<line x1="12" y1="4" x2="12" y2="26" stroke="#5c4a2e" stroke-width="1.3"/>' +
    '<g class="ei-flag-wave" style="transform-origin:12px 4px">' +
      '<path d="M12 4 L21 6.5 L12 10.5 Z" fill="#8a1f1f" stroke="#C9A227" stroke-width="0.5"/>' +
      '<circle cx="16" cy="7.2" r="1" fill="#f2ead6"/>' +
    '</g>' +
  '</symbol>';
const EYALET_ISYAN_GALLEON_SYMBOL =
  '<symbol id="ei-galleon" viewBox="0 0 130 100">' +
    '<path d="M8 66 Q65 82 122 66 L112 80 Q65 92 18 80 Z" fill="#4a3420"/>' +
    '<path d="M14 66 Q65 78 116 66 L116 58 Q65 68 14 58 Z" fill="#6b4e2e"/>' +
    '<rect x="30" y="50" width="70" height="9" fill="#5c4326"/>' +
    '<rect x="34" y="60" width="6" height="4" fill="#2a1d10"/><rect x="46" y="61" width="6" height="4" fill="#2a1d10"/>' +
    '<rect x="58" y="62" width="6" height="4" fill="#2a1d10"/><rect x="70" y="61" width="6" height="4" fill="#2a1d10"/>' +
    '<rect x="82" y="60" width="6" height="4" fill="#2a1d10"/>' +
    '<path d="M96 52 Q112 50 122 66 Q110 60 96 58 Z" fill="#6b4e2e"/>' +
    '<path d="M8 66 Q4 68 10 72 L18 70 Z" fill="#3a2818"/>' +
    '<line x1="10" y1="66" x2="-6" y2="58" stroke="#5c4326" stroke-width="2.4"/>' +
    '<path d="M-6 58 L8 52 L8 62 Z" fill="#e8dcc0" opacity="0.9"/>' +
    '<line x1="40" y1="50" x2="40" y2="8" stroke="#5c4326" stroke-width="2.2"/>' +
    '<line x1="24" y1="20" x2="56" y2="20" stroke="#4a3420" stroke-width="1.6"/>' +
    '<path d="M25 20.5 L55 20.5 L50 34 L30 34 Z" fill="#efe6c8"/>' +
    '<line x1="29" y1="8" x2="51" y2="8" stroke="#4a3420" stroke-width="1.3"/>' +
    '<path d="M31 8.5 L49 8.5 L46 16 L34 16 Z" fill="#f4ecd6"/>' +
    '<line x1="70" y1="50" x2="70" y2="2" stroke="#5c4326" stroke-width="2.6"/>' +
    '<line x1="50" y1="16" x2="90" y2="16" stroke="#4a3420" stroke-width="1.8"/>' +
    '<path d="M51 16.5 L89 16.5 L83 33 L57 33 Z" fill="#efe6c8"/>' +
    '<line x1="56" y1="2" x2="84" y2="2" stroke="#4a3420" stroke-width="1.4"/>' +
    '<path d="M58 2.5 L82 2.5 L78 11 L62 11 Z" fill="#f4ecd6"/>' +
    '<g class="ei-flag-wave" style="transform-origin:70px 2px">' +
      '<path d="M70 2 L84 5 L70 9 Z" fill="#8a1f1f"/>' +
      '<circle cx="76" cy="5.2" r="1.2" fill="#f2ead6"/>' +
    '</g>' +
    '<line x1="96" y1="50" x2="96" y2="22" stroke="#5c4326" stroke-width="1.8"/>' +
    '<path d="M96 22 L110 28 L96 34 Z" fill="#efe6c8"/>' +
  '</symbol>';

function showEyaletIsyani(c) {
  const isEN = window.LANG === 'en';
  const prov = PROVINCES.find(p => p.id === c.provinceId);
  const isLand = (prov?.route || 'land') === 'land';
  const label = prov ? getProvinceLabel(prov) : '';
  const route = EYALET_ISYAN_ROUTES[c.provinceId] || { wx: 162, wy: 188, x: 162, y: 100 };

  const overlay = document.createElement('div');
  overlay.id = 'eyalet-isyan-overlay';
  overlay.innerHTML = `
    <div id="ei-box">
      <div class="ei-ornament">⚔</div>
      <div class="ei-title">${label.toUpperCase()} ${isEN ? 'REVOLT' : 'İSYANI'}</div>
      <div class="ei-divider"></div>
      <div class="ei-text">${c.text}</div>
      <div id="ei-stage-wrap">
        <div id="ei-stage">
          <img class="ei-mapbg" src="assets/characters/harita-overlay.jpg" alt="">
          <svg class="ei-overlay-svg" viewBox="0 0 300 400" preserveAspectRatio="none" id="ei-overlay-svg"></svg>
        </div>
      </div>
      <div id="ei-result"></div>
      <div id="ei-btns">
        <button id="ei-send-btn" class="ei-btn ei-primary">${isLand ? (isEN?'SEND THE ARMY':'ORDUYU GÖNDER') : (isEN?'SEND THE FLEET':'DONANMAYI GÖNDER')}</button>
        <button id="ei-ignore-btn" class="ei-btn ei-ghost">${isEN ? 'Ignore' : 'Görmezden Gel'}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  card.classList.add('no-swipe');

  const overlaySvg = document.getElementById('ei-overlay-svg');
  const sendBtn = document.getElementById('ei-send-btn');
  const ignoreBtn = document.getElementById('ei-ignore-btn');
  const resultEl = document.getElementById('ei-result');

  overlaySvg.innerHTML =
    '<defs>' + EYALET_ISYAN_JANISSARY_SYMBOLS + EYALET_ISYAN_GALLEON_SYMBOL +
      '<radialGradient id="ei-halo" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#E8C84A" stop-opacity="0.55"/><stop offset="100%" stop-color="#E8C84A" stop-opacity="0"/>' +
      '</radialGradient>' +
    '</defs>' +
    '<circle cx="' + EYALET_ISYAN_ISTANBUL.x + '" cy="' + EYALET_ISYAN_ISTANBUL.y + '" r="5" fill="none" stroke="#E8C84A" stroke-width="1" opacity="0.55"/>' +
    '<circle cx="' + route.x + '" cy="' + route.y + '" r="7" fill="none" stroke="#E8C84A" stroke-width="1.6"/>' +
    '<g class="ei-unit-group ' + (isLand ? 'ei-land' : 'ei-sea') + '" id="ei-unit-group">' +
      '<circle r="' + (isLand ? 17 : 24) + '" fill="url(#ei-halo)"/>' +
      (isLand
        ? '<g transform="scale(0.16) translate(-10,-34)"><use href="#ei-janissary" x="-46" y="8" opacity="0.85" transform="scale(0.82)"/><use href="#ei-janissary" x="-14" y="10" opacity="0.9" transform="scale(0.88)"/><use href="#ei-janissary" x="20" y="9" opacity="0.85" transform="scale(0.82)"/>' +
          '<g class="ei-bob"><use href="#ei-flagbearer" x="-2" y="-6"/></g>' +
          '<use href="#ei-janissary" x="-30" y="-2" transform="scale(0.95)"/><use href="#ei-janissary" x="6" y="-3" transform="scale(0.95)"/>' +
          '<use href="#ei-janissary" x="-46" y="-10" opacity="0.85" transform="scale(0.8)"/><use href="#ei-janissary" x="20" y="-11" opacity="0.85" transform="scale(0.8)"/></g>'
        : '<g transform="scale(0.155) translate(-65,-50)"><g class="ei-bob-boat"><use href="#ei-galleon"/></g></g>') +
    '</g>' +
    '<circle class="ei-burst" cx="' + route.x + '" cy="' + route.y + '" r="20" fill="none" stroke="#E8C84A" stroke-width="3"/>';

  const styleEl = document.getElementById('ei-dyn-style') || (function () {
    const s = document.createElement('style'); s.id = 'ei-dyn-style'; document.head.appendChild(s); return s;
  })();
  styleEl.textContent =
    '@keyframes ei-travel-land { 0%{ transform: translate(' + EYALET_ISYAN_ISTANBUL.x + 'px,' + EYALET_ISYAN_ISTANBUL.y + 'px) scale(0.9);} ' +
    '55%{ transform: translate(' + route.wx + 'px,' + route.wy + 'px) scale(1);} ' +
    '100%{ transform: translate(' + route.x + 'px,' + route.y + 'px) scale(1.05);} }' +
    '@keyframes ei-travel-sea { 0%{ transform: translate(' + EYALET_ISYAN_ISTANBUL.x + 'px,' + EYALET_ISYAN_ISTANBUL.y + 'px) rotate(-2deg);} ' +
    '55%{ transform: translate(' + route.wx + 'px,' + route.wy + 'px) rotate(2deg);} ' +
    '100%{ transform: translate(' + route.x + 'px,' + route.y + 'px) rotate(0deg);} }';

  let resolved = false;

  function closeAndAdvance() {
    overlay.remove();
    card.classList.remove('no-swipe');
    advanceEasterCard(c);
  }

  ignoreBtn.onclick = () => {
    if (resolved) return;
    resolved = true;
    sendBtn.disabled = true; ignoreBtn.disabled = true;
    stats["yeniçeri"] = Math.max(0, (stats["yeniçeri"] || 50) - 5);
    showStatDelta("yeniçeri", -5);
    if (Math.random() < 0.5) {
      stats["hazine"] = Math.max(0, (stats["hazine"] || 50) - 6);
      showStatDelta("hazine", -6);
    }
    updateProvince(c.provinceId, -15); // sadakat düşük kalır, isyan bastırılmadı
    updateStatUI();
    resultEl.classList.add('show');
    resultEl.innerHTML = `<b>${isEN ? 'You looked away.' : 'Görmezden geldiniz.'}</b><br>${isEN ? 'The revolt continues — the army resents your inaction.' : 'İsyan sürüyor — ordu bu hareketsizlikten rahatsız.'}`;
    setTimeout(closeAndAdvance, 1400);
  };

  sendBtn.onclick = () => {
    if (resolved) return;
    resolved = true;
    sendBtn.disabled = true; ignoreBtn.disabled = true;
    const unitEl = document.getElementById('ei-unit-group');
    const burstEl = overlaySvg.querySelector('.ei-burst');
    unitEl.style.animation = (isLand ? 'ei-travel-land 2.6s cubic-bezier(0.45,0,0.55,1) forwards' : 'ei-travel-sea 3s cubic-bezier(0.4,0,0.6,1) forwards');
    unitEl.style.opacity = '1';
    const duration = isLand ? 2600 : 3000;
    setTimeout(() => { burstEl.classList.add('go'); }, duration - 300);
    setTimeout(() => {
      const won = rollSavasSonucu();
      if (won) {
        updateProvince(c.provinceId, 45);
        stats["yeniçeri"] = Math.max(0, (stats["yeniçeri"] || 50) - 6);
        showStatDelta("yeniçeri", -6);
        stats["hazine"] = Math.min(100, (stats["hazine"] || 50) + 8);
        showStatDelta("hazine", 8);
        updateStatUI();
        resultEl.classList.add('show');
        resultEl.innerHTML = `<b>${isEN ? 'The revolt was crushed!' : 'İsyan bastırıldı!'}</b><br>${isEN ? 'Loyalty restored, spoils fill the treasury.' : 'Sadakat geri kazanıldı, ganimet hazineye aktı.'}`;
        setTimeout(() => {
          overlay.remove();
          card.classList.remove('no-swipe');
          showSultanOdulu(c, label);
        }, 1500);
      } else {
        updateProvince(c.provinceId, -20);
        stats["yeniçeri"] = Math.max(0, (stats["yeniçeri"] || 50) - 10);
        showStatDelta("yeniçeri", -10);
        stats["hazine"] = Math.max(0, (stats["hazine"] || 50) - 12);
        showStatDelta("hazine", -12);
        sultanSabir = Math.max(0, sultanSabir - 3);
        updateStatUI();
        resultEl.classList.add('show');
        resultEl.innerHTML = `<b>${isEN ? 'The revolt could not be crushed.' : 'İsyan bastırılamadı.'}</b><br>${isEN ? 'Troops and treasury were lost in vain.' : 'Asker ve hazine boşuna harcandı.'}`;
        setTimeout(closeAndAdvance, 1600);
      }
    }, duration + 400);
  };
}

// ── Padişah Ödülü — isyan bastırılınca çıkan kabul/ret kararı ──────
function showSultanOdulu(c, provinceLabel) {
  const isEN = window.LANG === 'en';
  const overlay = document.createElement('div');
  overlay.id = 'sultan-odulu-overlay';
  overlay.innerHTML = `
    <div id="so-box">
      <div class="so-ornament">☾</div>
      <div class="so-title">${isEN ? 'THE SULTAN\'S GRATITUDE' : 'PADİŞAHIN LÜTFU'}</div>
      <div class="so-divider"></div>
      <div class="so-text">${isEN
        ? `The Sultan has heard of your victory in ${provinceLabel} and wishes to reward you.`
        : `Padişah, ${provinceLabel}'deki zaferinizi duydu ve sizi ödüllendirmek istiyor.`}</div>
      <div id="so-result"></div>
      <div id="so-btns">
        <button id="so-accept-btn" class="ei-btn ei-primary">${isEN ? 'ACCEPT' : 'KABUL ET'}</button>
        <button id="so-decline-btn" class="ei-btn ei-ghost">${isEN ? 'Politely decline' : 'Nezaketle Reddet'}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  card.classList.add('no-swipe');

  const resultEl = document.getElementById('so-result');
  const acceptBtn = document.getElementById('so-accept-btn');
  const declineBtn = document.getElementById('so-decline-btn');
  let resolved = false;

  function finish(html, delay) {
    resultEl.classList.add('show');
    resultEl.innerHTML = html;
    setTimeout(() => {
      overlay.remove();
      card.classList.remove('no-swipe');
      advanceEasterCard(c);
    }, delay);
  }

  acceptBtn.onclick = () => {
    if (resolved) return;
    resolved = true;
    acceptBtn.disabled = true; declineBtn.disabled = true;
    if (Math.random() < 0.5) {
      const notHeld = Object.keys(ITEMS).filter(id => !playerItems.includes(id));
      const pick = notHeld.length ? notHeld[Math.floor(Math.random() * notHeld.length)] : Object.keys(ITEMS)[Math.floor(Math.random()*Object.keys(ITEMS).length)];
      gainItem(pick);
      finish(`<b>${isEN ? 'A gift arrives.' : 'Bir hediye geldi.'}</b><br>${isEN ? 'The Sultan grants you a rare item.' : 'Padişah size nadir bir eşya bahşetti.'}`, 1600);
    } else {
      _sultanFavorTurns = 3;
      finish(`<b>${isEN ? 'Imperial protection granted.' : 'Padişahın koruması üzerinizde.'}</b><br>${isEN ? 'For the next 3 decisions, none of your powers can fall.' : 'Önümüzdeki 3 karar boyunca hiçbir gücünüz düşmeyecek.'}`, 1800);
    }
  };

  declineBtn.onclick = () => {
    if (resolved) return;
    resolved = true;
    acceptBtn.disabled = true; declineBtn.disabled = true;
    if (Math.random() < 0.55) {
      _sultanFavorSchedule.push({ afterCardsPlayed: cardsPlayed + 10, provinceLabel });
      finish(`<b>${isEN ? 'A quiet nod.' : 'Sessiz bir baş işareti.'}</b><br>${isEN ? 'The Sultan seems to respect your humility. Perhaps this will be remembered.' : 'Padişah alçakgönüllülüğünüze saygı duymuş gibi. Belki bu unutulmaz.'}`, 1700);
    } else {
      const keys = ["saray", "yeniçeri", "ulema", "hazine"];
      const stat = keys[Math.floor(Math.random() * keys.length)];
      const before = stats[stat] ?? 50;
      stats[stat] = Math.max(5, Math.round(before * 0.8));
      showStatDelta(stat, stats[stat] - before);
      updateStatUI();
      const statLabelMap = { saray: isEN?'Palace':'Saray', "yeniçeri": isEN?'Army':'Yeniçeri', ulema: isEN?'Ulema':'Ulema', hazine: isEN?'Treasury':'Hazine' };
      finish(`<b>${isEN ? 'The Sultan is displeased.' : 'Padişah gücenmiş görünüyor.'}</b><br>${isEN
        ? `He saw your refusal as an insult — since ${provinceLabel}, ${statLabelMap[stat]} strength has suffered.`
        : `Reddinizi bir hakaret olarak gördü — ${provinceLabel} meselesinden beri ${statLabelMap[stat]} gücünüz bu yüzden zayıfladı.`}`, 1900);
    }
  };
}

// ── Padişah'ın gecikmeli ödülü — nezaketle reddedilip memnun kalınınca ──
function getSultanFavorCard(provinceLabel) {
  const isEN = window.LANG === 'en';
  return {
    id: "sultan_favor_" + cardsPlayed,
    type: "easter",
    easter_type: "sultan_favor",
    character: "uzak-haber",
    character_name: isEN ? "Distant Report" : "Uzak Haber",
    text: isEN
      ? `The Sultan has not forgotten the humility you showed after ${provinceLabel}. A gesture of favor arrives.`
      : `Padişah, ${provinceLabel} meselesinden sonra gösterdiğiniz alçakgönüllülüğü unutmamış. Bir lütuf ulaştı.`,
    button: isEN ? "Very well" : "Pekâlâ",
    stat_effect: () => {
      ["saray", "yeniçeri", "ulema", "hazine"].forEach(k => {
        stats[k] = Math.min(100, (stats[k] || 50) + 12);
        showStatDelta(k, 12);
      });
      updateStatUI();
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
  // Mevcut 5
  "Doğu'dan korkunç haberler geldi — veba, kıtlık ve isyan, hepsi aynı anda.",
  "Saray yangını, hazine kayıpları, yeniçeri huzursuzluğu. Tanrı bu devleti sınamaktadır.",
  "Deprem Konstantiniyye'yi sarstı. Her şey bir anda değişti.",
  "Düşman saldırısı, salgın ve sel felaketi birlikte geldi. Divan dağıldı.",
  "Hazine yağmalandı, surlar çatladı, ulema kriz ilan etti. Kaçış yok.",
  // Yeni 7
  "Büyük İstanbul depremi. Yüzlerce yapı yıkıldı, halk sokaklara döküldü. Her şey bir anda değişti.",
  "Çarşı yangını gecenin karanlığında başladı, sabaha dek durdurulamadı. Yüzlerce esnaf mahvoldu.",
  "Nil'den gelen kuraklık haberleri Mısır'ı yutacak. Hazine akışı tehlikede.",
  "Doğu sınırından büyük göç dalgası geliyor. Şehirler dolup taşıyor, halk ayakta.",
  "Osmanlı filosunun yarısı fırtınada kayboldu. Akdeniz kontrolü sarsıldı.",
  "Sarayda suikast girişimi önlendi — ama fail belli değil. Herkes herkesten şüpheleniyor.",
  "Veba ve kıtlık aynı anda iki vilayeti vurdu. Kaçacak hiçbir şey kalmadı."
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
let sadrazamHealth = 90;  // Sağlık barı (0-100)

// ── Zincirleme Karar Sistemi (Chain Events) ───────────────────────
const CHAIN_RULES = [
  // Bir karar bir bayrak açınca, sonucu belirli kart sayısı sonra GARANTİLİ gelir.
  // Bayrak adları data/cards.json'daki *_flags_set ile BİREBİR aynı olmalı
  // (26 Eylül 2026'ya kadar hiçbiri eşleşmiyordu → bu zincirler hiç çalışmıyordu).
  // Kışla talebi reddedildi → yeniçeri son uyarısı
  { flag: 'kışla_reddedildi',         delay: 18, cardId: 'kışla_sonuç',          once: true  },
  // Venedik'le ticaret sınırlı tutuldu → Venedik gücenmiş olarak geri döner
  { flag: 'venedik_1_sinirlendi',     delay: 24, cardId: 'venedik_geri_dondu',   once: true  },
  // Maaş ödemesi ertelendi → ocakta kazan kaldırma konuşuluyor
  { flag: 'maaş_gecikti',             delay: 12, cardId: 'maaş_isyan_tehlikesi', once: true  },
  // Veba haberi hafife alındı → salgın şehri sarar
  // (Ulema ittifakı hazırsa kriz_veba engellenir → onun yerine ittifak versiyonu gelir)
  { flag: 'veba_gormezden_gelindi',   delay: 12, cardId: 'kriz_veba',            once: true, altCardId: 'kriz_veba_ally' },
  // Şehzade tasfiye fermanı uygulandı → şehzade teslimatta kaçtı
  { flag: 'şehzade_tasfiye',          delay: 12, cardId: 'sehzade_avcisi_2',     once: true  },
  // (Casus operasyonu ve savaş zaferi zaten kartların triggers_on_* alanıyla
  //  zamanlanıyor — buradaki eski ölü kopyaları kaldırıldı.)
  // Köylü zorla geri gönderildi / ağa zulmüne göz yumuldu → Celali Reisi dağa çıkar
  { flag: 'celali_kivilcimi',         delay: 12, cardId: 'celali_1',             once: true  },
  // Ceneviz borcu ertelendi → Galata Podestası depoların anahtarını ister
  { flag: 'ceneviz_borc_ertelendi',   delay: 10, cardId: 'podesta_1',            once: true  },
  // Hint ilacı fetvada savunuldu → ilacı getiren tabip saraya gelir
  { flag: 'hint_tabibi_davet',        delay: 6,  cardId: 'hint_tabibi_gelis',    once: true  },
];

// Birden çok karara bağlı sonuçlar: "all" bayraklarının hepsi ve "any"
// bayraklarından en az biri açıkken, bunlardan biri yeni açıldığında bir kez
// zamanlanır (sıra fark etmez: önce göç, sonra su ya da tersi).
const CHAIN_RULES_MULTI = [
  // Göç kabul edildi + su işi bırakıldı → Büyük İstanbul Yangını
  // (vakti gelmeden su yolu yaptırılırsa kartın excluded_flags'i onu önler)
  { all: ['göç_dalgası'], any: ['kanal_yapılmadı', 'su_sorunu_birakildi'], delay: 14, cardId: 'buyuk_istanbul_yangini' },
];

function checkChainTriggers(flagsSet) {
  for (const rule of CHAIN_RULES) {
    if (!flagsSet.includes(rule.flag)) continue;
    // once: aynı zincir bir oyunda bir kez. activeFlags kayıtla birlikte
    // saklandığı için uygulama yeniden açılsa da geçerli kalır.
    const onceKey = "_chain_fired_" + rule.cardId;
    if (rule.once && activeFlags[onceKey]) continue;
    const alreadyScheduled = scheduledCards.some(sc => sc.cardId === rule.cardId);
    if (alreadyScheduled) continue;
    if (rule.once) activeFlags[onceKey] = true;
    scheduleConsequence(rule.cardId, rule.delay, rule.altCardId);
  }
  for (const rule of CHAIN_RULES_MULTI) {
    if (!flagsSet.some(f => rule.all.includes(f) || rule.any.includes(f))) continue;
    if (!rule.all.every(f => activeFlags[f]) || !rule.any.some(f => activeFlags[f])) continue;
    const onceKey = "_chain_fired_" + rule.cardId;
    if (activeFlags[onceKey] || scheduledCards.some(sc => sc.cardId === rule.cardId)) continue;
    activeFlags[onceKey] = true;
    scheduleConsequence(rule.cardId, rule.delay);
  }
}

// Gecikmeli bir sonucu kuyruğa ekler. playsAtSchedule: kart bu arada normal
// desteden zaten çekilirse, vakti gelince İKİNCİ kez gösterilmesin diye.
// altCardId: asıl kart vakti geldiğinde excluded_flags yüzünden geçersizse
// onun yerine gösterilecek, aynı olayın başka bir versiyonu.
function scheduleConsequence(cardId, delay, altCardId) {
  const sc = {
    cardId,
    afterCardsPlayed: cardsPlayed + delay,
    playsAtSchedule: playCounts[cardId] || 0,
    at: cardsPlayed, // kararın verildiği an (sonuç kartındaki mühür şeridi: "N kart önce")
  };
  if (altCardId) sc.altCardId = altCardId;
  // Hangi karardan doğdu (ölüm/İkinci Şans ekranındaki "yarım kalan" listesi için)
  if (_lastDecision && _lastDecision.tr) sc.src = { tr: _lastDecision.tr, en: _lastDecision.en || _lastDecision.tr };
  scheduledCards.push(sc);
}

// En son verilen karar: decide() ve iki seçenekli özel kartlar doldurur
let _lastDecision = null;
function _setLastDecision(card, dir) {
  if (!card || !dir) { _lastDecision = null; return; }
  const tr = card[dir + "_text"], en = card[dir + "_text_en"];
  _lastDecision = tr ? { tr, en: en || tr } : null;
}

// ── Yarım kalan sonuçlar (İkinci Şans + ölüm ekranı) ──────────────────
function _pendingConsequencesHTML(maxItems) {
  const en = window.LANG === 'en';
  const items = scheduledCards.filter(sc => sc.src && sc.src.tr).sort((a, b) => a.afterCardsPlayed - b.afterCardsPlayed);
  if (!items.length) return "";
  const esc = (t) => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const lines = items.slice(0, maxItems).map(sc => {
    const n = Math.max(1, sc.afterCardsPlayed - cardsPlayed);
    const src = esc(en ? sc.src.en : sc.src.tr);
    return `<li><span class="pc-q">“${src}”</span> ${en ? `— its result was ${n} ${n === 1 ? "card" : "cards"} away.` : `kararınızın sonucu ${n} kart sonra gelecekti.`}</li>`;
  }).join("");
  // Bekleyenlerden ikisi birleşmek üzereyse
  let knotLine = "";
  const ids = scheduledCards.map(x => x.cardId);
  outer: for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    if (_findKnotCard(ids[i], ids[j])) { knotLine = `<li class="pc-knot">${en ? "Two of your decisions were about to meet." : "İki kararınız birleşmek üzereydi."}</li>`; break outer; }
  }
  const more = items.length > maxItems ? `<li class="pc-more">${en ? `and ${items.length - maxItems} more…` : `ve ${items.length - maxItems} karar daha…`}</li>` : "";
  return `<div class="pending-cons"><div class="pc-title">${en ? "UNFINISHED" : "YARIM KALACAK"}</div><ul>${lines}${more}${knotLine}</ul></div>`;
}

// Zamanı gelen bir sonucun gerçekten gösterilecek kartını döndürür (ya da null)
function _resolveDueConsequence(sc) {
  const c = allCards.find(x => x.id === sc.cardId);
  if (!c) return null;
  // Bu arada normal desteden zaten oynandıysa tekrar gösterme
  if (sc.playsAtSchedule !== undefined && (playCounts[c.id] || 0) > sc.playsAtSchedule) return null;
  const blocked = (card) => (card.excluded_flags || []).some(f => activeFlags[f]);
  if (!blocked(c)) return c;
  if (sc.altCardId) {
    const alt = allCards.find(x => x.id === sc.altCardId);
    if (alt && !blocked(alt) && (alt.required_flags || []).every(f => activeFlags[f])) return alt;
  }
  return null; // "zaten çözüldü" bayrağı açılmış → gösterme
}

// ── Eyalet (Province) Sistemi ─────────────────────────────────────
const PROVINCES = [
  { id: 'rumeli',   label_tr: 'Rumeli',       label_en: 'Rumelia',       categories: ['military','political'],  stat: 'yeniçeri', route: 'land' },
  { id: 'anadolu',  label_tr: 'Anadolu',       label_en: 'Anatolia',      categories: ['social','economic'],     stat: 'ulema',    route: 'land' },
  { id: 'misir',    label_tr: 'Mısır',         label_en: 'Egypt',         categories: ['economic','treasury'],   stat: 'hazine',   route: 'sea'  },
  { id: 'dogu',     label_tr: 'Doğu Sınırı',   label_en: 'Eastern Border',categories: ['military','diplomatic'], stat: 'yeniçeri', route: 'land' },
  { id: 'akdeniz',  label_tr: 'Akdeniz',       label_en: 'Mediterranean', categories: ['diplomatic','intrigue'], stat: 'saray',    route: 'sea'  },
];
let provinceLoyalty = { rumeli:50, anadolu:50, misir:50, dogu:50, akdeniz:50 };

function getProvinceLabel(p) {
  return window.LANG === 'en' ? p.label_en : p.label_tr;
}
function updateProvince(id, delta) {
  provinceLoyalty[id] = Math.max(0, Math.min(100, (provinceLoyalty[id] || 50) + delta));
  // Düşen eyalet komşusunu etkiler (domino)
  if (provinceLoyalty[id] < 25) {
    const domino = { rumeli:'anadolu', anadolu:'dogu', misir:'akdeniz', dogu:'anadolu', akdeniz:'misir' };
    const neighbor = domino[id];
    if (neighbor) provinceLoyalty[neighbor] = Math.max(0, (provinceLoyalty[neighbor]||50) - 3);
  }
  // 0'a düşerse kriz
  if (provinceLoyalty[id] <= 0) triggerProvinceKriz(id);
}
function triggerProvinceKriz(id) {
  const p = PROVINCES.find(x => x.id === id);
  if (!p) return;
  const isEN = window.LANG === 'en';
  const label = getProvinceLabel(p);
  forcedQueue.push({
    id: 'province_kriz_' + id + '_' + cardsPlayed,
    type: 'easter',
    easter_type: 'felaket',
    character: 'kader-felaket',
    character_name: isEN ? 'Fate' : 'Kader',
    text: isEN
      ? `${label} has fallen into complete disorder. The empire's control there is shattered.`
      : `${label} tam bir kargaşaya sürüklendi. İmparatorluğun oradaki hâkimiyeti çöktü.`,
    button: isEN ? 'So be it' : 'Pekâlâ',
    stat_effect: () => {
      stats[p.stat] = Math.max(5, (stats[p.stat]||50) - 18);
      updateStatUI();
      provinceLoyalty[id] = 20; // sıfırdan kurtarma
    }
  });
}
function applyProvinceEffect(card, dir) {
  // Kart kategorisine göre ilgili eyaleti etkile
  const cat = card.category || '';
  PROVINCES.forEach(p => {
    if (p.categories.includes(cat)) {
      const effects = dir === 'right' ? card.right_effects : card.left_effects;
      const delta = effects && effects[p.stat] ? Math.round(effects[p.stat] * 0.3) : 0;
      if (delta !== 0) updateProvince(p.id, delta);
    }
  });
  // Güçlü eyalet (70+) zayıfa destek verir
  PROVINCES.forEach(p => {
    if ((provinceLoyalty[p.id]||50) >= 70) {
      const weak = PROVINCES.find(q => q.id !== p.id && (provinceLoyalty[q.id]||50) < 35);
      if (weak) provinceLoyalty[weak.id] = Math.min(100, (provinceLoyalty[weak.id]||50) + 1);
    }
  });
}

// ── Şehzade Sistemi ───────────────────────────────────────────────
let sehzadePower       = 0;
let _sehzadeChecked    = false;
const SEHZADE_MIN_CARDS = 30;

// ── Challenge Modu ────────────────────────────────────────────────
let isChallengeMode  = false;
let challengeGoals   = [];   // [{id, label_tr, label_en, check, done}]
let challengeComplete = false;

// Hedef türleri (27 Eylül 2026 yeniden yazıldı — eski hâli yarımdı):
//  reach: koşul bir kez sağlanınca tamamlanır.
//  keep : 5. yıla kadar hiç ihlal edilmezse tamamlanır; ihlal edilirse kalıcı başarısız.
// Kontroller doğrudan oyun durumundan okur (buildAchievementState'e bağlı değil —
// orada activeFlags yoktu, bayraklı hedefler hep "tamam" görünüyordu).
const CHALLENGE_KEEP_UNTIL_YEAR = 5;
const CHALLENGE_REWARD_AKCE = 2;
let _hekimYesCount = 0;           // Hekimbaşı dinlenme önerisini kabul sayısı (oyun başına)
let _knotIdsSeenThisGame = new Set();
let _challengeRewarded = false;
const _cm = (key) => characterMemory[key] || {};
const CHALLENGE_POOL = [
  { id:'yeni_ret_4', kind:'reach', label_tr:"Yeniçeri Ağası'nı 4 kez reddet", label_en:"Refuse the Janissary Commander 4 times", check: () => (_cm('2-yeniceri').left || 0) >= 4 },
  { id:'seyh_des_3', kind:'reach', label_tr:"Şeyhülislam'ı 3 kez destekle", label_en:"Support the Şeyhülislam 3 times", check: () => (_cm('3-seyhulislam').right || 0) >= 3 },
  { id:'rakip_4',    kind:'reach', label_tr:"Rakip Vezir ile 4 kez yüzleş", label_en:"Confront the Rival Vizier 4 times", check: () => ((_cm('8-rakip-vezir').left || 0) + (_cm('8-rakip-vezir').right || 0)) >= 4 },
  { id:'yil_6',      kind:'reach', label_tr:"6 yıl hayatta kal", label_en:"Survive for 6 years", check: () => year >= 6 },
  { id:'valide_3',   kind:'reach', label_tr:"Valide Sultan'ın 3 isteğini kabul et", label_en:"Grant 3 of the Valide Sultan's requests", check: () => (_cm('5-valide-sultan').right || 0) >= 3 },
  { id:'hekim_2',    kind:'reach', label_tr:"Hekimbaşı'nın dinlenme önerisini 2 kez kabul et", label_en:"Accept the Physician's advice to rest twice", check: () => _hekimYesCount >= 2 },
  { id:'saray_80',   kind:'reach', label_tr:"Saray'ı 80'e çıkar", label_en:"Raise the Palace to 80", check: () => maxSaray >= 80 },
  { id:'elci_4',     kind:'reach', label_tr:"Yabancı Elçi ile 4 kez müzakere et", label_en:"Negotiate with the Foreign Ambassador 4 times", check: () => ((_cm('7-yabanci-elci').left || 0) + (_cm('7-yabanci-elci').right || 0)) >= 4 },
  { id:'dugum_1',    kind:'reach', label_tr:"İki kararının aynı gün geri döndüğünü gör", label_en:"See two of your decisions return on the same day", check: () => _knotIdsSeenThisGame.size >= 1 },
  { id:'hain',       kind:'reach', label_tr:"Gizli hainin izini iki kez sür", label_en:"Investigate the hidden traitor twice", check: () => traitorInvestigated >= 2 },
  { id:'haz_min_30', kind:'keep',  label_tr:"Hazine 30'un altına düşmesin", label_en:"Keep the Treasury above 30", check: () => minHazine >= 30 },
  { id:'no_borc',    kind:'keep',  label_tr:"Hiç borç alma", label_en:"Never take a loan", check: () => !activeFlags['defterdar_borc_alındı'] },
  { id:'no_savas',   kind:'keep',  label_tr:"Hiç savaş ilan etme", label_en:"Never declare war", check: () => !activeFlags['savaş_başladı'] },
];

function pickChallengeGoals() {
  // En fazla bir "koru" hedefi — üçü birden koruma olursa oyun pasifleşir
  const keeps = CHALLENGE_POOL.filter(g => g.kind === 'keep'), reaches = CHALLENGE_POOL.filter(g => g.kind === 'reach');
  const pick = (arr) => arr.splice(Math.floor(Math.random() * arr.length), 1)[0];
  const r = [...reaches], k = [...keeps];
  const picked = [pick(r), pick(r), Math.random() < 0.5 ? pick(k) : pick(r)];
  return picked.map(g => ({ ...g, done: false, failed: false }));
}

function startChallengeMod() {
  isChallengeMode = true;
  challengeGoals  = pickChallengeGoals();
  challengeComplete = false;
  isPasaMode = false;
  // btn-start.click() YAPMA — o listener isChallengeMode=false yapar
  if (window.playSelectConfirm) playSelectConfirm();
  introScreen.style.display = "none";
  showSultanScreen();
}

function updateChallengeUI() {
  if (!isChallengeMode || !challengeGoals.length) return;
  const isEN = window.LANG === 'en';
  challengeGoals.forEach(g => {
    if (g.done || g.failed) return;
    let ok = false; try { ok = !!g.check(); } catch (e) { ok = false; }
    if (g.kind === 'keep') { if (!ok) g.failed = true; else if (year >= CHALLENGE_KEEP_UNTIL_YEAR) g.done = true; }
    else if (ok) g.done = true;
  });
  if (challengeGoals.every(g => g.done) && !challengeComplete) {
    challengeComplete = true;
    if (!_challengeRewarded) { _challengeRewarded = true; addAkce(CHALLENGE_REWARD_AKCE); }
    showItemToast(isEN ? `All 3 challenge goals completed! +${CHALLENGE_REWARD_AKCE} akce` : `3 hedefin tamamı tamamlandı! +${CHALLENGE_REWARD_AKCE} akçe`);
  }
  updateFateBar();
}

// Üst satırda küçük rozet (oyun alanının yüksekliğini değiştirmez); dokununca liste
function _renderChallengeChip(fb) {
  if (!isChallengeMode || !challengeGoals.length || !fb) return;
  const done = challengeGoals.filter(g => g.done).length;
  const chip = document.createElement("div");
  chip.id = "challenge-chip";
  chip.className = "challenge-chip" + (done === challengeGoals.length ? " complete" : "");
  chip.innerHTML = `${GAME_ICONS.action_force}<span>${done}/${challengeGoals.length}</span>`;
  chip.onclick = (e) => { e.stopPropagation(); _toggleChallengeList(chip); };
  fb.appendChild(chip);
}
function _toggleChallengeList(anchor) {
  const old = document.getElementById("challenge-list");
  if (old) { old.remove(); return; }
  const isEN = window.LANG === 'en';
  const el = document.createElement("div");
  el.id = "challenge-list";
  el.innerHTML = `<div class="cl-title">${isEN ? "CHALLENGE" : "MEYDAN OKUMA"}</div>` + challengeGoals.map(g => {
    const st = g.done ? "done" : g.failed ? "failed" : "open";
    const mark = g.done ? "✓" : g.failed ? "✕" : "○";
    const note = g.kind === 'keep' && !g.done && !g.failed ? `<span class="cl-note">${isEN ? `until year ${CHALLENGE_KEEP_UNTIL_YEAR}` : `${CHALLENGE_KEEP_UNTIL_YEAR}. yıla kadar`}</span>` : "";
    return `<div class="cl-item ${st}"><span class="cl-mark">${mark}</span><span>${isEN ? g.label_en : g.label_tr}${note}</span></div>`;
  }).join("") + `<div class="cl-reward">${isEN ? `Complete all three: +${CHALLENGE_REWARD_AKCE} akce` : `Üçünü de tamamla: +${CHALLENGE_REWARD_AKCE} akçe`}</div>`;
  document.body.appendChild(el);
  const r = anchor.getBoundingClientRect();
  el.style.top = Math.round(r.bottom + 6) + "px";
  const close = (ev) => { if (!el.contains(ev.target)) { el.remove(); document.removeEventListener("click", close, true); } };
  setTimeout(() => document.addEventListener("click", close, true), 0);
}

function buildChallengePanel() {
  // Eski panel (oyun alanına satır ekliyordu, küçük ekranda taşma yapardı) yerine rozet
  document.getElementById('challenge-panel')?.remove();
  updateFateBar();
}
let activeFlags = {};
let isGameOver = false;
let playCounts = {};
let forcedQueue = [];
let scheduledCards = [];
let characterMemory = {};
let activeArcs = {};
let triggeredArcs = {};
let decisionLog = [];           // Vezirlik Günlüğü — kayda değer kararların kronolojik listesi
let chronicle = [];             // Vakayiname — ölüm ekranındaki tarih sayfası için önemli olaylar (kayıtla saklanır)
let isPaywalled = false;        // ücretsiz deneme sınırına takılınca true olur, oyun durur
let _paywallSoftOffer = false;  // ARTIK KULLANILMIYOR (geriye dönük uyumluluk için tutuluyor) — eskiden
                                 // her 3 yeniden başlatmada çıkan, "Oynamaya Devam Et" ile reddedilebilen
                                 // teklif paywall'ıydı; bu tam bir satın alma zorunluluğu bypass'ıydı.
let _paywallAtGameStart = false; // 3 yeniden başlatmada bir çıkan, KESİN/reddedilemez paywall — reddedilirse
                                 // year-limit ile aynı kalıcı "sadrazam_paywall_declined" flag'i set edilir.
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
// "Sırf eğlence" easter egg'lerin (kedi/yanlış adam/kehanet/evliya/tarihsel figürler/
// zaman yolcusu/fısıltı/pargalı) HİÇBİRİ, bir öncekinden 40 karttan daha yakın gelemez —
// her tip kendi aralığına uysa bile aynı anda üst üste binebiliyorlardı, oyuncuya "çok
// sık" hissettiriyordu. Bu paylaşılan bacak tüm 8 tipi tek noktadan sınırlıyor.
let _lastEasterEggAt = -999;
// Padişah'ın kendi karar havuzundaki ("1-sultan") kartları da aynı sebeple art arda
// gelebiliyordu (koşulu sadece yıl+denge dengesizliğiydi, araya minimum kart konmuyordu).
let _lastSultanCardAt = -999;
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
// Ölüm sebebi anahtarı (başarımlar için): "<stat>_0|100", "saglik", "azil", "sultan_guc",
// "padisah_red", "sehzade", "yanlis_oda", "free_limit". Metin rastgele olduğu için metinden sayılmaz.
let _deathCause = null;
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

// ── Ses Ayarları ──────────────────────────────────────────────────
window.musicEnabled = localStorage.getItem('sadrazam_music') !== 'off';
window.sfxEnabled   = localStorage.getItem('sadrazam_sfx')   !== 'off';

// ── Deneyimli Mod (opsiyonel etki önizlemesi) — varsayılan KAPALI ──
window.previewMode = localStorage.getItem('sadrazam_preview_mode') === 'on';

// ── Zorluk Kademeleri — varsayılan "normal" mevcut dengeyi bire bir korur ──
let difficultyId = localStorage.getItem('sadrazam_difficulty') || 'normal';
const DIFFICULTY_MODS = {
  kolay:    { drain: 0.7, healthDecay: 0.7 },
  normal:   { drain: 1,   healthDecay: 1   },
  zor:      { drain: 1.4, healthDecay: 1.3 },
  zor_asc1: { drain: 1.6, healthDecay: 1.45 }, // Ascension: "Kadim Vezir +1" — yıl 20+ hayatta kalınca açılır
};
function isDifficultyPremiumLocked(id) {
  // "normal" (Sadrazam) her zaman ücretsiz — sadece alternatif zorluklar Tam Sürüm gerektirir
  return id !== 'normal' && FREEMIUM_ENABLED && !isFullVersionUnlocked();
}
function getDifficultyMod() {
  // Savunma: localStorage'da eski/geçersiz bir zorluk kalmış olsa bile (Tam Sürüm kaybedilmiş vb.)
  // gerçek oyun mekaniği asla kilitli bir zorlukla çalışmaz — tek doğruluk noktası burası.
  if (isDifficultyPremiumLocked(difficultyId)) return DIFFICULTY_MODS.normal;
  return DIFFICULTY_MODS[difficultyId] || DIFFICULTY_MODS.normal;
}
function selectDifficulty(id) {
  if (!DIFFICULTY_MODS[id]) return;
  if (id === 'zor_asc1' && !isAscensionUnlocked()) return;
  if (isDifficultyPremiumLocked(id)) {
    showPaywallScreen(true);
    return;
  }
  difficultyId = id;
  localStorage.setItem('sadrazam_difficulty', id);
  document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.toggle('active', b.dataset.diff === id));
  if (window.playSelectConfirm) playSelectConfirm();
}
function isAscensionUnlocked() {
  return localStorage.getItem('sadrazam_ascension_unlocked') === '1';
}
function updateDifficultyLockUI() {
  document.querySelectorAll('.difficulty-btn').forEach(b => {
    const id = b.dataset.diff;
    if (id === 'normal') return;
    b.classList.toggle('locked', isDifficultyPremiumLocked(id));
  });
  // Kilitliyken oyun mekaniği zaten normal'e döner (getDifficultyMod savunması) —
  // görünen seçim de tutarlı olsun diye kilitli bir zorluk aktif görünmesin.
  if (isDifficultyPremiumLocked(difficultyId)) {
    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.toggle('active', b.dataset.diff === 'normal'));
  }
}
function updateAscensionButtonVisibility() {
  const btn = document.getElementById('difficulty-btn-ascension');
  if (!btn) return;
  btn.classList.toggle('hidden', !isAscensionUnlocked());
  // Kilit kaldırıldıktan sonra hâlâ seçili olmayan bir zorlukta duruyorsak aktif görünümü düzelt
  btn.classList.toggle('active', difficultyId === 'zor_asc1');
}
updateAscensionButtonVisibility();

// ── Freemium: RevenueCat Entegrasyonu ──────────────────────────────
const REVENUECAT_API_KEY   = "appl_KlZySfvjUxObiFRjoLxjswysoic";   // RevenueCat > Project Settings > API Keys > Apple App Store
const REVENUECAT_ENTITLEMENT_ID = "full_version";               // RevenueCat > Entitlements'ta verdiğin identifier

// GÜVENLİK KİLİDİ: Gerçek API key girilmeden paywall tetiklenmesin —
// yoksa satın alma çalışmadan oyuncular 3. yılda kilitli kalır.
// REVENUECAT_API_KEY güncellendiği an bu otomatik true olur.
const FREEMIUM_ENABLED = REVENUECAT_API_KEY !== "REVENUECAT_IOS_API_KEY_BURAYA";

let _rcReady = false;
let _rcOfferingPackage = null; // satın alma sırasında kullanılacak Package objesi

// Hızlı yerel önbellek: RevenueCat'e her seferinde sormadan önce buna bakılır.
// Gerçek doğruluk kaynağı her zaman getCustomerInfo() / restorePurchases()'tir.
function isFullVersionUnlocked() {
  return localStorage.getItem('sadrazam_full_unlocked') === '1';
}
function _setFullVersionUnlocked(unlocked) {
  localStorage.setItem('sadrazam_full_unlocked', unlocked ? '1' : '0');
}
function _applyCustomerInfo(customerInfo) {
  // Hoşgeldin Kesesi de Tam Sürüm'ü açar — RevenueCat entitlement'ına bağlanmasa
  // bile satın alınmış ürün listesinden okunur (Reklamsız ile aynı yöntem).
  const active = !!customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID]
    || _customerOwnsProduct(customerInfo, STARTER_PRODUCT_ID)
    || _customerOwnsProduct(customerInfo, BUNDLE_PRODUCT_ID);
  _setFullVersionUnlocked(active);
  _applyNoAdsFromCustomerInfo(customerInfo);
  return active;
}

// ── Reklamsız ──
// RevenueCat'te ayrı bir entitlement gerektirmesin diye doğrudan satın alınmış
// ürün listesine bakılıyor (non-consumable, allPurchasedProductIdentifiers'ta kalıcı durur).
function isAdFreeUnlocked() {
  return localStorage.getItem('sadrazam_noads') === '1';
}
function _setAdFreeUnlocked(unlocked) {
  localStorage.setItem('sadrazam_noads', unlocked ? '1' : '0');
  updateNoAdsUI();
  if (typeof updateBundleUI === 'function') updateBundleUI();
}
function _customerOwnsProduct(customerInfo, productId) {
  if (!customerInfo) return false;
  if ((customerInfo.allPurchasedProductIdentifiers || []).includes(productId)) return true;
  return (customerInfo.nonSubscriptionTransactions || []).some(tx => tx?.productIdentifier === productId);
}
function _applyNoAdsFromCustomerInfo(customerInfo) {
  if (!customerInfo) return;
  _setAdFreeUnlocked(_customerOwnsProduct(customerInfo, NOADS_PRODUCT_ID)
    || _customerOwnsProduct(customerInfo, BUNDLE_PRODUCT_ID));
}

async function initRevenueCat() {
  if (!FREEMIUM_ENABLED) return; // API key henüz girilmedi
  const RC = window.RevenueCatPurchases;
  if (!RC || !window.Capacitor?.isNativePlatform?.()) return; // web/tarayıcıda satın alma yok
  try {
    await RC.configure({ apiKey: REVENUECAT_API_KEY });
    _rcReady = true;
    const { customerInfo } = await RC.getCustomerInfo();
    _applyCustomerInfo(customerInfo);
    processAkceTransactions(customerInfo); // uygulama kapalıyken redeem edilmiş promosyon kodu varsa hemen işle
    const offerings = await RC.getOfferings();
    const pkgs = offerings?.current?.availablePackages || [];
    _rcOfferingPackage = pkgs[0] || null;
    updatePaywallPriceUI();
    initAkceProduct();
    // Kaynağı ne olursa olsun (buton satın alması, promosyon/hediye kodu,
    // restore, başka cihaz) HER customerInfo güncellemesinde akçe işlemlerini
    // tara — promosyon kodları uygulamanın kendi satın alma akışını hiç
    // tetiklemediği için bu, akçenin işlenmesini sağlayan TEK güvenilir yol.
    RC.addCustomerInfoUpdateListener((info) => {
      _applyCustomerInfo(info);
      processAkceTransactions(info);
    });
  } catch (e) {
    console.warn('RevenueCat init hatası:', e);
  }
}

// ── Akçe Satın Alma ─────────────────────────────────────────────────
// KİLL SWITCH: sorun çıkarsa false yap — "AKÇE AL" butonu eski "Yakında!"
// mesajına döner, satın alma arayüzü tamamen devreden çıkar. Kod silinmez,
// AKCE_SYSTEM_ENABLED tekrar true yapılınca aynen çalışmaya devam eder.
const AKCE_SYSTEM_ENABLED = true;

let _akceProducts = {}; // productId -> RevenueCat StoreProduct (consumable, entitlement'a bağlı değil)
let _noadsProduct = null; // Reklamsız StoreProduct (non-consumable)
let _bundleProduct = null; // Tam Sürüm + Reklamsız StoreProduct (non-consumable)

async function initAkceProduct() {
  if (!AKCE_SYSTEM_ENABLED) return;
  const RC = window.RevenueCatPurchases;
  if (!RC || !_rcReady) return;
  try {
    const { products } = await RC.getProducts({ productIdentifiers: [...AKCE_PACKS.map(p => p.productId), NOADS_PRODUCT_ID, BUNDLE_PRODUCT_ID] });
    _akceProducts = {};
    _noadsProduct = null;
    _bundleProduct = null;
    (products || []).forEach(p => {
      if (p.identifier === NOADS_PRODUCT_ID) _noadsProduct = p;
      else if (p.identifier === BUNDLE_PRODUCT_ID) _bundleProduct = p;
      else _akceProducts[p.identifier] = p;
    });
    updateAkcePriceUI();
    updateNoAdsUI();
    updateBundleUI();
    updateStarterUI();
  } catch (e) {
    console.warn('Akçe ürünleri alınamadı:', e);
  }
}

// ── Hoşgeldin Kesesi (27 Eylül 2026, 29 Eylül'de Tam Sürüm + 30 akçe oldu) ──
// 5. oyun bittikten sonra ana menüye dönülünce BİR KEZ "Ferman Mührü"
// penceresiyle teklif edilir (ürün o an mağazadan gelmediyse sonraki dönüşte).
// Satın alınana kadar Market'te Akçe Keseleri'nin üstünde durur. Tam Sürüm'e
// zaten sahip olana gösterilmez (aynı şeyi iki kez satmayalım).
const STARTER_BOUGHT_KEY = "sadrazam_starter_bought";
const STARTER_SEEN_KEY = "sadrazam_starter_offer_seen";
const STARTER_AFTER_GAMES = 5;
function isStarterBought() { try { return localStorage.getItem(STARTER_BOUGHT_KEY) === "1"; } catch (e) { return false; } }
function _markStarterBought() {
  try { localStorage.setItem(STARTER_BOUGHT_KEY, "1"); } catch (e) {}
  document.getElementById("starter-pack-btn")?.classList.add("gone");
}
// Teklif gösterilebilir mi: ürün mağazadan geldiyse (ya da test modunda sabit fiyatla)
function _starterAvailable() {
  if (!AKCE_SYSTEM_ENABLED || isStarterBought() || isFullVersionUnlocked()) return false;
  return !!_akceProducts[STARTER_PRODUCT_ID] || !FREEMIUM_ENABLED;
}
function _starterPrice() { return _akceProducts[STARTER_PRODUCT_ID]?.priceString || AKCE_FALLBACK_PRICES[30]; }
// Karşılaştırma: ayrı ayrı alınsa tutacağı fiyat = Tam Sürüm + 30 akçe (20'lik
// kese × 1,5). Kuruş cinsinden, mağazanın kendi para birimiyle; üç fiyattan
// biri eksikse ya da para birimleri farklıysa gösterilmez.
function _starterNormalCents() {
  const p = _akceProducts[STARTER_PRODUCT_ID], p20 = _akceProducts["com.rakuappdigital.sadrazam.akce20"];
  const full = _rcOfferingPackage?.product;
  if (!p || !p20 || !full) return null;
  if (typeof p.price !== "number" || typeof p20.price !== "number" || typeof full.price !== "number") return null;
  if (!p.currencyCode || p.currencyCode !== p20.currencyCode || p.currencyCode !== full.currencyCode) return null;
  return { normal: Math.round(full.price * 100) + Math.round(Math.round(p20.price * 100) * 1.5), now: Math.round(p.price * 100), currency: p.currencyCode };
}
function _starterNormalPrice() {
  const c = _starterNormalCents();
  if (c) {
    try { return new Intl.NumberFormat(window.LANG === 'en' ? 'en-US' : 'tr-TR', { style: 'currency', currency: c.currency, currencyDisplay: 'narrowSymbol' }).format(c.normal / 100); } catch (e) {}
    return "";
  }
  return FREEMIUM_ENABLED ? "" : "₺59,98"; // test modu: ₺29,99 + ₺29,99
}
// İndirim yüzdesi (ör. 33); hesaplanamazsa 0
function _starterDiscountPct() {
  const c = _starterNormalCents();
  if (!c) return FREEMIUM_ENABLED ? 0 : 33;
  return c.normal > c.now ? Math.round((1 - c.now / c.normal) * 100) : 0;
}
function updateStarterUI() {
  const btn = document.getElementById("starter-pack-btn");
  if (!btn) return;
  const en = window.LANG === 'en';
  btn.classList.toggle("gone", !_starterAvailable());
  const n = btn.querySelector(".starter-name"), sub = btn.querySelector(".starter-sub");
  if (n) n.textContent = en ? "WELCOME POUCH" : "HOŞGELDİN KESESİ";
  if (sub) sub.textContent = en ? "Full Version + 30 akce · one time" : "Tam Sürüm + 30 akçe · tek seferlik";
}
function maybeShowStarterOffer() {
  if (document.getElementById("starter-offer")) return;
  let games = 0, seen = false;
  try { games = parseInt(localStorage.getItem('sadrazam_games_played') || '0', 10); seen = localStorage.getItem(STARTER_SEEN_KEY) === "1"; } catch (e) { return; }
  if (seen || games < STARTER_AFTER_GAMES || !_starterAvailable()) return;
  if (introScreen.style.display === "none") return; // ana menüde değilsek bekle
  if (document.querySelector("#rating-overlay, #katib-overlay, #daily-gift-overlay")) return;
  try { localStorage.setItem(STARTER_SEEN_KEY, "1"); } catch (e) {}
  showStarterOffer();
}
function showStarterOffer() {
  const en = window.LANG === 'en';
  const price = _starterPrice(), normal = _starterNormalPrice(), pct = _starterDiscountPct();
  const cmpTail = pct ? (en ? `${pct}% off` : `%${pct} indirimli`) : (en ? "one time only" : "bir defaya mahsus");
  const ov = document.createElement("div");
  ov.id = "starter-offer";
  ov.innerHTML = `<div class="so-wrap">
      <div class="so-scroll">
        <div class="so-once">${en ? "A ONE-TIME DECREE" : "TEK SEFERLİK FERMAN"}</div>
        <div class="so-title">${en ? "WELCOME POUCH" : "HOŞGELDİN KESESİ"}</div>
        <p class="so-text">${en ? "For the Grand Vizier newly come to the Divan: every year of the reign is opened, and a pouch is granted from the treasury." : "Divan'a yeni adım atan sadrazama: saltanatın bütün yılları açılır, hazineden de bir kese çıkarılır."}</p>
        <div class="so-seal"><div class="n">30</div><div class="u">${en ? "AKCE" : "AKÇE"}</div><div class="plus">+ ${en ? "FULL VERSION" : "TAM SÜRÜM"}</div></div>
        <ul class="so-list">
          <li>${en ? "<b>Full Version</b> · no year limit" : "<b>Tam Sürüm</b> · yıl sınırı yok"}</li>
          <li>${en ? "<b>30 akce</b> · for Second Chances" : "<b>30 akçe</b> · İkinci Şans için"}</li>
        </ul>
        <p class="so-cmp">${normal ? `<span class="so-strike">${normal}</span> · ` : ""}${cmpTail}</p>
      </div>
      <button class="so-buy" type="button">${en ? "ACCEPT THE SEAL" : "MÜHRÜ KABUL ET"} · ${price}</button>
      <div class="so-status" aria-live="polite"></div>
      <button class="so-later" type="button">${en ? "Later" : "Daha sonra"}</button>
    </div>`;
  document.body.appendChild(ov);
  const close = () => { ov.classList.remove("visible"); setTimeout(() => ov.remove(), 250); };
  const buy = ov.querySelector(".so-buy"), status = ov.querySelector(".so-status");
  ov.querySelector(".so-later").onclick = close;
  buy.onclick = async () => {
    buy.disabled = true;
    const ok = await purchaseAkcePack(30, status);
    if (ok) { updateAkceUI(); setTimeout(close, 1300); } else buy.disabled = false;
  };
  requestAnimationFrame(() => ov.classList.add("visible"));
}

function updateAkcePriceUI() {
  document.querySelectorAll('.akce-pack-btn').forEach(btn => {
    const amount = parseInt(btn.dataset.amount, 10);
    const pack = AKCE_PACKS.find(p => p.amount === amount);
    const priceEl = btn.querySelector('.price-in');
    if (!priceEl || !pack) return;
    const realPrice = _akceProducts[pack.productId]?.priceString;
    if (realPrice) {
      priceEl.textContent = realPrice;
    } else if (!FREEMIUM_ENABLED) {
      priceEl.textContent = AKCE_FALLBACK_PRICES[amount] || '';
    } else {
      priceEl.textContent = '…';
    }
  });
}

function updateNoAdsUI() {
  const card = document.getElementById('noads-card');
  const priceEl = document.getElementById('noads-price');
  if (!card || !priceEl) return;
  const owned = isAdFreeUnlocked();
  card.classList.toggle('owned', owned);
  const btn = document.getElementById('noads-buy-btn');
  if (btn) btn.disabled = owned;
  if (owned) {
    priceEl.textContent = (window.t && t('market.noads_owned')) || (window.LANG === 'en' ? 'OWNED' : 'SATIN ALINDI');
  } else if (_noadsProduct?.priceString) {
    priceEl.textContent = _noadsProduct.priceString;
  } else if (!FREEMIUM_ENABLED) {
    priceEl.textContent = NOADS_FALLBACK_PRICE;
  } else {
    priceEl.textContent = '…';
  }
}

// ── Tam Sürüm + Reklamsız paketi ──
// Sadece ikisine de sahip olmayana gösterilir (birine sahip olana aynı şeyi iki kez
// satmayalım). Ürün mağazadan gelmediyse (henüz onaylanmadıysa) gizli kalır.
function _bundleAvailable() {
  if (!AKCE_SYSTEM_ENABLED || isFullVersionUnlocked() || isAdFreeUnlocked()) return false;
  return !!_bundleProduct || !FREEMIUM_ENABLED;
}
// Karşılaştırma: Tam Sürüm + Reklamsız ayrı ayrı (aynı para birimiyle); yoksa boş
function _bundleCompare() {
  const b = _bundleProduct, full = _rcOfferingPackage?.product, na = _noadsProduct;
  if (!b || !full || !na) return FREEMIUM_ENABLED ? null : { normal: "₺89,98", pct: 22 };
  if (typeof b.price !== "number" || typeof full.price !== "number" || typeof na.price !== "number") return null;
  if (!b.currencyCode || b.currencyCode !== full.currencyCode || b.currencyCode !== na.currencyCode) return null;
  const normal = Math.round(full.price * 100) + Math.round(na.price * 100), now = Math.round(b.price * 100);
  if (normal <= now) return null;
  let txt = "";
  try { txt = new Intl.NumberFormat(window.LANG === 'en' ? 'en-US' : 'tr-TR', { style: 'currency', currency: b.currencyCode, currencyDisplay: 'narrowSymbol' }).format(normal / 100); } catch (e) { return null; }
  return { normal: txt, pct: Math.round((1 - now / normal) * 100) };
}
function updateBundleUI() {
  const sec = document.getElementById('market-bundle');
  if (!sec) return;
  const show = _bundleAvailable();
  sec.classList.toggle('gone', !show);
  if (!show) return;
  const priceEl = document.getElementById('bundle-price');
  if (priceEl) priceEl.textContent = _bundleProduct?.priceString || (!FREEMIUM_ENABLED ? BUNDLE_FALLBACK_PRICE : '…');
  const cmp = _bundleCompare(), cmpEl = document.getElementById('bundle-compare');
  if (cmpEl) cmpEl.innerHTML = cmp ? `<s>${cmp.normal}</s> <em>${window.LANG === 'en' ? `${cmp.pct}% off` : `%${cmp.pct}`}</em>` : '';
}
async function purchaseBundle(statusEl) {
  if (isFullVersionUnlocked() && isAdFreeUnlocked()) return;
  const RC = window.RevenueCatPurchases;
  const status = statusEl || document.getElementById('akce-status');
  const isEN = window.LANG === 'en';
  if (!_rcReady || !RC) {
    if (status) status.textContent = isEN ? 'Purchases are not available right now.' : 'Satın alma şu an kullanılamıyor.';
    return;
  }
  if (!_bundleProduct) {
    if (status) status.textContent = isEN ? 'No product found. Try again shortly.' : 'Ürün bulunamadı, birazdan tekrar dene.';
    initAkceProduct();
    return;
  }
  if (status) status.textContent = isEN ? 'Processing…' : 'İşleniyor…';
  try {
    const result = await RC.purchaseStoreProduct({ product: _bundleProduct });
    // Satın alma döndüyse iki kilit de açık — customerInfo gecikse bile
    _applyCustomerInfo(result?.customerInfo);
    _setFullVersionUnlocked(true);
    _setAdFreeUnlocked(true);
    processAkceTransactions(result?.customerInfo);
    updateBundleUI();
    updateStarterUI();
    if (window.playSelectConfirm) playSelectConfirm();
    if (status) status.textContent = isEN ? 'Full Version unlocked, ads removed!' : 'Tam Sürüm açıldı, reklamlar kaldırıldı!';
    return true;
  } catch (e) {
    if (e?.userCancelled) {
      if (status) status.textContent = '';
    } else if (status) {
      status.textContent = isEN ? 'Purchase failed. Please try again.' : 'Satın alma başarısız oldu, tekrar dene.';
    }
  }
}

// ── Market: Eşyalar (3 Ekim 2026) ──
// Oyun dışında 1 akçeyle alınır, "sandık"ta bekler (en fazla 3), bir sonraki saltanatın
// başında boş kutulara kalıcı olarak (kullanılana kadar) konur.
const ITEM_STASH_KEY = "sadrazam_item_stash";
const ITEM_STASH_MAX = 3;
function _getStash() { try { const a = JSON.parse(localStorage.getItem(ITEM_STASH_KEY) || "[]"); return Array.isArray(a) ? a.filter(id => ITEMS[id]) : []; } catch (e) { return []; } }
function _setStash(a) { try { localStorage.setItem(ITEM_STASH_KEY, JSON.stringify(a.slice(0, ITEM_STASH_MAX))); } catch (e) {} }
function _applyStashToSlots() {
  const st = _getStash(); if (!st.length) return 0;
  let n = 0;
  while (st.length && playerItems.indexOf(null) !== -1) {
    const slot = playerItems.indexOf(null), id = st.shift();
    playerItems[slot] = id; playerItemExpiry[slot] = null; uniqueItemsCollected.add(id); n++;
  }
  _setStash(st);
  if (n) updateItemBar();
  return n;
}
function renderMarketItems() {
  const box = document.getElementById("market-items-list"), info = document.getElementById("market-items-stash");
  if (!box) return;
  const en = window.LANG === 'en', stash = _getStash(), full = stash.length >= ITEM_STASH_MAX;
  if (info) info.textContent = en
    ? `In your chest: ${stash.length}/${ITEM_STASH_MAX} · placed in your slots when your next reign begins, kept until used`
    : `Sandığında: ${stash.length}/${ITEM_STASH_MAX} · bir sonraki saltanatın başında kutularına konur, kullanana kadar kalır`;
  box.innerHTML = Object.keys(ITEMS).filter(id => !ESYA_DUKKANI_EXCLUDED.includes(id)).map(id => {
    const itm = ITEMS[id], e = (en && window.EN_ITEMS) ? window.EN_ITEMS[id] : null;
    const owned = stash.filter(x => x === id).length;
    return `<div class="mi-row"><img class="mi-icon" src="${itm.icon}" alt=""><div class="mi-info"><div class="mi-name">${e ? e.name : itm.name}${owned ? ` <span class="mi-own">×${owned}</span>` : ""}</div><div class="mi-desc">${e ? e.desc : itm.desc}</div></div><button type="button" class="mi-buy" data-id="${id}" ${full ? "disabled" : ""}>${full ? (en ? "FULL" : "DOLU") : `${ITEM_AKCE_COST} ${AKCE_COIN_SVG}`}</button></div>`;
  }).join("");
  box.querySelectorAll(".mi-buy").forEach(b => b.onclick = () => {
    const status = document.getElementById("akce-status");
    if (_getStash().length >= ITEM_STASH_MAX) return;
    if (!spendAkce(ITEM_AKCE_COST)) {
      if (status) status.textContent = en ? "Not enough akce. Pouches are below." : "Akçe yetmiyor. Keseler aşağıda.";
      document.getElementById("market-akce")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const st = _getStash(); st.push(b.dataset.id); _setStash(st);
    if (window.playSelectConfirm) playSelectConfirm();
    if (status) status.textContent = en ? "Added to your chest." : "Sandığına eklendi.";
    updateAkceUI(); renderMarketItems();
  });
}

function showAkceScreen() {
  const scr = document.getElementById('akce-screen');
  scr?.classList.add('visible');
  // İkinci Şans / Eşya Dükkanı gibi bir yerden akçe yetmediği için gelindiyse
  // Reklamsız bölümünü gizle, oyuncu doğrudan akçe keselerini görsün.
  scr?.classList.toggle('from-need', !!_akceReturnCallback);
  scr && (scr.scrollTop = 0);
  updateAkceUI();
  updateAkcePriceUI();
  updateNoAdsUI();
  updateBundleUI();
  updateStarterUI();
  renderMarketItems();
  const status = document.getElementById('akce-status');
  if (status) status.textContent = '';
}
function hideAkceScreen() {
  document.getElementById('akce-screen')?.classList.remove('visible');
  // Yetersiz bakiye yüzünden buraya yönlendirilmişsek (İkinci Şans, Eşya
  // Dükkanı, vs.) kapanınca kaldığımız yere geri dönüyoruz — satın alınmış
  // olsun ya da olmasın, "Kapat"a basınca da aynı şekilde geri dönülür.
  if (_akceReturnCallback) {
    const cb = _akceReturnCallback;
    _akceReturnCallback = null;
    cb();
  }
}

async function purchaseAkcePack(amount, statusEl) {
  const RC = window.RevenueCatPurchases;
  const status = statusEl || document.getElementById('akce-status');
  const isEN = window.LANG === 'en';
  const pack = AKCE_PACKS.find(p => p.amount === amount);

  if (!_rcReady || !RC || !pack) {
    if (status) status.textContent = isEN ? 'Purchases are not available right now.' : 'Satın alma şu an kullanılamıyor.';
    return;
  }
  const product = _akceProducts[pack.productId];
  if (!product) {
    if (status) status.textContent = isEN ? 'No product found. Try again shortly.' : 'Ürün bulunamadı, birazdan tekrar dene.';
    return;
  }
  if (status) status.textContent = isEN ? 'Processing…' : 'İşleniyor…';
  try {
    const result = await RC.purchaseStoreProduct({ product });
    // addAkce() doğrudan çağrılmıyor — processAkceTransactions() transactionIdentifier
    // bazlı tekilleştirme yapıyor, böylece customerInfo listener'ı aynı işlemi tekrar
    // görürse (her zaman görür) akçe iki kez eklenmez.
    processAkceTransactions(result?.customerInfo);
    if (window.playSelectConfirm) playSelectConfirm();
    if (pack.starter) {
      _markStarterBought(); // customerInfo gecikse bile teklif bir daha çıkmasın
      // Hoşgeldin Kesesi Tam Sürüm'ü de açar — customerInfo gecikse bile hemen
      _applyCustomerInfo(result?.customerInfo);
      _setFullVersionUnlocked(true);
    }
    if (status) status.textContent = pack.starter
      ? (isEN ? `Full Version unlocked, +${amount} akce added!` : `Tam Sürüm açıldı, +${amount} akçe eklendi!`)
      : (isEN ? `+${amount} akce added!` : `+${amount} akçe eklendi!`);
    // Başka bir ekrandan (İkinci Şans, Eşya Dükkanı, vs.) yönlendirildiysek,
    // kısa bir onay anından sonra otomatik olarak oraya geri dön
    if (_akceReturnCallback && !statusEl) {
      setTimeout(() => hideAkceScreen(), 900);
    }
    return true;
  } catch (e) {
    if (e?.userCancelled) {
      if (status) status.textContent = '';
    } else if (status) {
      status.textContent = isEN ? 'Purchase failed. Please try again.' : 'Satın alma başarısız oldu, tekrar dene.';
    }
  }
}

async function purchaseNoAds() {
  if (isAdFreeUnlocked()) return;
  const RC = window.RevenueCatPurchases;
  const status = document.getElementById('akce-status');
  const isEN = window.LANG === 'en';

  if (!_rcReady || !RC) {
    if (status) status.textContent = isEN ? 'Purchases are not available right now.' : 'Satın alma şu an kullanılamıyor.';
    return;
  }
  if (!_noadsProduct) {
    if (status) status.textContent = isEN ? 'No product found. Try again shortly.' : 'Ürün bulunamadı, birazdan tekrar dene.';
    initAkceProduct(); // ürün listesi ilk açılışta gelmemiş olabilir, arka planda tekrar dene
    return;
  }
  if (status) status.textContent = isEN ? 'Processing…' : 'İşleniyor…';
  try {
    const result = await RC.purchaseStoreProduct({ product: _noadsProduct });
    // Satın alma başarıyla döndüyse ürün artık oyuncunun — customerInfo gecikse bile kilidi aç
    _setAdFreeUnlocked(true);
    processAkceTransactions(result?.customerInfo);
    if (window.playSelectConfirm) playSelectConfirm();
    if (status) status.textContent = isEN ? 'Ads removed. Enjoy!' : 'Reklamlar kaldırıldı. Keyifli oyunlar!';
  } catch (e) {
    if (e?.userCancelled) {
      if (status) status.textContent = '';
    } else if (status) {
      status.textContent = isEN ? 'Purchase failed. Please try again.' : 'Satın alma başarısız oldu, tekrar dene.';
    }
  }
}

async function restoreMarketPurchases() {
  const RC = window.RevenueCatPurchases;
  const status = document.getElementById('akce-status');
  const isEN = window.LANG === 'en';
  if (!_rcReady || !RC) {
    if (status) status.textContent = isEN ? 'Purchases are not available right now.' : 'Satın alma şu an kullanılamıyor.';
    return;
  }
  if (status) status.textContent = isEN ? 'Restoring…' : 'Geri yükleniyor…';
  try {
    const { customerInfo } = await RC.restorePurchases();
    const fullUnlocked = _applyCustomerInfo(customerInfo); // Reklamsız da burada güncellenir
    processAkceTransactions(customerInfo);
    const restoredAny = fullUnlocked || isAdFreeUnlocked();
    if (status) status.textContent = restoredAny
      ? (isEN ? 'Purchases restored.' : 'Satın almalar geri yüklendi.')
      : (isEN ? 'No previous purchase found.' : 'Önceki bir satın alma bulunamadı.');
  } catch (e) {
    if (status) status.textContent = isEN ? 'Restore failed. Please try again.' : 'Geri yükleme başarısız oldu, tekrar dene.';
  }
}

document.querySelectorAll('.akce-pack-btn').forEach(btn => {
  btn.addEventListener('click', () => purchaseAkcePack(parseInt(btn.dataset.amount, 10)));
});
document.getElementById('akce-close-btn')?.addEventListener('click', hideAkceScreen);
document.getElementById('noads-buy-btn')?.addEventListener('click', purchaseNoAds);
document.getElementById('bundle-buy-btn')?.addEventListener('click', () => purchaseBundle());
document.getElementById('market-restore-btn')?.addEventListener('click', restoreMarketPurchases);

function updatePaywallPriceUI() {
  const el = document.getElementById('paywall-price');
  if (!el) return;
  const realPrice = _rcOfferingPackage?.product?.priceString;
  if (realPrice) {
    el.textContent = realPrice;
  } else if (!FREEMIUM_ENABLED) {
    // DEMO: RevenueCat henüz bağlanmadı — App Store Connect'te girilen
    // gerçek fiyatı önizleme amaçlı gösteriyoruz. Gerçek entegrasyonda
    // bu satır devreye girmez, gerçek priceString kullanılır.
    const isEN = window.LANG === 'en';
    el.textContent = isEN ? '$2.99' : '₺29,99';
  } else {
    el.textContent = '…';
  }
  _updatePaywallTiles();
}

// Yeni paywall (3 Ekim 2026): iki seçenek, ortak kırmızı mühür (.ferman). Paket sadece
// mağazadan geldiyse ve oyuncu hiçbirine sahip değilse görünür; seçili olan satın alınır.
let _pwSel = 'bundle';
function _updatePaywallTiles() {
  const tb = document.getElementById('pw-tile-bundle'), tf = document.getElementById('pw-tile-full');
  if (!tb || !tf) return;
  const showB = _bundleAvailable();
  tb.style.display = showB ? '' : 'none';
  document.getElementById('paywall-tiles')?.classList.toggle('single', !showB);
  if (!showB) _pwSel = 'full';
  const bp = document.getElementById('paywall-bundle-price');
  if (bp) bp.textContent = _bundleProduct?.priceString || (!FREEMIUM_ENABLED ? BUNDLE_FALLBACK_PRICE : '…');
  const cmp = _bundleCompare(), bc = document.getElementById('paywall-bundle-cmp');
  if (bc) bc.innerHTML = cmp ? `<s>${cmp.normal}</s>` : '&nbsp;';
  [tf, tb].forEach(t => { const on = t.dataset.p === _pwSel; t.classList.toggle('sel', on); t.setAttribute('aria-pressed', String(on)); });
  const btn = document.getElementById('paywall-buy-btn'), en = window.LANG === 'en';
  if (btn) {
    const price = (_pwSel === 'bundle' ? document.getElementById('paywall-bundle-price') : document.getElementById('paywall-price'))?.textContent || '';
    const name = _pwSel === 'bundle' ? (en ? 'GET FULL + AD-FREE' : 'TAM + REKLAMSIZ AL') : (en ? 'UNLOCK FULL VERSION' : 'TAM SÜRÜMÜ AÇ');
    btn.textContent = price && price !== '…' ? `${name} · ${price}` : name;
  }
}
document.querySelectorAll('.pw-tile').forEach(t => t.addEventListener('click', () => { _pwSel = t.dataset.p; _updatePaywallTiles(); }));
async function _paywallBuy() {
  if (_pwSel === 'bundle' && _bundleAvailable()) {
    const ok = await purchaseBundle(document.getElementById('paywall-status'));
    if (ok && isFullVersionUnlocked()) unlockFullVersion();
    return;
  }
  purchaseFullVersion();
}

let _paywallFromMenu = false; // giriş ekranındaki "Tam Sürümü Aç" butonundan mı açıldı?

const PAYWALL_COPY = {
  limit: { tr: ["MÜHÜR HÂLÂ SENDE", "Sultan seni azletmedi; yalnızca ücretsiz sürümün iki yılı doldu. Saltanatını kaldığın yerden sürdür."],
           en: ["THE SEAL IS STILL YOURS", "The Sultan has not dismissed you; only the free version's two years are over. Continue your reign where you left off."] },
  start: { tr: ["DİVAN SENİ BEKLİYOR", "Ücretsiz sürümde her saltanat 2 yıl sürer. Tam Sürüm'le sınır kalkar, Divan'da istediğin kadar kalırsın."],
           en: ["THE DIVAN AWAITS YOU", "In the free version every reign lasts 2 years. The Full Version removes the limit; stay in the Divan as long as you can."] },
  menu:  { tr: ["DİVAN SENİ BEKLİYOR", "Sınırsız saltanat, yıl yıl fermanlar. Tek seferlik ödeme, abonelik yok."],
           en: ["THE DIVAN AWAITS YOU", "An unlimited reign, a decree every year. One-time payment, no subscription."] },
};
function showPaywallScreen(fromMenu = false) {
  _paywallFromMenu = fromMenu;
  {
    const en = window.LANG === 'en', ctx = fromMenu ? 'menu' : (_paywallAtGameStart ? 'start' : 'limit');
    const [ttl, txt] = PAYWALL_COPY[ctx][en ? 'en' : 'tr'];
    const te = document.getElementById('paywall-title'), xe = document.getElementById('paywall-text'), ke = document.getElementById('paywall-kicker');
    if (te) te.textContent = ttl; if (xe) xe.textContent = txt; if (ke) ke.textContent = en ? 'FULL VERSION' : 'TAM SÜRÜM';
    _pwSel = 'bundle';
  }
  const scr = document.getElementById('paywall-screen');
  if (scr) scr.classList.add('visible');
  scr?.classList.toggle('from-menu', fromMenu);
  updatePaywallPriceUI();
  _renderPaywallPersonal(fromMenu);
  const status = document.getElementById('paywall-status');
  if (status) status.textContent = '';
  const buyBtn = document.getElementById('paywall-buy-btn');
  if (buyBtn) buyBtn.style.display = '';
  const quitBtn = document.getElementById('paywall-quit-btn');
  if (quitBtn) {
    const isEN = window.LANG === 'en';
    quitBtn.textContent = fromMenu ? (isEN ? 'Close' : 'Kapat')
      : _paywallAtGameStart ? (isEN ? 'Continue Free (2 years)' : 'Ücretsiz Devam Et (2 yıl)')
      : (isEN ? 'End This Reign' : 'Saltanatı Bitir');
  }
  // Demo modunda (gerçek RevenueCat bağlanmadan önce) sıfırlama linki göster
  const resetBtn = document.getElementById('paywall-demo-reset');
  if (resetBtn) {
    const showReset = !FREEMIUM_ENABLED && isFullVersionUnlocked();
    resetBtn.classList.toggle('hidden', !showReset);
  }
}
// Tam Sürüm ekranında kişisel bağlam: oyuncunun bekleyen kararları hangi
// yılda geri dönecekti (27 Eylül 2026). Menüden açıldıysa gösterilmez.
function _renderPaywallPersonal(fromMenu) {
  const txt = document.getElementById('paywall-text');
  let box = document.getElementById('paywall-personal');
  if (!box && txt) { box = document.createElement('div'); box.id = 'paywall-personal'; txt.insertAdjacentElement('afterend', box); }
  if (!box) return;
  box.innerHTML = '';
  if (fromMenu) return;
  const en = window.LANG === 'en';
  const esc = (t) => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const items = scheduledCards.filter(sc => sc.src && sc.src.tr).sort((a, b) => a.afterCardsPlayed - b.afterCardsPlayed).slice(0, 2);
  if (!items.length) return;
  const lines = items.map(sc => {
    const y = Math.max(year, Math.floor(sc.afterCardsPlayed / CARDS_PER_YEAR) + 1);
    const q = esc(en ? sc.src.en : sc.src.tr);
    return `<li><span class="pc-q">“${q}”</span> ${en ? `— its result arrives in year ${y}.` : `kararınızın sonucu ${y}. yılda gelecek.`}</li>`;
  }).join('');
  const ids = scheduledCards.map(x => x.cardId);
  let knot = '';
  outer: for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (_findKnotCard(ids[i], ids[j])) { knot = `<li class="pc-knot">${en ? "Two of your decisions are about to meet." : "İki kararınız birleşmek üzere."}</li>`; break outer; }
  box.innerHTML = `<div class="pending-cons awaits"><div class="pc-title">${en ? "YOUR REIGN IS UNFINISHED" : "SALTANATINIZ YARIM KALDI"}</div><ul>${lines}${knot}</ul></div>`;
}

function hidePaywallScreen() {
  document.getElementById('paywall-screen')?.classList.remove('visible');
}

function showSoftPaywallOffer() {
  _paywallSoftOffer = true;
  showPaywallScreen(false);
  const quitBtn = document.getElementById('paywall-quit-btn');
  if (quitBtn) {
    const isEN = window.LANG === 'en';
    quitBtn.textContent = isEN ? 'Continue Playing' : 'Oynamaya Devam Et';
  }
}

document.getElementById('paywall-demo-reset')?.addEventListener('click', () => {
  _setFullVersionUnlocked(false);
  const isEN = window.LANG === 'en';
  showPaywallScreen(_paywallFromMenu);
  const status = document.getElementById('paywall-status');
  if (status) status.textContent = isEN ? 'Demo purchase reset.' : 'Demo satın alma sıfırlandı.';
});

async function unlockFullVersion() {
  hidePaywallScreen();
  isPaywalled = false;
  if (_paywallAtGameStart) {
    // Oyun hiç başlamamıştı (3. yeniden başlatma paywall'ı) — direkt ilk kartı dağıt
    _paywallAtGameStart = false;
    if (!isGameOver) { saveGameState(); dealNext(); }
    return;
  }
  if (_paywallFromMenu) return; // menüden açıldıysa devam edecek bir oyun yok
  if (_paywallFromGuard) { // yıl zaten ilerlemişti (eski kayıt) — sadece devam et
    _paywallFromGuard = false;
    if (!isGameOver) { saveGameState(); dealNext(); }
    return;
  }
  advanceYear();
  if (!isGameOver && !isPaywalled) { saveGameState(); dealNext(); }
}

async function purchaseFullVersion() {
  const RC = window.RevenueCatPurchases;
  const status = document.getElementById('paywall-status');
  const isEN = window.LANG === 'en';

  if (!_rcReady || !RC) {
    if (status) status.textContent = isEN ? 'Purchases are not available right now.' : 'Satın alma şu an kullanılamıyor.';
    return;
  }
  if (!_rcOfferingPackage) {
    if (status) status.textContent = isEN ? 'No product found. Try again shortly.' : 'Ürün bulunamadı, birazdan tekrar dene.';
    return;
  }
  if (status) status.textContent = isEN ? 'Processing…' : 'İşleniyor…';
  try {
    const result = await RC.purchasePackage({ aPackage: _rcOfferingPackage });
    const unlocked = _applyCustomerInfo(result.customerInfo);
    if (unlocked) {
      if (window.playSelectConfirm) playSelectConfirm();
      unlockFullVersion();
    } else if (status) {
      status.textContent = isEN ? 'Purchase completed but entitlement not found.' : 'Satın alma tamamlandı ama yetki bulunamadı.';
    }
  } catch (e) {
    if (e?.userCancelled) {
      if (status) status.textContent = '';
    } else if (status) {
      status.textContent = isEN ? 'Purchase failed. Please try again.' : 'Satın alma başarısız oldu, tekrar dene.';
    }
  }
}

async function restoreFullVersion() {
  const RC = window.RevenueCatPurchases;
  const status = document.getElementById('paywall-status');
  const isEN = window.LANG === 'en';
  if (!_rcReady || !RC) return;
  if (status) status.textContent = isEN ? 'Restoring…' : 'Geri yükleniyor…';
  try {
    const { customerInfo } = await RC.restorePurchases();
    const unlocked = _applyCustomerInfo(customerInfo);
    processAkceTransactions(customerInfo); // restore, daha önce hiç işlenmemiş bir akçe satın alması ortaya çıkarabilir
    if (unlocked) {
      if (window.playSelectConfirm) playSelectConfirm();
      unlockFullVersion();
    } else if (status) {
      status.textContent = isEN ? 'No previous purchase found.' : 'Önceki bir satın alma bulunamadı.';
    }
  } catch (e) {
    if (status) status.textContent = isEN ? 'Restore failed. Please try again.' : 'Geri yükleme başarısız oldu, tekrar dene.';
  }
}

document.getElementById('paywall-buy-btn')?.addEventListener('click', _paywallBuy);
document.getElementById('paywall-restore-btn')?.addEventListener('click', restoreFullVersion);
function _quitAfterPaywall() {
  isPaywalled = false;
  clearSave();
  isGameOver = true;
  stopAmbientMusic();
  gameScreen.classList.add('hidden');
  gameScreen.classList.remove('night-mode');
  currentCard = null;
  selectedSultan = null;
  selectedAdvisors = [];
  introScreen.style.display = '';
}

function showPaywallDeclinedNotice(onDone) {
  const isEN = window.LANG === 'en';
  const overlay = document.createElement('div');
  overlay.id = 'paywall-declined-overlay';
  overlay.innerHTML = `
    <div id="paywall-declined-box">
      <div id="paywall-declined-ornament">${GAME_ICONS.loyalty_low}</div>
      <div id="paywall-declined-title">${isEN ? 'A SHORTER REIGN' : 'DAHA KISA BİR SALTANAT'}</div>
      <div id="paywall-declined-divider"></div>
      <div id="paywall-declined-text">${isEN
        ? "You can keep playing for free, but in the free version every reign ends at the close of its 2nd year. The Full Version removes the limit — you can unlock it any time from the main menu."
        : "Ücretsiz oynamaya devam edebilirsiniz; ancak ücretsiz sürümde her saltanat 2. yılın sonunda biter. Tam Sürüm bu sınırı kaldırır — ana menüden istediğiniz zaman açabilirsiniz."}</div>
      <button id="paywall-declined-btn">${isEN ? 'I UNDERSTAND' : 'ANLADIM'}</button>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  document.getElementById('paywall-declined-btn').onclick = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => { overlay.remove(); onDone(); }, 300);
  };
}

function showFreeVersionEndTransition(callback) {
  const isEN = window.LANG === 'en';
  const overlay = document.createElement('div');
  overlay.id = 'freeversion-end-overlay';
  overlay.innerHTML = `<div id="freeversion-end-text">${isEN ? 'END OF FREE VERSION' : 'ÜCRETSİZ SÜRÜM SONU'}</div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  setTimeout(() => {
    overlay.remove();
    callback();
  }, 2000);
}

document.getElementById('paywall-quit-btn')?.addEventListener('click', () => {
  if (_paywallSoftOffer) {
    // Teklif reddedildi, oyuna kaldığı yerden devam
    _paywallSoftOffer = false;
    hidePaywallScreen();
    if (!isGameOver) { saveGameState(); dealNext(); }
    return;
  }
  if (_paywallFromMenu) {
    // Sadece göz atıyordu, aktif bir oyunu yok — save'e dokunma
    hidePaywallScreen();
    return;
  }
  hidePaywallScreen();
  const firstDecline = localStorage.getItem('sadrazam_paywall_declined') !== '1';
  if (firstDecline) localStorage.setItem('sadrazam_paywall_declined', '1');
  if (_paywallAtGameStart) {
    // Oyun başında reddedildi — oyun 2 yıllık ücretsiz saltanat olarak başlar
    _paywallAtGameStart = false;
    isPaywalled = false;
    const go = () => { if (!isGameOver) { saveGameState(); dealNext(); } };
    if (firstDecline) showPaywallDeclinedNotice(go); else go();
    return;
  }
  // 2. yıl sınırında reddedildi — saltanat burada biter (ölüm ekranı + Vakayiname)
  const end = () => { isPaywalled = false; _endFreeReign(); };
  if (firstDecline) showPaywallDeclinedNotice(end); else end();
});

function _freeYearLimitReached() {
  return FREEMIUM_ENABLED && !isFullVersionUnlocked() && year > FREE_YEAR_LIMIT;
}
let _paywallFromGuard = false; // dealNext kilidi tetikledi: satın alınırsa yıl ilerletilmez
function _enforceFreeYearLimit() {
  if (isPaywalled) return;
  isPaywalled = true;
  _paywallFromGuard = true;
  if (localStorage.getItem('sadrazam_paywall_declined') === '1') showFreeLimitPopup();
  else showPaywallScreen(false);
}

function _endFreeReign() {
  const isEN = window.LANG === 'en';
  _actuallyTriggerGameOver(isEN
    ? "Your two-year term in the free version has ended. The seal returns to the Sultan — until the Full Version."
    : "Ücretsiz sürümdeki iki yıllık görev süreniz doldu. Mühür, Tam Sürüm'e kadar Sultan'a geri döndü.", "free_limit");
}

// Reddetmiş oyuncu 2. yılın sonuna gelince: kısa uyarı + Tam Sürüm / Saltanatı Bitir
function showFreeLimitPopup() {
  const isEN = window.LANG === 'en';
  document.getElementById('free-limit-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'free-limit-overlay';
  overlay.className = 'paywall-declined-overlay';
  overlay.innerHTML = `
    <div id="paywall-declined-box">
      <div id="paywall-declined-ornament"><div class="ferman ferman-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4 17.5h16M5 17.5 4 9l5 3.5L12 6l3 6.5L20 9l-1 8.5"/></svg></div></div>
      <div id="paywall-declined-title">${isEN ? 'YOUR TERM HAS ENDED' : 'GÖREV SÜRENİZ DOLDU'}</div>
      <div id="paywall-declined-divider"></div>
      <div id="paywall-declined-text">${isEN
        ? "In the free version a reign lasts at most 2 years. Unlock the Full Version to stay in the Divan, see where your decisions lead and rule for as long as you can survive."
        : "Ücretsiz sürümde bir saltanat en fazla 2 yıl sürer. Divan'da kalmak, kararlarınızın nereye varacağını görmek ve ayakta kalabildiğiniz sürece hüküm sürmek için Tam Sürüm'ü açın."}</div>
      ${_pendingConsequencesHTML(2)}
      <button id="free-limit-full-btn" class="free-limit-primary">${isEN ? 'UNLOCK FULL VERSION' : 'TAM SÜRÜMÜ AÇ'}</button>
      <button id="free-limit-end-btn" class="free-limit-secondary">${isEN ? 'End This Reign' : 'Saltanatı Bitir'}</button>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  const close = (cb) => { overlay.style.transition = 'opacity 0.3s ease'; overlay.style.opacity = '0'; setTimeout(() => { overlay.remove(); cb(); }, 300); };
  document.getElementById('free-limit-full-btn').onclick = () => close(() => showPaywallScreen(false));
  document.getElementById('free-limit-end-btn').onclick = () => close(() => { isPaywalled = false; _endFreeReign(); });
}

let _fullVersionBtnFired = false;
function _onFullVersionBtnTap(e) {
  if (e) e.preventDefault();
  if (_fullVersionBtnFired) return; // click+touchend çifte tetiklenmesin
  _fullVersionBtnFired = true;
  setTimeout(() => { _fullVersionBtnFired = false; }, 400);

  if (window.playButtonTap) playButtonTap();
  if (isFullVersionUnlocked()) {
    const isEN = window.LANG === 'en';
    showPaywallScreen(true);
    const status = document.getElementById('paywall-status');
    if (status) status.textContent = isEN ? 'You already own the Full Version. Thank you!' : 'Zaten Tam Sürüme sahipsin. Teşekkürler!';
    const buyBtn = document.getElementById('paywall-buy-btn');
    if (buyBtn) buyBtn.style.display = 'none';
  } else {
    const buyBtn = document.getElementById('paywall-buy-btn');
    if (buyBtn) buyBtn.style.display = '';
    showPaywallScreen(true);
  }
}
const _fullVersionBtn = document.getElementById('btn-full-version');
if (_fullVersionBtn) {
  _fullVersionBtn.addEventListener('click', _onFullVersionBtnTap);
  _fullVersionBtn.addEventListener('touchend', _onFullVersionBtnTap, { passive: false });
}

initRevenueCat();

// Müzik on/off kontrolü — tüm müzik çağrılarını sarar
const _origPlayMenuMusic = () => _switchMusic('menu');
const _origPlayGameMusic = () => _switchMusic('game');
const _origStopAll       = stopAllMusic;

// Müzik auto-başlatma — etkileşim olmadan da dene (Capacitor için)
let _menuMusicReady    = false;
let _menuMusicRequested = false;

function _tryStartMenuMusic() {
  if (!window.musicEnabled) return;
  if (_menuMusicReady) playMenuMusic();
  else _menuMusicRequested = true;
}

// Sayfa yüklenince otomatik başlat — Capacitor/iOS native'de etkileşim gerekmez
setTimeout(() => {
  _menuMusicReady = true;
  if (window.musicEnabled) playMenuMusic();
}, 300);

// Web browser fallback — autoplay policy nedeniyle ilk dokunuş/tık gerekir
function _startMusicOnInteraction() {
  if (window.musicEnabled && _menuMusicReady) playMenuMusic();
  document.removeEventListener('touchend', _startMusicOnInteraction);
  document.removeEventListener('mousedown', _startMusicOnInteraction);
}
document.addEventListener('touchend',  _startMusicOnInteraction, { once: true, passive: true });
document.addEventListener('mousedown', _startMusicOnInteraction, { once: true });

document.getElementById("btn-start").addEventListener("click", () => {
  if (window.playSelectConfirm) playSelectConfirm();
  isPasaMode = false;
  isChallengeMode = false; // normal mod — challenge kapalı
  introScreen.style.display = "none";
  showSultanScreen();
});

document.getElementById("btn-pasa-mode").addEventListener("click", () => {
  if (window.playSelectConfirm) playSelectConfirm();
  isPasaMode = true;
  isChallengeMode = false; // paşalık modu — challenge kapalı
  introScreen.style.display = "none";
  showSultanScreen();
});

// ── Mod tanıtım penceresi (27 Eylül 2026): Meydan Okuma ve Deneyimli Mod ──
function showModeIntro(o) {
  if (document.getElementById("mode-intro-overlay")) return;
  const isEN = window.LANG === 'en';
  const el = document.createElement("div");
  el.id = "mode-intro-overlay";
  el.innerHTML = `<div id="mode-intro-box">
      <div class="mi-icon">${o.icon || ""}</div>
      <div class="mi-title">${o.title}</div>
      <div class="mi-body">${o.body}</div>
      <button class="mi-go">${o.cta || (isEN ? "Continue" : "Devam Et")}</button>
      <button class="mi-back">${isEN ? "Go back" : "Vazgeç"}</button>
    </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("visible"));
  const close = () => { el.classList.remove("visible"); setTimeout(() => el.remove(), 220); };
  el.querySelector(".mi-go").onclick = () => { if (window.playSelectConfirm) playSelectConfirm(); close(); if (o.onContinue) o.onContinue(); };
  el.querySelector(".mi-back").onclick = () => { close(); if (o.onCancel) o.onCancel(); };
}

document.getElementById("btn-pargali").addEventListener("click", () => {
  if (window.playButtonTap) playButtonTap();
  showPargaliLetter();
});
// Dosyanın tamamı yüklendikten sonra (PARGALI_* sabitleri aşağıda tanımlı —
// burada doğrudan çağırmak TDZ hatasıyla betiğin geri kalanını durduruyordu)
setTimeout(updatePargaliMenuButton, 0);

document.getElementById("btn-challenge").addEventListener("click", () => {
  if (window.playButtonTap) playButtonTap();
  const isEN = window.LANG === 'en';
  showModeIntro({
    icon: GAME_ICONS.action_force,
    title: isEN ? "CHALLENGE MODE" : "MEYDAN OKUMA MODU",
    body: isEN
      ? `<p>Each reign gives you <b>3 goals</b>, such as <i>“Support the Şeyhülislam 3 times”</i> or <i>“Keep the Treasury above 30”</i>.</p>
         <p>Your goals sit in the <b>${GAME_ICONS.action_force} badge</b> at the top; tap it to see the list. Some are completed once achieved, others must be kept <b>until year ${CHALLENGE_KEEP_UNTIL_YEAR}</b>.</p>
         <p>The rules are the same as the normal game. Complete all three and the treasury grants <b>+${CHALLENGE_REWARD_AKCE} akce</b>.</p>`
      : `<p>Her saltanatta sana <b>3 hedef</b> verilir: <i>“Şeyhülislam'ı 3 kez destekle”</i>, <i>“Hazine 30'un altına düşmesin”</i> gibi.</p>
         <p>Hedeflerin üstteki <b>${GAME_ICONS.action_force} rozetinde</b> durur; dokununca listeyi görürsün. Bazı hedefler bir kez yapınca tamamlanır, bazıları <b>${CHALLENGE_KEEP_UNTIL_YEAR}. yıla kadar</b> korunmalıdır.</p>
         <p>Kurallar normal oyunla aynıdır. Üçünü de tamamlarsan hazineden <b>+${CHALLENGE_REWARD_AKCE} akçe</b> kazanırsın.</p>`,
    cta: isEN ? "Continue — choose your Sultan" : "Devam Et — Sultanını Seç",
    onContinue: () => startChallengeMod(),
  });
});

document.getElementById("btn-settings").addEventListener("click",    showSettingsOverlay);
document.getElementById("btn-settings").addEventListener("touchend", showSettingsOverlay, { passive: true });

document.getElementById("btn-daily-gift").addEventListener("click", () => {
  if (window.playButtonTap) playButtonTap();
  showDailyGift();
});
updateDailyGiftBadge();
setInterval(updateDailyGiftBadge, 60000); // gece yarısı geçince rozet yeniden yansın

document.getElementById("btn-akcesystem").addEventListener("click", () => {
  if (AKCE_SYSTEM_ENABLED) { showAkceScreen(); return; }

  // Kill switch kapalıyken eski "Yakında!" davranışına düşer
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

document.getElementById("btn-howto-back").addEventListener("click", () => {
  howtoScreen.classList.remove("visible");
  introScreen.style.display = "";
});

document.getElementById("btn-howto").addEventListener("click", () => {
  if (window.playSelectConfirm) playSelectConfirm();
  introScreen.style.display = "none";
  howtoScreen.classList.add("visible");
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
  _maybeShowInterstitialThenStartGame();
}

// "OYUNA BAŞLA" tuşuna her basıldığında sayılır, HER 3. basışta bir geçiş
// reklamı gösterilir. Reklam gösterilemese/hiç yüklenmemiş olsa bile
// InterstitialAds.show() her koşulda callback'i çağırır — oyun asla
// reklama bağlı kalıp bloklanmaz. Market'ten "Reklamsız" alındıysa hiç gösterilmez.
const INTERSTITIAL_EVERY_N_GAMES = 3; // 27 Eylül 2026: 2 → 3 (kullanıcı isteği)
function _maybeShowInterstitialThenStartGame() {
  if (isAdFreeUnlocked()) { startGame(); return; }
  const n = parseInt(localStorage.getItem('sadrazam_start_count') || '0', 10) + 1;
  localStorage.setItem('sadrazam_start_count', String(n));
  if (typeof InterstitialAds !== 'undefined' && n % INTERSTITIAL_EVERY_N_GAMES === 0) {
    InterstitialAds.show(startGame);
  } else {
    startGame();
  }
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
        <span><img class="sc-stat-icon" src="assets/icons/icon-saray.png" alt="Saray"> ${s.stats.saray}</span>
        <span><img class="sc-stat-icon" src="assets/icons/icon-ordu.png" alt="Ordu"> ${s.stats["yeniçeri"]}</span>
        <span><img class="sc-stat-icon" src="assets/icons/icon-ulema.png" alt="Ulema"> ${s.stats.ulema}</span>
        <span><img class="sc-stat-icon" src="assets/icons/icon-hazine.png" alt="Hazine"> ${s.stats.hazine}</span>
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
  updateAscensionButtonVisibility();
  document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.toggle('active', b.dataset.diff === difficultyId));
  updateDifficultyLockUI();
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
  _applyPargaliEndingAtStart(); // Pargalı'nın Sırrı çözüldüyse kalıcı başlangıç etkisi

  year = 1;
  cardsPlayed = 0;
  sadrazamHealth = 90;
  _hekimDinlenme20Shown = false;
  sehzadePower   = 0;
  _sehzadeChecked = false;
  activeFlags = {};
  isGameOver = false;
  playCounts = {};
  forcedQueue = [];
  scheduledCards = [];
  _criticalShownCount = 0; _criticalLastAt = -999; _criticalYear = 0;
  _muneccimN = 0; _muneccimAt = -999;
  _timedUsedYear = 0;
  _ferman = null; _fermanStreak = 0; _fermanQueue = []; _fermanShowing = false; _fermanDoneThisGame = 0; _fermanTotalThisGame = 0;
  document.getElementById("ferman-chip")?.remove();
  relPoints = {}; _relRescued = {}; _relKomploAt = {}; _relKomploDone = {}; _divanYear = 0; _divanUsed = [];
  _agedSeenThisGame = new Set();
  _stampMeta = new Map();
  _hekimYesCount = 0; _knotIdsSeenThisGame = new Set(); _challengeRewarded = false;
  document.getElementById("challenge-list")?.remove();
  _lastDecision = null;
  characterMemory = {};

  // Easter egg sayaçları sıfırla
  _lastEasterEggAt = -999;
  _lastSultanCardAt = -999;
  _easterKediNext    = 65;
  _easterYanlisNext  = 55;
  _easterYanlisCount = 0;
  _easterKehanetNext = 60;
  _easterEvliyaNext  = 45;
  _easterPargaliDone = false;
  _padisahZiyaretiNext  = 100; // ilk ziyaret ~yıl 4
  _padisahZiyaretiCount = 0;
  _sultanWarningShown   = false;
  _easterHistNext    = 70;
  _easterHistIdx     = 0;
  _easterZamanNext   = 80;
  _easterFisildayanNext = 95;
  _fisildayanIdx     = 0;
  _donumNextCard     = 80;
  _donumShownThisGame = false;
  _donumShownCount   = 0;
  _evliyaTextIdx     = 0;
  _initZamanShuffle();
  _kehanetIdx        = 0;
  _felaketIdx        = 0;
  _mucizeIdx         = 0;
  activeArcs = {};
  triggeredArcs = {};
  decisionLog = [];
  chronicle = [];
  isPaywalled = false;
  _secondChanceUsedThisDeath = false;
  _secondChanceOfferedThisGame = false;
  _eyaletNextCard = 40;
  _eyaletShownCount = 0;
  _eyaletIsyanSchedule = [];
  _sultanFavorSchedule = [];
  _sultanFavorTurns = 0;
  provinceLoyalty = { rumeli: 50, anadolu: 50, misir: 50, dogu: 50, akdeniz: 50 };
  _savasSonucSchedule = null;
  _ramazanShownThisGame = false;
  _golgeShownThisGame = false;
  _halkSevgisiShownThisGame = false;
  _casusAgiShownThisGame = false;
  _mektup1Shown = false;
  _mektup2Shown = false;
  _mektup3Shown = false;
  _mektup4Shown = false;
  // Rastgele eşikler: her oyunda özel kartlar farklı bir kart sayısında gelsin
  const _rndBetween = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  _golgeThreshold    = _rndBetween(4, 8);
  // Sultan mektupları: CARDS_PER_YEAR=24 olduğu için eski sabit değerler
  // (6/9/15/25) hepsi 1. yılın içine sıkışıyordu — mektuplar arka arkaya
  // gelip önemsizleşiyordu. Artık yıla göre orantılı, ~2-3 yılda bir gelecek
  // şekilde yayılıyor (yıl ~1, ~3, ~6, ~9), her oyunda hafif rastgele.
  _mektup1Threshold  = _rndBetween(Math.round(CARDS_PER_YEAR * 0.4), Math.round(CARDS_PER_YEAR * 0.75));
  _mektup3Threshold  = _rndBetween(CARDS_PER_YEAR * 3 - 6,  CARDS_PER_YEAR * 3 + 6);
  _mektup2Threshold  = _rndBetween(CARDS_PER_YEAR * 6 - 8,  CARDS_PER_YEAR * 6 + 8);
  _mektup4Threshold  = _rndBetween(CARDS_PER_YEAR * 9 - 8,  CARDS_PER_YEAR * 9 + 8);
  _mirasThreshold    = _rndBetween(12, 18);
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
  hiddenTraitor = TRAITOR_CANDIDATES[Math.floor(Math.random() * TRAITOR_CANDIDATES.length)];

  if (titleLabel) titleLabel.textContent = currentTitle;

  // Remove night mode
  gameScreen.classList.remove("night-mode");

  updateYearLabel();
  updateStatUI();
  updateDynamicSubtitle();
  ensureFateBar();

  gameScreen.classList.remove("hidden");

  if (isChallengeMode) buildChallengePanel();

  // Tam Sürüm ekranı hiç reddedilmediyse ve 2 oyun bittiyse, 3. oyun başlamadan
  // bir kez gösterilir. Reddedilirse oyun 2 yıllık ücretsiz saltanat olarak başlar.
  _paywallAtGameStart = false;
  _paywallFromGuard = false;
  // Market'te alınıp sandıkta bekleyen eşyalar boş kutulara (kalıcı) — 3 Ekim 2026
  try { _applyStashToSlots(); } catch (e) { console.warn('[stash]', e); }
  if (FREEMIUM_ENABLED && !isFullVersionUnlocked()
      && localStorage.getItem('sadrazam_paywall_declined') !== '1'
      && parseInt(localStorage.getItem('sadrazam_games_played') || '0', 10) >= FREE_GAMES_BEFORE_PAYWALL) {
    _paywallAtGameStart = true;
  }

  if (!localStorage.getItem('sadrazam_tutorial_done')) {
    showTutorial(() => {
      if (_paywallAtGameStart) { isPaywalled = true; showPaywallScreen(false); }
      else dealNext();
    });
  } else if (_paywallAtGameStart) {
    isPaywalled = true;
    showPaywallScreen(false);
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
    title: "Padişah Fermanı",
    desc: "Her yılın başında Sultan bir ferman verir. Yıl sonunda bakılır: yerine getirirsen sabrı artar, Vezirler Defteri'ne mühür düşer."
  },
  {
    stat: null,
    icon: null,
    title: "Divan'ın İnsanları",
    desc: "Valide Sultan, Rakip Vezir, Yeniçeri Ağası, Şeyhülislam, Defterdar ve Casuslar Başı seni hatırlar. İsteklerini kabul ettikçe yakınlaşır, reddettikçe uzaklaşırsın. Can dostun seni bir kez ölümden kurtarır; can düşmanın komplo kurar."
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
  const isEN = window.LANG === 'en';
  const steps = (isEN && window.EN_TUTORIAL_STEPS) ? window.EN_TUTORIAL_STEPS : TUTORIAL_STEPS;
  const nextLabel = isEN ? 'NEXT →' : 'İLERİ →';
  const startLabel = isEN ? 'START' : 'BAŞLA';

  function renderStep() {
    const s = steps[step];
    const isLast = step === steps.length - 1;
    overlay.innerHTML = `
      <div id="tutorial-box">
        ${s.icon ? `<img src="${s.icon}" id="tutorial-icon" alt="${s.title}">` : '<div id="tutorial-icon-placeholder">✦</div>'}
        <div id="tutorial-title">${s.title}</div>
        <div id="tutorial-desc">${s.desc.replace(/\n/g,'<br>')}</div>
        <div id="tutorial-progress">${steps.map((_,i) => `<span class="${i===step?'active':''}"></span>`).join('')}</div>
        <button id="tutorial-next">${isLast ? startLabel : nextLabel}</button>
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
      if (step >= steps.length) {
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

function playMenuMusic() { if (window.musicEnabled !== false) _switchMusic('menu'); }
function playGameMusic()  { if (window.musicEnabled !== false) _switchMusic('game'); }
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

// Arkaplanda kalırken bir kart animasyonu/sürüklemesi yarıda kesilmiş olabilir
// (tarayıcı setTimeout'ları throttle/durdurabiliyor) — geri dönünce kart'ı
// güvenli bir duruma sıfırla, yoksa oyun kalıcı olarak "takılı" görünür.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (typeof isAnimating !== 'undefined' && isAnimating) {
    isAnimating = false;
  }
  if (typeof isDragging !== 'undefined' && isDragging) {
    isDragging = false;
  }
  const cardEl = document.getElementById('card');
  if (cardEl) {
    cardEl.classList.remove('dragging');
    cardEl.style.transition = 'none';
    cardEl.style.transform = 'translateX(0) rotate(0deg)';
    cardEl.style.opacity = '';
  }
});

// ── AMBIENT MÜZİK (Web Audio — efekt sesleri için korundu) ───────
// Ambient Web Audio kaldırıldı — sadece MP3 müzik kullanılıyor
let ambientCtx = null;
let ambientNodes = [];
let ambientRunning = false;

function startAmbientMusic() {
  playGameMusic(); // MP3 oyun müziğine geç — başka ses üretilmez
}

function playAmbientLayer() { /* Kaldırıldı — sadece MP3 müzik kullanılıyor */ }

function stopAmbientMusic() {
  playMenuMusic(); // Game Over / Restart → MP3 menü müziğine geri dön
  ambientRunning = false;
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
      provinceLoyalty, savasSonucSchedule: _savasSonucSchedule, eyaletIsyanSchedule: _eyaletIsyanSchedule,
      sultanFavorSchedule: _sultanFavorSchedule, sultanFavorTurns: _sultanFavorTurns,
      lastEasterEggAt: _lastEasterEggAt, lastSultanCardAt: _lastSultanCardAt,
      golgeShownThisGame: _golgeShownThisGame,
      halkSevgisiShownThisGame: _halkSevgisiShownThisGame,
      casusAgiShownThisGame: _casusAgiShownThisGame,
      mektup1Shown: _mektup1Shown, mektup2Shown: _mektup2Shown,
      mektup3Shown: _mektup3Shown, mektup4Shown: _mektup4Shown,
      golgeThreshold: _golgeThreshold, mirasThreshold: _mirasThreshold,
      mektup1Threshold: _mektup1Threshold, mektup2Threshold: _mektup2Threshold,
      mektup3Threshold: _mektup3Threshold, mektup4Threshold: _mektup4Threshold,
      ramazanShownThisGame: _ramazanShownThisGame,
      easterPargaliDone: _easterPargaliDone,
      hekimDinlenme20Shown: _hekimDinlenme20Shown,
      secondChanceOfferedThisGame: _secondChanceOfferedThisGame,
      receivedLetters,
      muneccimN: _muneccimN, muneccimAt: _muneccimAt,
      timedUsedYear: _timedUsedYear,
      ferman: _ferman, fermanStreak: _fermanStreak, fermanDone: _fermanDoneThisGame, fermanTotal: _fermanTotalThisGame,
      relPoints, relRescued: _relRescued, relKomploAt: _relKomploAt, relKomploDone: _relKomploDone, divanYear: _divanYear, divanUsed: _divanUsed,
      chronicle,
      v: 3
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
  isPaywalled = false; // kayıtlar her zaman paywall tetiklenmeden önce alınır, savunma amaçlı sıfırlama
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
  // Eski kayıtlarda bozuk biçimli hain anahtarı olabilir (27 Eylül 2026 öncesi)
  const _legacyTraitorKeys = { "3-Seyhulislam": "3-seyhulislam", "4. Defterdar": "4-defterdar",
    "5. Valide Sultan": "5-valide-sultan", "6. Kaptan-ı Derya": "6-kaptan-i-derya",
    "7. Yabancı Elçi": "7-yabanci-elci", "8. Rakip Vezir": "8-rakip-vezir" };
  hiddenTraitor = _legacyTraitorKeys[s.hiddenTraitor] || s.hiddenTraitor;
  scheduledCards = s.scheduledCards || [];
  forcedQueue = (s.forcedQueueIds || []).map(id => allCards.find(c => c.id === id)).filter(Boolean);
  _sultanWarningShown = s.sultanWarningShown || false;
  provinceLoyalty = s.provinceLoyalty || { rumeli:50, anadolu:50, misir:50, dogu:50, akdeniz:50 };
  _savasSonucSchedule = s.savasSonucSchedule || null;
  _eyaletIsyanSchedule = s.eyaletIsyanSchedule || [];
  _sultanFavorSchedule = s.sultanFavorSchedule || [];
  _sultanFavorTurns = s.sultanFavorTurns || 0;
  _lastEasterEggAt = s.lastEasterEggAt ?? -999;
  _lastSultanCardAt = s.lastSultanCardAt ?? -999;
  _golgeShownThisGame = s.golgeShownThisGame || false;
  _halkSevgisiShownThisGame = s.halkSevgisiShownThisGame || false;
  _casusAgiShownThisGame = s.casusAgiShownThisGame || false;
  _mektup1Shown = s.mektup1Shown || false;
  _mektup2Shown = s.mektup2Shown || false;
  _mektup3Shown = s.mektup3Shown || false;
  _mektup4Shown = s.mektup4Shown || false;
  _golgeThreshold = s.golgeThreshold || _golgeThreshold;
  _mirasThreshold = s.mirasThreshold || _mirasThreshold;
  _mektup1Threshold = s.mektup1Threshold || _mektup1Threshold;
  _mektup2Threshold = s.mektup2Threshold || _mektup2Threshold;
  _mektup3Threshold = s.mektup3Threshold || _mektup3Threshold;
  _mektup4Threshold = s.mektup4Threshold || _mektup4Threshold;
  _ramazanShownThisGame = s.ramazanShownThisGame || false;
  _easterPargaliDone = s.easterPargaliDone || false;
  _hekimDinlenme20Shown = s.hekimDinlenme20Shown || false;
  _secondChanceOfferedThisGame = s.secondChanceOfferedThisGame || false;
  receivedLetters = s.receivedLetters || 0;
  _muneccimN = s.muneccimN || 0; _muneccimAt = s.muneccimAt ?? -999;
  _timedUsedYear = s.timedUsedYear || 0;
  _ferman = s.ferman || null; _fermanStreak = s.fermanStreak || 0; _fermanQueue = []; _fermanShowing = false;
  _fermanDoneThisGame = s.fermanDone || 0; _fermanTotalThisGame = s.fermanTotal || 0;
  setTimeout(_renderFermanChip, 0);
  relPoints = s.relPoints || {}; _relRescued = s.relRescued || {}; _relKomploAt = s.relKomploAt || {}; _relKomploDone = s.relKomploDone || {};
  _divanYear = s.divanYear || 0; _divanUsed = s.divanUsed || [];
  chronicle = Array.isArray(s.chronicle) ? s.chronicle : [];
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
  const seasonLabel = getSeasonLabel();
  yearLabel.textContent = `${monthName} ${hicriYear} · ${seasonLabel}`;
}

function advanceHicriMonth() {
  hicriMonth++;
  if (hicriMonth >= 12) {
    hicriMonth = 0;
    hicriYear++;
  }
  updateYearLabel();

  // Ramazan ayı — oyun-içi Hicri takvim döngüsünde bir kez, özel bir karar kartı
  if (hicriMonth === 8 && !_ramazanShownThisGame && !isGameOver) {
    _ramazanShownThisGame = true;
    const ramazanCard = allCards.find(c => c.id === 'ramazan_ayi_1');
    if (ramazanCard) forcedQueue.push(ramazanCard);
  }
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
  _renderChallengeChip(fb);
  if (!scheduledCards.length) return;

  // Group by cardId
  const groups = {};
  scheduledCards.forEach(sc => {
    const c = allCards.find(x => x.id === sc.cardId);
    const label = c ? (c.character_name || sc.cardId) : sc.cardId;
    if (!groups[label]) groups[label] = 0;
    groups[label]++;
  });

  const _en = window.LANG === 'en';
  scheduledCards.forEach(sc => {
    const remaining = Math.max(0, sc.afterCardsPlayed - cardsPlayed);
    const chip = document.createElement("div");
    chip.className = "fate-thread" + (sc.revealed ? " revealed" : "");
    chip.textContent = `⧖ ${remaining} ${_en ? (remaining === 1 ? "card" : "cards") : "kart"}`;
    // Bilinmezlik korunuyor — dokununca Kâtibin Notu açılır (reklam / 1 akçe)
    chip.title = _en ? `The echo of a decision arrives in ${remaining} cards…` : `Bir kararının yankısı ${remaining} kart içinde gelecek…`;
    chip.addEventListener('click', () => showKatibNotu(sc));
    fb.appendChild(chip);
  });
}

// ── Kâtibin Notu (27 Eylül 2026) ───────────────────────────────────────
// Üstteki "⧖ N kart" göstergesine dokununca: bekleyen sonucu reklamla ya da
// 1 akçeyle öğren — hangi karardan, kimden, en çok hangi gücü etkileyeceği ve
// genel yönü. Sadece bilgi verir (oyunu değiştirmez). Açılan not kaydedilir.
function _katibAnalysis(sc) {
  const en = window.LANG === 'en';
  const c = allCards.find(x => x.id === sc.cardId);
  if (!c) return null;
  const sum = (fx) => Object.values(fx || {}).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
  const L = sum(c.left_effects), R = sum(c.right_effects);
  const tone = (L >= 0 && R >= 0) ? "good" : (L <= 0 && R <= 0) ? "bad" : "mixed";
  const tot = {};
  [c.left_effects, c.right_effects].forEach(fx => Object.entries(fx || {}).forEach(([k, v]) => { if (typeof v === "number") tot[k] = (tot[k] || 0) + Math.abs(v); }));
  const top = Object.entries(tot).sort((a, b) => b[1] - a[1])[0];
  const names = { saray: ["Saray'ı", "Palace"], "yeniçeri": ["Ordu'yu", "Army"], ulema: ["Ulema'yı", "Clergy"], hazine: ["Hazine'yi", "Treasury"] };
  return {
    who: (en && c.character_name_en) ? c.character_name_en : c.character_name,
    knot: !!c.knot_of,
    stat: top ? names[top[0]][en ? 1 : 0] : null,
    tone,
    toneText: en ? { good: "It looks favourable.", bad: "It looks dangerous.", mixed: "The outcome will depend on your choice." }[tone]
                 : { good: "Hayırlı görünüyor.", bad: "Tehlikeli görünüyor.", mixed: "Sonucu vereceğiniz karara bağlı." }[tone],
  };
}
function showKatibNotu(sc, opts) {
  opts = opts || {};
  if (document.getElementById("katib-overlay")) return;
  if (!scheduledCards.includes(sc)) return;
  const en = window.LANG === 'en';
  const esc = (t) => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const overlay = document.createElement("div");
  overlay.id = "katib-overlay";
  const close = () => { overlay.classList.remove("visible"); setTimeout(() => overlay.remove(), 220); };
  const render = () => {
    const n = Math.max(0, sc.afterCardsPlayed - cardsPlayed);
    const when = en ? `in ${n} ${n === 1 ? "card" : "cards"}` : `${n} kart sonra`;
    let body;
    if (sc.revealed) {
      const a = _katibAnalysis(sc) || {};
      const src = sc.src ? `<div class="kn-src">“${esc(en ? sc.src.en : sc.src.tr)}”</div>` : "";
      body = `<div class="kn-paper">
          ${src}
          <div class="kn-line">${en ? "Its result arrives" : "Sonucu"} <b>${when}</b>${en ? "" : " gelecek"}${a.who ? (en ? `, brought by the <b>${esc(a.who)}</b>.` : `; <b>${esc(a.who)}</b> getirecek.`) : "."}</div>
          ${a.stat ? `<div class="kn-line">${en ? "It will weigh most on the" : "En çok"} <b>${esc(a.stat)}</b>${en ? "." : " etkileyecek."}</div>` : ""}
          <div class="kn-tone ${a.tone || ""}">${esc(a.toneText || "")}</div>
        </div>`;
    } else {
      const bal = getAkceBalance();
      const lead = opts.astrologer
        ? (en ? `The stars show the echo of one of your decisions ${when}. The astrologer can read which one.` : `Yıldızlar bir kararınızın yankısını ${when} gösteriyor. Müneccimbaşı hangisi olduğunu okuyabilir.`)
        : (en ? `The echo of one of your decisions arrives ${when}. The scribe knows which one.` : `Bir kararınızın yankısı ${when} gelecek. Kâtip hangisi olduğunu biliyor.`);
      body = `<div class="kn-lead">${lead}</div>
        <div class="kn-btns">
          <button class="kn-ad">${en ? "Watch Ad" : "Reklam İzle"}</button>
          <button class="kn-akce">${bal >= 1 ? (en ? "1 Akce" : "1 Akçe") : (en ? "Get Akce" : "Akçe Al")} <span class="kn-bal">(${bal})</span></button>
        </div>
        <div class="kn-msg"></div>`;
    }
    const title = opts.astrologer ? (en ? "THE CHIEF ASTROLOGER" : "MÜNECCİMBAŞI") : (en ? "THE SCRIBE'S NOTE" : "KÂTİBİN NOTU");
    overlay.innerHTML = `<div id="katib-box"><div class="kn-title">${title}</div>${body}<button class="kn-close">${en ? "Close" : "Kapat"}</button></div>`;
    overlay.querySelector(".kn-close").onclick = close;
    if (sc.revealed) return;
    const msg = overlay.querySelector(".kn-msg");
    const lock = (on) => overlay.querySelectorAll(".kn-btns button").forEach(b => b.disabled = on);
    const reveal = () => { if (!scheduledCards.includes(sc)) { close(); return; } sc.revealed = true; if (typeof saveGameState === "function" && !isGameOver) saveGameState(); updateFateBar(); render(); };
    overlay.querySelector(".kn-ad").onclick = () => {
      lock(true); msg.textContent = "";
      RewardedAds.show(() => { if (document.body.contains(overlay)) reveal(); }, () => { lock(false); msg.textContent = en ? "The ad could not be shown." : "Reklam gösterilemedi."; });
    };
    overlay.querySelector(".kn-akce").onclick = () => {
      if (spendAkce(1)) { reveal(); return; }
      close(); redirectToAkcePurchase(() => showKatibNotu(sc, opts));
    };
  };
  render();
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));
}

// ── Müneccimbaşı (27 Eylül 2026) ───────────────────────────────────────
// En az 2 sonuç beklerken (henüz okunmamış) gelir ve en yakın olanı okur.
// Oyun başına en çok 2 kez: ilki bedava, ikincisi Kâtibin Notu gibi reklam
// ya da 1 akçe. Sayaçlar kayıtla birlikte saklanır (muneccimN/At).
const MUNECCIM_MIN_CARDS = 20, MUNECCIM_GAP = 30, MUNECCIM_MAX = 2, MUNECCIM_CHANCE = 0.35;
let _muneccimN = 0, _muneccimAt = -999; // bu oyundaki ziyaret sayısı / son ziyaret kartı
function _muneccimTargets() {
  return scheduledCards.filter(sc => !sc.revealed && sc.src && sc.afterCardsPlayed - cardsPlayed >= 3)
    .sort((a, b) => a.afterCardsPlayed - b.afterCardsPlayed);
}
function _maybeQueueMuneccim() {
  const n = _muneccimN;
  if (n >= MUNECCIM_MAX || cardsPlayed < MUNECCIM_MIN_CARDS) return;
  if (cardsPlayed - _muneccimAt < MUNECCIM_GAP) return;
  if (forcedQueue.length) return;
  if (_muneccimTargets().length < 2) return;
  if (Math.random() >= MUNECCIM_CHANCE) return;
  const card = allCards.find(x => x.id === (n === 0 ? "muneccim_fal_1" : "muneccim_fal_2"));
  if (!card) return;
  _muneccimN = n + 1;
  _muneccimAt = cardsPlayed;
  forcedQueue.push(card);
}
function _muneccimRead(cardId, dir) {
  if (dir !== "right") return;
  const sc = _muneccimTargets()[0] || scheduledCards.find(x => !x.revealed && x.afterCardsPlayed > cardsPlayed);
  if (!sc) return;
  if (cardId === "muneccim_fal_1") { sc.revealed = true; updateFateBar(); } // ilki bedava
  setTimeout(() => { if (!isGameOver && !isPaywalled && scheduledCards.includes(sc)) showKatibNotu(sc, { astrologer: true }); }, 450);
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

// ── Birleşik Sonuç (Düğüm) ────────────────────────────────────────
// İki gecikmeli sonuç birbirine KNOT_WINDOW kart kadar yakın zamana denk
// gelirse, ayrı ayrı gelmek yerine onları birlikte anlatan tek bir kart gelir.
// Hangi çiftlerin birleşeceği veriden okunur: cards.json'da "knot_of": [A, B]
// alanı olan kart, A ve B sonuçlarının birleşik hâlidir.
const KNOT_WINDOW = 8;
// Tematik çekim: bir sonuç beklerken, onunla birleşebilecek diğer sonucun
// KAYNAK kartı destede bu kat daha olası çekilir (ör. Ceneviz borcu alındıysa
// bankacının borç teklifi yakında gelir). Simülasyon (26 Eylül 2026, gerçek
// kart ağırlıklarıyla): çekim olmadan birleşme oyunların ~%4'ünde görülüyordu;
// pencere 8 + 25x ile 5 yıllık oyunda ort. ~1,2 birleşme, oyunların ~%71'i.
const KNOT_PULL_BOOST = 25;

// sonuç kartı id → onu doğurabilen kaynak kart id'leri (bir kez hesaplanır)
let _consequenceSources = null;
function _getConsequenceSources() {
  if (_consequenceSources && _consequenceSources._n === allCards.length) return _consequenceSources;
  const m = { _n: allCards.length };
  const add = (cid, sid) => { (m[cid] = m[cid] || []).includes(sid) || m[cid].push(sid); };
  allCards.forEach(c => ["left", "right"].forEach(side => { const t = c["triggers_on_" + side]; if (t) add(t, c.id); }));
  CHAIN_RULES.forEach(r => allCards.forEach(c => {
    if ([...(c.left_flags_set || []), ...(c.right_flags_set || [])].includes(r.flag)) add(r.cardId, c.id);
  }));
  return (_consequenceSources = m);
}

// Şu an destede güçlendirilecek kaynak kartlar
function _knotPullSources() {
  const out = new Set();
  if (!scheduledCards.length) return out;
  const pending = new Set(scheduledCards.map(sc => sc.cardId));
  const srcMap = _getConsequenceSources();
  allCards.forEach(k => {
    if (!Array.isArray(k.knot_of) || k.knot_of.length !== 2) return;
    if ((k.excluded_flags || []).some(f => activeFlags[f])) return;
    const [a, b] = k.knot_of;
    if (pending.has(a) && !pending.has(b)) (srcMap[b] || []).forEach(id => out.add(id));
    if (pending.has(b) && !pending.has(a)) (srcMap[a] || []).forEach(id => out.add(id));
  });
  return out;
}

function _findKnotCard(idA, idB) {
  return allCards.find(k => Array.isArray(k.knot_of) && k.knot_of.length === 2 &&
    k.knot_of.includes(idA) && k.knot_of.includes(idB) && idA !== idB);
}

// Birleşen sonuçlar bir daha ayrıca (zamanlı ya da rastgele) gelmesin:
// kartın kendi "çözüldü" bayraklarını (hem set ettiği hem excluded olan) aç.
function _consumeConsequence(c) {
  const sets = new Set([...(c.left_flags_set || []), ...(c.right_flags_set || [])]);
  (c.excluded_flags || []).forEach(f => { if (sets.has(f)) activeFlags[f] = true; });
}

// ── Sonuç kartında mühür damgası (28 Eylül 2026) ─────────────────────
// Gecikmeli bir sonuç kartı gelince kart her zamanki gibi gelir; ~0,5 sn
// sonra portrenin köşesine balmumu mühür vurulur (halka + titreşim) ve
// portrenin altındaki kırmızı şeritte hangi karardan, ne kadar önce geldiği
// yazar. Birleşik kartta yok (kendi görünümü var). Oyuncu hiçbir şey yapmaz,
// kart hemen kaydırılabilir.
let _stampMeta = new Map(); // sonuç kartı nesnesi → { src, at }
function _hideConsequenceStamp() {
  ["card-stamp", "card-stamp-ring", "card-stamp-band"].forEach(id => document.getElementById(id)?.classList.remove("go"));
  clearTimeout(card._stampT);
}
function _stampAgoText(n, en) {
  if (n >= CARDS_PER_YEAR) { const y = Math.floor(n / CARDS_PER_YEAR); return en ? `${y} ${y === 1 ? "year" : "years"} ago` : `${y} yıl önce`; }
  return en ? `${n} ${n === 1 ? "card" : "cards"} ago` : `${n} kart önce`;
}
function _playConsequenceStamp(c, meta) {
  const seal = document.getElementById("card-stamp"), ring = document.getElementById("card-stamp-ring"), band = document.getElementById("card-stamp-band");
  if (!seal || !ring || !band) return;
  const en = window.LANG === 'en';
  const src = meta && meta.src ? (en ? meta.src.en : meta.src.tr) : "";
  const ago = (meta && typeof meta.at === "number") ? _stampAgoText(Math.max(1, cardsPlayed - meta.at), en) : "";
  seal.querySelector("i").textContent = en ? "RESULT" : "SONUÇ";
  const esc = (t) => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const agoHTML = ago ? ` <span class="csb-ago">· ${esc(ago)}</span>` : "";
  band.innerHTML = src
    ? (en ? `Your decision “${esc(src)}”${agoHTML}` : `“${esc(src)}” kararınız${agoHTML}`)
    : esc(en ? "The result of a past decision" : "Geçmiş bir kararınızın sonucu");
  card._stampT = setTimeout(() => {
    if (currentCard !== c) return;
    // Kısa portrede (küçük ekran) küçük mühür + sıkı şerit, üst üste binmesin
    card.classList.toggle("stamp-compact", cardImage.offsetHeight < 190);
    // Şerit portrenin alt kenarına oturur (portre yüksekliği ekrana göre değişir)
    band.style.top = Math.max(0, cardImage.offsetTop + cardImage.offsetHeight - band.offsetHeight - 6) + "px";
    seal.classList.add("go"); ring.classList.add("go"); band.classList.add("go");
    setTimeout(() => { if (currentCard === c && typeof Haptics !== "undefined" && Haptics.tap) Haptics.tap(); }, 380);
  }, 500);
}

function checkScheduledCards() {
  const due = scheduledCards.filter(sc => cardsPlayed >= sc.afterCardsPlayed);
  scheduledCards = scheduledCards.filter(sc => cardsPlayed < sc.afterCardsPlayed);
  const consumed = new Set();
  due.forEach(sc => {
    if (consumed.has(sc)) return;
    const c = _resolveDueConsequence(sc);
    if (!c) return;
    // Birleşme adayı: vadesi gelmiş ya da KNOT_WINDOW içinde gelecek başka bir sonuç
    const candidates = due.concat(scheduledCards).filter(o =>
      o !== sc && !consumed.has(o) && o.afterCardsPlayed <= cardsPlayed + KNOT_WINDOW);
    for (const other of candidates) {
      const knot = _findKnotCard(sc.cardId, other.cardId);
      if (!knot) continue;
      if ((knot.excluded_flags || []).some(f => activeFlags[f])) continue;
      const oc = _resolveDueConsequence(other);
      if (!oc) continue;
      consumed.add(sc); consumed.add(other);
      scheduledCards = scheduledCards.filter(x => x !== other);
      _consumeConsequence(c); _consumeConsequence(oc);
      forcedQueue.unshift(knot);
      return;
    }
    _stampMeta.set(c, { src: sc.src, at: sc.at }); // gelince mühür damgası vurulsun
    forcedQueue.unshift(c);
  });
  updateFateBar();
}

function getEligible() {
  const knotPull = _knotPullSources();
  return allCards.filter(c => {
    if (c.is_pasa_terfi && (!isPasaMode || pasaPromoted)) return false;
    if (c.is_event) return false;
    if (c.arc_id) return false;
    if (c.is_traitor_reveal) return false;
    if (c.type === "letter") return false;
    // Zamanı gelince zaten gelecek bir sonuç, beklerken rastgele çekilmesin
    // (yoksa erken gelip hem zamanlamayı hem birleşik sonucu bozuyordu)
    if (scheduledCards.some(sc => sc.cardId === c.id)) return false;
    // Hain ipucu sadece hain henüz açıklanmadıysa (60. kartta açıklanır)
    if (c.id === "genc_hain_ipucu" && (!hiddenTraitor || traitorRevealed || cardsPlayed >= 55)) return false;
    // Faction baskı kartları sadece tetiklenince
    if (c.required_faction_pressure && !activeFlags["faction_pressure_" + c.required_faction_pressure]) return false;
    // weight:1 özel kartlar arc dışında çıkmasın
    if (c.weight === 1 && !c.arc_id) return false;
    // Sultan kartları: ilk 3 yıl çıkmasın, kriz/rahat anda gelsin, ve bir öncekinden
    // en az 20 kart sonra gelsin (yoksa denge uzun süre bozuk kalınca art arda gelebiliyordu)
    if (c.character === "1-sultan") {
      if (year < 3) return false;
      if (cardsPlayed - _lastSultanCardAt < 20) return false;
      const avg = Object.values(stats).reduce((a,b)=>a+b,0)/4;
      if (avg > 38 && avg < 62) return false; // Dengeli — sultan rahatsız etmez
    }
    // Gece kartları gece önceliği (ama hepsi karışabilir)
    if (c.time === "night" && !isNight) return false;
    return passesFilters(c);
  }).map(c => {
    const times = playCounts[c.id] || 0;
    let w = c.weight || 10;
    if (times > 0) w = Math.max(1, Math.floor(w / (times * 2)));
    // Çekim sadece bu oyunda henüz hiç çıkmamış kaynak karta: oyuncu kartı
    // görüp diğer seçeneği seçtiyse aynı kart arka arkaya geri gelmesin
    if (times === 0 && knotPull.has(c.id)) w = w * KNOT_PULL_BOOST;
    if (w !== (c.weight || 10)) return { ...c, weight: w };
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
  const seasonFx = SEASON_EFFECTS[getCurrentSeason()] || {};
  const getW = (c) => {
    const base = c.weight || 10;
    const cat  = c.category || '';
    const fx   = seasonFx[cat] || 1.0;
    return Math.max(1, Math.round(base * fx));
  };
  const total = cards.reduce((s, c) => s + getW(c), 0);
  let roll = Math.random() * total;
  for (const c of cards) {
    roll -= getW(c);
    if (roll <= 0) { playCounts[c.id] = (playCounts[c.id] || 0) + 1; return c; }
  }
  const last = cards[cards.length - 1];
  playCounts[last.id] = (playCounts[last.id] || 0) + 1;
  return last;
}

// ── Deneyimli Mod: kart üstünde etki yönü önizlemesi ──────────────
const PREVIEW_STAT_ICON = {
  saray: 'assets/icons/icon-saray.png',
  "yeniçeri": 'assets/icons/icon-ordu.png',
  ulema: 'assets/icons/icon-ulema.png',
  hazine: 'assets/icons/icon-hazine.png',
};
function getEffectPreviewHTML(effects) {
  const parts = [];
  for (const [k, v] of Object.entries(effects || {})) {
    if (k === 'sultanSabir' || !v) continue;
    const icon = PREVIEW_STAT_ICON[k] || '';
    const cls = v > 0 ? 'fx-up' : 'fx-down';
    const arrow = v > 0 ? '▲' : '▼';
    parts.push(`<span class="fx-chip ${cls}">${icon ? `<img src="${icon}" alt="">` : ''}${arrow}</span>`);
  }
  return parts.length ? `<span class="fx-preview">${parts.join('')}</span>` : '';
}

// ── Card Display ──────────────────────────────────────────────────
let currentCard = null;

// Karakter görsel versiyonu sistemi
// MADDE 7: Belli karakterler yıllar içinde görsel değiştiriyor (v2 dosyası gerekir)
// MADDE 8: Vatandaş (halk_temsilcisi) için farklı görseller rastgele seçilir
// ── Yaşlanan portreler (27 Eylül 2026) ─────────────────────────────────
// Listedeki karakterlerin portresi yıllar geçtikçe hafifçe solar/sepyaya
// döner (1 → AGING_TINT_MAX_YEAR. yıl, CSS değişkeni --age-f, tehlike/bolluk
// filtreleriyle birlikte çalışır); AGING_V2_YEAR. yıldan sonra ikinci
// (yaşlı) portreye geçer. O oyunda yaşlı hâliyle ilk gelişinde genç portre
// yaşlıya yumuşakça dönüşür (#card-image-age). Yeni karakter eklemek için
// assets/characters/<anahtar>_v2.jpg dosyasını koyup buraya satır ekle —
// dosyası olmayan satır EKLEME (portre boş kalır).
const AGING_V2_YEAR = 10;
const AGING_TINT_MAX_YEAR = 20;
const CHARACTER_EVOLUTIONS = {
  "9-cellat":         { version: "9-cellat_v2" },
  "2-yeniceri":       { version: "2-yeniceri_v2" },
  // 28 Eylül 2026: kullanıcının ürettiği yaşlı portreler
  "14-casuslar_basi": { version: "14-casuslar_basi_v2" },
  "3-seyhulislam":    { version: "3-seyhulislam_v2" },
  "4-defterdar":      { version: "4-defterdar_v2" },
  "5-valide-sultan":  { version: "5-valide-sultan_v2" },
  "6-kaptan-i-derya": { version: "6-kaptan-i-derya_v2" },
  "8-rakip-vezir":    { version: "8-rakip-vezir_v2" },
};
let _agedSeenThisGame = new Set();
function _agingTint(key) {
  if (!CHARACTER_EVOLUTIONS[key]) return "";
  const t = Math.min(1, Math.max(0, (year - 1) / (AGING_TINT_MAX_YEAR - 1)));
  return t > 0 ? `saturate(${(1 - t * .25).toFixed(3)}) sepia(${(t * .18).toFixed(3)})` : "";
}
function _hideAgeOverlay() {
  const o = document.getElementById("card-image-age");
  if (o) { o.classList.remove("visible", "fade"); o.removeAttribute("src"); }
}
// Yaşlı portre ilk kez gösterilirken: genç portre üstte başlar, yavaşça söner
function _playAgingReveal(key, c) {
  const o = document.getElementById("card-image-age");
  if (!o || _agedSeenThisGame.has(key)) return;
  _agedSeenThisGame.add(key);
  const pre = new Image();
  pre.onload = () => {
    if (currentCard !== c) return;
    o.src = pre.src; o.classList.remove("fade"); o.classList.add("visible");
    requestAnimationFrame(() => setTimeout(() => { if (currentCard === c) o.classList.add("fade"); }, 700));
  };
  pre.src = "assets/characters/" + encodeURIComponent(key + ".jpg");
}

// Yeni karakterlerin portresi henüz eklenmediyse (dosya yoksa) benzer bir
// portre gösterilir — görsel gelince kod değişmeden kendi portresi çıkar.
const CHARACTER_IMAGE_FALLBACK = {
  "muneccimbasi":      "31-dogu-alim",
  "celali-reisi":      "18-yeniceri_isyancisi",
  "surgun-genc":       "29-ajan",
  "ceneviz-podestasi": "7-yabanci-elci",
  "hint-tabibi":       "10-hekimbasi",
};
// <img> için: asıl dosya yüklenemezse bir kez yedeğe geçer, o da yoksa gizler
function _setPortraitWithFallback(img, key, onFail) {
  const fb = CHARACTER_IMAGE_FALLBACK[key];
  img.onerror = () => {
    if (fb && !img.dataset.fbTried) { img.dataset.fbTried = "1"; img.src = "assets/characters/" + encodeURIComponent(fb + ".jpg"); return; }
    img.onerror = null; if (onFail) onFail();
  };
  delete img.dataset.fbTried;
  img.src = "assets/characters/" + encodeURIComponent(key + ".jpg");
}

// Vatandaş için birden fazla görsel (2-3-4 eklenebilir)
const HALK_TEMSILCISI_VARIANTS = [
  "15-halk_temsilcisi",
  "15-halk_temsilcisi_2",
  "15-halk_temsilcisi_3",
  "15-halk_temsilcisi_4",
];
// Oyun boyunca her vatandaş kartında rastgele bir görsel seç
let _halkTemsilcisiCurrent = 0;

// Birleşik sonuç kartı: iki karakterin portresi çapraz bölünmüş gösterilir,
// kartın üstünde "iki kararınız aynı gün geri döndü" satırı çıkar.
// Asıl görsel (#card-image) knot_characters[0] ile normal yoldan yüklenir;
// ikinci portre üstüne, sağ-çapraz yarıya kırpılarak bindirilir.
function renderKnotVisual(c) {
  const knotImg = document.getElementById("card-image-knot");
  const seam    = document.getElementById("card-knot-seam");
  const kicker  = document.getElementById("card-knot-kicker");
  const isKnot  = !!(c && Array.isArray(c.knot_characters) && c.knot_characters.length === 2);
  card.classList.toggle("knot-card", isKnot);
  if (!knotImg || !seam || !kicker) return;
  if (!isKnot) {
    knotImg.classList.remove("visible"); knotImg.removeAttribute("src");
    seam.classList.remove("visible");
    kicker.classList.remove("visible"); kicker.textContent = "";
    return;
  }
  kicker.textContent = window.LANG === 'en'
    ? "Two of your decisions returned on the same day."
    : "İki kararınız aynı gün geri döndü.";
  kicker.classList.add("visible");
  _knotIdsSeenThisGame.add(c.id);
  knotImg.classList.remove("visible");
  seam.classList.remove("visible");
  const src = "assets/characters/" + encodeURIComponent(c.knot_characters[1] + ".jpg");
  const pre = new Image();
  pre.onload = () => {
    if (currentCard !== c) return; // bu arada başka kart geldiyse uygulama
    knotImg.src = src; knotImg.classList.add("visible"); seam.classList.add("visible");
  };
  pre.src = src;
}

function getCharacterImageName(key) {
  // Vatandaş: görseller arasında döner
  if (key === "15-halk_temsilcisi") {
    const idx = Math.floor(Math.random() * HALK_TEMSILCISI_VARIANTS.length);
    return HALK_TEMSILCISI_VARIANTS[idx];
  }

  // Yaşlanan portre: AGING_V2_YEAR. yıldan sonra ikinci portre
  const evo = CHARACTER_EVOLUTIONS[key];
  if (evo && year >= AGING_V2_YEAR) return evo.version;

  return key;
}

function dealNext() {
  if (isGameOver) return;
  // Değişmez kural: Tam Sürüm yoksa 3. yıl ASLA oynanmaz. advanceYear zaten
  // 2. yıl sonunda durduruyor; bu ikinci kilit eski kayıtları (1.5.0'da sınır 3
  // yıldı, 3. yılda kaydedilmiş oyun) ve gözden kaçan her yolu yakalar.
  if (_freeYearLimitReached()) { _enforceFreeYearLimit(); return; }
  _effectShimmer(null);
  _stopFuse();
  if (!_ferman && !isPaywalled && selectedSultan) _fermanNew(true); // yılın fermanı (ilk kart / yeni yıl)
  renderKnotVisual(null); // özel kart tiplerinde birleşik görünüm kalmasın
  _hideAgeOverlay(); card.style.removeProperty("--age-f");
  _hideConsequenceStamp();
  _setSideTabs(null); // özel (butonlu) kartlarda kenar sekmeleri gizli
  _hideInvestigateBtn();   // özel kart tiplerinde önceki kartın soruşturma düğmesi kalmasın
  _hideEasterChoices();
  _hideCriticalOffer();

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
        try { showItemExpiredToast(expiredId); } catch (e) { console.warn('expired toast', e); } // görsel uyarı kart akışını asla durdurmasın
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
  if (c.character === "1-sultan") _lastSultanCardAt = cardsPlayed;

  _renderCardRel(null);
  // Divan Oturumu (3 Ekim 2026)
  if (c.type === "divan") {
    showDivanOturumu(c);
    return;
  }

  // Easter egg kartı
  if (c.type === "easter") {
    showEasterCard(c);
    return;
  }

  // Müzakere kartı
  if (c.type === "negotiation") {
    showNegotiationCard(c);
    return;
  }

  // Mektup kartı (sultan mektupları dahil — kendi tipine göre önce bu yakalar)
  if (c.type === "letter") {
    showLetterCard(c);
    return;
  }

  // Şans kartı
  if (c.type === "chance") {
    hideNegotiationPanel();
    const key = c.character || "";
    cardImage.style.visibility = "hidden";
    const _cpLoad = new Image();
    _cpLoad.onload  = () => { cardImage.src = _cpLoad.src; cardImage.style.visibility = ""; };
    _cpLoad.onerror = () => { cardImage.style.visibility = "hidden"; };
    _cpLoad.src = "assets/characters/" + encodeURIComponent(key + ".jpg");
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

  // Sultan olay kartı — özel tipi olmayan (letter/chance/negotiation dışındaki)
  // 1-sultan kartları kendi gerçek metni/seçenekleriyle gösterilir
  if (c.character === "1-sultan") {
    showSultanEventCard(c);
    return;
  }

  hideNegotiationPanel();

  const key = c.character || "";
  deathCharacterKey = key;

  const imgName = getCharacterImageName(key) + ".jpg";
  const imgPath = "assets/characters/" + encodeURIComponent(imgName);
  const _tint = _agingTint(key);
  if (_tint) card.style.setProperty("--age-f", _tint);
  const _agedNow = !!CHARACTER_EVOLUTIONS[key] && imgName === CHARACTER_EVOLUTIONS[key].version + ".jpg";

  const _isEN = window.LANG === 'en';

  // Gizli hain hint
  let displayText = (_isEN && c.text_en) ? c.text_en : (c.text || "");
  // Sürgünden Dönen Genç'in istihbaratı: gizli hainin adını verir
  if (displayText.includes("{HAIN}")) displayText = displayText.split("{HAIN}").join(getCharacterDisplayName(hiddenTraitor, _isEN));
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

  // ── Karakter hafızası bazlı dinamik metin ──────────────────────
  if (key && characterMemory[key]) {
    const _mem  = characterMemory[key];
    const _left = _mem.left  || 0;
    const _rgt  = _mem.right || 0;
    const _tot  = _left + _rgt;

    // Yeniçeri Ağası — 3+ ret → daha tehditkar ton
    if (key === '2-yeniceri' && _left >= 3) {
      displayText += _isEN
        ? " — His voice was harder this time."
        : " — Bu kez sesi daha yüksekti.";
    }

    // Yeniçeri İsyancısı — 2+ ret → isyan tırmandı
    if (key === '18-yeniceri_isyancisi' && _left >= 2) {
      displayText += _isEN
        ? " — The unrest in the barracks had grown."
        : " — Kışladaki huzursuzluk büyümüştü.";
    }

    // Rakip Vezir — 4+ ziyaret toplam → gerilim ipucu
    if (key === '8-rakip-vezir' && _tot >= 4) {
      displayText += _isEN
        ? " — His smile had grown more knowing."
        : " — Gülümsemesi artık daha hesaplıydı.";
    }

    // Şeyhülislam — 3+ destek (sağ) → güvenli ton
    if (key === '3-seyhulislam' && _rgt >= 3) {
      displayText += _isEN
        ? " — He spoke with a familiar confidence."
        : " — Tanıdık bir özgüvenle konuştu.";
    }

    // Şehzade güç ipuçları (power 30+, genel atmosfer)
    if (sehzadePower >= 50 && sehzadePower < 70 && Math.random() < 0.25) {
      displayText += _isEN
        ? " — A distant shadow seemed to watch from the corridor."
        : " — Koridorun karanlığından bir gölge izliyor gibiydi.";
    }

    // Valide Sultan — 3+ destek → daha sahiplenici
    if (key === '5-valide-sultan' && _rgt >= 3) {
      displayText += _isEN
        ? " — She had grown more familiar with you."
        : " — Size karşı daha sahiplenici bir tavır aldı.";
    }

    // Halk Temsilcisi — 3+ ret → öfke birikmiş
    if (key === '15-halk_temsilcisi' && _left >= 3) {
      displayText += _isEN
        ? " — There was no patience left in the crowd."
        : " — Kalabalığın sabrı kalmamıştı.";
    }
  }

  charName.textContent = (_isEN && c.character_name_en) ? c.character_name_en : (c.character_name || "");
  _renderCardRel(c);
  cardText.textContent = displayText;
  const _leftTxt  = (_isEN && c.left_text_en)  ? c.left_text_en  : (c.left_text  || (_isEN ? "No"  : "Hayır"));
  const _rightTxt = (_isEN && c.right_text_en) ? c.right_text_en : (c.right_text || (_isEN ? "Yes" : "Evet"));
  _setSideTabs(_leftTxt, _rightTxt);
  if (window.previewMode && c.left_effects && c.right_effects) {
    choiceLeft.innerHTML  = _leftTxt  + getEffectPreviewHTML(c.left_effects);
    choiceRight.innerHTML = _rightTxt + getEffectPreviewHTML(c.right_effects);
  } else {
    choiceLeft.textContent  = _leftTxt;
    choiceRight.textContent = _rightTxt;
  }

  choiceLeft.style.opacity  = "0";
  choiceRight.style.opacity = "0";
  overlayL.style.opacity = "0";
  overlayR.style.opacity = "0";

  // Mektup stili kaldır
  card.classList.remove("letter-card");

  // Soruşturma düğmesi (gizli hain adaylarının kartlarında + investigate_text olan kartlarda)
  setupInvestigateBtn(c, displayText);
  setTimeout(maybeShowCriticalOffer, 650); // kart yerine oturduktan sonra

  renderKnotVisual(c);
  const _stamp = _stampMeta.get(c);
  if (_stamp) { _stampMeta.delete(c); if (!c.knot_of) _playConsequenceStamp(c, _stamp); }

  // Görseli yükle — hazır olunca göster, yoksa gizle (spinner çıkmasın)
  cardImage.removeAttribute("src");
  cardImage.style.visibility = "hidden";
  const preload = new Image();
  preload.onload = () => {
    cardImage.src = imgPath;
    cardImage.style.visibility = "";
    if (_agedNow && currentCard === c && !c.knot_of) _playAgingReveal(key, c); // birleşik kartta iki portre zaten bölünmüş
  };
  preload.onerror = () => {
    // Portresi henüz eklenmemiş yeni karakter → benzer bir portre
    const fb = CHARACTER_IMAGE_FALLBACK[key];
    if (fb && !preload.dataset.fbTried) {
      preload.dataset.fbTried = "1";
      const fbPath = "assets/characters/" + encodeURIComponent(fb + ".jpg");
      preload.onload = () => { if (currentCard === c) { cardImage.src = fbPath; cardImage.style.visibility = ""; } };
      preload.src = fbPath;
      return;
    }
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
  setTimeout(() => { if (currentCard === c) _maybeStartFuse(c); }, 450); // kart yerine oturduktan sonra
  if (c._sefer) _showSeferMap(c._sefer);
  updateDynamicSubtitle();
}

// ── Gizli Hain: soruşturma ─────────────────────────────────────────
// Oyun başında bu karakterlerden biri gizlice hain seçilir. Bu karakterlerin
// HER kartında soruşturma (büyüteç) açılabilir: hain soruşturulursa şüpheli,
// masum biri soruşturulursa masum bir ipucu çıkar — düğmenin varlığı haini
// ele vermez, oyuncu metne bakıp karar verir. 60. kartta hain açıklanır;
// hainin kartları en az 2 kez soruşturulduysa oyuncu onu fark etmiş sayılır.
// (Düğme v1.1'de kaldırılmıştı, mekanik fiilen hep kötü bitiyordu — 27 Eylül 2026)
const TRAITOR_CANDIDATES = ["2-yeniceri", "3-seyhulislam", "4-defterdar",
  "5-valide-sultan", "6-kaptan-i-derya", "7-yabanci-elci",
  "8-rakip-vezir", "10-hekimbasi", "11-sipahi_agasi",
  "12-saray_sairi", "13-buyuk_tuccar", "14-casuslar_basi",
  "15-halk_temsilcisi", "16-saray_agasi", "22-yahudi_bankaci",
  "24-korsanbasi", "25-deli_dervis", "26-genc_pasa"];

const TRAITOR_CLUES_SUSPICIOUS = [
  { tr: "Sözlerinin arasında bir duraksama var; konuşurken gözü sürekli kapıda.", en: "There is a hesitation in their words; their eyes keep drifting to the door." },
  { tr: "Kâtip, bu kişinin son aylarda Galata'da yabancılarla görüldüğünü not etmiş.", en: "The scribe notes that this person was seen with foreigners in Galata in recent months." },
  { tr: "Mühürlü mektuplarının bir kısmı Divan defterine hiç kaydedilmemiş.", en: "Some of their sealed letters were never entered in the Divan register." },
  { tr: "Hizmetkârı, geceleri saraydan gizli bir ulak çıktığını fısıldadı.", en: "A servant whispers that a secret courier leaves the palace at night." },
  { tr: "Anlattıkları geçen haftaki sözleriyle çelişiyor. Bir şey saklıyor.", en: "What they say contradicts last week's words. They are hiding something." },
];
const TRAITOR_CLUES_INNOCENT = [
  { tr: "Kayıtlar temiz. Sözleri önceki raporlarıyla tutarlı.", en: "The records are clean. Their words match earlier reports." },
  { tr: "Hizmetkârları onun hakkında kötü bir şey söylemiyor; bildiği işi yapıyor.", en: "Their servants say nothing ill of them; they simply do their work." },
  { tr: "Mektuplarının hepsi Divan defterine kayıtlı. Şüpheli bir iz yok.", en: "All their letters are in the Divan register. No suspicious trace." },
  { tr: "Tedirgin görünüyor ama sebebi belli: istediği şey gerçekten acil.", en: "They seem uneasy, but the reason is plain: their request truly is urgent." },
  { tr: "Casuslar Başı'nın notu kısa: 'Bu konuda endişe edecek bir şey yok.'", en: "The Spymaster's note is short: 'Nothing to worry about here.'" },
];
const ICON_INVESTIGATE = _gi('<circle cx="10.5" cy="10.5" r="6" stroke="currentColor" stroke-width="1.9"/><path d="M15 15L20 20" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>');
const ICON_INVESTIGATE_BACK = _gi('<path d="M10 6.5L5.5 11l4.5 4.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 11H14a4.5 4.5 0 0 1 0 9h-2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>');

// Aynı kart her açılışta aynı ipucunu versin (kart id'sinden sabit seçim)
function _traitorClueFor(c) {
  const pool = c.character === hiddenTraitor ? TRAITOR_CLUES_SUSPICIOUS : TRAITOR_CLUES_INNOCENT;
  let h = 0;
  for (const ch of String(c.id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const clue = pool[h % pool.length];
  return window.LANG === 'en' ? clue.en : clue.tr;
}

function _hideInvestigateBtn() {
  const b = document.getElementById("investigate-btn");
  if (b) { b.classList.add("hidden"); b.onclick = null; }
}

function setupInvestigateBtn(c, displayText) {
  let btn = document.getElementById("investigate-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "investigate-btn";
    // Düğmeye dokunmak kart sürüklemeyi başlatmasın (kart mousedown/touchstart dinliyor)
    btn.addEventListener("mousedown", e => e.stopPropagation());
    btn.addEventListener("touchstart", e => e.stopPropagation(), { passive: true });
    card.appendChild(btn);
  }
  const isEN = window.LANG === 'en';
  const setIcon = (back) => {
    btn.innerHTML = back ? ICON_INVESTIGATE_BACK : ICON_INVESTIGATE;
    btn.title = back ? (isEN ? "Back" : "Geri") : (isEN ? "Investigate" : "Soruştur");
    btn.setAttribute("aria-label", btn.title);
  };
  const isCandidate = TRAITOR_CANDIDATES.includes(c.character) && !c.knot_of;
  if (!c.investigate_text && !isCandidate) {
    btn.classList.add("hidden");
    btn.onclick = null;
    return;
  }
  const investigateText = c.investigate_text
    ? ((isEN && c.investigate_text_en) ? c.investigate_text_en : c.investigate_text)
    : _traitorClueFor(c);
  let counted = false; // aynı kart sayaca en fazla bir kez yazar (eskiden her tıklama sayılıyordu)
  setIcon(false);
  btn.classList.remove("hidden");
  btn.onclick = (e) => {
    if (e) e.stopPropagation();
    if (isInvestigating) {
      cardText.textContent = displayText;
      setIcon(false);
      isInvestigating = false;
    } else {
      cardText.textContent = investigateText;
      setIcon(true);
      isInvestigating = true;
      if (!counted && c.character === hiddenTraitor) {
        counted = true;
        traitorInvestigated++;
      }
    }
  };
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

  // Eyalet Divanı: özel tahsis ekranı
  if (c.easter_type === 'eyalet_trigger') {
    showEyaletEkrani();
    return;
  }

  // Yıl Özeti
  if (c.easter_type === 'year_summary') {
    showYearSummary(c);
    return;
  }

  // Divan Sahnesi
  if (c.easter_type === 'divan_sahnesi') {
    showDivanSahnesi(c);
    return;
  }

  // Hekimbaşı Dinlenme
  if (c.easter_type === 'hekim_dinlenme') {
    showHekimDinlenme(c);
    return;
  }

  // Eyalet İsyanı — ordu/donanma sahnesi + kabul/ret dallanması
  if (c.easter_type === 'eyalet_isyan') {
    showEyaletIsyani(c);
    return;
  }

  // Şehzade Meydan Okuma
  if (c.easter_type === 'sehzade_meydan') {
    showSehzadeMeydan(c);
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

    // Dinlenme turu stat düşüşü (-5 tüm güç barları)
    if (c._restStatDrain) {
      for (const k of Object.keys(stats)) stats[k] = Math.max(5, stats[k] - 5);
      updateStatUI();
    }

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

  // İki seçenekli özel kart
  _hideEasterChoices();
  const _choices = (c.easter_type === "yanlis_idam" || c._restStatDrain) ? null : getEasterChoices(c);
  if (_choices) {
    easterBtn.classList.add("hidden");
    let row = document.getElementById("easter-choice-row");
    if (!row) {
      row = document.createElement("div");
      row.id = "easter-choice-row";
      document.getElementById("card-bottom").appendChild(row);
    }
    row.classList.remove("hidden");
    card.classList.add("has-easter-choices"); // sürükleme etiketlerinin boş alanı gizlensin
    const isENc = window.LANG === 'en';
    row.innerHTML = "";
    _choices.forEach((ch, i) => {
      const b = document.createElement("button");
      b.className = "easter-choice " + (c.easter_type || "") + (i === 0 ? " left" : " right");
      b.textContent = isENc ? ch.en : ch.tr;
      b.onclick = () => {
        if (fired) return; fired = true;
        row.querySelectorAll("button").forEach(x => x.disabled = true);
        if (window.playButtonTap) playButtonTap();
        if (c.easter_type === "kedi"    && window.playCatMeow)          playCatMeow();
        if (c.easter_type === "yanlis"  && window.playWhipCrack)        playWhipCrack();
        if (c.easter_type === "kehanet" && window.playRunningFootsteps) playRunningFootsteps();
        if (c.easter_type === "evliya"  && window.playWindGust)         playWindGust();
        if (ch.keep && c.stat_effect) c.stat_effect();
        if (ch.fx) applyEffects(ch.fx);
        if (ch.run) ch.run();
        if (ch.flag) activeFlags[ch.flag] = true;
        _lastDecision = { tr: ch.tr, en: ch.en };
        checkPargaliSecret();
        if (ch.sched) {
          const onceKey = "_easter_sched_" + ch.sched[0];
          if (!activeFlags[onceKey] && allCards.some(x => x.id === ch.sched[0])) {
            activeFlags[onceKey] = true;
            scheduleConsequence(ch.sched[0], ch.sched[1]);
            updateFateBar();
          }
        }
        if (isGameOver) return;
        if (isPargali) {
          card.style.transition = "opacity 1.2s ease";
          card.style.opacity = "0";
          row.classList.add("hidden");
          setTimeout(() => {
            card.classList.remove("pargali-ghost");
            card.style.opacity = "";
            card.style.transition = "";
            _hideEasterChoices();
            advanceEasterCard(c);
          }, 1250);
          return;
        }
        card.classList.remove("no-swipe");
        const delay = (c.easter_type === "yanlis" || c.easter_type === "kehanet") ? 400 : 150;
        setTimeout(() => { _hideEasterChoices(); advanceEasterCard(c); }, delay);
      };
      row.appendChild(b);
    });
  }

  animateCardIn();
}

// ── Yıl Özeti Overlay ────────────────────────────────────────────
function showYearSummary(c) {
  const isEN   = window.LANG === 'en';
  const yr     = c._snap_year;
  const snap   = c._snap_stats || stats;
  const months = isEN ? (window.EN_HICRI_MONTHS || []) : HICRI_MONTHS;

  // Stat barları
  const statDefs = [
    { key: 'saray',     label: isEN ? 'Palace'   : 'Saray',   icon: 'assets/icons/icon-saray.png' },
    { key: 'yeniçeri',  label: isEN ? 'Army'     : 'Ordu',    icon: 'assets/icons/icon-ordu.png' },
    { key: 'ulema',     label: isEN ? 'Clergy'   : 'Ulema',   icon: 'assets/icons/icon-ulema.png' },
    { key: 'hazine',    label: isEN ? 'Treasury' : 'Hazine',  icon: 'assets/icons/icon-hazine.png' },
  ];

  const barsHTML = statDefs.map(s => {
    const val = Math.round(snap[s.key] || 0);
    const cls = val <= 20 ? 'ys-bar-danger' : val >= 78 ? 'ys-bar-warn' : 'ys-bar-ok';
    return `<div class="ys-stat-row">
      <img class="ys-stat-icon" src="${s.icon}" alt="${s.label}">
      <span class="ys-stat-label">${s.label}</span>
      <div class="ys-bar-track"><div class="ys-bar-fill ${cls}" style="width:${val}%"></div></div>
      <span class="ys-stat-val">${val}</span>
    </div>`;
  }).join('');

  // En çok görülen karakter
  let topChar = '', topCount = 0;
  Object.entries(characterMemory).forEach(([k, m]) => {
    const t = (m.left || 0) + (m.right || 0);
    if (t > topCount) { topCount = t; topChar = k; }
  });
  const charData = topChar ? (window.allCards || []).find(x => x.character === topChar) : null;
  const charLabel = charData
    ? (isEN && charData.character_name_en ? charData.character_name_en : charData.character_name)
    : '';

  const topCharLine = charLabel
    ? `<div class="ys-meta">${isEN ? '✦ Most visited' : '✦ En çok gelen'}: <strong>${charLabel}</strong> (${topCount}×)</div>`
    : '';

  const titleText = isEN ? `YEAR ${yr} COMPLETE` : `${yr}. YIL TAMAMLANDI`;
  const btnText   = isEN ? 'CONTINUE →'          : 'DEVAM ET →';

  const overlay = document.createElement('div');
  overlay.id = 'year-summary-overlay';
  overlay.innerHTML = `
    <div id="year-summary-box">
      <div class="ys-ornament">✦</div>
      <div class="ys-title">${titleText}</div>
      <div class="ys-divider"></div>
      <div class="ys-stats">${barsHTML}</div>
      ${topCharLine}
      <div class="ys-divider" style="margin-top:14px"></div>
      <button class="ys-btn">${btnText}</button>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => { overlay.remove(); advanceEasterCard(c); }, 320);
  };
  overlay.querySelector('.ys-btn').addEventListener('click',    close);
  overlay.querySelector('.ys-btn').addEventListener('touchend', close, { passive: true });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

// ── Divan Sahnesi ─────────────────────────────────────────────────
const DIVAN_SCENARIOS = [
  {
    conflict_tr: "Yeniçeri Ağası ile Şeyhülislam Divan'da karşı karşıya. Biri savaş, diğeri barış istiyor. Hünkarım, karar sizin.",
    conflict_en: "The Janissary Commander and the Şeyhülislam stand face to face in the Divan. One demands war, the other peace. The decision is yours, Grand Vizier.",
    opt_a_tr: "Orduyu destekle (Ordu +12, Ulema −8)",  opt_a_en: "Support the army (Army +12, Clergy −8)",
    opt_b_tr: "Ulemayı destekle (Ulema +12, Ordu −8)", opt_b_en: "Support the clergy (Clergy +12, Army −8)",
    opt_c_tr: "Uzlaştır (her ikisi +4, sen −5 Saray)", opt_c_en: "Mediate (both +4, Palace −5 for you)",
    fx_a: {yeniçeri:12, ulema:-8}, fx_b: {ulema:12, "yeniçeri":-8}, fx_c: {ulema:4,"yeniçeri":4,saray:-5},
  },
  {
    conflict_tr: "Defterdar vergi artışı istiyor. Halk Temsilcisi buna karşı çıkıyor. Divan bekliyor.",
    conflict_en: "The Treasurer demands a tax increase. The People's Representative objects. The Divan waits.",
    opt_a_tr: "Vergi artışını onayla (Hazine +15, Halk −10)", opt_a_en: "Approve the increase (Treasury +15, Clergy −10)",
    opt_b_tr: "Halkı koru (Saray −8, Hazine −8)",            opt_b_en: "Protect the people (Palace −8, Treasury −8)",
    opt_c_tr: "Ertelee (Hazine −5, Saray +6)",               opt_c_en: "Delay (Treasury −5, Palace +6)",
    fx_a: {hazine:15, ulema:-10}, fx_b: {saray:-8, hazine:-8}, fx_c: {hazine:-5, saray:6},
  },
  {
    conflict_tr: "Kaptan-ı Derya yeni gemi istiyor. Rakip Vezir bunu hazine israfı sayıyor. Divan ikiye bölündü.",
    conflict_en: "The Admiral wants new warships. The Rival Vizier calls it a waste of treasury. The Divan is split.",
    opt_a_tr: "Donanmayı destekle (Ordu +10, Hazine −14)", opt_a_en: "Support the fleet (Army +10, Treasury −14)",
    opt_b_tr: "Hazineyi koru (Hazine +8, Ordu −6)",        opt_b_en: "Protect the treasury (Treasury +8, Army −6)",
    opt_c_tr: "Kısmi yatırım (Hazine −7, Ordu +6)",        opt_c_en: "Partial investment (Treasury −7, Army +6)",
    fx_a: {"yeniçeri":10, hazine:-14}, fx_b: {hazine:8,"yeniçeri":-6}, fx_c: {hazine:-7,"yeniçeri":6},
  },
];

function showDivanSahnesi(c) {
  const isEN = window.LANG === 'en';
  const yr   = c._divan_year || year;
  const sc   = DIVAN_SCENARIOS[(yr / 5 - 1) % DIVAN_SCENARIOS.length];
  const title = isEN ? `YEAR ${yr} — DIVAN CONVENES` : `${yr}. YIL — DİVAN TOPLANDI`;

  const overlay = document.createElement('div');
  overlay.id = 'divan-overlay';
  overlay.innerHTML = `
    <div id="divan-box">
      <img src="assets/characters/divan-toplantisi.jpg" class="divan-bg" onerror="this.style.display='none'">
      <div class="divan-content">
        <div class="divan-ornament">✦ ✦ ✦</div>
        <div class="divan-title">${title}</div>
        <div class="divan-divider"></div>
        <div class="divan-conflict">${isEN ? sc.conflict_en : sc.conflict_tr}</div>
        <div class="divan-opts">
          <button class="divan-btn" id="dv-a">${isEN ? sc.opt_a_en : sc.opt_a_tr}</button>
          <button class="divan-btn" id="dv-b">${isEN ? sc.opt_b_en : sc.opt_b_tr}</button>
          <button class="divan-btn" id="dv-c">${isEN ? sc.opt_c_en : sc.opt_c_tr}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const applyAndClose = (fx) => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.35s';
    setTimeout(() => {
      overlay.remove();
      Object.entries(fx).forEach(([k, v]) => {
        stats[k] = Math.max(5, Math.min(95, (stats[k] || 50) + v));
      });
      updateStatUI();
      advanceEasterCard(c);
    }, 350);
  };
  document.getElementById('dv-a').onclick = () => applyAndClose(sc.fx_a);
  document.getElementById('dv-b').onclick = () => applyAndClose(sc.fx_b);
  document.getElementById('dv-c').onclick = () => applyAndClose(sc.fx_c);
}

// ── Şehzade Sistemi ───────────────────────────────────────────────
function updateSehzadePower(delta) {
  sehzadePower = Math.max(0, Math.min(100, sehzadePower + delta));
}

function trySehzadeMeydanOkuma() {
  if (cardsPlayed < SEHZADE_MIN_CARDS || isGameOver) return;
  if (sehzadePower < 70) return;
  // Olasılık: power 70→%40, 85→%65, 100→%90 — her 20 kartta bir kontrol
  if (cardsPlayed % 20 !== 0) return;
  const chance = 0.40 + (sehzadePower - 70) / 100;
  if (Math.random() > chance) return;
  _sehzadeChecked = true;
  const isEN = window.LANG === 'en';
  forcedQueue.push({
    id: 'sehzade_meydan_' + cardsPlayed,
    type: 'easter',
    easter_type: 'sehzade_meydan',
    character: 'sehzade-kart',
    character_name: isEN ? 'The Prince' : 'Şehzade',
    text: isEN
      ? "You have held power long enough, Grand Vizier. The palace whispers your name — but not in reverence. I have come to propose terms."
      : "Yeterince uzun süre güç tuttunuz, Sadrazam. Saray sizin adınızı fısıldıyor — ama saygıyla değil. Şartlarımı sunmaya geldim.",
    button: null,
    stat_effect: null,
    _sehzade_power: sehzadePower,
  });
}

function showSehzadeMeydan(c) {
  const isEN = window.LANG === 'en';
  const pow = c._sehzade_power || sehzadePower;
  const overlay = document.createElement('div');
  overlay.id = 'sehzade-meydan-overlay';
  overlay.innerHTML = `
    <div id="sm-box">
      <div class="sm-threat-bar" style="width:${pow}%"></div>
      <div class="sm-char-wrap">
        <img src="assets/characters/sehzade-kart.jpg" class="sm-img" onerror="this.style.display='none'">
      </div>
      <div class="sm-title">${GAME_ICONS.action_force} ${isEN ? 'CHALLENGE' : 'MEYDAN OKUMA'}</div>
      <div class="sm-text">${c.text}</div>
      <div class="sm-choices">
        <button class="sm-btn sm-a" id="sm-btn-a">
          ${GAME_ICONS.action_negotiate} ${isEN ? 'Negotiate — share power' : 'Uzlaş — gücü paylaş'}
          <span class="sm-hint">${isEN ? 'Saray −20, Prince power −40' : 'Saray −20, Güç −40'}</span>
        </button>
        <button class="sm-btn sm-b" id="sm-btn-b">
          ${GAME_ICONS.action_force} ${isEN ? 'Show force — silence him' : 'Güç göster — sustur'}
          <span class="sm-hint">${isEN ? 'Army −20, Treasury −15, Prince power −60' : 'Ordu −20, Hazine −15, Güç −60'}</span>
        </button>
        <button class="sm-btn sm-c" id="sm-btn-c">
          ${GAME_ICONS.action_gamble} ${isEN ? 'Gamble — all or nothing' : 'Risk al — ya hep ya hiç'}
          <span class="sm-hint">${isEN ? '50%: Prince defeated / 50%: You die' : '%50: Şehzade yenilir / %50: Ölürsün'}</span>
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = (fn) => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => { overlay.remove(); fn(); advanceEasterCard(c); }, 320);
  };

  document.getElementById('sm-btn-a').onclick = () => close(() => {
    updateSehzadePower(-40);
    stats.saray = Math.max(5, (stats.saray || 50) - 20);
    updateStatUI();
  });
  document.getElementById('sm-btn-b').onclick = () => close(() => {
    updateSehzadePower(-60);
    stats["yeniçeri"] = Math.max(5, (stats["yeniçeri"] || 50) - 20);
    stats.hazine = Math.max(5, (stats.hazine || 50) - 15);
    updateStatUI();
  });
  document.getElementById('sm-btn-c').onclick = () => close(() => {
    if (Math.random() < 0.5) {
      updateSehzadePower(-100);
      stats.saray = Math.min(95, (stats.saray || 50) + 15);
      updateStatUI();
    } else {
      const isEN2 = window.LANG === 'en';
      triggerGameOver(isEN2
        ? "The Prince's gambit succeeded. You were removed from power."
        : "Şehzadenin hamlesi tuttu. İktidardan uzaklaştırıldınız.", "sehzade");
    }
  });
}

// ── Hekimbaşı Dinlenme Kartı ──────────────────────────────────────
let _hekimDinlenmeShown = false;
let _hekimDinlenme20Shown = false;

function tryHekimDinlenme() {
  if (isGameOver) return;

  // %20 altı: acil hekim (bir kez daha tetiklenebilir)
  if (!_hekimDinlenme20Shown && sadrazamHealth <= 20) {
    _hekimDinlenme20Shown = true;
    _hekimDinlenmeShown = true;
    forcedQueue.unshift({
      id: 'hekim_dinlenme_acil_' + cardsPlayed,
      type: 'easter',
      easter_type: 'hekim_dinlenme',
      character: '10-hekimbasi',
      character_name: window.LANG === 'en' ? 'Chief Physician' : 'Hekimbaşı',
      text: window.LANG === 'en'
        ? "Grand Vizier, you are in critical condition. You must rest immediately or you will not survive."
        : "Paşam, durumunuz kritik. Hemen dinlenmezseniz sabahı göremeyebilirsiniz.",
    });
    return;
  }

  if (_hekimDinlenmeShown || sadrazamHealth > 40 || isGameOver) return;
  _hekimDinlenmeShown = true;
  forcedQueue.push({
    id: 'hekim_dinlenme_' + cardsPlayed,
    type: 'easter',
    easter_type: 'hekim_dinlenme',
    character: '10-hekimbasi',
    character_name: window.LANG === 'en' ? 'Chief Physician' : 'Hekimbaşı',
    text: window.LANG === 'en'
      ? "Grand Vizier, your body gives warning signs. If you do not rest, the consequences will be severe. What do you decide?"
      : "Paşam, bedeniniz uyarı işaretleri veriyor. Dinlenmezseniz sonuçları ağır olur. Ne buyurursunuz?",
    button: null,
    stat_effect: null,
  });
}

function showHekimDinlenme(c) {
  const isEN = window.LANG === 'en';
  const overlay = document.createElement('div');
  overlay.id = 'hekim-dinlenme-overlay';
  overlay.innerHTML = `
    <div id="hd-box">
      <div class="hd-ornament">⚕</div>
      <div class="hd-title">${isEN ? 'REST OR REFUSE?' : 'DİNLENMEK İSTER MİSİNİZ?'}</div>
      <div class="hd-divider"></div>
      <div class="hd-text">${c.text}</div>
      <div id="hd-card-wrap">
        <div id="hd-card">
          <img id="hd-card-img-base" src="assets/characters/hekim-evet.jpg" alt="">
          <img id="hd-card-img-alt"  src="assets/characters/hekim-hayir.jpg" alt="">
          <div id="hd-card-overlay-left"></div>
          <div id="hd-card-overlay-right"></div>
          <div id="hd-card-hint-left">${isEN ? 'NO' : 'HAYIR'}</div>
          <div id="hd-card-hint-right">${isEN ? 'YES' : 'EVET'}</div>
        </div>
        <div class="hd-swipe-caption">
          <span>◀ ${isEN ? 'No change' : 'Hayır (etkisiz)'}</span>
          <span>${isEN ? 'Rest (+15 ❤) ▶' : 'Dinlen (+15 ❤) ▶'}</span>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // Bu popup açıkken ana karttaki klavye ok tuşu swipe'ı devreye girmesin —
  // overlay fareyle/dokunuşla zaten ana kartı örtüyor ama klavye olayı ayrı,
  // ana #card no-swipe olmadan bu popup açıkken de tetiklenebilirdi.
  card.classList.add('no-swipe');

  const hdCard    = document.getElementById('hd-card');
  const imgAlt    = document.getElementById('hd-card-img-alt');
  const ovlLeft   = document.getElementById('hd-card-overlay-left');
  const ovlRight  = document.getElementById('hd-card-overlay-right');
  const hintLeft  = document.getElementById('hd-card-hint-left');
  const hintRight = document.getElementById('hd-card-hint-right');

  // Ana oyun kartının global sürükleme durumundan (isDragging/isAnimating/curX vb.)
  // tamamen bağımsız, kendi kapalı state'i — ana kartla asla çakışmaz.
  const THRESHOLD_HD = 90;
  let startX = 0, curX = 0, dragging = false, resolved = false;

  function applyDragVisuals(dx) {
    const rot = Math.max(-14, Math.min(14, dx * 14 / THRESHOLD_HD));
    hdCard.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    const progress = Math.min(1, Math.abs(dx) / THRESHOLD_HD);
    if (dx < -10) {
      imgAlt.style.opacity = String(progress);
      ovlLeft.style.opacity = String(progress * 0.55);
      ovlRight.style.opacity = '0';
      hintLeft.style.opacity = String(progress);
      hintRight.style.opacity = '0';
    } else if (dx > 10) {
      imgAlt.style.opacity = '0';
      ovlRight.style.opacity = String(progress * 0.5);
      ovlLeft.style.opacity = '0';
      hintRight.style.opacity = String(progress);
      hintLeft.style.opacity = '0';
    } else {
      imgAlt.style.opacity = '0';
      ovlLeft.style.opacity = ovlRight.style.opacity = '0';
      hintLeft.style.opacity = hintRight.style.opacity = '0';
    }
  }

  function snapBackHd() {
    hdCard.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
    hdCard.style.transform = 'translateX(0) rotate(0deg)';
    imgAlt.style.opacity = '0';
    ovlLeft.style.opacity = ovlRight.style.opacity = '0';
    hintLeft.style.opacity = hintRight.style.opacity = '0';
    setTimeout(() => { hdCard.style.transition = ''; }, 360);
  }

  function cleanup() {
    hdCard.removeEventListener('mousedown', onDown);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    hdCard.removeEventListener('touchstart', onDown);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onUp);
  }

  function resolveHd(dir) {
    if (resolved) return;
    resolved = true;
    cleanup();
    const tx = dir === 'left' ? -520 : 520;
    hdCard.style.transition = 'transform 0.26s ease-in, opacity 0.22s ease-in';
    hdCard.style.transform = `translateX(${tx}px) rotate(${dir === 'left' ? -18 : 18}deg)`;
    hdCard.style.opacity = '0';
    if (window.playSwipeRight && dir === 'right') playSwipeRight();
    if (window.playSwipeLeft  && dir === 'left')  playSwipeLeft();
    setTimeout(() => {
      overlay.remove();
      card.classList.remove('no-swipe');
      if (dir === 'right') {
        _hekimYesCount++;
        changeHealth(+15);
        // 2 tur dinlenme — her biri stat -5 uygular
        const restCard = (turNo) => ({
          id: 'hekim_dinlenme_bos_' + turNo,
          type: 'easter',
          easter_type: 'hekim_dinlenme_bos',
          character: '10-hekimbasi',
          character_name: isEN ? 'Chief Physician' : 'Hekimbaşı',
          text: isEN
            ? 'Rest well, Grand Vizier. The empire can wait.'
            : 'Dinlenin Sadrazamım... İmparatorluk bekleyebilir.',
          button: isEN ? 'Very well' : 'Pekâlâ',
          _restStatDrain: true,
        });
        // unshift ile ilk önce tur-1 gelecek şekilde sırala
        forcedQueue.unshift(restCard(1), restCard(2));
        advanceEasterCard(c);
        _hekimDinlenmeShown = false;
        setTimeout(() => { tryHekimDinlenme._cooldown = cardsPlayed + 30; }, 0);
      } else {
        // Reddedince sağlık düşmez — sadece +15 kazanma fırsatı kaçırılmış olur
        advanceEasterCard(c);
        _hekimDinlenmeShown = false;
      }
    }, 260);
  }

  function onDown(e) {
    if (resolved) return;
    dragging = true;
    const p = e.touches ? e.touches[0] : e;
    startX = p.clientX; curX = startX;
    hdCard.classList.add('dragging');
    hdCard.style.transition = 'none';
  }
  function onMove(e) {
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    curX = p.clientX;
    if (e.touches) e.preventDefault();
    applyDragVisuals(curX - startX);
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    hdCard.classList.remove('dragging');
    const dx = curX - startX;
    if (dx <= -THRESHOLD_HD) resolveHd('left');
    else if (dx >= THRESHOLD_HD) resolveHd('right');
    else snapBackHd();
  }

  hdCard.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  hdCard.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);
}

function showDonumEkrani() {
  _donumShownThisGame = true;
  _donumShownCount++;
  _donumNextCard = cardsPlayed + _donumRepeatGap;
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

// ── Eyalet Divanı — dönemsel eyalet tahsis kararı ─────────────────
const EYALET_ICONS = { rumeli:GAME_ICONS.province_rumeli, anadolu:GAME_ICONS.province_anadolu, misir:GAME_ICONS.province_misir, dogu:GAME_ICONS.province_dogu, akdeniz:GAME_ICONS.province_akdeniz };

function showEyaletEkrani() {
  _eyaletShownCount++;
  _eyaletNextCard = cardsPlayed + _eyaletRepeatGap;
  const overlay = document.createElement("div");
  overlay.id = "eyalet-overlay";
  const isEN = window.LANG === 'en';
  const choices = PROVINCES.map(p => ({
    id: p.id,
    label: getProvinceLabel(p),
    loyalty: Math.round(provinceLoyalty[p.id] ?? 50),
    icon: EYALET_ICONS[p.id] || '✦',
  }));
  overlay.innerHTML = `
    <div id="eyalet-box">
      <div id="eyalet-ornament">✦</div>
      <div id="eyalet-title">${isEN ? "PROVINCIAL COUNCIL" : "EYALET DİVANI"}</div>
      <div id="eyalet-divider"></div>
      <div id="eyalet-text">${isEN ? "Where should the empire's attention turn this term?" : "Bu dönem imparatorluğun dikkati hangi eyalete yönelsin?"}</div>
      <div id="eyalet-choices">
        ${choices.map(ch => `
          <button class="eyalet-btn" data-id="${ch.id}">
            <span class="eyalet-icon">${ch.icon}</span>
            <span class="eyalet-label">${ch.label}</span>
            <span class="eyalet-loyalty-badge">${ch.loyalty}</span>
          </button>`).join("")}
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelectorAll(".eyalet-btn").forEach(btn => {
    btn.onclick = () => {
      if (window.playSelectConfirm) playSelectConfirm();
      updateProvince(btn.dataset.id, 12);
      // Uzun Vadeli Hafıza: seçilmeyen, zaten sadakati düşük eyaletler ~6 yıl sonra isyan riski taşır
      PROVINCES.forEach(p => {
        if (p.id !== btn.dataset.id && (provinceLoyalty[p.id] ?? 50) < 30) {
          const alreadyScheduled = _eyaletIsyanSchedule.some(sc => sc.provinceId === p.id);
          if (!alreadyScheduled) {
            _eyaletIsyanSchedule.push({ provinceId: p.id, afterCardsPlayed: cardsPlayed + 150 });
          }
        }
      });
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.3s ease";
      setTimeout(() => {
        overlay.remove();
        advanceEasterCard({ id:"eyalet" });
      }, 320);
    };
  });
}

// ── İki seçenekli özel kartlar (27 Eylül 2026) ─────────────────────────
// Eskiden tek "DEVAM" düğmesiyle geçilen özel kartlara iki seçenek.
// Kart tanımlarına dokunulmaz; seçenekler burada, kart türüne göre verilir.
// Seçenek alanları: tr/en (etiket), keep (kartın orijinal stat_effect'i de
// uygulansın), fx (applyEffects ile uygulanan stat etkisi), run (özel kod),
// flag (activeFlags), sched: [sonuç kartı id, gecikme] (oyun başına bir kez).
// Tek düğmeli kalanlar: yanlis_idam (3. Yanlış Adam), hekim dinlenme, yıl
// özeti, divan sahnesi, eyalet ve şehzade ekranları (onların kendi ekranı var).
function _easterChoice(tr, en, o) { return Object.assign({ tr: tr, en: en }, o || {}); }

function _felaketDamage(ratioOthers, ratioHazine) {
  // Zaman Yolcusu dinlendiyse bu felaketin etkisi yarıya iner (bir kez)
  let k = 1;
  if (activeFlags._zaman_uyari) {
    k = 0.5; delete activeFlags._zaman_uyari;
    showItemToast(window.LANG === 'en' ? "The Time Traveler's warning softened the blow." : "Zaman Yolcusu'nun uyarısı darbeyi hafifletti.");
  }
  for (const s of Object.keys(stats)) {
    const r = (s === "hazine" ? ratioHazine : ratioOthers) * k;
    const delta = -Math.round(stats[s] * r);
    stats[s] = Math.max(5, stats[s] + delta);
    showStatDelta(s, delta);
  }
  updateStatUI();
}
function _mucizeGain(ratioOthers, ratioHazine, ulemaBonus) {
  for (const s of Object.keys(stats)) {
    const r = s === "hazine" ? ratioHazine : ratioOthers;
    const delta = Math.round(stats[s] * r) + (s === "ulema" ? ulemaBonus : 0);
    stats[s] = Math.min(95, stats[s] + delta);
    showStatDelta(s, delta);
  }
  updateStatUI();
}

function getEasterChoices(c) {
  const t = c.easter_type, id = String(c.id || "");
  const C = _easterChoice;
  if (t === "kedi") return [
    C("Kovun şu kediyi", "Shoo the cat", { keep: true, fx: { saray: 2 }, flag: "kedi_kovuldu", sched: ["kedi_sonuc_fareler", 20] }),
    C("Divan'da minderi olsun", "Give it a Divan cushion", { keep: true, fx: { ulema: 2, saray: -1 }, flag: "kedi_sahiplenildi", sched: ["kedi_sonuc_ambar", 20] }),
  ];
  if (t === "yanlis") return [
    C("Devrül karşımdan", "Out of my sight", {}),
    C("Kim olduğunu soruşturun", "Find out who he is", { fx: { saray: -1 }, flag: "yanlis_sorgulandi", sched: ["yanlis_adam_casus", 10] }),
  ];
  if (t === "kehanet") return [
    C("Yıkıl zındık!", "Begone, madman!", { fx: { ulema: 2 } }),
    C("Kehaneti kayda geçirin", "Record the prophecy", { fx: { ulema: -2, saray: 1 }, flag: "kehanet_kaydedildi", sched: ["kehanet_turbe", 25] }),
  ];
  if (t === "evliya") return [
    C("Eyvallah", "My regards", {}),
    C("Seyahatini finanse edin", "Fund his journey", { fx: { hazine: -4, ulema: 2 }, flag: "evliya_finanse", sched: ["evliya_seyahatname", 25] }),
  ];
  if (t === "tarihsel" && id.startsWith("easter_barbaros_")) return [
    C("Eyvallah Reis", "Well said, Admiral", {}),
    C("Donanmaya ödenek ayırın", "Fund the fleet", { fx: { hazine: -5, "yeniçeri": 3 }, flag: "barbaros_odenek", sched: ["barbaros_preveze", 20] }),
  ];
  if (t === "tarihsel" && id.startsWith("easter_leonardo_")) return [
    C("Ala Leo!", "Well done, Leo!", {}),
    C("Haliç köprüsünü yaptırın", "Build the Golden Horn bridge", { fx: { hazine: -6, saray: 2 }, flag: "leonardo_kopru", sched: ["leonardo_kopru_sonuc", 30] }),
  ];
  if (t === "tarihsel" && id.startsWith("easter_halit_")) return [
    C("Rolünüz muhteşemdi", "A magnificent role", { fx: { saray: 1 } }),
    C("Bu dizi bitsin artık", "Let this series end", { fx: { ulema: 1 } }),
  ];
  if (t === "zaman") return [
    C("Ne dersin zındık?", "What say you, madman?", {}),
    C("Anlatsın, dinleyin", "Let him speak", { fx: { ulema: -2 }, run: () => {
      activeFlags._zaman_uyari = true;
      showItemToast(window.LANG === 'en' ? "He described the next disaster. You will be ready." : "Bir sonraki felaketi anlattı. Hazırlıklı olacaksınız.");
    } }),
  ];
  if (t === "fisildayan") return [
    C("Kulağınızı tıkayın", "Cover your ears", {}),
    C("Fısıltıyı dinleyin", "Listen to the whisper", { flag: "_fisilti_dinlendi", run: () => {
      const en = window.LANG === 'en';
      if (typeof changeHealth === "function") changeHealth(-5);
      if (hiddenTraitor && !traitorRevealed) {
        const nm = en ? getCharacterDisplayName(hiddenTraitor, true) : getCharacterDisplayName(hiddenTraitor);
        showItemToast(en ? `The whisper named someone: the ${nm}.` : `Fısıltı bir isim söyledi: ${nm}.`);
      } else {
        showItemToast(en ? "The whisper faded into the dark." : "Fısıltı karanlıkta kayboldu.");
      }
    } }),
  ];
  if (t === "felaket") return [
    C("Kadere razı olun", "Accept your fate", { run: () => _felaketDamage(0.30, 0.30) }),
    C("Hazineden yardım dağıtın", "Send aid from the treasury", { run: () => _felaketDamage(0.15, 0.40) }),
  ];
  if (t === "mucize") return [
    C("Hazineye kaydedin", "Record it in the treasury", { run: () => _mucizeGain(0.30, 0.30, 0) }),
    C("Şükür kurbanı dağıtın", "Give thanks offerings", { run: () => _mucizeGain(0.30, 0.10, 5) }),
  ];
  if (t === "pargali") return [
    C("Ruhuna Fatiha okuyun", "Pray for his soul", { fx: { ulema: 3 }, flag: "_pargali_fatiha" }),
    C("Hayali kovun", "Banish the ghost", { fx: { saray: 2 } }),
  ];
  if (t === "pargali_final_secim") {
    const finish = (e) => () => { localStorage.setItem(PARGALI_END_KEY, e); updatePargaliMenuButton();
      showItemToast(window.LANG === 'en' ? "Pargalı's secret is solved." : "Pargalı'nın sırrı çözüldü."); };
    return [
      C("Mektubu yakın, sır bende kalsın", "Burn it, the secret stays with me", { fx: { saray: 3 }, run: finish("yak") }),
      C("Mektubu Sultan'a götürün", "Take it to the Sultan", { fx: { ulema: 3 }, run: finish("sultan") }),
    ];
  }
  if (t === "golge") return [
    C("Selefinizden ders alın", "Learn from your predecessor", { run: () => {
      for (const s of Object.keys(stats)) { const d = stats[s] < 50 ? Math.min(5, 50 - stats[s]) : -Math.min(5, stats[s] - 50); if (d) { stats[s] += d; showStatDelta(s, d); } }
      updateStatUI();
    } }),
    C("Geçmişi geride bırakın", "Leave the past behind", { fx: { saray: 3 } }),
  ];
  if (t === "miras") return [
    C("Mirası kabul edin", "Accept the legacy", { keep: true }),
    C("Halka dağıtın", "Share it with the people", { fx: { ulema: 4, saray: 2 }, run: () => {
      localStorage.removeItem("sadrazam_miras_bar"); localStorage.removeItem("sadrazam_miras_label");
    } }),
  ];
  if (t === "gizli_nitelik" && id.startsWith("gizli_halk_sevgisi_")) return [
    C("Halkın sesi Divan'a", "Their voice to the Divan", { fx: { ulema: 3, saray: -2 } }),
    C("Halktan gönüllü asker", "Raise volunteers", { fx: { "yeniçeri": 5 } }),
  ];
  if (t === "gizli_nitelik" && id.startsWith("gizli_casus_agi_")) return [
    C("Ağı Sultan için kullanın", "Use it for the Sultan", { fx: { saray: 5 } }),
    C("Ağı gizli tutun", "Keep the network hidden", { fx: { hazine: 3 } }),
  ];
  if (t === "sultan_favor") return [
    C("Pekâlâ", "Very well", { keep: true }),
    C("Haberciyi ödüllendirin", "Reward the messenger", { keep: true, fx: { hazine: -2, saray: 2 } }),
  ];
  return null;
}

// ── Kritik An Teklifi (27 Eylül 2026) ─────────────────────────────────
// Bir güç CRITICAL_THRESHOLD'un altına düşünce, yeni kart gelir gelmez alttan
// küçük bir panel: Şifa Otu (en düşük güç +20) — reklamla ya da 1 akçeyle,
// anında uygulanır. Kartı kapatmaz; kart kaydırılınca panel kapanır.
// Sınırlar: en az CRITICAL_COOLDOWN kartta bir, oyun başına CRITICAL_MAX_PER_GAME.
// Çantada zaten Şifa Otu varsa teklif yok — o eşya parlatılır.
// 3 Ekim 2026: eşik 15 → 20, oyun başına 2 → YILDA 2, ara 20 → 12 kart.
const CRITICAL_THRESHOLD = 20;
const CRITICAL_COOLDOWN = 12;
const CRITICAL_MAX_PER_YEAR = 2;
let _criticalYear = 0;
let _criticalShownCount = 0;
let _criticalLastAt = -999;
const _STAT_NAMES = { saray: ["Saray", "Palace"], "yeniçeri": ["Ordu", "Army"], ulema: ["Ulema", "Clergy"], hazine: ["Hazine", "Treasury"] };

function _hideCriticalOffer() {
  const el = document.getElementById("critical-offer");
  if (el) el.remove();
  document.querySelectorAll(".stat.critical-focus").forEach(x => x.classList.remove("critical-focus"));
}

function _applyCriticalHeal() {
  const lowest = Object.entries(stats).reduce((a, b) => b[1] < a[1] ? b : a);
  stats[lowest[0]] = Math.min(100, stats[lowest[0]] + 20);
  showStatDelta(lowest[0], 20);
  updateStatUI();
  const en = window.LANG === 'en';
  showItemToast((en ? "Healing Herb — +20 " : "Şifa Otu — +20 ") + _STAT_NAMES[lowest[0]][en ? 1 : 0]);
  if (typeof Haptics !== "undefined" && Haptics.statPositive) Haptics.statPositive();
}

function maybeShowCriticalOffer() {
  if (isGameOver || isPaywalled || !currentCard) return;
  if (document.getElementById("critical-offer")) return;
  if (document.getElementById("katib-overlay")) return; // Kâtip/Müneccim notu açıkken üst üste binmesin
  if (_criticalYear !== year) { _criticalYear = year; _criticalShownCount = 0; }
  if (_criticalShownCount >= CRITICAL_MAX_PER_YEAR) return;
  if (cardsPlayed - _criticalLastAt < CRITICAL_COOLDOWN) return;
  const low = Object.entries(stats).filter(([k, v]) => v <= CRITICAL_THRESHOLD).sort((a, b) => a[1] - b[1])[0];
  if (!low) return;
  const has = playerItems.indexOf("sifa_otu");
  if (has >= 0) { // zaten var — kullanmayı hatırlat
    const sl = document.getElementById("item-slot-" + has);
    if (sl) { sl.classList.remove("critical-hint"); void sl.offsetWidth; sl.classList.add("critical-hint"); setTimeout(() => sl.classList.remove("critical-hint"), 3200); }
    return;
  }
  _criticalShownCount++;
  _criticalLastAt = cardsPlayed;
  const en = window.LANG === 'en';
  const [key, val] = low;
  const statEl = document.querySelector('.stat[data-stat="' + (key === "yeniçeri" ? "yeniceri" : key) + '"]');
  if (statEl) statEl.classList.add("critical-focus");
  const bal = getAkceBalance();
  const el = document.createElement("div");
  el.id = "critical-offer";
  el.innerHTML = `
    <button class="co-x" aria-label="${en ? "Close" : "Kapat"}">✕</button>
    <div class="co-head">
      <img class="co-icon" src="assets/icons/item-sifa-otu.png" alt="">
      <div class="co-txt">
        <div class="co-title">${en ? `${_STAT_NAMES[key][1]} is in danger` : `${_STAT_NAMES[key][0]} tehlikede`} <span class="co-val">${en ? Math.round(val) + "%" : "%" + Math.round(val)}</span></div>
        <div class="co-desc">${en ? "Healing Herb raises your weakest power by 20, right now." : "Şifa Otu en düşük gücünü anında +20 yapar."}</div>
      </div>
    </div>
    <div class="co-btns">
      <button class="co-ad">${en ? "Watch Ad" : "Reklam İzle"}</button>
      <button class="co-akce">${bal >= 1 ? (en ? "1 Akce" : "1 Akçe") : (en ? "Get Akce" : "Akçe Al")} <span class="co-bal">(${bal})</span></button>
    </div>
    <div class="co-msg"></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("visible"));
  const msg = el.querySelector(".co-msg");
  const lock = (on) => el.querySelectorAll(".co-btns button").forEach(b => b.disabled = on);
  const done = () => { _applyCriticalHeal(); el.classList.remove("visible"); setTimeout(_hideCriticalOffer, 260); };
  el.querySelector(".co-x").onclick = () => { el.classList.remove("visible"); setTimeout(_hideCriticalOffer, 260); };
  el.querySelector(".co-ad").onclick = () => {
    lock(true); msg.textContent = "";
    RewardedAds.show(
      () => { if (!document.getElementById("critical-offer") || isGameOver) return; done(); },
      () => { lock(false); msg.textContent = en ? "The ad could not be shown." : "Reklam gösterilemedi."; }
    );
  };
  el.querySelector(".co-akce").onclick = () => {
    if (spendAkce(1)) { done(); return; }
    // Bakiye yok: Market'e git, dönünce panel yerinde (teklif hakkı yanmaz)
    redirectToAkcePurchase(() => {
      const b = el.querySelector(".co-akce");
      if (b) { const nb = getAkceBalance(); b.innerHTML = (nb >= 1 ? (en ? "1 Akce" : "1 Akçe") : (en ? "Get Akce" : "Akçe Al")) + ` <span class="co-bal">(${nb})</span>`; }
    });
  };
}

// ── Pargalı'nın Sırrı — oyunlar arası nihai gizem (27 Eylül 2026) ────────
// Pargalı İbrahim Paşa'nın halefine bıraktığı mektubun 7 sayfası farklı oyunlara
// dağılmış. Her sayfa belirli bir davranışla bulunur (bir kez, kalıcı). Metin
// BULUNMA SIRASINA göre verilir — hangi koşulla bulunursa bulunsun hikâye baştan
// sona akar. 7. sayfadan sonra 3 kartlık final ve kalıcı bir seçim.
const PARGALI_KEY = "sadrazam_pargali_pages";
const PARGALI_END_KEY = "sadrazam_pargali_ending";
const PARGALI_CONDITIONS = [
  { id: "fatiha",  check: () => !!activeFlags._pargali_fatiha },
  { id: "kanuni",  check: () => selectedSultan && selectedSultan.id === "kanuni" && year >= 3 },
  { id: "valide",  check: () => ((characterMemory['5-valide-sultan'] || {}).right || 0) >= 3 },
  { id: "cocuk",   check: () => !!activeFlags["çocuk_affedildi"] },
  { id: "hain",    check: () => traitorInvestigated >= 2 },
  { id: "fisilti", check: () => !!activeFlags._fisilti_dinlendi },
];
const PARGALI_PAGES = [
  { tr: "Sen, benden sonra bu mührü taşıyan: bu satırları okuyorsan ben çoktan Topkapı'nın duvarlarına karışmışımdır. Dinle.",
    en: "You who carry this seal after me: if you read these lines, I have long since become part of Topkapı's walls. Listen." },
  { tr: "Süleyman'la aynı sofrada büyüdük. Bana kardeşim derdi. Kanunnameyi birlikte yazdık; her maddesinde benim de mürekkebim var.",
    en: "Süleyman and I grew up at the same table. He called me brother. We wrote the law together; my ink is in every article." },
  { tr: "Hürrem Sultan bana hiç düşman olmadı. Onun korktuğu ben değildim; benim bildiklerimdi.",
    en: "Hürrem Sultan was never my enemy. It was not me she feared; it was what I knew." },
  { tr: "Cellat o gece ağlıyordu. 'Paşam, elim gitmiyor' dedi. Ben ona 'Emir emirdir' dedim. Sen de bir gün aynı sözü duyacaksın.",
    en: "The executioner wept that night. 'My Pasha, my hand will not move,' he said. I told him, 'An order is an order.' One day you will hear those words too." },
  { tr: "Divan'da benden başka biri de Sultan'a yazıyordu. Mektuplarımı okuyan, sözlerimi çarpıtan. Adını hiç öğrenemedim; sen öğrenebilirsin.",
    en: "Someone else in the Divan was writing to the Sultan. Reading my letters, twisting my words. I never learned the name; you still can." },
  { tr: "Beni öldüren kılıç değildi; bir kez 'Serasker Sultan' diye imzalamamdı. Tahtın gölgesinde ikinci bir sultana yer yoktur. Bir kez yeter.",
    en: "It was not the sword that killed me; it was signing once as 'Serasker Sultan'. There is no room for a second sultan in the shadow of the throne. Once is enough." },
  { tr: "Son sayfa: Mühür, sahibini korumaz; onu tutsak eder. Bunu bilen sadrazam uzun yaşar. Bu gece rüyanda seni bekleyeceğim.",
    en: "The last page: the seal does not protect its bearer; it imprisons him. The vizier who knows this lives long. Tonight I will wait for you in your dream." },
];
function getPargaliPages() { try { const a = JSON.parse(localStorage.getItem(PARGALI_KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function _savePargaliPages(a) { localStorage.setItem(PARGALI_KEY, JSON.stringify(a)); }
function getPargaliEnding() { return localStorage.getItem(PARGALI_END_KEY) || ""; }
let _pargaliQueuedThisCheck = false;

function _makePargaliPageCard(n) {
  const en = window.LANG === 'en';
  const pg = PARGALI_PAGES[n - 1];
  return { id: "pargali_sayfa_" + n, type: "easter", easter_type: "pargali_sayfa", character: "pargali-ibrahim",
    character_name: en ? `Pargalı's Letter — Page ${n}/7` : `Pargalı'nın Mektubu — Sayfa ${n}/7`,
    text: en ? pg.en : pg.tr, button: en ? "KEEP THE PAGE" : "SAYFAYI SAKLA", stat_effect: null };
}
function _pargaliFinaleCards() {
  const en = window.LANG === 'en';
  const base = { type: "easter", character: "pargali-ibrahim", character_name: en ? "Pargalı İbrahim Pasha" : "Pargalı İbrahim Paşa", stat_effect: null };
  return [
    { ...base, id: "pargali_final_1", easter_type: "pargali_final", button: en ? "..." : "...",
      text: en ? "You gathered all seven pages. Now you know what you must know: Süleyman did not kill me. What killed me was forgetting that his mercy was a gift, not a right."
               : "Yedi sayfayı topladın. Artık bilmen gerekeni biliyorsun: Beni Süleyman öldürmedi. Beni, onun merhametinin bir hak değil bir lütuf olduğunu unutmam öldürdü." },
    { ...base, id: "pargali_final_2", easter_type: "pargali_final", button: en ? "I UNDERSTAND" : "ANLADIM",
      text: en ? "Every night I kept the seal under my pillow. One morning I woke and understood: the seal was not carried by me; I was carried by the seal. Grand Vizier, which one are you?"
               : "Mührü her gece yastığımın altına koyardım. Bir sabah uyandım ve anladım: mührü ben taşımıyordum, mühür beni taşıyordu. Sadrazam, sen hangisisin?" },
    { ...base, id: "pargali_final_3", easter_type: "pargali_final_secim", button: "",
      text: en ? "What will you do with my letter?" : "Mektubumu ne yapacaksın?" },
  ];
}

// Her karardan / özel kart seçiminden sonra çağrılır; en fazla bir sayfa verir
function checkPargaliSecret() {
  if (isGameOver || isPaywalled) return;
  if (getPargaliEnding()) return; // sır çözüldü
  const pages = getPargaliPages();
  if (pages.length >= 7) return;
  if (forcedQueue.some(c => c && typeof c.id === "string" && c.id.startsWith("pargali_"))) return; // bekleyen sayfa varken yenisini ekleme
  let foundId = null;
  if (pages.length === 6) { if (year >= 7) foundId = "son_sayfa"; }
  else { const c = PARGALI_CONDITIONS.find(k => !pages.includes(k.id) && (() => { try { return k.check(); } catch (e) { return false; } })()); if (c) foundId = c.id; }
  if (!foundId) return;
  pages.push(foundId); _savePargaliPages(pages);
  forcedQueue.unshift(_makePargaliPageCard(pages.length));
  if (pages.length === 7) forcedQueue.splice(1, 0, ..._pargaliFinaleCards());
  updatePargaliMenuButton();
}

function _applyPargaliEndingAtStart() {
  const e = getPargaliEnding();
  if (e === "yak") { stats.saray = Math.min(95, (stats.saray ?? 50) + 5); }
  if (e === "sultan") { sultanSabir = Math.min(95, sultanSabir + 10); }
}

function updatePargaliMenuButton() {
  const b = document.getElementById("btn-pargali"); if (!b) return;
  const n = getPargaliPages().length, en = window.LANG === 'en', done = !!getPargaliEnding();
  b.classList.toggle("hidden", n === 0);
  const lbl = b.querySelector(".pg-lbl");
  if (lbl) lbl.textContent = en ? (done ? "PARGALI'S SECRET" : `PARGALI'S LETTER ${n}/7`) : (done ? "PARGALI'NIN SIRRI" : `PARGALI'NIN MEKTUBU ${n}/7`);
}
function showPargaliLetter() {
  if (document.getElementById("pargali-letter-overlay")) return;
  const en = window.LANG === 'en', n = getPargaliPages().length, ending = getPargaliEnding();
  const el = document.createElement("div"); el.id = "pargali-letter-overlay";
  const pages = PARGALI_PAGES.map((p, i) => i < n
    ? `<div class="pl-page"><span class="pl-no">${i + 1}</span>${en ? p.en : p.tr}</div>`
    : `<div class="pl-page missing"><span class="pl-no">${i + 1}</span>${en ? "A torn page. It must be somewhere in another reign…" : "Yırtık bir sayfa. Başka bir saltanatta bir yerde olmalı…"}</div>`).join("");
  const end = ending ? `<div class="pl-end">${ending === "yak"
      ? (en ? "You burned the letter. The secret rests with you — each new reign begins with the Divan's trust (+5 Palace)." : "Mektubu yaktın. Sır seninle kaldı — her yeni saltanat Divan'ın güveniyle başlar (+5 Saray).")
      : (en ? "You took the letter to the Sultan. Each new reign begins with the Sultan's patience (+10)." : "Mektubu Sultan'a götürdün. Her yeni saltanat Sultan'ın sabrıyla başlar (+10).")}</div>` : "";
  el.innerHTML = `<div id="pargali-letter"><div class="pl-title">${en ? "PARGALI'S LETTER" : "PARGALI'NIN MEKTUBU"}</div><div class="pl-sub">${n}/7</div>${pages}${end}<button class="pl-close">${en ? "Close" : "Kapat"}</button></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("visible"));
  el.querySelector(".pl-close").onclick = () => { el.classList.remove("visible"); setTimeout(() => el.remove(), 220); };
}

function _hideEasterChoices() {
  const row = document.getElementById("easter-choice-row");
  if (row) { row.classList.add("hidden"); row.innerHTML = ""; }
  card.classList.remove("has-easter-choices");
}

function advanceEasterCard(c) {
  card.classList.remove("pargali-ghost", "no-swipe");
  cardsPlayed++;
  advanceHicriMonth();
  if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
  if (!isGameOver && !isPaywalled) { saveGameState(); setTimeout(dealNext, 200); }
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
    triggerGameOver("O 'yanlış oda' hikayesi sona erdi. Kimliğini öğrendiler — ve seni de.", "yanlis_oda");
  }, 2200);
}

// ── Padişah Ziyareti — bizzat gelip konuşur, reddedince ölürsün ──
let _padisahZiyaretiNext = 100; // ilk ziyaret ~yıl 4
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
  _padisahZiyaretiNext = cardsPlayed + Math.round(90 * (0.75 + Math.random() * 0.5));
  _padisahZiyaretiCount++;
  showPadisahZiyareti();
}

function showPadisahZiyareti() {
  renderKnotVisual(null); // dealNext'ten geçmiyor — önceki birleşik görünüm kalmasın
  _hideInvestigateBtn();
  _hideEasterChoices();
  const _isENpv = window.LANG === 'en';
  const _pvPool = (_isENpv && window.EN_PADISAH_ZIYARET_TEXTS) ? window.EN_PADISAH_ZIYARET_TEXTS : PADISAH_ZIYARET_TEXTS;
  const data = _pvPool[Math.floor(Math.random() * _pvPool.length)];

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

  charName.textContent = _isENpv ? "My Sultan" : "Padişahım";
  cardText.textContent = data.text;
  choiceLeft.textContent  = _isENpv ? "Refuse" : "Reddet";
  choiceRight.textContent = _isENpv ? "I Pledge Loyalty" : "Biat Et";
  choiceLeft.style.opacity  = "0";
  choiceRight.style.opacity = "0";
  overlayL.style.opacity = "0";
  overlayR.style.opacity = "0";
  card.classList.remove("letter-card", "pargali-ghost");
  // Bu kartın tek geçerli girdisi aşağıdaki "easter-action-btn" — sağa/sola
  // kaydırarak da tamamlanabiliyordu (character "1-sultan" değil, onStart'taki
  // swipe engeli buna uygulanmıyor), bu yüzden kazara swipe'ı bilerek engelliyoruz.
  card.classList.add("no-swipe");

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
    if (maybeShowFunnyConfirmEasterEgg(() => {
      easterBtn.classList.add("hidden");
      flyOff("right");
    })) return;
    easterBtn.classList.add("hidden");
    flyOff("right");
  };

  const invBtn = document.getElementById("investigate-btn");
  if (invBtn) invBtn.classList.add("hidden");

  animateCardIn();
}

// ── Sultan Olay Kartı ─────────────────────────────────────────────
// Kartın kendi gerçek metni/seçenekleri gösterilir; karar normal decide()
// akışından geçer (etkiler, flag'ler, zincirler, eyalet etkisi vs. diğer
// tüm kartlarla aynı mekanizmayı kullanır).
function showSultanEventCard(c) {
  hideNegotiationPanel();
  Haptics.letterArrival();
  if (window.playLetterArrival) playLetterArrival();

  const isEN = window.LANG === 'en';
  const text      = (isEN && c.text_en)       ? c.text_en       : (c.text || "");
  const leftText  = (isEN && c.left_text_en)  ? c.left_text_en  : (c.left_text || "");
  const rightText = (isEN && c.right_text_en) ? c.right_text_en : (c.right_text || "");
  const title     = (isEN && c.character_name_en) ? c.character_name_en : (c.character_name || "Sultan");

  const overlay = document.createElement("div");
  overlay.id = "sultan-event-overlay";
  overlay.innerHTML = `
    <div id="sultan-event-box">
      <div id="sultan-event-label">${isEN ? 'MESSAGE FROM THE SULTAN' : "SULTAN'DAN HABER"}</div>
      <img id="sultan-event-img" src="assets/characters/1-sultan.jpg" alt="Sultan">
      <div id="sultan-event-title">${title}</div>
      <div id="sultan-event-divider"></div>
      <div id="sultan-event-text">${text}</div>
      <div id="sultan-event-choices">
        <button id="sultan-event-left">${leftText}</button>
        <button id="sultan-event-right">${rightText}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const box = document.getElementById("sultan-event-box");
  let fired = false;

  const doChoice = (dir) => {
    if (fired) return; fired = true;
    box.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    box.style.transform = dir === "right" ? "translateX(120%) rotate(12deg)" : "translateX(-120%) rotate(-12deg)";
    box.style.opacity = "0";
    setTimeout(() => {
      overlay.remove();
      applyProvinceEffect(c, dir); // eyalet etkisi (önceki davranışla aynı kapsam: sultan kararları)
      decide(dir);
    }, 320);
  };

  document.getElementById("sultan-event-left").onclick  = () => doChoice("left");
  document.getElementById("sultan-event-right").onclick = () => doChoice("right");

  // Klavye ok tuşu desteği (keydown handler zaten bunları arıyor)
  window._sultanAccept = () => doChoice("right");
  window._sultanReject = () => doChoice("left");
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
  // NOT: bu fonksiyon az önce hideNegotiationPanel() çağırdı, o da bu butona
  // inline style="display:none" uyguluyor — sadece "hidden" class'ını kaldırmak
  // yetmez, inline stili de temizlemek gerekiyor yoksa buton hiç görünmez.
  const devamBtn = document.getElementById("letter-devam-btn");
  if (devamBtn) {
    devamBtn.classList.remove("hidden");
    devamBtn.style.display = "";
  }

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

function handleLetterDevam(_skipEasterEgg) {
  clearLetterTapHandler();
  if (!_skipEasterEgg && maybeShowFunnyConfirmEasterEgg(() => handleLetterDevam(true))) return;
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
    receivedLetters++; // "Sultan'dan Haber" / "Tüm Mektuplar" başarımları için

    if (!isGameOver && !isPaywalled) {
      cardsPlayed++;
      advanceHicriMonth();
      if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
      if (!isGameOver && !isPaywalled) setTimeout(dealNext, 150);
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
      if (!isGameOver && !isPaywalled) {
        cardsPlayed++;
        advanceHicriMonth();
        if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
        if (!isGameOver && !isPaywalled) setTimeout(dealNext, 150);
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
      if (!isGameOver && !isPaywalled) {
        cardsPlayed++;
        advanceHicriMonth();
        if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
        if (!isGameOver && !isPaywalled) setTimeout(dealNext, 200);
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

function updateHealthUI() {
  const hfill = document.getElementById("health-fill-h");
  const hval  = document.getElementById("health-val");
  const hicon = document.getElementById("health-icon-svg");
  if (!hfill) return;
  const h = Math.round(Math.max(0, Math.min(100, sadrazamHealth)));
  hfill.style.width = h + "%";
  let cls = "";
  let iconColor = "rgba(39,174,96,0.7)";
  if (h <= 20)      { cls = "danger"; iconColor = "rgba(192,57,43,0.9)"; }
  else if (h <= 40) { cls = "warn";   iconColor = "rgba(230,126,34,0.85)"; }
  hfill.className = cls;
  if (hicon) hicon.style.color = iconColor;
  if (hval) hval.textContent = h;
}

// Yıl sonunda o yılki yönetim kalitesine göre TEK bir sağlık düşüşü uygulanır
// (eskiden her kartta ayrı ayrı ±1 uygulanıyordu — bu, tek kötü bir seri
// yüzünden sağlığın "aniden" çökmüş gibi hissettiriyordu). 4 ana gücün 50
// merkeze olan ORTALAMA uzaklığı o yılın dengesini ölçer; 90 başlangıç
// sağlığıyla normal zorlukta: iyi yönetim ~56 yıl, ortalama ~13 yıl, kötü
// yönetim ~5-6 yıl yaşam sağlar (kasıtlı olarak sınırlı — mükemmel denge
// bile sonsuza kadar hayatta kalmayı sağlamaz).
function governanceHealthYearDelta() {
  const keys = ["saray", "yeniçeri", "ulema", "hazine"];
  const avgExtreme = keys.reduce((sum, k) => sum + Math.abs((stats[k] ?? 50) - 50), 0) / keys.length;
  if (avgExtreme <= 12) return -1.6; // iyi yönetim
  if (avgExtreme <= 25) return -7;   // ortalama yönetim
  return -16;                        // kötü yönetim
}

function changeHealth(delta) {
  sadrazamHealth = Math.max(0, Math.min(100, sadrazamHealth + delta));
  updateHealthUI();
  if (sadrazamHealth <= 0 && !isGameOver) {
    const isEN = window.LANG === 'en';
    triggerGameOver(isEN
      ? "Your body could bear no more. You died of exhaustion."
      : "Bedeniniz artık dayanamadı. Yorgunluktan hayatını kaybettiniz.", "saglik");
  }
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
  _updateCrisisPulse();
  updateHealthUI();

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

// ── Kriz nabzı (3 Ekim 2026) ──
// Bir güç ≤15 ya da ≥85 olunca ekran kenarlarında kızıl, kalp ritminde nabız ve o
// barda titreme. Sadece görüntü: #crisis-vignette pointer-events:none, #game içinde
// (oyun ekranı gizlenince o da gizlenir). Hareketi azalt açıkken CSS animasyonu durur.
const CRISIS_LOW = 15, CRISIS_HIGH = 85;
function _updateCrisisPulse() {
  const game = document.getElementById("game");
  if (!game) return;
  let v = document.getElementById("crisis-vignette");
  if (!v) { v = document.createElement("div"); v.id = "crisis-vignette"; v.setAttribute("aria-hidden", "true"); game.appendChild(v); }
  const map = { saray: "saray", "yeniçeri": "yeniceri", ulema: "ulema", hazine: "hazine" };
  let n = 0;
  for (const [key, id] of Object.entries(map)) {
    const crit = !isGameOver && (stats[key] <= CRISIS_LOW || stats[key] >= CRISIS_HIGH);
    if (crit) n++;
    document.querySelector(`.stat[data-stat="${id}"] .stat-track`)?.classList.toggle("crisis-shake", crit);
  }
  game.classList.toggle("crisis-on", n > 0);
  game.classList.toggle("crisis-2", n > 1);
}

// ── Titreyen etki bölgesi (3 Ekim 2026) ──
// Kart sürüklenirken, o seçeneğin dokunacağı barlarda bir ışık bandı titrer: genişlik
// etkinin büyüklüğü, konum barın şimdiki değeri. Artı mı eksi mi GÖSTERMEZ.
// Sadece normal karar kartlarında; Deneyimli Mod açıkken (sayılar zaten görünür) yok.
function _effectShimmer(side) {
  const map = { saray: "saray", "yeniçeri": "yeniceri", ulema: "ulema", hazine: "hazine" };
  const fx = (side && currentCard && !currentCard.type && currentCard.character !== "1-sultan" && !window.previewMode)
    ? (currentCard[side + "_effects"] || null) : null;
  for (const [key, id] of Object.entries(map)) {
    const track = document.querySelector(`.stat[data-stat="${id}"] .stat-track`);
    if (!track) continue;
    let sh = track.querySelector(".stat-shim");
    const v = fx ? Math.abs(fx[key] || 0) : 0;
    if (!v) { if (sh) sh.classList.remove("on"); continue; }
    if (!sh) { sh = document.createElement("span"); sh.className = "stat-shim"; track.appendChild(sh); }
    const w = Math.max(8, Math.min(32, v * 2.2)), cur = Math.max(0, Math.min(100, stats[key] ?? 50));
    sh.style.width = w + "%";
    sh.style.left = Math.max(0, Math.min(100 - w, cur - w / 2)) + "%";
    sh.classList.add("on");
  }
}

// ── Zamanlı kriz kartı / fitil (3 Ekim 2026) ──
// Kriz kartlarından biri (yılda en fazla 1) süreli gelir: kartın çerçevesi fitil gibi
// yanarak kısalır. Süre dolarsa "KARARSIZ" mührü basılır, kart sola gider ama sol
// seçeneğin bayrak/zincirleri DEĞİL, iki seçeneğin olumsuzlarının yarısı işler.
// Uygulama arka plandayken ya da bir pencere açıkken süre durur. Ayarlar: Normal/Yavaş/Kapalı.
const TIMED_BASE_MS = 8000;
const TIMED_DIFF = { kolay: 1.5, normal: 1, zor: 0.75, zor_asc1: 0.75 };
let _timedUsedYear = 0;
let _fuse = null; // { card, total, left, last, raf, svg }
function _timedSetting() { try { return localStorage.getItem('sadrazam_timed') || 'normal'; } catch (e) { return 'normal'; } }
function _isCrisisCard(c) { return !!c && !c.type && c.character !== "1-sultan" && !c.knot_of && (c.is_crisis || c.category === "crisis"); }
function _timeoutEffects(c) {
  const out = {}; let any = false;
  ["saray", "yeniçeri", "ulema", "hazine"].forEach(k => {
    const v = Math.round((Math.min(0, (c.left_effects || {})[k] || 0) + Math.min(0, (c.right_effects || {})[k] || 0)) / 2);
    if (v) { out[k] = v; any = true; }
  });
  if (!any) out.saray = -4; // iki seçenek de bedelsizse kararsızlığın bedeli Saray'dan
  return out;
}
function _fusePaused() {
  if (document.hidden) return true;
  if (_settOv && _settOv.style.display === 'flex') return true;
  return !!document.querySelector("#katib-overlay, #item-confirm-popup, #empty-slot-tip, #game-menu-overlay, #item-unlock-overlay, #item-info-popup, #esya-dukkani-overlay, #akce-screen.visible, #second-chance-overlay, #ferman-overlay, #divan-overlay, #divan-oturumu, .info-panel-overlay, #rel-rescue-overlay");
}
function _maybeStartFuse(c) {
  _stopFuse();
  const mode = _timedSetting();
  if (mode === 'off' || !_isCrisisCard(c) || _timedUsedYear === year || isGameOver) return;
  _timedUsedYear = year;
  const total = TIMED_BASE_MS * (TIMED_DIFF[difficultyId] || 1) * (mode === 'slow' ? 1.5 : 1);
  const r = card.getBoundingClientRect();
  const w = Math.max(10, card.offsetWidth || r.width), h = Math.max(10, card.offsetHeight || r.height);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "card-fuse"; svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="11" fill="none" class="fz-rope"/><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="11" fill="none" class="fz-burn"/><circle r="5" class="fz-spark"/><circle r="11" class="fz-glow"/>`;
  card.appendChild(svg);
  const burn = svg.querySelector(".fz-burn"); let len = 0;
  try { len = burn.getTotalLength(); } catch (e) { len = 2 * (w + h); }
  burn.style.strokeDasharray = len; burn.style.strokeDashoffset = 0;
  _fuse = { card: c, total, left: total, last: performance.now(), raf: 0, svg, burn, len };
  card.classList.add("fuse-on");
  try { if (localStorage.getItem('sadrazam_timed_seen') !== '1') { localStorage.setItem('sadrazam_timed_seen', '1'); _showTimedTip(); } } catch (e) {}
  try { Haptics.crisisCard(); } catch (e) {}
  const tick = (now) => {
    if (!_fuse || currentCard !== _fuse.card || isGameOver) { _stopFuse(); return; }
    const dt = now - _fuse.last; _fuse.last = now;
    if (!_fusePaused() && !isAnimating) _fuse.left -= dt;
    const p = Math.max(0, Math.min(1, 1 - _fuse.left / _fuse.total));
    _fuse.burn.style.strokeDashoffset = String(-_fuse.len * p);
    try {
      const pt = _fuse.burn.getPointAtLength(_fuse.len * p);
      ["fz-spark", "fz-glow"].forEach(cl => { const e = _fuse.svg.querySelector("." + cl); e.setAttribute("cx", pt.x); e.setAttribute("cy", pt.y); });
    } catch (e) {}
    card.classList.toggle("fuse-late", _fuse.left < 3000);
    if (_fuse.left <= 0) { _fuseTimeout(); return; }
    _fuse.raf = requestAnimationFrame(tick);
  };
  _fuse.raf = requestAnimationFrame(tick);
}
function _stopFuse() {
  if (_fuse) cancelAnimationFrame(_fuse.raf);
  _fuse = null;
  document.getElementById("card-fuse")?.remove();
  card.classList.remove("fuse-on", "fuse-late");
}
function _fuseTimeout() {
  const c = _fuse && _fuse.card;
  _stopFuse();
  if (!c || currentCard !== c || isGameOver || isAnimating) return;
  if (isDragging) { isDragging = false; card.classList.remove("dragging"); }
  const en = window.LANG === 'en';
  const st = document.createElement("div");
  st.id = "fuse-stamp"; st.textContent = en ? "UNDECIDED" : "KARARSIZ";
  card.appendChild(st);
  requestAnimationFrame(() => st.classList.add("on"));
  try { Haptics.statNegative(); } catch (e) {}
  // Kararsızlık: sol seçenek gibi uçar ama hiçbir bayrak/zincir/eşya tetiklemez
  currentCard = { ...c, _timeout: true,
    left_effects: _timeoutEffects(c), left_flags_set: [], triggers_on_left: null, triggers_arc_on_left: null, grants_item_on_left: null,
    left_text: "Kararsız kaldınız", left_text_en: "You hesitated" };
  setTimeout(() => { st.remove(); if (!isGameOver && currentCard && currentCard._timeout) flyOff("left"); }, 900);
}
function _showTimedTip() {
  const en = window.LANG === 'en';
  const t = document.createElement("div");
  t.id = "timed-tip";
  t.textContent = en ? "Crisis! Decide before the fuse burns out." : "Kriz! Fitil bitmeden karar ver.";
  document.getElementById("game")?.appendChild(t);
  requestAnimationFrame(() => t.classList.add("on"));
  setTimeout(() => { t.classList.remove("on"); setTimeout(() => t.remove(), 500); }, 2600);
}

// ── Sefer: harita oku (3 Ekim 2026) ──
// Savaş sonucu kartı gelince önce imparatorluk haritasında İstanbul'dan batıdaki
// prensliğe bir ok çizilir, varınca ZAFER / HEZİMET damgası basılır. Sonucu zar
// (rollSavasSonucu) zaten belirledi; bu sadece gösterim. Dokununca ya da 3 sn sonra kapanır.
function _showSeferMap(result) {
  document.getElementById("sefer-overlay")?.remove();
  const en = window.LANG === 'en', win = result === "win";
  const ov = document.createElement("div");
  ov.id = "sefer-overlay";
  ov.innerHTML = `
    <div class="sf-frame">
      <div class="sf-map" style="background-image:url('assets/characters/harita-overlay.jpg')"></div>
      <svg class="sf-svg" viewBox="0 0 100 142" preserveAspectRatio="none" aria-hidden="true">
        <path class="sf-path" d="M48.4 54 C 40 45, 27 44, 18 48.5" pathLength="100"/>
        <circle class="sf-city" cx="48.4" cy="54" r="1.6"/>
        <path class="sf-head" d="M0 0 L-3.2 -1.8 L-3.2 1.8 Z"/>
      </svg>
      <div class="sf-label">${en ? "CAMPAIGN · THE WESTERN PRINCIPALITY" : "SEFER · BATIDAKİ PRENSLİK"}</div>
      <div class="sf-stamp ${win ? "win" : "loss"}">${win ? (en ? "VICTORY" : "ZAFER") : (en ? "DEFEAT" : "HEZİMET")}</div>
    </div>`;
  document.body.appendChild(ov);
  try { if (window.playEvent_savas) playEvent_savas(); } catch (e) {}
  const path = ov.querySelector(".sf-path"), head = ov.querySelector(".sf-head");
  const t0 = performance.now(), DUR = 1500;
  const step = (now) => {
    if (!ov.isConnected) return;
    const p = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - p, 3);
    path.style.strokeDashoffset = String(100 - 100 * e);
    try {
      const L = path.getTotalLength(), a = path.getPointAtLength(L * e), b = path.getPointAtLength(Math.max(0, L * e - 0.6));
      head.setAttribute("transform", `translate(${a.x} ${a.y}) rotate(${Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI})`);
    } catch (err) {}
    if (p < 1) requestAnimationFrame(step);
    else { ov.querySelector(".sf-stamp").classList.add("on"); try { win ? Haptics.statPositive() : Haptics.statNegative(); } catch (err) {} }
  };
  requestAnimationFrame(() => { ov.classList.add("on"); requestAnimationFrame(step); });
  const close = () => { if (!ov.isConnected) return; ov.classList.remove("on"); setTimeout(() => ov.remove(), 350); };
  ov.addEventListener("click", close);
  setTimeout(close, 3200);
}

// ── Padişah Fermanı (3 Ekim 2026) ─────────────────────────────────────
// Her yılın başında Sultan 1 (5. yıldan sonra 2) talep verir; yıl sonunda bakılır.
// Getirildi: Sultan sabrı +12, Vezirler Defteri'ne 1 mühür, ömür boyu her 3 fermanda
// 1 akçe. Getirilmedi: sabır −12; üst üste 2 başarısızlıkta "Sultan'ın Gazabı" kartı.
// Kişi talepleri "hiçbir isteğini geri çevirme" biçiminde: karakter o yıl hiç gelmezse
// de yerine getirilmiş sayılır (yılda ~1 kez geldikleri için "2 kez kabul et" adil olmazdı).
// Yılda 1 kez 1 akçeyle ferman değiştirilebilir. Durum kayıtla saklanır.
const FERMAN_STATS = { saray: ["Saray", "the Palace"], "yeniçeri": ["Ordu", "the Army"], ulema: ["Ulema", "the Ulema"], hazine: ["Hazine", "the Treasury"] };
const FERMAN_PEOPLE = [
  { key: "5-valide-sultan", dir: "left",  tr: "Valide Sultan'ın hiçbir isteğini geri çevirme.", en: "Refuse none of the Valide Sultan's requests." },
  { key: "3-seyhulislam",   dir: "left",  tr: "Bu yıl Şeyhülislam'ı hiç kırma.", en: "Do not slight the Şeyhülislam this year." },
  { key: "2-yeniceri",      dir: "left",  tr: "Yeniçeri Ağası'nın hiçbir isteğini reddetme.", en: "Refuse none of the Janissary Commander's demands." },
  { key: "8-rakip-vezir",   dir: "right", tr: "Rakip Vezir'in hiçbir teklifini kabul etme.", en: "Accept none of the Rival Vizier's offers." },
  { key: "15-halk_temsilcisi", dir: "left", tr: "Halkın temsilcisini hiç geri çevirme.", en: "Never turn away the people's representative." },
];
const FERMAN_BANS = [
  { flag: "defterdar_borc_alındı", tr: "Bu yıl borç alma.", en: "Take no loans this year." },
  { flag: "savaş_başladı", tr: "Bu yıl savaş ilan etme.", en: "Declare no war this year." },
];
const FERMAN_INTROS = {
  kanuni: ["Sadrazamım, kanun herkese eşittir; senin işin onu yaşatmak. Bu yılın sonuna dek:", "My Grand Vizier, the law is equal for all; your task is to keep it alive. By the end of this year:"],
  yavuz:  ["Uzun söze gerek yok. Yıl bitmeden:", "No need for long words. Before the year is out:"],
  murad3: ["Sarayın huzuru bozulmasın, Sadrazam. Bu yıl içinde:", "Let the palace's peace remain unbroken, Grand Vizier. Within this year:"],
};
let _ferman = null;        // { year, demands:[...], rerolled }
let _fermanStreak = 0;     // üst üste başarısızlık
let _fermanQueue = [];     // gösterilecek pencereler
let _fermanShowing = false;

function _fermanPick(yr) {
  const ds = [], keys = Object.keys(FERMAN_STATS);
  const low = keys.slice().sort((a, b) => stats[a] - stats[b]).slice(0, 2);
  const k = low[Math.floor(Math.random() * low.length)];
  if (Math.random() < 0.6) {
    const X = Math.min(75, Math.max(45, Math.round((stats[k] + 8 + yr) / 5) * 5));
    ds.push({ t: "target", k, X });
  } else {
    const Y = Math.min(40, 25 + 5 * Math.floor((yr - 1) / 2));
    const kk = keys.filter(x => stats[x] > Y + 6);
    const pick = kk.length ? kk[Math.floor(Math.random() * kk.length)] : k;
    ds.push({ t: "keep", k: pick, Y, min: stats[pick] });
  }
  if (yr >= 5) {
    const opts = [];
    FERMAN_BANS.forEach((b, i) => { if (!activeFlags[b.flag]) opts.push({ t: "ban", i }); });
    FERMAN_PEOPLE.forEach((p, i) => opts.push({ t: "person", i, base: (characterMemory[p.key] || {})[p.dir] || 0 }));
    if (opts.length) ds.push(opts[Math.floor(Math.random() * opts.length)]);
  }
  return ds;
}
function _fermanNew(show) {
  if (isGameOver || !selectedSultan) return;
  _ferman = { year, demands: _fermanPick(year), rerolled: false };
  _renderFermanChip();
  if (show) _fermanEnqueue({ kind: "new" });
}
function _fermanDemandOk(d) {
  if (d.t === "target") return stats[d.k] >= d.X;
  if (d.t === "keep") return Math.min(d.min, stats[d.k]) >= d.Y;
  if (d.t === "ban") return !activeFlags[FERMAN_BANS[d.i].flag];
  if (d.t === "person") { const p = FERMAN_PEOPLE[d.i]; return (((characterMemory[p.key] || {})[p.dir]) || 0) === d.base; }
  return false;
}
function _fermanDemandText(d, en) {
  const L = en ? 1 : 0;
  if (d.t === "target") return en ? `Raise ${FERMAN_STATS[d.k][1]} to at least ${d.X} by year's end.` : `Yıl sonunda ${FERMAN_STATS[d.k][0]} en az ${d.X} olsun.`;
  if (d.t === "keep") return en ? `Do not let ${FERMAN_STATS[d.k][1]} fall below ${d.Y} all year.` : `${FERMAN_STATS[d.k][0]} yıl boyunca ${d.Y}'in altına düşmesin.`;
  if (d.t === "ban") return [FERMAN_BANS[d.i].tr, FERMAN_BANS[d.i].en][L];
  if (d.t === "person") return [FERMAN_PEOPLE[d.i].tr, FERMAN_PEOPLE[d.i].en][L];
  return "";
}
function _fermanProgress(d, en) {
  if (d.t === "target") return `${FERMAN_STATS[d.k][en ? 1 : 0].replace(/^the /, "")} ${Math.round(stats[d.k])}/${d.X}`;
  if (d.t === "keep") return `${FERMAN_STATS[d.k][en ? 1 : 0].replace(/^the /, "")} ≥${d.Y}`;
  return _fermanDemandOk(d) ? (en ? "kept" : "tutuldu") : (en ? "broken" : "bozuldu");
}
// decide() sonunda: "koru" talepleri için yılın en düşük değeri
function _fermanTrack() {
  if (!_ferman) return;
  _ferman.demands.forEach(d => { if (d.t === "keep") d.min = Math.min(d.min, stats[d.k]); });
  _renderFermanChip();
}
// advanceYear() başında (paywall kontrollerinden ÖNCE): biten yılın fermanına bakılır
function _fermanCloseYear() {
  if (!_ferman || _ferman.year !== year || isGameOver) return;
  const ok = _ferman.demands.every(_fermanDemandOk);
  const en = window.LANG === 'en';
  _fermanTotalThisGame++;
  let reward = "";
  if (ok) {
    _fermanStreak = 0;
    sultanSabir = Math.min(100, sultanSabir + 12);
    const total = _defterAddFerman();
    reward = en ? "Sultan's patience +12 · 1 seal to the Ledger" : "Sultan'ın sabrı +12 · Deftere 1 mühür";
    if (total % 3 === 0) { addAkce(1); reward += en ? " · +1 akce" : " · +1 akçe"; }
  } else {
    _fermanStreak++;
    sultanSabir = Math.max(0, sultanSabir - 12);
    reward = en ? "Sultan's patience −12" : "Sultan'ın sabrı −12";
    if (_fermanStreak >= 2) { _fermanStreak = 0; forcedQueue.unshift(_getGazapCard()); reward += en ? " · The Sultan is enraged" : " · Sultan öfkeli"; }
  }
  _fermanEnqueue({ kind: "result", ok, reward, ferman: _ferman });
  _ferman = null;
  _renderFermanChip();
  if (!ok) checkSultanSabir();
}
function _getGazapCard() {
  return { id: "sultan_gazabi_" + cardsPlayed, character: "1-sultan", character_name: "Sultan", character_name_en: "The Sultan",
    text: "İki yıldır fermanlarım yerde sürünüyor. Ya Divan'dan bir başını feda edersin ya da hazinem senin kesenden dolar.",
    text_en: "For two years my decrees have been trampled. Either you sacrifice a head from the Divan, or my treasury is filled from your own purse.",
    left_text: "Bir veziri feda et", left_text_en: "Sacrifice a vizier", right_text: "Kendi kesenden öde", right_text_en: "Pay from your purse",
    left_effects: { saray: 6, "yeniçeri": -8, ulema: -6, hazine: 0 }, right_effects: { saray: 4, "yeniçeri": 0, ulema: 0, hazine: -14 },
    left_flags_set: [], right_flags_set: [], required_flags: [], excluded_flags: [], weight: 1, category: "royal" };
}
function _fermanEnqueue(item) { _fermanQueue.push(item); if (!_fermanShowing) setTimeout(_fermanNext, 350); }
function _fermanNext() {
  const item = _fermanQueue.shift();
  if (!item) { _fermanShowing = false; return; }
  if (item.kind === "new" && (!_ferman || isGameOver)) { _fermanNext(); return; }
  _fermanShowing = true;
  _showFermanOverlay(item, () => { _fermanShowing = false; setTimeout(_fermanNext, 250); });
}
const _TUGRA_SVG = `<svg class="fm-tugra" viewBox="0 0 98 62" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M58 58V8" stroke-width="2.4"/><path d="M66 58V4" stroke-width="2.4"/><path d="M74 58V10" stroke-width="2.4"/><path d="M58 18c10-4 14 4 16-4" stroke-width="1.4"/><path d="M50 50C20 58 4 40 18 28c12-10 34 2 28 16-6 12-32 6-24-8" stroke-width="2"/><path d="M48 46c-18 6-30-6-20-12 8-4 18 4 12 10" stroke-width="1.5"/><path d="M40 58h52c4 0 4-6-2-6" stroke-width="2"/><path d="M80 52c4-10 10-8 12-2" stroke-width="1.4"/></g><circle cx="84" cy="34" r="2" fill="currentColor"/></svg>`;
function _waxSeal(kind) {
  // İnce, düzensiz kenarlı mum mühür. ok: kızıl mum + altın halka + "صح" (sahh: Osmanlı kâtiplerinin onay işareti)
  // fail: kurumuş koyu mum, ortadan çatlak
  // (50,50) merkezli, sabit "damla" sapmalarıyla düzensiz mum kenarı
  const J = [3, -2, 4, 1, -3, 2, 5, -1, 2, -4, 3, 0, 4, -2, 1, 3, -3, 2, 0, 4, -1, 2, -2, 3];
  const P = J.map((j, i) => { const a = i / J.length * Math.PI * 2, r = 43 + j * 0.55; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; });
  const M = P.map((p, i) => { const q = P[(i + 1) % P.length]; return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; });
  const f1 = (n) => n.toFixed(1);
  const edge = `M${f1(M[0][0])} ${f1(M[0][1])} ` + P.map((_, i) => { const p = P[(i + 1) % P.length], m = M[(i + 1) % P.length]; return `Q${f1(p[0])} ${f1(p[1])} ${f1(m[0])} ${f1(m[1])}`; }).join(" ") + "Z";
  if (kind === "ok") return `<svg class="fm-wax ok" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="wxg" cx="38%" cy="32%"><stop offset="0" stop-color="#d4473a"/><stop offset=".7" stop-color="#8a1d12"/><stop offset="1" stop-color="#5e110a"/></radialGradient></defs><path d="${edge}" fill="url(#wxg)"/><circle cx="50" cy="50" r="30" fill="none" stroke="#e8c84a" stroke-width="1.6"/><circle cx="50" cy="50" r="26" fill="none" stroke="#e8c84a" stroke-width=".6" stroke-dasharray="1.5 2"/><text x="50" y="60" text-anchor="middle" font-size="30" fill="#f3d98a" font-family="'Geeza Pro','Noto Naskh Arabic','Amiri',serif">صح</text></svg>`;
  return `<svg class="fm-wax fail" viewBox="0 0 100 100" aria-hidden="true"><path d="${edge}" fill="#2b211c"/><circle cx="50" cy="50" r="30" fill="none" stroke="#6d5a48" stroke-width="1.4"/><path d="M50 8 44 30 54 44 46 60 52 74 48 94" fill="none" stroke="#0b0806" stroke-width="3" stroke-linejoin="round"/><path d="M54 44 66 50M46 60 34 64" stroke="#0b0806" stroke-width="1.6"/></svg>`;
}
function _showFermanOverlay(item, done) {
  const en = window.LANG === 'en';
  const f = item.ferman || _ferman;
  if (!f) { done(); return; }
  const FROM = { kanuni: ["KANUNÎ SULTAN SÜLEYMAN'DAN", "FROM SULEIMAN THE MAGNIFICENT"], yavuz: ["YAVUZ SULTAN SELİM'DEN", "FROM SELIM THE GRIM"], murad3: ["SULTAN III. MURAD'DAN", "FROM SULTAN MURAD III"] };
  const fromTxt = (FROM[selectedSultan?.id] || FROM.kanuni)[en ? 1 : 0];
  const intro = (FERMAN_INTROS[selectedSultan?.id] || FERMAN_INTROS.kanuni)[en ? 1 : 0];
  const list = f.demands.map((d, i) => `<li><b>${["I", "II"][i]}.</b><span>${_fermanDemandText(d, en)}</span>${item.kind !== "new" ? `<em class="${_fermanDemandOk(d) ? "y" : "n"}">${_fermanDemandOk(d) ? "✓" : "✗"}</em>` : ""}</li>`).join("");
  const ov = document.createElement("div");
  ov.id = "ferman-overlay";
  let body;
  if (item.kind === "result") {
    body = `<div class="fm-kick">${en ? `DECREE OF ${f.year}` : `${f.year}. YILIN FERMANI`}</div>
      <ul class="fm-list">${list}</ul>
      <div class="fm-verdict ${item.ok ? "ok" : "fail"}">${_waxSeal(item.ok ? "ok" : "fail")}
        <div class="fm-vtext">${item.ok ? (en ? "FULFILLED" : "YERİNE GETİRİLDİ") : (en ? "NOT FULFILLED" : "YERİNE GETİRİLMEDİ")}</div>
        <div class="fm-vsub">${item.reward}</div></div>
      <button class="fm-btn" type="button">${en ? "CONTINUE" : "DEVAM"}</button>`;
  } else {
    const canReroll = item.kind === "new" && !f.rerolled;
    body = `${_TUGRA_SVG}<div class="fm-from">${fromTxt}</div>
      <p class="fm-intro">${intro}</p>
      <ul class="fm-list">${list}</ul>
      <div class="fm-stakes"><div class="ok">${en ? "If fulfilled" : "Yerine gelirse"}<b>${en ? "Patience +12 · 1 seal" : "Sabır +12 · 1 mühür"}</b></div><div class="no">${en ? "If not" : "Gelmezse"}<b>${en ? "Patience −12" : "Sabır −12"}</b></div></div>
      ${item.kind === "view" ? `<div class="fm-prog">${f.demands.map(d => _fermanProgress(d, en)).join(" · ")}</div>` : ""}
      <button class="fm-btn" type="button">${item.kind === "view" ? (en ? "CLOSE" : "KAPAT") : (en ? "AS YOU COMMAND" : "BAŞ ÜSTÜNE")}</button>
      ${canReroll ? `<button class="fm-reroll" type="button">${en ? "Ask for another decree" : "Başka ferman iste"} · 1 ${AKCE_COIN_SVG}</button><div class="fm-status"></div>` : ""}`;
  }
  ov.innerHTML = `<div class="fm-scroll ${item.kind}"><div class="fm-rod"></div><div class="fm-paper">${body}</div><div class="fm-rod"></div></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("on"));
  try { if (item.kind !== "view") (item.kind === "result" && !item.ok) ? Haptics.statNegative() : Haptics.letterArrival(); } catch (e) {}
  if (item.kind === "result") setTimeout(() => ov.querySelector(".fm-verdict")?.classList.add("stamped"), 650);
  const close = () => { ov.classList.remove("on"); setTimeout(() => { ov.remove(); done(); }, 320); };
  ov.querySelector(".fm-btn").onclick = close;
  const rr = ov.querySelector(".fm-reroll");
  if (rr) rr.onclick = () => {
    const st = ov.querySelector(".fm-status");
    if (!spendAkce(1)) { if (st) st.textContent = en ? "Not enough akce." : "Akçe yetmiyor."; return; }
    updateAkceUI();
    _ferman = { year, demands: _fermanPick(year), rerolled: true };
    _renderFermanChip();
    ov.remove(); _showFermanOverlay({ kind: "new" }, done);
  };
}
function _renderFermanChip() {
  const game = document.getElementById("game"); if (!game) return;
  let chip = document.getElementById("ferman-chip");
  if (!_ferman || isGameOver) { chip?.remove(); game.classList.remove("has-ferman"); return; }
  if (!chip) {
    chip = document.createElement("button"); chip.id = "ferman-chip"; chip.type = "button";
    chip.addEventListener("click", () => { if (_ferman && !_fermanShowing) { _fermanShowing = true; _showFermanOverlay({ kind: "view" }, () => { _fermanShowing = false; }); } });
    const sub = document.getElementById("dynamic-subtitle");
    if (sub && sub.parentNode) sub.insertAdjacentElement("afterend", chip); else game.appendChild(chip);
  }
  const en = window.LANG === 'en', d = _ferman.demands;
  const allOk = d.every(_fermanDemandOk);
  chip.innerHTML = `<span class="fc-k">${en ? "DECREE" : "FERMAN"}</span><span class="fc-v">${_fermanProgress(d[0], en)}${d.length > 1 ? ` <i>+1</i>` : ""}</span><span class="fc-dot ${allOk ? "y" : "n"}"></span>`;
  game.classList.add("has-ferman");
}

// ── Vezirler Defteri: kalıcı kayıt (Defter ekranı ayrı) ──
const DEFTER_KEY = "sadrazam_defter";
function _defterGet() { try { const d = JSON.parse(localStorage.getItem(DEFTER_KEY) || "{}"); return { seals: d.seals || 0, fermans: d.fermans || 0, claimed: d.claimed || 0, pages: Array.isArray(d.pages) ? d.pages : [], deaths: Array.isArray(d.deaths) ? d.deaths : [] }; } catch (e) { return { seals: 0, fermans: 0, claimed: 0, pages: [], deaths: [] }; } }
function _defterSet(d) { try { localStorage.setItem(DEFTER_KEY, JSON.stringify(d)); } catch (e) {} }
function _defterAddFerman() { const d = _defterGet(); d.fermans++; d.seals++; _defterSet(d); _fermanDoneThisGame++; return d.fermans; }
let _fermanDoneThisGame = 0, _fermanTotalThisGame = 0;

// ── Ana Kadro: ilişkiler (3 Ekim 2026) ─────────────────────────────────
// Altı karakter oyuncuyu hatırlar. Kendi kartlarında isteğini kabul (sağ) +1, ret (sol)
// −1 puan; 2 puan = 1 kademe (−3..+3). Divan Oturumu'nda destek ±2.
//   Müttefik (+2): o karakterin kendi kartlarındaki olumsuz etkiler −%20
//   Can Dostu (+3): saltanat başına bir kez, kendi alanındaki ölümden kurtarır
//   Hasım (−2): o karakterin kartlarındaki olumsuz etkiler +%20
//   Can Düşmanı (−3): saltanat başına bir kez, 15–25 kart sonra komplo kartı
// Sadece mevcut kartların etkisini çarpar; yeni kart akışı yalnız kurtarma/komplo/Divan.
const CAST = {
  "5-valide-sultan":  { tr: "Valide Sultan",   en: "Valide Sultan",        rescue: [["saray", 0, 30]] },
  "8-rakip-vezir":    { tr: "Rakip Vezir",     en: "Rival Vizier",         rescue: [["sabir", 0, 30]] },
  "2-yeniceri":       { tr: "Yeniçeri Ağası",  en: "Janissary Commander",  rescue: [["yeniçeri", 0, 30], ["yeniçeri", 100, 70]] },
  "3-seyhulislam":    { tr: "Şeyhülislam",     en: "Şeyhülislam",          rescue: [["ulema", 0, 30], ["ulema", 100, 70]] },
  "4-defterdar":      { tr: "Defterdar",       en: "Treasurer",            rescue: [["hazine", 0, 30], ["hazine", 100, 70]] },
  "14-casuslar_basi": { tr: "Casuslar Başı",   en: "Spymaster",            rescue: [["saray", 100, 70]] },
};
const REL_LEVELS = [
  { tr: "CAN DÜŞMANI", en: "SWORN ENEMY", c: "#c2412f" }, { tr: "HASIM", en: "ADVERSARY", c: "#d9774a" }, { tr: "SOĞUK", en: "COLD", c: "#b9a07a" },
  { tr: "TARAFSIZ", en: "NEUTRAL", c: "#8a8378" }, { tr: "YAKIN", en: "CLOSE", c: "#8fc79f" }, { tr: "MÜTTEFİK", en: "ALLY", c: "#4fae6c" }, { tr: "CAN DOSTU", en: "SWORN FRIEND", c: "#e8c84a" },
];
const RESCUE_TEXT = {
  "5-valide-sultan":  ["Valide Sultan, Sultan'ın kulağına eğildi: \"Oğlum, bu adam bize sadıktır.\" Ferman yırtıldı.", "The Valide Sultan leaned to her son's ear: \"My son, this man is loyal to us.\" The decree was torn up."],
  "8-rakip-vezir":    ["Rakip Vezir, beklenmedik biçimde senin için kefil oldu. Sultan azil kararını erteledi.", "Against all expectation, the Rival Vizier vouched for you. The Sultan postponed your dismissal."],
  "2-yeniceri":       ["Yeniçeri Ağası ocağı yatıştırdı: \"Sadrazam bizdendir.\" Kazanlar yerine kondu.", "The Janissary Commander calmed the corps: \"The Grand Vizier is one of us.\" The cauldrons were set back in place."],
  "3-seyhulislam":    ["Şeyhülislam cuma hutbesinde senin adını andırdı. Ulema saflarını yeniden düzenledi.", "The Şeyhülislam had your name spoken in the Friday sermon. The ulema closed ranks again."],
  "4-defterdar":      ["Defterdar, Hazine-i Enderun'un gizli sandığını açtı: \"Bu günler için saklamıştım, Paşam.\"", "The Treasurer opened the inner treasury's hidden chest: \"I kept this for days like these, Pasha.\""],
  "14-casuslar_basi": ["Casuslar Başı, Sultan'ın kuşkusunu besleyen mektubu yolda yakaladı ve yaktı.", "The Spymaster intercepted the letter feeding the Sultan's suspicion and burned it."],
};
const KOMPLO = {
  "5-valide-sultan":  { tr: ["Valide Sultan seni Haseki'yle aynı odaya çağırdı. \"Ya şehzadem için sancak, ya da Sultan'a senin mektuplarını okurum.\"", "Sancağı ver", "Mektupları yak, ne olursa olsun"], en: ["The Valide Sultan summoned you before the Haseki. \"Either a province for my prince, or I read your letters to the Sultan.\"", "Grant the province", "Burn the letters, come what may"], l: { saray: 6, "yeniçeri": -8, hazine: -8 }, r: { saray: -14, ulema: 4 } },
  "8-rakip-vezir":    { tr: ["Rakip Vezir, Divan'da senin aleyhine sahte bir zimmet defteri açtı. Herkes sana bakıyor.", "Defteri kabul et, öde", "Onu iftiracı ilan et"], en: ["In the Divan, the Rival Vizier opened a forged ledger accusing you of embezzlement. Every eye is on you.", "Accept the ledger, pay", "Denounce him as a slanderer"], l: { hazine: -14, saray: 4 }, r: { saray: -10, "yeniçeri": -5, ulema: 3 } },
  "2-yeniceri":       { tr: ["Yeniçeri Ağası, ocağı Et Meydanı'na topladı. \"Ya bahşiş, ya sadrazamın başı.\"", "Bahşişi dağıt", "Sipahileri çağır"], en: ["The Janissary Commander gathered the corps in the Meat Square. \"Either a bonus, or the Grand Vizier's head.\"", "Pay the bonus", "Call the cavalry"], l: { hazine: -14, "yeniçeri": 6 }, r: { "yeniçeri": -14, saray: 5 } },
  "3-seyhulislam":    { tr: ["Şeyhülislam, senin kararların için fetva hazırlattığını söyledi: \"Bid'at.\" Fetva cuma okunacak.", "Medreselere vakıf bağışla", "Fetvaya karşı çık"], en: ["The Şeyhülislam says he has had a fatwa drawn up against your rulings: \"Innovation.\" It will be read on Friday.", "Endow the madrasas", "Oppose the fatwa"], l: { hazine: -12, ulema: 6 }, r: { ulema: -14, saray: 4 } },
  "4-defterdar":      { tr: ["Defterdar hesapları kilitledi. \"Ya beni Hazine'nin tek sahibi yaparsın, ya maaş günü kasada akçe olmaz.\"", "Yetkiyi ver", "Defterleri el koy"], en: ["The Treasurer has locked the accounts. \"Make me sole master of the treasury, or there will be no coin on payday.\"", "Grant the authority", "Seize the ledgers"], l: { saray: -8, hazine: 4, ulema: -4 }, r: { hazine: -14, "yeniçeri": -4 } },
  "14-casuslar_basi": { tr: ["Casuslar Başı gece odana girdi. \"Senin hakkında bildiklerimi Venedik de bilmek istiyor. Fiyatımı biliyorsun.\"", "Fiyatını öde", "Onu zindana at"], en: ["The Spymaster entered your chamber at night. \"Venice wants to know what I know about you. You know my price.\"", "Pay his price", "Throw him in the dungeon"], l: { hazine: -13, saray: 3 }, r: { saray: -10, ulema: -4 } },
};
let relPoints = {};          // key -> -6..6
let _relRescued = {};        // key -> true (saltanat başına bir kez)
let _relKomploAt = {};       // key -> cardsPlayed (zamanlanmış komplo)
let _relKomploDone = {};
function relLevel(key) { const p = relPoints[key] || 0; return Math.max(-3, Math.min(3, Math.trunc(p / 2))); }
function _relName(lv, en) { return REL_LEVELS[lv + 3][en ? "en" : "tr"]; }
function _castName(key, en) { return CAST[key] ? CAST[key][en ? "en" : "tr"] : key; }
// decide(): kart etkileri uygulanmadan önce — kendi kartındaki olumsuzlar ilişkiye göre çarpılır
function _relAdjustEffects(card, fx) {
  if (!card || !CAST[card.character] || card._divan) return fx;
  const lv = relLevel(card.character);
  const m = lv >= 2 ? 0.8 : lv <= -2 ? 1.2 : 1;
  if (m === 1) return fx;
  const out = {};
  for (const [k, v] of Object.entries(fx || {})) out[k] = (typeof v === "number" && v < 0) ? Math.round(v * m) : v;
  return out;
}
function relChange(key, delta, quiet) {
  if (!CAST[key] || !delta) return;
  const before = relLevel(key);
  relPoints[key] = Math.max(-6, Math.min(6, (relPoints[key] || 0) + delta));
  const after = relLevel(key);
  if (after !== before) {
    if (!quiet) _showRelToast(key, before, after);
    if (after === -3 && !_relKomploDone[key] && _relKomploAt[key] == null) _relKomploAt[key] = cardsPlayed + 15 + Math.floor(Math.random() * 11);
    _maybeRelTip();
  }
}
function _relOnDecision(card, dir) {
  if (!card || card._divan || card._timeout || !CAST[card.character]) return;
  relChange(card.character, dir === "right" ? 1 : -1);
}
// checkGameOver / checkSultanSabir: Can Dostu kurtarması
function _relTryRescue(stat, edge) {
  for (const [key, c] of Object.entries(CAST)) {
    if (relLevel(key) < 3 || _relRescued[key]) continue;
    const r = c.rescue.find(([s, e]) => s === stat && e === edge);
    if (!r) continue;
    _relRescued[key] = true;
    if (stat === "sabir") sultanSabir = r[2]; else stats[stat] = r[2];
    updateStatUI();
    _showRescue(key);
    return true;
  }
  return false;
}
function _relDueKomplo() {
  for (const [key, at] of Object.entries(_relKomploAt)) {
    if (at == null || cardsPlayed < at || _relKomploDone[key]) continue;
    _relKomploDone[key] = true; _relKomploAt[key] = null;
    if (relLevel(key) > -3) continue; // bu arada barışıldıysa komplo yok
    const k = KOMPLO[key];
    const card = { id: "komplo_" + key + "_" + cardsPlayed, character: key, character_name: CAST[key].tr, character_name_en: CAST[key].en,
      text: k.tr[0], text_en: k.en[0], left_text: k.tr[1], left_text_en: k.en[1], right_text: k.tr[2], right_text_en: k.en[2],
      left_effects: k.l, right_effects: k.r, left_flags_set: [], right_flags_set: [], required_flags: [], excluded_flags: [], weight: 1, category: "intrigue", _komplo: true };
    forcedQueue.unshift(card);
    // komplo çözülünce ilişki Hasım'a döner
    relPoints[key] = -4;
  }
}
function _showRelToast(key, before, after) {
  const game = document.getElementById("game"); if (!game) return;
  const en = window.LANG === 'en', up = after > before, L = REL_LEVELS[after + 3];
  const t = document.createElement("div");
  t.className = "rel-toast";
  t.innerHTML = `<span class="rt-med" style="background-image:url('assets/characters/${encodeURIComponent(key)}.jpg');--rc:${L.c}"></span><span class="rt-txt"><b>${_castName(key, en)}</b><em style="color:${L.c}">${up ? "▲" : "▼"} ${L[en ? "en" : "tr"]}</em></span>`;
  game.appendChild(t);
  requestAnimationFrame(() => t.classList.add("on"));
  setTimeout(() => { t.classList.remove("on"); setTimeout(() => t.remove(), 400); }, 2300);
}
function _showRescue(key) {
  const en = window.LANG === 'en';
  const ov = document.createElement("div");
  ov.id = "rel-rescue-overlay";
  ov.innerHTML = `<div class="rr-box"><div class="rr-k">${en ? "SWORN FRIEND" : "CAN DOSTU"}</div><div class="rr-med" style="background-image:url('assets/characters/${encodeURIComponent(key)}.jpg')"></div><div class="rr-name">${_castName(key, en)}</div><p>${RESCUE_TEXT[key][en ? 1 : 0]}</p><button type="button">${en ? "CONTINUE" : "DEVAM"}</button></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("on"));
  try { Haptics.achievement(); } catch (e) {}
  ov.querySelector("button").onclick = () => { ov.classList.remove("on"); setTimeout(() => ov.remove(), 300); };
}
// İlk kademe değişiminde bir kez: ilişkiler nasıl çalışır
function _maybeRelTip() {
  try { if (localStorage.getItem("sadrazam_rel_tip") === "1") return; localStorage.setItem("sadrazam_rel_tip", "1"); } catch (e) { return; }
  setTimeout(() => _showInfoPanel(window.LANG === 'en'
    ? ["THE PEOPLE OF THE DIVAN", "Six people remember you: the Valide Sultan, the Rival Vizier, the Janissary Commander, the Şeyhülislam, the Treasurer and the Spymaster. Grant their requests and they draw closer; refuse and they drift away.", "An Ally softens the harm their own requests do you. A Sworn Friend saves you from death once. A Sworn Enemy plots against you. You can see everyone in the menu, under Divan Circle."]
    : ["DİVAN'IN İNSANLARI", "Altı kişi seni hatırlar: Valide Sultan, Rakip Vezir, Yeniçeri Ağası, Şeyhülislam, Defterdar ve Casuslar Başı. İsteklerini kabul ettikçe yakınlaşır, reddettikçe uzaklaşırsın.", "Müttefikin kendi isteklerinin sana verdiği zararı azaltır. Can dostun seni bir kez ölümden kurtarır. Can düşmanın komplo kurar. Herkesi menüde, Divan Halkası'nda görebilirsin."]), 900);
}
function _showInfoPanel([title, p1, p2]) {
  const ov = document.createElement("div");
  ov.className = "info-panel-overlay";
  ov.innerHTML = `<div class="ip-box"><div class="ip-title">${title}</div><div class="ip-div"></div><p>${p1}</p><p>${p2}</p><button type="button">${window.LANG === 'en' ? "UNDERSTOOD" : "ANLADIM"}</button></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("on"));
  ov.querySelector("button").onclick = () => { ov.classList.remove("on"); setTimeout(() => ov.remove(), 300); };
}
// Kartta ilişki işareti (isim yanında 3 nokta)
function _renderCardRel(c) {
  let el = document.getElementById("card-rel");
  if (!el) { el = document.createElement("span"); el.id = "card-rel"; charName.insertAdjacentElement("afterend", el); }
  if (!c || !CAST[c.character] || c.type) { el.innerHTML = ""; el.style.display = "none"; return; }
  const lv = relLevel(c.character), L = REL_LEVELS[lv + 3], n = Math.abs(lv), en = window.LANG === 'en';
  el.style.display = "";
  el.innerHTML = `<span class="cr-dots">${[0, 1, 2].map(i => `<i style="${i < n ? `background:${L.c};border-color:${L.c}` : `border-color:${L.c}`}"></i>`).join("")}</span><span class="cr-lbl" style="color:${L.c}">${L[en ? "en" : "tr"]}</span>`;
}
// Divan Halkası (oyun içi menü)
function showDivanHalkasi() {
  const en = window.LANG === 'en';
  const ov = document.createElement("div");
  ov.className = "info-panel-overlay";
  const rows = Object.keys(CAST).map(k => {
    const lv = relLevel(k), L = REL_LEVELS[lv + 3];
    const perk = lv >= 3 ? (_relRescued[k] ? (en ? "Rescue used" : "Kurtarma kullanıldı") : (en ? "Will save you once" : "Seni bir kez kurtarır")) : lv === 2 ? (en ? "Their harm −20%" : "Verdiği zarar −%20") : lv === -2 ? (en ? "Their harm +20%" : "Verdiği zarar +%20") : lv <= -3 ? (en ? "Plotting against you" : "Komplo kuruyor") : "";
    return `<div class="dh-row"><span class="dh-med" style="background-image:url('assets/characters/${encodeURIComponent(k)}.jpg');--rc:${L.c}"></span><span class="dh-info"><b>${_castName(k, en)}</b><em style="color:${L.c}">${L[en ? "en" : "tr"]}</em>${perk ? `<small>${perk}</small>` : ""}</span></div>`;
  }).join("");
  ov.innerHTML = `<div class="ip-box dh-box"><div class="ip-title">${en ? "DIVAN CIRCLE" : "DİVAN HALKASI"}</div><div class="ip-div"></div><div class="dh-list">${rows}</div><p class="dh-note">${en ? "Grant requests to draw closer, refuse to drift apart." : "İsteklerini kabul ettikçe yakınlaşır, reddettikçe uzaklaşırsın."}</p><button type="button">${en ? "CLOSE" : "KAPAT"}</button></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("on"));
  ov.querySelector("button").onclick = () => { ov.classList.remove("on"); setTimeout(() => ov.remove(), 300); };
}

// ── Divan Oturumu (3 Ekim 2026) ─────────────────────────────────────────
// Yılda bir (yılın 12. kartında) ana kadrodan üç kişi aynı meseleyi tartışır. Bir
// portreye dokun → etkileri ve kimin küseceğini gör → MÜHÜRLE. Desteklenen +2, diğer
// ikisi −2 puan. "Kararı Sultan'a bırak": etkisiz, ilişki değişmez, Sultan sabrı −5.
// Kart sayılır (cardsPlayed++), normal karar yolundan (decide) geçer.
const DIVAN_ISSUES = [
  { tr: "Sefer için hazineden ne kadar ayrılsın?", en: "How much of the treasury should go to the campaign?", seats: [
    ["4-defterdar", "Sefer hazineyi boşaltır. Önce borçları kapatalım.", "A campaign empties the treasury. Settle the debts first.", { hazine: 8, "yeniçeri": -6 }],
    ["2-yeniceri", "Ocak sefer bekliyor. Kılıç paslanırsa isyan çıkar.", "The corps awaits a campaign. A rusting sword breeds revolt.", { "yeniçeri": 10, hazine: -9 }],
    ["3-seyhulislam", "Fetva hazır: gaza farzdır. Ama önce halkın duası.", "The fatwa is ready: holy war is a duty. But first, the people's prayers.", { ulema: 8, saray: -4 }]] },
  { tr: "Venedik yeni ticaret ayrıcalıkları istiyor.", en: "Venice asks for new trade privileges.", seats: [
    ["4-defterdar", "Gümrük gelirimiz ikiye katlanır.", "Our customs revenue would double.", { hazine: 9, ulema: -5 }],
    ["3-seyhulislam", "Kâfire imtiyaz, ümmete zarardır.", "Privileges for the infidel harm the faithful.", { ulema: 8, hazine: -6 }],
    ["14-casuslar_basi", "Verelim; karşılığında Venedik'in sırlarını alırız.", "Grant it; in return we take Venice's secrets.", { saray: 6, "yeniçeri": -5 }]] },
  { tr: "Akçenin ayarını düşürelim mi?", en: "Should we debase the akce?", seats: [
    ["4-defterdar", "Gümüşü azaltırsak kasa nefes alır.", "Less silver in the coin, and the treasury breathes.", { hazine: 12, "yeniçeri": -8, ulema: -3 }],
    ["2-yeniceri", "Ocak, ayarı düşük akçeyle ödenmez!", "The corps will not be paid in debased coin!", { "yeniçeri": 8, hazine: -8 }],
    ["5-valide-sultan", "Akçeye dokunmayın; saray harcamasını kısarım.", "Leave the coin alone; I will cut the palace's spending.", { saray: -6, hazine: 6 }]] },
  { tr: "Yeni vakıf geliri medreseye mi, kışlaya mı?", en: "The new endowment income: the madrasa or the barracks?", seats: [
    ["3-seyhulislam", "İlim olmadan devlet ayakta durmaz.", "Without learning, no state endures.", { ulema: 9, "yeniçeri": -5 }],
    ["2-yeniceri", "Sınırda kılıç yoksa medreseyi kim korur?", "If there is no sword at the border, who guards the madrasa?", { "yeniçeri": 9, ulema: -5 }],
    ["4-defterdar", "İkisine de değil; hazinede kalsın.", "Neither; keep it in the treasury.", { hazine: 7, ulema: -3, "yeniçeri": -3 }]] },
  { tr: "Şehzade nerede yetişsin?", en: "Where should the prince be raised?", seats: [
    ["5-valide-sultan", "Manisa'ya gitsin; dedeleri gibi sancakta pişsin.", "Send him to Manisa; let him be forged in a province like his forefathers.", { saray: 8, "yeniçeri": -4 }],
    ["8-rakip-vezir", "İstanbul'da kalsın, göz önünde olsun.", "Let him stay in Istanbul, where we can watch him.", { saray: -5, ulema: 5 }],
    ["14-casuslar_basi", "Nereye giderse gitsin, yanına bizim adamımızı verelim.", "Wherever he goes, let him go with one of our men.", { saray: 4, hazine: -5 }]] },
  { tr: "Kahvehaneler fitne yuvası mı?", en: "Are the coffeehouses nests of sedition?", seats: [
    ["3-seyhulislam", "Kapatılsın; namaz vakti kahve içiliyor.", "Close them; they drink coffee at prayer time.", { ulema: 9, hazine: -5 }],
    ["4-defterdar", "Kapatmayın, vergilendirin.", "Don't close them, tax them.", { hazine: 8, ulema: -6 }],
    ["14-casuslar_basi", "Açık kalsınlar; şehrin kulağı oradadır.", "Let them stay open; the city's ear is there.", { saray: 5, ulema: -4 }]] },
  { tr: "Kıtlık var: ambarlardaki tahıl ne olsun?", en: "There is famine: what of the grain in the stores?", seats: [
    ["4-defterdar", "İhracat sürsün; Venedik iyi fiyat veriyor.", "Keep exporting; Venice pays well.", { hazine: 9, ulema: -6 }],
    ["2-yeniceri", "Önce ordunun ambarı dolsun.", "Fill the army's stores first.", { "yeniçeri": 8, saray: -5 }],
    ["5-valide-sultan", "Halka dağıtın; Valide'nin aşevleri açılsın.", "Give it to the people; open the Valide's soup kitchens.", { ulema: 6, hazine: -8 }]] },
  { tr: "Rakip Vezir'in sürgünü isteniyor.", en: "There are calls to exile the Rival Vizier.", seats: [
    ["14-casuslar_basi", "Elimizde mektupları var. Sürülsün.", "We have his letters. Exile him.", { saray: 6, "yeniçeri": -5 }],
    ["5-valide-sultan", "Affedin; affeden sultan güçlüdür.", "Pardon him; a sultan who pardons is strong.", { ulema: 5, saray: -4 }],
    ["8-rakip-vezir", "Beni Divan'da tutun; işinize yararım.", "Keep me in the Divan; I will be of use.", { hazine: 6, saray: -6 }]] },
];
let _divanYear = 0;
let _divanUsed = [];
function _maybeQueueDivan() {
  if (_divanYear === year || cardsPlayed % CARDS_PER_YEAR !== 12) return;
  _divanYear = year;
  let pool = DIVAN_ISSUES.map((_, i) => i).filter(i => !_divanUsed.includes(i));
  if (!pool.length) { _divanUsed = []; pool = DIVAN_ISSUES.map((_, i) => i); }
  const idx = pool[Math.floor(Math.random() * pool.length)];
  _divanUsed.push(idx);
  forcedQueue.push({ id: "divan_oturumu_" + year, type: "divan", _issue: idx });
}
function showDivanOturumu(c) {
  const issue = DIVAN_ISSUES[c._issue] || DIVAN_ISSUES[0];
  const en = window.LANG === 'en';
  card.classList.add("no-swipe");
  _setSideTabs(null);
  const fxTxt = (fx) => Object.entries(fx).map(([k, v]) => `${({ saray: en ? "Palace" : "Saray", "yeniçeri": en ? "Army" : "Ordu", ulema: "Ulema", hazine: en ? "Treasury" : "Hazine" })[k]} ${v > 0 ? "+" : ""}${v}`).join(" · ");
  const ov = document.createElement("div");
  ov.id = "divan-oturumu";
  ov.innerHTML = `<div class="dv-box">
    <div class="dv-k">${en ? "IMPERIAL COUNCIL · UNDER THE DOME" : "DİVAN-I HÜMAYUN · KUBBEALTI"}</div>
    <div class="dv-issue">${issue[en ? "en" : "tr"]}</div>
    <div class="dv-seats">${issue.seats.map((s, i) => { const lv = relLevel(s[0]), L = REL_LEVELS[lv + 3]; return `
      <button type="button" class="dv-seat" data-i="${i}">
        <span class="dv-med" style="background-image:url('assets/characters/${encodeURIComponent(s[0])}.jpg');--rc:${L.c}"></span>
        <span class="dv-who">${_castName(s[0], en)}</span>
        <span class="dv-rel" style="color:${L.c}">${L[en ? "en" : "tr"]}</span>
        <span class="dv-say">“${en ? s[2] : s[1]}”</span>
        <span class="dv-fx">${fxTxt(s[3])}</span>
        <span class="dv-delta"></span>
      </button>`; }).join("")}</div>
    <div class="dv-hint">${en ? "Back one voice. The other two will remember." : "Bir görüşü destekle. Diğer ikisi bunu unutmaz."}</div>
    <button type="button" class="dv-seal" disabled>${en ? "SEAL THE DECISION" : "MÜHÜRLE"}</button>
    <button type="button" class="dv-sultan">${en ? "Leave it to the Sultan · Patience −5" : "Kararı Sultan'a bırak · Sabır −5"}</button>
  </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("on"));
  try { Haptics.letterArrival(); } catch (e) {}
  let sel = -1, done = false;
  const seats = [...ov.querySelectorAll(".dv-seat")], sealBtn = ov.querySelector(".dv-seal");
  seats.forEach(b => b.onclick = () => {
    sel = +b.dataset.i;
    ov.classList.add("chosen");
    seats.forEach((s, j) => { s.classList.toggle("sel", j === sel); const d = s.querySelector(".dv-delta"); d.textContent = j === sel ? (en ? "▲ closer" : "▲ yakınlaşır") : (en ? "▼ resents" : "▼ küser"); d.className = "dv-delta " + (j === sel ? "up" : "down"); });
    sealBtn.disabled = false;
  });
  const finish = (choice) => {
    if (done) return; done = true;
    ov.classList.remove("on");
    setTimeout(() => ov.remove(), 300);
    card.classList.remove("no-swipe");
    let synth;
    if (choice < 0) {
      sultanSabir = Math.max(0, sultanSabir - 5);
      synth = { id: c.id, _divan: true, _noCurse: true, character: "", right_effects: {}, right_flags_set: [] };
    } else {
      const s = issue.seats[choice];
      issue.seats.forEach((o, j) => relChange(o[0], j === choice ? 2 : -2));
      synth = { id: c.id, _divan: true, _noCurse: true, character: s[0], character_name: CAST[s[0]].tr, character_name_en: CAST[s[0]].en,
        right_text: s[1], right_text_en: s[2], right_effects: { ...s[3] }, right_flags_set: [] };
    }
    currentCard = synth;
    decide("right");
    if (choice < 0) checkSultanSabir();
  };
  sealBtn.onclick = () => { if (sel >= 0) finish(sel); };
  ov.querySelector(".dv-sultan").onclick = () => finish(-1);
}

// ── Vezirler Defteri (3 Ekim 2026) ────────────────────────────────────
// Her saltanat bir sayfa (sultan, süre, ferman, ölüm, en büyük olay). Mühürler:
// yerine getirilen her ferman 1, ilk kez görülen her ölüm sebebi 1. Her 5 mühürde
// Divan'dan ihsan: 3 akçe. Ana menüden ve ölüm ekranından açılır.
const DEFTER_IHSAN_EVERY = 5, DEFTER_IHSAN_AKCE = 3, DEFTER_MAX_PAGES = 40;
const DEATH_TITLES = {
  saray_0: ["İdam Fermanı", "Death Warrant"], saray_100: ["Tahtın Gölgesi", "The Throne's Shadow"],
  yeniceri_0: ["Dağılan Ordu", "The Army Scattered"], yeniceri_100: ["Kazan Kalktı", "The Cauldrons Overturned"],
  ulema_0: ["Hutbede Okunmayan Ad", "A Name Left Unspoken"], ulema_100: ["Şeyhülislam'ın Divanı", "The Şeyhülislam's Divan"],
  hazine_0: ["İflas", "Bankruptcy"], hazine_100: ["Zimmet", "Embezzlement"], saglik: ["Son Nefes", "The Last Breath"],
  azil: ["Hac Yolu Sürgünü", "Exile on the Pilgrim Road"], sultan_guc: ["İki Cellat", "Two Executioners"],
  padisah_red: ["Sultan'ın Gazabı", "The Sultan's Wrath"], sehzade: ["Şehzadenin Hamlesi", "The Prince's Gambit"],
  yanlis_oda: ["Yanlış Oda", "The Wrong Room"], free_limit: ["Mühür Geri Döndü", "The Seal Returned"],
};
let _defterSealsThisGame = 0, _defterIhsanThisGame = 0;
function _defterRecordReign() {
  const d = _defterGet();
  const top = chronicle.slice().sort((a, b) => (b.sc - a.sc) || (b.hy - a.hy))[0];
  const cause = _deathCause || "";
  let deathSeal = 0;
  if (cause && cause !== "free_limit" && !d.deaths.includes(cause)) { d.deaths.push(cause); d.seals++; deathSeal = 1; }
  d.pages.unshift({ s: selectedSultan?.id || "kanuni", y: year, h0: (selectedSultan && SULTAN_HICRI_START[selectedSultan.id]) || hicriYear, h1: hicriYear,
    f: _fermanDoneThisGame, ft: _fermanTotalThisGame, c: cause, ev: top ? [top.n, top.ne, top.t, top.te] : null, sl: _fermanDoneThisGame + deathSeal });
  d.pages = d.pages.slice(0, DEFTER_MAX_PAGES);
  _defterSet(d);
  _defterSealsThisGame = _fermanDoneThisGame + deathSeal;
  _defterIhsanThisGame = _defterClaimIhsan();
}
// Birikmiş mühür eşikleri için akçe ihsanı (bir kez)
function _defterClaimIhsan() {
  const d = _defterGet(); const due = Math.floor(d.seals / DEFTER_IHSAN_EVERY);
  const claimed = d.claimed || 0;
  if (due > claimed) { addAkce((due - claimed) * DEFTER_IHSAN_AKCE); d.claimed = due; _defterSet(d); updateAkceUI(); return (due - claimed) * DEFTER_IHSAN_AKCE; }
  return 0;
}
function _miniSeal(on, big) {
  const r = big ? 13 : 10.5;
  return on
    ? `<svg class="df-seal on${big ? " big" : ""}" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="${r + 1.5}" fill="#7a1a12" opacity=".35"/><circle cx="15" cy="15" r="${r}" fill="url(#dfw)"/><circle cx="15" cy="15" r="${r - 3.2}" fill="none" stroke="#e8c84a" stroke-width=".9"/><path d="M15 ${15 - r * 0.42}l1.3 3.4 3.6.2-2.8 2.2 1 3.5-3.1-2-3.1 2 1-3.5-2.8-2.2 3.6-.2z" fill="#e8c84a" transform="translate(0 0.6) scale(1)"/></svg>`
    : `<svg class="df-seal${big ? " big" : ""}" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="${r}" fill="none" stroke="#8a6a3a" stroke-width=".8" stroke-dasharray="1.6 1.6" opacity=".7"/>${big ? `<text x="15" y="18.2" text-anchor="middle" font-family="Cinzel, serif" font-size="8.5" font-weight="700" fill="#8a5a10">+${DEFTER_IHSAN_AKCE}</text>` : ""}</svg>`;
}
function showDefter(startPage) {
  const en = window.LANG === 'en', d = _defterGet();
  const S = { kanuni: ["Kanunî Sultan Süleyman", "Suleiman the Magnificent"], yavuz: ["Yavuz Sultan Selim", "Selim the Grim"], murad3: ["Sultan III. Murad", "Sultan Murad III"] };
  let idx = Math.max(0, Math.min(d.pages.length - 1, startPage || 0));
  const ov = document.createElement("div");
  ov.id = "defter-overlay";
  const pageHTML = () => {
    if (!d.pages.length) return `<div class="df-empty">${en ? "No reign has been recorded yet. Your first page is written when your first reign ends." : "Henüz kaydedilmiş bir saltanat yok. İlk sayfan, ilk saltanatın bittiğinde yazılır."}</div>`;
    const p = d.pages[idx], no = d.pages.length - idx;
    const ev = p.ev ? `<div class="df-ev"><span>${en ? "The great event" : "En büyük olay"}</span>${en ? p.ev[1] : p.ev[0]} · “${en ? p.ev[3] : p.ev[2]}”</div>` : "";
    const dt = DEATH_TITLES[p.c] ? DEATH_TITLES[p.c][en ? 1 : 0] : (en ? "Unknown" : "Bilinmiyor");
    return `<div class="df-no">${en ? `PAGE ${no}` : `SAYFA ${no}`}</div>
      <div class="df-name">${en ? `Grand Vizier under ${(S[p.s] || S.kanuni)[1]}` : `${(S[p.s] || S.kanuni)[0]}'ın Sadrazamı`.replace("Selim'ın", "Selim'in").replace("Murad'ın", "Murad'ın")}</div>
      <div class="df-rows">
        <div><span>${en ? "Reign" : "Saltanat"}</span><b>${p.h0}–${p.h1} ${en ? "AH" : "H."} · ${p.y} ${en ? (p.y === 1 ? "year" : "years") : "yıl"}</b></div>
        <div><span>${en ? "Decrees" : "Fermanlar"}</span><b>${p.f} / ${p.ft}</b></div>
        <div><span>${en ? "The end" : "Son"}</span><b>${dt}</b></div>
        <div><span>${en ? "Seals earned" : "Kazanılan mühür"}</span><b>${p.sl || 0}</b></div>
      </div>${ev}`;
  };
  const trackHTML = () => {
    const n = d.seals, nextM = (Math.floor(n / DEFTER_IHSAN_EVERY) + 1) * DEFTER_IHSAN_EVERY, from = nextM - DEFTER_IHSAN_EVERY;
    const cells = []; for (let i = from; i < nextM; i++) cells.push(_miniSeal(i < n, i === nextM - 1));
    return `<div class="df-total"><b>${n}</b><span>${en ? "SEALS" : "MÜHÜR"}</span></div>
      <div class="df-track">${cells.join("")}</div>
      <div class="df-next">${en ? `${nextM - n} more seal${nextM - n === 1 ? "" : "s"} · a gift of ${DEFTER_IHSAN_AKCE} akce from the Divan` : `${nextM - n} mühür sonra · Divan'dan ${DEFTER_IHSAN_AKCE} akçe ihsan`}</div>
      <div class="df-how"><span>${en ? "How seals are earned" : "Mühür nasıl kazanılır"}</span>${en ? "Fulfil the Sultan's decree: 1 seal. Meet an end you have never met before: 1 seal." : "Padişah fermanını yerine getir: 1 mühür. Daha önce görmediğin bir sonla karşılaş: 1 mühür."}</div>
      <div class="df-stat">${en ? `${d.fermans} decrees fulfilled · ${d.deaths.length} different ends` : `${d.fermans} ferman yerine getirildi · ${d.deaths.length} farklı son`}</div>`;
  };
  ov.innerHTML = `<svg width="0" height="0" style="position:absolute"><defs><radialGradient id="dfw" cx="38%" cy="32%"><stop offset="0" stop-color="#d4473a"/><stop offset=".75" stop-color="#8a1d12"/><stop offset="1" stop-color="#5e110a"/></radialGradient></defs></svg>
    <div class="df-book">
      <div class="df-title">${en ? "THE VIZIERS' LEDGER" : "VEZİRLER DEFTERİ"}</div>
      <div class="df-spread">
        <div class="df-page df-left"><div class="df-pagein">${pageHTML()}</div>
          ${d.pages.length > 1 ? `<div class="df-nav"><button type="button" class="df-prev" aria-label="${en ? "Older" : "Önceki"}">‹</button><span>${idx + 1} / ${d.pages.length}</span><button type="button" class="df-next-btn" aria-label="${en ? "Newer" : "Sonraki"}">›</button></div>` : ""}</div>
        <div class="df-page df-right">${trackHTML()}</div>
      </div>
      <button type="button" class="df-close">${en ? "CLOSE" : "KAPAT"}</button>
    </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("on"));
  const flip = (dir) => {
    const ni = idx + dir; if (ni < 0 || ni >= d.pages.length) return;
    const pg = ov.querySelector(".df-left");
    pg.classList.remove("flip-l", "flip-r"); void pg.offsetWidth; pg.classList.add(dir > 0 ? "flip-l" : "flip-r");
    setTimeout(() => { idx = ni; ov.querySelector(".df-pagein").innerHTML = pageHTML(); const sp = ov.querySelector(".df-nav span"); if (sp) sp.textContent = `${idx + 1} / ${d.pages.length}`; }, 180);
  };
  ov.querySelector(".df-prev")?.addEventListener("click", () => flip(1));
  ov.querySelector(".df-next-btn")?.addEventListener("click", () => flip(-1));
  ov.querySelector(".df-close").onclick = () => { ov.classList.remove("on"); setTimeout(() => ov.remove(), 300); };
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

// persistent: akçeyle SATIN ALINAN eşya kullanılana kadar kalır (eskiden kazanılan
// eşyalar gibi 3 kartta tükeniyordu — oyuncu parasını verip kullanamadan kaybediyordu).
function gainItem(itemId, persistent) {
  if (!ITEMS[itemId]) return;
  uniqueItemsCollected.add(itemId);
  const emptySlot = playerItems.indexOf(null);
  const slot = emptySlot === -1 ? 0 : emptySlot;
  playerItems[slot] = itemId;
  playerItemExpiry[slot] = persistent ? null : 3; // kazanılan eşya 3 kart sonra tükenir
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

  const _isENiip = window.LANG === 'en';
  const _itmEN = (_isENiip && window.EN_ITEMS) ? window.EN_ITEMS[itemId] : null;
  const _itmName = _itmEN ? _itmEN.name : itm.name;
  const howToUse = (_isENiip && window.EN_ITEM_HOW_TO_USE && window.EN_ITEM_HOW_TO_USE[itemId])
    ? window.EN_ITEM_HOW_TO_USE[itemId]
    : (ITEM_HOW_TO_USE[itemId] || itm.desc);
  const cond = ITEM_GRANT_CONDITIONS[itemId];
  const _condDesc = cond
    ? (_isENiip && window.EN_ITEM_GRANT_CONDITIONS && window.EN_ITEM_GRANT_CONDITIONS[itemId]
        ? window.EN_ITEM_GRANT_CONDITIONS[itemId]
        : cond.desc)
    : null;
  const _howToDesc = _isENiip
    ? "Tap the item slot at the bottom of the screen → Select 'Use' → It activates automatically when the next card arrives."
    : "Ekranın altındaki eşya slotuna dokun → \"Kullan\" seç → Sonraki kart geldiğinde otomatik devreye girer.";

  const popup = document.createElement("div");
  popup.id = "item-info-popup";
  popup.innerHTML = `
    <div id="iip-box">
      <div id="iip-header">
        <img id="iip-img" src="${itm.icon}" alt="${_itmName}">
        <div id="iip-titles">
          <div id="iip-tag">${_isENiip ? 'NEW ITEM ACQUIRED' : 'YENİ EŞYA KAZANILDI'}</div>
          <div id="iip-name">${_itmName}</div>
        </div>
      </div>
      <div id="iip-divider"></div>
      <div id="iip-section-title">${_isENiip ? 'WHAT DOES IT DO?' : 'NE İŞE YARAR?'}</div>
      <div id="iip-desc">${howToUse}</div>
      <div id="iip-section-title">${_isENiip ? 'HOW TO USE?' : 'NASIL KULLANILIR?'}</div>
      <div id="iip-how">${_howToDesc}</div>
      ${_condDesc ? `<div id="iip-condition">${_isENiip ? '✦ Unlock condition:' : '✦ Kazanım koşulu:'} <em>${_condDesc}</em></div>` : ""}
      <button id="iip-ok">${_isENiip ? 'GOT IT →' : 'ANLADIM →'}</button>
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

// ── Eşya Dükkanı — nadir kartlarla kazanılan eşyaları akçeyle doğrudan satın al ──
const ITEM_AKCE_COST = 1; // 1 akçe = 1 anlamlı kurtarma (İkinci Şans 29 Eylül 2026’dan beri 2 akçe)
// Bilinçli olarak dükkanda satılmayan eşyalar — bu ikisi sadece nadir kartlarla
// kazanılabilir kalsın diye (altın_muhur = hazine cezası bloğu, sultan_ferman =
// saray cezası bloğu), akçeyle garantiye bağlanamaz.
const ESYA_DUKKANI_EXCLUDED = ["altin_muhur", "sultan_ferman"];

function showEsyaDukkani() {
  if (isGameOver) return;
  const isENes = window.LANG === 'en';
  const overlay = document.createElement("div");
  overlay.id = "esya-dukkani-overlay";

  const rowsHtml = Object.keys(ITEMS).filter(id => !ESYA_DUKKANI_EXCLUDED.includes(id)).map(id => {
    const itm = ITEMS[id];
    const en = (isENes && window.EN_ITEMS) ? window.EN_ITEMS[id] : null;
    const name = en ? en.name : itm.name;
    const desc = en ? en.desc : itm.desc;
    return `
      <div class="esya-row">
        <img class="esya-icon" src="${itm.icon}" alt="${name}">
        <div class="esya-info">
          <div class="esya-name">${name}</div>
          <div class="esya-desc">${desc}</div>
        </div>
        <button class="esya-buy-btn" data-id="${id}">${ITEM_AKCE_COST} ${AKCE_COIN_SVG}</button>
      </div>`;
  }).join("");

  overlay.innerHTML = `
    <div id="esya-box">
      <svg id="esya-ornament" viewBox="0 0 24 24" fill="none">
        <path d="M4.5 10.5h15v7.2a1.3 1.3 0 0 1-1.3 1.3H5.8a1.3 1.3 0 0 1-1.3-1.3v-7.2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M4.5 10.5l1.3-4.2A1.8 1.8 0 0 1 7.5 5h9a1.8 1.8 0 0 1 1.7 1.3l1.3 4.2" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M9 10.5V9a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.1"/>
        <circle cx="12" cy="14.2" r="1.3" stroke="currentColor" stroke-width="1"/>
      </svg>
      <div id="esya-title">${isENes ? "ITEM SHOP" : "EŞYA DÜKKANI"}</div>
      <div id="esya-divider"></div>
      <div id="esya-balance">${isENes ? "Balance" : "Bakiye"}: <span class="akce-balance-display">${getAkceBalance()}</span> ${AKCE_COIN_SVG}</div>
      <div id="esya-list">${rowsHtml}</div>
      <button id="esya-close-btn" class="intro-btn ghost">${isENes ? "Close" : "Kapat"}</button>
    </div>`;
  document.body.appendChild(overlay);

  // NOT: satın alma butonları bakiye yetersizken KİLİTLENMİYOR/gizlenmiyor —
  // bilerek. Tıklanabilir kalmalılar ki aşağıdaki akış (bakiye yetersizse
  // akçe satın alma ekranına yönlendir) her zaman çalışabilsin. Buton devre
  // dışı bırakılırsa tıklama hiç gerçekleşmez ve yönlendirme de olmaz.

  overlay.querySelectorAll(".esya-buy-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const finalizePurchase = () => {
        // spendAkce() bakiye yetersizse false döner ve hiçbir şey düşürmez —
        // dönüş değeri kontrol edilmeden gainItem() çağrılırsa akçe düşmeden
        // eşya verilmiş olur. Burada asla o duruma düşülmediğinden emin oluyoruz.
        if (!spendAkce(ITEM_AKCE_COST)) {
          closeEsyaDukkani();
          redirectToAkcePurchase(() => showEsyaDukkani());
          return;
        }
        gainItem(id, true);
        if (window.playSelectConfirm) playSelectConfirm();
        closeEsyaDukkani();
      };
      if (getAkceBalance() < ITEM_AKCE_COST) {
        closeEsyaDukkani();
        redirectToAkcePurchase(() => showEsyaDukkani());
        return;
      }
      const inventoryFull = playerItems.every(slot => slot !== null);
      if (inventoryFull) {
        showEsyaReplaceConfirm(finalizePurchase);
      } else {
        finalizePurchase();
      }
    };
  });
  document.getElementById("esya-close-btn").onclick = closeEsyaDukkani;

  function closeEsyaDukkani() { overlay.remove(); }
}

// Envanter doluyken (3/3) satın alma — en eski eşyanın (slot 0) yerini alacağını
// söyleyip onay ister; onaylanmadan gainItem() hiç çağrılmaz.
function showEsyaReplaceConfirm(onConfirm) {
  document.getElementById("esya-replace-overlay")?.remove(); // önceki açık kalmışsa temizle
  const isENrc = window.LANG === 'en';
  const oldItemId = playerItems[0];
  const oldItem = ITEMS[oldItemId];
  const oldEn = (isENrc && window.EN_ITEMS && oldItemId) ? window.EN_ITEMS[oldItemId] : null;
  const oldName = oldEn ? oldEn.name : (oldItem ? oldItem.name : (isENrc ? "your item" : "eşyan"));

  const popup = document.createElement("div");
  popup.id = "esya-replace-overlay";
  popup.innerHTML = `
    <div id="esya-replace-box">
      ${oldItem ? `<img id="esya-replace-icon" src="${oldItem.icon}" alt="${oldName}">` : ""}
      <div id="esya-replace-text">${isENrc
        ? `Your inventory is full (3/3). This will replace your oldest item — <strong>${oldName}</strong>. Continue?`
        : `Envanterin dolu (3/3). En eski eşyanla — <strong>${oldName}</strong> — değişecek. Onaylıyor musun?`}</div>
      <div id="esya-replace-btns">
        <button class="esya-replace-btn confirm" id="esya-replace-yes">${isENrc ? "Confirm" : "Onayla"}</button>
        <button class="esya-replace-btn cancel" id="esya-replace-no">${isENrc ? "Cancel" : "Vazgeç"}</button>
      </div>
    </div>`;
  document.body.appendChild(popup);

  let _resolved = false;
  const cleanup = () => popup.remove();
  document.getElementById("esya-replace-yes").onclick = () => {
    if (_resolved) return;
    _resolved = true;
    cleanup();
    onConfirm();
  };
  document.getElementById("esya-replace-no").onclick = () => {
    if (_resolved) return;
    _resolved = true;
    cleanup();
  };
}

function activateItem(slotIndex) {
  if (isGameOver) return;
  const itemId = playerItems[slotIndex];
  if (!itemId) { showEmptySlotTip(slotIndex); return; }
  const item = ITEMS[itemId];
  Haptics.tap();
  showItemConfirm(slotIndex, item);
}

function showItemConfirm(slotIndex, item) {
  // Var olan popup'ı kaldır
  document.getElementById("item-confirm-popup")?.remove();

  const popup = document.createElement("div");
  popup.id = "item-confirm-popup";
  const _isENicp = window.LANG === 'en';
  const _icpId = Object.keys(ITEMS).find(k => ITEMS[k] === item) || '';
  const _icpEN = (_isENicp && window.EN_ITEMS && _icpId) ? window.EN_ITEMS[_icpId] : null;
  const _icpName = _icpEN ? _icpEN.name : item.name;
  const _icpDesc = _icpEN ? _icpEN.desc : item.desc;
  popup.innerHTML = `
    <div class="icp-icon"><img src="${item.icon}" alt="${_icpName}"></div>
    <div class="icp-name">${_icpName}</div>
    <div class="icp-desc">${_icpDesc}</div>
    <div class="icp-btns">
      <button class="icp-use" id="icp-use-btn">${_isENicp ? 'Use ✓' : 'Kullan ✓'}</button>
      <button class="icp-cancel" id="icp-cancel-btn">${_isENicp ? 'Cancel' : 'Vazgeç'}</button>
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

// ── Boş eşya kutuları (27 Eylül 2026) ──────────────────────────────────
// Boş kutu artık bomboş durmuyor: her kutuda Eşya Dükkânı'nda satılan farklı
// bir eşyanın soluk silueti ve "+" var; dokununca o eşyanın ne yaptığı ve
// nereden alındığı kısaca yazar, "Dükkânı aç" düğmesi dükkâna götürür.
const EMPTY_SLOT_GHOSTS = ["sifa_otu", "yeniceri_nisan", "dervis_muska"];
function showEmptySlotTip(slotIndex) {
  const game = document.getElementById("game");
  if (!game || isGameOver) return;
  document.getElementById("empty-slot-tip")?.remove();
  const en = window.LANG === 'en';
  const id = EMPTY_SLOT_GHOSTS[slotIndex] || "sifa_otu";
  const itm = ITEMS[id], e = (en && window.EN_ITEMS) ? window.EN_ITEMS[id] : null;
  const name = e ? e.name : itm.name, desc = e ? e.desc : itm.desc;
  const tip = document.createElement("div");
  tip.id = "empty-slot-tip";
  tip.innerHTML = `<div class="est-row"><img src="${itm.icon}" alt=""><div><b>${name}</b><div class="est-desc">${desc}.</div></div></div>
    <div class="est-where">${en ? `Empty slot. Items are earned on rare cards or bought in the Item Shop for ${ITEM_AKCE_COST} akce.` : `Boş kutu. Eşyalar nadir kartlarla kazanılır ya da Eşya Dükkânı'ndan ${ITEM_AKCE_COST} akçeye alınır.`}</div>
    <button class="est-shop" type="button">${en ? "OPEN ITEM SHOP" : "EŞYA DÜKKÂNINI AÇ"}</button>`;
  game.appendChild(tip);
  const close = () => { clearTimeout(tip._t); tip.remove(); document.removeEventListener("pointerdown", outside, true); };
  const outside = (ev) => { if (!tip.contains(ev.target) && !ev.target.closest?.(".item-slot")) close(); };
  tip.querySelector(".est-shop").onclick = () => { close(); showEsyaDukkani(); };
  tip._t = setTimeout(close, 5000);
  setTimeout(() => document.addEventListener("pointerdown", outside, true), 0);
  if (typeof Haptics !== "undefined") Haptics.tap();
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
      const _en = (window.LANG === 'en' && window.EN_ITEMS) ? window.EN_ITEMS[itemId] : null;
      icon.innerHTML = `<img src="${itm.icon}" alt="${_en ? _en.name : itm.name}" onerror="this.parentElement.textContent='?'">`;
      icon.style.fontSize = "";
      name.textContent = _en ? _en.name : itm.name;
      slot.classList.remove("ghost");
      slot.querySelector(".item-plus")?.remove();
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
      // Boş kutu: dükkânda satılan bir eşyanın soluk silueti + "+" (27 Eylül 2026)
      const ghostId = EMPTY_SLOT_GHOSTS[i];
      icon.innerHTML = `<img src="${ITEMS[ghostId].icon}" alt="" aria-hidden="true">`;
      icon.style.fontSize = "";
      name.textContent = "";
      if (!slot.querySelector(".item-plus")) { const pl = document.createElement("span"); pl.className = "item-plus"; pl.textContent = "+"; slot.appendChild(pl); }
      slot.classList.add("ghost");
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
  // (29 Haziran'dan beri burada tanımsız 'expiredId' vardı → İngilizce oyunda
  // eşya süresi dolunca dealNext hata verip sıradaki kart gelmiyordu)
  const _expEN = (window.LANG === 'en' && window.EN_ITEMS) ? window.EN_ITEMS[itemId] : null;
  const _expName = _expEN ? _expEN.name : itm.name;
  const _expiredLabel = window.LANG === 'en' ? 'Expired' : 'Tükendi';
  toast.innerHTML = `<img src="${itm.icon}" alt="${_expName}"><span>${_expiredLabel}</span>`;
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
    if (_sultanFavorTurns > 0 && raw < 0) raw = 0; // Padişah Ödülü tılsımı — 3 tur boyunca negatif etki yok
    if (hasAdvisor("sokollu")) raw = Math.round(raw * 0.85);
    if (hasAdvisor("sinan") && (stat === "saray" || stat === "ulema")) raw = Math.round(raw * 1.2);
    if (hasAdvisor("hurrem") && stat === "yeniçeri" && raw < 0) raw = Math.round(raw * 0.75);
    // Hazine dengelemesi: kart bazlı negatif hazine etkileri %30 azaltılır (429 kartın tekini
    // değiştirmek yerine tek noktadan, tüm kartlarda tutarlı şekilde) — pasif yıllık drain
    // (PASSIVE_HAZINE_DRAIN) bu kapsamda değil, o zaten çok küçük ve zorluk çarpanına bağlı.
    if (stat === "hazine" && raw < 0) raw = Math.round(raw * 0.7);

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
  if (sultanSabir <= 0 && _relTryRescue("sabir", 0)) return;
  if (sultanSabir <= 0) {
    triggerGameOver("Sultan seni azletti. Hac yolculuğuna — sürgün olarak — gönderildin.", "azil");
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
  const _isENgu = window.LANG === 'en';
  overlay.innerHTML = `
    <div id="guc-uyarisi-box">
      <div id="guc-uyarisi-label">${_isENgu ? 'FROM AN UNKNOWN HAND' : "BİLİNMEYEN BİR EL'DEN"}</div>
      <img id="guc-uyarisi-img" src="assets/characters/mysterious-letter.jpg" alt="Mektup" onerror="this.style.display='none'">
      <div id="guc-uyarisi-divider"></div>
      <div id="guc-uyarisi-text">${_isENgu ? '"Your shadow grows too long, Pasha. Some shadows, when they grow too large, devour their owner. Be careful."' : '"Gölgeniz fazla uzuyor, Paşa. Bazı gölgeler çok büyüyünce sahibini yer. Dikkat edin."'}</div>
      <div id="guc-uyarisi-imza">${_isENgu ? '— You need not know the name' : '— İsmini bilmenize gerek yok'}</div>
      <button id="guc-uyarisi-kapat">${_isENgu ? 'Burn the Letter' : 'Mektubu Yak'}</button>
    </div>`;
  document.body.appendChild(overlay);
  Haptics.crisisCard();
  setTimeout(() => {
    const btn = document.getElementById("guc-uyarisi-kapat");
    if (btn) btn.onclick = () => { overlay.style.opacity = "0"; overlay.style.transition = "opacity 0.3s"; setTimeout(() => overlay.remove(), 320); };
  }, 200);
}

let _sultanGucCinematicActive = false; // ★ triggerSultanGucOlumu sinematiği sürerken duraklatma menüsünü de kilitler

function triggerSultanGucOlumu() {
  if (isGameOver) return;
  // isGameOver'ı burada DEĞİL, sinematik bittiğinde çağrılan triggerGameOver() içinde true
  // yapıyoruz — aksi halde triggerGameOver zaten isGameOver=true görüp hiçbir şey yapmadan
  // çıkar (İkinci Şans teklifi hiç sunulmaz VE showGameOver hiç çağrılmaz, oyun sinematikten
  // sonra tamamen asılı kalır). Sinematik sırasında kartla etkileşimi no-swipe ile, duraklatma
  // menüsünü de _sultanGucCinematicActive ile engelliyoruz.
  card.classList.add('no-swipe');
  _sultanGucCinematicActive = true;
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
            _sultanGucCinematicActive = false;
            triggerGameOver("Sarayın en güçlü sadrazamıydın. Bu yüzden urganı iki cellat getirdi.", "sultan_guc");
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
    if (stats[stat] <= 0 && _relTryRescue(stat, 0)) return false;
    if (stats[stat] >= 100 && _relTryRescue(stat, 100)) return false;
    if (stats[stat] <= 0)   { triggerGameOver(getRichDeathText(DEATH_TABLE[stat]?.[0]   || "Oyun bitti.", stat, 0), (stat === "yeniçeri" ? "yeniceri" : stat) + "_0");   return true; }
    if (stats[stat] >= 100) { triggerGameOver(getRichDeathText(DEATH_TABLE[stat]?.[100] || "Oyun bitti.", stat, 100), (stat === "yeniçeri" ? "yeniceri" : stat) + "_100"); return true; }
  }
  return false;
}

// ── Lanet Sistemi ─────────────────────────────────────────────────
function checkCurse(dir) {
  if (lastDir === dir) {
    consecutiveSameDir++;
    if (consecutiveSameDir === 2) _showCurseWhisper();
    if (consecutiveSameDir >= 3) {
      consecutiveSameDir = 0;
      triggerCurse();
    }
  } else {
    consecutiveSameDir = 1;
  }
  lastDir = dir;
}

// Lanet kuralı artık sürpriz değil: 2. aynı yönde kaydırmada soluk bir uyarı (3 Ekim 2026)
function _showCurseWhisper() {
  const game = document.getElementById("game");
  if (!game || isGameOver) return;
  let w = document.getElementById("curse-whisper");
  if (!w) { w = document.createElement("div"); w.id = "curse-whisper"; w.setAttribute("aria-live", "polite"); game.appendChild(w); }
  w.textContent = window.LANG === 'en'
    ? "The Divan whispers: always the same way, and the balance breaks…"
    : "Divan fısıldıyor: hep aynı yön, denge bozulur…";
  w.classList.remove("on"); void w.offsetWidth; w.classList.add("on");
  clearTimeout(w._t); w._t = setTimeout(() => w.classList.remove("on"), 2600);
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
  _hideCriticalOffer(); // oyuncu teklif yerine kararını verdi
  _setLastDecision(currentCard, dir);

  // Padişah bizzat ziyaret — sağ = kabul, sol = ölüm
  if (currentCard.type === "padisah_ziyaret") {
    const btn = document.getElementById("easter-action-btn");
    if (btn) btn.classList.add("hidden");
    if (dir === "right") {
      sultanSabir = Math.min(100, sultanSabir + 5);
      cardsPlayed++;
      advanceHicriMonth();
      if (cardsPlayed % CARDS_PER_YEAR === 0) advanceYear();
      if (!isGameOver && !isPaywalled) { saveGameState(); setTimeout(dealNext, 200); }
    } else {
      deathCharacterKey = "1-sultan";
      const rageOvl = document.createElement("div");
      rageOvl.style.cssText = "position:fixed;inset:0;z-index:100;";
      document.body.appendChild(rageOvl);
      triggerSultanRage(rageOvl, () => {
        rageOvl.remove();
        showExecutionAnimation(() => {
          triggerGameOver("Sen bana nasıl karşı gelirsin BRE DEYYUS! — Son sözlerin bunlar oldu.", "padisah_red");
        });
      });
    }
    return;
  }

  // İnvestigating state temizle - sultanSabir cezası
  // Ceza SADECE kendi özel soruşturma metni olan kartlarda (orijinal tasarım, ~15
  // kart). Gizli hain ipucu soruşturmaları ücretsiz: düğme 18 karakterin bütün
  // kartlarında olduğundan, ceza her kartta uygulanınca her şeyi soruşturan oyuncu
  // ortalama 28 kartta Sultan sabrından ölüyordu (denge simülasyonu, 27 Eylül 2026).
  if (isInvestigating && !currentCard.investigate_text) {
    isInvestigating = false;
  }
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

  // Lanet kontrolü (süresi dolan kriz kartı bir "yön" seçimi sayılmaz)
  if (!currentCard._timeout && !currentCard._noCurse) checkCurse(dir);

  // Savaş sonucu: sabit gecikme/her zaman zafer yerine — 2-10 kart arası rastgele
  // gecikme, sonuç (zafer/yenilgi) o anki askeri güce (Ordu statı + donanma müttefikliği) bağlı.
  if (currentCard.id === 'savaş_teklifi' && dir === 'right') {
    const delay = 2 + Math.floor(Math.random() * 9); // 2-10 arası
    _savasSonucSchedule = { afterCardsPlayed: cardsPlayed + delay };
    updateFateBar();
  } else {
    // Zincirleme kartlar (genel mekanizma)
    const triggerKey = "triggers_on_" + dir;
    if (currentCard[triggerKey]) {
      const delay = currentCard.trigger_delay ?? 3;
      scheduleConsequence(currentCard[triggerKey], delay);
      updateFateBar();
    }
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
  const newFlags = currentCard[dir + "_flags_set"] || [];
  for (const f of newFlags) activeFlags[f] = true;
  // Zincir tetikleyici kontrolü
  if (newFlags.length) checkChainTriggers(newFlags);

  // Vezirlik Günlüğü — kayda değer (flag üreten) kararları kronolojik kaydet
  if (newFlags.length && currentCard.type !== 'easter') {
    const _isENlog = window.LANG === 'en';
    decisionLog.push({
      year,
      character: (_isENlog && currentCard.character_name_en) ? currentCard.character_name_en : (currentCard.character_name || ""),
      choice: (_isENlog && currentCard[dir + "_text_en"]) ? currentCard[dir + "_text_en"] : (currentCard[dir + "_text"] || ""),
    });
    if (decisionLog.length > 40) decisionLog.shift();
  }
  _recordChronicle(currentCard, dir, newFlags);

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

  applyEffects(_relAdjustEffects(currentCard, currentCard[dir + "_effects"] || {}));
  if (isGameOver) return;
  _relOnDecision(currentCard, dir);
  _fermanTrack();

  // Yeni karakterlerin özel etkileri
  if (currentCard.id === "genc_hain_ipucu" && dir === "right" && !traitorRevealed) {
    traitorInvestigated = Math.max(traitorInvestigated, 2); // hain fark edilmiş sayılır
  }
  if (currentCard.id === "muneccim_fal_1" || currentCard.id === "muneccim_fal_2") _muneccimRead(currentCard.id, dir);

  // ── Achievement tracking ──────────────────────────────────────
  if (charKey) { seenCharacters.add(charKey); updateCrossGame({ seenCharactersEver: [charKey] }); }
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
  if (!isGameOver && !isPaywalled) {
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

    // Bu 7 "sırf eğlence" easter egg'i (+ aşağıdaki Pargalı) paylaşılan bir 40-kart
    // bekleme süresine tabi — her biri kendi aralığına uysa bile üst üste binip
    // "çok sık easter egg geliyor" hissi yaratıyordu. Süre dolmadıysa hiçbiri
    // ateşlenmez (kendi eşiği geçmiş olsa da bir sonraki uygun ana ertelenir).
    if (cardsPlayed - _lastEasterEggAt >= 40) {
      const _eggQueueLenBefore = forcedQueue.length;
      // Saray Kedisi: ortalama 65 kart, aralık 49-81
      if (cardsPlayed >= _easterKediNext) {
        _easterKediNext = cardsPlayed + _rndIv(65);
        forcedQueue.push({ ...EASTER_CARDS.saray_kedisi });
      }
      // Yanlış Adam: ortalama 55 kart, aralık 41-69
      else if (cardsPlayed >= _easterYanlisNext) {
        _easterYanlisNext = cardsPlayed + _rndIv(55);
        _easterYanlisCount++;
        const yanlis = { ...EASTER_CARDS.yanlis_adam };
        if (_easterYanlisCount >= 3) yanlis.easter_type = "yanlis_idam";
        forcedQueue.push(yanlis);
      }
      // Tarihsel Kehanet: ortalama 60 kart, aralık 45-75
      else if (cardsPlayed >= _easterKehanetNext) {
        _easterKehanetNext = cardsPlayed + _rndIv(60);
        forcedQueue.push(getKehanetCard());
      }
      // Evliya Çelebi: ortalama 45 kart, aralık 34-56
      else if (cardsPlayed > 0 && cardsPlayed >= _easterEvliyaNext) {
        _easterEvliyaNext = cardsPlayed + _rndIv(45);
        forcedQueue.push(getEvliyaCard());
      }
      // Tarihsel figürler (Barbaros / Leonardo / Mahidevran): ortalama 70 kart, aralık 53-88
      else if (cardsPlayed >= _easterHistNext) {
        _easterHistNext = cardsPlayed + _rndIv(70);
        forcedQueue.push(getNextHistoricalCard());
      }
      // Zaman Yolcusu: ortalama 80 kart, aralık 60-100
      else if (cardsPlayed >= _easterZamanNext) {
        _easterZamanNext = cardsPlayed + _rndIv(80);
        forcedQueue.push(getZamanCard());
      }
      // Fısıltı karakteri: ortalama 95 kart, aralık 71-119, sadece gece
      else if (isNight && cardsPlayed >= _easterFisildayanNext) {
        _easterFisildayanNext = cardsPlayed + _rndIv(95);
        forcedQueue.push(getFisildayanCard());
      }
      if (forcedQueue.length > _eggQueueLenBefore) _lastEasterEggAt = cardsPlayed;
    }
    // Dönüm Noktası: her ~5 yılda bir tekrarlanır (oyun başına en fazla _donumMaxShows kez)
    if (_donumShownCount < _donumMaxShows && cardsPlayed >= _donumNextCard) {
      forcedQueue.push(getDonumCard());
    }
    // Eyalet Divanı: Dönüm Noktası'na paralel, kaydırılmış bir kaynak tahsis kararı
    if (_eyaletShownCount < _eyaletMaxShows && cardsPlayed >= _eyaletNextCard) {
      forcedQueue.push({ id: "eyalet_tetik_" + cardsPlayed, type: "easter", easter_type: "eyalet_trigger" });
    }
    // Miras Kartı: bir önceki oyunda miras bırakıldıysa ~15. karttan sonra 1 kez
    // (rastgele eşik: her oyunda tam olarak aynı kartta gelmesin)
    if (cardsPlayed >= _mirasThreshold && localStorage.getItem("sadrazam_miras_bar")) {
      const mirasCard = getMirasCard();
      if (mirasCard) {
        forcedQueue.push(mirasCard);
        localStorage.removeItem("sadrazam_miras_bar"); // kuyruktan sonra sil (duplicate önle)
      }
    }
    // Hanedan Hafızası: bir önceki oyunun ölüm hafızası, oyun başına 1 kez
    if (!_golgeShownThisGame && cardsPlayed >= _golgeThreshold) {
      _golgeShownThisGame = true;
      const golgeCard = getGolgeCard();
      if (golgeCard) forcedQueue.push(golgeCard);
    }
    // Gizli Nitelikler: mevcut sessiz sayaçlar eşiğe ulaşınca, oyun başına 1 kez
    if (!_halkSevgisiShownThisGame && (factionFavors.halk || 0) >= 10) {
      _halkSevgisiShownThisGame = true;
      forcedQueue.push(getHalkSevgisiCard());
    }
    if (!_casusAgiShownThisGame && traitorInvestigated >= 3) {
      _casusAgiShownThisGame = true;
      forcedQueue.push(getCasusAgiCard());
    }
    // Sultan Mektupları: weight:1 olduğu için normal havuzdan çıkmaz, oyun başına
    // birer kez, farklı (rastgele belirlenmiş, min_year'larıyla kabaca uyumlu) kart
    // sayılarında gelir — sabit sayı olursa kartlar her oyunda aynı sırada gelir
    if (!_mektup1Shown && cardsPlayed >= _mektup1Threshold) {
      _mektup1Shown = true;
      const m1 = allCards.find(x => x.id === 'sultan_mektup_1');
      if (m1) forcedQueue.push(m1);
    }
    if (!_mektup3Shown && cardsPlayed >= _mektup3Threshold) {
      _mektup3Shown = true;
      const m3 = allCards.find(x => x.id === 'sultan_mektup_3');
      if (m3) forcedQueue.push(m3);
    }
    if (!_mektup2Shown && cardsPlayed >= _mektup2Threshold) {
      _mektup2Shown = true;
      const m2 = allCards.find(x => x.id === 'sultan_mektup_2');
      if (m2) forcedQueue.push(m2);
    }
    if (!_mektup4Shown && cardsPlayed >= _mektup4Threshold) {
      _mektup4Shown = true;
      const m4 = allCards.find(x => x.id === 'sultan_mektup_4');
      if (m4) forcedQueue.push(m4);
    }
    // Savaş Sonucu: gecikme dolunca askeri güce göre zafer ya da yenilgi kartı gelir
    if (_savasSonucSchedule && cardsPlayed >= _savasSonucSchedule.afterCardsPlayed) {
      _savasSonucSchedule = null;
      const won = rollSavasSonucu();
      const sonucCard = allCards.find(x => x.id === (won ? 'savaş_zafer' : 'savaş_yenilgi'));
      if (sonucCard) forcedQueue.push({ ...sonucCard, _sefer: won ? "win" : "loss" }); // kart gelince harita oku oynar
    }
    // Eyalet Divanı Uzun Vadeli Hafıza: ihmal edilen eyalet çok sonra isyan eder
    if (_eyaletIsyanSchedule.length) {
      const due = _eyaletIsyanSchedule.filter(sc => cardsPlayed >= sc.afterCardsPlayed);
      _eyaletIsyanSchedule = _eyaletIsyanSchedule.filter(sc => cardsPlayed < sc.afterCardsPlayed);
      due.forEach(sc => {
        const isyanCard = getEyaletIsyanCard(sc.provinceId);
        if (isyanCard) forcedQueue.push(isyanCard);
      });
    }
    // Padişah Ödülü: nezaketle reddedilmiş bir teklif memnuniyetle sonuçlandıysa
    // gecikmeli ek avantaj gelir (bkz. showSultanOdulu)
    if (_sultanFavorSchedule.length) {
      const dueFavor = _sultanFavorSchedule.filter(sc => cardsPlayed >= sc.afterCardsPlayed);
      _sultanFavorSchedule = _sultanFavorSchedule.filter(sc => cardsPlayed < sc.afterCardsPlayed);
      dueFavor.forEach(sc => forcedQueue.push(getSultanFavorCard(sc.provinceLabel)));
    }
    // Padişah Ödülü tılsımı: 3 tur boyunca 4 ana güçte hiçbir negatif etki uygulanmaz
    if (_sultanFavorTurns > 0) _sultanFavorTurns--;
    // Pargalı İbrahim: en erken 35. kart, oyun başına 1 kez, %4 — o da paylaşılan
    // 40-kart easter egg bekleme süresine tabi.
    if (!_easterPargaliDone && cardsPlayed >= 35 && (cardsPlayed - _lastEasterEggAt >= 40) && Math.random() < 0.04) {
      _easterPargaliDone = true;
      _lastEasterEggAt = cardsPlayed;
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

    // Divan Oturumu (yılın 12. kartı) ve Can Düşmanı komplosu — 3 Ekim 2026
    _maybeQueueDivan();
    _relDueKomplo();
    // Padişah ziyareti: her ~45 kartta 1, yıl 3+
    tryPadisahZiyareti();
  tryHekimDinlenme();
  _maybeQueueMuneccim(); // sonda: kuyruk boşsa gelir
  if (isChallengeMode) updateChallengeUI();
  checkPargaliSecret();
  // Şehzade her yıl sonu güçlenir
  if (sultanSabir < 40) updateSehzadePower(8);
  else updateSehzadePower(3);
  trySehzadeMeydanOkuma();
  }

  if (!isGameOver && !isPaywalled) {
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
      // İngilizce oyunda da doğru dilde (eskiden text_en yoktu → her zaman Türkçe)
      const _tName = getCharacterDisplayName(hiddenTraitor);
      const _tNameEN = getCharacterDisplayName(hiddenTraitor, true);
      if (traitorInvestigated >= 2) {
        enriched.text = `Paşam, yıllardır aramızda bir hain vardı: ${_tName}. Ama siz bunu zaten fark etmişsiniz! Sultan'a rapor hazırlandı. Sarayınız güçlendi.`;
        enriched.text_en = `Pasha, there was a traitor among us for years: the ${_tNameEN}. But you had already noticed! A report has been prepared for the Sultan. Your palace grows stronger.`;
        enriched.right_effects = { saray: 10 };
      } else {
        enriched.text = `Paşam, çok geç! ${_tName} bu gece sizi Sultan'a şikâyet etti. Belgeler sahte ama Sultan inanıyor...`;
        enriched.text_en = `Pasha, it is too late! Tonight the ${_tNameEN} denounced you to the Sultan. The documents are forged, but the Sultan believes them...`;
        enriched.right_effects = { saray: -15 };
      }
      forcedQueue.unshift(enriched);
    }
  }
}

function getCharacterDisplayName(key, en) {
  if (!key) return en ? "Unknown" : "Bilinmeyen";
  // Birleşik kartlar "A · B" adı taşır — tek karakter adı için onları atla
  const c = allCards.find(x => x.character === key && !x.knot_of);
  if (!c) return key;
  return (en && c.character_name_en) ? c.character_name_en : (c.character_name || key);
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
        scheduleConsequence(pressureCard.id, 2);
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

  _sideTabsDrag(dx);
  _effectShimmer(dx < -20 ? "left" : dx > 20 ? "right" : null);
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

function showCardTrail(dir) {
  const cardEl = document.getElementById('card');
  if (!cardEl) return;
  const rect = cardEl.getBoundingClientRect();
  const isRight = dir === 'right';

  // ── Hayalet (ghost) katmanı ──
  const ghost = document.createElement('div');
  ghost.className = 'card-trail-ghost ' + (isRight ? 'trail-right' : 'trail-left');
  ghost.style.cssText =
    'position:fixed' +
    ';left:'  + rect.left   + 'px' +
    ';top:'   + rect.top    + 'px' +
    ';width:' + rect.width  + 'px' +
    ';height:'+ rect.height + 'px' +
    ';pointer-events:none;z-index:8;border-radius:14px';
  document.body.appendChild(ghost);
  ghost.animate(
    [{ opacity: 0.75 }, { opacity: 0 }],
    { duration: 520, easing: 'ease-out', fill: 'forwards' }
  ).finished.then(() => ghost.remove());

  // ── Duman parçacıkları ──
  const smokeColors = isRight
    ? ['rgba(212,175,55,0.55)', 'rgba(240,205,90,0.38)', 'rgba(255,240,170,0.22)']
    : ['rgba(65,85,155,0.48)',  'rgba(85,105,175,0.32)', 'rgba(45,58,100,0.2)'];

  for (let i = 0; i < 7; i++) {
    const p   = document.createElement('div');
    const sz  = 20 + Math.random() * 42;
    const px  = rect.left + rect.width  * (0.18 + Math.random() * 0.64);
    const py  = rect.top  + rect.height * (0.22 + Math.random() * 0.56);
    const col = smokeColors[Math.floor(Math.random() * smokeColors.length)];
    const blr = 6 + Math.random() * 12;
    p.style.cssText =
      'position:fixed' +
      ';left:'  + (px - sz / 2) + 'px' +
      ';top:'   + (py - sz / 2) + 'px' +
      ';width:' + sz + 'px;height:' + sz + 'px' +
      ';border-radius:50%' +
      ';background:' + col +
      ';pointer-events:none;z-index:7' +
      ';filter:blur(' + blr + 'px)';
    document.body.appendChild(p);
    const dx   = (Math.random() - 0.5) * 55;
    const dy   = -(28 + Math.random() * 55);
    const scl  = 1.3 + Math.random() * 1.4;
    const dur  = 560 + Math.random() * 360;
    p.animate([
      { opacity: 1, transform: 'translate(0,0) scale(1)' },
      { opacity: 0, transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + scl + ')' }
    ], { duration: dur, easing: 'ease-out', fill: 'forwards' })
      .finished.then(() => p.remove());
  }
}

function flyOff(dir) {
  if (isAnimating) return;
  // Parmak, kart HENÜZ swipe edilebilirken (no-swipe eklenmeden) basılmış olabilir; onEnd()
  // tetiklendiğinde araya giren dealNext() kartı butonlu (no-swipe) bir karta çevirmiş olabilir.
  // Bu durumda swipe'ı tamamlamak butonlu kartın atlanmasına yol açar — burada tekrar kontrol
  // edip öyleyse swipe'ı iptal edip kartı geri sek (snapBack).
  if (isGameOver || card.classList.contains('no-swipe')) { snapBack(); return; }
  showCardTrail(dir);
  _effectShimmer(null);
  _stopFuse();
  const bubble = document.getElementById("speech-bubble");
  if (bubble) bubble.style.opacity = "0";
  isAnimating = true;
  // Ses/haptik asla kaydırmayı kesemez: burada bir hata fırlarsa isAnimating
  // true kalır, kart yarı yolda asılı kalır ve oyun donar (ses efektleri
  // kapalıyken 1.2.0–1.5.0 arası tam olarak bu oluyordu — bkz. sounds.js sonu).
  try {
    if (dir === "right") { Haptics.swipeRight(); if (window.playSwipeRight) playSwipeRight(); }
    else                 { Haptics.swipeLeft();  if (window.playSwipeLeft)  playSwipeLeft();  }
  } catch (e) { console.warn('[flyOff] ses/haptik', e); }
  const tx = dir === "left" ? -680 : 680;
  card.style.transition = "transform 0.28s ease-in, opacity 0.22s ease-in";
  card.style.transform = `translateX(${tx}px) rotate(${dir === "left" ? -22 : 22}deg)`;
  card.style.opacity = "0";
  setTimeout(() => {
    // Kartı sıfırla — içerik temizle
    card.style.transition = "none";
    card.style.transform = "translateX(0) rotate(0deg)";
    cardImage.src = "";
    renderKnotVisual(null);
    _hideInvestigateBtn();
    _hideEasterChoices();
    _hideCriticalOffer();
    charName.textContent = "";
    cardText.textContent = "";
    choiceLeft.style.opacity = "0";
    choiceRight.style.opacity = "0";
    overlayL.style.opacity = "0";
    overlayR.style.opacity = "0";
    _sideTabsDrag(0);
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
  _effectShimmer(null);
  overlayL.style.opacity = overlayR.style.opacity = "0";
  choiceLeft.style.opacity = choiceRight.style.opacity = "0";
  _sideTabsDrag(0);
}

// ── Kenar sekmeleri (28 Eylül 2026) ──────────────────────────────────
// Kartın iki yanındaki eski soluk "← Hayır / Evet →" yazıları yerine kırmızı/
// yeşil dikey sekmeler: içinde kartın gerçek seçenek metni + kıpırdayan oklar.
// SADECE GÖRÜNTÜ — pointer-events:none; kaydırma/dokunma yine kartın kendisinde.
// Sürükledikçe o taraf parlar, öbürü söner. Butonlu özel kartlarda gizli.
function _setSideTabs(leftTxt, rightTxt) {
  const area = document.getElementById("card-area");
  const l = document.querySelector("#swipe-hint-left .st-text"), r = document.querySelector("#swipe-hint-right .st-text");
  if (!area || !l || !r) return;
  if (leftTxt == null) { area.classList.add("tabs-off"); _sideTabsDrag(0); return; }
  l.textContent = leftTxt; r.textContent = rightTxt;
  area.classList.remove("tabs-off");
  _sideTabsDrag(0);
}
function _sideTabsDrag(dx) {
  const L = document.getElementById("swipe-hint-left"), R = document.getElementById("swipe-hint-right");
  if (!L || !R) return;
  L.classList.toggle("hot", dx < -25); R.classList.toggle("hot", dx > 25);
  L.classList.toggle("dim", dx > 25);  R.classList.toggle("dim", dx < -25);
}

// Mouse
card.addEventListener("mousedown",  e => onStart(e.clientX, e.clientY));
window.addEventListener("mousemove", e => { if (isDragging) onMove(e.clientX); });
window.addEventListener("mouseup",   () => onEnd());

// Keyboard
window.addEventListener("keydown", e => {
  // İşletim sistemi tuş-tekrarı (basılı tutma / odak kaybından dönüşte "takılı tuş") —
  // buna izin verirsek her tekrar keydown'ı ayrı bir kart kaydırmaya çalışır ve
  // "kendi kendine peş peşe kart kayması" hissi yaratır. Sadece gerçek ilk basışı işle.
  if (e.repeat) return;
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
  _fermanCloseYear(); // biten yılın fermanı — paywall/sınır kontrollerinden önce
  // Paywall daha önce reddedildiyse: bir daha hiç paywall çıkmaz — bunun yerine
  // her oyun 2. yılın sonunda "ölümle" biter (Tam Sürüm alınana kadar kalıcı).
  // Bu ölüm kesin olmalı: normal triggerGameOver() İkinci Şans (reklam/akçe) teklifi
  // sunar ve bu, satın almadan sınırı atlatmaya yarar — burada bilerek atlanıyor.
  if (FREEMIUM_ENABLED && !isFullVersionUnlocked()
      && localStorage.getItem('sadrazam_paywall_declined') === '1'
      && (year + 1) > DECLINED_YEAR_LIMIT) {
    isPaywalled = true;
    showFreeLimitPopup();
    return;
  }
  if (FREEMIUM_ENABLED && !isPaywalled && (year + 1) > FREE_YEAR_LIMIT && !isFullVersionUnlocked()) {
    isPaywalled = true;
    showPaywallScreen();
    return;
  }
  year++;
  Haptics.yearAdvance();
  if (window.playYearAdvance) playYearAdvance();

  if (hasAdvisor("piri_reis")) {
    stats.hazine = Math.min(100, stats.hazine + 8);
  }

  const _diffMod = getDifficultyMod();
  stats.hazine = Math.max(0, stats.hazine - Math.round(PASSIVE_HAZINE_DRAIN * _diffMod.drain));
  // Yıl sonu sağlık düşüşü — o yılki yönetim kalitesine göre kademeli
  changeHealth(governanceHealthYearDelta() * _diffMod.healthDecay);
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
      (c.required_flags || []).every(f => activeFlags[f]) &&
      (c.excluded_flags || []).every(f => !activeFlags[f]) &&
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

  // Divan Sahnesi — yıl 5, 10, 15, 20
  if ([5, 10, 15, 20].includes(year)) {
    forcedQueue.push({
      id: 'divan_sahnesi_' + year,
      type: 'easter',
      easter_type: 'divan_sahnesi',
      character: 'divan-toplantisi',
      character_name: '',
      text: '',
      button: null,
      stat_effect: null,
      _divan_year: year,
    });
  }

  // 5 yılda bir yıl özeti kartı (vergi event'inden sonra sıraya girer)
  if (year % 5 === 0 && year > 0) {
    forcedQueue.push({
      id: 'year_summary_' + year,
      type: 'easter',
      easter_type: 'year_summary',
      character: 'year-summary',
      character_name: '',
      text: '',
      button: null,
      stat_effect: null,
      _snap_stats: { ...stats },
      _snap_year: year,
    });
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
  "kizlaragasi":      "saray",
  "haremkahyasi":     "saray",
  "basmuhasip":       "hazine",
  "venedikbalyosu":   "hazine",
  "tersaneemini":     "yeniçeri",
  "akincibeyi":       "yeniçeri",
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
function triggerGameOver(reason, cause) {
  if (isGameOver) return;
  _deathCause = cause || null;
  _hideCriticalOffer(); // İkinci Şans / ölüm ekranının üstünde kalmasın
  // İkinci Şans ekranı gösterilirken de oyunu HEMEN "bitmiş" say — decide()/dealNext()/
  // checkGameOver() hepsi isGameOver'a bakıp durur. Bu satır olmadan teklif ekranı açıkken
  // arka planda kart dağıtılmaya devam ediyor (bkz. resolveSecondChance) ve bazen ölüm
  // ikinci kez tetiklenip teklif ekranının ALTINDA gerçek game-over'ı işleyip isGameOver'ı
  // true'da kilitliyordu — reklam/akçe ödülü verildikten sonra oyun sessizce devam etmiyordu.
  isGameOver = true;
  if (!_secondChanceOfferedThisGame) {
    const adsLeft = SECOND_CHANCE_DAILY_AD_LIMIT - getSecondChanceAdsUsedToday();
    if (adsLeft > 0 || getAkceBalance() >= SECOND_CHANCE_AKCE_COST) {
      _secondChanceOfferedThisGame = true; // bu oyun boyunca bir daha teklif edilmeyecek
      showSecondChanceOffer(reason);
      return;
    }
  }
  _actuallyTriggerGameOver(reason);
}

let _execPlayedFor = null; // aynı ölüm için kılıç sahnesi iki kez oynamasın
function _actuallyTriggerGameOver(reason, cause) {
  isGameOver = true;
  _stopFuse();
  if (cause) _deathCause = cause;
  // İdam Fermanı (Saray 0): kesinleşen ölümde kılıç sahnesi. Padişah ziyareti
  // reddi 3. yıldan önce gelmediği için ücretsiz oyuncu bu sahneyi hiç görmüyordu.
  if (_deathCause === "saray_0" && _execPlayedFor !== reason) {
    _execPlayedFor = reason;
    try { showExecutionAnimation(() => _actuallyTriggerGameOver(reason, cause)); return; }
    catch (e) { console.warn('[exec]', e); }
  }
  // Açık kalmış oyun içi pencereler ölüm ekranının üstünde kalmasın
  ["katib-overlay", "empty-slot-tip", "item-confirm-popup"].forEach(id => document.getElementById(id)?.remove());
  clearSave();
  stopAmbientMusic();
  Haptics.gameOver();
  if (window.stopDangerPulse) stopDangerPulse();

  // Sinematik ölüm
  if (window.playCinematicDeath) playCinematicDeath();

  // Ölüm sahnesi (4 Ekim 2026): HER ölüm tam ekran sahneyle biter. Eski portre
  // sinematiği (son kartın büyüyüp solması) kullanıcı isteğiyle kaldırıldı; görsel bir
  // sebepten yüklenemezse doğrudan ölüm ekranına geçilir.
  _playDeathScene(reason, _deathCause, () => showGameOver(reason), () => setTimeout(() => showGameOver(reason), 400));
}

// ── Ölüm sahnesi (4 Ekim 2026) ──
// Kullanıcının ürettiği çerçevesiz, sinematik görseller (assets/deaths/death-<sebep>.jpg).
// Resim 8 sn'de yaklaşır; başlık, ölüm metni ve tarih alttan belirir; dokununca ölüm ekranı.
const DEATH_SCENE_KEYS = ["saray_0", "saray_100", "yeniceri_0", "yeniceri_100", "ulema_0", "ulema_100", "hazine_0", "hazine_100",
  "saglik", "azil", "sultan_guc", "padisah_red", "sehzade", "free_limit"];
// Kendi görseli olmayan sebepler: en yakın sahne (başlık kendi adıyla kalır)
const DEATH_SCENE_ALIAS = { yanlis_oda: "sultan_guc" };
function _deathSceneImage(key) { return DEATH_SCENE_KEYS.includes(key) ? key : (DEATH_SCENE_ALIAS[key] || "saray_0"); }
function _playDeathScene(reason, key, onDone, onFail) {
  const pre = new Image();
  let started = false;
  const failT = setTimeout(() => { if (!started) { started = true; onFail(); } }, 2500);
  pre.onerror = () => { if (started) return; started = true; clearTimeout(failT); onFail(); };
  pre.onload = () => {
    if (started) return; started = true; clearTimeout(failT);
    const en = window.LANG === 'en';
    const title = (DEATH_TITLES[key] || ["", ""])[en ? 1 : 0];
    const months = (en && window.EN_HICRI_MONTHS) ? window.EN_HICRI_MONTHS : HICRI_MONTHS;
    const esc = (t) => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
    const ov = document.createElement("div");
    ov.id = "death-scene";
    ov.innerHTML = `<div class="ds-img" style="background-image:url('${pre.src}')"></div><div class="ds-shade"></div><div class="ds-vig"></div>
      <div class="ds-txt"><div class="ds-kick">${en ? "THE END OF A REIGN" : "SALTANATIN SONU"}</div><div class="ds-title">${esc(title)}</div><div class="ds-rule"></div>
      <div class="ds-text">${esc(reason)}</div><div class="ds-yr">${en ? `${year} ${year === 1 ? "YEAR" : "YEARS"}` : `${year} YIL`} · ${esc(String(months[hicriMonth % 12]).toLocaleUpperCase(en ? 'en' : 'tr'))} ${hicriYear}</div></div>
      <div class="ds-tap">${en ? "TAP TO CONTINUE" : "DEVAM ETMEK İÇİN DOKUN"}</div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add("on"));
    let done = false;
    const finish = () => { if (done) return; done = true; ov.classList.add("out"); setTimeout(() => ov.remove(), 450); onDone(); };
    setTimeout(() => ov.addEventListener("click", finish), 1200); // kazara dokunuşla atlanmasın
    setTimeout(finish, 14000); // dokunulmazsa kendiliğinden
  };
  pre.src = "assets/deaths/death-" + _deathSceneImage(key) + ".jpg";
}


function showGameOver(reason) {
  if (window.playGameOver) playGameOver();

  saveHighScore();
  saveDeathArchive(reason);
  try { _defterRecordReign(); } catch (e) { console.warn('[defter]', e); }
  GameCenter.submitScore(year);

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
    recBanner.innerHTML = isEN ? `${GAME_ICONS.trophy} NEW RECORD!` : `${GAME_ICONS.trophy} YENİ REKOR!`;
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

  // Tarihçilerin Notu (epilog)
  renderEpilog();

  // Yarım kalan sonuçlar
  const _goPanel = document.getElementById("gameover-panel");
  let _pc = document.getElementById("gameover-pending");
  if (!_pc) { _pc = document.createElement("div"); _pc.id = "gameover-pending"; const y = document.getElementById("gameover-year"); if (y && y.parentNode === _goPanel) y.insertAdjacentElement("afterend", _pc); }
  _pc.innerHTML = _pendingConsequencesHTML(3);
  // Vezirler Defteri satırı (3 Ekim 2026)
  let _dl = document.getElementById("gameover-defter");
  if (!_dl) { _dl = document.createElement("div"); _dl.id = "gameover-defter"; _pc.insertAdjacentElement("afterend", _dl); }
  {
    const en = window.LANG === 'en';
    _dl.innerHTML = `<span>${en ? "Recorded in the Viziers' Ledger" : "Vezirler Defteri'ne işlendi"}${_defterSealsThisGame ? ` · +${_defterSealsThisGame} ${en ? "seal" + (_defterSealsThisGame > 1 ? "s" : "") : "mühür"}` : ""}${_defterIhsanThisGame ? ` · +${_defterIhsanThisGame} ${en ? "akce gift" : "akçe ihsan"}` : ""}</span><button type="button">${en ? "OPEN THE LEDGER" : "DEFTERİ AÇ"}</button>`;
    _dl.querySelector("button").onclick = () => showDefter(0);
  }
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
// Eski kayıtlar ölüm METNİNİ saklıyordu (deathsSeen) — sebebe çevir ki ilerleme kaybolmasın.
function _deathCausesFromCrossGame(cg) {
  if (Array.isArray(cg.deathCauses)) return cg.deathCauses;
  const out = new Set();
  const pools = [DEATH_TEXTS, window.EN_DEATH_TEXTS || {}];
  const special = [["Bedeniniz", "saglik"], ["Your body", "saglik"], ["Sultan seni azletti", "azil"],
    ["urganı iki cellat", "sultan_guc"], ["BRE DEYYUS", "padisah_red"], ["Şehzadenin hamlesi", "sehzade"],
    ["Prince's gambit", "sehzade"], ["yanlış oda", "yanlis_oda"]];
  (cg.deathsSeen || []).forEach(t => {
    if (typeof t !== "string") return;
    for (const pool of pools) for (const [k, arr] of Object.entries(pool)) {
      if ((arr || []).some(x => t.startsWith(x))) out.add(k);
    }
    for (const [needle, k] of special) if (t.includes(needle)) out.add(k);
  });
  return [...out];
}

function buildAchievementState(deathReason) {
  const cg = getCrossGameData();
  return {
    year, stats, isPasaMode, pasaPromoted, cursedEver, sultanId: selectedSultan?.id,
    traitorInvestigated, seenCharacters, receivedLetters, chanceCardsPlayed,
    chanceStreak, chainsCompleted, warVictory, itemsUsed, uniqueItemsCollected,
    minHazine, maxSaray, maxHazine, minAnyStat, characterMemory,
    deathReason: deathReason || "",
    deathCause: _deathCause,
    secretsRevealed: [_halkSevgisiShownThisGame, _casusAgiShownThisGame, traitorInvestigated >= 2, _knotIdsSeenThisGame.size > 0].filter(Boolean).length,
    // Cross-game
    deathsSeen: [...new Set([...(cg.deathsSeen||[]), ...(deathReason?[deathReason]:[])])],
    deathCauses: [...new Set([..._deathCausesFromCrossGame(cg), ...(_deathCause && _deathCause !== "free_limit" ? [_deathCause] : [])])],
    totalCurses: (cg.totalCurses||0) + (cursedEver?1:0),
  };
}

function checkAchievements(deathReason) {
  const state = buildAchievementState(deathReason);
  // Cross-game güncelle
  updateCrossGame({
    deathsSeen: state.deathsSeen,
    deathCauses: state.deathCauses,
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
  newlyUnlocked.forEach(a => GameCenter.reportAchievement(a.id));
  return newlyUnlocked;
}

function showAchievementToast(a) {
  Haptics.achievement();
  const tierColors = { bronze:"#cd7f32", silver:"#aaa", gold:"#C9A227", platinum:"#e5e4e2", secret:"#9b59b6" };
  const color = tierColors[a.tier] || "#C9A227";
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  const _isENach = window.LANG === 'en';
  const _aEN = (_isENach && window.EN_ACHIEVEMENTS && window.EN_ACHIEVEMENTS[a.id]) || {};
  const _aName = _aEN.name || a.name;
  const _secretLabel = _isENach ? 'Secret Achievement' : 'Gizli Başarım';
  toast.innerHTML = `<span style="font-size:18px">${a.icon}</span><span style="color:${color}">${_aName}</span><span style="font-size:10px;opacity:0.7">${a.tier === 'secret' ? _secretLabel : a.tier.toUpperCase()}</span>`;
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
  title.textContent = window.LANG === 'en' ? "ACHIEVEMENTS EARNED" : "KAZANILAN BAŞARIMLAR";
  section.appendChild(title);

  const badgesDiv = document.createElement("div");
  badgesDiv.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;justify-content:center;";
  saved.forEach(id => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a) {
      const badge = document.createElement("div");
      badge.className = "achievement-badge tier-" + a.tier;
      const _badgeEN = (window.LANG === 'en' && window.EN_ACHIEVEMENTS && window.EN_ACHIEVEMENTS[a.id]) || {};
      badge.innerHTML = a.icon + " " + (_badgeEN.name || a.name);
      badge.title = _badgeEN.desc || a.desc;
      badgesDiv.appendChild(badge);
    }
  });
  section.appendChild(badgesDiv);
}

// ── Ölüm Arşivi ───────────────────────────────────────────────────
function saveDeathArchive(reason) {
  const _isENdeath = window.LANG === 'en';
  const _enS = (_isENdeath && window.EN_SULTANS && selectedSultan) ? window.EN_SULTANS[selectedSultan.id] : null;
  const _sultanName = _enS ? _enS.name : (selectedSultan ? selectedSultan.name : "—");
  const _advisorNames = selectedAdvisors.map(a => {
    if (_isENdeath && window.EN_ADVISORS && window.EN_ADVISORS[a.id]) return window.EN_ADVISORS[a.id].name;
    return a.name;
  }).join(", ");
  const archive = JSON.parse(localStorage.getItem("sadrazam_deaths") || "[]");
  archive.unshift({
    year,
    reason: reason.slice(0, 80),
    sultan: _sultanName,
    advisors: _advisorNames,
    date: new Date().toLocaleDateString(_isENdeath ? "en-US" : "tr")
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
  const _isENarch = window.LANG === 'en';
  section.innerHTML = `<div class="death-archive-title">${_isENarch ? 'PAST DEATHS' : 'GEÇMİŞ ÖLÜMLER'}</div>`;

  archive.forEach(d => {
    const entry = document.createElement("div");
    entry.className = "death-entry";
    const _yearStr = _isENarch ? `${d.year} years` : `${d.year} yıl`;
    entry.innerHTML = `<strong>${d.sultan}</strong> · ${_yearStr} · ${d.date}<br><span>${d.reason}</span>`;
    section.appendChild(entry);
  });
}

// ── Epilog (Tarihçilerin Notu) ─────────────────────────────────────
const EPILOG_STAT_LABEL_TR = { saray: "Saray", "yeniçeri": "Ordu", ulema: "Ulema", hazine: "Hazine" };
const EPILOG_STAT_LABEL_EN = { saray: "the Palace", "yeniçeri": "the Army", ulema: "the Clergy", hazine: "the Treasury" };

function getEpilogText() {
  const isEN = window.LANG === 'en';
  const lines = [];

  const enS = (isEN && window.EN_SULTANS && selectedSultan) ? window.EN_SULTANS[selectedSultan.id] : null;
  const sultanName = enS ? enS.name : (selectedSultan ? selectedSultan.name : "Sultan");
  lines.push(isEN
    ? `${year} years as Grand Vizier under ${sultanName} have been recorded in the Divan registers.`
    : `${sultanName} döneminde geçen ${year} yıllık sadrazamlığınız Divan kayıtlarına şöyle geçti:`);

  const entries = Object.entries(stats);
  if (entries.length) {
    const highest = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    const lowest  = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
    if (highest[0] !== lowest[0]) {
      lines.push(isEN
        ? `${EPILOG_STAT_LABEL_EN[highest[0]]} remembers you fondly; ${EPILOG_STAT_LABEL_EN[lowest[0]]} does not.`
        : `${EPILOG_STAT_LABEL_TR[highest[0]]} sizi iyi anıyor; ${EPILOG_STAT_LABEL_TR[lowest[0]]} ise pek değil.`);
    }
  }

  let best = null, worst = null;
  for (const [k, mem] of Object.entries(characterMemory || {})) {
    if (!mem || /^\d+-/.test(k)) continue; // yalnızca insan-okunur isim anahtarları
    const net = (mem.right || 0) - (mem.left || 0);
    if (!best  || net > best.net)  best  = { name: k, net };
    if (!worst || net < worst.net) worst = { name: k, net };
  }
  if (best && best.net >= 3) {
    lines.push(isEN ? `Your closest ally in the Divan was ${best.name}.` : `Divan'daki en güçlü bağınız ${best.name} ile kuruldu.`);
  }
  if (worst && worst.net <= -3 && worst.name !== best?.name) {
    lines.push(isEN ? `Your deepest rivalry was with ${worst.name}.` : `En derin husumetiniz ${worst.name} ile oldu.`);
  }

  lines.push(isEN
    ? `You crossed paths with ${seenCharacters.size} figures of the court.`
    : `Divan'da ${seenCharacters.size} farklı simayla yüzleştiniz.`);

  return lines;
}

// ── Vakayiname (27 Eylül 2026) ───────────────────────────────────────
// Oyun boyunca önemli olaylar kaydedilir (Hicri yıl + mevsim, TR/EN metin,
// önem puanı); ölüm ekranında en önemli 7'si kronolojik sırayla bir Osmanlı
// tarih kitabı sayfası olarak yazılır. Puan: birleşik olay 5, kriz ve geri
// dönen sonuç 4, sonuç doğuran karar ve olay 3, iz bırakan karar 1.
const CHRONICLE_MAX = 60, CHRONICLE_SHOW = 7;
function _recordChronicle(c, dir, newFlags) {
  if (!c || !dir || c.type === "easter" || c.type === "padisah_ziyaret") return;
  const srcMap = _getConsequenceSources();
  let k = null, sc = 0;
  if (c.knot_of) { k = "knot"; sc = 5; }
  else if (c.is_crisis) { k = "crisis"; sc = 4; }
  else if (srcMap[c.id]) { k = "result"; sc = 4; }
  else if (c["triggers_on_" + dir]) { k = "seed"; sc = 3; }
  else if (c.is_event) { k = "event"; sc = 3; }
  else if ((newFlags || []).some(f => !/_resolved$/.test(f))) { k = "mark"; sc = 1; }
  if (!k) return;
  const tr = c[dir + "_text"], en = c[dir + "_text_en"];
  if (!tr) return;
  chronicle.push({ hy: hicriYear, s: getCurrentSeason(), k, sc,
    n: c.character_name || "", ne: c.character_name_en || c.character_name || "", t: tr, te: en || tr });
  if (chronicle.length > CHRONICLE_MAX) { // en düşük puanlı en eskiyi at
    let drop = 0; chronicle.forEach((e, i) => { if (e.sc < chronicle[drop].sc) drop = i; });
    chronicle.splice(drop, 1);
  }
}
function _chronicleHTML() {
  const en = window.LANG === 'en';
  const esc = (t) => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const seasons = en ? SEASONS_EN : SEASONS_TR;
  // Puan sırasıyla doldur; sığmayan puan grubundan saltanat boyunca eşit
  // aralıklarla seç (hep en yeniler seçilirse ilk yıllar sayfadan düşüyordu)
  const all = chronicle.map((e, i) => ({ e, i }));
  let pick = [];
  for (const sc of [...new Set(all.map(x => x.e.sc))].sort((a, b) => b - a)) {
    const tier = all.filter(x => x.e.sc === sc), room = CHRONICLE_SHOW - pick.length;
    if (room <= 0) break;
    if (tier.length <= room) { pick = pick.concat(tier); continue; }
    for (let j = 0; j < room; j++) pick.push(tier[room === 1 ? 0 : Math.round(j * (tier.length - 1) / (room - 1))]);
  }
  pick.sort((a, b) => a.i - b.i);
  const enS = (en && window.EN_SULTANS && selectedSultan) ? window.EN_SULTANS[selectedSultan.id] : null;
  const sultanName = enS ? enS.name : (selectedSultan ? selectedSultan.name : "Sultan");
  const start = (selectedSultan && SULTAN_HICRI_START[selectedSultan.id]) || hicriYear;
  const epilog = getEpilogText();
  const items = pick.length
    ? pick.map(({ e }) => `<li class="vk-${e.k}"><span class="vk-yr">${e.hy} · ${seasons[e.s] ? seasons[e.s].toLocaleUpperCase(en ? 'en' : 'tr') : ""}</span><br>${e.k === "knot" ? "✦ " : ""}${esc(en ? e.ne : e.n)} · “${esc(en ? e.te : e.t)}”</li>`).join("")
    : `<li class="vk-empty">${en ? "Nothing great enough to record was decided in so brief a vizierate." : "Bu kısa sadrazamlıkta kayda geçecek büyük bir karar alınamadı."}</li>`;
  return `<div class="vk-title">${en ? "CHRONICLE" : "VAKAYİNAME"}</div>
    <div class="vk-sub">${en ? `Grand Vizier under ${esc(sultanName)} · ${start}–${hicriYear} AH` : `${esc(sultanName)} devrinin sadrazamı · ${start}–${hicriYear} H.`}</div>
    <div class="vk-orn">✦ ✦ ✦</div>
    <p class="vk-intro">${esc(epilog[0] || "")}</p>
    <ol class="vk-list">${items}</ol>
    <div class="vk-end">${epilog.slice(1).map(l => `<p>${esc(l)}</p>`).join("")}</div>
    <div class="vk-stamp"><b>${year}</b><span>${en ? (year === 1 ? "YEAR" : "YEARS") : "YIL"}</span></div>`;
}

function renderEpilog() {
  let section = document.getElementById("gameover-epilog");
  if (!section) {
    section = document.createElement("div");
    section.id = "gameover-epilog";
    const panel = document.getElementById("gameover-panel");
    if (panel) {
      const restartBtn = document.getElementById("restart-btn");
      panel.insertBefore(section, restartBtn);
    }
  }
  // Vakayiname sayfası (Tarihçilerin Notu cümleleri sayfanın açılışı ve kapanışı oldu)
  section.className = "vakayiname";
  section.innerHTML = _chronicleHTML();
}

function saveHighScore() {
  const best = parseInt(localStorage.getItem("sadrazam_best_year") || "0");
  if (year > best) {
    localStorage.setItem("sadrazam_best_year", String(year));
  }
  // Ascension: 20+ yıl hayatta kalınca "Kadim Vezir +1" kilidi açılır
  if (year >= 20 && !isAscensionUnlocked()) {
    localStorage.setItem('sadrazam_ascension_unlocked', '1');
  }
}

// ── Paylaşım ─────────────────────────────────────────────────────
document.getElementById("share-btn").addEventListener("click", showShareMenu);

function getShareText() {
  const _isENshare = window.LANG === 'en';
  const _enS = (_isENshare && window.EN_SULTANS && selectedSultan) ? window.EN_SULTANS[selectedSultan.id] : null;
  const sultanName = _enS ? _enS.name : (selectedSultan ? selectedSultan.name : "Sultan");
  if (_isENshare) {
    return `I survived ${year} years in Divan: Sadrazam during the reign of ${sultanName}! How long can YOU last? 🗡️\n\nDownload on the App Store!\nhttps://apps.apple.com/tr/app/divan-sadrazam/id6783881003`;
  }
  return `Divan: Sadrazam'da ${sultanName} döneminde ${year} yıl ayakta kalabildim! Sen kaç yıl dayanabilirsin? 🗡️\n\nApp Store'dan İndir!\nhttps://apps.apple.com/tr/app/divan-sadrazam/id6783881003`;
}

function showShareMenu() {
  document.getElementById("share-menu")?.remove();
  const menu = document.createElement("div");
  menu.id = "share-menu";
  const _isENsm = window.LANG === 'en';
  menu.innerHTML = `
    <div id="share-menu-box">
      <div id="share-menu-title">${_isENsm ? 'SHARE' : 'PAYLAŞ'}</div>
      <button class="share-opt" id="share-wp">WhatsApp</button>
      <button class="share-opt" id="share-x">X (Twitter)</button>
      <button class="share-opt" id="share-ferman">${_isENsm ? 'Share as Decree' : 'Ferman Olarak Paylaş'}</button>
      <button class="share-opt ghost" id="share-cancel">${_isENsm ? 'Cancel' : 'İptal'}</button>
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
  const _isENferman = window.LANG === 'en';
  drawText(_isENferman ? "YOUR TENURE AS GRAND VIZIER HAS ENDED" : "SADRAZAMLIK SONA ERDİ", 310, _isENferman ? 20 : 28, "#C9A227");
  drawText(_isENferman ? (sultanName + " Era · " + year + " Years") : (sultanName + " Dönemi · " + year + " Yıl"), 360, 18, "rgba(240,230,208,0.7)");

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
  // Challenge panelini temizle, modu sıfırla
  document.getElementById('challenge-panel')?.remove();
  isChallengeMode   = false;
  challengeGoals    = [];
  challengeComplete = false;

  // Clean up extra elements
  ["new-record-banner","death-archive-section","achievements-section"].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.parentNode) { /* keep for next round */ }
  });

  const cinematicEl = document.getElementById("cinematic-death");
  if (cinematicEl) cinematicEl.classList.add("hidden");

  introScreen.style.display = "";
  setTimeout(maybeShowStarterOffer, 700); // 5. oyundan sonra Başlangıç Kesesi (bir kez)
}

// ── Oyun İçi Menü ────────────────────────────────────────────────
// ── Harita Overlay ────────────────────────────────────────────────
// ── Ayarlar Overlay ───────────────────────────────────────────────
const _settOv = document.getElementById('settings-overlay');

function _settUpdateUI() {
  document.getElementById('sett-mus-on').classList.toggle('active', window.musicEnabled !== false);
  document.getElementById('sett-mus-off').classList.toggle('active', window.musicEnabled === false);
  document.getElementById('sett-sfx-on').classList.toggle('active', window.sfxEnabled !== false);
  document.getElementById('sett-sfx-off').classList.toggle('active', window.sfxEnabled === false);
  document.getElementById('sett-lang-tr').classList.toggle('active', window.LANG !== 'en');
  document.getElementById('sett-lang-en').classList.toggle('active', window.LANG === 'en');
  const _sfxOn = (() => { try { return localStorage.getItem('sadrazam_season_fx') !== 'off'; } catch (e) { return true; } })();
  document.getElementById('sett-season-on').classList.toggle('active', _sfxOn);
  document.getElementById('sett-season-off').classList.toggle('active', !_sfxOn);
  document.getElementById('sett-preview-on').classList.toggle('active', window.previewMode === true);
  document.getElementById('sett-preview-off').classList.toggle('active', window.previewMode !== true);
  const isEN = window.LANG === 'en';
  document.getElementById('sett-mus-on').textContent  = isEN ? 'On'  : 'Açık';
  document.getElementById('sett-mus-off').textContent = isEN ? 'Off' : 'Kapalı';
  document.getElementById('sett-sfx-on').textContent  = isEN ? 'On'  : 'Açık';
  document.getElementById('sett-sfx-off').textContent = isEN ? 'Off' : 'Kapalı';
  document.getElementById('sett-preview-on').textContent  = isEN ? 'On'  : 'Açık';
  document.getElementById('sett-preview-off').textContent = isEN ? 'Off' : 'Kapalı';
  document.getElementById('sett-season-on').textContent  = isEN ? 'On'  : 'Açık';
  document.getElementById('sett-season-off').textContent = isEN ? 'Off' : 'Kapalı';
  const _tm = _timedSetting();
  [['normal', 'Normal', 'Normal'], ['slow', 'Yavaş', 'Slow'], ['off', 'Kapalı', 'Off']].forEach(([k, tr, enL]) => {
    const b = document.getElementById('sett-timed-' + k);
    if (b) { b.classList.toggle('active', _tm === k); b.textContent = isEN ? enL : tr; }
  });
}

function showSettingsOverlay() {
  _settUpdateUI();
  _settOv.style.display = 'flex';
}

function hideSettingsOverlay() {
  _settOv.style.display = 'none';
}

document.getElementById('sett-mus-on').addEventListener('click',  () => { window.musicEnabled = true;  localStorage.setItem('sadrazam_music','on');  playMenuMusic(); _settUpdateUI(); });
document.getElementById('sett-mus-off').addEventListener('click', () => { window.musicEnabled = false; localStorage.setItem('sadrazam_music','off'); stopAllMusic();  _settUpdateUI(); });
document.getElementById('sett-sfx-on').addEventListener('click',  () => { window.sfxEnabled = true;  localStorage.setItem('sadrazam_sfx','on');  _settUpdateUI(); });
document.getElementById('sett-sfx-off').addEventListener('click', () => { window.sfxEnabled = false; localStorage.setItem('sadrazam_sfx','off'); _settUpdateUI(); });
document.getElementById('sett-season-on').addEventListener('click',  () => { try { localStorage.setItem('sadrazam_season_fx','on'); } catch (e) {} _settUpdateUI(); });
document.getElementById('sett-season-off').addEventListener('click', () => { try { localStorage.setItem('sadrazam_season_fx','off'); } catch (e) {} _settUpdateUI(); });
['normal', 'slow', 'off'].forEach(k => document.getElementById('sett-timed-' + k)?.addEventListener('click', () => { try { localStorage.setItem('sadrazam_timed', k); } catch (e) {} if (k === 'off') _stopFuse(); _settUpdateUI(); }));
document.getElementById('sett-lang-tr').addEventListener('click', () => { setLang('tr'); _settUpdateUI(); window.applyI18nHTML && window.applyI18nHTML(); });
document.getElementById('sett-lang-en').addEventListener('click', () => { setLang('en'); _settUpdateUI(); window.applyI18nHTML && window.applyI18nHTML(); });
document.getElementById('sett-preview-on').addEventListener('click',  () => {
  const enable = () => { window.previewMode = true; localStorage.setItem('sadrazam_preview_mode','on'); _settUpdateUI(); };
  if (window.previewMode === true) return;
  let seen = false; try { seen = localStorage.getItem('sadrazam_preview_intro_seen') === '1'; } catch (e) {}
  if (seen) { enable(); return; }
  const isEN = window.LANG === 'en';
  const sample = getEffectPreviewHTML({ saray: 5, "yeniçeri": -8, hazine: -12 });
  showModeIntro({
    icon: '<svg class="gi" viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.3"/></svg>',
    title: isEN ? "EXPERIENCED MODE" : "DENEYİMLİ MOD",
    body: isEN
      ? `<p>While you drag a card left or right, the choice shows <b>which powers it will raise or lower</b>:</p><div class="mi-sample"><span class="mi-choice">Raise taxes</span>${sample}</div><p>Only the direction is shown, not the amount. Decisions become more deliberate. You can change this any time in Settings.</p>`
      : `<p>Kartı sağa ya da sola sürüklerken, seçeneğin altında <b>hangi güçleri artırıp azaltacağı</b> görünür:</p><div class="mi-sample"><span class="mi-choice">Vergileri artırın</span>${sample}</div><p>Sadece yön gösterilir, miktar değil. Kararlar daha bilinçli olur. Ayarlar'dan istediğin zaman değiştirebilirsin.</p>`,
    cta: isEN ? "Turn On" : "Aç",
    onContinue: () => { try { localStorage.setItem('sadrazam_preview_intro_seen', '1'); } catch (e) {} enable(); },
  });
});
document.getElementById('sett-preview-off').addEventListener('click', () => { window.previewMode = false; localStorage.setItem('sadrazam_preview_mode','off'); _settUpdateUI(); });
document.getElementById('sett-promo-btn')?.addEventListener('click', async () => {
  const isEN = window.LANG === 'en';
  const status = document.getElementById('sett-promo-status');
  const RC = window.RevenueCatPurchases;
  // presentCodeRedemptionSheet Apple'ın kendi native kod giriş ekranını açar
  // (iOS 14+, App Store hesabına bağlı) — kod doğrulaması/uygulanması tamamen
  // Apple tarafında yapılır, redeem sonrası customerInfo listener (initRevenueCat
  // içinde) hem Tam Sürüm hem akçe kredilerini otomatik işler.
  if (!_rcReady || !RC || !window.Capacitor?.isNativePlatform?.() || typeof RC.presentCodeRedemptionSheet !== 'function') {
    if (status) status.textContent = isEN ? 'Not available right now.' : 'Şu an kullanılamıyor.';
    return;
  }
  try {
    if (status) status.textContent = '';
    await RC.presentCodeRedemptionSheet();
  } catch (e) {
    console.warn('Promosyon kodu ekranı açılamadı:', e);
  }
});
document.getElementById('sett-close').addEventListener('click',   hideSettingsOverlay);
_settOv.addEventListener('click', e => { if (e.target === _settOv) hideSettingsOverlay(); });

// ── Hakkında Popup ───────────────────────────────────────────────
const _aboutOv = document.getElementById('about-overlay');
function showAboutOverlay() { _aboutOv.style.display = 'flex'; }
function hideAboutOverlay() { _aboutOv.style.display = 'none'; }
document.getElementById('sett-about-btn').addEventListener('click', showAboutOverlay);
document.getElementById('about-close').addEventListener('click', hideAboutOverlay);
_aboutOv.addEventListener('click', e => { if (e.target === _aboutOv) hideAboutOverlay(); });

function showHaritaOverlay() {
  document.getElementById('harita-overlay')?.remove();
  const isEN = window.LANG === 'en';

  const PROV_ICONS = { rumeli:GAME_ICONS.province_rumeli, anadolu:GAME_ICONS.province_anadolu, misir:GAME_ICONS.province_misir, dogu:GAME_ICONS.province_dogu, akdeniz:GAME_ICONS.province_akdeniz };
  const rows = PROVINCES.map(p => {
    const loy = Math.round(provinceLoyalty[p.id] || 50);
    const cls = loy <= 25 ? 'prov-danger' : loy >= 70 ? 'prov-ok' : 'prov-warn';
    const badge = loy <= 25 ? GAME_ICONS.loyalty_low : loy >= 70 ? GAME_ICONS.loyalty_high : '';
    return `<div class="prov-row ${cls}">
      <span class="prov-icon">${PROV_ICONS[p.id] || '✦'}</span>
      <div class="prov-info">
        <div class="prov-header">
          <span class="prov-name">${getProvinceLabel(p)}</span>
          <span class="prov-badge">${badge}</span>
          <span class="prov-val">${loy}</span>
        </div>
        <div class="prov-track"><div class="prov-fill" style="width:${loy}%"></div></div>
      </div>
    </div>`;
  }).join('');

  const overallLoy = Math.round(Object.values(provinceLoyalty).reduce((a,b)=>a+b,0)/5);
  const statusLabel = overallLoy >= 70
    ? (isEN ? 'STABLE' : 'KARARLI')
    : overallLoy >= 40
    ? (isEN ? 'TENSE' : 'GERGİN')
    : (isEN ? 'CRITICAL' : 'KRİTİK');
  const statusCls = overallLoy >= 70 ? 'hs-stable' : overallLoy >= 40 ? 'hs-tense' : 'hs-critical';

  const ov = document.createElement('div');
  ov.id = 'harita-overlay';
  ov.innerHTML = `
    <div id="harita-box">
      <div id="harita-bg" style="background-image:url(assets/characters/harita-overlay.jpg)"></div>
      <div id="harita-glass">
        <div id="harita-header">
          <div id="harita-ornament">✦</div>
          <div id="harita-title">${isEN ? 'IMPERIAL MAP' : 'İMPARATORLUK HARİTASI'}</div>
          <div id="harita-status" class="${statusCls}">
            ${isEN ? 'Empire Status' : 'İmparatorluk Durumu'}: <strong>${statusLabel}</strong>
          </div>
        </div>
        <div id="harita-divider-top"></div>
        <div id="harita-provinces">${rows}</div>
        <div id="harita-divider-bot"></div>
        <div id="harita-footer">
          <div id="harita-avg">
            <span class="ha-label">${isEN ? 'Average Loyalty' : 'Ort. Sadakat'}</span>
            <div class="ha-bar-wrap"><div class="ha-bar" style="width:${overallLoy}%"></div></div>
            <span class="ha-val">${overallLoy}</span>
          </div>
          <button id="harita-close-btn">${isEN ? '× Close' : '× Kapat'}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.getElementById('harita-close-btn').onclick = () => ov.remove();
}

// ── Vezirlik Günlüğü — kronolojik karar hatıratı ──────────────────
function showVezirlikGunlugu() {
  document.getElementById('gunluk-overlay')?.remove();
  const isEN = window.LANG === 'en';
  const entries = [...decisionLog].reverse();
  const rows = entries.length
    ? entries.map(e => `
      <div class="gunluk-entry">
        <div class="gunluk-year">${isEN ? 'Year' : 'Yıl'} ${e.year}</div>
        <div class="gunluk-char">${e.character}</div>
        <div class="gunluk-choice">“${e.choice}”</div>
      </div>`).join('')
    : `<div class="gunluk-empty">${isEN ? 'No major decisions recorded yet.' : 'Henüz kayda değer bir karar yok.'}</div>`;

  const ov = document.createElement('div');
  ov.id = 'gunluk-overlay';
  ov.innerHTML = `
    <div id="gunluk-box">
      <div id="gunluk-ornament">✦</div>
      <div id="gunluk-title">${isEN ? "VIZIER'S JOURNAL" : 'VEZİRLİK GÜNLÜĞÜ'}</div>
      <div id="gunluk-divider"></div>
      <div id="gunluk-list">${rows}</div>
      <button id="gunluk-close-btn">${isEN ? '× Close' : '× Kapat'}</button>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.getElementById('gunluk-close-btn').onclick = () => ov.remove();
}

// ── Osmanlı Kodeksi — görülen karakterlerin kalıcı galerisi ───────
function getAllCodexCharacters() {
  const seen = new Set();
  const list = [];
  for (const c of allCards) {
    if (!c.character || c.character === '1-sultan') continue;
    if (seen.has(c.character)) continue;
    seen.add(c.character);
    list.push({ key: c.character, name: c.character_name, name_en: c.character_name_en });
  }
  return list.sort((a, b) => a.key.localeCompare(b.key, 'tr'));
}

function showKartKodeksi() {
  document.getElementById('kodeks-overlay')?.remove();
  const isEN = window.LANG === 'en';
  const everSeen = new Set(getCrossGameData().seenCharactersEver || []);
  const chars = getAllCodexCharacters();
  const count = chars.filter(ch => everSeen.has(ch.key)).length;

  const rows = chars.map(ch => {
    const isSeen = everSeen.has(ch.key);
    const name = isSeen ? ((isEN && ch.name_en) ? ch.name_en : ch.name) : '???';
    const imgPath = "assets/characters/" + encodeURIComponent(ch.key + ".jpg");
    return `<div class="kodeks-card ${isSeen ? '' : 'locked'}">
      ${isSeen
        ? `<img src="${imgPath}" onerror="${CHARACTER_IMAGE_FALLBACK[ch.key] ? `if(!this.dataset.fb){this.dataset.fb=1;this.src='assets/characters/${CHARACTER_IMAGE_FALLBACK[ch.key]}.jpg'}else{this.style.display='none'}` : `this.style.display='none'`}">`
        : `<div class="kodeks-silhouette">?</div>`}
      <span class="kodeks-name">${name}</span>
    </div>`;
  }).join('');

  const ov = document.createElement('div');
  ov.id = 'kodeks-overlay';
  ov.innerHTML = `
    <div id="kodeks-box">
      <div id="kodeks-header">
        <div id="kodeks-title">${isEN ? 'IMPERIAL CODEX' : 'OSMANLI KODEKSİ'}</div>
        <div id="kodeks-count">${count} / ${chars.length}</div>
      </div>
      <div id="kodeks-divider"></div>
      <div id="kodeks-grid">${rows}</div>
      <button id="kodeks-close-btn">${isEN ? '× Close' : '× Kapat'}</button>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.getElementById('kodeks-close-btn').onclick = () => ov.remove();
}

function showGameMenu() {
  if (isGameOver || _sultanGucCinematicActive) return;
  const overlay = document.createElement("div");
  overlay.id = "game-menu-overlay";
  const isENMenu = window.LANG === 'en';
  overlay.innerHTML = `
    <div id="game-menu-box">
      <div id="game-menu-title">${isENMenu ? "PAUSED" : "DURAKLAT"}</div>
      <div id="game-menu-divider"></div>
      <button class="game-menu-option secondary" id="gm-halka">${isENMenu ? "DIVAN CIRCLE" : "DİVAN HALKASI"}</button>
      <button class="game-menu-option secondary" id="gm-journal">${isENMenu ? "VIZIER'S JOURNAL" : "VEZİRLİK GÜNLÜĞÜ"}</button>
      <button class="game-menu-option secondary" id="gm-harita">${isENMenu ? "IMPERIAL MAP" : "İMPARATORLUK HARİTASI"}</button>
      <button class="game-menu-option secondary" id="gm-kodeks">${isENMenu ? "IMPERIAL CODEX" : "OSMANLI KODEKSİ"}</button>
      ${AKCE_SYSTEM_ENABLED ? `<button class="game-menu-option secondary" id="gm-esya">${isENMenu ? "ITEM SHOP" : "EŞYA DÜKKANI"}</button>` : ""}
      <button class="game-menu-option danger" id="gm-quit">${isENMenu ? "END GAME" : "OYUNU BİTİR"}</button>
      <button class="game-menu-option secondary" id="gm-resume">${isENMenu ? "CONTINUE" : "DEVAM ET"}</button>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById("gm-halka").addEventListener("click", () => { overlay.remove(); showDivanHalkasi(); });
  document.getElementById("gm-journal").addEventListener("click", () => { overlay.remove(); showVezirlikGunlugu(); });
  document.getElementById("gm-harita").addEventListener("click",  () => { overlay.remove(); showHaritaOverlay(); });
  document.getElementById("gm-kodeks").addEventListener("click",  () => { overlay.remove(); showKartKodeksi(); });
  if (AKCE_SYSTEM_ENABLED) {
    document.getElementById("gm-esya").addEventListener("click", () => { overlay.remove(); showEsyaDukkani(); });
  }

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

    const icon = isUnlocked ? a.icon : GAME_ICONS.locked;
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
document.getElementById("btn-defter")?.addEventListener("click", () => { if (window.playButtonTap) playButtonTap(); showDefter(0); });
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
