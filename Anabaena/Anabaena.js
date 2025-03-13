import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";

import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { Point } from "../pga2d/objects.js";
import { prevent_mobile_scroll } from "../sketchlib/prevent_mobile_scroll.js";
import { LSystem } from "./LSystem.js";
import { sec_to_frames, Tween } from "../MosaicSlider/Tween.js";
import { AnimationChain, Joint } from "../sketchlib/AnimationChain.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { CirclePrimitive, GroupPrimitive } from "../sketchlib/primitives.js";
import { Color, Style } from "../sketchlib/Style.js";

const INITIAL_POSITION = Point.point(WIDTH / 2, HEIGHT - 50);
const MIN_BEND_ANGLE = (7 * Math.PI) / 8;

const LENGTH_SHORT = 20;
const LENGTH_LONG = 40;
const DURATION_GROWTH = sec_to_frames(1);
const MAX_SYMBOLS = 100;
const MAX_SPEED = 10;

class AnabaenaCatenula {
  constructor() {
    /**
     * @type {LSystem}
     */
    this.polarized_fibonacci = new LSystem("s", {
      // lowercase letters point to the right, uppercase letters point to the left
      s: "l",
      S: "L",
      l: "Ls",
      L: "Sl",
    });
    this.current_symbols = this.polarized_fibonacci.start_symbol;

    /**
     * @type {Tween}
     */
    this.growth_tween = new Tween(
      LENGTH_SHORT,
      LENGTH_LONG,
      0,
      DURATION_GROWTH
    );

    this.chain = new AnimationChain(
      [
        new Joint(INITIAL_POSITION, 0),
        new Joint(
          INITIAL_POSITION.add(Point.DIR_Y.scale(LENGTH_SHORT)),
          LENGTH_SHORT
        ),
      ],
      MIN_BEND_ANGLE
    );
  }

  move_towards(point) {
    const nose_position = this.chain.get_joint(0).position;
    const to_point = point.sub(nose_position);

    const velocity = to_point.limit_length(MAX_SPEED);
    if (is_nearly(velocity.ideal_norm_sqr(), 0)) {
      return;
    }

    this.look_direction = velocity.normalize();
    const target = nose_position.add(velocity);
    this.chain.move(target);
  }

  update(mouse) {
    this.move_towards(mouse);
    // grow
  }

  render() {
    const positions = this.chain.get_positions();
    const circles = new Array(positions.length - 1);
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const next = positions[i];
      // for points in 2D PGA, addition gives the midpoint due to
      // normalization :D
      const mid = prev.add(next);
      const radius = prev.sub(next).ideal_norm() / 2;
      circles[i - 1] = new CirclePrimitive(mid, radius);
    }

    const color = Color.from_hex_code("#5cb28f");
    return new GroupPrimitive(circles, new Style().with_fill(color));
  }
}

const BACTERIA = new AnabaenaCatenula();

export const sketch = (p) => {
  let canvas;
  let mouse = INITIAL_POSITION;
  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;
    prevent_mobile_scroll(canvas);
  };

  p.draw = () => {
    p.background(0);

    BACTERIA.update(mouse);

    draw_primitive(p, BACTERIA.render());
  };

  p.mouseMoved = () => {
    mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
  };

  p.mouseDragged = p.mouseMoved;
};
