var app;
var player;
var goal;
var playerSpeed = 30;

var objects = [];
var enemySpeed = 0;
var playerRadius = 35;
var enemyRadius = 30;

var PLAYERMASS = 80000;
var PLAYERGRAVVAR = 2000;
var ENEMYMASS = 500;
var ENEMYGRAVVAR = 8000;

var MARKERLIMIT = 10;
var markers = [];
var visibleSplinePoints = [];
var RENDEREDSPLINESTEPS = 30;

var gameloopactive = false;

//interpolation vars:
var tau = 1 / 2;
var arclengthtable = [];
var ARCLENGTHSAMPLESIZE = 1000;

var showVectorField = false;
var showTrajectories = false;
var arrowLoc = [];
var trajectoriespoints = [];

var borders = [];

var seedpoints = [];
var drawnseedpoints = [];
var heatmap = false;
var block;
var voronoiAnimation = false;
var voronoipolys = [];
var voronoicounter = 0;
var needtocalcvoronoipoints = false;
var needtocalcvoronoistuff = false;
var voronoifactor = 200;
var voronoitodelete = [];

var heatmaparray = [];
window.onload = function () {
  app = new PIXI.Application({
    width: 1300,
    height: 600,
    backgroundColor: 0xaaaaaa,
  });

  document.getElementById("game").append(app.view);

  app.ticker.speed = 0.5;
  app.ticker.minFPS = 144;
  app.ticker.maxFPS = 145;
  app.loader.add("player", "pic/Player2.png");
  app.loader.add("enemy", "pic/enemy3.png");
  app.loader.add("background", "pic/Background1.png");
  app.loader.add("title", "pic/Background1.png");
  app.loader.add("start", "pic/Start1.png");
  app.loader.add("startOnClick", "pic/Start2.png");
  app.loader.add("circle", "pic/Circle_new.png");
  app.loader.add("goal", "pic/Goal2.png");
  app.loader.add("wallHori", "pic/WallHori.png");
  app.loader.add("wallVerti", "pic/WallVerti.png");
  app.loader.add("gameOver", "pic/GameOver.png");
  app.loader.add("youwin", "pic/YouWin.png");
  app.loader.onComplete.add(Initialisation);
  addVectorFieldButtonListener();
  addTrajectorpointsButtonListener();
  addRK4ButtonListener();
  addEulerButtonListener();
  addHeatmapButtonListener();
  app.loader.load();

  var slider_speed = document.getElementById("speedControl");
  var output_speed = document.getElementById("valuespeed");
  output_speed.innerHTML = slider_speed.value;

  //WILL NOT ERROR ONCE WE MOVED INPUT THINGYS TO PIXIJS
  slider_speed.oninput = function () {
    output_speed.innerHTML = this.value;
    player.setbasespeed(this.value);
  };

  var slider_animation = document.getElementById("animationControl");
  var output_animation = document.getElementById("valueanimation");
  output_animation.innerHTML = slider_animation.value;
  slider_animation.oninput = function () {
    output_animation.innerHTML = this.value;
    app.ticker.minFPS = this.value;
    app.ticker.maxFPS = this.value + 1;
    //app.ticker.speed = this.value;
  };
};

function Initialisation() {
  console.count("finish loading");
  start_title = new PIXI.Sprite(app.loader.resources["title"].texture);
  start_title.scale.set(1.5);

  start_button = createStartButton();

  app.stage.addChild(start_title);
  app.stage.addChild(start_button);

  document.getElementById("button-play").disabled = true;
  document.getElementById("button-clear").disabled = true;
}

//helperfunction returning a somewhat random result from min to max
function random(min, max) {
  return Math.random() * (max - min) + min;
}

