class Player extends createjs.Container {
  constructor(stageW, stageH) {
    super();
    this._sw = stageW;
    this._sh = stageH;
    this.radius = C.PLAYER_RADIUS;
    this.health = 100;
    this.invincible = false;
    this._invTimer = 0;
    this._blinkTimer = 0;
    this.shieldActive = false;
    this.magnetActive = false;
    this.speedBoostActive = false;
    this._tilt = 0;

    this.x = stageW / 2;
    this.y = stageH * 0.78;

    this._buildShip();
    this._buildShield();
  }

  _buildShip() {
    this._ship = new createjs.Container();
    this._exhaust = new createjs.Shape();
    this._ship.addChild(this._exhaust);

    const body = new createjs.Shape();
    const g = body.graphics;
    g.setStrokeStyle(1.5).beginStroke('#5599cc')
      .beginLinearGradientFill(['#1a3a6b','#0d2040'], [0,1], 0,-20,0,18)
      .moveTo(0,-26).lineTo(14,14).lineTo(0,6).lineTo(-14,14).closePath();
    g.beginFill('#0d2244').setStrokeStyle(1).beginStroke('#3366aa')
      .moveTo(-14,14).lineTo(-28,22).lineTo(-16,4).closePath();
    g.beginFill('#0d2244').setStrokeStyle(1).beginStroke('#3366aa')
      .moveTo(14,14).lineTo(28,22).lineTo(16,4).closePath();
    g.beginRadialGradientFill(['#cceeff','#4499cc'],[0,1],-3,-14,0,-3,-14,7)
      .setStrokeStyle(1).beginStroke('#88ccff')
      .drawEllipse(-6,-22,12,14);
    g.beginLinearGradientFill(['#ff6600','#ff2200'],[0,1],0,10,0,18)
      .drawRoundRect(-5,12,10,6,3);

    this._ship.addChild(body);
    this.addChild(this._ship);
  }

  _buildShield() {
    this._shieldShape = new createjs.Shape();
    this._shieldShape.visible = false;
    this.addChild(this._shieldShape);
  }

  update(dt, keys, touchTarget) {
    const speed = this.speedBoostActive ? C.PLAYER_SPEED_BOOST : C.PLAYER_SPEED;
    let dx = 0, dy = 0;

    if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
    if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;

    if (touchTarget) {
      const tdx = touchTarget.x - this.x;
      const tdy = touchTarget.y - this.y;
      const dist = Math.sqrt(tdx*tdx + tdy*tdy);
      if (dist > 4) {
        const factor = Math.min(1, dist / 60);
        dx += (tdx / dist) * factor;
        dy += (tdy / dist) * factor;
      }
    }

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    this.x = Math.max(this.radius, Math.min(this._sw - this.radius, this.x + dx * speed));
    this.y = Math.max(this.radius, Math.min(this._sh - this.radius, this.y + dy * speed));

    this._tilt += (dx * 18 - this._tilt) * 0.12;
    this._ship.rotation = this._tilt;

    this._drawExhaust(dy < 0 || (dy === 0 && Math.abs(dx) > 0));
    this._updateShield();

    if (this.invincible) {
      this._blinkTimer += dt;
      this._ship.visible = Math.floor(this._blinkTimer / 90) % 2 === 0;
      this._invTimer -= dt;
      if (this._invTimer <= 0) { this.invincible = false; this._ship.visible = true; }
    }
  }

  _drawExhaust(thrusting) {
    const g = this._exhaust.graphics.clear();
    const len = thrusting ? Utils.rand(10, 22) : Utils.rand(4, 8);
    g.beginRadialGradientFill(
      ['rgba(255,255,255,0.9)', '#ff6600', 'rgba(255,80,0,0)'],
      [0, 0.3, 1], 0, 14, 0, 0, 14, len
    ).drawEllipse(-5, 12, 10, len);
  }

  _updateShield() {
    this._shieldShape.visible = this.shieldActive;
    if (!this.shieldActive) return;
    const pulse = 0.9 + 0.1 * Math.sin(Date.now() / 120);
    const r = (this.radius + 12) * pulse;
    const g = this._shieldShape.graphics.clear();
    g.setStrokeStyle(2.5).beginStroke('rgba(0,191,255,0.85)')
      .beginRadialGradientFill(['rgba(0,191,255,0.2)', 'rgba(0,0,0,0)'], [0, 1], 0, 0, 0, 0, 0, r)
      .drawCircle(0, 0, r);
  }

  takeDamage(amount) {
    if (this.shieldActive) return 0;
    this.health = Math.max(0, this.health - amount);
    this.invincible = true;
    this._invTimer = C.INVINCIBLE_DURATION;
    this._blinkTimer = 0;
    return amount;
  }

  get dead() { return this.health <= 0; }
}
