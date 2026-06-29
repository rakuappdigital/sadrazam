// ═══════════════════════════════════════════════════════════════════
//  SADRAZAM — translations.js  (Phase 1: UI + non-card strings)
//  Oyun mantığına (stat keys, flags, effects) DOKUNMAZ.
// ═══════════════════════════════════════════════════════════════════

// ── Hicri Takvim Ayları ──────────────────────────────────────────
window.EN_HICRI_MONTHS = [
  "Muharram","Safar","Rabi al-Awwal","Rabi al-Thani",
  "Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban",
  "Ramadan","Shawwal","Dhu al-Qi'dah","Dhu al-Hijjah"
];

// ── Dinamik Subtitle'lar ──────────────────────────────────────────
window.EN_DYNAMIC_SUBTITLES = [
  "The Year the Storm Broke upon the Bosphorus",
  "The Reign of Dark Corridors",
  "The Days the Divan Chose Silence",
  "The Dance of Shadows at Topkapi",
  "The Season the Stars Aligned Against Us",
  "The Year the Wind Blew from the Qibla",
  "The Silent War Among Viziers",
  "The Days the Treasury Grew Heavy",
  "The Moment Prayer and Sword Were Weighed Together",
  "The Year the Palace Walls Grew Ears",
  "The Balance Between Gold and Blood",
  "The Nights the Crescent Waned",
  "The Era When Titles Were Weighed",
  "The Season the People Stopped Being Silent",
  "The Days the Executioner's Shadow Grew Long",
  "The Age When Ink and Sword Competed",
  "The Doubt Read in the Sultan's Eyes",
  "The Mornings the Red Tughra Trembled",
  "Thorns, Not Roses, in the Palace Garden",
  "The Moment the Ottoman Empire Held Its Breath"
];

window.EN_CONTEXT_SUBTITLES = {
  hazine_low:    "The Year We Saw the Bottom of the Treasury",
  yeniceri_high: "The Janissaries' Favored Grand Vizier",
  saray_low:     "The Days We Fell from Favor",
  ulema_high:    "Reign in the Shadow of Religion",
  hazine_high:   "The Year of Abundance"
};

// ── Sultan Tanımları ──────────────────────────────────────────────
window.EN_SULTANS = {
  kanuni: {
    name: "Suleiman the Magnificent",
    desc: "Balanced start"
  },
  yavuz: {
    name: "Selim the Grim",
    desc: "Powerful but impatient. Low treasury."
  },
  murad3: {
    name: "Murad III",
    desc: "Rich treasury, weak authority."
  }
};

// ── Danışman Tanımları ────────────────────────────────────────────
window.EN_ADVISORS = {
  sokollu: {
    name:  "Sokollu Mehmed Pasha",
    title: "Seasoned Vizier",
    desc:  "All stat changes reduced by 15%"
  },
  piri_reis: {
    name:  "Piri Reis",
    title: "Admiral of the Fleet",
    desc:  "Treasury +8 each year"
  },
  sinan: {
    name:  "Mimar Sinan",
    title: "Chief Architect",
    desc:  "Palace and Clergy effects boosted by 20%"
  },
  semsi: {
    name:  "Şemsi Pasha",
    title: "Palace Secretary",
    desc:  "Sultan's patience drain slowed by 50%"
  },
  hurrem: {
    name:  "Hürrem Haseki Sultan",
    title: "Chief Consort",
    desc:  "Janissary negative effects reduced by 25%"
  }
};

// ── Dönüm Noktası Seçenekleri ─────────────────────────────────────
window.EN_DONUM_CHOICES = [
  { bar: "saray",     barLabel: "Palace ↑",   label: "I strengthened the Palace",           desc: "I strengthened bonds with the Sultan and secured the throne." },
  { bar: "yeniçeri",  barLabel: "Army ↑",     label: "I strengthened the Army",             desc: "I won the loyalty of the Janissaries and protected the borders." },
  { bar: "ulema",     barLabel: "Clergy ↑",   label: "I supported religious authority",     desc: "I ruled in peace with the clergy and earned the people's trust." },
  { bar: "hazine",    barLabel: "Treasury ↑", label: "I grew the Treasury",                 desc: "I filled the state coffers and revived trade." }
];

