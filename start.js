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

class Enemy extends PIXI.Sprite{
    constructor(x = 0, y = 0, texture, hasHit, gravitation = 2)
    {
        super(texture);
        this.anchor.set(0.5);
        this.scale.set(random(0.2, 0.3));
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

    app.loader.add("player", "pic/Player1.png");
    app.loader.add("enemy", "pic/enemy.png");
    app.loader.add("backgraound", "pic/Background1.png");
    app.loader.add("title", "pic/Background1.png");
    app.loader.add("start", "pic/Start1.png");
    app.loader.add("startOnClick", "pic/Start2.png");
    app.loader.onComplete.add(Initialisation);
    app.loader.load();
    
}

function Initialisation(){
    console.count("finish loading");
    title = new PIXI.Sprite(app.loader.resources["title"].texture);
    Start = new PIXI.Sprite(app.loader.resources["start"].texture);
    StartOnClick = new PIXI.Sprite(app.loader.resources["startOnClick"].texture);
    
    button = createButton();

    


    const font = new PIXI.Text('START');
    font.anchor.set(0.5);
    font.position.set(app.screen.width / 2, app.screen.height / 2);
    
    app.stage.addChild(title);
    app.stage.addChild(button);

}

function gameloop(delta){
    player.move();
    enemy.move();

}

function createPlayer(){
    x = random(playerRadius, app.view.width - playerRadius);
    y = random(playerRadius, app.view.height - playerRadius);
    player = new Player(x, y, app.loader.resources["player"].texture, false, playerSpeed);
    app.stage.addChild(player);

}
function createEnemy(){
    x = random(enimieRadius, app.view.width - enimieRadius);
    y = random(enimieRadius, app.view.height - enimieRadius);
    enemy = new Enemy(x, y, app.loader.resources["enemy"].texture, false, 2);
    app.stage.addChild(enemy);

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


function createButton()
{
   

    button.on("pointerup", onButtonUp);
    button.on("pointerdown", onButtonDown);
    button.on("pointerover", onButtonOver);
    button.on("pointerout", onButtonOut);

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
        createEnemy();

        app.ticker.add(gameloop);  

        app.stage.removeChild(title);
        app.stage.removeChild(button);
        app.stage.removeChild(text);  
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