//Gameloop which is FPS independn you can set the rate at which this is called
//with app.ticker.speed also we can manually skip gameloop calls aswell for
//example if some calculation are not done yet or we are waiting for input
//from the player.
function gameloop(delta) {
  //console.log("delta    ",delta);
  //console.log("elapseMS ",app.ticker.elapsedMS );
  //console.log("FPS      ",app.ticker.FPS);
  //console.log("speed    ",app.ticker.speed);
  if (app.ticker.minFPS == 0) return;

  if (gameloopactive) {
    directionline();
    drawTrajectories();
    player.updatespeed();
    player.move(delta);

    console.log(checkdistance(goal, player));
    if (checkdistance(goal, player)) {
      YouWin();
    }

    for (var i = 0; i < objects.length; i++) {
      objects[i].move(objects, player, delta);
    }
    for (var i = 0; i < objects.length; i++) {
      detectCollision(objects, player, delta);
      //if wall instead voronoi thingy
    }

    for (var i = 0; i < objects.length; i++) {
      objects[i].update();
    }
  }
  //counter = 144 * 300;
  if (voronoiAnimation) {
    voronoicounter--;
    //show voronoi points
    if (voronoicounter < voronoifactor * 3 && needtocalcvoronoipoints) {
      needtocalcvoronoipoints = false;
      doVoronoiStuff();
      if (heatmap) {
        voronoicounter = voronoifactor * 2 + 1;
      }
      return;
    }

    if (voronoicounter < voronoifactor * 2 && needtocalcvoronoistuff) {
      app.stage.removeChild(block);
      for (var i = 0; i < drawnseedpoints.length; i++) {
        app.stage.removeChild(drawnseedpoints[i]);
      }
      for (var i = 0; i < heatmaparray.length; i++) {
        app.stage.removeChild(heatmaparray[i]);
      }
      needtocalcvoronoistuff = false;
      voronoiBS();
      return;
    }
    //show voronoi cells

    //randomly remove cells
    if (voronoicounter < voronoifactor && voronoicounter % 3 == 0) {
      for (var i = 0; i < voronoitodelete.length; i++) {
        app.stage.removeChild(voronoitodelete[i]);
      }
      r = Math.floor(random(0, voronoipolys.length));
      app.stage.removeChild(voronoipolys[r]);
      voronoipolys.splice(r, 1);
      if (voronoipolys.length == 0) {
        gameloopactive = true;
      }
    }
  }
}

//loads Player icon on the Scene
function createPlayer() {
  x = random(playerRadius, app.view.width / 5 - playerRadius);
  y = random(playerRadius, app.view.height - playerRadius);
  player = new Player(
    x,
    y,
    app.loader.resources["player"].texture,
    false,
    playerSpeed,
    PLAYERMASS,
    PLAYERGRAVVAR
  );
  app.stage.addChild(player);
}

//loads Player icon on the Scene
function createEnemy() {
  yettofoundspot = true;
  let x, y;
  while (yettofoundspot) {
    yettofoundspot = false;
    x = random(enemyRadius + 10, app.view.width - enemyRadius - 10);
    y = random(enemyRadius + 10, app.view.height - enemyRadius - 10);
    if (Math.abs(x - player.x) < 50 && Math.abs(y - player.y) < 50) {
      yettofoundspot = true;
    }
    if (Math.abs(x - goal.x) < 50 && Math.abs(y - goal.y) < 50) {
      yettofoundspot = true;
    }
    objects.forEach((e) => {
      if (Math.abs(x - e.x) < 20 && Math.abs(y - e.y) < 20) {
        yettofoundspot = true;
      }
    });
  }
  enemy = new Enemy(
    x,
    y,
    app.loader.resources["enemy"].texture,
    false,
    enemySpeed,
    enemySpeed,
    ENEMYMASS,
    ENEMYGRAVVAR
  );
  app.stage.addChild(enemy);
  objects.push(enemy);
}

//loads Player icon on the Scene
function createGoal() {
  x = random(
    app.view.width - (app.view.width / 5 - playerRadius),
    app.view.width
  );
  y = random(playerRadius, app.view.height - playerRadius);
  goal = new Goal(x, y, app.loader.resources["goal"].texture, false);
  app.stage.addChild(goal);
}

