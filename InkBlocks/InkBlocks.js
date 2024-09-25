import { PhyllotaxisPalette } from "../sketchlib/PhyllotaxisPalette.js";
import { FountainPen, FountainPenCase } from "./FountainPenCase.js";

const PALETTE_SIZE = 20;
const PHYLOTAXIS_PALETTE = new PhyllotaxisPalette(PALETTE_SIZE);
const PALETTE = new Array(PALETTE_SIZE);
for (let i = 0; i < PALETTE_SIZE; i++) {
  PALETTE[i] = PHYLOTAXIS_PALETTE.get_color(i);
}

const PEN_CAPACITY = 100;
const PEN_COUNT = 6;
const MAX_PEN_USAGE = 0.1 * PEN_CAPACITY;

const WIDTH = 500;
const HEIGHT = 700;
const SQUARE_SIZE = 10;
const ROW_COUNT = HEIGHT / SQUARE_SIZE;
const MAJOR_COLUMN_WIDTH = PEN_COUNT * SQUARE_SIZE;
const MAJOR_COLUMN_COUNT = Math.floor(WIDTH / MAJOR_COLUMN_WIDTH);
const MAJOR_COLUMN_SPACING =
  (WIDTH - MAJOR_COLUMN_COUNT * MAJOR_COLUMN_WIDTH) / (MAJOR_COLUMN_COUNT - 1);

const HISTORY_LENGTH = MAJOR_COLUMN_COUNT * ROW_COUNT;

function make_pens() {
  const pens = new Array(PEN_COUNT);
  for (let i = 0; i < PEN_COUNT; i++) {
    pens[i] = new FountainPen(PALETTE[i], PEN_CAPACITY);
  }
  return pens;
}

function random_ink_usage() {
  const result = new Array(PEN_COUNT);
  for (let i = 0; i < PEN_COUNT; i++) {
    result[i] = MAX_PEN_USAGE * Math.random();
  }
  return result;
}

function simulate(length) {
  const result = new Array(length);
  let pen_case = new FountainPenCase(
    make_pens(),
    PALETTE,
    PEN_CAPACITY,
    PEN_COUNT
  );
  for (let i = 0; i < length; i++) {
    result[i] = pen_case;
    const ink_usage = random_ink_usage();
    pen_case = pen_case.next_iter(ink_usage);
  }

  return result;
}

export const sketch = (p) => {
  const history = simulate(HISTORY_LENGTH);

  p.setup = () => {
    p.createCanvas(500, 700);

    // Only render the background once
    p.background(0);

    p.colorMode(p.HSB, 1.0);
  };

  p.draw = () => {
    // Once the canvas is full, we can stop
    const i = p.frameCount - 1;
    if (i >= HISTORY_LENGTH) {
      return;
    }

    // Only render the most recent row on top of what was already rendered
    const pens = history[i].pens;

    const row = i % ROW_COUNT;
    const col = Math.floor(i / ROW_COUNT);
    const column_offset = col * (MAJOR_COLUMN_WIDTH + MAJOR_COLUMN_SPACING);

    for (const [j, pen] of pens.entries()) {
      const c = pen.color;
      const fullness = pen.capacity / PEN_CAPACITY;
      p.fill(c.hue, c.saturation, fullness);
      p.rect(
        column_offset + j * SQUARE_SIZE,
        row * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
      );
    }
  };
};
