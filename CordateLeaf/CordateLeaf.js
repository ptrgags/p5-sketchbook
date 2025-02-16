import { Polar } from "../sketchlib/Polar.js";

const MAX_LENGTH = 200;

const RIB_ANGLE = Math.PI / 20;
const DELAY = 8;
const MAX_RIBS = 20;
const UNIT_LENGTH = 1.5;
const GROWTH_RATE = 2;
const RIB_SCALE = 0.8;

class Rib {
  constructor(angle, growth_rate) {
    this.angle = angle;
    this.length = 0;
    this.growth_rate = growth_rate;

    this.children = [];
  }

  get tip() {
    return new Polar(this.length, this.angle);
  }

  update() {
    for (const child of this.children) {
      child.update();
    }
    this.length += this.growth_rate;
    this.length = Math.min(this.length, MAX_LENGTH);

    if (this.length >= 0.5 * MAX_LENGTH && this.children.length === 0) {
      this.children.push(new Rib(this.angle + RIB_ANGLE, this.growth_rate));
      this.children.push(new Rib(this.angle - RIB_ANGLE, this.growth_rate));
    }
  }
}

function draw_rib(p, parent, rib) {
  const tip = rib.tip;
  p.line(
    parent.y,
    -parent.x,
    UNIT_LENGTH * RIB_SCALE * tip.y,
    UNIT_LENGTH * RIB_SCALE * -tip.x
  );
  p.line(
    parent.y,
    -parent.x,
    UNIT_LENGTH * RIB_SCALE * -tip.y,
    UNIT_LENGTH * RIB_SCALE * -tip.x
  );
}

export const sketch = (p) => {
  // The leaf has left-right mirror symmetry. This means we only have to
  // compute one half of the leaf and render it twice.
  const ribs = [];

  p.setup = () => {
    p.createCanvas(500, 700);

    ribs.push(new Rib(0, GROWTH_RATE));
  };

  p.draw = () => {
    p.background(0);

    p.push();

    p.strokeWeight(2);
    p.translate(p.width / 2, p.height / 2 + 100);

    p.stroke(0, 127, 0);
    p.line(0, 0, 0, p.min(p.frameCount * UNIT_LENGTH, UNIT_LENGTH * 100));

    const tips = ribs.map((x) => x.tip);

    p.strokeWeight(2);
    p.fill(0, 63, 0);
    p.beginShape();
    for (const tip of tips) {
      p.vertex(-UNIT_LENGTH * tip.y, -UNIT_LENGTH * tip.x);
    }
    p.vertex(0, 0);
    p.endShape();

    p.beginShape();
    for (const tip of tips) {
      p.vertex(UNIT_LENGTH * tip.y, UNIT_LENGTH * -tip.x);
    }
    p.vertex(0, 0);
    p.endShape();

    p.strokeWeight(3);
    p.stroke(0, 127, 0);
    for (const [i, rib] of ribs.entries()) {
      // The veins will start with every 4th vein.
      if (i % 4 !== 0) {
        continue;
      }
      draw_rib(p, new Polar(0, 0), rib);
    }

    if (ribs[0].length < MAX_LENGTH) {
      for (const rib of ribs) {
        rib.update();
      }
    }

    if (ribs.length < MAX_RIBS && ribs[ribs.length - 1].length > DELAY) {
      ribs.push(new Rib(ribs.length * RIB_ANGLE, GROWTH_RATE));
    }

    p.pop();
  };
};
