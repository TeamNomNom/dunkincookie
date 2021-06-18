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

// color for heatmap
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

//find closest seedpoint for distance function
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

// do voronoi stuff
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
  drawCellColors(triangles, numEdges, centers, halfedges);
}

function triangleOfEdge(e) {
  return Math.floor(e / 3);
}
function nextHalfedge(e) {
  return e % 3 === 2 ? e - 2 : e + 1;
}

// draw cells
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

// get around a point
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

//calculate centeroids
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

//generate fracture points
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
}
