const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var secondsPassed;
var oldTimeStamp;
var fps;
var GAME_SPEED = 15;

const cx = canvas.width / 2;
const cy = canvas.height / 2;

let isDrawing = false;
let x = 0;
let y = 0;
let rays = 63;
let rotate = 2;

var lines = [];
var bull_start = {
    x: 350,
    y: 232,
    angle: 0,
    size: 200,
};
var obstaculos = [
    // { color: "#00ff00", pos: [{ x: 800, y: 800 }, { x: 600, y: 600 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 600, y: 600 }, { x: 400, y: 500 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 400, y: 500 }, { x: 300, y: 400 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 300, y: 400 }, { x: 100, y: 350 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 100, y: 350 }, { x: 75, y: 300 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 75, y: 300 }, { x: 0, y: 0 }], enable: true },

    // { color: "#00ff00", pos: [{ x: 1000, y: 800 }, { x: 800, y: 600 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 800, y: 600 }, { x: 600, y: 500 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 600, y: 500 }, { x: 500, y: 400 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 500, y: 400 }, { x: 400, y: 350 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 400, y: 350 }, { x: 200, y: 200 }], enable: true },
    // { color: "#00ff00", pos: [{ x: 200, y: 200 }, { x: 200, y: 0 }], enable: true },

    { color: "#00ff00", pos: [{ x: 300, y: 100 }, { x: 400, y: 100 }], enable: true },
    { color: "#00ff00", pos: [{ x: 300, y: 200 }, { x: 300, y: 300 }], enable: true },

    { color: "#ff0000", pos: [{ x: 600, y: 300 }, { x: 650, y: 200 }], enable: false },
    { color: "#00ff00", pos: [{ x: 650, y: 300 }, { x: 700, y: 200 }], enable: true },
    { color: "#00ff00", pos: [{ x: 300, y: 350 }, { x: 300, y: 450 }], enable: true },
    { color: "#ff0000", pos: [{ x: 250, y: 400 }, { x: 250, y: 450 }], enable: false },


    { color: "#00ff00", pos: [{ x: 200, y: 200 }, { x: 250, y: 200 }], enable: true },
    { color: "#00ff00", pos: [{ x: 200, y: 200 }, { x: 200, y: 250 }], enable: true },
    { color: "#00ff00", pos: [{ x: 200, y: 250 }, { x: 250, y: 250 }], enable: true },
    { color: "#00ff00", pos: [{ x: 250, y: 250 }, { x: 250, y: 200 }], enable: true },
];

document.addEventListener("wheel", function (evt) {
    rays += (event.deltaY / 100 * 1);
}, false);

canvas.addEventListener('mousedown', e => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;

    bull_start.x = x;
    bull_start.y = y;
});

canvas.addEventListener('mousemove', e => {
    if (isDrawing === true) {
        x = e.offsetX;
        y = e.offsetY;

        bull_start.x = x;
        bull_start.y = y;
    }
});

window.addEventListener('mouseup', e => {
    if (isDrawing === true) {
        bull_start.x = x;
        bull_start.y = y;

        isDrawing = false;

        // console.log(x, y);
    }
});

function createStyle(canvas) {
    document.body.appendChild(canvas);
    document.body.style.padding = 2;
    document.body.style.margin = 2;
    document.body.style.overflow = 'hidden';
    document.body.style.background = "#000000";
    document.body.style.position = "absolute";
    document.body.style.left = 0;
    document.body.style.top = 0;
}

function Circ(x, y, r) {
    ctx.beginPath();
    ctx.strokeStyle = "#ffffff";
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
}

function Square(x, y, w, h) {
    ctx.beginPath();
    ctx.strokeStyle = "#ffffff";
    ctx.fillRect(w, h, x, y);
    ctx.stroke();
    ctx.closePath();
}

const Obst = function (obst) {
    ctx.beginPath();
    ctx.strokeStyle = obst.color;
    ctx.moveTo(obst.pos[0].x, obst.pos[0].y);
    ctx.lineTo(obst.pos[1].x, obst.pos[1].y);
    ctx.stroke();
    ctx.closePath();
}