//sets Marker (ControlPoint) to the Scene
function setmarker() {
  if (gameloopactive) return;
  if (markers.length >= MARKERLIMIT) return;
  x = app.renderer.plugins.interaction.mouse.global.x;
  y = app.renderer.plugins.interaction.mouse.global.y;
  marker = new Marker(x, y, app.loader.resources["circle"].texture);
  app.stage.addChild(marker);
  markers.push(marker);
  document.getElementById("button-play").disabled = false;
  document.getElementById("button-clear").disabled = false;
  addSplinePoints();
}

//add spline points for every curve between control points
function addSplinePoints() {
  arclengthtable = [];
  for (let i = 0; i <= markers.length; i++) {
    //P0
    if (i == 0 || i == 1) {
      p0 = [player.start_x, player.start_y];
    } else {
      p0 = [markers[i - 2].x, markers[i - 2].y];
    }

    //P1
    if (i == 0) {
      p1 = [player.start_x, player.start_y];
    } else {
      p1 = [markers[i - 1].x, markers[i - 1].y];
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
      p3 = [markers[i + 1].x, markers[i + 1].y];
    }

    addSingleSpline(p0, p1, p2, p3);
  }
  addVisibleSplinePoint(RENDEREDSPLINESTEPS);
}

//add spline points for a curve between 2 control points p1 and p2
//and helper control points p0 and p3
function addSingleSpline(p0, p1, p2, p3) {
  for (let i = 1; i < ARCLENGTHSAMPLESIZE; i++) {
    t = i / ARCLENGTHSAMPLESIZE;

    x = catmullrom(t, p0[0], p1[0], p2[0], p3[0]);
    y = catmullrom(t, p0[1], p1[1], p2[1], p3[1]);

    addArclengthEntry(x, y);
  }
}

//calculate value using matrix calculation.
function catmullrom(t, p0, p1, p2, p3) {
  return (
    tau *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  );
}

//Add Point to Arclength Table
function addArclengthEntry(x, y) {
  arclength = 0;
  totalength = 0;
  if (arclengthtable.length != 0) {
    prev = arclengthtable[arclengthtable.length - 1];
    dist_x = x - prev.x;
    dist_y = y - prev.y;
    arclength = Math.sqrt(dist_x * dist_x + dist_y * dist_y);
    totalength = prev.totalLengthTillHere;
  }
  entry = new ArclengthtableEntry(x, y, arclength, totalength);
  arclengthtable.push(entry);
}

//Add a spline point
function addVisibleSplinePoint(sample) {
  visibleSplinePoints.forEach((c) => {
    app.stage.removeChild(c);
  });
  visibleSplinePoints = [];
  for (let i = 0; i < arclengthtable.length; i += sample) {
    let x = arclengthtable[i].x;
    let y = arclengthtable[i].y;

    graphics = new PIXI.Graphics();
    graphics.beginFill(0x45f542);
    graphics.drawCircle(x, y, 3); // drawCircle(x, y, radius)
    graphics.endFill();
    visibleSplinePoints.push(graphics);
    app.stage.addChild(graphics);
  }
}

// returns first value after passing a goallength in the  arclength table
function getPosFromArclengthWithDelta(goal) {
  for (i = 0; i < arclengthtable.length; i++) {
    let e = arclengthtable[i];
    if (e.totalLengthTillHere > goal) return e;
  }
  return arclengthtable[arclengthtable.length - 1];
}

//Loads Background texture
function createBackground(resourcename) {
  bg = new PIXI.Sprite(app.loader.resources[resourcename].texture);
  bg.scale.set(1.5);
  app.stage.addChild(bg);
}

function GameOver() {
  for (var c = app.stage.children.length - 1; c >= 0; c--) {
    app.stage.removeChild(app.stage.children[c]);
  }
  bg = new PIXI.Sprite(app.loader.resources["gameOver"].texture);
  bg.width = 1300;
  bg.height = 600;
  app.stage.addChild(bg);
  app.ticker.started = false;
}

function YouWin() {
  for (var c = app.stage.children.length - 1; c >= 0; c--) {
    app.stage.removeChild(app.stage.children[c]);
  }
  win = new PIXI.Sprite(app.loader.resources["youwin"].texture);
  app.stage.addChild(win);
  app.ticker.started = false;
}

