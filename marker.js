class Marker extends PIXI.Sprite {
  constructor(x = 0, y = 0, texture) {
    super(texture);
    this.anchor.set(0.5);
    this.scale.set(0.12);
    this.x = x;
    this.y = y;
  }

  status() {
    return "location" + this.x + ":" + this.y;
  }
}
