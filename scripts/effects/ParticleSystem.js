class ParticleSystem extends createjs.Shape {
  constructor() {
    super();
    this._particles = [];
  }

  burst(x, y, color, count, speed, size) {
    count = count || 8;
    speed = speed || 3;
    size  = size  || 3;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const s = speed * (0.6 + Math.random() * 0.8);
      this._particles.push({
        x, y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        alpha: 1,
        color,
        size: size * (0.5 + Math.random() * 0.8),
        decay: 0.025 + Math.random() * 0.025,
        gravity: 0.06,
      });
    }
  }

  trail(x, y, color) {
    for (let i = 0; i < 3; i++) {
      this._particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 1.5 + Math.random() * 2,
        alpha: 0.7 + Math.random() * 0.3,
        color,
        size: 1.5 + Math.random() * 2,
        decay: 0.04 + Math.random() * 0.03,
        gravity: 0,
      });
    }
  }

  ring(x, y, color, count) {
    count = count || 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const s = 2 + Math.random() * 2;
      this._particles.push({
        x, y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        alpha: 0.9,
        color,
        size: 2,
        decay: 0.018,
        gravity: 0,
      });
    }
  }

  update() {
    if (this._particles.length === 0) { this.graphics.clear(); return; }
    const g = this.graphics.clear();
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.alpha -= p.decay;
      if (p.alpha <= 0) { this._particles.splice(i, 1); continue; }
      g.beginFill(this._rgba(p.color, p.alpha)).drawCircle(p.x, p.y, p.size);
    }
  }

  _rgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const gv = parseInt(h.substring(2, 4), 16);
    const b  = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${gv},${b},${alpha.toFixed(2)})`;
  }

  get count() { return this._particles.length; }
}
