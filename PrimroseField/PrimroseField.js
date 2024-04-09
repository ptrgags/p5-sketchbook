import { PrimroseTile, TILE_WIDTH, TILE_HEIGHT } from "./PrimroseTile.js";

const HEIGHT = TILE_HEIGHT;
const WIDTH = TILE_WIDTH;

let tile;

/*
 *  ______________
 * |  top         |
 * |    /   \     |
 * |______________|
 * | left | right |
 * |  /   |   \   |
 * |      |       |
 * |  \   |   /   |
 * |______|_______|
 * |  bottom      |
 * |    \   /     |
 * |______________|
 */

function top(p) {
  p.translate(WIDTH, 0);
  p.rotate(p.HALF_PI);
  p.scale(0.5, 0.5);
}

function left(p) {
  p.translate(0, HEIGHT / 4);
  p.scale(0.5, 0.5);
}

function right(p) {
  p.translate(WIDTH, (3 * HEIGHT) / 4);
  p.rotate(p.PI);
  p.scale(0.5, 0.5);
}

function bottom(p) {
  p.translate(0, HEIGHT);
  p.rotate(-p.HALF_PI);
  p.scale(0.5, 0.5);
}

const FUNCS = [top, left, right, bottom];

function draw_tiling(p, depth) {
  if (depth === 0) {
    tile.draw(p);
    return;
  }

  for (const f of FUNCS) {
    p.push();
    f(p);
    draw_tiling(p, depth - 1);
    p.pop();
  }
}

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(500, 700);
    tile = new PrimroseTile(p);
  };

  p.draw = () => {
    p.background(0);
    p.push();
    const margin_x = (500 - TILE_WIDTH) / 2;
    const margin_y = (700 - TILE_HEIGHT) / 2;
    p.translate(margin_x, margin_y);
    draw_tiling(p, 2);
    p.pop();
  };
};
