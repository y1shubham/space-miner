const AudioManager = {
  _ctx: null,
  _muted: false,
  _KEY: 'spaceminer_muted',

  // music state
  _musicGain: null,
  _musicDroneNodes: [],
  _musicTimer: null,
  _musicMode: null,   // 'menu' | 'game' | null
  _arpStep: 0,

  init() {
    try { this._muted = localStorage.getItem(this._KEY) === '1'; } catch(e) {}
    if (this._ctx) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {}
  },

  // call this synchronously inside a user-gesture handler
  wakeUp() {
    if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();
  },

  _resume() {
    if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();
  },

  // ─── SFX ────────────────────────────────────────────────────────────────────

  _play(freq, type, duration, vol, freqEnd) {
    if (this._muted || !this._ctx) return;
    this._resume();
    const osc  = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain);
    gain.connect(this._ctx.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, this._ctx.currentTime);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, this._ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(vol || 0.3, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
    osc.start();
    osc.stop(this._ctx.currentTime + duration);
  },

  hit()            { this._play(120,'sawtooth',0.18,0.4,40); this._play(80,'square',0.12,0.2,30); },
  collect(type)    { const f={iron:440,silver:554,gold:660,diamond:880}[type]||440; this._play(f,'sine',0.12,0.25,f*1.5); this._play(f*1.5,'triangle',0.08,0.1); },
  combo(level)     { const b=330+level*110; this._play(b,'sine',0.1,0.2,b*1.3); },
  powerup()        { this._play(440,'sine',0.06,0.2,880); this._play(660,'sine',0.06,0.2,1320); this._play(880,'sine',0.1,0.3,1760); },
  gameOver()       { this._play(300,'sawtooth',0.3,0.4,80); this._play(200,'square',0.5,0.3,60); },
  uiClick()        { this._play(660,'sine',0.06,0.15,880); },

  // ─── MUSIC ──────────────────────────────────────────────────────────────────

  startMenuMusic() {
    if (!this._ctx || this._muted) return;
    if (this._musicMode === 'menu') return;
    this._stopMusicNow();
    this._musicMode = 'menu';
    this._arpStep   = 0;
    this._musicGain = this._ctx.createGain();
    this._musicGain.gain.setValueAtTime(0.001, this._ctx.currentTime);
    this._musicGain.gain.linearRampToValueAtTime(1.2, this._ctx.currentTime + 3);
    this._musicGain.connect(this._ctx.destination);
    this._startDroneLayers(0.15, 0.10);
    this._scheduleArp('menu');
  },

  startGameMusic() {
    if (!this._ctx || this._muted) return;
    if (this._musicMode === 'game') return;
    this._stopMusicNow();
    this._musicMode = 'game';
    this._arpStep   = 0;
    this._musicGain = this._ctx.createGain();
    this._musicGain.gain.setValueAtTime(0.001, this._ctx.currentTime);
    this._musicGain.gain.linearRampToValueAtTime(1.2, this._ctx.currentTime + 4);
    this._musicGain.connect(this._ctx.destination);
    this._startDroneLayers(0.15, 0.10);
    this._scheduleArp('game');
  },

  stopMusic() {
    const mode = this._musicMode;
    this._musicMode = null;
    if (!this._musicGain) return;
    const t  = this._ctx.currentTime;
    const mg = this._musicGain;
    const nodes = this._musicDroneNodes.slice();
    if (this._musicTimer) { clearTimeout(this._musicTimer); this._musicTimer = null; }
    this._musicGain      = null;
    this._musicDroneNodes = [];
    mg.gain.cancelScheduledValues(t);
    mg.gain.setValueAtTime(mg.gain.value, t);
    mg.gain.linearRampToValueAtTime(0.001, t + 1.5);
    setTimeout(() => {
      nodes.forEach(n => { try { n.stop(); } catch(e) {} try { n.disconnect(); } catch(e) {} });
      try { mg.disconnect(); } catch(e) {}
    }, 1600);
  },

  // immediate stop (used before starting new music track)
  _stopMusicNow() {
    this._musicMode = null;
    if (this._musicTimer) { clearTimeout(this._musicTimer); this._musicTimer = null; }
    if (!this._musicGain) return;
    const mg = this._musicGain;
    const nodes = this._musicDroneNodes.slice();
    this._musicGain       = null;
    this._musicDroneNodes = [];
    nodes.forEach(n => { try { n.stop(); } catch(e) {} try { n.disconnect(); } catch(e) {} });
    try { mg.disconnect(); } catch(e) {}
  },

  _startDroneLayers(bassVol, padVol) {
    // bass drone at 110Hz (A2) — audible on laptop/phone speakers
    [110, 110.5, 109.6].forEach(f => {
      const osc = this._ctx.createOscillator();
      const g   = this._ctx.createGain();
      osc.type  = 'sine'; osc.frequency.value = f; g.gain.value = bassVol;
      osc.connect(g); g.connect(this._musicGain); osc.start();
      this._musicDroneNodes.push(osc);
    });
    // chord pad — C3 minor (C, Eb, G, Bb) — 130–233Hz, clear on any speaker
    [130.8, 155.6, 196.0, 233.1].forEach((f, i) => {
      const osc  = this._ctx.createOscillator();
      const g    = this._ctx.createGain();
      const lfo  = this._ctx.createOscillator();
      const lfoG = this._ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f + i * 0.2; g.gain.value = padVol;
      lfo.frequency.value = 0.15 + i * 0.03; lfoG.gain.value = 0.012;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      lfo.start(); osc.start(); osc.connect(g); g.connect(this._musicGain);
      this._musicDroneNodes.push(osc, lfo);
    });
  },

  _scheduleArp(mode) {
    if (this._musicMode !== mode || !this._musicGain) return;

    const isGame  = mode === 'game';
    // game: C minor pentatonic, faster
    // menu: higher register, slower, more spacious
    const scale   = isGame
      ? [261.6, 311.1, 349.2, 392.0, 466.2, 523.2, 392.0, 311.1, 261.6, 349.2]
      : [523.2, 622.3, 698.5, 784.0, 932.3, 1046.5, 784.0, 622.3];
    const stepT   = isGame ? 0.42 : 0.9;
    const noteVol = isGame ? 0.55 : 0.45;
    const STEPS   = isGame ? 8 : 6;
    const skip    = isGame ? new Set([2, 5]) : new Set([1, 4]);
    const now     = this._ctx.currentTime;

    for (let i = 0; i < STEPS; i++) {
      if (skip.has(i)) continue;
      const freq = scale[(this._arpStep + i) % scale.length];
      const t    = now + i * stepT;
      const osc  = this._ctx.createOscillator();
      const env  = this._ctx.createGain();
      osc.type   = isGame ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0.001, t);
      env.gain.linearRampToValueAtTime(noteVol, t + (isGame ? 0.03 : 0.08));
      env.gain.exponentialRampToValueAtTime(0.001, t + stepT * (isGame ? 0.78 : 0.85));
      osc.connect(env); env.connect(this._musicGain);
      osc.start(t); osc.stop(t + stepT * 0.9);
    }

    this._arpStep = (this._arpStep + STEPS) % scale.length;
    this._musicTimer = setTimeout(
      () => this._scheduleArp(mode),
      (STEPS * stepT - 0.6) * 1000
    );
  },

  // ─── MUTE ───────────────────────────────────────────────────────────────────

  toggleMute() {
    this._muted = !this._muted;
    try { localStorage.setItem(this._KEY, this._muted ? '1' : '0'); } catch(e) {}
    if (this._muted) {
      this._stopMusicNow();
    }
    return this._muted;
  },

  get isMuted() { return this._muted; },
};
