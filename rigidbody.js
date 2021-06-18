function detectCollision(listofallobjects, player, delta) {
  for (var i = 0; i < listofallobjects.length; i++) {
    var current = listofallobjects[i];

    handleplayer(current, player);
    handlewall(current);

    if (i == listofallobjects.length - 1) continue;

    for (var j = i + 1; j < listofallobjects.length; j++) {
      var check = listofallobjects[j];
      if (checkdistance(current, check)) {
        handlecollision(current, check);
      }
    }
  }
}

function checkdistance(obj1, obj2) {
  if (obj1 instanceof Enemy) {
    var x_1 = obj1.future_x;
    var y_1 = obj1.future_y;
  } else if (obj1 instanceof Player || obj1 instanceof Goal) {
    var x_1 = obj1.x;
    var y_1 = obj1.y;
  }
  if (obj2 instanceof Enemy) {
    var x_2 = obj2.future_x;
    var y_2 = obj2.future_y;
  } else if (obj2 instanceof Player || obj2 instanceof Goal) {
    var x_2 = obj2.x;
    var y_2 = obj2.y;
  }
  var distance =
    (obj1.width / 2) * obj1.scale.x + (obj2.height / 2) * obj2.scale.x;

  var x = Math.abs(x_1 - x_2) < distance;
  var y = Math.abs(y_1 - y_2) < distance;

  if (Math.abs(x_1 - x_2) < distance && Math.abs(y_1 - y_2) < distance) {
    return true;
  }
  return false;
}

function handlecollision(current, check) {
  var v1_x = current.future_speed_x;
  var v1_y = current.future_speed_y;
  var v2_x = check.future_speed_x;
  var v2_y = check.future_speed_y;
  var m_1 = current.force.m;
  var m_2 = check.force.m;
  var x_1 = current.future_x;
  var x_2 = check.future_x;
  var y_1 = current.future_y;
  var y_2 = check.future_y;
  var n_x =
    (x_1 - x_2) /
    Math.sqrt((x_1 - x_2) * (x_1 - x_2) + (y_1 - y_2) * (y_1 - y_2));
  var n_y =
    (y_1 - y_2) /
    Math.sqrt((x_1 - x_2) * (x_1 - x_2) + (y_1 - y_2) * (y_1 - y_2));
  current.future_speed_x =
    v1_x - ((2 * m_1) / (m_1 + m_2)) * (v1_x - v2_x) * n_x * n_x;
  current.future_speed_y =
    v1_y - ((2 * m_1) / (m_1 + m_2)) * (v1_y - v2_y) * n_y * n_y;
  check.future_speed_x =
    v2_x - ((2 * m_2) / (m_1 + m_2)) * (v2_x - v1_x) * n_x * n_x;
  check.future_speed_y =
    v2_y - ((2 * m_2) / (m_1 + m_2)) * (v2_y - v1_y) * n_y * n_y;
}

function handlewall(current) {
  radius = current.width / 2;
  if (current.future_x - radius - 5 < borders[0].width) {
    current.future_x = (current.future_x - 5 - radius) * -1 + 5;
    current.future_speed_x *= -1;
  }
  if (current.future_y - radius - 5 < borders[1].height) {
    current.future_y = (current.future_y - 5 - radius) * -1 + 5;
    current.future_speed_y *= -1;
  }
  6;
  if (current.future_x + radius + 5 > 1300 - borders[2].width) {
    current.future_x = 1300 - 5 - (current.future_x + radius - 1300 + 5);
    current.future_speed_x *= -1;
  }
  if (current.future_y + radius + 5 > 600 - borders[3].height) {
    current.future_y = 600 - 5 - (current.future_y + radius - 600 + 5);
    current.future_speed_y *= -1;
  }
}

function handleplayer(current, player) {
  if (checkdistance(current, player)) {
    for (var i = 0; i < objects.length; i++) {
      if (objects[i] === current) {
        GameOver();
      }
    }
  }
}