// ── Ölüm Metinleri ────────────────────────────────────────────────
window.EN_DEATH_TEXTS = {
  saray_0: [
    "The Sultan sent your execution order. The executioner stood at your door.",
    "One morning a messenger arrived from Topkapi — the Sultan's trust had ended.",
    "The palace gates closed. They never opened for you again.",
    "To disappear from the Sultan's sight is to die in the empire.",
    "Years of service erased with a single word: execution."
  ],
  saray_100: [
    "You grew too powerful. The Sultan could not abide this shadow.",
    "Those who enter the throne's shadow either become the throne or become dust. You became dust.",
    "The Sultan pondered your power through the night — and made his decision by morning.",
    "Those who rise too high in a ruler's eyes cannot come back down. Neither could you.",
    "Burn too brightly at court, and someone will snuff you out. You were snuffed out."
  ],
  yeniceri_0: [
    "The army scattered. By the time the enemy saw Istanbul's walls, it was already too late.",
    "When the Janissaries went unpaid, their loyalty ended. And then so did you.",
    "When the borders unravel, everything unravels. Everything did.",
    "An empire without an army exists only on paper. That is all you had left."
  ],
  yeniceri_100: [
    "The Janissaries marched on the palace. They toppled the throne. And you along with it.",
    "When a sword slips from your grasp, it chooses its own master. It did not choose you.",
    "Military power, once uncontrollable, turns to destruction. It did.",
    "A too-powerful army will devour its own Grand Vizier. It devoured you."
  ],
  ulema_0: [
    "The Şeyhülislam accused you of godlessness. The people lynched you.",
    "Your name was not spoken in Friday prayers — that silence said everything.",
    "Once you lose religious authority, the people lose you too. They did.",
    "The imams turned away, the people turned away. You were left utterly alone."
  ],
  ulema_100: [
    "The clergy now takes its orders from the Şeyhülislam, not from you.",
    "Religion was a tool; in the end, the tool had no more need for you.",
    "The Şeyhülislam rose in the Divan — from this point forward, only sharia ruled.",
    "When religious power separates from political power, the Grand Vizier becomes superfluous."
  ],
  hazine_0: [
    "The state went bankrupt. Soldiers went unpaid. Everyone fled.",
    "Empty coffers, empty promises, empty palace. They all arrived together.",
    "When the treasury ends, power ends. When power ends, the state ends.",
    "Without money, decisions become meaningless. And so did you."
  ],
  hazine_100: [
    "That much gold is dangerous. The Sultan accused you of embezzlement.",
    "Excess in the treasury destroys not the state, but the Grand Vizier.",
    "You could not hide your wealth. The palace does not love those with secrets.",
    "The Sultan asked where all the gold had come from. There was no answer."
  ]
};

// ── Rakip Vezir Dinamik Diyalog ───────────────────────────────────
window.EN_RAKIP_GUCLU = [
  "bowed before you, avoiding your gaze.",
  "greeted you and withdrew quickly.",
  "left his words unfinished.",
  "approached hesitantly, flinching as your voice rose."
];
window.EN_RAKIP_ZAYIF = [
  "walked past without a second glance.",
  "smiled and leaned against your chair.",
  "did not hesitate to raise his voice.",
  "looked you directly in the eyes."
];

// ── Easter Egg Metinleri ──────────────────────────────────────────
window.EN_KEHANET_TEXTS = [
  "This city will one day become a museum, Pasha.",
  "The Bosphorus will one day be open to Russian ships.",
  "The Janissaries will one day be abolished by their own hands.",
  "The call to prayer will one day be broadcast from these minarets through loudspeakers.",
  "People will one day carry the entire world in their pockets.",
  "These palace gates will one day open not to enemies, but to tourists.",
  "Ottoman lands will shrink and shrink...",
  "There will be no more sultans one day, Pasha.",
  "Turkish will still be spoken in Anatolia, but the alphabet will change.",
  "The ships crossing these seas will one day produce no smoke.",
  "These wars will one day be displayed behind glass in museums.",
  "Everything will be transmitted through images — news, music, poetry, all of it.",
  "The office of the Caliph will be abolished.",
  "The descendants of this empire will found a republic.",
  "One day people will travel through the sky in metal birds."
];

window.EN_BARBAROS_TEXTS = [
  "I encircled Venice from all sides, Pasha. The Eastern Mediterranean is ours. The Westerners cannot change the map.",
  "At Preveze, eighty-two ships faced me. Where are they now? I am still here.",
  "Piracy, you say? To one who called the Ottoman admiral a pirate, I would have sent my sword in the old days. Now I just laugh.",
  "The French alliance is useful at times, but the wind turns. I learned this at sea. I'll teach it to you too.",
  "Never confuse sailors with land soldiers. One plans, the other breaks plans. That is my work.",
  "Cerbe, Preveze, Tunis — every victory opens the door to the next. No stopping, Pasha.",
  "You have neglected the eastern coasts. This mistake will cost you. The sea does not forgive.",
  "My ships need timber. Don't ask the Janissaries — forests are not their business. I know where to find it."
];

window.EN_LEONARDO_TEXTS = [
  "Bayezid III rejected my bridge proposal. I am still waiting. A bridge over Istanbul is an absolute necessity.",
  "Your rifles are interesting, Pasha. May I examine the mechanism? No one in Florence has seen this.",
  "Ottoman miniaturists do not use perspective. I look at this from another angle — literally.",
  "I designed a flying machine. The Westerners laughed. You laugh too. But in five hundred years you will understand.",
  "Your water channels are excellent, but the pump system is old. If you'll allow me, let me just take a few notes.",
  "I want to open a workshop in Istanbul, near Topkapi. The light is good, the inspiration is abundant.",
  "They asked whether a Florentine would work for the Ottomans. 'Labor knows no religion,' I said. In Latin, no less.",
  "The sky is clear tonight. I am mapping your stars. Science knows no sect, Pasha."
];

