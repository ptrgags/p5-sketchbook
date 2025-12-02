import { C } from "vitest/dist/chunks/reporters.d.C-cu31ET.js";
import { Point } from "../../pga2d/objects";
import { LSystem } from "../../sketchlib/LSystem";
import { N16 } from "../lablib/music/durations";
import { B4, C4, CS, DS, F, FS, GS } from "../lablib/music/pitches";
import { Note, Rest } from "../lablib/music/Score";
import { Rational } from "../lablib/Rational";
import { DOUBLE_HARMONIC, make_scale } from "../lablib/music/scales";

const TREE_LSYSTEM = new LSystem("Fa", {
  a: "[+Fa][-Fa]",
});

export class TurtleGraphics {
  /**
   * Constructor
   * @param {Point} position The starting point for the turtle in pixels
   * @param {number} orientation The initial orientation of the turtle as a signed multiple of delta_angle
   * @param {number} delta_angle How much the turtle rotates CCW for every + command in radians
   */
  constructor(position, orientation, delta_angle) {
    this.position = position;
    this.orientation = orientation;
    this.delta_angle = delta_angle;
    this.stack = [];
  }

  /**
   * @type {Point} A Point.direction representing the current forward direction as a unit direction
   */
  get dir_forward() {
    // Angles are measured from vertical, not horizontal
    const ANGLE_ZERO = Math.PI / 2;
    return Point.dir_from_angle(
      ANGLE_ZERO + this.delta_angle * this.orientation
    );
  }

  /**
   * Take a step forward
   * @param {number} length The length of the forward step
   */
  forward(length) {
    this.position = this.position.add(this.dir_forward.scale(length));
  }

  /**
   * Turn the turtle CCW or CW
   * @param {-1 | 1} direction 1 for CCW, -1 for CW
   */
  turn(direction) {
    this.orientation += direction;
  }

  /**
   * Get the current length of the stack
   * @type {number} The stack length
   */
  get stack_size() {
    return this.stack.length;
  }

  /**
   * Push the turtle's state to the stack
   */
  push() {
    this.stack.push([this.position, this.orientation]);
  }

  /**
   * Pop the
   */
  pop() {
    [this.position, this.orientation] = this.stack.pop();
  }
}

// Duration of the shortest note in the score
const DUR_SHORT = N16;
const DUR_TURN = DUR_SHORT;

const SCALE = make_scale(DOUBLE_HARMONIC);

const REST_TURN = new Rest(DUR_TURN);
const REST_STACK = new Rest(DUR_STACK);

// For stack commands, it's hi-lo for push lo-hi for pop
const STACK_HI = new Note(B4, DUR_SHORT);
const STACK_LO = new Note(E4, DUR_SHORT);
const DUR_STACK = DUR_SHORT.mul(new Rational(2));

class TreeMusicBuilder {
  constructor() {
    this.draw_notes = [];
    this.stack_notes = [];
    this.turn_notes = [];
  }

  forward() {}
}

class TreeAnimationBuilder {
  constructor() {
    this.static_count = [];
  }

  build() {
    return [
      ["static_prim_count", this.static_count],
      ["orientation", this.static_count],
    ];
  }
}

class TreePrimitiveBuilder {
  constructor() {
    this.primitives = [];
  }
}

export class AnimatedTurtleTree {
  /**
   * Constructor
   * @param {number} max_depth Maximum depth of the tree
   */
  constructor(max_depth) {
    this.max_depth = max_depth;
    this.tree_commands = TREE_LSYSTEM.iterate(max_depth)[max_depth];
  }

  init_animation() {
    const animation_maker = new TreeAnimationMaker();

    let depth = 0;
    for (const c of this.tree_commands) {
      if (c === "F") {
      } else if (c === "[") {
      } else if (c === "]") {
      } else if (c === "+") {
      } else if (c === "-") {
      }
    }
  }
}
