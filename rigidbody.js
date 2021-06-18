var useRK4 = true;

function odeswitchfunction(
  x,
  v,
  listofallobjects,
  player,
  object,
  h,
  omega,
  alpha
) {
  if (useRK4 == true) {
    return rk4(x, v, listofallobjects, player, object, h, omega, alpha);
  } else {
    return rk1(x, v, listofallobjects, player, object, h, omega, alpha);
  }
}

function rk1(x, v, listofallobjects, player, object, h, omega, angle) {
  var m = object.force != undefined ? object.force.m : 1;
  var r_y = (object.height * object.scale.x) / 2;
  var r_x = (object.width * object.scale.y) / 2;
  var i = (m * (r_x * r_x + r_y * r_y)) / 12;

  var a1 = accelfunction(listofallobjects, object, player, x[0], x[1]);

  var torque1 = r_x * a1[1] * m - r_y * a1[0] * m;
  // P = f * rk4_factor;
  var L2 = torque1 * h;
  var omega2 = omega + L2 / i;
  var angle2 = angle + omega2 * h;

  var v2 = [v[0] + a1[0] * h, v[1] + a1[1] * h];
  var x2 = [x[0] + v2[0] * h, x[1] + v2[1] * h];

  return [x2[0], x2[1], v2[0], v2[1], angle2, omega2];
}

function rk4(x, v, listofallobjects, player, object, h, omega, angle) {
  var m = object.force != undefined ? object.force.m : 1;
  var r_y = (object.height * object.scale.x) / 2;
  var r_x = (object.width * object.scale.y) / 2;
  var i = (m * (r_x * r_x + r_y * r_y)) / 12;

  var a1 = accelfunction(listofallobjects, object, player, x[0], x[1]);
  var rk4_factor = 0.5 * h;
  var torque1 = r_x * a1[1] * m - r_y * a1[0] * m;
  var L1 = torque1 * rk4_factor;

  var omega2 = omega + L1 / i;
  var v2 = [v[0] + a1[0] * rk4_factor, v[1] + a1[1] * rk4_factor];
  var x2 = [x[0] + v2[0] * rk4_factor, x[1] + v2[1] * rk4_factor];

  var a2 = accelfunction(listofallobjects, object, player, x2[0], x2[1]);
  rk4_factor = 0.5 * h;
  var torque2 = r_x * a2[1] * m - r_y * a2[0] * m;
  var L2 = torque2 * rk4_factor;

  var omega3 = omega + L2 / i;
  var v3 = [v[0] + a2[0] * rk4_factor, v[1] + a2[1] * rk4_factor];
  var x3 = [x[0] + v3[0] * rk4_factor, x[1] + v3[1] * rk4_factor];

  var a3 = accelfunction(listofallobjects, object, player, x3[0], x3[1]);
  rk4_factor = h;
  var torque3 = r_x * a3[1] * m - r_y * a3[0] * m;
  var L3 = torque3 * rk4_factor;

  var omega4 = omega + L3 / i;
  var v4 = [v[0] + a3[0] * rk4_factor, v[1] + a3[1] * rk4_factor];
  var x4 = [x[0] + v4[0] * rk4_factor, x[1] + v4[1] * rk4_factor];

  var a4 = accelfunction(listofallobjects, object, player, x4[0], x4[1]);
  var torque4 = r_x * a3[1] * m - r_y * a3[0] * m;
  var L4 = torque4 * rk4_factor;

  var omega_final =
    omega + (h / 6) * (L1 / i + (2 * L2) / i + (2 * L3) / i + L4 / i);
  var angle_final =
    angle + (h / 6) * (omega + 2 * omega2 + 2 * omega3 + omega4);

  var xn_x = x[0] + (h / 6) * (v[0] + 2 * v2[0] + 2 * v3[0] + v4[0]);
  var xn_y = x[1] + (h / 6) * (v[1] + 2 * v2[1] + 2 * v3[1] + v4[1]);
  var vn_x = v[0] + (h / 6) * (a1[0] + 2 * a2[0] + 2 * a3[0] + a4[0]);
  var vn_y = v[1] + (h / 6) * (a1[1] + 2 * a2[1] + 2 * a3[1] + a4[1]);

  return [xn_x, xn_y, vn_x, vn_y, angle_final, omega_final];
}

function accelfunction(listofallobjects, object, player, x, y) {
  var atemp = accelfromgravity(object, player, x, y);
  var a_x = atemp[0];
  var a_y = atemp[1];

  for (var i = 0; i < listofallobjects.length; i++) {
    var current = listofallobjects[i];

    if (current == object) {
      continue;
    }
    var atemp = accelfromgravity(object, current, x, y);

    a_x += atemp[0];
    a_y += atemp[1];
  }
  return [a_x, a_y];
  // add static arrows to a
}

function accelfromgravity(object, current, x, y) {
  var atemp_x = 0;
  var atemp_y = 0;
  if (current != object) {
    var rsquared =
      (x - current.x) * (x - current.x) + (y - current.y) * (y - current.y);
    var m = 1;
    if (object.force != undefined) {
      m = object.force.m;
    }
    ag = current.force.computeg(rsquared) / m;
    atemp_x = (ag / rsquared) * (x - current.x);
    atemp_y = (ag / rsquared) * (y - current.y);
  }
  return [atemp_x, atemp_y];
}