window.EN_HALIT_TEXTS = [
  "Grand Vizier, Hürrem sent three letters today. All three against you. Don't be surprised.",
  "I am not Halit Ergenç. Halit Ergenç plays me. Subtle difference, but important, Grand Vizier.",
  "I trusted Ibrahim too. You know how that ended. I see a resemblance between you and him — this is not good.",
  "Something is happening in the Harem again. Something is always happening. I'm not surprised anymore.",
  "Prince Mustafa wanted to see you. He was unavailable. He will never be available again.",
  "Magnificent Century showed me inaccurately. Hürrem wasn't that powerful. Let's say eighty percent.",
  "On set the director would shout 'More dramatic!' Now you're standing there calmly. We're both in the wrong place.",
  "I carried the Ottoman Empire on my shoulders. In the show and in history. Both were heavy, but the show ran longer."
];

window.EN_FELAKET_TEXTS = [
  "Terrible news arrived from the East — plague, famine, and rebellion, all at once.",
  "Palace fire, treasury losses, Janissary unrest. God is testing this state.",
  "An earthquake shook Constantinople. Everything changed in an instant.",
  "Enemy attack, epidemic, and flood came together. The Divan scattered.",
  "The treasury was looted, the walls cracked, the clergy declared crisis. There is no escape."
];

window.EN_MUCIZE_TEXTS = [
  "An unexpected victory report. The empire breathed again, everything fell into place.",
  "Lost gold was found in the treasury, the army renewed its loyalty, the clergy offered prayers of gratitude.",
  "All disputes were resolved by Sultan's decree. The Ottoman Empire grew strong again.",
  "News of the century's greatest harvest. Abundance spread in all directions.",
  "The enemy retreated, trade revived, peace reigned in the palace."
];

window.EN_FISILDAYAN_TEXTS = [
  "Someone will denounce you to the Sultan tomorrow. Be careful, Pasha.",
  "Something is missing from the treasury. No one sees it, but I do.",
  "There is a traitor in the Divan. I don't know who yet, but you'll find out soon.",
  "Trust no one in the palace tonight. Only yourself.",
  "Your next decision could change everything. Do not be hasty.",
  "The Janissaries are not satisfied. No one will tell you this to your face, but listen closely."
];

window.EN_ZAMAN_TEXTS = [
  "Pasha, people carry something in their pocket — they call it a phone. An entire library inside. But they take two days to reply to 'hey what's up.'",
  "A disease broke out, the entire world locked itself home. Two years. Not even the plague managed that. And bread yeast ran out first.",
  "They invented artificial intelligence. It writes poetry, draws pictures, could even be Grand Vizier. I asked it to threaten you but it refused — 'I have ethical concerns,' it said.",
  "Pasha, there's a thing called an 'influencer' — meaning you get paid just for looking nice while doing nothing. I don't understand why the Divan has no such position.",
  "They invented invisible gold called cryptocurrency. Its value halved overnight. People still bought it. If you'd been Treasurer, you would have wept.",
  "Space tours are being sold, Pasha. Not the Sultan — ordinary rich people go. They ascend to the seven heavens, come back down, and tell everyone about it.",
  "There's social media — millions watching each other. A cat video gets more views than a Divan decree. The cat is famous. It doesn't know your name.",
  "People walk while staring at their phones, hit poles, fall into rivers. Nobody stops — because everyone is looking at their phones. That's how the city works.",
  "Pasha, there are elections — every citizen votes. Have you thought about doing this in the Divan? Never mind, I don't recommend it.",
  "A man online makes a video called 'my daily routine' — morning coffee, exercise, lunch. Millions watch this. I watched too, I confess.",
  "They invented self-driving vehicles, Pasha. Cars go by themselves. The driver sleeps inside. You'll say 'mounted courier' — yes, he was sleeping too actually.",
  "A man wants to settle on Mars. Mars. Not because he can't find an apartment in Istanbul — apparently he can find one there.",
  "Pasha, there's a thing called a 'podcast.' Someone talks, millions listen through earphones. If I'd read the Seyahatname aloud, I'd have made a podcast.",
  "Online shopping — everything comes to your door. The marketplace nearly closed. The grocer is finished. Think about it when you're Treasurer.",
  "There's an app that shows your face 30 years from now. Everyone looked, everyone was sad. Pasha, I don't recommend you look.",
  "People are getting 'burned out' — collapsing from overwork. This concept doesn't exist in the Divan. Here you either work or get executed.",
  "There's a board game called 'Catan' — you gather resources, build roads. The Ottomans did the same thing for real. And it was version 1.0.",
  "There's still war in Palestine. There was in Ottoman times too. Some things don't change, Pasha.",
  "AI is drawing pictures. A painter sued saying 'they copied me.' The court didn't understand. They should have asked the Executioner — he'd have solved it more practically.",
  "Pasha, 'influencers' are doing politics now. They have followers, programs, good hair. The only difference from our Divan is the hair."
];

