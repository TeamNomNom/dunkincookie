var app;
var player;
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

var reachedGoal = false;
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

  app.ticker.speed = 0;
  app.loader.add("player", "pic/Player2.png");
  app.loader.add("enemy", "pic/enemy3.png");
  app.loader.add("background", "pic/Background1.png");
  app.loader.add("title", "pic/Background1.png");
  app.loader.add("start", "pic/Start1.png");
  app.loader.add("startOnClick", "pic/Start2.png");
  app.loader.add("circle", "pic/Circle_new.png");
  app.loader.add("goal", "pic/Goal.png");
  app.loader.add("wallHori", "pic/WallHori.png");
  app.loader.add("wallVerti", "pic/WallVerti.png");
  app.loader.add("gameOver", "pic/GameOver.png");
  app.loader.onComplete.add(Initialisation);
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
    app.ticker.speed = this.value;
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
  if (app.ticker.speed == 0) return;

  if (gameloopactive) {
    directionline();
    drawTrajectories();
    player.updatespeed();
    player.move(delta);

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
  x = random(enemyRadius, app.view.width - enemyRadius);
  y = random(enemyRadius, app.view.height - enemyRadius);
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
  if (gameloopactive || reachedGoal) return;
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
  gameloopactive = false;
  reachedGoal = true;
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

    createEnemy();
    createEnemy();
    createEnemy();
    createEnemy();
    createBlock();
    createGoal();

    createBorders();

    addSplinePoints();
    addPlayButtonListener();
    addClearbuttonListener();
    addVectorFieldButtonListener();
    addTrajectorpointsButtonListener();
    addRK4ButtonListener();
    addEulerButtonListener();
    directionline();

    app.ticker.add(gameloop);
    app.ticker.minFPS = 0;

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
      if (!showVectorField) showVectorField = true;
      else showVectorField = false;
    });
}

function addTrajectorpointsButtonListener() {
  document
    .getElementById("button-trajectorpoints")
    .addEventListener("click", function () {
      if (!showTrajectories) showTrajectories = true;
      else showTrajectories = false;
    });
}

function addRK4ButtonListener() {
  document.getElementById("button-rk4").addEventListener("click", function () {
    useRK4 = true;
    document.getElementById("button-rk4").disabled = true;
    document.getElementById("button-euler").disabled = false;
  });
}

function addEulerButtonListener() {
  document
    .getElementById("button-euler")
    .addEventListener("click", function () {
      useRK4 = false;
      document.getElementById("button-rk4").disabled = false;
      document.getElementById("button-euler").disabled = true;
    });
}

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

var rectx = 300;
var recty = 150;
var rectwidth = 700;
var rectheight = 300;

function addPoly(points, color, alpha = 0.6) {
  var g = new PIXI.Graphics();
  g.beginFill(color);
  g.alpha = alpha;

  g.drawPolygon(_getPixiPoints(points));
  g.endFill();
  app.stage.addChild(g);
  return g;
}

function addPoint(x, y, color, size) {
  var point = new PIXI.Graphics();
  point.beginFill(color);
  point.drawCircle(rectx + x, recty + y, size);
  point.endFill();
  app.stage.addChild(point);
  return point;
}

function createBlock() {
  points = [
    [0, 0],
    [rectwidth, 0],
    [rectwidth, rectheight],
    [0, rectheight],
  ];
  block = addPoly(points, 0xd0faf9);
}

function _getPixiPoints(points) {
  p = [];
  for (var i = 0; i < points.length; i++) {
    p.push(rectx + points[i][0]);
    p.push(recty + points[i][1]);
  }
  return p;
}

function doVoronoiStuff() {
  clearSeedPoints();
  seedpoints = _getFracturePoints(100);
  goOverAllPoints();
  drawSeedPoints();
}

function drawSeedPoints() {
  for (var i = 0; i < seedpoints.length; i++) {
    sp = seedpoints[i];
    point = addPoint(sp.x, sp.y, 0x000000, 3);
    drawnseedpoints.push(point);
  }
}

function goOverAllPoints() {
  for (var x = 0; x < rectwidth; x++) {
    for (var y = 0; y < rectheight; y++) {
      res = findClosestSeedPoint(x, y);

      points = [
        [x, y],
        [x + 1, y],
        [x + 1, y + 1],
        [x, y + 1],
      ];
      if (heatmap) {
        color = getColor(shortest_distance);
        heatmaparray.push(addPoly(points, color, 0.4));
      }
    }
  }
}

function getColor(distance) {
  let devider = 10;
  if (distance < devider) return 0xff0000;
  if (distance < devider * 2) {
    r = 255;
    g = Math.floor((127 * (distance % devider)) / devider);
    b = 0;
    return (((r << 8) + g) << 8) + b;
  }
  if (distance < devider * 3) {
    r = 255;
    g = 127 + Math.floor(((255 - 127) * (distance % devider)) / devider);
    b = 0;
    return (((r << 8) + g) << 8) + b;
  }
  if (distance < devider * 4) {
    r = 255 - Math.floor((255 * (distance % devider)) / devider);
    g = 255;
    b = 0;
    return (((r << 8) + g) << 8) + b;
  }
  if (distance < devider * 5) {
    r = 0;
    g = 255 - Math.floor((255 * (distance % devider)) / devider);
    b = Math.floor((255 * (distance % devider)) / devider);
    return (((r << 8) + g) << 8) + b;
  }
  if (distance < devider * 6) {
    r = Math.floor((75 * (distance % devider)) / devider);
    g = 0;
    b = 255 - Math.floor(((255 - 130) * (distance % devider)) / devider);
    return (((r << 8) + g) << 8) + b;
  }
  if (distance < devider * 7) {
    r = 75 + Math.floor(((148 - 75) * (distance % devider)) / devider);
    g = 0;
    b = 130 + Math.floor(((211 - 130) * (distance % devider)) / devider);
    return (((r << 8) + g) << 8) + b;
  }
  return 0x9400d3;
}

