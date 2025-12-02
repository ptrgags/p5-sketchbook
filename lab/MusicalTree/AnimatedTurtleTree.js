import { Point } from "../../pga2d/objects.js";
import { LSystem } from "../../sketchlib/LSystem.js";
import { N16 } from "../lablib/music/durations.js";
import { map_pitch, Melody, Note, Rest, Score } from "../lablib/music/Score.js";
import { Rational } from "../lablib/Rational.js";
import { DOUBLE_HARMONIC, make_scale } from "../lablib/music/scales.js";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions.js";
import { LinePrimitive } from "../../sketchlib/rendering/primitives.js";
import { group, style } from "../../sketchlib/rendering/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { Color } from "../../sketchlib/Color.js";
import { Gap, Sequential } from "../lablib/music/Timeline.js";
import { ParamCurve } from "../lablib/music/ParamCurve.js";

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

const DELTA_ANGLE = Math.PI / 4;
const START_POINT = Point.point(WIDTH / 2, HEIGHT / 4);
const MAX_LENGTH = 100;
const LENGTH_SCALE = 0.7;

class TreePrimitiveBuilder {
  constructor() {
    this.primitives = [];
    this.turtle = new TurtleGraphics(START_POINT, 0, DELTA_ANGLE);
  }

  /**
   * On a forward command, add a line to the tree. The length gets
   * shorter as we move from the trunk to the leaves
   * @param {number} depth Current depth in the tree
   */
  forward(depth) {
    const start = this.turtle.position;

    const length = MAX_LENGTH * LENGTH_SCALE ** depth;
    this.turtle.forward(length);

    const end = this.turtle.position;

    this.primitives.push(new LinePrimitive(start, end));
  }

  push() {
    this.turtle.push();
  }

  pop() {
    this.turtle.pop();
  }

  left() {
    this.turtle.turn(-1);
  }

  right() {
    this.turtle.turn(1);
  }

  build() {
    return this.primitives;
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
    // At the deepest level, the note is the shortest duration. Every level
    // above that, add one short duration.
    const duration = DUR_SHORT.mul(new Rational(this.max_depth - depth + 1));
    const pitch = PITCH_FWD_START + depth;
    const rest = new Rest(duration);

    this.draw_notes.push(new Note(pitch, duration));
    this.stack_notes.push(rest);
    this.turn_notes.push(rest);
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

const GAP_STACK = new Gap(DUR_SHORT.mul(new Rational(2)));
const GAP_TURN = new Gap(DUR_SHORT);

class TreeAnimationBuilder {
  /**
   * Constructor
   * @param {number} max_depth Deepest depth of the tree
   */
  constructor(max_depth) {
    this.max_depth = max_depth;
    this.line_count_curve = [];
    this.line_count = 0;

    this.orientation = 0;
    this.orientation_curve = [];

    this.depth_curve = [];
  }

  forward(depth) {
    // same calculation as in the music builder
    const duration = DUR_SHORT.mul(new Rational(this.max_depth - depth + 1));

    const increase = new ParamCurve(
      this.line_count,
      this.line_count + 1,
      duration
    );
    this.line_count++;

    const gap = new Gap(duration);

    this.line_count_curve.push(increase);
    this.orientation_curve.push(gap);
    this.depth_curve.push(gap);
  }

  /**
   * When we push a state to the stack, increment the value gradually
   * @param {number} old_depth The depth _before_ the push command
   */
  push(old_depth) {
    const increase = new ParamCurve(old_depth, old_depth + 1, DUR_STACK);

    this.line_count_curve.push(GAP_STACK);
    this.orientation_curve.push(GAP_STACK);
    this.depth_curve.push(increase);
  }

  /**
   * When we pop from the stack, decrement the value gradually
   * @param {number} old_depth The depth _before_ the pop command
   */
  pop(old_depth) {
    const decrease = new ParamCurve(old_depth, old_depth - 1, DUR_STACK);

    this.line_count_curve.push(GAP_STACK);
    this.orientation_curve.push(GAP_STACK);
    this.depth_curve.push(decrease);
  }

  left() {
    const increase = new ParamCurve(
      this.orientation,
      this.orientation + 1,
      DUR_SHORT
    );
    this.orientation++;

    this.line_count_curve.push(GAP_TURN);
    this.orientation_curve.push(increase);
    this.depth_curve.push(GAP_TURN);
  }

  right() {
    const decrease = new ParamCurve(
      this.orientation,
      this.orientation - 1,
      DUR_SHORT
    );
    this.orientation--;

    this.line_count_curve.push(GAP_TURN);
    this.orientation_curve.push(decrease);
    this.depth_curve.push(GAP_TURN);
  }

  /**
   * Build the animation part of a score
   * @returns {[string, import("../lablib/music/Timeline.js").Timeline<ParamCurve>][]}
   */
  build() {
    const line_part = new Sequential(...this.line_count_curve);
    const orientation_part = new Sequential(...this.orientation_curve);
    const depth_part = new Sequential(...this.depth_curve);

    return [
      ["line_count", line_part],
      ["orientation", orientation_part],
      ["depth", depth_part],
    ];
  }
}

const STYLE_TREE = new Style({
  stroke: Color.YELLOW,
});

export class AnimatedTurtleTree {
  /**
   * Constructor
   * @param {number} max_depth Maximum depth of the tree
   */
  constructor(max_depth) {
    this.max_depth = max_depth;
    this.tree_commands = TREE_LSYSTEM.iterate(max_depth)[max_depth];

    // These will be populated in init_animation() via traversing the
    // list of commands
    /**
     * @type {Score<number> | undefined}
     */
    this.score = undefined;
    /**
     * @type {LinePrimitive[]}
     */
    this.lines = [];

    this.init_animation();
  }

  init_animation() {
    const music_builder = new TreeMusicBuilder(this.max_depth);
    const primitive_builder = new TreePrimitiveBuilder();
    const animation_builder = new TreeAnimationBuilder(this.max_depth);

    let depth = 0;
    for (const c of this.tree_commands) {
      if (c === "F") {
        music_builder.forward(depth);
        primitive_builder.forward(depth);
        animation_builder.forward();
      } else if (c === "[") {
        music_builder.push();
        primitive_builder.push();
        animation_builder.push(depth);
        depth++;
      } else if (c === "]") {
        music_builder.pop();
        primitive_builder.pop();
        animation_builder.pop(depth);
        depth--;
      } else if (c === "+") {
        music_builder.left();
        primitive_builder.left();
        animation_builder.left();
      } else if (c === "-") {
        music_builder.right();
        primitive_builder.right();
        animation_builder.right();
      }
    }

    this.score = new Score({
      parts: music_builder.build(),
      params: animation_builder.build(),
    });
    this.lines = primitive_builder.build();
  }

  render() {
    return style(this.lines, STYLE_TREE);
  }
}
