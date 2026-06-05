class ResourceManager {
  constructor(stage, stageW, stageH) {
    this._stage = stage;
    this._sw = stageW;
    this._sh = stageH;
    this._resources = [];
    this._timer = 0;
    this._interval = C.RESOURCE_SPAWN_INTERVAL;
  }

  update(dt, player) {
    this._timer += dt;
    if (this._timer >= this._interval) {
      this._timer = 0;
      this._spawn();
    }

    const magnet = player.magnetActive ? player : null;
    let collected = null;

    for (let i = this._resources.length - 1; i >= 0; i--) {
      const r = this._resources[i];
      r.update(magnet);

      // collect
      const dx = player.x - r.x, dy = player.y - r.y;
      if (Math.sqrt(dx*dx + dy*dy) < player.radius + r.radius) {
        collected = r.type;
        this._stage.removeChild(r);
        this._resources.splice(i, 1);
        continue;
      }

      if (!r.active) {
        this._stage.removeChild(r);
        this._resources.splice(i, 1);
      }
    }

    return collected;
  }

  scaleDifficulty(level) {
    this._interval = Math.max(800, C.RESOURCE_SPAWN_INTERVAL - level * 100);
  }

  _spawn() {
    const r = new Resource(this._sw, this._sh);
    this._stage.addChildAt(r, this._stage.getChildIndex(this._stage.getChildAt(this._stage.numChildren - 1)));
    this._resources.push(r);
  }

  destroy() {
    for (const r of this._resources) this._stage.removeChild(r);
    this._resources = [];
  }
}
