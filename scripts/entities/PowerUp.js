const POWERUP_CONFIGS = {
  shield:     { color: '#00ccff', glow: '#0055cc', label: 'SHIELD',      duration: 9000 },
  magnet:     { color: '#ff44cc', glow: '#aa0088', label: 'MAGNET',      duration: 8000 },
  speedboost: { color: '#ffcc00', glow: '#cc6600', label: 'SPEED BOOST', duration: 6000 },
};

class PowerUp extends createjs.Container {
  constructor(stageW, stageH) {
    super();
    this._sh = stageH;
    const types = Object.keys(POWERUP_CONFIGS);
    this.type   = types[Math.floor(Math.random() * types.length)];
    this.active = true;
    this.radius = 18;

    this.x = stageW * 0.15 + Math.random() * stageW * 0.7;
    this.y = -40;
    this._vy   = 0.7 + Math.random() * 0.5;
    this._bob  = Math.random() * Math.PI * 2;
    this._baseX = this.x;

    this._build();
  }

  _build() {
    const cfg = POWERUP_CONFIGS[this.type];

    // outer glow ring (pulsed via tween)
    this._ring = new createjs.Shape();
    this.addChild(this._ring);
    this._ringSize = 0;

    // filled circle
    const circle = new createjs.Shape();
    circle.graphics
      .beginRadialGradientFill([cfg.color + 'dd', cfg.color + '33'], [0, 1], 0, -4, 2, 0, 0, 18)
      .setStrokeStyle(2).beginStroke(cfg.color)
      .drawCircle(0, 0, 18);
    this.addChild(circle);

    // icon drawn with graphics
    this._drawIcon(cfg);

    this.shadow = new createjs.Shadow(cfg.glow, 0, 0, 16);

    createjs.Tween.get(this, { loop: true })
      .to({ scaleX: 1.12, scaleY: 1.12 }, 650, createjs.Ease.sineInOut)
      .to({ scaleX: 1,    scaleY: 1    }, 650, createjs.Ease.sineInOut);
  }

  _drawIcon(cfg) {
    const ic = new createjs.Shape();
    const g  = ic.graphics;
    g.setStrokeStyle(2.5).beginStroke('#ffffff');

    if (this.type === 'shield') {
      // shield outline
      g.moveTo(0, -10).lineTo(9, -5).lineTo(9, 3).quadraticCurveTo(0, 12, 0, 12)
       .quadraticCurveTo(-9, 12, -9, 3).lineTo(-9, -5).closePath();
    } else if (this.type === 'magnet') {
      // U-shape magnet
      g.setStrokeStyle(3).beginStroke('#ffffff');
      g.moveTo(-7, -10).lineTo(-7, 2).quadraticCurveTo(-7, 10, 0, 10)
       .quadraticCurveTo(7, 10, 7, 2).lineTo(7, -10);
      // poles
      g.setStrokeStyle(0).beginFill('#ff4444').drawRect(-9, -12, 5, 5);
      g.beginFill('#4444ff').drawRect(4, -12, 5, 5);
    } else {
      // lightning bolt
      g.setStrokeStyle(0).beginFill('#ffffff');
      g.moveTo(3, -12).lineTo(-3, 0).lineTo(2, 0).lineTo(-3, 12).lineTo(9, -2).lineTo(3, -2).closePath();
    }

    this.addChild(ic);
  }

  update() {
    this._bob += 0.032;
    this.y += this._vy;
    this.x  = this._baseX + Math.sin(this._bob) * 5;

    // draw pulsing ring
    this._ringSize = (this._ringSize + 0.5) % (Math.PI * 2);
    const rAlpha = 0.15 + 0.12 * Math.sin(this._ringSize);
    const cfg = POWERUP_CONFIGS[this.type];
    const hx = cfg.color.replace('#','');
    const rr = parseInt(hx.substring(0,2),16);
    const rg = parseInt(hx.substring(2,4),16);
    const rb = parseInt(hx.substring(4,6),16);
    this._ring.graphics.clear()
      .setStrokeStyle(1.5).beginStroke(`rgba(${rr},${rg},${rb},${rAlpha.toFixed(2)})`)
      .drawCircle(0, 0, 26 + 4 * Math.sin(this._ringSize));

    if (this.y > this._sh + 50) this.active = false;
  }

  get config() { return POWERUP_CONFIGS[this.type]; }
}
