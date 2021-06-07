class Goal extends PIXI.Sprite {
  constructor(x = 0, y = 0, texture, isHit) {
    super(texture);
    this.anchor.set(0.5);
    this.scale.set(0.22);
    this.isHit = false;
    this.x = x;
    this.y = y;
  }

  status() {
    return "location" + this.x + ":" + this.y;
  }
}
