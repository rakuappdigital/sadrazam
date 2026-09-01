// sounds.js — Web Audio API ile Ottoman atmosfer sesleri
// Tüm fonksiyonlar global (window.xxx) olarak tanımlanmıştır

(function() {
  let _ctx = null;

  function ctx() {
    if (window.sfxEnabled === false) return null; // efektler kapalı
    if (!_ctx) {
      try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
    }
    if (_ctx && _ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  // İlk kullanıcı etkileşiminde AudioContext kilidi aç (web tarayıcı politikası)
  function unlockAudio() {
    const c = ctx();
    if (!c) return;
    if (c.state === 'suspended') {
      c.resume().then(() => {
        // Sessiz bir tampon çal — unlock için
        const buf = c.createBuffer(1, 1, c.sampleRate);
        const src = c.createBufferSource();
        src.buffer = buf;
        src.connect(c.destination);
        src.start(0);
      });
    }
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('mousedown',  unlockAudio);
    document.removeEventListener('click',      unlockAudio);
  }
  document.addEventListener('touchstart', unlockAudio, { passive: true });
  document.addEventListener('mousedown',  unlockAudio);
  document.addEventListener('click',      unlockAudio);

  // Reverb yardımcısı (global olarak da erişilebilir)
  function createReverb(c, duration, decay) {
    const convolver = c.createConvolver();
    const sr = c.sampleRate;
    const len = sr * duration;
    const buf = c.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    convolver.buffer = buf;
    return convolver;
  }
  window.createReverb = createReverb; // game.js'den erişim için

  // 1. Parchment rustle: white noise burst, bandpass 600-1200Hz, 0.12s decay
  window.playCardDraw = function() {
    const c = ctx();
    const buf = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 1.5;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.18, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
    src.connect(bp);
    bp.connect(gain);
    gain.connect(c.destination);
    src.start();
    src.stop(c.currentTime + 0.2);
  };

  // 2. Brass ding: sawtooth 440→880Hz glide, 0.15s + reverb
  window.playSwipeRight = function() {
    const c = ctx();
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, c.currentTime);
    osc.frequency.linearRampToValueAtTime(880, c.currentTime + 0.12);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.12, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
    const rev = createReverb(c, 0.5, 2);
    osc.connect(gain);
    gain.connect(rev);
    rev.connect(c.destination);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.35);
  };

  // 3. Low thud: sine 80Hz, fast decay 0.1s + noise burst
  window.playSwipeLeft = function() {
    const c = ctx();
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.1);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.25, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.15);
    // noise burst
    const nbuf = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate);
    const nd = nbuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.5;
    const nsrc = c.createBufferSource();
    nsrc.buffer = nbuf;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.1, c.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    nsrc.connect(ng);
    ng.connect(c.destination);
    nsrc.start();
  };

  // 4. Ottoman drum: sine 60Hz thump + harmonic series, 0.4s
  window.playYearAdvance = function() {
    const c = ctx();
    const harmonics = [60, 120, 180];
    harmonics.forEach((freq, i) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = c.createGain();
      const vol = 0.3 / (i + 1);
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(c.currentTime + i * 0.02);
      osc.stop(c.currentTime + 0.5);
    });
  };

  // 5. Heartbeat: two 70Hz sine pulses
  window.playDangerPulse = function() {
    const c = ctx();
    [0, 0.18].forEach(offset => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 70;
      const g = c.createGain();
      g.gain.setValueAtTime(0, c.currentTime + offset);
      g.gain.linearRampToValueAtTime(0.2, c.currentTime + offset + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + offset + 0.1);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(c.currentTime + offset);
      osc.stop(c.currentTime + offset + 0.15);
    });
  };

  // 6. Descending minor: D3→A2→F2→D2, reverb, 2s
  window.playGameOver = function() {
    const c = ctx();
    const notes = [146.83, 110, 87.31, 73.42]; // D3, A2, F2, D2
    const rev = createReverb(c, 2, 3);
    rev.connect(c.destination);
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = c.createGain();
      const t = c.currentTime + i * 0.45;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.connect(g);
      g.connect(rev);
      osc.start(t);
      osc.stop(t + 0.85);
    });
  };

  // 7. Fanfare ascending: C4→E4→G4→C5, major, bright
  window.playAchievement = function() {
    const c = ctx();
    const notes = [261.63, 329.63, 392, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = c.createGain();
      const t = c.currentTime + i * 0.12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  };

  // 8. Eerie: slow sine sweep 200→150Hz, tremolo, 1.5s
  window.playNightCard = function() {
    const c = ctx();
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, c.currentTime);
    osc.frequency.linearRampToValueAtTime(150, c.currentTime + 1.5);
    // tremolo
    const tremOsc = c.createOscillator();
    tremOsc.frequency.value = 5;
    const tremGain = c.createGain();
    tremGain.gain.value = 0.5;
    tremOsc.connect(tremGain);
    const masterGain = c.createGain();
    masterGain.gain.setValueAtTime(0.08, c.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5);
    tremGain.connect(masterGain.gain);
    osc.connect(masterGain);
    masterGain.connect(c.destination);
    osc.start();
    tremOsc.start();
    osc.stop(c.currentTime + 1.5);
    tremOsc.stop(c.currentTime + 1.5);
  };

  // 9. Plague bell: resonant sine 320Hz, slow decay 2s, flanged
  window.playEvent_veba = function() {
    const c = ctx();
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 320;
    const osc2 = c.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 322; // slight detune for flange
    const g = c.createGain();
    g.gain.setValueAtTime(0.15, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
    osc.connect(g);
    osc2.connect(g);
    g.connect(c.destination);
    osc.start();
    osc2.start();
    osc.stop(c.currentTime + 2.5);
    osc2.stop(c.currentTime + 2.5);
  };

  // 10. War drums: rapid 60Hz thumps x4, crescendo
  window.playEvent_savas = function() {
    const c = ctx();
    for (let i = 0; i < 4; i++) {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, c.currentTime + i * 0.15);
      osc.frequency.exponentialRampToValueAtTime(30, c.currentTime + i * 0.15 + 0.12);
      const g = c.createGain();
      const vol = 0.1 + i * 0.05;
      g.gain.setValueAtTime(vol, c.currentTime + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.15 + 0.14);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(c.currentTime + i * 0.15);
      osc.stop(c.currentTime + i * 0.15 + 0.2);
    }
  };

  // 11. Harvest: bright major chord C+E+G, 0.6s, soft attack
  window.playEvent_hasat = function() {
    const c = ctx();
    [261.63, 329.63, 392].forEach(freq => {
      const osc = c.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(0.1, c.currentTime + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.7);
      osc.connect(g);
      g.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.75);
    });
  };

  // 12. Dramatic sting: dissonant chord + crash, 1s
  window.playTraitorReveal = function() {
    const c = ctx();
    [200, 283, 400].forEach((freq, i) => { // dissonant tritone
      const osc = c.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0.08, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
      osc.connect(g);
      g.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 1.3);
    });
    // crash noise
    const nbuf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate);
    const nd = nbuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const nsrc = c.createBufferSource();
    nsrc.buffer = nbuf;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.2, c.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3000;
    nsrc.connect(hp);
    hp.connect(ng);
    ng.connect(c.destination);
    nsrc.start();
  };

  // 13. Low boom: 40Hz sine, 3s decay + rumble noise
  window.playCinematicDeath = function() {
    const c = ctx();
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, c.currentTime + 3);
    const g = c.createGain();
    g.gain.setValueAtTime(0.35, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3.5);
    osc.connect(g);
    g.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 3.5);
    // rumble layer
    const rbuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const rd = rbuf.getChannelData(0);
    for (let i = 0; i < rd.length; i++) rd[i] = Math.random() * 2 - 1;
    const rsrc = c.createBufferSource();
    rsrc.buffer = rbuf;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 120;
    const rg = c.createGain();
    rg.gain.setValueAtTime(0.12, c.currentTime);
    rg.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
    rsrc.connect(lp);
    lp.connect(rg);
    rg.connect(c.destination);
    rsrc.start();
  };

  // 14. Paper unfurl: noise burst shaped like crinkle
  window.playLetterArrival = function() {
    const c = ctx();
    const buf = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const env = i < d.length * 0.15 ? (i / (d.length * 0.15)) : Math.pow(1 - (i - d.length * 0.15) / (d.length * 0.85), 1.5);
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800;
    bp.Q.value = 0.8;
    const g = c.createGain();
    g.gain.value = 0.15;
    src.connect(bp);
    bp.connect(g);
    g.connect(c.destination);
    src.start();
  };

  // Easter egg sesleri

  // Kedi miyavı: 800→1200→600Hz sine sweep
  window.playCatMeow = function() {
    const c = ctx();
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, c.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, c.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(600, c.currentTime + 0.5);
    const vib = c.createOscillator();
    vib.frequency.value = 6;
    const vibG = c.createGain();
    vibG.gain.value = 30;
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.55);
    osc.connect(g); g.connect(c.destination);
    osc.start(); vib.start();
    osc.stop(c.currentTime + 0.6); vib.stop(c.currentTime + 0.6);
  };

  // Kırbaç: yüksek frekans noise burst, 0.08s
  window.playWhipCrack = function() {
    const c = ctx();
    const buf = c.createBuffer(1, c.sampleRate * 0.12, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const env = i < 200 ? i / 200 : Math.pow(1 - (i - 200) / (d.length - 200), 2);
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const g = c.createGain(); g.gain.value = 0.9;
    src.connect(hp); hp.connect(g); g.connect(c.destination);
    src.start();
  };

  // Koşma: hızlı ritimli noise thumps x6
  window.playRunningFootsteps = function() {
    const c = ctx();
    for (let i = 0; i < 6; i++) {
      const osc = c.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(90, c.currentTime + i * 0.1);
      osc.frequency.exponentialRampToValueAtTime(50, c.currentTime + i * 0.1 + 0.07);
      const g = c.createGain();
      g.gain.setValueAtTime(0.22, c.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.1 + 0.09);
      osc.connect(g); g.connect(c.destination);
      osc.start(c.currentTime + i * 0.1);
      osc.stop(c.currentTime + i * 0.1 + 0.1);
    }
  };

  // Rüzgar: bandpass noise sweep 300→800Hz, 1.2s
  window.playWindGust = function() {
    const c = ctx();
    const buf = c.createBuffer(1, c.sampleRate * 1.4, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(300, c.currentTime);
    bp.frequency.linearRampToValueAtTime(800, c.currentTime + 0.6);
    bp.frequency.linearRampToValueAtTime(200, c.currentTime + 1.4);
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.14, c.currentTime + 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.4);
    src.connect(bp); bp.connect(g); g.connect(c.destination);
    src.start();
  };

  // Pargalı hüzün: yavaş azalan minor arpej A2-C3-E3-A3, reverb
  window.playPargaliSad = function() {
    const c = ctx();
    const rev = createReverb(c, 3, 2); rev.connect(c.destination);
    const notes = [110, 130.81, 164.81, 220]; // A2, C3, E3, A3
    notes.forEach((freq, i) => {
      const osc = c.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      const g = c.createGain();
      const t = c.currentTime + i * 0.6;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      osc.connect(g); g.connect(rev); g.connect(c.destination);
      osc.start(t); osc.stop(t + 1.6);
    });
  };

  // Buton tıklama — yumuşak sine tını, kısa
  window.playButtonTap = function() {
    const c = ctx(); if (!c) return;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 740;
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
    osc.connect(g); g.connect(c.destination);
    osc.start(); osc.stop(c.currentTime + 0.13);
  };

  // Seçim onayı — iki nota, yumuşak
  window.playSelectConfirm = function() {
    const c = ctx(); if (!c) return;
    [523, 659].forEach((freq, i) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = c.createGain();
      const t = c.currentTime + i * 0.1;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(g); g.connect(c.destination);
      osc.start(t); osc.stop(t + 0.27);
    });
  };

  // Danger pulse management
  let _dangerInterval = null;

  window.startDangerPulse = function() {
    if (!_dangerInterval) {
      _dangerInterval = setInterval(window.playDangerPulse, 1200);
    }
  };

  window.stopDangerPulse = function() {
    if (_dangerInterval) {
      clearInterval(_dangerInterval);
      _dangerInterval = null;
    }
  };

})();
