var app;
var player;
var playerSpeed = 0;
var enemySpeed = 1;
var playerRadius = 35;
var enemyRadius = 30;
var markers = []
var enemyexists = false;
var catmullPoints = [];
//interpolation vars:
var tau = 1/2;
var gameloopactive = false;
var RENDEREDSPLINESTEPS = 60

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
    app.loader.add("circle", "pic/Circle_new.png")
    app.loader.add("goal", "pic/Goal.png")
    app.loader.onComplete.add(Initialisation);
    app.loader.load();
}

function Initialisation(){
    console.count("finish loading");
    start_title = new PIXI.Sprite(app.loader.resources["title"].texture);

    start_button = createStartButton();
  
    app.stage.addChild(start_title);
    app.stage.addChild(start_button);
    
    document.getElementById('button-play').disabled = true;
    document.getElementById('button-clear').disabled = true;
}

function random(min, max)
{
    return Math.random() * (max - min) + min;
}

function gameloop(delta){
    if (gameloopactive)
    {
        //player.move(delta);
    }
    if (enemyexists)
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
    enemyexists = true;
}

function createGoal(){
    x = random(app.view.width - (app.view.width / 5 - playerRadius), app.view.width);
    y = random(playerRadius, app.view.height - playerRadius);
    goal = new Goal(x, y, app.loader.resources["goal"].texture, false);
    app.stage.addChild(goal);

}

function setmarker(){
    if (markers.length >= 5)
        return;
    clearSpline();
    x = app.renderer.plugins.interaction.mouse.global.x;
    y = app.renderer.plugins.interaction.mouse.global.y;
    marker = new Marker(x, y, app.loader.resources["circle"].texture);
    app.stage.addChild(marker);
    markers.push(marker);
    document.getElementById('button-play').disabled = false;
    document.getElementById('button-clear').disabled = false;
    actionWithAllSplinePoints(RENDEREDSPLINESTEPS, addSplinePoint);
}

function actionWithAllSplinePoints(stepcount, action)
{
    for (let i = 0; i <= markers.length; i++)
    {
        //P0
        if (i == 0 || i == 1){
            p0 = [player.x, player.y];
        } else {
            p0 = [markers[i-2].x, markers[i-2].y];
        }

        //P1
        if (i == 0) {
            p1 = [player.x, player.y];
        } else {
            p1 = [markers[i-1].x, markers[i-1].y];
        }

        //P2
        if (i == markers.length) {
            p2 = [goal.x, goal.y];
        } else {            
            p2 = [markers[i].x, markers[i].y];
        }

        //P3
        if (i + 1 == markers.length || i == markers.length) {
            p3 = [goal.x, goal.y];
        } else {            
            p3 = [markers[i+1].x, markers[i+1].y];
        }

        actionWithSingleSpline(p0, p1, p2, p3, stepcount, action)
    }
}

function actionWithSingleSpline(p0, p1, p2, p3, stepcount, action)
{
    max_x = app.view.width;
    max_y = app.view.height;
    scale_x =  (p1[0] - p2[0]);
    scale_y =  (p1[1] - p2[1]);
    hypertenuse = Math.sqrt(scale_x* scale_x + scale_y * scale_y);
    max_hypertenuse = Math.sqrt(max_x * max_x + max_y * max_y);
    step = stepcount * hypertenuse / max_hypertenuse;


    for (let i = 1; i < step; i++)
    {
        t = i / step;

        x = catmullrom(t, p0[0], p1[0], p2[0], p3[0]);
        y = catmullrom(t, p0[1], p1[1], p2[1], p3[1]);

        action(x, y)
        
    }
}


function addSplinePoint(x, y)
{
    graphics = new PIXI.Graphics();
    graphics.beginFill(0x45f542);
    graphics.drawCircle(x, y, 3); // drawCircle(x, y, radius)
    graphics.endFill();
    catmullPoints.push(graphics);
    app.stage.addChild(graphics);
}




function catmullrom(t, p0, p1, p2, p3)
{
    return tau * (
        (2 * p1) +
        (-p0 + p2) * t + 
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
        (-p0 + 3 *p1 -3 * p2 + p3) * t * t * t 
    );
}

function createBackground()
{
    bg = new PIXI.Sprite(app.loader.resources["background"].texture);
    app.stage.addChild(bg);
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

    button.on("pointerover", function() {this.texture = startOnClick;});
    button.on("pointerout", function() {this.texture = start;});
    button.on("click", function() {
        createBackground();
        createPlayer();
        //createEnemy();
        createGoal();
        actionWithAllSplinePoints(RENDEREDSPLINESTEPS, addSplinePoint);
        createExecuteButton();
        createClearButton();
       
        app.ticker.add(gameloop);
    
        app.stage.removeChild(start_title);
        app.stage.removeChild(start_button);
    
        app.renderer.plugins.interaction.on("pointerdown", setmarker);
    });

    return button;
}


function clearSpline()
{    
    catmullPoints.forEach(c => { app.stage.removeChild(c); });
}

function createClearButton()
{
    document.getElementById('button-clear').addEventListener('click', function() {        
        clearSpline();
        markers.forEach(m => { app.stage.removeChild(m); });        
        markers = [];

        document.getElementById('button-play').disabled = true;
        document.getElementById('button-clear').disabled = true;
        actionWithAllSplinePoints(RENDEREDSPLINESTEPS, addSplinePoint);

    });
}

function createExecuteButton()
{
    document.getElementById('button-play').addEventListener('click', function() {
        gameloopactive = true;

    });
}