//Creates the Start Button, including a an listener which starts the game itself.
function createStartButton() {
  start = app.loader.resources["start"].texture;
  startOnClick = app.loader.resources["startOnClick"].texture;

  let button = new PIXI.Sprite(start);

  button.anchor.set(0.5);
  button.scale.set(0.6);

  button.x = app.renderer.width / 2;
  button.y = app.renderer.height / 2;

  button.interactive = true;
  button.buttonMode = true;

  button.on("pointerover", function () {
    this.texture = startOnClick;
  });
  button.on("pointerout", function () {
    this.texture = start;
  });
  button.on("click", function () {
    createBackground("background");
    prepareField();

    createPlayer();
    createGoal();
    for (var i = random(1, 5); i > 0; i--) {
      createEnemy();
    }
    createBlock();

    createBorders();

    addSplinePoints();
    addPlayButtonListener();
    addClearbuttonListener();
    directionline();

    app.ticker.add(gameloop);
    //app.ticker.minFPS = 0;
    app.ticker.minFPS = document.getElementById("animationControl").value;

    app.stage.removeChild(start_title);
    app.stage.removeChild(start_button);

    app.renderer.plugins.interaction.on("pointerdown", setmarker);
  });

  return button;
}
// add listener to the Clear Markers button, which clears the markers
function addClearbuttonListener() {
  document
    .getElementById("button-clear")
    .addEventListener("click", function () {
      markers.forEach((m) => {
        app.stage.removeChild(m);
      });
      markers = [];
      document.getElementById("button-play").disabled = true;
      document.getElementById("button-clear").disabled = true;

      addSplinePoints();
    });
}

//add listener to the Play Button, which starts the gameloop
function addPlayButtonListener() {
  document.getElementById("button-play").addEventListener("click", function () {
    gameloopactive = true;
    player.setEaseParameters(
      arclengthtable[arclengthtable.length - 1].totalLengthTillHere
    );

    document.getElementById("button-play").disabled = true;
    document.getElementById("button-clear").disabled = true;
  });
}

function addVectorFieldButtonListener() {
  document
    .getElementById("button-vectorfield")
    .addEventListener("click", function () {
      showVectorField = !showVectorField;
      if (!showVectorField) {
        document.getElementById("button-vectorfield").style.backgroundColor =
          "#4caf50";
      } else {
        document.getElementById("button-vectorfield").style.backgroundColor =
          "red";
      }
      directionline();
    });
}

function addTrajectorpointsButtonListener() {
  document
    .getElementById("button-trajectorpoints")
    .addEventListener("click", function () {
      showTrajectories = !showTrajectories;
      if (!showTrajectories) {
        document.getElementById(
          "button-trajectorpoints"
        ).style.backgroundColor = "#4caf50";
      } else {
        document.getElementById(
          "button-trajectorpoints"
        ).style.backgroundColor = "red";
      }
    });
}

function addHeatmapButtonListener() {
  document
    .getElementById("button-heatmap")
    .addEventListener("click", function () {
      heatmap = !heatmap;
      if (!heatmap) {
        document.getElementById("button-heatmap").style.backgroundColor =
          "#4caf50";
      } else {
        document.getElementById("button-heatmap").style.backgroundColor = "red";
      }
    });
}

function addRK4ButtonListener() {
  if (useRK4) {
    document.getElementById("button-rk4").disabled = true;
    document.getElementById("button-rk4").style.backgroundColor = "red";
  }
  document.getElementById("button-rk4").addEventListener("click", function () {
    useRK4 = true;
    document.getElementById("button-rk4").disabled = true;
    document.getElementById("button-rk4").style.backgroundColor = "red";
    document.getElementById("button-euler").style.backgroundColor = "#4caf50";
    document.getElementById("button-euler").disabled = false;
  });
}

