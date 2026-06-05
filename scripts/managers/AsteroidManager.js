class AsteroidManager {
  constructor(stage, stageW, stageH) {
    this._stage = stage;
    this._sw = stageW;
    this._sh = stageH;
    this._asteroids = [];
    this._spawnTimer = 0;
    this._spawnInterval = C.ASTEROID_SPAWN_INTERVAL;
    this._speedMult = 1;
    this._countPerSpawn = 1;

    // seed initial asteroids
    for (let i = 0; i < C.ASTEROID_BASE_COUNT; i++) this._spawn();
  }

  _spawn() {
    const a = new Asteroid(this._sw, this._sh, this._speedMult);
    this._stage.addChild(a);
    this._asteroids.push(a);
  }

  update(dt) {
    this._spawnTimer += dt;
    if (this._spawnTimer >= this._spawnInterval) {
      this._spawnTimer = 0;
      for (let i = 0; i < this._countPerSpawn; i++) this._spawn();
    }

    for (let i = this._asteroids.length - 1; i >= 0; i--) {
      const a = this._asteroids[i];
      a.update();
      if (!a.active) {
        this._stage.removeChild(a);
        this._asteroids.splice(i, 1);
      }
    }
  }

  scaleDifficulty(level) {
    this._speedMult     = 1 + level * 0.12;
    this._countPerSpawn = 1 + Math.floor(level / 3);
    this._spawnInterval = Math.max(500, C.ASTEROID_SPAWN_INTERVAL - level * 80);
  }

  checkCollision(player) {
    if (player.invincible) return null;
    for (const a of this._asteroids) {
      const dx = player.x - a.x;
      const dy = player.y - a.y;
      if (Math.sqrt(dx*dx + dy*dy) < player.radius + a.radius * 0.75) {
        return a;
      }
    }
    return null;
  }

  destroy() {
    for (const a of this._asteroids) this._stage.removeChild(a);
    this._asteroids = [];
  }

  get list() { return this._asteroids; }
}
