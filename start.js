var app;
var player;
var playerSpeed = 0;
var enemySpeed = 1;
var playerRadius = 35;
var enemyRadius = 30;
var start_isClick = false;
var markers = []
var enemyexists = false;
var activateMarkersetting = false;
var executeGame = false;
//interpolation vars:
var tau = 1/2;


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
    app.loader.add("circle", "pic/Circle.png")
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

}

function gameloop(delta){

  
    player.move();
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
    if (activateMarkersetting && markers.length < 5 && executeGame == false)
    {
        let x = app.renderer.plugins.interaction.mouse.global.x;
        let y = app.renderer.plugins.interaction.mouse.global.y;
        marker = new Marker(x, y, app.loader.resources["circle"].texture);
        app.stage.addChild(marker);
        markers.push(marker);
    }
    else
    {
        activateMarkersetting = true;
    
    }
}

function drawAllSplines()
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
            drawSingleSpline(p0, p1, p2, p3)
    }
}

function drawSingleSpline(p0, p1, p2, p3)
{
    if (markers.length > 2)
    {
        stepcount = 60;
        let max_x = app.view.width;
        let max_y = app.view.height;
        let scale_x =  (p1[0] - p2[0]);
        let scale_y =  (p1[1] - p2[1]);
        let hypertenuse = Math.sqrt(scale_x* scale_x + scale_y * scale_y);
        let max_hypertenuse = Math.sqrt(max_x * max_x + max_y * max_y);
        step = stepcount * hypertenuse / max_hypertenuse;


        for (let i = 1; i < step; i++)
        {
            t = i / step;

            x = catmullrom(t, p0[0], p1[0], p2[0], p3[0]);
            y = catmullrom(t, p0[1], p1[1], p2[1], p3[1]);

            // Set the fill color
            var graphics = new PIXI.Graphics();
            graphics.beginFill(0x45f542); // Red
            graphics.drawCircle(x, y, 5); // drawCircle(x, y, radius)
            graphics.endFill();
            app.stage.addChild(graphics);
        }
    }

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

function createExecuteButton()
{
    const button = document.getElementById('button-play');

    button.addEventListener('pointerdown', function() {
        const button = this;
        
        executeGame = true;
        if (executeGame == true && markers.length >= 3){
            drawAllSplines();
        }
        else
        {
            executeGame = false;
        }

    });
}

function createSpeedButton()
{
    const button = document.getElementById('button-speed');

    button.addEventListener('pointerdown', function() {
        const button = this;
        
        console.count("Speed");
        //Set speed after finisch

    });
}


function onStartButtonUp() {
    if (!start_isClick)
        return; 
    createBackground();
    createPlayer();
    //createEnemy();
    createGoal();
    createExecuteButton();
    createSpeedButton();
   
    start_button.interactive = false;
    start_button.buttonMode = false;
    app.ticker.add(gameloop);  
    
    app.stage.removeChild(start_title);
    app.stage.removeChild(start_button);

    app.renderer.plugins.interaction.on("pointerup", setmarker);
}


