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
  const upper_half = Number(i < ROWS / 2);
  const left_half = Number(j < COLS / 2);

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

  compute_neighbor(src_index, mouse) {
    // If the mouse didn't leave the cell, we can ignore the mouse event.
    const { x, y } = mouse;
    const mi = Math.floor((y - MARGIN_Y) / SQUARE_SIZE);
    const mj = Math.floor((x - MARGIN_X) / SQUARE_SIZE);
    const { i, j } = src_index;
    if (i === mi && j === mj) {
      return undefined;
    }

    // Look at the vector between the cell's center and the mouse.
    // Pick the closest cardinal direction and move one cell in that direction.
    const src_center = Point.point(
      MARGIN_X + (j + 0.5) * SQUARE_SIZE,
      MARGIN_Y + (i + 0.5) * SQUARE_SIZE
    );
    const to_mouse = mouse.sub(src_center);

    const abs_x = Math.abs(to_mouse.x);
    const abs_y = Math.abs(to_mouse.y);
    const is_horizontal = abs_x > abs_y;

    if (is_horizontal && to_mouse.x > 0) {
      return this.grid.right(src_index);
    } else if (is_horizontal) {
      return src_index.left();
    } else if (!is_horizontal && to_mouse.y > 0) {
      return this.grid.down(src_index);
    }

    return src_index.up();
  }

  get_style(index) {
    const color_index = this.grid.get(index);
    return this.styles[color_index];
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

const SWAP_DURATION = sec_to_frames(0.125);

class MosaicSlider {
  constructor(colors) {
    this.grid = new MosaicGrid(COLORS);
    this.state = SliderState.IDLE;

    this.src_index = undefined;
    this.dst_index = undefined;

    this.time = 0;

    this.swap_pair = undefined;
    this.mouse = Point.point(0, 0);
    this.mouse_down = false;
  }

  mouse_press(mouse) {
    this.mouse = mouse;
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

    this.src_index = new Index2D(i, j);
    this.state = SliderState.SELECTING;
  }

  mouse_drag(mouse) {
    this.mouse = mouse;
    this.mouse_down = true;

    if (this.state !== SliderState.SELECTING) {
      return;
    }

    this.dst_index = this.grid.compute_neighbor(this.src_index, mouse);

    // If the mouse moved to one of the selected cell's neighbors, start
    // the swapping animation
    if (this.dst_index) {
      const { i: src_i, j: src_j } = this.src_index;
      const { i: dst_i, j: dst_j } = this.dst_index;
      const position_a = CORNER.add(
        Point.direction(src_j * SQUARE_SIZE, src_i * SQUARE_SIZE)
      );
      const style_a = this.grid.get_style(this.src_index);
      const position_b = CORNER.add(
        Point.direction(dst_j * SQUARE_SIZE, dst_i * SQUARE_SIZE)
      );
      const style_b = this.grid.get_style(this.dst_index);
      this.swap_pair = new PixelSwapPair(
        style_a,
        position_a,
        style_b,
        position_b,
        this.time,
        SWAP_DURATION
      );
      this.grid.pop_out_pair(this.src_index, this.dst_index);
      this.state = SliderState.ANIMATING;
    }
  }

  mouse_release() {
    this.mouse = this.mouse;
    this.mouse_down = false;

    if (this.state === SliderState.SELECTING) {
      this.state = SliderState.IDLE;
    }
  }

  done_animation() {
    this.grid.pop_in_swapped_pair();
    this.swap_pair = undefined;
    if (this.mouse_down) {
      this.state = SliderState.SELECTING;
      this.src_index = this.dst_index;
      this.dst_index = undefined;
      // Simulate a mouse drag to keep the animation going.
      this.mouse_drag(this.mouse);
    } else {
      this.state = SliderState.IDLE;
      this.src_index = undefined;
      this.dst_index = undefined;
    }
  }

  update(time) {
    this.time = time;

    if (this.swap_pair && this.swap_pair.is_done(time)) {
      this.done_animation();
    }
  }

  render(time) {
    if (this.swap_pair) {
      return new GroupPrimitive([
        this.grid.render(),
        this.swap_pair.render(time),
      ]);
    }
    return this.grid.render();
  }
}

const COLORS = [
  new Color(0x23, 0x1f, 0x20),
  new Color(0xbb, 0x44, 0x30),
  new Color(0x7e, 0xbd, 0xc2),
  new Color(0xf3, 0xdf, 0xa2),
];
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

    for (let i = 0; i < 4; i++) {
      const color_picker = document.getElementById(`color-${i}`);
      color_picker.addEventListener("input", (e) => {
        // @ts-ignore
        console.log(e.target.value);
      });
    }
  };

  p.draw = () => {
    p.background(0);

    draw_primitive(p, MOSAIC.render(p.frameCount));
    //draw_primitive(p, SWAP_PAIR.render(p.frameCount));

    MOSAIC.update(p.frameCount);
  };

  p.mousePressed = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    MOSAIC.mouse_press(mouse);
  };

  p.mouseDragged = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    MOSAIC.mouse_drag(mouse);
  };

  p.mouseReleased = () => {
    MOSAIC.mouse_release();
  };
};