function addEulerButtonListener() {
  if (!useRK4) {
    document.getElementById("button-euler").disabled = true;
    document.getElementById("button-euler").style.backgroundColor = "#4caf50";
  }
  document
    .getElementById("button-euler")
    .addEventListener("click", function () {
      useRK4 = false;
      document.getElementById("button-euler").style.backgroundColor = "red";
      document.getElementById("button-rk4").style.backgroundColor = "#4caf50";
      document.getElementById("button-rk4").disabled = false;
      document.getElementById("button-euler").disabled = true;
    });
}

//prepare arrow field
function prepareField() {
  var line;
  var resolution = 30;
  var amountXarrow = Math.ceil(app.view.width / resolution) + 1;
  var amountYarrow = Math.ceil((app.view.height + 100) / resolution) + 1;

  for (var row = 0; row < amountYarrow; row++) {
    for (var col = 0; col < amountXarrow; col++) {
      line = new PIXI.Graphics();
      line.position.x = resolution * col;
      line.position.y = resolution * row;
      line.anchor = 0;

      arrowLoc.push(line);
      app.stage.addChild(line);
    }
  }
}

//draw trajectories
function drawTrajectories() {
  for (var i = 0; i < trajectoriespoints.length; i++) {
    app.stage.removeChild(trajectoriespoints[i]);
  }
  trajectoriespoints = [];
  if (!showTrajectories) return;
  for (var i = 0; i < objects.length; i++) {
    var positionlog = objects[i].pos_log;
    for (var p = 0; p < positionlog.length; p++) {
      point = new PIXI.Graphics();
      point.beginFill(0xff00ff);
      point.drawCircle(positionlog[p][0], positionlog[p][1], 2); // drawCircle(x, y, radius)
      point.endFill();

      trajectoriespoints.push(point);
      app.stage.addChild(point);
    }
  }
}

// draw arrow field
function directionline() {
  if (!showVectorField) {
    clearVectorfield();
    return;
  }
  for (var j = 0; j < objects.length; j++) {
    for (var i = arrowLoc.length - 1; i >= 0; i--) {
      //a = Math.abs(player.x - arrowLoc[i].x);
      setLineTo(arrowLoc[i]);
    }
  }
}

//clear vector field
function clearVectorfield() {
  for (var i = arrowLoc.length - 1; i >= 0; i--) {
    arrowLoc[i].clear();
  }
}

function setLineTo(line) {
  var res = rk1([line.x, line.y], [0, 0], objects, player, line, 1, 0, 0);

  //arrowLoc[i].rotation = Math.atan(b/a);
  var factor = 1;
  var nx = factor * res[2];
  var ny = factor * res[3];

  line.clear();
  line.lineStyle(2, 0xd5402b);
  line.position.x = line.x;
  line.position.y = line.y;
  if (Math.abs(nx) > 15) {
    nx = Math.sign(nx) * 15;
  }
  if (Math.abs(ny) > 15) {
    ny = Math.sign(ny) * 15;
  }
  line.lineTo(nx, ny);
}

//create borders
function createBorders() {
  border0 = new Wall(
    (x = 0),
    (y = 0),
    (texture = app.loader.resources["wallVerti"].texture),
    (hasHit = false),
    (anchor_x = 0),
    (anchor_y = 0)
  );
  border1 = new Wall(
    (x = 0),
    (y = 0),
    (texture = app.loader.resources["wallHori"].texture),
    (hasHit = false),
    (anchor_x = 0),
    (anchor_y = 0)
  );
  border2 = new Wall(
    (x = 1300),
    (y = 0),
    (texture = app.loader.resources["wallVerti"].texture),
    (hasHit = false),
    (anchor_x = 1),
    (anchor_y = 0)
  );
  border3 = new Wall(
    (x = 0),
    (y = 600),
    (texture = app.loader.resources["wallHori"].texture),
    (hasHit = false),
    (anchor_x = 0),
    (anchor_y = 1)
  );

  app.stage.addChild(border0);
  app.stage.addChild(border1);
  app.stage.addChild(border2);
  app.stage.addChild(border3);
  borders.push(border0);
  borders.push(border1);
  borders.push(border2);
  borders.push(border3);
}