const Lines = function () {
    this.x = 0;
    this.y = 0;
    this.angle = bull_start.angle;
    this.text = bull_start.size;

    this.draw = function () {

        ctx.beginPath();

        ctx.save();

        ctx.font = "Normal 8px Arial";
        ctx.fillStyle = "#c0c0c0";
        ctx.fillText(this.text, this.x + 3, this.y - 3);

        ctx.strokeStyle = "#c0c0c0";
        ctx.moveTo(bull_start.x, bull_start.y);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.restore();
        ctx.closePath();
    }

    this.update = function () {
        this.x = bull_start.x + Math.cos(this.angle) * bull_start.size;
        this.y = bull_start.y + Math.sin(this.angle) * bull_start.size;

        for (let i = 0; i < obstaculos.length; i++) {
            // Intersect
            let a = obstaculos[i].pos[0];
            let b = obstaculos[i].pos[1];
            let c = { x: bull_start.x, y: bull_start.y };
            let d = { x: this.x, y: this.y };

            let p = intersection2(a, b, c, d, i);
            // let p = intersection(a, b, c, d, i);

            if (p.isIntersection && obstaculos[i].enable) {
                point(p);

                // Esconde a linha
                this.x = p.x;
                this.y = p.y;

                this.text = (Math.sqrt(Math.pow(Math.abs(p.x - bull_start.x), 2) + Math.pow(Math.abs(p.y - bull_start.y), 2))).toFixed(0);
            }
        }

        this.draw();
    }
}

function P(x, y, color) {
    var rv;

    if (x.map) {
        rv = { x: x[0], y: x[1], color: 'white' }
    } else {
        rv = { x: x, y: y, color: color || 'white' }
    }

    rv.toString = function () {
        return rv.x + ',' + rv.y
    };
    rv.type = 'point';

    return rv
}

function intersection2(a, b, c, d, j) {
    let det = Math.round((a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x));

    let l = (a.x * b.y - a.y * b.x);
    let m = (c.x * d.y - c.y * d.x);

    let ix = Math.round((l * (c.x - d.x) - m * (a.x - b.x)) / det);
    let iy = Math.round((l * (c.y - d.y) - m * (a.y - b.y)) / det);

    let i = P(ix, iy);

    i.isOverlap = (ix == a.x && iy == a.y) || (ix == b.x && iy == b.y)

    i.isIntersection = !(a.x < ix ^ ix < b.x) && !(a.y < iy ^ iy < b.y) && !(c.x < ix ^ ix < d.x) && !i.isOverlap && det
    // i.isIntersection = !(a.x < ix ^ ix < b.x) && !(c.x < ix ^ ix < d.x) && !i.isOverlap && det
    // i.isIntersection = !(a.x <= ix ^ ix <= b.x) && !(a.y <= iy ^ iy <= b.y) && !(c.x <= ix ^ ix <= d.x) && !i.isOverlap && det

    if (!i.isIntersection) {
        // console.log("a =",a, "b =",b, "c =",c, "d =", d, "j =",j);
        // console.log(
        //     "(a.x < ix ^ ix < b.x)", `(${a.x} < ${ix} ^ ${ix} < ${b.x}) =`, !(a.x < ix ^ ix < b.x), `|`,
        //     "(a.y < iy ^ iy < b.y)", `(${a.y} < ${iy} ^ ${iy} < ${b.y}) =`, !(a.y < iy ^ iy < b.y), `|`,
        //     "(c.x < ix ^ ix < d.x)", `(${c.x} < ${ix} ^ ${ix} < ${d.x}) =`, !(c.x < ix ^ ix < d.x), `|`,
        //     `i.isOverlap =`, !i.isOverlap, `|`,
        //     `det =`, det,
        // );
    }

    // if (!i.isIntersection) {
    //     console.log(a, b, c, d);
    // }


    // console.log("a.x", a.x, "a.y", a.y, "b.x", b.x, "b.y", b.y, "ix", ix, "iy", iy, "det", det)
    // console.log("det", det, "l", l, "m", m, "ix", ix, "iy", iy);
    // console.log(!(a.x < ix ^ ix < b.x));
    // console.log(!(c.x < ix ^ ix < d.x));

    return i
}