window.EN_EVLIYA_TEXTS = [
  "I came to Topkapi, I saw, I wrote. My address in Istanbul is now unknown, but this is the most beautiful city in the world.",
  "In Yemen, I noticed that camels know the judge. In Istanbul, the judge doesn't know the camels. Interesting, my lord.",
  "In eighty-seven years I traveled a hundred and forty-four thousand kilometers. Pasha, how do you govern without ever traveling?",
  "I swam with a crocodile in the Nile. It was fat and slow, so I escaped. Life is an adventure, my lord.",
  "In Georgia, a musician knew twenty languages. I only knew fourteen. I was embarrassed, took notes, and moved on.",
  "I stayed at a khan's palace in Crimea. The food was excellent but the hospitality was a quarter of what it should be. You'd understand if you'd been raised Ottoman.",
  "In my dream I said 'intercession' to the Prophet, 'journey' came out instead. That's why I'm still on the road, Pasha.",
  "I bought spices from Bukhara, sold them to a Venetian, who sold them to a Frenchman. The price increased eighty percent. That's how the market works.",
  "Europeans have their viziers informing on each other too, Pasha. It's a universal profession, if it's any consolation.",
  "I've been writing everything for seventeen years. I don't know what I'll do when I finish the Seyahatname. I suppose a new journey."
];

// ── Başarım Çevirileri ────────────────────────────────────────────
window.EN_ACHIEVEMENTS = {
  first_step:      { name: "First Step",               desc: "Complete your first game." },
  three_years:     { name: "Three Years' Resistance",  desc: "Survive for 3 years." },
  five_chars:      { name: "Palace Acquaintances",     desc: "Meet 5 different characters in one game." },
  first_letter:    { name: "Word from the Sultan",     desc: "Receive a letter from the Sultan." },
  first_chance:    { name: "Trial of Fate",            desc: "Complete a chance card." },
  first_death:     { name: "The First End",            desc: "Finish the game once." },
  item_user:       { name: "Ready Treasurer",          desc: "Use your first item." },
  five_years:      { name: "Five Years as Grand Vizier", desc: "Survive for 5 years." },
  balanced:        { name: "Master of Balance",        desc: "End the game with all stats between 40–65." },
  hazine_guard:    { name: "Treasury Guardian",        desc: "Keep the treasury above 30 for 5 years." },
  saray_high:      { name: "The Sultan's Favorite",    desc: "Raise the Palace stat above 80." },
  chain_complete:  { name: "Thread Follower",          desc: "Complete a chain decision sequence." },
  traitor_found:   { name: "Found the Traitor",        desc: "Identify the hidden traitor (investigate 2+ times)." },
  war_victory:     { name: "Herald of Victory",        desc: "Accept a war and see it to victory." },
  all_letters:     { name: "All the Letters",          desc: "Receive 4 sultan letters in one game." },
  no_curse:        { name: "No Curse",                 desc: "Finish a game without triggering any curse." },
  ten_years:       { name: "Ten Years as Grand Vizier", desc: "Survive for 10 years." },
  kanuni_ten:      { name: "Legacy of the Magnificent", desc: "Survive 10 years with Suleiman the Magnificent." },
  yavuz_eight:     { name: "Worthy of the Grim",       desc: "Survive 8 years with Selim the Grim." },
  murad_treasure:  { name: "Murad's Fortune",          desc: "Raise the treasury above 80 with Murad III." },
  all_deaths:      { name: "I Have Seen It All",       desc: "Experience 8 different causes of death." },
  curse_master:    { name: "Master of Curses",         desc: "Trigger a curse 3 times in total." },
  chance_streak:   { name: "God of Fortune",           desc: "Win 3 chance cards in a row." },
  sabir_imtihani:  { name: "Test of Patience",         desc: "Survive 15 years without triggering any curse." },
  legend:          { name: "Legendary Grand Vizier",   desc: "Survive for 20 years." },
  all_chars:       { name: "Ottoman Encyclopedia",     desc: "Meet all 26 characters in one game." },
  no_low_stat:     { name: "Zero Crisis",              desc: "Survive 10 years without any stat falling below 15." },
  pasa_mode:       { name: "From Pasha to Grand Vizier", desc: "Become Grand Vizier in Pasha mode and survive 5 more years." },
  item_collector:  { name: "Collector",                desc: "Collect 5 different items in one game." },
  gizli_ustat:     { name: "Secret Master",            desc: "Complete 3 hidden missions in one game." },
  rival_five:      { name: "The Rival's Rival",        desc: "Confront the Rival Vizier 5 times." },
  zimmet:          { name: "Embezzlement Suspect",     desc: "Die accused of embezzlement." },
  valide_loyal:    { name: "The Valide's Favorite",    desc: "Accept all of the Valide Sultan's requests in one game." },
  diplomat:        { name: "Cunning Diplomat",         desc: "Negotiate with the Foreign Ambassador 4+ times." },
  deli_dervis_right: { name: "The Prophecy Came True", desc: "Visit the Mad Dervish twice." }
};

