const AudioManager = {
  _ctx: null,
  _muted: false,
  _KEY: 'spaceminer_muted',

  // music state
  _menuAudio: null,
  _gameAudio: null,
  _musicMode: null,
  _pendingMode: null,
  _gestureListenerAdded: false,

  init() {
    try { this._muted = localStorage.getItem(this._KEY) === '1'; } catch(e) {}
    if (this._ctx) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {}
    this._menuAudio = new Audio('assets/audio/menu_music.mp3');
    this._menuAudio.loop   = true;
    this._menuAudio.volume = 0.6;
    this._menuAudio.muted  = this._muted;
    this._gameAudio = new Audio('assets/audio/game_music.mp3');
    this._gameAudio.loop   = true;
    this._gameAudio.volume = 0.6;
    this._gameAudio.muted  = this._muted;
  },

  // attach a one-time any-gesture listener so music starts on first interaction
  _waitForGesture(mode) {
    this._pendingMode = mode;
    if (this._gestureListenerAdded) return;
    this._gestureListenerAdded = true;
    const resume = () => {
      ['click','touchstart','keydown'].forEach(e => document.removeEventListener(e, resume, true));
      this._gestureListenerAdded = false;
      const pending = this._pendingMode;
      this._pendingMode = null;
      if (pending === 'menu') this.startMenuMusic();
      else if (pending === 'game') this.startGameMusic();
    };
    ['click','touchstart','keydown'].forEach(e => document.addEventListener(e, resume, { capture: true, once: true }));
  },

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
    if (!this._menuAudio) return;
    if (this._musicMode === 'menu') return;
    this._stopAudio();
    this._musicMode   = 'menu';
    this._pendingMode = null;
    this._menuAudio.currentTime = 0;
    this._menuAudio.play().catch(() => this._waitForGesture('menu'));
  },

  startGameMusic() {
    if (!this._gameAudio) return;
    if (this._musicMode === 'game') return;
    this._stopAudio();
    this._musicMode   = 'game';
    this._pendingMode = null;
    this._gameAudio.currentTime = 14;
    this._gameAudio.play().catch(() => this._waitForGesture('game'));
  },

  _stopAudio() {
    if (this._menuAudio) { this._menuAudio.pause(); this._menuAudio.currentTime = 0; }
    if (this._gameAudio) { this._gameAudio.pause(); this._gameAudio.currentTime = 0; }
  },

  stopMusic() {
    this._musicMode = null;
    if (this._menuAudio) { this._menuAudio.pause(); this._menuAudio.currentTime = 0; }
    if (this._gameAudio) { this._gameAudio.pause(); this._gameAudio.currentTime = 0; }
  },

  // ─── MUTE ───────────────────────────────────────────────────────────────────

  toggleMute() {
    this._muted = !this._muted;
    try { localStorage.setItem(this._KEY, this._muted ? '1' : '0'); } catch(e) {}
    if (this._menuAudio) this._menuAudio.muted = this._muted;
    if (this._gameAudio) this._gameAudio.muted = this._muted;
    return this._muted;
  },

  get isMuted() { return this._muted; },
};
