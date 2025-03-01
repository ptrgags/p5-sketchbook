import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Grid, griderator } from "../sketchlib/Grid.js";
import { Color, Style } from "../sketchlib/Style.js";
import { RectPrimitive, GroupPrimitive } from "../sketchlib/primitives.js";
import { Point } from "../pga2d/objects.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";

const ROWS = 16;
const COLS = 16;

const SQUARE_SIZE = 30;
const MARGIN_X = (WIDTH - COLS * SQUARE_SIZE) / 2;
const MARGIN_Y = (HEIGHT - ROWS * SQUARE_SIZE) / 2;
const CORNER = Point.point(MARGIN_X, MARGIN_Y);
const STRIDE = Point.direction(SQUARE_SIZE, SQUARE_SIZE);

class MosaicPixel {
  constructor(color_index, index) {
    this.color_index = color_index;
    this.index = index;
  }
}

const COLORS = [
  new Color(255, 0, 0),
  new Color(0, 255, 0),
  new Color(0, 0, 255),
  new Color(255, 255, 0),
];
const STYLES = COLORS.map((x) =>
  new Style().with_fill(x).with_stroke(new Color(0, 0, 0))
);

function select_color(index) {
  const { i, j } = index;
  const upper_half = i < ROWS / 2;
  const left_half = j < COLS / 2;

  return (upper_half << 1) | left_half;
}

const GRID = new Grid(ROWS, COLS);
GRID.fill((index) => {
  return new MosaicPixel(select_color(index), index);
});

const by_colors = [[], [], [], []];
for (const pixel of GRID) {
  const { i, j } = pixel.index;
  const offset = Point.direction(j * SQUARE_SIZE, i * SQUARE_SIZE);
  const position = CORNER.add(offset);
  const rect = new RectPrimitive(position, STRIDE);
  by_colors[pixel.color_index].push(rect);
}
const color_groups = by_colors.map((x, i) => {
  return new GroupPrimitive(x, STYLES[i]);
});
const everything = new GroupPrimitive(color_groups);

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );
    console.log(everything);
  };

  p.draw = () => {
    p.background(0);

    draw_primitive(p, everything);
  };
};