// ── UI Stringleri ─────────────────────────────────────────────────
window.UI_STRINGS = {
  tr: {
    // Intro
    'intro.subtitle':       "Osmanlı İmparatorluğu'nda<br/>denge peşindeki bir vezirin hikâyesi",
    // Stat isimleri (görsel)
    'stat.saray':           'Saray',
    'stat.ordu':            'Ordu',
    'stat.ulema':           'Ulema',
    'stat.hazine':          'Hazine',
    // Ana menü butonları
    'btn.sadrazam_mode':    '⚜ SADRAZAM MODU',
    'btn.pasa_mode':        '📜 PAŞALIK MODU',
    'btn.achievements':     '🏆 BAŞARIMLARIM',
    'btn.buy_coins':        '🪙 AKÇE AL',
    'btn.howto':            'NASIL OYNANIR?',
    // Nasıl Oynanır
    'howto.title':          'NASIL OYNANIR?',
    'howto.body1':          "Osmanlı İmparatorluğu'nun en güçlü makamı Sadrazamlık'ta oturuyorsun. Her gün saraydan, halktan, ordundan ve dinden temsilciler huzuruna çıkar. Kararların dört gücün dengesini belirler — ve dengeyi bozarsan başın gider.",
    'howto.saray_desc':     "Sultanın sana güveni. Sıfıra düşerse idam, yüze çıkarsa tehdit.",
    'howto.ordu_desc':      "Yeniçerilerin sadakati. Zayıflarsa düşman gelir, güçlenirse isyan.",
    'howto.ulema_desc':     "Dini otoritenin desteği. Kaybedersen halk seni linç eder.",
    'howto.hazine_desc':    "Devletin parası. Biter dağılır, taşarsa zimmetçilik suçlanırsın.",
    'howto.body2':          "Kartı <strong>sola kaydır</strong> ya da ← tuşuna bas → <em>Hayır</em><br/>Kartı <strong>sağa kaydır</strong> ya da → tuşuna bas → <em>Evet</em><br/>Her 10 kartta bir yıl geçer. Hazine her yıl azalır.",
    'btn.play_now':         'ANLADIM, BAŞLAYALIM',
    'btn.back':             '← GERİ',
    // Başarımlar
    'ach.title':            'BAŞARIMLARIM',
    'ach.tab.all':          'Tümü',
    'ach.tab.bronze':       'Bronz',
    'ach.tab.silver':       'Gümüş',
    'ach.tab.gold':         'Altın',
    'ach.tab.platinum':     'Platin',
    'ach.tab.secret':       'Gizli',
    'ach.btn_back':         '← GERİ',
    // Sultan ekranı
    'sultan.title':         'SULTAN SEÇ',
    'sultan.subtitle':      'Hangi sultan döneminde görev yapıyorsunuz?',
    'btn.continue':         'DEVAM ET →',
    // Danışman ekranı
    'advisor.title':        'DANIŞMANLARINI SEÇ',
    'advisor.subtitle':     'İki danışman seç. Her birinin farklı pasif etkisi var.',
    'advisor.count_init':   '0/2 seçildi',
    'btn.start_game':       'OYUNA BAŞLA →',
    // Oyun içi
    'hint.left':            '← Hayır',
    'hint.right':           'Evet →',
    'card.default_left':    'Hayır',
    'card.default_right':   'Evet',
    'chance.desc':          'Kaderin elinde...',
    'hud.title':            'SADRAZAM',
    // Game over
    'gameover.title_init':  'SADRAZAMLIK SONA ERDİ',
    'btn.restart':          'YENİDEN BAŞLA',
    'btn.share':            'PAYLAŞ',
    // Oyun menüsü (duraklat)
    'gamemenu.title':       'DURAKLAT',
    'gamemenu.quit':        'OYUNU BİTİR',
    'gamemenu.resume':      'DEVAM ET',
    // Tier etiketleri
    'tier.bronze':          'Bronz',
    'tier.silver':          'Gümüş',
    'tier.gold':            'Altın',
    'tier.platinum':        'Platin',
    'tier.secret':          'Gizli',
    // Dönüm noktası
    'donum.title':          'DÖNÜM NOKTASI',
    'donum.text':           'Yıllar geçti, divan sizi izledi. Bu dönemin mirası ne olacak?',
    // Easter egg butonları
    'btn.kehanet':          'YIKIL ZINNIK!',
    'btn.barbaros':         'EYVALLAH REİS',
    'btn.leonardo':         'ALA LEO!',
    'btn.halit':            'MUHTEŞEM!',
    'btn.felaket_mucize':   'PEKÂLÂ',
    'btn.zaman':            'NE DERSİN ZINNIK?',
    'btn.evliya':           'Eyvallah',
    'btn.kedi':             'ÂLÂ',
    'btn.yanlis':           'DEVRÜL KARŞIMDAN',
    // Karakter isimleri (easter egg)
    'char.deli_dervis':     'Deli Derviş',
    'char.barbaros':        'Barbaros Hayreddin Paşa',
    'char.kader':           'Kader',
    'char.zaman':           'Zaman Yolcusu',
    'char.evliya':          'Evliya Çelebi',
    'char.saray_kedisi':    'Saray Kedisi',
    'char.yanlis_adam':     'Yanlış Adam',
    'char.donum':           'Dönüm Noktası',
    'char.miras':           'Miras Habercisi',
    // Danışman max uyarısı
    'advisor.max_alert':    'En fazla 2 danışman seçebilirsiniz.',
    // Başarım bildirimi (game over)
    'ach.earned_title':     'KAZANILAN BAŞARIMLAR',
    'ach.secret_toast':     'Gizli Başarım',
    // Ölüm arşivi
    'death_archive.title':  'GEÇMİŞ ÖLÜMLER',
    'death_archive.years':  (y) => `${y} yıl`,
    // Paylaş menüsü
    'share.menu_title':     'PAYLAŞ',
    'share.ferman_btn':     'Ferman Olarak Paylaş',
    'share.cancel':         'İptal',
    // Sultan etkinlik overlay
    'sultan_event.label':          "SULTAN'DAN HABER",
    'sultan_event.positive_effect': 'Tüm güçler +20',
    'sultan_event.negative_effect': 'Tüm güçler −10',
    'sultan_event.accept':          'Başüstüne Hünkarım',
    // Padişah ziyareti
    'padisah.name':    'Padişahım',
    'padisah.decline': 'Reddet',
    'padisah.accept':  'Biat Et',
    // Eşya popup
    'item.earned_title': 'YENİ EŞYA KAZANILDI',
    'item.what_does':    'NE İŞE YARAR?',
    'item.how_to':       'NASIL KULLANILIR?',
    'item.how_to_desc':  "Ekranın altındaki eşya slotuna dokun → \"Kullan\" seç → Sonraki kart geldiğinde otomatik devreye girer.",
    'item.condition':    '✦ Kazanım koşulu:',
    'item.got_it':       'ANLADIM →',
    'item.expired':      'Tükendi',
    'item.use':          'Kullan ✓',
    'item.cancel':       'Vazgeç',
  },

  en: {
    // Intro
    'intro.subtitle':       "The story of a vizier seeking balance<br/>in the Ottoman Empire",
    // Stats
    'stat.saray':           'Palace',
    'stat.ordu':            'Army',
    'stat.ulema':           'Clergy',
    'stat.hazine':          'Treasury',
    // Main menu buttons
    'btn.sadrazam_mode':    '⚜ GRAND VIZIER MODE',
    'btn.pasa_mode':        '📜 PASHA MODE',
    'btn.achievements':     '🏆 ACHIEVEMENTS',
    'btn.buy_coins':        '🪙 BUY COINS',
    'btn.howto':            'HOW TO PLAY?',
    // How to play
    'howto.title':          'HOW TO PLAY?',
    'howto.body1':          "You sit in the most powerful office of the Ottoman Empire — the Grand Vizierate. Every day, envoys from the palace, the people, the army, and the clergy appear before you. Your decisions determine the balance of four powers — and if you upset the balance, you lose your head.",
    'howto.saray_desc':     "The Sultan's trust in you. If it reaches zero, you'll be executed. If it reaches a hundred, you become a threat.",
    'howto.ordu_desc':      "The loyalty of the Janissaries. If it weakens, enemies will come. If it grows too strong, they will revolt.",
    'howto.ulema_desc':     "Support from religious authority. Lose it, and the people will turn against you.",
    'howto.hazine_desc':    "The state's money. Empty it and everything collapses. Let it overflow and you'll be accused of embezzlement.",
    'howto.body2':          "<strong>Swipe left</strong> or press ← → <em>No</em><br/><strong>Swipe right</strong> or press → → <em>Yes</em><br/>Every 10 cards is one year. The treasury decreases every year.",
    'btn.play_now':         "UNDERSTOOD, LET'S PLAY",
    'btn.back':             '← BACK',
    // Achievements
    'ach.title':            'ACHIEVEMENTS',
    'ach.tab.all':          'All',
    'ach.tab.bronze':       'Bronze',
    'ach.tab.silver':       'Silver',
    'ach.tab.gold':         'Gold',
    'ach.tab.platinum':     'Platinum',
    'ach.tab.secret':       'Secret',
    'ach.btn_back':         '← BACK',
    // Sultan screen
    'sultan.title':         'CHOOSE SULTAN',
    'sultan.subtitle':      "Which sultan's era will you serve in?",
    'btn.continue':         'CONTINUE →',
    // Advisor screen
    'advisor.title':        'CHOOSE YOUR ADVISORS',
    'advisor.subtitle':     'Pick two advisors. Each has a unique passive effect.',
    'advisor.count_init':   '0/2 selected',
    'btn.start_game':       'START GAME →',
    // In-game
    'hint.left':            '← No',
    'hint.right':           'Yes →',
    'card.default_left':    'No',
    'card.default_right':   'Yes',
    'chance.desc':          'In the hands of fate...',
    'hud.title':            'GRAND VIZIER',
    // Game over
    'gameover.title_init':  'YOUR TENURE AS GRAND VIZIER HAS ENDED',
    'btn.restart':          'PLAY AGAIN',
    'btn.share':            'SHARE',
    // Game menu
    'gamemenu.title':       'PAUSED',
    'gamemenu.quit':        'END GAME',
    'gamemenu.resume':      'CONTINUE',
    // Tier labels
    'tier.bronze':          'Bronze',
    'tier.silver':          'Silver',
    'tier.gold':            'Gold',
    'tier.platinum':        'Platinum',
    'tier.secret':          'Secret',
    // Turning point
    'donum.title':          'TURNING POINT',
    'donum.text':           'Years have passed, the Divan has been watching. What will be the legacy of this era?',
    // Easter egg buttons
    'btn.kehanet':          'BEGONE, MADMAN!',
    'btn.barbaros':         'WELL SAID, ADMIRAL!',
    'btn.leonardo':         'WELL DONE, LEO!',
    'btn.halit':            'MAGNIFICENT!',
    'btn.felaket_mucize':   'SO BE IT',
    'btn.zaman':            'WHAT DO YOU THINK, MADMAN?',
    'btn.evliya':           'My Regards',
    'btn.kedi':             'VERY WELL',
    'btn.yanlis':           'GET OUT OF MY SIGHT',
    // Character names (easter eggs)
    'char.deli_dervis':     'Mad Dervish',
    'char.barbaros':        'Barbarossa Hayreddin Pasha',
    'char.kader':           'Fate',
    'char.zaman':           'Time Traveler',
    'char.evliya':          'Evliya Çelebi',
    'char.saray_kedisi':    'Palace Cat',
    'char.yanlis_adam':     'Wrong Person',
    'char.donum':           'Turning Point',
    'char.miras':           'Legacy Herald',
    // Advisor alert
    'advisor.max_alert':    'You can select at most 2 advisors.',
    // Achievement badge on gameover
    'ach.earned_title':     'ACHIEVEMENTS EARNED',
    'ach.secret_toast':     'Secret Achievement',
    // Death archive
    'death_archive.title':  'PAST DEATHS',
    'death_archive.years':  (y) => `${y} years`,
    // Share menu
    'share.menu_title':     'SHARE',
    'share.ferman_btn':     'Share as Decree',
    'share.cancel':         'Cancel',
    // Sultan event overlay
    'sultan_event.label':          'MESSAGE FROM THE SULTAN',
    'sultan_event.positive_effect': 'All powers +20',
    'sultan_event.negative_effect': 'All powers −10',
    'sultan_event.accept':          'As you command, my Sultan',
    // Padisah visit
    'padisah.name':    'My Sultan',
    'padisah.decline': 'Refuse',
    'padisah.accept':  'I Pledge Loyalty',
    // Item popup
    'item.earned_title': 'NEW ITEM ACQUIRED',
    'item.what_does':    'WHAT DOES IT DO?',
    'item.how_to':       'HOW TO USE?',
    'item.how_to_desc':  "Tap the item slot at the bottom of the screen → Select 'Use' → It activates automatically when the next card arrives.",
    'item.condition':    '✦ Unlock condition:',
    'item.got_it':       'GOT IT →',
    'item.expired':      'Expired',
    'item.use':          'Use ✓',
    'item.cancel':       'Cancel',
  }
};