function findClosestSeedPoint(x, y) {
  shortest_index = undefined;
  shortest_distance = undefined;
  other_index = [];
  for (var i = 0; i < seedpoints.length; i++) {
    sp = seedpoints[i];
    distance = Math.round(
      Math.sqrt((x - sp.x) * (x - sp.x) + (y - sp.y) * (y - sp.y))
    );

    if (shortest_distance == undefined || distance < shortest_distance) {
      shortest_distance = distance;
      shortest_index = i;
      other_index = [];
    }
    if (distance == shortest_distance) {
      other_index.push(i);
    }
  }
  return [shortest_index, shortest_distance, other_index];
}

function clearSeedPoints() {
  for (var i = 0; i < drawnseedpoints.length; i++) {
    app.stage.removeChild(drawnSeedPoints[i]);
  }
  drawnSeedPoints = [];
}

function voronoiBS() {
  let delaunay = Delaunator.from(
    seedpoints,
    (loc) => loc.x,
    (loc) => loc.y
  );
  let numRegions = seedpoints.length;
  let numTriangles = delaunay.halfedges.length / 3;
  let numEdges = delaunay.halfedges.length;
  let halfedges = delaunay.halfedges;
  let triangles = delaunay.triangles;
  let centers = calculateCentroids(seedpoints, delaunay);

  for (var i = 0; i < centers.length; i++) {
    p = addPoint(centers[i].x, centers[i].y, 0xffffff, 3);
    voronoitodelete.push(p);
  }

  /*for (let e = 0; e < numEdges; e++) {
    if (e < halfedges[e]) {
      const p = centers[triangleOfEdge(e)];
      ö = triangleOfEdge(halfedges[e]);
      const q = centers[triangleOfEdge(halfedges[e])];

      let line = new PIXI.Graphics();
      line.lineStyle(1, 0xffffff);
      line.position.x = rectx + p.x;
      line.position.y = recty + p.y;
      nq_x = -p.x + q.x;
      nq_y = -p.y + q.y;
      line.lineTo(nq_x, nq_y);
      thingys.push(line);
      app.stage.addChild(line);
    }
  }*/
  drawCellColors(triangles, numEdges, centers, halfedges);
}

function triangleOfEdge(e) {
  return Math.floor(e / 3);
}
function nextHalfedge(e) {
  return e % 3 === 2 ? e - 2 : e + 1;
}

function drawCellColors(triangles, numEdges, centers, halfedges) {
  let seen = new Set(); // of region ids
  for (let e = 0; e < numEdges; e++) {
    const r = triangles[nextHalfedge(e)];
    if (!seen.has(r)) {
      seen.add(r);
      let vertices = edgesAroundPoint(halfedges, e).map(
        (e) => centers[triangleOfEdge(e)]
      );
      red = Math.floor(random(0, 255));
      g = Math.floor(random(0, 255));
      b = Math.floor(random(0, 255));
      color = (((red << 8) + g) << 8) + b;
      p = [];
      for (let i = 0; i < vertices.length; i++) {
        p.push([vertices[i].x, vertices[i].y]);
      }
      poly = addPoly(p, color, 0.6);
      voronoipolys.push(poly);
    }
  }
}

function edgesAroundPoint(halfedges, start) {
  const result = [];
  let incoming = start;
  do {
    result.push(incoming);
    const outgoing = nextHalfedge(incoming);
    incoming = halfedges[outgoing];
  } while (incoming !== -1 && incoming !== start);
  return result;
}

function calculateCentroids(points, delaunay) {
  const numTriangles = delaunay.halfedges.length / 3;
  let centroids = [];
  for (let t = 0; t < numTriangles; t++) {
    let sumOfX = 0,
      sumOfY = 0;
    for (let i = 0; i < 3; i++) {
      let s = 3 * t + i;
      let p = points[delaunay.triangles[s]];
      sumOfX += p.x;
      sumOfY += p.y;
    }
    centroids[t] = { x: sumOfX / 3, y: sumOfY / 3 };
  }
  return centroids;
}

function _getFracturePoints(number) {
  p = [
    { x: 0, y: 0 },
    { x: 0, y: rectheight },
    { x: rectwidth, y: 0 },
    { x: rectwidth, y: rectheight },
  ];
  var i = 0;
  while (i < number) {
    x = Math.floor(random(0, rectwidth));
    y = Math.floor(random(0, rectheight));
    tocontinue = false;
    for (var j = 0; j < p.length; j++) {
      if (Math.abs(p[j][0] - x) < 20 && Math.abs(p[j][1] - y) < 20) {
        tocontinue = true;
        break;
      }
    }
    if (tocontinue) continue;
    p.push({ x: x, y: y });
    i++;
  }
  return p;
  //tobeimplemented / too be a line// if i don not care to we done
}
