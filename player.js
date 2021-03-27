class Player extends PIXI.Sprite{
    constructor(x = 0, y = 0, texture, isHit, speed_x = 5, speed_y = 5)
    {
        super(texture);
        this.anchor.set(0.5);
        this.scale.set(0.22);
        this.isHit = false;
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
        if(this.x > app.view.width - playerRadius || this.x < playerRadius)
            this.speed_x = -this.speed_x;
        if(this.y > app.view.height - playerRadius || this.y < playerRadius)
            this.speed_y = -this.speed_y;

    }

}