let app;
let player;
let playerSpeed = 1;
let playerRadius = 35;
let enemyRadius = 30;
let isClick = false;
let notClick = false;


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
    app.loader.onComplete.add(Initialisation);
    app.loader.load();
    
}

function Initialisation(){
    console.count("finish loading");
    title = new PIXI.Sprite(app.loader.resources["title"].texture);
    

    button = createRect(app.view.width, app.view.height, 200, 100);
    const font = new PIXI.Text('START');
    font.anchor.set(0.5);
    font.position.set(app.screen.width / 2, app.screen.height / 2);
    let text = new PIXI.Text('Start', {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
    text.anchor.set(0.5);
    text.position.x = app.screen.width / 2;
    text.position.y = app.view.height / 2;

    app.stage.addChild(title);
    app.stage.addChild(button);
    app.stage.addChild(text);

}

function gameloop(delta){
    player.move();
    enemy.move();

}

function createPlayer(){
    x = random(playerRadius, app.view.width - playerRadius);
    y = random(playerRadius, app.view.height - playerRadius);
    player = new Player(x, y, app.loader.resources["player"].texture, false, playerSpeed, playerSpeed);
    app.stage.addChild(player);

}
function createEnemy(){
    x = random(enemyRadius, app.view.width - enemyRadius);
    y = random(enemyRadius, app.view.height - enemyRadius);
    enemy = new Enemy(x, y, app.loader.resources["enemy"].texture, false, 2, 2);
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


function createRect(x, y, width, height)
{
    let button = new PIXI.Graphics();
    button.beginFill(0xffffff);
    button.drawRect(x, y, width, height);
    button.endFill();
    button.pivot.x = x/2 + width/2;
    button.pivot.y = y/2 + height/2;
    button.interactive = true;
    button.buttonMode = true;

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

