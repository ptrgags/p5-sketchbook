import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";

import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { Point } from "../pga2d/objects.js";
import { prevent_mobile_scroll } from "../sketchlib/prevent_mobile_scroll.js";
import { LSystem } from "./LSystem.js";
import { sec_to_frames, Tween } from "../sketchlib/Tween.js";
import { AnimationChain, Joint } from "../sketchlib/AnimationChain.js";
import {
  GroupPrimitive,
  LinePrimitive,
  VectorPrimitive,
} from "../sketchlib/rendering/primitives.js";
import { Style } from "../sketchlib/Style.js";
import { Color } from "../sketchlib/Color.js";

const INITIAL_POSITION = Point.point(WIDTH / 2, HEIGHT - 50);
const MIN_BEND_ANGLE = (7 * Math.PI) / 8;

const LENGTH_SHORT = 20;
const LENGTH_LONG = 2 * LENGTH_SHORT;
const LENGTH_BEFORE_SPLIT = 3 * LENGTH_SHORT;

const DURATION_GROWTH = sec_to_frames(1);
const MAX_SYMBOLS = 100;
const MAX_SPEED = 10;

// light blue
const COLOR_CELL_S = Color.from_hex_code("#4cbac0");
// dark sea green
const COLOR_CELL_L = Color.from_hex_code("#419977");
const CELL_THICKNESS = 20;
const STYLE_CELL_S = new Style({
  stroke: COLOR_CELL_S,
  width: CELL_THICKNESS,
});
const STYLE_CELL_L = new Style({
  stroke: COLOR_CELL_L,
  width: CELL_THICKNESS,
});
const STYLE_ARROW = new Style({
  stroke: Color.BLACK,
  width: 2,
});

class AnabaenaCatenula {
  constructor() {
    /**
     * @type {LSystem}
     */
    this.polarized_fibonacci = new LSystem("S", {
      // lowercase letters point to the right, uppercase letters point to the left
      s: "l",
      S: "L",
      l: "Ls",
      L: "Sl",
    });
    this.current_symbols = this.polarized_fibonacci.start_symbol;

    /**
     * Tween used for S cells that grow into L cells
     * @type {Tween<number>}
     */
    this.growth_tween = Tween.scalar(
      LENGTH_SHORT,
      LENGTH_LONG,
      0,
      DURATION_GROWTH
    );

    /**
     * Tween used for L cells that grow bigger before splitting
     */
    this.split_tween = Tween.scalar(
      LENGTH_LONG,
      LENGTH_BEFORE_SPLIT,
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

  /**
   * Grow the animation chain in between splits
   * @param {number} frame The frame number
   */
  grow(frame) {
    const short_length = this.growth_tween.get_value(frame);
    const long_length = this.split_tween.get_value(frame);

    const n = this.chain.length;
    const longer_joints = new Array(n);
    longer_joints[0] = this.chain.get_joint(0);
    for (let i = 1; i < this.chain.length; i++) {
      const old_joint = this.chain.get_joint(i);
      const symbol = this.current_symbols.charAt(i - 1);
      if (symbol === "s" || symbol === "S") {
        longer_joints[i] = new Joint(old_joint.position, short_length);
      } else {
        longer_joints[i] = new Joint(old_joint.position, long_length);
      }
    }

    this.chain = new AnimationChain(longer_joints, MIN_BEND_ANGLE);
  }

  /**
   * Depending on where we are in the simulation, either grow cells or
   * split them.
   * @param {number} frame The frame number
   */
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
      this.split_tween.restart(frame, DURATION_GROWTH);
    } else {
      this.grow(frame);
    }
  }

  /**
   * Update the simulation
   * @param {Point} mouse Mouse coordinates
   * @param {number} frame frame number
   */
  update(mouse, frame) {
    this.grow_or_split(frame);
    this.move_towards(mouse);
  }

  render(show_arrows) {
    const positions = this.chain.get_positions();
    const l_cells = [];
    const s_cells = [];
    const arrows = [];
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const symbol = this.current_symbols.charAt(i - 1);

      // Move the end points slightly apart so the result looks like distinct
      // cells
      const start = Point.lerp(prev, curr, 0.15);
      const end = Point.lerp(prev, curr, 0.85);

      const cell = new LinePrimitive(start, end);
      const cell_list = symbol === "s" || symbol === "S" ? s_cells : l_cells;
      cell_list.push(cell);

      const arrow =
        symbol === "s" || symbol === "l"
          ? new VectorPrimitive(start, end)
          : new VectorPrimitive(end, start);

      arrows.push(arrow);
    }

    const primitives = [
      new GroupPrimitive(l_cells, STYLE_CELL_L),
      new GroupPrimitive(s_cells, STYLE_CELL_S),
    ];

    if (show_arrows) {
      primitives.push(new GroupPrimitive(arrows, STYLE_ARROW));
    }

    return new GroupPrimitive(primitives);
  }
}

const BACTERIA = new AnabaenaCatenula();

export const sketch = (p) => {
  let canvas;
  let mouse = INITIAL_POSITION;
  let show_arrows = false;
  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;
    prevent_mobile_scroll(canvas);

    const checkbox = document.getElementById("arrows");
    checkbox.addEventListener("change", (e) => {
      // @ts-ignore
      show_arrows = e.target.checked;
    });
  };

  p.draw = () => {
    p.background(0);

    BACTERIA.update(mouse, p.frameCount);

    draw_primitive(p, BACTERIA.render(show_arrows));
  };

  p.mouseMoved = () => {
    mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
  };

  p.mouseDragged = p.mouseMoved;
};
