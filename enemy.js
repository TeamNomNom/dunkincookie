class Enemy extends PIXI.Sprite{
    constructor(x = 0, y = 0, texture, hasHit, speed_x , speed_y, m, G)
    {
        super(texture);
        this.anchor.set(0.5);
        this.scale.set(random(0.2, 0.3));
        this.hasHit = false;
        this.speed_x = speed_x;
        this.speed_y = speed_y;
        this.x = x;
        this.y = y;
        this.future_x = x;
        this.future_y = y;
        this.future_speed_x = speed_x;
        this.future_speed_y = speed_y;

        this.force = new ForceObject(m, G);
    }

    status(){
        return this.speed + "location" + this.x + ":" + this.y;
    }

    move(listofallobjects, player, delta ){
        var pos = [this.x, this.y];
        var v = [this.speed_x, this.speed_y];
        var res = odeswitchfunction(pos, v, listofallobjects, player, this, delta)
        this.future_x = res[0];
        this.future_y = res[1];
        this.future_speed_x = res[2];
        this.future_speed_y = res[3];
    }

    update() {
        this.x = this.future_x;
        this.y = this.future_y;
        this.speed_x = this.future_speed_x;
        this.speed_y = this.future_speed_y;
    }
    
}

    