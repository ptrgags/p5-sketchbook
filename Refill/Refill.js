import { fix_mouse_coords } from "../common/fix_mouse_coords.js";
import { in_bounds } from "../common/in_bounds.js";
import { Index2D, Grid } from "../sketchlib/Grid.js";
import { METER_WIDTH, METER_HEIGHT, Meter } from "./Meter.js";

const WIDTH = 500;
const HEIGHT = 700;

const GRID_SIZE = 4;
const SPACING_X_PX = 20;
const SPACING_Y_PX = 30;
const OFFSET_X =
  (WIDTH - GRID_SIZE * (METER_WIDTH + SPACING_X_PX)) / 2 + SPACING_X_PX / 2;
const OFFSET_Y =
  (HEIGHT - GRID_SIZE * (METER_HEIGHT + SPACING_Y_PX)) / 2 + SPACING_Y_PX / 2;

function init_meters(meters) {
  meters.fill((index) => {
    const { i, j } = index;
    const y = OFFSET_Y + i * (METER_HEIGHT + SPACING_Y_PX);
    const x = OFFSET_X + j * (METER_WIDTH + SPACING_X_PX);
    return new Meter(x, y);
  });
}

export const sketch = (p) => {
  let canvas;

  const state = {
    meters: new Grid(GRID_SIZE, GRID_SIZE),
  };

  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;
    init_meters(state.meters);
  };

  p.draw = () => {
    p.background(0);

    for (const [i, meter] of state.meters.entries()) {
      meter.draw(p);

      // Progressively start draining meters, adding one more meter
      // after the time it takes to completely drain the meter.
      const DRAIN_RATE = 1;
      const DRAIN_PERIOD = 256 / DRAIN_RATE;
      const start_frame = DRAIN_PERIOD * i;
      if (p.frameCount > start_frame) {
        meter.drain(DRAIN_RATE);
      }
    }
  };

  p.mousePressed = () => {
    const { x, y } = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    if (!in_bounds(x, y, WIDTH, HEIGHT)) {
      return true;
    }

    return false;
  };

  p.mouseReleased = () => {
    const { x, y } = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    if (!in_bounds(x, y, WIDTH, HEIGHT)) {
      return true;
    }

    const grid_row = (y - OFFSET_Y) / (METER_HEIGHT + SPACING_Y_PX);
    const grid_col = (x - OFFSET_X) / (METER_WIDTH + SPACING_X_PX);
    if (!in_bounds(grid_col, grid_row, GRID_SIZE, GRID_SIZE)) {
      return true;
    }

    const REFILL = 256;
    const meter_index = new Index2D(Math.floor(grid_row), Math.floor(grid_col));
    state.meters.get(meter_index).fill(REFILL);
    return false;
  };
};