function findCircleLineIntersections(r, h, k, m, n) {
    // circle: (x - h)^2 + (y - k)^2 = r^2
    // line: y = m * x + n
    // r: circle radius
    // h: x value of circle centre
    // k: y value of circle centre
    // m: slope
    // n: y-intercept

    // get a, b, c values
    var a = 1 + sq(m);
    var b = -h * 2 + (m * (n - k)) * 2;
    var c = sq(h) + sq(n - k) - sq(r);

    // get discriminant
    var d = sq(b) - 4 * a * c;
    if (d >= 0) {
        // insert into quadratic formula
        var intersections = [
            (-b + sqrt(sq(b) - 4 * a * c)) / (2 * a),
            (-b - sqrt(sq(b) - 4 * a * c)) / (2 * a)
        ];
        if (d == 0) {
            // only 1 intersection
            return [intersections[0]];
        }
        return intersections;
    }
    // no intersection
    return [];
}

function distLine(a, b, p) {
    function sqr(x) { return x * x }
    function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
    function distToSegmentSquared(p, v, w) {
        var l2 = dist2(v, w);
        if (l2 == 0) return dist2(p, v);
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) return dist2(p, v);
        if (t > 1) return dist2(p, w);
        return dist2(p, {
            x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y)
        });
    }
    function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
    return distToSegment(p, a, b)
}

function point(params) {
    ctx.beginPath();
    ctx.strokeStyle = params.color;
    ctx.fillStyle = params.color;
    ctx.arc(params.x, params.y, 2.5, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function testIntersec() {
    createStyle(canvas);

    // let a = { x: 100, y: 100 };
    // let b = { x: 200, y: 200 };
    // let c = { x: 200, y: 100 };
    // let d = { x: 100, y: 200 };

    let a = { x: 300, y: 100 };
    let b = { x: 400, y: 100 };
    let c = { x: 350, y: 232 };
    let d = { x: 387.30247388451517, y: 35.50947747513351 };

    // let a = { x: 100, y: 100 };
    // let b = { x: 100, y: 200 };
    // let c = { x: 50, y: 150 };
    // let d = { x: 200, y: 150 };

    // let a = { x: 100, y: 100 };
    // let b = { x: 100, y: 200 };
    // let c = { x: 50, y: 50 };
    // let d = { x: 200, y: 150 };

    // let a = { x: 100, y: 100 };
    // let b = { x: 100, y: 200 };
    // let c = { x: 50, y: 250 };
    // let d = { x: 200, y: 150 };

    // let a = { x: 100, y: 100 };
    // let b = { x: 200, y: 100 };
    // let c = { x: 50, y: 250 };
    // let d = { x: 200, y: 150 };

    // let a = { x: 600, y: 300 };
    // let b = { x: 650, y: 200 };
    // let c = { x: 550, y: 250 };
    // let d = { x: 700, y: 250 };

    // Linha A
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.closePath();

    //  Linha B
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.stroke();
    ctx.closePath();

    // Intersect
    let p = intersection2(a, b, c, d);
    // let p = isIntersecting(a, b, c, d);

    if (p.isIntersection) {
        point(p);
    } else {
        console.log(p);
    }
}


const update = function (timeStamp) {
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    fps = Math.round(1 / secondsPassed);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < obstaculos.length; i++)
        Obst(obstaculos[i]);

    for (let i = 0; i < lines.length; i++)
        lines[i].update();
}

const main = function (timeStamp) {
    update(timeStamp);

    setTimeout(function () {
        requestAnimationFrame(main);
    }, (1000 / GAME_SPEED));
}

const reset = function () {
    createStyle(canvas);

    for (let i = 0; i < rays; i++) {
        // bull_start.angle = 3.13 + (i * 0.1);
        // bull_start.angle = 4.8 + (i * 0.1);
        // bull_start.angle = 3.14 + 0.1* i;
        bull_start.angle = 0.1 * i;
        lines.push(new Lines(bull_start));
    }
}

const start = function () {
    reset();
    main();

    // testIntersec();
}

start();