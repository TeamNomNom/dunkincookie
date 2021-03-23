let app;
let player;
let playerSpeed = 1;
let playerRadius = 35;
let enimieRadius = 30;
let isClick = false;
let notClick = false;


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
    app.loader.add("title","pic/Titel.png");
    app.loader.onComplete.add(Initialisation);
    app.loader.load();
    
}

function Initialisation(){
    console.count("finish loading");
    title = new PIXI.Sprite(app.loader.resources["title"].texture);
    button = createRect(app.view.width,app.view.height,200,100);
    const font = new PIXI.Text('START');
    font.anchor.set(0.5);
    font.position.set(app.screen.width / 2, app.screen.height / 2);
    let text = new PIXI.Text('Start',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
    text.anchor.set(0.5);
    text.position.x = app.screen.width / 2;
    text.position.y = app.view.height / 2;

    app.stage.addChild(title);
    app.stage.addChild(button);
    app.stage.addChild(text);

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


function createRect(x, y, width, height)
{
    let button = new PIXI.Graphics();
    button.beginFill(0xffffff);
    button.drawRect(x,y,width,height);
    button.endFill();
    button.pivot.x = x/2 + width/2;
    button.pivot.y = y/2 + height/2;
    button.interactive = true;
    button.buttonMode = true;

    button.on("pointerup",onButtonUp);
    button.on("pointerdown",onButtonDown);
    button.on("pointerover",onButtonOver);
    button.on("pointerout",onButtonOut);

    return button;
}


function onButtonDown() {
    isClick = true;
    this.tint = 0xffffff;  
}

function onButtonUp() {
    notClick = false;
    if (isClick) {
        createBackground();
        createPlayer();
        createEnemie();
    
        app.ticker.add(gameloop);    
    } else {
        this.tint = 0xffffff;  
    }

}

function onButtonOver() {
    isClick = true;
    if (notClick) {
        return;
    }
    this.tint = 0x68d263;
}

function onButtonOut() {
    isClick = false;
    if (notClick) {
        return;
    }
    this.tint = 0xffffff;  

}

