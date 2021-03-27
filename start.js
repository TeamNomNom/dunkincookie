var app;
var player;
var playerSpeed = 0;
var enemySpeed = 1;
var playerRadius = 35;
var enemyRadius = 30;
var start_isClick = false;
var markers = []

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
    app.loader.add("start", "pic/Start1.png");
    app.loader.add("startOnClick", "pic/Start2.png");
    app.loader.onComplete.add(Initialisation);
    app.loader.load();
    
}

function Initialisation(){
    console.count("finish loading");
    start_title = new PIXI.Sprite(app.loader.resources["title"].texture);

    start_button = createStartButton();

  
    app.stage.addChild(start_title);
    app.stage.addChild(start_button);

}

function setmarker(){
    if (markers.length < 10)
    {
        let x = app.renderer.plugins.interaction.mouse.global.x
        let y = app.renderer.plugins.interaction.mouse.global.y
        let pos = [x,y]
        markers.push(pos)
    }
    else
        player.setPos()
}

function gameloop(delta){
    player.move();
    enemy.move();
}

function createPlayer(){
    x = random(playerRadius, (app.view.width / 5 - playerRadius));
    y = random(playerRadius, app.view.height - playerRadius);
    player = new Player(x, y, app.loader.resources["player"].texture, false, playerSpeed, playerSpeed);
    app.stage.addChild(player);

}
function createEnemy(){
    x = random(enemyRadius, app.view.width - enemyRadius);
    y = random(enemyRadius, app.view.height - enemyRadius);
    enemy = new Enemy(x, y, app.loader.resources["enemy"].texture, false, enemySpeed, enemySpeed);
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


function createStartButton()
{
    start = app.loader.resources['start'].texture;
    startOnClick = app.loader.resources['startOnClick'].texture;

    let button = new PIXI.Sprite(start);

    button.anchor.set(0.5);
    button.scale.set(0.6);

    button.x = app.renderer.width / 2;
    button.y = app.renderer.height / 2;

    button.interactive = true;
    button.buttonMode = true;

    button.on("pointerup", onStartButtonUp);
    button.on("pointerdown", function() {start_isClick = true;});
    button.on("pointerover", function() {this.texture = startOnClick;});
    button.on("pointerout", function() {this.texture = start;});

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
    app.renderer.plugins.interaction.on("pointerup", setmarker);
}
