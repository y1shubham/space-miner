class HomeScreen extends createjs.Container {
  constructor(stageW, stageH, onPlay, onFirstInteraction) {
    super();
    this._w = stageW;
    this._h = stageH;
    this._onPlay = onPlay;
    this._onFirstInteraction = onFirstInteraction;
    this._interacted = false;
    this._driftAsteroids = [];

    this._buildStarfield();
    this._buildNebula();
    this._buildDriftingAsteroids();
    this._buildTitle();
    this._buildButtons();
    this._buildStats();
    this._buildMuteBtn();
    this._buildVersion();
  }

  // font helper: weight size family  (no inner quotes)
  _f(weight, size) { return `${weight} ${this._fs(size)}px Inter, sans-serif`; }
  _fs(base) { return Math.max(base, Math.round(base * (this._w / 375))); }

  _buildStarfield() {
    const g = new createjs.Shape();
    for (let i = 0; i < 180; i++) {
      const x = Utils.rand(0, this._w);
      const y = Utils.rand(0, this._h);
      const r = Utils.rand(0.4, 1.8);
      const a = Utils.rand(0.3, 1);
      g.graphics.beginFill(`rgba(255,255,255,${a.toFixed(2)})`).drawCircle(x, y, r);
    }
    this.addChild(g);
  }

  _buildNebula() {
    const n = new createjs.Shape();
    const g = n.graphics;
    const cx = this._w / 2;
    g.beginRadialGradientFill(
      ['rgba(40,0,80,0.35)', 'rgba(0,0,0,0)'], [0, 1],
      cx, this._h * 0.25, 0, cx, this._h * 0.25, this._w * 0.8
    ).drawCircle(cx, this._h * 0.25, this._w * 0.8);
    g.beginRadialGradientFill(
      ['rgba(0,30,90,0.3)', 'rgba(0,0,0,0)'], [0, 1],
      cx, this._h * 0.7, 0, cx, this._h * 0.7, this._w * 0.7
    ).drawCircle(cx, this._h * 0.7, this._w * 0.7);
    this.addChild(n);
  }

  _buildDriftingAsteroids() {
    for (let i = 0; i < 5; i++) {
      const a = this._makeAsteroid();
      a.x = Utils.rand(0, this._w);
      a.y = Utils.rand(0, this._h);
      a.alpha = Utils.rand(0.15, 0.4);
      this.addChild(a);
      this._driftAsteroids.push(a);
    }
  }

  _makeAsteroid() {
    const s = new createjs.Shape();
    const r = Utils.rand(20, 55);
    const pts = Utils.randInt(7, 11);
    const g = s.graphics;
    g.setStrokeStyle(1).beginStroke('#6b5a48').beginFill('#3a2e22');
    g.moveTo(r, 0);
    for (let i = 1; i <= pts; i++) {
      const angle = (i / pts) * Math.PI * 2;
      const rad = r + Utils.rand(-r * 0.25, r * 0.25);
      g.lineTo(rad * Math.cos(angle), rad * Math.sin(angle));
    }
    g.closePath();
    s._r = r;
    s.vx = Utils.rand(-0.2, 0.2);
    s.vy = Utils.rand(0.15, 0.5);
    s.rotSpeed = Utils.rand(-0.25, 0.25);
    return s;
  }

  _buildTitle() {
    const cx = this._w / 2;
    const titleY = this._h * 0.28;

    const glow = new createjs.Shape();
    glow.graphics.beginRadialGradientFill(
      ['rgba(0,140,255,0.2)', 'rgba(0,0,0,0)'], [0, 1],
      cx, titleY, 0, cx, titleY, this._w * 0.7
    ).drawCircle(cx, titleY, this._w * 0.7);
    this.addChild(glow);

    const sub = new createjs.Text('— MINING THE COSMOS —', this._f(600, 12), '#4488aa');
    sub.textAlign = 'center';
    sub.x = cx;
    sub.y = titleY - this._h * 0.07;
    this.addChild(sub);

    const shadow = new createjs.Text('SPACE MINER', this._f(900, 48), '#001833');
    shadow.textAlign = 'center';
    shadow.x = cx + 3; shadow.y = titleY + 3;
    this.addChild(shadow);

    this._titleText = new createjs.Text('SPACE MINER', this._f(900, 48), '#ffffff');
    this._titleText.textAlign = 'center';
    this._titleText.x = cx;
    this._titleText.y = titleY;
    this._titleText.shadow = new createjs.Shadow('#00aaff', 0, 0, 20);
    this.addChild(this._titleText);

    const tag = new createjs.Text('Survive. Mine. Conquer.', this._f(400, 14), '#7ab8cc');
    tag.textAlign = 'center';
    tag.x = cx;
    tag.y = titleY + this._h * 0.1;
    this.addChild(tag);
  }

  _buildButtons() {
    const cx = this._w / 2;
    const startY = this._h * 0.52;
    const gap = this._h * 0.1;
    const bw = this._w * 0.72;
    const bh = Math.max(48, this._h * 0.075);

    this._playBtn  = this._makeButton('▶   PLAY',        cx, startY,       bw, bh, '#00aaff', '#002a44', true);
    this._ctrlBtn  = this._makeButton('?   HOW TO PLAY', cx, startY + gap, bw, bh, '#336699', '#001428', false);
    this._aboutBtn = this._makeButton('ℹ   ABOUT',       cx, startY+gap*2, bw, bh, '#336699', '#001428', false);

    this._playBtn.on('click', () => this._onPlay());
    this._ctrlBtn.on('click', () => this._showHowToPlay());
    this._aboutBtn.on('click', () => this._showAbout());
    this._playBtnBaseY = startY;
  }

  _makeButton(label, x, y, w, h, stroke, fill, primary) {
    const btn = new createjs.Container();
    btn.x = x; btn.y = y;

    const bg = new createjs.Shape();
    const drawBg = (s, f) => {
      bg.graphics.clear()
        .setStrokeStyle(1.5).beginStroke(s)
        .beginLinearGradientFill([f, this._lighten(f, 15)], [0, 1], 0, -h/2, 0, h/2)
        .drawRoundRect(-w/2, -h/2, w, h, 8);
    };
    drawBg(stroke, fill);
    btn.addChild(bg);

    const font = primary ? this._f(700, 17) : this._f(600, 14);
    const txt = new createjs.Text(label, font, primary ? '#00ddff' : '#88bbcc');
    txt.textAlign = 'center';
    txt.textBaseline = 'middle';
    if (primary) txt.shadow = new createjs.Shadow('#00aaff', 0, 0, 8);
    btn.addChild(txt);

    btn.cursor = 'pointer';
    btn.on('mousedown', () => {
      if (!this._interacted) {
        this._interacted = true;
        if (this._onFirstInteraction) this._onFirstInteraction();
      }
    });
    btn.on('mouseover', () => {
      createjs.Tween.get(btn).to({ scaleX: 1.05, scaleY: 1.05 }, 100);
      drawBg('#00ddff', this._lighten(fill, 25));
    });
    btn.on('mouseout', () => {
      createjs.Tween.get(btn).to({ scaleX: 1, scaleY: 1 }, 100);
      drawBg(stroke, fill);
    });

    this.addChild(btn);
    return btn;
  }

  _showHowToPlay() {
    const ov = new createjs.Container();
    const cx = this._w / 2;
    const pw = this._w * 0.86;
    const px = (this._w - pw) / 2;
    const innerX = px + this._fs(20);
    const innerW = pw - this._fs(40);

    const bg = new createjs.Shape();
    bg.graphics.beginFill('rgba(0,5,20,0.93)').drawRect(0, 0, this._w, this._h);
    ov.addChild(bg);

    const rows = [];
    let totalH = this._fs(24);

    const sec = (label) => {
      totalH += this._fs(12);
      rows.push({ sec: label, y: totalH });
      totalH += this._fs(14) + this._fs(10);
    };
    const item = (text) => {
      rows.push({ item: text, y: totalH });
      totalH += this._fs(15) + this._fs(7);
    };
    const gap = () => { totalH += this._fs(6); };

    // title
    rows.push({ title: 'HOW TO PLAY', y: totalH });
    totalH += this._fs(22) + this._fs(12);
    rows.push({ divider: true, y: totalH }); totalH += this._fs(20);

    sec('CONTROLS');
    item('Drag finger to move ship');
    item('WASD / Arrow Keys on desktop');
    item('ESC or pause btn to pause');
    gap();

    rows.push({ divider: true, y: totalH }); totalH += this._fs(20);
    sec('SCORING');
    item('Collect minerals for points');
    item('Chain pickups for combo bonus');
    item('Score faster as levels increase');
    gap();

    rows.push({ divider: true, y: totalH }); totalH += this._fs(20);
    sec('ASTEROIDS');
    rows.push({ asteroid: 'Small',  color: '#ff8877', detail: 'fast · 12 HP',    y: totalH }); totalH += this._fs(15) + this._fs(7);
    rows.push({ asteroid: 'Medium', color: '#ffcc88', detail: 'moderate · 22 HP', y: totalH }); totalH += this._fs(15) + this._fs(7);
    rows.push({ asteroid: 'Large',  color: '#99aacc', detail: 'slow · 38 HP',    y: totalH }); totalH += this._fs(15) + this._fs(7);
    gap();

    rows.push({ divider: true, y: totalH }); totalH += this._fs(20);
    sec('POWER-UPS');
    rows.push({ pu: 'Shield', color: '#00ccff', detail: 'blocks all damage',   y: totalH }); totalH += this._fs(15) + this._fs(7);
    rows.push({ pu: 'Magnet', color: '#ff44cc', detail: 'pulls minerals',       y: totalH }); totalH += this._fs(15) + this._fs(7);
    rows.push({ pu: 'Speed',  color: '#ffcc00', detail: 'boosts movement',      y: totalH }); totalH += this._fs(15) + this._fs(7);

    totalH += this._fs(28);

    const ph = Math.min(this._h * 0.88, totalH);
    const py = (this._h - ph) / 2;
    const scrollable = totalH > ph;
    const offsetY = scrollable ? -(totalH - ph) / 2 : 0;

    const panel = new createjs.Shape();
    panel.graphics.setStrokeStyle(1.5).beginStroke('#00aaff')
      .beginFill('#010d1f').drawRoundRect(px, py, pw, ph, 14);
    ov.addChild(panel);

    const content = new createjs.Container();
    content.y = offsetY;

    rows.forEach(r => {
      const ry = py + r.y;
      if (r.title) {
        const t = new createjs.Text(r.title, this._f(800, 18), '#00ddff');
        t.textAlign = 'center'; t.x = cx; t.y = ry;
        content.addChild(t);
      } else if (r.divider) {
        const d = new createjs.Shape();
        d.graphics.setStrokeStyle(1)
          .beginLinearGradientStroke(['rgba(0,150,255,0)','rgba(0,170,255,0.3)','rgba(0,150,255,0)'],[0,0.5,1], px+16,0, px+pw-16,0)
          .moveTo(px+16, ry).lineTo(px+pw-16, ry);
        content.addChild(d);
      } else if (r.sec) {
        const t = new createjs.Text(r.sec, this._f(800, 13), '#4ab8d8');
        t.x = innerX; t.y = ry;
        content.addChild(t);
      } else if (r.asteroid || r.pu) {
        const name = r.asteroid || r.pu;
        const col  = r.color;
        const dot = new createjs.Shape();
        dot.graphics.beginFill(col).drawCircle(0, 0, this._fs(4));
        dot.x = innerX + this._fs(6); dot.y = ry + this._fs(7.5);
        content.addChild(dot);
        const nm = new createjs.Text(name, this._f(700, 14), col);
        nm.x = innerX + this._fs(18); nm.y = ry;
        content.addChild(nm);
        const dw = new createjs.Text(r.detail, this._f(400, 12), '#446677');
        dw.x = px + pw * 0.52; dw.y = ry + this._fs(1);
        content.addChild(dw);
      } else if (r.item !== undefined) {
        const bullet = new createjs.Shape();
        bullet.graphics.beginFill('#1a4e6e').drawRoundRect(0, 0, this._fs(3), this._fs(13), 2);
        bullet.x = innerX + this._fs(2); bullet.y = ry + this._fs(1);
        content.addChild(bullet);
        const t = new createjs.Text(r.item, this._f(400, 14), '#88ccdd');
        t.x = innerX + this._fs(14); t.y = ry;
        content.addChild(t);
      }
    });

    const hint = new createjs.Text('tap anywhere to close', this._f(400, 10), '#2a4455');
    hint.textAlign = 'center'; hint.x = cx; hint.y = py + ph - this._fs(14);
    content.addChild(hint);

    ov.addChild(content);
    ov.alpha = 0;
    this.addChild(ov);
    createjs.Tween.get(ov).to({ alpha: 1 }, 180);
    ov.on('click', () => {
      createjs.Tween.get(ov).to({ alpha: 0 }, 160).call(() => this.removeChild(ov));
    });
  }

  _showAbout() {
    const ov = new createjs.Container();
    const cx  = this._w / 2;
    const pw  = this._w * 0.84;
    const px  = (this._w - pw) / 2;
    const fs  = (n) => this._fs(n);
    const iw  = pw - fs(32);   // inner text width for line-wrap
    const lh  = fs(20);        // wrapped line height

    const bg = new createjs.Shape();
    bg.graphics.beginFill('rgba(0,5,20,0.93)').drawRect(0, 0, this._w, this._h);
    ov.addChild(bg);

    // ─── measure pass ───
    let cy = fs(26);

    const headY  = cy;   cy += fs(20) + fs(10);   // "ABOUT" heading
    const div0Y  = cy;   cy += fs(16);             // divider under heading
    const gameY  = cy;   cy += fs(16) + fs(4);     // "Space Miner"
    const tagY   = cy;   cy += fs(12) + fs(12);    // tagline
    const descY  = cy;   cy += lh * 3 + fs(12);    // description (~3 wrapped lines)
    const div1Y  = cy;   cy += fs(16);             // divider
    const byY    = cy;   cy += fs(11) + fs(4);     // "Created by" label
    const nameY  = cy;   cy += fs(19) + fs(4);     // "Shubham Yadav"
    const cpyY   = cy;   cy += fs(13) + fs(2);     // "© y1shubham.in"
    const rtsY   = cy;   cy += fs(11) + fs(10);    // "All rights reserved"
    const div2Y  = cy;   cy += fs(14);             // thin divider
    const techY  = cy;   cy += fs(10);             // tech line

    const totalH = cy + fs(26);
    const py     = (this._h - totalH) / 2;

    // ─── panel ───
    const panel = new createjs.Shape();
    panel.graphics.setStrokeStyle(1.5).beginStroke('#00aaff')
      .beginFill('#010d1f').drawRoundRect(px, py, pw, totalH, 14);
    ov.addChild(panel);

    const at = (text, font, color, x, y) => {
      const t = new createjs.Text(text, font, color);
      t.textAlign = 'center'; t.x = x; t.y = py + y;
      ov.addChild(t);
    };
    const div = (y, opacity = 0.3) => {
      const d = new createjs.Shape();
      d.graphics.setStrokeStyle(1)
        .beginLinearGradientStroke(
          [`rgba(0,150,255,0)`, `rgba(0,170,255,${opacity})`, `rgba(0,150,255,0)`],
          [0, 0.5, 1], px+16, 0, px+pw-16, 0
        )
        .moveTo(px+16, py+y).lineTo(px+pw-16, py+y);
      ov.addChild(d);
    };

    at('ABOUT',                       this._f(800, 18), '#00ddff',  cx, headY);
    div(div0Y);
    at('Space Miner',                 this._f(700, 16), '#ffffff',  cx, gameY);
    at('Arcade · Space · Survival',   this._f(400, 11), '#6699aa',  cx, tagY);

    const desc = new createjs.Text(
      'Pilot your ship through deadly asteroid fields, collect rare minerals, build score combos, and survive as long as you can.',
      this._f(400, 13), '#99ccdd'
    );
    desc.textAlign = 'center'; desc.x = cx; desc.y = py + descY;
    desc.lineWidth = iw; desc.lineHeight = lh;
    ov.addChild(desc);

    div(div1Y);
    at('CREATED BY',                  this._f(600, 9),  '#6699aa',  cx, byY);
    at('Shubham Yadav',               this._f(700, 18), '#ffffff',  cx, nameY);
    at('© y1shubham.in',             this._f(600, 13), '#00bbdd',  cx, cpyY);
    at('All rights reserved',         this._f(400, 10), '#5588aa',  cx, rtsY);
    div(div2Y, 0.12);
    at('Built with CreateJS & Web Audio API', this._f(400, 10), '#4a6a7a', cx, techY);

    const hint = new createjs.Text('tap anywhere to close', this._f(400, 10), '#4a6677');
    hint.textAlign = 'center'; hint.x = cx; hint.y = py + totalH - fs(13);
    ov.addChild(hint);

    ov.alpha = 0;
    this.addChild(ov);
    createjs.Tween.get(ov).to({ alpha: 1 }, 180);
    ov.on('click', () => {
      createjs.Tween.get(ov).to({ alpha: 0 }, 160).call(() => this.removeChild(ov));
    });
  }

  _buildStats() {
    const save = SaveManager.load();
    if (save.totalGames === 0) return;

    const cx    = this._w / 2;
    const baseY = this._h * 0.855;
    const colW  = this._w * 0.28;
    const cols  = [
      { label: 'BEST SCORE', val: save.highScore.toLocaleString(), x: cx - colW },
      { label: 'BEST COMBO', val: `x${save.bestCombo}`,            x: cx        },
      { label: 'GAMES',      val: save.totalGames.toString(),       x: cx + colW },
    ];

    // card bg
    const cardW = this._w * 0.9, cardH = this._fs(46);
    const card = new createjs.Shape();
    card.graphics
      .beginFill('rgba(0,10,30,0.6)')
      .setStrokeStyle(1).beginStroke('rgba(0,120,200,0.2)')
      .drawRoundRect(cx - cardW/2, baseY - this._fs(8), cardW, cardH, 10);
    this.addChild(card);

    cols.forEach(({ label, val, x }) => {
      const lbl = new createjs.Text(label, this._f(400, 9), '#335566');
      lbl.textAlign = 'center'; lbl.x = x; lbl.y = baseY;
      this.addChild(lbl);

      const v = new createjs.Text(val, this._f(700, 15), '#00ccee');
      v.textAlign = 'center'; v.x = x; v.y = baseY + this._fs(12);
      this.addChild(v);
    });
  }

  _buildMuteBtn() {
    const btn  = new createjs.Container();
    btn.x = this._w - this._fs(28);
    btn.y = this._fs(28);

    const bg    = new createjs.Shape();
    const note  = new createjs.Text('♫', this._f(700, 18), '#ffffff');
    const slash = new createjs.Shape();

    note.textAlign    = 'center';
    note.textBaseline = 'middle';

    btn.addChild(bg);
    btn.addChild(note);
    btn.addChild(slash);

    const sz = this._fs(22);
    const hit = new createjs.Shape();
    hit.graphics.beginFill('rgba(0,0,0,0.01)').drawRect(-sz,-sz,sz*2,sz*2);
    btn.hitArea = hit;
    btn.cursor  = 'pointer';

    const draw = () => {
      const m = AudioManager.isMuted;
      bg.graphics.clear()
        .beginFill('rgba(0,15,35,0.8)')
        .setStrokeStyle(1.5).beginStroke(m ? '#aa4400' : '#0066aa')
        .drawRoundRect(-sz, -sz, sz*2, sz*2, 8);
      note.color = m ? '#aa5522' : '#ffffff';
      slash.graphics.clear();
      if (m) {
        slash.graphics.setStrokeStyle(2.5).beginStroke('#ff4400')
          .moveTo(-sz * 0.5, -sz * 0.5).lineTo(sz * 0.5, sz * 0.5);
      }
    };

    draw();
    btn.on('click', () => { AudioManager.toggleMute(); draw(); });
    this.addChild(btn);
  }

  _buildVersion() {
    const v = new createjs.Text('v0.1.0', this._f(400, 10), '#1a2e3a');
    v.x = this._w - 10; v.y = this._h - 18;
    v.textAlign = 'right';
    this.addChild(v);
  }

  _lighten(hex, amt = 20) {
    const v = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((v >> 16) & 0xff) + amt);
    const g = Math.min(255, ((v >> 8)  & 0xff) + amt);
    const b = Math.min(255,  (v & 0xff)         + amt);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  tick(event) {
    const t = event.runTime / 1000;

    if (this._titleText) {
      const gv = Math.floor(120 + 70 * Math.sin(t * 1.8));
      this._titleText.shadow = new createjs.Shadow(`rgba(0,${gv},255,0.9)`, 0, 0, 18 + 8 * Math.sin(t * 1.8));
    }

    if (this._playBtn) {
      this._playBtn.y = this._playBtnBaseY + Math.sin(t * 2.2) * 4;
    }

    for (const a of this._driftAsteroids) {
      a.x += a.vx; a.y += a.vy; a.rotation += a.rotSpeed;
      if (a.y > this._h + a._r) { a.y = -a._r; a.x = Utils.rand(0, this._w); }
    }
  }
}
