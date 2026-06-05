class PowerUpManager {
  constructor(stage, stageW, stageH) {
    this._stage  = stage;
    this._sw     = stageW;
    this._sh     = stageH;
    this._items  = [];
    this._timer  = C.POWERUP_SPAWN_INTERVAL * 0.6; // first spawn a bit sooner

    this.activeType     = null;
    this.activeTimeLeft = 0;
    this.activeDuration = 0;
  }

  update(dt, player) {
    // spawn
    this._timer += dt;
    if (this._timer >= C.POWERUP_SPAWN_INTERVAL && this._items.length === 0 && !this.activeType) {
      this._timer = 0;
      this._spawn();
    }

    // update items on field
    let collected = null;
    for (let i = this._items.length - 1; i >= 0; i--) {
      const p = this._items[i];
      p.update();

      const dx = player.x - p.x, dy = player.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < player.radius + p.radius) {
        collected = p;
        this._activate(p.type, p.config, player);
        this._stage.removeChild(p);
        this._items.splice(i, 1);
        continue;
      }

      if (!p.active) {
        this._stage.removeChild(p);
        this._items.splice(i, 1);
      }
    }

    // tick active power-up
    if (this.activeType) {
      this.activeTimeLeft -= dt;
      if (this.activeTimeLeft <= 0) {
        this._deactivate(player);
      }
    }

    return collected; // returns PowerUp object if just collected, null otherwise
  }

  _spawn() {
    const p = new PowerUp(this._sw, this._sh);
    this._stage.addChild(p);
    this._items.push(p);
  }

  _activate(type, cfg, player) {
    if (this.activeType) this._deactivate(player);
    this.activeType     = type;
    this.activeDuration = cfg.duration;
    this.activeTimeLeft = cfg.duration;
    if (type === 'shield')     player.shieldActive     = true;
    if (type === 'magnet')     player.magnetActive     = true;
    if (type === 'speedboost') player.speedBoostActive = true;
    AudioManager.powerup();
  }

  _deactivate(player) {
    if (this.activeType === 'shield')     player.shieldActive     = false;
    if (this.activeType === 'magnet')     player.magnetActive     = false;
    if (this.activeType === 'speedboost') player.speedBoostActive = false;
    this.activeType     = null;
    this.activeTimeLeft = 0;
    this.activeDuration = 0;
    this._timer = 0; // reset spawn timer after expiry
  }

  destroy() {
    for (const p of this._items) this._stage.removeChild(p);
    this._items = [];
  }

  get ratio() {
    if (!this.activeType || this.activeDuration === 0) return 0;
    return this.activeTimeLeft / this.activeDuration;
  }
}
