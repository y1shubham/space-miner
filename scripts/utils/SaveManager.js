const SaveManager = {
  _KEY: 'spaceminer_save',

  _defaults() {
    return {
      highScore: 0,
      bestCombo: 0,
      bestTime: 0,
      totalGames: 0,
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this._KEY);
      return raw ? Object.assign(this._defaults(), JSON.parse(raw)) : this._defaults();
    } catch {
      return this._defaults();
    }
  },

  save(data) {
    try {
      localStorage.setItem(this._KEY, JSON.stringify(data));
    } catch {}
  },

  // call at game over with session results
  update({ score, combo, timeMs }) {
    const s = this.load();
    s.highScore  = Math.max(s.highScore, score);
    s.bestCombo  = Math.max(s.bestCombo, combo);
    s.bestTime   = Math.max(s.bestTime, timeMs);
    s.totalGames += 1;
    this.save(s);
    return s;
  },

  clear() {
    localStorage.removeItem(this._KEY);
  },
};