// ── Padişah Ziyareti Metinleri ────────────────────────────────────
window.EN_PADISAH_ZIYARET_TEXTS = [
  { text: "Grand Vizier. I wished to speak with you face to face. Will your loyalty to the Ottoman state continue?",            evet: "My life and blood are devoted to the State, my Sultan." },
  { text: "News has come from the Divan. I wished to ask you directly — are you loyal to me?",                                  evet: "Do not doubt my loyalty, my Sultan." },
  { text: "Rumors circulate about the viziers. Are you beyond those rumors, Grand Vizier?",                                     evet: "Yes, my Lord — I am always at your service." },
  { text: "I should have stayed in the palace tonight. I sat and thought of you. Are you pleased with your decisions?",         evet: "Every decision I make is for the good of the State, my Sultan." },
  { text: "The walls of Topkapi hear much. And I know much. Do you understand me, Grand Vizier?",                               evet: "I always understand, my Lord. I am at your command." },
];

// ── Sultan Olay Kartı Metinleri ───────────────────────────────────
window.EN_SULTAN_EVENT_POSITIVE = [
  "State affairs are going well, Grand Vizier. Maintain this balance.",
  "The throne finds you worthy. The Ottoman Empire is strong with you.",
  "Our treasury is full, our army is sound. We wished to express our satisfaction.",
  "This calm in the Divan pleases us. Continue in this manner."
];
window.EN_SULTAN_EVENT_NEGATIVE = [
  "This course of events displeases us, Grand Vizier. We expect you to set things right.",
  "The empire grows weak. This burden rests on your shoulders — know it.",
  "The reports from the Divan are not encouraging. Take precautions without delay.",
  "Patience is wearing thin. Take this as a final warning."
];

