class Wall extends PIXI.Sprite {
  constructor(x = 0, y = 0, texture, hasHit, anchor_x, anchor_y) {
    super(texture);
    this.anchor.set(anchor_x, anchor_y);
    this.scale.set(1);
    this.hasHit = hasHit;
    this.x = x;
    this.y = y;
  }

  status() {
    return this.speed + "location" + this.x + ":" + this.y;
  }
}
