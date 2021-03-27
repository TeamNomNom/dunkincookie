class Enemy extends PIXI.Sprite{
    constructor(x = 0, y = 0, texture, hasHit, speed_x , speed_y)
    {
        super(texture);
        this.anchor.set(0.5);
        this.scale.set(random(0.2, 0.3));
        this.hasHit = false;
        this.speed_x = speed_x;
        this.speed_y = speed_y;
        this.x = x;
        this.y = y;
    }

    status(){
        return this.speed + "location" + this.x + ":" + this.y;
    }

    move(){
        this.x = this.x + this.speed_x;
        this.y = this.y + this.speed_y;
        if(this.x > app.view.width - enemyRadius || this.x < enemyRadius)
            this.speed_x = -this.speed_x;
        if(this.y > app.view.height - enemyRadius || this.y < enemyRadius)
            this.speed_y = -this.speed_y;

    }

}