// ── Eşya (Item) Tanımları ─────────────────────────────────────────
window.EN_ITEMS = {
  altin_muhur:    { name: "Golden Seal",      desc: "Negate the next treasury penalty" },
  sultan_ferman:  { name: "Sultan's Decree",  desc: "Negate the next palace penalty" },
  yeniceri_nisan: { name: "Janissary Medal",  desc: "Negate the next army penalty" },
  sifa_otu:       { name: "Healing Herb",     desc: "Lowest stat +20 (instant)" },
  casus_maskesi:  { name: "Spy's Mask",       desc: "Skip this card, get the next one" },
  dervis_muska:   { name: "Dervish Amulet",   desc: "Next card does not affect the Sultan's patience" },
};
window.EN_ITEM_HOW_TO_USE = {
  altin_muhur:    "Use to protect your treasury. Activate before the next card if a treasury penalty is coming — the penalty is nullified. A lifesaver when your treasury is critically low.",
  sultan_ferman:  "Use when your palace score is in danger. Activate before the next card if a palace penalty is coming — the penalty is blocked. Use when you are about to fall out of the Sultan's favor.",
  yeniceri_nisan: "Use when about to lose the army. Activate before the next card if an army penalty is coming — no damage. Strong against Janissary revolt or war cards.",
  sifa_otu:       "Immediate effect! Activating adds +20 to your lowest stat instantly. A quick lifesaver in critical moments or when running low.",
  casus_maskesi:  "Use when you get an unwanted card. Activating skips the current card entirely and brings the next one. Ideal for escaping a dangerous character.",
  dervis_muska:   "Use against cards that reduce the Sultan's patience. Activating means the next card will not affect the Sultan's patience at all. A lifesaver when the Sultan's patience is dwindling.",
};
window.EN_ITEM_GRANT_CONDITIONS = {
  'sultan_tımar_ödülü':      "Palace ≥ 55 and at least year 3",
  'yeniceri_tüfek_talebi':   "Army ≥ 50 and at least year 2",
  'defterdar_borç_teklifi':  "Treasury ≥ 50 and at least year 3",
  'hekimbasi_darüşşifa':     "Any stat ≤ 35 (in critical condition)",
  'derviş_kıyamet':          "Clergy ≤ 40 or Sultan's patience ≤ 40",
  'casuslar_gizli_kimlik':   "At least year 4 and Palace between 25–65",
};

