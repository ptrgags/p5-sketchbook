import { PhyllotaxisPalette } from "../sketchlib/PhyllotaxisPalette.js";

const SQUARE_SIZE = 10;
const ROW_COUNT = 70;

const PALETTE_SIZE = 50;
const PALETTE = new PhyllotaxisPalette(PALETTE_SIZE);

class Pen {
  constructor(color, capacity) {
    this.color = color;
    this.capacity = capacity;
  }
}

class PenCase {
  constructor(pen_count) {
    this.pen_count = pen_count;
    this.pens = new Array(pen_count);
    this.history = [];
    for (let i = 0; i < pen_count; i++) {
      this.pens[i] = new Pen(PALETTE.get_color(i), 100);
    }
    this.next_pen = pen_count;
  }

  update() {
    const next_pens = new Array(this.pen_count);
    let next_index = 0;
    for (const pen of this.pens) {
      const ink_usage = 40.0 * Math.random();
      if (pen.capacity - ink_usage >= 0) {
        next_pens[next_index] = new Pen(pen.color, pen.capacity - ink_usage);
        next_index++;
      }
    }

    while (next_index < this.pen_count) {
      next_pens[next_index] = new Pen(
        PALETTE.get_color(this.next_pen % PALETTE_SIZE),
        100
      );
      next_index++;
      this.next_pen++;
    }

    this.history.push(this.pens);
    this.pens = next_pens;
  }
}

export const sketch = (p) => {
  let pen_case = new PenCase(6);
  pen_case.update();

  p.setup = () => {
    p.createCanvas(500, 700);

    // Only render the background once
    p.background(0);

    p.colorMode(p.HSB, 1.0);
  };

  p.draw = () => {
    // Only render the most recent row on top of what was already rendered
    const i = pen_case.history.length - 1;
    const pens = pen_case.history[i];

    const row = i % ROW_COUNT;
    const col = Math.floor(i / ROW_COUNT);

    for (const [j, pen] of pens.entries()) {
      const c = pen.color;
      p.fill(c.hue, c.saturation, c.value);
      p.rect(
        col * (SQUARE_SIZE * pens.length + 3) + j * SQUARE_SIZE,
        row * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
      );
    }

    if (pen_case.history.length < 8 * ROW_COUNT) {
      pen_case.update();
    }
  };
};
