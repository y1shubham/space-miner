class GameScreen extends createjs.Container {
  constructor(stageW, stageH, onGameOver, onRestart) {
    super();
    this._w = stageW;
    this._h = stageH;
    this._onGameOver = onGameOver;
    this._onRestart = onRestart;
    this._keys = {};
    this._touchTarget = null;
    this._paused = false;
    this._score = 0;
    this._combo = 0;
    this._bestCombo = 0;
    this._comboTimer = 0;
    this._level = 0;
    this._diffTimer = 0;
    this._startTime = Date.now();
    this._shakeX = 0;
    this._shakeY = 0;
    this._gameOver      = false;
    this._countdown     = true;
    this._nextMilestone = 500;

    this._buildBackground();
    this._buildAsteroids();
    this._buildResources();
    this._buildPlayer();
    this._buildParticles();
    this._buildPowerUpManager();
    this._buildHUD();
    this._buildPauseBtn();
    this._buildVignette();
    this._buildHitFlash();
    this._buildMagnetLines();
    this._setupInput();
    AudioManager.init();
    this._startCountdown();
  }

  // ─── Background ───────────────────────────────────────────────
  _buildBackground() {
    const bg = new createjs.Shape();
    bg.graphics
      .beginLinearGradientFill(['#000008','#00000f'], [0,1], 0,0,0,this._h)
      .drawRect(0, 0, this._w, this._h);
    this.addChild(bg);

    this._worldContainer = new createjs.Container();
    this.addChild(this._worldContainer);

    // scrolling parallax star layers - redrawn each frame for seamless wrap
    this._starData = [];
    const cfg = [
      { count:80, size:[0.4,1.0], speed:0.8,  alpha:[0.3,0.6] },
      { count:50, size:[0.8,1.4], speed:2.0,  alpha:[0.5,0.85] },
      { count:25, size:[1.2,2.2], speed:4.0,  alpha:[0.7,1.0] },
    ];
    cfg.forEach(({ count, size, speed, alpha }) => {
      const layer = new createjs.Shape();
      const stars = Array.from({ length: count }, () => ({
        x: Utils.rand(0, this._w),
        y: Utils.rand(0, this._h),
        r: Utils.rand(size[0], size[1]),
        a: Utils.rand(alpha[0], alpha[1]),
      }));
      this._worldContainer.addChild(layer);
      this._starData.push({ layer, stars, speed, offsetY: 0 });
    });

    // static nebula (background mood)
    const neb = new createjs.Shape();
    neb.graphics
      .beginRadialGradientFill(['rgba(20,0,50,0.25)','rgba(0,0,0,0)'], [0,1],
        this._w*0.3, this._h*0.2, 0, this._w*0.3, this._h*0.2, this._w*0.65)
      .drawCircle(this._w*0.3, this._h*0.2, this._w*0.65)
      .beginRadialGradientFill(['rgba(0,20,60,0.2)','rgba(0,0,0,0)'], [0,1],
        this._w*0.7, this._h*0.6, 0, this._w*0.7, this._h*0.6, this._w*0.5)
      .drawCircle(this._w*0.7, this._h*0.6, this._w*0.5);
    this._worldContainer.addChild(neb);
  }

  _scrollStars() {
    for (const sd of this._starData) {
      sd.offsetY = (sd.offsetY + sd.speed) % this._h;
      const g = sd.layer.graphics.clear();
      for (const s of sd.stars) {
        const y = (s.y + sd.offsetY) % this._h;
        g.beginFill(`rgba(255,255,255,${s.a.toFixed(2)})`).drawCircle(s.x, y, s.r);
      }
    }
  }

  // ─── Vignette (low health warning) ───────────────────────────
  _buildVignette() {
    this._vignette = new createjs.Shape();
    this._vignette.alpha = 0;
    this.addChild(this._vignette);

    const g = this._vignette.graphics;
    g.beginRadialGradientFill(
      ['rgba(0,0,0,0)', 'rgba(200,0,0,0.55)'],
      [0.55, 1],
      this._w/2, this._h/2, 0,
      this._w/2, this._h/2, Math.max(this._w, this._h) * 0.75
    ).drawRect(0, 0, this._w, this._h);

    this._vignetteDir   = 1;
    this._vignetteAlpha = 0;
  }

  _updateVignette() {
    if (this._player.health > 30) {
      this._vignette.alpha = 0;
      this._vignetteAlpha  = 0;
      return;
    }
    this._vignetteAlpha += 0.012 * this._vignetteDir;
    if (this._vignetteAlpha >= 0.9) this._vignetteDir = -1;
    if (this._vignetteAlpha <= 0.1) this._vignetteDir =  1;
    this._vignette.alpha = this._vignetteAlpha;
  }

  // ─── Hit flash ────────────────────────────────────────────────
  _buildHitFlash() {
    this._hitFlash = new createjs.Shape();
    this._hitFlash.graphics.beginFill('#ff1122').drawRect(0, 0, this._w, this._h);
    this._hitFlash.alpha = 0;
    this.addChild(this._hitFlash);
  }

  _flashHit() {
    createjs.Tween.get(this._hitFlash, { override: true })
      .to({ alpha: 0.4 }, 35)
      .to({ alpha: 0   }, 220, createjs.Ease.quadOut);
  }

  _flashShieldAbsorb() {
    this._particles.ring(this._player.x, this._player.y, '#00ccff', 20);
    this._particles.burst(this._player.x, this._player.y, '#00aaff', 8, 3, 3);
    this._screenShake(4);
    this._spawnFloatingText('BLOCKED!', this._player.x, this._player.y - 40, '#00ccff', 13);
  }

  // ─── Magnet lines ─────────────────────────────────────────────
  _buildMagnetLines() {
    this._magnetLines = new createjs.Shape();
    this._worldContainer.addChild(this._magnetLines);
  }

  _updateMagnetLines() {
    const g = this._magnetLines.graphics.clear();
    if (!this._player.magnetActive) return;
    const res = this._resourceManager._resources;
    if (!res || res.length === 0) return;
    const px = this._player.x, py = this._player.y;

    g.setStrokeStyle(1.5).beginStroke('rgba(255,68,204,0.55)');
    for (const r of res) {
      const dx = px - r.x, dy = py - r.y;
      if (dx * dx + dy * dy > 220 * 220) continue;
      g.moveTo(r.x, r.y).lineTo(px, py);
    }
    g.endStroke();
  }

  // ─── Countdown ────────────────────────────────────────────────
  _startCountdown() {
    const cx = this._w / 2, cy = this._h / 2;

    const overlay = new createjs.Container();
    const obg = new createjs.Shape();
    obg.graphics.beginFill('rgba(0,0,0,0.45)').drawRect(0,0,this._w,this._h);
    overlay.addChild(obg);
    this.addChild(overlay);

    const nums = ['3','2','1','GO!'];
    let i = 0;

    const showNext = () => {
      if (i >= nums.length) {
        this.removeChild(overlay);
        this._countdown = false;
        this._startTime = Date.now();
        return;
      }
      const isGo = nums[i] === 'GO!';
      const t = new createjs.Text(nums[i], `900 ${this._fs(isGo ? 60 : 80)}px Inter, sans-serif`, isGo ? '#00ff88' : '#ffffff');
      t.textAlign    = 'center';
      t.textBaseline = 'middle';
      t.x = cx; t.y = cy;
      t.alpha = 0; t.scaleX = 0.5; t.scaleY = 0.5;
      t.shadow = new createjs.Shadow(isGo ? '#00ff88' : '#ffffff', 0, 0, 24);
      overlay.addChild(t);

      createjs.Tween.get(t)
        .to({ alpha:1, scaleX:1, scaleY:1 }, 200, createjs.Ease.backOut)
        .wait(isGo ? 400 : 550)
        .to({ alpha:0, scaleX:1.4, scaleY:1.4 }, 200, createjs.Ease.quadIn)
        .call(() => { overlay.removeChild(t); i++; showNext(); });

      AudioManager.uiClick();
    };

    showNext();
  }

  // ─── Level-up banner ──────────────────────────────────────────
  _showLevelUp(level) {
    const t = new createjs.Text(`LEVEL ${level}`, `900 ${this._fs(36)}px Inter, sans-serif`, '#00ccff');
    t.textAlign = 'center';
    t.x = this._w / 2;
    t.y = this._h * 0.4;
    t.alpha = 0;
    t.shadow = new createjs.Shadow('#0066ff', 0, 0, 20);
    this.addChild(t);

    createjs.Tween.get(t)
      .to({ alpha:1, y: this._h * 0.38, scaleX:1.1, scaleY:1.1 }, 250, createjs.Ease.backOut)
      .wait(600)
      .to({ alpha:0, y: this._h * 0.3  }, 350, createjs.Ease.quadIn)
      .call(() => { if (t.parent) this.removeChild(t); });
  }

  // ─── Particles ────────────────────────────────────────────────
  _buildParticles() {
    this._particles = new ParticleSystem();
    this._worldContainer.addChild(this._particles);
  }

  // ─── PowerUps ─────────────────────────────────────────────────
  _buildPowerUpManager() {
    this._powerUpManager = new PowerUpManager(this._worldContainer, this._w, this._h);
  }

  // ─── Asteroids ────────────────────────────────────────────────
  _buildAsteroids() {
    this._asteroidManager = new AsteroidManager(this._worldContainer, this._w, this._h);
  }

  // ─── Resources ────────────────────────────────────────────────
  _buildResources() {
    this._resourceManager = new ResourceManager(this._worldContainer, this._w, this._h);
    // spawn one immediately so player sees a resource right away
    this._resourceManager._timer = C.RESOURCE_SPAWN_INTERVAL * 0.7;
  }

  // ─── Player ───────────────────────────────────────────────────
  _buildPlayer() {
    this._player = new Player(this._w, this._h);
    this._worldContainer.addChild(this._player);
  }

  // ─── HUD ──────────────────────────────────────────────────────
  _buildHUD() {
    this._hud = new createjs.Container();

    // shared vertical center for all top-row elements
    const hudY  = this._fs(28);
    const barH  = this._fs(16);
    const barW  = this._w * 0.30;
    const barX  = this._fs(12);
    const barY  = hudY - barH / 2;

    // health bar background
    this._hpBarBg = new createjs.Shape();
    this._hpBarBg.graphics.beginFill('rgba(255,255,255,0.1)')
      .drawRoundRect(barX, barY, barW, barH, barH / 2);
    this._hud.addChild(this._hpBarBg);

    // health bar fill
    this._hpBar = new createjs.Shape();
    this._hud.addChild(this._hpBar);

    // % text centered inside bar
    this._hpTxt = new createjs.Text('100%', `700 ${this._fs(10)}px Inter, sans-serif`, '#ffffff');
    this._hpTxt.textAlign    = 'center';
    this._hpTxt.textBaseline = 'middle';
    this._hpTxt.x = barX + barW / 2;
    this._hpTxt.y = hudY;
    this._hud.addChild(this._hpTxt);

    this._drawHealthBar(100);

    // score - centered, same row
    this._scoreTxt = new createjs.Text('0', `700 ${this._fs(24)}px Inter, sans-serif`, '#ffffff');
    this._scoreTxt.textAlign    = 'center';
    this._scoreTxt.textBaseline = 'middle';
    this._scoreTxt.x = this._w / 2;
    this._scoreTxt.y = hudY;
    this._hud.addChild(this._scoreTxt);

    // combo text - below score
    this._comboTxt = new createjs.Text('', `600 ${this._fs(13)}px Inter, sans-serif`, '#ffcc00');
    this._comboTxt.textAlign = 'center';
    this._comboTxt.x = this._w / 2;
    this._comboTxt.y = hudY + this._fs(20);
    this._hud.addChild(this._comboTxt);

    // level badge - same row as score/health/pause
    this._levelTxt = new createjs.Text('LVL 1', `600 ${this._fs(11)}px Inter, sans-serif`, '#4488aa');
    this._levelTxt.textAlign    = 'right';
    this._levelTxt.textBaseline = 'middle';
    this._levelTxt.x = this._w - this._fs(58);
    this._levelTxt.y = hudY;
    this._hud.addChild(this._levelTxt);

    // combo timeout bar
    this._comboBarBg = new createjs.Shape();
    this._comboBar   = new createjs.Shape();
    this._hud.addChild(this._comboBarBg);
    this._hud.addChild(this._comboBar);

    this.addChild(this._hud);

    this._buildPowerUpHUD();
  }

  _buildPowerUpHUD() {
    this._puHUD = new createjs.Container();
    this._puHUD.visible = false;

    const pillW = this._fs(140), pillH = this._fs(32);
    this._puBg = new createjs.Shape();
    this._puHUD.addChild(this._puBg);

    this._puLabelTxt = new createjs.Text('', `700 ${this._fs(11)}px Inter, sans-serif`, '#ffffff');
    this._puLabelTxt.textAlign = 'center';
    this._puLabelTxt.y = -this._fs(7);
    this._puHUD.addChild(this._puLabelTxt);

    this._puBarBg = new createjs.Shape();
    this._puBar   = new createjs.Shape();
    this._puHUD.addChild(this._puBarBg);
    this._puHUD.addChild(this._puBar);

    this._puHUD.x = this._w / 2;
    this._puHUD.y = this._h - this._fs(22);
    this._hud.addChild(this._puHUD);
  }

  _updatePowerUpHUD() {
    const pm = this._powerUpManager;
    if (!pm.activeType) {
      this._puHUD.visible = false;
      return;
    }
    this._puHUD.visible = true;
    const cfg   = POWERUP_CONFIGS[pm.activeType];
    const ratio = pm.ratio;
    const pillW = this._fs(150), pillH = this._fs(28);
    const barW  = pillW - this._fs(16);
    const barH  = this._fs(4);

    this._puBg.graphics.clear()
      .beginFill('rgba(0,0,0,0.55)')
      .setStrokeStyle(1).beginStroke(cfg.color + '88')
      .drawRoundRect(-pillW/2, -pillH/2, pillW, pillH, 8);

    this._puLabelTxt.text  = cfg.label;
    this._puLabelTxt.color = cfg.color;

    this._puBarBg.graphics.clear()
      .beginFill('rgba(255,255,255,0.1)')
      .drawRoundRect(-barW/2, this._fs(8), barW, barH, barH/2);

    const expiring  = ratio < 0.25;
    const barColor  = expiring
      ? (Math.floor(Date.now() / 200) % 2 === 0 ? '#ff4422' : '#ffaa00')
      : cfg.color;

    this._puBar.graphics.clear()
      .beginFill(barColor)
      .drawRoundRect(-barW/2, this._fs(8), barW * ratio, barH, barH/2);
  }

  // ─── Pause button ─────────────────────────────────────────────
  _buildPauseBtn() {
    const hudY = this._fs(28);
    this._pauseBtn = new createjs.Container();
    this._pauseBtn.x = this._w - this._fs(28); this._pauseBtn.y = hudY;

    const bg = new createjs.Shape();
    bg.graphics.beginFill('rgba(255,255,255,0.08)').drawRoundRect(-18,-14,36,28,6);
    this._pauseBtn.addChild(bg);

    this._pauseIcon = new createjs.Shape();
    this._drawPauseIcon(false);
    this._pauseBtn.addChild(this._pauseIcon);

    // large transparent hit area so small fingers/cursors reliably hit it
    const hit = new createjs.Shape();
    hit.graphics.beginFill('rgba(0,0,0,0.01)').drawRect(-24,-20,48,40);
    this._pauseBtn.hitArea = hit;

    this._pauseBtn.cursor = 'pointer';
    this._pauseBtn.on('click', () => this._togglePause());
    this.addChild(this._pauseBtn);

    // pause overlay
    this._pauseOverlay = this._buildPauseOverlay();
    this._pauseOverlay.visible = false;
    this.addChild(this._pauseOverlay);
  }

  _drawPauseIcon(playing) {
    const g = this._pauseIcon.graphics.clear();
    if (playing) {
      g.beginFill('#aaccdd').moveTo(-6,-8).lineTo(8,0).lineTo(-6,8).closePath();
    } else {
      g.beginFill('#aaccdd').drawRect(-6,-7,4,14).drawRect(2,-7,4,14);
    }
  }

  _buildPauseOverlay() {
    const ov = new createjs.Container();
    const bg = new createjs.Shape();
    bg.graphics.beginFill('rgba(0,5,20,0.82)').drawRect(0,0,this._w,this._h);
    ov.addChild(bg);

    const title = new createjs.Text('PAUSED', `700 ${this._fs(32)}px Inter, sans-serif`, '#ffffff');
    title.textAlign = 'center'; title.x = this._w/2; title.y = this._h*0.3;
    title.shadow = new createjs.Shadow('#00aaff',0,0,16);
    ov.addChild(title);

    const bw = this._w * 0.65, bh = 52;
    const cx = this._w / 2, sy = this._h * 0.44, gap = 66;

    this._makeOvBtn(ov, '▶  RESUME',    cx, sy,       bw, bh, '#00aaff', '#002a44', () => this._togglePause());
    this._makeOvBtn(ov, '↺  RESTART',  cx, sy+gap,   bw, bh, '#336699', '#001428', () => this._restart());
    this._makeOvBtn(ov, '⌂  MAIN MENU',cx, sy+gap*2, bw, bh, '#336699', '#001428', () => this._quitToMenu());

    // mute toggle
    this._pauseMuteBtn = this._makeMuteBtn(ov);
    this._pauseMuteBtn.x = cx;
    this._pauseMuteBtn.y = sy + gap * 3;

    return ov;
  }

  _makeOvBtn(parent, label, x, y, w, h, stroke, fill, cb) {
    const btn = new createjs.Container();
    btn.x = x; btn.y = y;
    const bg = new createjs.Shape();
    bg.graphics.setStrokeStyle(1.5).beginStroke(stroke)
      .beginLinearGradientFill([fill, this._lighten(fill,12)],[0,1],0,-h/2,0,h/2)
      .drawRoundRect(-w/2,-h/2,w,h,8);
    btn.addChild(bg);
    const txt = new createjs.Text(label, `600 ${this._fs(15)}px Inter, sans-serif`, '#88ccdd');
    txt.textAlign = 'center'; txt.textBaseline = 'middle';
    btn.addChild(txt);
    btn.cursor = 'pointer';
    btn.on('click', () => { AudioManager.uiClick(); cb(); });
    parent.addChild(btn);
    return btn;
  }

  _makeMuteBtn(parent) {
    const bw = this._w * 0.65, bh = 52;
    const btn   = new createjs.Container();
    const bg    = new createjs.Shape();
    const note  = new createjs.Text('♫', `700 ${this._fs(16)}px Inter, sans-serif`, '#ffffff');
    const label = new createjs.Text('', `700 ${this._fs(13)}px Inter, sans-serif`, '#ffffff');
    const slash = new createjs.Shape();

    note.textAlign  = 'center'; note.textBaseline = 'middle'; note.x = -bw/2 + this._fs(28);
    label.textAlign = 'center'; label.textBaseline = 'middle'; label.x = this._fs(8);
    btn.addChild(bg); btn.addChild(note); btn.addChild(label); btn.addChild(slash);

    const draw = () => {
      const m = AudioManager.isMuted;
      bg.graphics.clear()
        .setStrokeStyle(1.5).beginStroke(m ? '#663300' : '#336699')
        .beginLinearGradientFill([m ? '#1a0a00' : '#001428', m ? '#2a1200' : '#002244'], [0,1], 0,-bh/2, 0,bh/2)
        .drawRoundRect(-bw/2, -bh/2, bw, bh, 8);
      note.color  = m ? '#aa5522' : '#aaccdd';
      label.text  = m ? 'SOUND OFF' : 'SOUND ON';
      label.color = m ? '#ff8833' : '#ffffff';
      slash.graphics.clear();
      if (m) {
        const nx = note.x;
        slash.graphics.setStrokeStyle(2.5).beginStroke('#ff4400')
          .moveTo(nx - this._fs(9), -this._fs(9))
          .lineTo(nx + this._fs(9),  this._fs(9));
      }
    };

    draw();
    btn.cursor = 'pointer';
    btn.on('click', () => { AudioManager.uiClick(); AudioManager.toggleMute(); draw(); });
    if (parent) parent.addChild(btn);
    return btn;
  }

  // ─── Input ────────────────────────────────────────────────────
  _setupInput() {
    this._onKeyDown = (e) => {
      this._keys[e.key] = true;
      if (e.key === 'Escape') { AudioManager.uiClick(); this._togglePause(); }
    };
    this._onKeyUp = (e) => { this._keys[e.key] = false; };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);

    const canvas = document.getElementById('gameCanvas');

    this._onTouchStart = (e) => {
      const pt = this._pt(e.touches[0]);
      if (this._paused) return; // let CreateJS Touch handle overlay button taps
      if (this._isPauseArea(pt)) {
        e.preventDefault();
        this._togglePause();
        return;
      }
      e.preventDefault();
      this._touchTarget = pt;
    };
    this._onTouchMove = (e) => {
      if (this._paused) return;
      e.preventDefault();
      this._touchTarget = this._pt(e.touches[0]);
    };
    this._onTouchEnd = () => { this._touchTarget = null; };
    canvas.addEventListener('touchstart', this._onTouchStart, { passive:false });
    canvas.addEventListener('touchmove',  this._onTouchMove,  { passive:false });
    canvas.addEventListener('touchend',   this._onTouchEnd);
  }

  _pt(touch) {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (canvas.width  / rect.width),
      y: (touch.clientY - rect.top)  * (canvas.height / rect.height),
    };
  }

  // pause button center is at (this._w - 22, 18) - give it a generous 56x56 touch zone
  _isPauseArea(pt) {
    return pt.x > this._w - 64 && pt.y < this._fs(64);
  }

  // ─── Game logic ───────────────────────────────────────────────
  _togglePause() {
    const now = Date.now();
    if (now - (this._lastPauseToggle || 0) < 350) return;
    this._lastPauseToggle = now;
    AudioManager.uiClick();

    this._paused = !this._paused;
    this._drawPauseIcon(this._paused);
    this._pauseOverlay.visible = this._paused;
    if (this._paused) {
      this._pauseOverlay.alpha = 0;
      createjs.Tween.get(this._pauseOverlay).to({ alpha:1 }, 200);
    }
  }

  _restart() {
    this.destroy();
    if (this._onRestart) this._onRestart();
  }

  _quitToMenu() {
    this.destroy();
    this._onGameOver();
  }

  _screenShake(intensity) {
    const container = this._worldContainer;
    createjs.Tween.get(container, { override:true })
      .to({ x: Utils.rand(-intensity, intensity), y: Utils.rand(-intensity, intensity) }, 40)
      .to({ x: Utils.rand(-intensity*0.6, intensity*0.6), y: Utils.rand(-intensity*0.6, intensity*0.6) }, 40)
      .to({ x: 0, y: 0 }, 60);
  }

  // ─── Tick ─────────────────────────────────────────────────────
  tick(event) {
    if (this._paused || this._gameOver || this._countdown) return;
    const dt = event.delta;

    this._updateVignette();

    // difficulty scaling
    this._diffTimer += dt;
    if (this._diffTimer >= C.DIFFICULTY_INTERVAL) {
      this._diffTimer = 0;
      this._level++;
      this._asteroidManager.scaleDifficulty(this._level);
      this._resourceManager.scaleDifficulty(this._level);
      this._levelTxt.text = `LVL ${this._level + 1}`;
      createjs.Tween.get(this._levelTxt).to({ scaleX:1.4, scaleY:1.4 },150).to({ scaleX:1, scaleY:1 },150);
      this._showLevelUp(this._level + 1);
    }

    // combo timeout
    if (this._combo > 0) {
      this._comboTimer -= dt;
      if (this._comboTimer <= 0) {
        this._combo = 0;
        this._comboTxt.text = '';
      }
    }

    this._scrollStars();
    this._particles.update();
    this._player.update(dt, this._keys, this._touchTarget);

    // speed boost exhaust trail
    if (this._player.speedBoostActive) {
      this._particles.trail(
        this._player.x, this._player.y + 22, '#ffcc00'
      );
    }

    this._updateMagnetLines();
    this._asteroidManager.update(dt);

    // power-up field update
    const collectedPU = this._powerUpManager.update(dt, this._player);
    if (collectedPU) {
      const cfg = collectedPU.config;
      this._particles.ring(this._player.x, this._player.y, cfg.color, 18);
      this._particles.burst(this._player.x, this._player.y, cfg.color, 10, 3.5, 4);
      this._spawnFloatingText(cfg.label, this._player.x, this._player.y - 40, cfg.color, 13);
    }
    this._updatePowerUpHUD();

    // resource collection
    const collected = this._resourceManager.update(dt, this._player);
    if (collected) {
      this._combo = Math.min(this._combo + 1, C.COMBO_MAX);
      if (this._combo > this._bestCombo) this._bestCombo = this._combo;
      this._comboTimer = C.COMBO_RESET_TIME;
      const pts = collected.points * this._combo;
      this._score += pts;
      AudioManager.collect(collected.name);
      if (this._combo > 1) AudioManager.combo(this._combo);
      this._particles.burst(this._player.x, this._player.y, collected.color, 8, 2.5, 3);
      this._spawnFloatingText(`+${pts}`, this._player.x, this._player.y - 30, collected.color, 20);
      if (this._combo > 1) {
        this._spawnFloatingText(`x${this._combo} COMBO`, this._player.x, this._player.y - 56, '#ffcc00', 14);
      }
      this._updateComboDisplay();
    }

    // asteroid collision
    const hitAsteroid = this._asteroidManager.checkCollision(this._player);
    if (hitAsteroid) {
      const wasShield = this._player.shieldActive;
      const dmgMap    = { small: 12, medium: 22, large: 38 };
      const dmg       = this._player.takeDamage(dmgMap[hitAsteroid._type] || 22);
      if (dmg > 0) {
        this._combo = 0;
        this._comboTxt.text = '';
        AudioManager.hit();
        this._flashHit();
        this._particles.burst(this._player.x, this._player.y, '#ff6622', 14, 4.5, 4);
        this._screenShake(10);
        this._drawHealthBar(this._player.health);
        if (this._player.dead) this._triggerGameOver();
      } else if (wasShield) {
        this._flashShieldAbsorb();
      }
    }

    // score milestones
    if (this._score >= this._nextMilestone) {
      const labels = { 500:'NICE!', 1000:'GREAT!', 2500:'AMAZING!', 5000:'ON FIRE!', 10000:'UNSTOPPABLE!' };
      const lbl = labels[this._nextMilestone] || 'INCREDIBLE!';
      this._spawnFloatingText(lbl, this._w/2, this._h*0.45, '#ffcc00', 18);
      const steps = [500,1000,2500,5000,10000];
      const idx = steps.indexOf(this._nextMilestone);
      this._nextMilestone = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : this._nextMilestone * 2;
    }

    this._scoreTxt.text = this._score.toLocaleString();
    this._updateComboBar();
  }

  _spawnFloatingText(text, x, y, color, size) {
    const ft = new FloatingText(text, x, y, color, this._fs(size));
    this.addChild(ft);
  }

  _updateComboDisplay() {
    if (this._combo <= 1) { this._comboTxt.text = ''; return; }
    this._comboTxt.text = `x${this._combo} COMBO`;
    createjs.Tween.get(this._comboTxt, { override:true })
      .to({ scaleX:1.3, scaleY:1.3 }, 100)
      .to({ scaleX:1,   scaleY:1   }, 120);
  }

  _updateComboBar() {
    const barW = this._fs(90);
    const barH = this._fs(3);
    const cx   = this._w / 2;
    const y    = this._fs(28) + this._fs(20) + this._fs(11);

    if (this._combo <= 1) {
      this._comboBarBg.graphics.clear();
      this._comboBar.graphics.clear();
      return;
    }

    const ratio = Math.max(0, this._comboTimer / C.COMBO_RESET_TIME);
    this._comboBarBg.graphics.clear()
      .beginFill('rgba(255,255,255,0.1)')
      .drawRoundRect(cx - barW/2, y, barW, barH, barH/2);
    this._comboBar.graphics.clear()
      .beginFill('#ffcc00')
      .drawRoundRect(cx - barW/2, y, barW * ratio, barH, barH/2);
  }

  _drawHealthBar(hp) {
    const hudY  = this._fs(28);
    const barH  = this._fs(16);
    const barW  = this._w * 0.30;
    const barX  = this._fs(12);
    const barY  = hudY - barH / 2;
    const ratio = Math.max(0, hp / 100);
    const color = hp > 60 ? '#22dd66' : hp > 30 ? '#ffcc00' : '#ff3333';

    this._hpBar.graphics.clear()
      .beginFill(color)
      .drawRoundRect(barX, barY, barW * ratio, barH, barH / 2);

    this._hpTxt.text  = `${Math.ceil(hp)}%`;
    this._hpTxt.color = hp > 60 ? '#ffffff' : hp > 30 ? '#332200' : '#ffffff';
  }

  _burstConfetti() {
    const colors = ['#ff3355','#ffcc00','#00ccff','#ff66cc','#00ff88','#ff8833','#aa88ff'];
    for (let i = 0; i < 48; i++) {
      const color = colors[i % colors.length];
      const startX = this._w * 0.1 + Math.random() * this._w * 0.8;
      const startY = -10;
      const size   = 5 + Math.random() * 6;
      const isRect = Math.random() > 0.4;

      const piece = new createjs.Shape();
      if (isRect) {
        piece.graphics.beginFill(color).drawRect(-size/2, -size/2, size, size * 0.6);
      } else {
        piece.graphics.beginFill(color).drawCircle(0, 0, size / 2);
      }
      piece.x = startX;
      piece.y = startY;
      piece.rotation = Math.random() * 360;

      this.addChild(piece);

      const endX    = startX + (Math.random() - 0.5) * 120;
      const endY    = this._h * 0.5 + Math.random() * this._h * 0.35;
      const dur     = 1200 + Math.random() * 800;
      const delay   = Math.random() * 400;

      createjs.Tween.get(piece)
        .wait(delay)
        .to({ x: endX, y: endY, rotation: piece.rotation + (Math.random() - 0.5) * 540, alpha: 0 }, dur, createjs.Ease.quadIn)
        .call(() => { if (piece.parent) this.removeChild(piece); });
    }
  }

  _triggerGameOver() {
    this._gameOver = true;
    AudioManager.gameOver();

    const timeMs = Date.now() - this._startTime;
    const saved = SaveManager.update({ score: this._score, combo: this._bestCombo, timeMs });
    const isNewScore = this._score > 0 && saved.highScore === this._score;

    const ov = new createjs.Container();
    const bg = new createjs.Shape();
    bg.graphics.beginFill('rgba(0,3,15,0.94)').drawRect(0,0,this._w,this._h);
    bg.alpha = 0;
    ov.addChild(bg);
    this.addChild(ov);
    createjs.Tween.get(bg).to({ alpha:1 }, 500);

    const cx  = this._w / 2;
    const pad = this._w * 0.08;

    // pre-compute total content height to vertically center everything
    const titleH  = this._fs(48);   // title text + gap below
    const badgeH  = isNewScore ? this._fs(38) : 0;
    const divH    = this._fs(18);   // divider line + padding
    const statH   = this._fs(62);   // label + value + sub
    const btnH    = this._fs(50);
    const totalH  = titleH + badgeH + divH + statH + divH + statH + divH + btnH + 12 + btnH;
    let curY      = Math.max(this._h * 0.06, (this._h - totalH) / 2);

    // ── helper: divider line ──
    const addDiv = () => {
      const d = new createjs.Shape();
      d.graphics.setStrokeStyle(1)
        .beginLinearGradientStroke(['rgba(0,100,180,0)','rgba(0,100,180,0.22)','rgba(0,100,180,0)'],[0,0.5,1], pad,0, this._w-pad,0)
        .moveTo(pad, curY).lineTo(this._w - pad, curY);
      ov.addChild(d);
      curY += this._fs(18);
    };

    // ── Title ──
    const titleTxt = new createjs.Text('GAME OVER', `900 ${this._fs(40)}px Inter, sans-serif`, '#ff3355');
    titleTxt.textAlign = 'center'; titleTxt.x = cx; titleTxt.y = curY;
    titleTxt.shadow = new createjs.Shadow('#ff0033',0,0,22);
    ov.addChild(titleTxt);
    curY += titleH;

    // ── NEW BEST badge ──
    if (isNewScore) {
      const bw2 = this._fs(110), bh2 = this._fs(24);
      const badge = new createjs.Shape();
      badge.graphics.beginLinearGradientFill(['#a07000','#ffd700','#a07000'],[0,0.5,1], cx-bw2/2,0, cx+bw2/2,0)
        .drawRoundRect(cx-bw2/2, curY, bw2, bh2, 8);
      ov.addChild(badge);
      const bt = new createjs.Text('NEW BEST!', `700 ${this._fs(10)}px Inter, sans-serif`, '#1a0e00');
      bt.textAlign = 'center'; bt.textBaseline = 'middle'; bt.x = cx; bt.y = curY + bh2/2;
      ov.addChild(bt);
      curY += badgeH;
    }

    addDiv();

    // ── Score + Combo side by side ──
    const colL = cx - this._w * 0.22;
    const colR = cx + this._w * 0.22;
    const rowTop = curY;

    const addStat = (x, label, val, sub, isNew) => {
      const lbl = new createjs.Text(label, `400 ${this._fs(10)}px Inter, sans-serif`, '#4a6680');
      lbl.textAlign = 'center'; lbl.x = x; lbl.y = rowTop; ov.addChild(lbl);
      const v = new createjs.Text(val, `700 ${this._fs(24)}px Inter, sans-serif`, '#e8f4ff');
      v.textAlign = 'center'; v.x = x; v.y = rowTop + this._fs(13);
      ov.addChild(v);
      const s = new createjs.Text(sub, `400 ${this._fs(9)}px Inter, sans-serif`, isNew ? '#ffd700' : '#2a5060');
      s.textAlign = 'center'; s.x = x; s.y = rowTop + this._fs(40); ov.addChild(s);
    };

    addStat(colL, 'SCORE', this._score.toLocaleString(), `BEST: ${saved.highScore.toLocaleString()}`, isNewScore);
    addStat(colR, 'COMBO', `x${this._bestCombo}`, `BEST: x${saved.bestCombo}`, saved.bestCombo === this._bestCombo && this._bestCombo > 0);

    const vsep = new createjs.Shape();
    vsep.graphics.setStrokeStyle(1).beginStroke('rgba(0,100,180,0.2)')
      .moveTo(cx, rowTop).lineTo(cx, rowTop + this._fs(52));
    ov.addChild(vsep);
    curY += statH;

    addDiv();

    // ── Time centered ──
    const timeLbl = new createjs.Text('TIME', `400 ${this._fs(10)}px Inter, sans-serif`, '#4a6680');
    timeLbl.textAlign = 'center'; timeLbl.x = cx; timeLbl.y = curY; ov.addChild(timeLbl);
    const timeVal = new createjs.Text(Utils.formatTime(timeMs), `700 ${this._fs(24)}px Inter, sans-serif`, '#e8f4ff');
    timeVal.textAlign = 'center'; timeVal.x = cx; timeVal.y = curY + this._fs(13); ov.addChild(timeVal);
    const timeSub = new createjs.Text(`BEST: ${Utils.formatTime(saved.bestTime)}`, `400 ${this._fs(9)}px Inter, sans-serif`, '#2a5060');
    timeSub.textAlign = 'center'; timeSub.x = cx; timeSub.y = curY + this._fs(40); ov.addChild(timeSub);
    curY += statH;

    addDiv();

    // ── Buttons ──
    const btnW = this._w - pad * 2;
    this._makeOvBtn(ov, '▶  PLAY AGAIN', cx, curY + btnH/2,             btnW, btnH, '#00aaff','#002240', () => this._restart());
    this._makeOvBtn(ov, '⌂  MAIN MENU',  cx, curY + btnH/2 + btnH + 12, btnW, btnH, '#1a3a55','#000f1e', () => this._quitToMenu());

    ov.alpha = 0;
    createjs.Tween.get(ov).to({ alpha:1 }, 450);

    if (isNewScore) this._burstConfetti();
  }

  // ─── Utils ────────────────────────────────────────────────────
  _fs(base) { return Math.max(base, Math.round(base * (this._w / 375))); }

  _lighten(hex, amt=20) {
    const v = parseInt(hex.replace('#',''), 16);
    const r = Math.min(255, ((v>>16)&0xff)+amt);
    const g = Math.min(255, ((v>>8) &0xff)+amt);
    const b = Math.min(255,  (v     &0xff)+amt);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
    const canvas = document.getElementById('gameCanvas');
    canvas.removeEventListener('touchstart', this._onTouchStart);
    canvas.removeEventListener('touchmove',  this._onTouchMove);
    canvas.removeEventListener('touchend',   this._onTouchEnd);
    this._asteroidManager.destroy();
    this._resourceManager.destroy();
    this._powerUpManager.destroy();
  }
}
