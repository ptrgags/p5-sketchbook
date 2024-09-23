const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = (2 * Math.PI) / GOLDEN_RATIO / GOLDEN_RATIO;

// How many frames before the next primordium is created
const PRIMORDIUM_CREATION_PERIOD = 10;

// How fast the primordia spread out
const PRIMORDIUM_SPEED = 3 / 16;
const PRIMORDIUM_MIN_SIZE = 4;
const PRIMORDIUM_GROWTH_RATE = 1 / 32;

const MAX_PRIMORDIA = 250;

class Primordium {
  constructor(index) {
    this.index = index;
    this.size = PRIMORDIUM_MIN_SIZE;
    this.angle = index * GOLDEN_ANGLE;
    this.distance = 0;
  }

  update() {
    this.distance += PRIMORDIUM_SPEED;
    this.size += PRIMORDIUM_GROWTH_RATE;
  }
}

export const sketch = (p) => {
  const primordia = [];
  let primordia_count = 0;

  p.setup = () => {
    p.createCanvas(500, 700);
  };

  p.draw = () => {
    p.background(0);

    for (const primordium of primordia) {
      const yellowness = p.max(
        Math.pow(primordium.distance / (0.5 * p.width), 3.0),
        0.25
      );

      p.fill(255 * yellowness, 255 * yellowness, 0);
      p.push();
      p.translate(p.width / 2, p.height / 2);

      // draw a line from the origin to the primrodium
      const start = {
        r: primordium.distance - 2 * primordium.size,
        theta: primordium.angle,
      };

      const dt = 0.2;

      const side1 = {
        r: primordium.distance - primordium.size,
        theta: primordium.angle - dt,
      };

      const side2 = {
        r: primordium.distance - primordium.size,
        theta: primordium.angle + dt,
      };

      const tip = {
        r: primordium.distance + primordium.size,
        theta: primordium.angle,
      };

      const control_offset = 0.75;
      const control1 = {
        r: side1.r + control_offset * primordium.size,
        theta: side1.theta,
      };

      const control2 = {
        r: side2.r + control_offset * primordium.size,
        theta: side2.theta,
      };

      const control_tip = {
        r: tip.r - control_offset * primordium.size,
        theta: tip.theta,
      };

      for (const point of [
        start,
        side1,
        side2,
        tip,
        control1,
        control2,
        control_tip,
      ]) {
        point.x = point.r * p.cos(point.theta);
        point.y = point.r * -p.sin(point.theta);
      }

      //p.line(start.x, start.y, side1.x, side1.y);
      //p.line(side1.x, side1.y, control1.x, control1.y);
      //p.line(control1.x, control1.y, control_tip.x, control_tip.y);

      p.beginShape();
      p.vertex(start.x, start.y);
      p.vertex(side1.x, side1.y);
      p.bezierVertex(
        control1.x,
        control1.y,
        control_tip.x,
        control_tip.y,
        tip.x,
        tip.y
      );
      p.bezierVertex(
        control_tip.x,
        control_tip.y,
        control2.x,
        control2.y,
        side2.x,
        side2.y
      );
      /*p.vertex(side1.x, side1.y);
      p.vertex(control_tip.x, control_tip.y);
      p.vertex(tip.x, tip.y);*/
      //p.vertex(control_tip.x, control_tip.y);
      //p.vertex(control2.x, control2.y);
      //p.vertex(side2.x, side2.y);
      p.endShape(p.CLOSE);

      /*p.beginShape();
      p.vertex(start.x, start.y);
      p.vertex(side1.x, side1.y);
      p.vertex(tip.x, tip.y);*/
      /*
      p.bezierVertex(
        control1.x,
        control1.y,
        control_tip.x,
        control_tip.y,
        tip.x,
        tip.y
      );
      p.bezierVertex(
        control_tip.x,
        control_tip.y,
        control2.x,
        control2.y,
        side2.x,
        side2.x
      );
      */
      //p.vertex(side2.x, side2.y);
      //p.endShape(p.CLOSE);

      /*
      p.circle(
        primordium.distance * p.cos(primordium.angle),
        -primordium.distance * p.sin(primordium.angle),
        primordium.size
      );*/
      p.pop();
    }

    if (p.frameCount % PRIMORDIUM_CREATION_PERIOD == 0) {
      const primordium = new Primordium(primordia_count);
      primordia.push(primordium);
      primordia_count++;

      if (primordia.length >= MAX_PRIMORDIA) {
        primordia.shift();
      }
    }

    for (const primordium of primordia) {
      primordium.update();
    }
  };
};
