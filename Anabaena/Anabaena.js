import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";

import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { Point } from "../pga2d/objects.js";
import { prevent_mobile_scroll } from "../sketchlib/prevent_mobile_scroll.js";
import { LSystem } from "./LSystem.js";
import { sec_to_frames, Tween } from "../sketchlib/Tween.js";
import { AnimationChain, Joint } from "../sketchlib/AnimationChain.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { CirclePrimitive, GroupPrimitive } from "../sketchlib/primitives.js";
import { Color, Style } from "../sketchlib/Style.js";

const INITIAL_POSITION = Point.point(WIDTH / 2, HEIGHT - 50);
const MIN_BEND_ANGLE = (7 * Math.PI) / 8;

const LENGTH_SHORT = 20;
const LENGTH_LONG = 2 * LENGTH_SHORT;
const DURATION_GROWTH = sec_to_frames(1);
const MAX_SYMBOLS = 100;
const MAX_SPEED = 10;

const COLOR_CELL_S = Color.from_hex_code("#4cbac0");
const COLOR_CELL_L = Color.from_hex_code("#5cb28f");
const STYLE_CELL_S = new Style()
  .with_fill(COLOR_CELL_S)
  .with_stroke(Color.BLACK);
const STYLE_CELL_L = new Style()
  .with_fill(COLOR_CELL_L)
  .with_stroke(Color.BLACK);

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
    this.growth_tween = Tween.scalar(
      LENGTH_SHORT,
      LENGTH_LONG,
      0,
      DURATION_GROWTH
    );

    // The chain will always be this.current_symbols.length + 1
    // since we add an extra joint at the front
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
    const front = this.chain.get_joint(0).position;
    const to_point = point.sub(front);

    const velocity = to_point.limit_length(MAX_SPEED);

    /*if (is_nearly(velocity.ideal_norm_sqr(), 0)) {
      return;
    }*/

    //this.look_direction = velocity.normalize();
    const target = front.add(velocity);
    this.chain.move(target);
  }

  split() {
    if (this.current_symbols.length > MAX_SYMBOLS) {
      // Limit the maximum length of the chain.
      return;
    }
    const old_symbols = this.current_symbols;
    this.current_symbols = this.polarized_fibonacci.substitute(old_symbols);

    const split_joints = [this.chain.get_joint(0)];
    for (let i = 1; i < this.chain.length; i++) {
      const old_symbol = old_symbols.charAt(i - 1);
      const old_joint = this.chain.get_joint(i);
      if (old_symbol === "s" || old_symbol === "S") {
        // Short joints mature into long joints, but keep the same length,
        // so we can just reuse the joint
        split_joints.push(old_joint);
      } else {
        // l and L cases.
        // split a long cell into a short cell and a long cell. However,
        // at the instant the cells split, the cells have the same length
        // so as far as the animation chain is concerned, we don't need to
        // distinguish them yet.
        const prev_position = this.chain.get_joint(i - 1).position;
        const position = old_joint.position;
        const midpoint = prev_position.add(position);

        // Even though in terms of the grammar, one of these is an l joint
        // and one is an s joint, for the frame where the cells split, these
        // have the same length.
        split_joints.push(new Joint(midpoint, LENGTH_SHORT));
        split_joints.push(new Joint(position, LENGTH_SHORT));
      }
    }

    this.chain = new AnimationChain(split_joints, MIN_BEND_ANGLE);
  }

  grow(frame) {
    const long_length = this.growth_tween.get_value(frame);

    const n = this.chain.length;
    const longer_joints = new Array(n);
    longer_joints[0] = this.chain.get_joint(0);
    for (let i = 1; i < this.chain.length; i++) {
      const old_joint = this.chain.get_joint(i);
      const symbol = this.current_symbols.charAt(i - 1);
      if (symbol === "s" || symbol === "S") {
        longer_joints[i] = old_joint;
      } else {
        longer_joints[i] = new Joint(old_joint.position, long_length);
      }
    }

    this.chain = new AnimationChain(longer_joints, MIN_BEND_ANGLE);
  }

  grow_or_split(frame) {
    if (
      this.current_symbols.length > MAX_SYMBOLS &&
      this.growth_tween.is_done(frame)
    ) {
      return;
    }

    if (this.growth_tween.is_done(frame)) {
      this.split();
      this.growth_tween.restart(frame, DURATION_GROWTH);
    } else {
      this.grow(frame);
    }
  }

  update(mouse, frame) {
    this.grow_or_split(frame);
    this.move_towards(mouse);
  }

  render() {
    const positions = this.chain.get_positions();
    const circles_l = [];
    const circles_s = [];
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const symbol = this.current_symbols.charAt(i - 1);

      if (symbol === "s" || symbol === "S") {
        const midpoint = prev.add(curr);
        const radius = prev.sub(curr).ideal_norm() / 2;
        const circle = new CirclePrimitive(midpoint, radius);

        circles_s.push(circle);
      } else {
        const forward = prev.sub(curr).normalize();
        const radius = LENGTH_SHORT / 2;

        const center_offset = forward.scale(radius);

        let circle_a = new CirclePrimitive(curr.add(center_offset), radius);
        let circle_b = new CirclePrimitive(prev.sub(center_offset), radius);
        circles_l.push(circle_a, circle_b);
      }
    }

    return new GroupPrimitive([
      new GroupPrimitive(circles_l, STYLE_CELL_L),
      new GroupPrimitive(circles_s, STYLE_CELL_S),
    ]);
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

    BACTERIA.update(mouse, p.frameCount);

    draw_primitive(p, BACTERIA.render());
  };

  p.mouseMoved = () => {
    mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
  };

  p.mouseDragged = p.mouseMoved;
};