// ── i18n Çekirdek Fonksiyonları ───────────────────────────────────

window.LANG = localStorage.getItem('sadrazam_lang') || 'tr';

// Basit string veya fonksiyon döndürür
window.t = function(key) {
  const map = window.UI_STRINGS[window.LANG] || window.UI_STRINGS.tr;
  if (map[key] !== undefined) return map[key];
  const fallback = window.UI_STRINGS.tr;
  return fallback[key] !== undefined ? fallback[key] : key;
};

// Dinamik string: t('key', arg1, arg2, ...)
window.tf = function(key) {
  const val = window.t(key);
  if (typeof val === 'function') {
    const args = Array.prototype.slice.call(arguments, 1);
    return val.apply(null, args);
  }
  return val;
};

// HTML data-i18n elementlerini güncelle
window.applyI18nHTML = function() {
  document.documentElement.lang = window.LANG;

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    const key = el.getAttribute('data-i18n');
    const val = window.t(key);
    if (val && val !== key) el.innerHTML = val;
  });

  // Dil butonları aktif durumu
  document.querySelectorAll('[data-lang-btn]').forEach(function(btn) {
    btn.classList.toggle('lang-active', btn.getAttribute('data-lang-btn') === window.LANG);
  });
};

// Dil değiştir — sadece intro ekranında çağrılır
window.setLang = function(lang) {
  if (!window.UI_STRINGS[lang]) return;
  window.LANG = lang;
  localStorage.setItem('sadrazam_lang', lang);
  window.applyI18nHTML();
};

// Sayfa yüklendiğinde statik metinleri uygula
document.addEventListener('DOMContentLoaded', function() {
  window.applyI18nHTML();
});
