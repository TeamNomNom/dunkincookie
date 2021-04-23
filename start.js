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
    app.loader.add("goal", "pic/ziel.png")
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
    x = random(playerRadius, app.view.width - (app.view.width / 5 - playerRadius));
    y = random(playerRadius, app.view.height - playerRadius);
    goal = new Goal(x, y, app.loader.resources["goal"].texture, false);
    app.stage.addChild(goal);

}

function setmarker(){    
    if (activateMarkersetting && markers.length < 3)
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
        if (markers.length == 3){
            drawSpline();
        }
    }
}

function drawAllSplines()
{
    for (let i = 0; i < markers.length; i++)
    {
        if (i <= 1)
        {
            p0_x = player.x;
            p0_y = player.y;
        }
        else
        {
            p1_x = markers[i-2].x;
            p1_y = markers[i-2].y;
        }

        if (i == 0)
        {
            p1_x = player.x;
            p1_y = player.y;
        }
        else
        {
            p1_x = markers[i-1].x;
            p1_y = markers[i-1].y;
        }

        if (i + 1 == markers.length)
        {
            //goal
        }
        else
        {            
            p2_x = markers[i].x;
            p2_y = markers[i].y;
        }

        

        if (i + 1 >= markers.length)
        {
            //goal
        }
        else
        {            
            p3_x = markers[i+1].x;
            p3_y = markers[i+1].y;
        }

    }
}

function drawSingleSpline(p0,p1,p2,p2)
{
    if (markers.length > 2)
    {
        stepcount = 30;

        for (let i = 1; i < stepcount; i++)
        {
            t = i / stepcount;

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

function onStartButtonUp() {
    if (!start_isClick)
        return; 
    createBackground();
    createPlayer();
    //createEnemy();

    app.ticker.add(gameloop);  

    app.stage.removeChild(start_title);
    app.stage.removeChild(start_button);

    app.renderer.plugins.interaction.on("pointerup", setmarker);
}
