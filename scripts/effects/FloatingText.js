class FloatingText extends createjs.Text {
  constructor(text, x, y, color, size) {
    super(text, `700 ${size || 18}px Inter, sans-serif`, color || '#ffffff');
    this.textAlign = 'center';
    this.x = x;
    this.y = y;
    this.shadow = new createjs.Shadow(color || '#ffffff', 0, 0, 8);

    createjs.Tween.get(this)
      .to({ y: y - 55, alpha: 0 }, 900, createjs.Ease.quadOut)
      .call(() => { if (this.parent) this.parent.removeChild(this); });
  }
}
