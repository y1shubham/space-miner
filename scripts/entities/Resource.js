class Resource extends createjs.Container {
  constructor(stageW, stageH) {
    super();
    this._sw = stageW;
    this._sh = stageH;
    this.type = Utils.weightedRandom(C.RESOURCE_TYPES);
    this.radius = this.type.radius;
    this.active = true;
    this._bob = Math.random() * Math.PI * 2;
    this._baseX = Utils.rand(this.radius + 10, stageW - this.radius - 10);
    this.x = this._baseX;
    this.y = -this.radius - 10;
    this.vy = Utils.rand(1.0, 2.2);
    this._buildShape();
  }

  _buildShape() {
    const r = this.radius;
    const { color, name } = this.type;

    // outer glow
    const glow = new createjs.Shape();
    glow.graphics
      .beginRadialGradientFill([this._alpha(color, 0.35), 'rgba(0,0,0,0)'], [0,1], 0,0,0, 0,0,r*2.4)
      .drawCircle(0, 0, r * 2.4);
    this.addChild(glow);

    // main gem body
    const body = new createjs.Shape();
    const g = body.graphics;

    if (name === 'diamond') {
      g.setStrokeStyle(1.5).beginStroke('rgba(255,255,255,0.7)')
        .beginRadialGradientFill(['#ffffff', color, this._darken(color)], [0, 0.4, 1], -r*0.2,-r*0.3,0, 0,0,r)
        .moveTo(0, -r).lineTo(r*0.7, 0).lineTo(0, r).lineTo(-r*0.7, 0).closePath()
        .moveTo(0,-r).lineTo(r*0.7,0).moveTo(0,-r).lineTo(-r*0.7,0)
        .moveTo(-r*0.7,0).lineTo(0,r).moveTo(r*0.7,0).lineTo(0,r);
    } else if (name === 'gold') {
      g.setStrokeStyle(1.5).beginStroke('#ffaa00')
        .beginRadialGradientFill(['#fff8aa', color, this._darken(color)], [0, 0.5, 1], -r*0.3,-r*0.3,0, 0,0,r)
        .drawCircle(0, 0, r);
      g.beginFill('rgba(255,255,255,0.3)').drawEllipse(-r*0.35,-r*0.5,r*0.25,r*0.55);
    } else if (name === 'silver') {
      g.setStrokeStyle(1).beginStroke('#aaccff')
        .beginRadialGradientFill(['#eef4ff', color, this._darken(color)], [0, 0.5, 1], -r*0.2,-r*0.3,0, 0,0,r)
        .drawPolyStar(0, 0, r, 6, 0, 0);
    } else {
      // iron — rough hexagon
      g.setStrokeStyle(1).beginStroke('#999999')
        .beginRadialGradientFill(['#dddddd', color, this._darken(color)], [0, 0.5, 1], -r*0.2,-r*0.3,0, 0,0,r)
        .drawPolyStar(0, 0, r, 6, 0, 30);
    }
    this.addChild(body);

    // label
    const icons = { iron:'Fe', silver:'Ag', gold:'Au', diamond:'◆' };
    const lbl = new createjs.Text(icons[name], `700 ${Math.max(7, r*0.8)}px Inter, sans-serif`, 'rgba(255,255,255,0.7)');
    lbl.textAlign = 'center'; lbl.textBaseline = 'middle';
    this.addChild(lbl);
  }

  _darken(hex) {
    const { r, g, b } = this._rgb(hex);
    return `rgb(${Math.floor(r*.5)},${Math.floor(g*.5)},${Math.floor(b*.5)})`;
  }
  _alpha(hex, a) {
    const { r, g, b } = this._rgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }
  _rgb(hex) {
    const v = parseInt(hex.replace('#',''), 16);
    return { r:(v>>16)&0xff, g:(v>>8)&0xff, b:v&0xff };
  }

  update(magnetTarget) {
    this._bob += 0.055;
    this.x = this._baseX + Math.sin(this._bob) * 3;
    this.y += this.vy;
    this.rotation += 0.6;

    if (magnetTarget) {
      const dx = magnetTarget.x - this.x;
      const dy = magnetTarget.y - this.y;
      const d = Math.sqrt(dx*dx + dy*dy) || 1;
      this.x += (dx/d) * 5;
      this.y += (dy/d) * 5;
      this._baseX = this.x;
    }

    if (this.y > this._sh + 20) this.active = false;
  }
}
