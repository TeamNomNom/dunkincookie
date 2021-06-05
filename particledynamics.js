var useRK4 = true

function odeswitchfunction(x, v, listofallobjects, player, object, h)
{
    if (useRK4 = true){
        return rk4(x, v, listofallobjects, player, object, h);
    }
    else{
        return simpleeuler(x, v, listofallobjects, player, object, h);
    }
}

function simpleeuler(x, v, listofallobjects, player, object, h)
{ 
    var x1_x = x[0];
    var x1_y = x[1];
    var v1_x = v[0];
    var v1_y = v[1];
    var k1 = accelfunction(listofallobjects, object, player, x1_x, x1_y, v1_x, v1_y, 0);
    
    var xn_x = x[0] + (h)*(v1_x);
    var xn_y = x[1] + (h)*(v1_y);
    var vn_x = v[0] + (h)*(k1[0]);
    var vn_y = v[1] + (h)*(k1[1]);
    return [xn_x, xn_y, vn_x, vn_y];
}

function rk4(x, v, listofallobjects, player, object, h)
{
    var x1_x = x[0];
    var x1_y = x[1];
    var v1_x = v[0];    
    var v1_y = v[1];
    var k1 = accelfunction(listofallobjects, object, player, x1_x, x1_y, v1_x, v1_y, 0);

    var x2_x = x[0] + 0.5 * v1_x * h;
    var x2_y = x[1] + 0.5 * v1_y * h;
    var v2_x = v[0] + 0.5 * k1[0] * h;
    var v2_y = v[1] + 0.5 * k1[1] * h;
    var k2 = accelfunction(listofallobjects, object, player, x2_x, x2_y, v2_x, v2_y, h/2);
    
    var x3_x = x[0] + 0.5 * v2_x * h;
    var x3_y = x[1] + 0.5 * v2_y * h;
    var v3_x = v[0] + 0.5 * k2[0] * h;
    var v3_y = v[1] + 0.5 * k2[1] * h;
    var k3 = accelfunction(listofallobjects, object, player, x3_x, x3_y, v3_x, v3_y, h/2);
    
    var x4_x = x[0] + v3_x * h;
    var x4_y = x[1] + v3_y * h;
    var v4_x = v[0] + k3[0] * h;
    var v4_y = v[1] + k3[1] * h;
    var k4 = accelfunction(listofallobjects, object, player, x4_x, x4_y, v4_x, v4_y, h);

    var xn_x = x[0] + (h/6)*(v1_x + 2*v2_x + 2*v3_x + v4_x);
    var xn_y = x[1] + (h/6)*(v1_y + 2*v2_y + 2*v3_y + v4_y);
    var vn_x = v[0] + (h/6)*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0]);
    var vn_y = v[1] + (h/6)*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1]);

    return [xn_x, xn_y, vn_x, vn_y];
}

function accelfunction(listofallobjects, object, player)
{
    var atemp = accelfromgravity(object, player);
    var a_x = atemp[0];
    var a_y = atemp[1];

    for (var i = 0; i < listofallobjects.length; i++)
    {
        var current = listofallobjects[i]
        
        if (current == object) {
            continue;
        }
        var atemp = accelfromgravity(object, current);

        a_x += atemp[0];
        a_y += atemp[1];
    }
    return [a_x, a_y];
    // add static arrows to a
}

function accelfromgravity(object, current)
{
    var atemp_x = 0;
    var atemp_y = 0;
    if (current != object) {
        var rsquared = (object.x - current.x) * (object.x - current.x) + (object.y - current.y) * (object.y - current.y);
        var m = 1;
        if (object.force != undefined)
        {
            m = object.force.m;
        } 
        ag = current.force.computeg(rsquared)/ m;
        atemp_x = ag/rsquared * (object.x - current.x)
        atemp_y = ag/rsquared * (object.y - current.y)
    }
    return [atemp_x, atemp_y]
}