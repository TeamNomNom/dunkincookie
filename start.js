var app;
var player;
var playerSpeed = 1;
var playerRadius = 35;
var enemyRadius = 30;
var start_isClick = false;


window.onload = function() {
    app = new PIXI.Application({

        width: 1000,
        height: 400,
        backgroundColor: 0xAAAAAA
    });

    document.body.appendChild(app.view);

    app.loader.add("player", "pic/Player1.png");
    app.loader.add("enemy", "pic/enemy.png");
    app.loader.add("background", "pic/Background1.png");
    app.loader.add("title", "pic/Background1.png");
    app.loader.onComplete.add(Initialisation);
    app.loader.load();
    
}

function Initialisation(){
    console.count("finish loading");
    start_title = new PIXI.Sprite(app.loader.resources["title"].texture);
    

    start_button = createStartButton(app.view.width, app.view.height, 200, 100);
    const font = new PIXI.Text('START');
    font.anchor.set(0.5);
    font.position.set(app.screen.width / 2, app.screen.height / 2);
    var start_text = new PIXI.Text('Start', {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
    start_text.anchor.set(0.5);
    start_text.position.x = app.screen.width / 2;
    start_text.position.y = app.view.height / 2;

    app.stage.addChild(start_title);
    app.stage.addChild(start_button);
    app.stage.addChild(start_text);

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
    bg = new PIXI.Sprite(app.loader.resources["background"].texture);
    app.stage.addChild(bg);
}

function random(min, max)
{
    return Math.random() * (max - min) + min;
}


function createStartButton(x, y, width, height)
{
    var button = new PIXI.Graphics();
    button.beginFill(0xffffff);
    button.drawRect(x, y, width, height);
    button.endFill();
    button.pivot.x = x/2 + width/2;
    button.pivot.y = y/2 + height/2;
    button.interactive = true;
    button.buttonMode = true;

    button.on("pointerup", onStartButtonUp);
    button.on("pointerdown", function() {start_isClick = true;});
    button.on("pointerover", function() {this.tint = 0x68d263;});
    button.on("pointerout", function() {this.tint = 0xffffff;});

    return button;
}

function onStartButtonUp() {
    if (!start_isClick)
        return; 
    createBackground();
    createPlayer();
    createEnemy();

    app.ticker.add(gameloop);  

    app.stage.removeChild(start_title);
    app.stage.removeChild(start_button);
    app.stage.removeChild(start_text);  
}