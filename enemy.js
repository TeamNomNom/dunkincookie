var deltadistancetraj = 3;
class Enemy extends PIXI.Sprite {
  constructor(x = 0, y = 0, texture, hasHit, speed_x, speed_y, m, G) {
    super(texture);
    this.anchor.set(0.5, 0.5);
    this.scale.set(1);
    this.hasHit = false;
    this.speed_x = speed_x;
    this.speed_y = speed_y;
    this.omega = 0;
    this.x = x;
    this.y = y;
    this.future_x = x;
    this.future_y = y;
    this.future_speed_x = speed_x;
    this.future_speed_y = speed_y;
    this.future_omega = 0;
    this.future_angle = 0;
    this.pos_log = [[this.x, this.y]];
    this.update();

    this.force = new ForceObject(m, G);
  }

  status() {
    return this.speed + "location" + this.x + ":" + this.y;
  }

  move(listofallobjects, player, delta) {
    var pos = [this.x, this.y];
    var v = [this.speed_x, this.speed_y];
    var res = odeswitchfunction(
      pos,
      v,
      listofallobjects,
      player,
      this,
      delta,
      this.omega,
      this.rotation
    );
    this.future_x = res[0];
    this.future_y = res[1];
    this.future_speed_x = res[2];
    this.future_speed_y = res[3];
    this.future_angle = res[4];
    this.future_omega = res[5];
  }

  update() {
    var x = Math.abs(this.future_x - this.pos_log[this.pos_log.length - 1][0]);
    var y = Math.abs(this.future_x - this.pos_log[this.pos_log.length - 1][1]);
    if (
      Math.abs(this.future_x - this.pos_log[this.pos_log.length - 1][0]) >
        deltadistancetraj ||
      Math.abs(this.future_y - this.pos_log[this.pos_log.length - 1][1]) >
        deltadistancetraj
    ) {
      this.pos_log.push([this.x, this.y]);
    }
    if (this.pos_log.length > 50) {
      this.pos_log.shift();
    }
    this.x = this.future_x;
    this.y = this.future_y;
    this.speed_x = this.future_speed_x;
    this.speed_y = this.future_speed_y;
    var phi = this.future_angle;
    while (phi < 0) {
      phi += 2 * Math.PI;
    }
    while (phi > 2 * Math.PI) {
      phi -= 2 * Math.PI;
    }
    this.rotation = phi;
    this.omega = this.future_omega;
    /*if (this.angle > 90 && this.angle < 270 && this.scale.y >= 0){
            this.scale.y *= -1;
        }        
        if ((this.angle < 90 || this.angle > 270) && this.scale.y < 0){
            this.scale.y *= -1;
        }*/
  }
}
