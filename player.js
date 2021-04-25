var EASEPERCENTAGE = 0.4;

class Player extends PIXI.Sprite{
    constructor(x = 0, y = 0, texture, isHit, speed)
    {
        super(texture);
        this.anchor.set(0.5);
        this.scale.set(0.22);
        this.isHit = false;
        this.basespeed = speed; // px/delta
        this.speed = 0;
        this.start_x = x;
        this.start_y = y;
        this.x = x;
        this.y = y;
        this.pathposition = 0;
        this.pathLength = 0;
        this.ease_k1 = 0;
        this.ease_k2 = 0;
    }

    status(){
        return this.speed + "location" + this.x + ":" + this.y;
    }

    move(delta){

        let howfartomove = this.speed * delta;
        
        let entry = getPosFromArclengthWithDelta(this.pathposition, howfartomove);
        this.x = entry.x;
        this.y = entry.y;
        this.pathposition = entry.totalLengthTillHere;
    }

    updatespeed(){
        //TODO
        let pi_half = Math.PI / 2;
        let twok1byPI = this.ease_k1 * 2 / Math.PI;
        let s = 0;
        let t = this.pathposition / this.pathLength;
        if (t < this.ease_k1)
        {
            let sinpart = Math.sin(t / this.ease_k1 * pi_half - pi_half); 
            s =  twok1byPI * (sinpart + 1);
        }
        else if (t > this.ease_k2)
        {
            let oneminustwok2byPI = (1- this.ease_k2) * 2 / Math.PI;
            let sinpart = Math.sin((t - this.ease_k2)/ (1- this.ease_k2) * pi_half);
            s = oneminustwok2byPI * (1 - sinpart);
        }
        else
        {
            s = twok1byPI;
        }
        let f = twok1byPI + this.ease_k2 -this.ease_k1 + (1- this.ease_k2) *2/ Math.PI;
        this.speed = s / f * this.basespeed;
    }

    setEaseParameters(pathLength)
    {
        this.pathLength = pathLength;
        this.ease_k1 = EASEPERCENTAGE;
        this.ease_k2 = 1 - this.ease_k1;
    }
    

}