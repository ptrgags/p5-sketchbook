let cp1 =  [100, 240];
let cp2 =  [320, 100];
let cp3 =  [400, 600];
let cp4 =  [300, 400];

let steps = 10;
let ratio = 1.0 / steps;

function interpolate(p1, p2, ratio) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;

    const lerp_x = (1.0 - ratio) * x1 + ratio * x2;
    const lerp_y = (1.0 - ratio) * y1 + ratio * y2;
    return [lerp_x, lerp_y];
}

function circle(p, x, y, r) {
    p.ellipse(x, y, r, r);
}

function plot(p, point, radius=3) {
    circle(p, point.x, point.y, radius);
}

function line_between(p, a, b) {
    const [ax, ay] = a;
    const [bx, by] = b;
    p.line(ax, ay, bx, by);
}

function * bezier_gen(p1, p2, p3, steps, ratio) {
    for (let x = 0; x < steps; x++) {
        const p4 = interpolate(p1, p2, ratio * x);
        const p5 = interpolate(p2, p3, ratio * x);
        // Curve point
        const p6 = interpolate(p4, p5, ratio * x);
        yield [p4, p5, p6];
    }
}

function * bezier_gen_cubic(p1, p2, p3, p4, steps, ratio) {
    for (let x = 0; x < steps; x++) {
        //First subdivision
        const p5 = interpolate(p1, p2, ratio * x);
        const p6 = interpolate(p2, p3, ratio * x);
        const p7 = interpolate(p3, p4, ratio * x);
        // Second subdivision
        const p8 = interpolate(p5, p6, ratio * x);
        const p9 = interpolate(p6, p7, ratio * x);
        // Curve point
        const p10 = interpolate(p8, p9, ratio * x);
        yield [p8, p9, p10];
    }
}

export const sketch = (p) => {
    p.setup = () => {
        p.createCanvas(500, 700);
    }

    p.draw = () => {
        p.background(0);
        p.stroke(255, 0, 0);
        p.strokeWeight(4);
        p.noFill();
        p.beginShape();
        p.vertex(...cp1);
        p.quadraticVertex(...cp2, ...cp3);
        p.endShape();
        
        p.stroke(255);
        p.strokeWeight(1);
        plot(p, cp1);
        line_between(p, cp1, cp2);
        plot(p, cp2);
        line_between(p, cp2, cp3);
        plot(p, cp3);
        
        for (const [p4, p5, p6] of bezier_gen(cp1, cp2, cp3, steps, ratio)) {
            line_between(p, p4, p5);
            plot(p, p6);
        }
    }
        
    p.mouseDragged = () => {
        cp2 = [p.mouseX, p.mouseY];
    }

    p.mouseWheel = (event) => {
        steps -= Math.sign(event.delta);
        steps = Math.max(steps, 1)
        ratio = 1.0 / steps;
    }
}