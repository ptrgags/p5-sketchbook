import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Grid, griderator } from "../sketchlib/Grid.js";
import { Color, Style } from "../sketchlib/Style.js";
import { RectPrimitive, GroupPrimitive } from "../sketchlib/primitives.js";
import { Point } from "../pga2d/objects.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { sec_to_frames, Tween } from "./Tween.js";

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

class PixelSwapPair {
  constructor(style_a, position_a, style_b, position_b, start_time, duration) {
    this.style_a = style_a;
    this.style_b = style_b;
    this.position_a = position_a;
    this.position_b = position_b;
    this.tween_ab = new Tween(
      this.position_a,
      this.position_b,
      start_time,
      duration
    );
    this.tween_ba = new Tween(
      this.position_b,
      this.position_a,
      start_time,
      duration
    );
  }

  is_done(time) {
    // The tweens have the same duration, we could use either.
    return this.tween_ab.is_done(time);
  }

  render(time) {
    const b_position = this.tween_ba.get_value(time);
    const a_position = this.tween_ab.get_value(time);

    const square_b = new RectPrimitive(b_position, STRIDE);
    const square_a = new RectPrimitive(a_position, STRIDE);

    const group_b = new GroupPrimitive([square_b], this.style_b);
    const group_a = new GroupPrimitive([square_a], this.style_a);

    // square b must be rendered before square a so the pixel we want to
    // move is on top.
    return new GroupPrimitive([group_b, group_a]);
  }
}

function select_color(index) {
  const { i, j } = index;
  const upper_half = i < ROWS / 2;
  const left_half = j < COLS / 2;

  return (upper_half << 1) | left_half;
}

class MosaicGrid {
  constructor(colors) {
    this.colors = colors;
    this.grid = new Grid(ROWS, COLS);
    this.grid.fill((index) => {
      return new MosaicPixel(select_color(index), index);
    });

    this.styles = COLORS.map((x) =>
      new Style().with_fill(x).with_stroke(new Color(0, 0, 0))
    );

    this.primitive = this.create_primitive();
  }

  create_primitive() {
    const by_colors = [[], [], [], []];
    for (const pixel of this.grid) {
      const { i, j } = pixel.index;
      const offset = Point.direction(j * SQUARE_SIZE, i * SQUARE_SIZE);
      const position = CORNER.add(offset);
      const rect = new RectPrimitive(position, STRIDE);
      by_colors[pixel.color_index].push(rect);
    }
    const color_groups = by_colors.map((x, i) => {
      return new GroupPrimitive(x, this.styles[i]);
    });
    return new GroupPrimitive(color_groups);
  }

  render() {
    return this.primitive;
  }
}

const COLORS = [
  new Color(255, 0, 0),
  new Color(0, 255, 0),
  new Color(0, 0, 255),
  new Color(255, 255, 0),
];

const MOSAIC = new MosaicGrid(COLORS);
const SWAP_PAIR = new PixelSwapPair(
  new Style().with_fill(new Color(255, 0, 255)),
  Point.point(10, 10),
  new Style().with_fill(new Color(255, 255, 255)),
  Point.point(10 + SQUARE_SIZE, 10),
  sec_to_frames(1),
  sec_to_frames(0.25)
);

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );
  };

  p.draw = () => {
    p.background(0);

    draw_primitive(p, MOSAIC.render());
    draw_primitive(p, SWAP_PAIR.render(p.frameCount));
  };
};
