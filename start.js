let app;
let player;
let playerSpeed = 5;
let playerRadius = 35;
let enimieRadius = 30;


class Player extends PIXI.Sprite{
    constructor(x = 0, y = 0, texture, isHit, speed = 5)
    {
        super(texture);
        this.anchor.set(0.5);
        this.scale.set(0.22);
        this.isHit = false;
        this.speed = speed;
        this.x = x;
        this.y = y;
    }

    status(){
        return this.speed + "location" + this.x + ":" + this.y;
    }

    move(){
        this.x = this.x + this.speed;
        this.y = this.y + this.speed;
        if(this.x > app.view.width - playerRadius || this.y > app.view.height - playerRadius ||
            this.x < playerRadius || this.y < playerRadius)
        {
            this.speed = -this.speed;
        }

    }

}

class Enemie extends PIXI.Sprite{
    constructor(x = 0, y = 0, texture, hasHit, gravitation = 5)
    {
        super(texture);
        this.anchor.set(0.5);
        this.scale.set(random(1.5, 2,5));
        this.hasHit = false;
        this.gravitation = gravitation;
        this.x = x;
        this.y = y;
    }

    status(){
        return this.speed + "location" + this.x + ":" + this.y;
    }

    move(){
        this.x = this.x + this.gravitation;
        this.y = this.y + this.gravitation;
        if(this.x > app.view.width - enimieRadius || this.y > app.view.height - enimieRadius ||
            this.x < enimieRadius || this.y < enimieRadius)
        {
            this.gravitation = -this.gravitation;
        }

    }

}


window.onload = function() {
    app = new PIXI.Application({

        width: 1000,
        height: 400,
        backgroundColor: 0xAAAAAA
    });

    document.body.appendChild(app.view);

    app.loader.add("player","pic/Player1.png");
    app.loader.add("enemie","pic/enemie.png");
    app.loader.add("backgraound","pic/Background1.png");
    app.loader.onComplete.add(Initialisation);
    app.loader.load();
    
}

function Initialisation(){
    console.count("finish loading");
    createBackground();
    createPlayer();
    createEnemie();

    app.ticker.add(gameloop);
}

function gameloop(delta){
    player.move();
    enemie.move();

}

function createPlayer(){
    x = random(playerRadius, app.view.width - playerRadius);
    y = random(playerRadius, app.view.height - playerRadius);
    player = new Player(x,y, app.loader.resources["player"].texture,false,playerSpeed);
    app.stage.addChild(player);

}
function createEnemie(){
    x = random(enimieRadius, app.view.width - enimieRadius);
    y = random(enimieRadius, app.view.height - enimieRadius);
    enemie = new Enemie(x,y, app.loader.resources["enemie"].texture,false, 3);
    app.stage.addChild(enemie);

}

function createBackground()
{
    bg = new PIXI.Sprite(app.loader.resources["backgraound"].texture);
    app.stage.addChild(bg);
}

function random(min, max)
{
    return Math.random() * (max - min) + min;
}
