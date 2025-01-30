import { fix_mouse_coords } from "../common/fix_mouse_coords.js";
import { in_bounds } from "../common/in_bounds.js";
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

function init_meters(state) {
  const meters = state.meters;
  for (let i = 0; i < GRID_SIZE; i++) {
    const y = OFFSET_Y + i * (METER_HEIGHT + SPACING_Y_PX);
    for (let j = 0; j < GRID_SIZE; j++) {
      const x = OFFSET_X + j * (METER_WIDTH + SPACING_X_PX);
      meters[i * GRID_SIZE + j] = new Meter(x, y);
    }
  }
}

export const sketch = (p) => {
  let canvas;

  const state = {
    meters: Array(GRID_SIZE * GRID_SIZE),
  };

  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;
    init_meters(state);
  };

  p.draw = () => {
    p.background(0);

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const index = i * GRID_SIZE + j;
        const meter = state.meters[index];
        meter.draw(p);

        // Progressively start draining meters, adding one more meter
        // after the time it takes to completely drain the meter.
        const DRAIN_RATE = 1;
        const DRAIN_PERIOD = 256 / DRAIN_RATE;
        const start_frame = DRAIN_PERIOD * index;
        if (p.frameCount > start_frame) {
          meter.drain(DRAIN_RATE);
        }
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

    const grid_x = (x - OFFSET_X) / (METER_WIDTH + SPACING_X_PX);
    const grid_y = (y - OFFSET_Y) / (METER_HEIGHT + SPACING_Y_PX);
    if (!in_bounds(grid_x, grid_y, GRID_SIZE, GRID_SIZE)) {
      return true;
    }

    const REFILL = 256;
    const meter_index = Math.floor(grid_y) * GRID_SIZE + Math.floor(grid_x);
    state.meters[meter_index].fill(REFILL);
    return false;
  };
};
