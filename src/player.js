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

    // moves player further on the arclenghttable 
    move(delta){

        let howfartomove = this.pathposition + this.speed * delta;
        
        let entry = getPosFromArclengthWithDelta(howfartomove);
        this.x = entry.x;
        this.y = entry.y;
        this.pathposition = entry.totalLengthTillHere;
    }

    //update the speed the player is traversing the puzzle with a ease in -out 
    //function. similar to the function used in the lecture tho we are not 
    //calculating the relative distance the player has traversed so far but a 
    //speed value that increases like a sin curve from -pi/2 to 0 stays stable   
    updatespeed(){
        let pi_half = Math.PI / 2;
        let twok1byPI = this.ease_k1 * 2 / Math.PI;
        let s = 0;
        let t = this.pathposition / this.pathLength;
        if (t < this.ease_k1)
        //sin part from -pi/2 till 0 and then adjusted to a range from 0-1 by adding 1
        {
            let sinpart = Math.sin(t / this.ease_k1 * pi_half - pi_half); 
            s =  twok1byPI * (sinpart + 1);
        }
        //sin part from pi till 3*pi/2 and then adjusted to a range from 0-1 by adding 1
        else if (t > this.ease_k2)
        {
            let sinpart = Math.sin((t - this.ease_k2)/ this.ease_k1 * pi_half + Math.PI);
            s = twok1byPI * (sinpart + 1);
        }
        else
        {
            s = twok1byPI;
        }
        let f = twok1byPI + this.ease_k2 -this.ease_k1 + (1- this.ease_k2) *2/ Math.PI;
        this.speed = s / f * this.basespeed;
    }

    //establish ease parameters
    setEaseParameters(pathLength)
    {
        this.pathLength = pathLength;
        this.ease_k1 = EASEPERCENTAGE;
        this.ease_k2 = 1 - this.ease_k1;
    }
    

}