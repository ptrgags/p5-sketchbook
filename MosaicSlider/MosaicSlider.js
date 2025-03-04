import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Grid, griderator, Index2D } from "../sketchlib/Grid.js";
import { Color, Style } from "../sketchlib/Style.js";
import { RectPrimitive, GroupPrimitive } from "../sketchlib/primitives.js";
import { Point } from "../pga2d/objects.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { sec_to_frames, Tween } from "./Tween.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import { in_bounds } from "../sketchlib/in_bounds.js";

const ROWS = 16;
const COLS = 16;

const SQUARE_SIZE = 30;
const MARGIN_X = (WIDTH - COLS * SQUARE_SIZE) / 2;
const MARGIN_Y = (HEIGHT - ROWS * SQUARE_SIZE) / 2;
const CORNER = Point.point(MARGIN_X, MARGIN_Y);
const STRIDE = Point.direction(SQUARE_SIZE, SQUARE_SIZE);

class MosaicPixel {
  constructor(color_index) {
    this.color_index = color_index;
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
      return select_color(index);
    });

    this.styles = COLORS.map((x) =>
      new Style().with_fill(x).with_stroke(Color.BLACK)
    );
    // Add an additional style for hole pixels.
    this.styles.push(new Style());

    this.primitive = this.create_primitive();

    this.src_index = undefined;
    this.dst_index = undefined;
    this.src_pixel = undefined;
    this.dst_pixel = undefined;
  }

  create_primitive() {
    const by_colors = [[], [], [], [], []];
    this.grid.for_each((index, color_index) => {
      if (color_index === undefined) {
        return;
      }

      const { i, j } = index;
      const offset = Point.direction(j * SQUARE_SIZE, i * SQUARE_SIZE);
      const position = CORNER.add(offset);
      const rect = new RectPrimitive(position, STRIDE);
      by_colors[color_index].push(rect);
    });
    const color_groups = by_colors.map((x, i) => {
      return new GroupPrimitive(x, this.styles[i]);
    });
    return new GroupPrimitive(color_groups);
  }

  pop_out_pair(src, dst) {
    if (src.direction_to(dst) === undefined) {
      throw new Error("indices must be neighbors!");
    }

    this.src_index = src;
    this.dst_index = dst;
    this.src_pixel = this.grid.get(src);
    this.dst_pixel = this.grid.get(dst);

    // Replace the pixel with an undefined
    this.grid.set(src, undefined);
    this.grid.set(dst, undefined);

    this.primitive = this.create_primitive();
  }

  pop_in_swapped_pair() {
    this.grid.set(this.dst_index, this.src_pixel);
    this.grid.set(this.src_index, this.dst_pixel);

    this.src_index = undefined;
    this.dst_index = undefined;
    this.src_pixel = undefined;
    this.dst_pixel = undefined;

    this.primitive = this.create_primitive();
  }

  render() {
    return this.primitive;
  }
}

const SliderState = {
  IDLE: 0,
  SELECTING: 1,
  ANIMATING: 2,
};

class MosaicSlider {
  constructor(colors) {
    this.grid = new MosaicGrid(COLORS);
    this.state = SliderState.IDLE;

    this.swap_pair = undefined;
    this.src_index = undefined;
    this.dst_index = undefined;
    this.mouse_down = false;

    const a = new Index2D(7, 7);
    const b = new Index2D(7, 8);
    this.grid.pop_out_pair(a, b);
    this.grid.pop_in_swapped_pair();
  }

  mouse_press(mouse) {
    this.mouse_down = true;

    if (this.state !== SliderState.IDLE) {
      return;
    }

    const { x, y } = mouse;
    const j = Math.floor((x - MARGIN_X) / SQUARE_SIZE);
    const i = Math.floor((y - MARGIN_Y) / SQUARE_SIZE);
    if (!in_bounds(i, j, COLS, ROWS)) {
      return;
    }

    const index = new Index2D(i, j);
    //this.grid.set_src(index);
    //this.state = SliderState.SELECTING;
  }

  mouse_drag(mouse) {
    this.mouse_down = true;
  }

  mouse_release(mouse) {
    this.mouse_down = false;
  }

  done_animation() {
    if (this.mouse_down) {
      this.grid.set(this.src_index, this.dst);
      this.src_index;
    } else {
    }
  }

  update(time) {}

  render() {
    return this.grid.render();
  }
}

const COLORS = [
  new Color(255, 0, 0),
  new Color(0, 255, 0),
  new Color(0, 0, 255),
  new Color(255, 255, 0),
];

const SWAP_PAIR = new PixelSwapPair(
  new Style().with_fill(new Color(255, 0, 255)),
  Point.point(10, 10),
  new Style().with_fill(new Color(255, 255, 255)),
  Point.point(10 + SQUARE_SIZE, 10),
  sec_to_frames(1),
  sec_to_frames(0.25)
);

const MOSAIC = new MosaicSlider();

export const sketch = (p) => {
  let canvas;
  p.setup = () => {
    canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;
  };

  p.draw = () => {
    p.background(0);

    draw_primitive(p, MOSAIC.render());
    //draw_primitive(p, SWAP_PAIR.render(p.frameCount));
  };

  p.mousePressed = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
  };

  p.mouseDragged = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
  };

  p.mouseReleased = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
  };
};
