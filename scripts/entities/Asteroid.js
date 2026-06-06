class Asteroid extends createjs.Shape {
  constructor(stageW, stageH, speedMult) {
    super();
    this._sw = stageW;
    this._sh = stageH;

    // pick type by weight: small 30%, medium 50%, large 20%
    const roll = Math.random();
    if (roll < 0.30)      this._type = 'small';
    else if (roll < 0.80) this._type = 'medium';
    else                  this._type = 'large';

    if (this._type === 'small') {
      this.radius   = Utils.rand(8, 15);
      this._sMult   = 1.9;
    } else if (this._type === 'large') {
      this.radius   = Utils.rand(42, 62);
      this._sMult   = 0.6;
    } else {
      this.radius   = Utils.rand(18, 36);
      this._sMult   = 1.0;
    }

    this.rotSpeed = Utils.rand(-1.8, 1.8);
    this.active   = true;
    this._buildShape();
    this._spawnOffscreen(speedMult || 1);
  }

  _buildShape() {
    const r   = this.radius;
    const pts = Utils.randInt(7, 11);
    const g   = this.graphics;

    let fill, stroke;
    if (this._type === 'small') {
      fill   = ['#7a3020','#8a3828','#6a2818'][Utils.randInt(0,2)];
      stroke = '#cc5544';
    } else if (this._type === 'large') {
      fill   = ['#505868','#606878','#484e58'][Utils.randInt(0,2)];
      stroke = '#8090a8';
    } else {
      fill   = ['#5a4a3a','#6b5a48','#4a3e30'][Utils.randInt(0,2)];
      stroke = '#8a7060';
    }

    g.setStrokeStyle(1.5).beginStroke(stroke).beginFill(fill);
    g.moveTo(r, 0);
    for (let i = 1; i <= pts; i++) {
      const angle = (i / pts) * Math.PI * 2;
      const rad   = r * Utils.rand(0.72, 1.22);
      g.lineTo(rad * Math.cos(angle), rad * Math.sin(angle));
    }
    g.closePath();

    // craters
    const c1r = r * Utils.rand(0.1, 0.18);
    g.beginFill('rgba(0,0,0,0.25)').drawCircle(Utils.rand(-r*0.35, r*0.35), Utils.rand(-r*0.35, r*0.35), c1r);
    if (r > 14) {
      const c2r = r * Utils.rand(0.06, 0.12);
      g.beginFill('rgba(0,0,0,0.18)').drawCircle(Utils.rand(-r*0.4, r*0.4), Utils.rand(-r*0.4, r*0.4), c2r);
    }
    g.beginFill('rgba(255,255,255,0.06)').drawEllipse(-r*0.4, -r*0.5, r*0.5, r*0.3);
  }

  _spawnOffscreen(speedMult) {
    const speed = (C.ASTEROID_BASE_SPEED + Utils.rand(0, 1.5)) * speedMult * this._sMult;
    // 0=top, 1=right, 2=left - never from bottom (player flies forward)
    const side = Utils.randInt(0, 2);
    const angle = Utils.rand(-0.4, 0.4);
    if (side === 0) {
      // top - come straight down with slight horizontal drift
      this.x = Utils.rand(0, this._sw); this.y = -this.radius - 5;
      this.vx = Math.sin(angle) * speed;
      this.vy = Math.abs(Math.cos(angle) * speed);
    } else if (side === 1) {
      // right - come in from right, biased downward
      this.x = this._sw + this.radius + 5; this.y = Utils.rand(-this.radius, this._sh * 0.6);
      this.vx = -Math.abs(Math.cos(angle) * speed);
      this.vy = Math.abs(Math.sin(angle) * speed) + speed * 0.3;
    } else {
      // left - come in from left, biased downward
      this.x = -this.radius - 5; this.y = Utils.rand(-this.radius, this._sh * 0.6);
      this.vx = Math.abs(Math.cos(angle) * speed);
      this.vy = Math.abs(Math.sin(angle) * speed) + speed * 0.3;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    const pad = this.radius + 80;
    if (this.x < -pad || this.x > this._sw + pad || this.y < -pad || this.y > this._sh + pad) {
      this.active = false;
    }
  }
}
