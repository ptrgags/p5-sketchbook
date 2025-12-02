import { Point } from "../../pga2d/objects.js";
import { LSystem } from "../../sketchlib/LSystem.js";
import { N16 } from "../lablib/music/durations.js";
import { map_pitch, Melody, Note, Rest, Score } from "../lablib/music/Score.js";
import { Rational } from "../lablib/Rational.js";
import { DOUBLE_HARMONIC, make_scale } from "../lablib/music/scales.js";

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

class TreePrimitiveBuilder {
  constructor() {
    this.primitives = [];
  }
}

// all notes are in scale degrees relative to middle C, this
// scale will be used to transpose everything at the end
const SCALE = make_scale(DOUBLE_HARMONIC);

// Duration of the shortest note in the score
const DUR_SHORT = N16;

// For stack commands, it's hi-lo for push lo-hi for pop
const NOTE_STACK_HI = new Note(-2, DUR_SHORT);
const NOTE_STACK_LO = new Note(-1, DUR_SHORT);
const DUR_STACK = DUR_SHORT.mul(new Rational(2));
const REST_STACK = new Rest(DUR_STACK);

// For turn commands, just a single short note. Left turn (increment angle)
// is the high note, right turn is the lower note
const NOTE_LEFT = new Note(7, DUR_SHORT);
const NOTE_RIGHT = new Note(6, DUR_SHORT);
const REST_TURN = new Rest(DUR_SHORT);

// For forward commands, the length and duration depends on the depth
// in the tree
const PITCH_FWD_START = 0;

class TreeMusicBuilder {
  /**
   * Constructor
   * @param {number} max_depth The maximum depth value in the tree
   */
  constructor(max_depth) {
    this.max_depth = max_depth;
    this.draw_notes = [];
    this.stack_notes = [];
    this.turn_notes = [];
  }

  /**
   * On a forward command, a single sustained note plays, getting shorter
   * as we get deeper in the tree. The other parts are silent
   * @param {number} depth Current depth in the tree
   */
  forward(depth) {
    // At the deepest level, the
    const duration = DUR_SHORT.mul(new Rational(this.max_depth - depth + 1));
    const pitch = PITCH_FWD_START + depth;

    this.draw_notes.push(new Note(pitch, duration));
    this.stack_notes.push(new Rest(duration));
    this.turn_notes.push(new Rest(duration));
  }

  /**
   * On a push command, play a hi-lo motif
   */
  push() {
    this.draw_notes.push(REST_STACK);
    this.stack_notes.push(NOTE_STACK_HI, NOTE_STACK_LO);
    this.turn_notes.push(REST_STACK);
  }

  /**
   * On a pop command, play a lo-hi motif
   */
  pop() {
    this.draw_notes.push(REST_STACK);
    this.stack_notes.push(NOTE_STACK_LO, NOTE_STACK_HI);
    this.turn_notes.push(REST_STACK);
  }

  /**
   * On a left turn, play a high pitch
   */
  left() {
    this.draw_notes.push(REST_TURN);
    this.stack_notes.push(REST_TURN);
    this.turn_notes.push(NOTE_LEFT);
  }

  /**
   * On a right turn, play a slightly lower pitch than the left pitch
   */
  right() {
    this.draw_notes.push(REST_TURN);
    this.stack_notes.push(REST_TURN);
    this.turn_notes.push(NOTE_RIGHT);
  }

  /**
   * Build a Score from the various parts. Call this once at the very end.
   * @returns {[string, import("../lablib/music/Score").Music<number>][]} THe musical part of the score
   */
  build() {
    // Convert from scale degrees to MIDI pitch
    const draw_part = map_pitch(SCALE, new Melody(...this.draw_notes));
    const stack_part = map_pitch(SCALE, new Melody(...this.stack_notes));
    const turn_part = map_pitch(SCALE, new Melody(...this.turn_notes));

    return [
      ["sine", draw_part],
      ["square", stack_part],
      ["poly", turn_part],
    ];
  }
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

export class AnimatedTurtleTree {
  /**
   * Constructor
   * @param {number} max_depth Maximum depth of the tree
   */
  constructor(max_depth) {
    this.max_depth = max_depth;
    this.tree_commands = TREE_LSYSTEM.iterate(max_depth)[max_depth];

    /**
     * @type {Score<number> | undefined}
     */
    this.score = undefined;
  }

  init_animation() {
    const music_builder = new TreeMusicBuilder(this.max_depth);

    let depth = 0;
    for (const c of this.tree_commands) {
      if (c === "F") {
        music_builder.forward(depth);
      } else if (c === "[") {
        music_builder.push();
        depth++;
      } else if (c === "]") {
        music_builder.pop();
        depth--;
      } else if (c === "+") {
        music_builder.left();
      } else if (c === "-") {
        music_builder.right();
      }
    }

    this.score = new Score({
      parts: music_builder.build(),
    });
  }
}
