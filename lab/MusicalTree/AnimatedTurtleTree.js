import { LSystem } from "../../sketchlib/LSystem.js";
import { N16 } from "../lablib/music/durations.js";
import { map_pitch, Melody, Note, Rest, Score } from "../lablib/music/Score.js";
import { Rational } from "../lablib/Rational.js";
import { MAJOR_PENTATONIC, make_scale } from "../lablib/music/scales.js";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions.js";
import { Style } from "../../sketchlib/Style.js";
import { Color } from "../../sketchlib/Color.js";
import { Gap, Sequential } from "../lablib/music/Timeline.js";
import { is_nearly } from "../../sketchlib/is_nearly.js";
import { lerp } from "../../sketchlib/lerp.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../sketchlib/primitives/LinePrimitive.js";
import { PolygonPrimitive } from "../../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { whole_fract } from "../../sketchlib/whole_fract.js";
import { Point } from "../../pga2d/Point.js";
import { Direction } from "../../pga2d/Direction.js";
import { AnimationCurves } from "../lablib/animation/AnimationCurves.js";
import { ParamCurve } from "../lablib/animation/ParamCurve.js";

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
   * Get the forward direction in p5's y-down coordinate system
   * @type {Direction} A Direction representing the current forward direction as a unit direction
   */
  get dir_forward() {
    // Angles are measured from vertical, not horizontal
    const ANGLE_ZERO = -Math.PI / 2;
    return Direction.from_angle(
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

const DELTA_ANGLE = Math.PI / 5;
const START_POINT = new Point(WIDTH / 2, (3 * HEIGHT) / 4);
const MAX_LENGTH = 100;
const LENGTH_SCALE = 0.7;

class TreePrimitiveBuilder {
  constructor() {
    this.lines = [];
    this.turtle = new TurtleGraphics(START_POINT, 0, DELTA_ANGLE);
    /**
     * Keep a log of the states after every command for more accurate
     * turtle rendering on stack pops
     * @type {[Point, number][]}
     */
    this.states = [[START_POINT, 0]];
  }

  save_state() {
    this.states.push([this.turtle.position, this.turtle.orientation]);
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

    this.lines.push(new LinePrimitive(start, end));
    this.save_state();
  }

  push() {
    this.turtle.push();
    this.save_state();
  }

  pop() {
    this.turtle.pop();
    this.save_state();
  }

  left() {
    this.turtle.turn(-1);
    this.save_state();
  }

  right() {
    this.turtle.turn(1);
    this.save_state();
  }

  build() {
    return [this.lines, this.states];
  }
}

// all notes are in scale degrees relative to middle C, this
// scale will be used to transpose everything at the end
const SCALE = make_scale(MAJOR_PENTATONIC);

// Duration of the shortest note in the score
const DUR_SHORT = N16;

// For stack commands, it's hi-lo for push lo-hi for pop
const NOTE_STACK_HI = new Note(7, DUR_SHORT);
const NOTE_STACK_LO = new Note(6, DUR_SHORT);
const PAUSE_STACK = new Rest(DUR_SHORT);
const DUR_STACK = DUR_SHORT.mul(new Rational(3));
const REST_STACK = new Rest(DUR_STACK);

// For turn commands, just a single short note. Left turn (increment angle)
// is the high note, right turn is the lower note
const NOTE_LEFT = new Note(-1, DUR_SHORT);
const NOTE_RIGHT = new Note(-2, DUR_SHORT);
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
    this.stack_notes.push(NOTE_STACK_HI, NOTE_STACK_LO, PAUSE_STACK);
    this.turn_notes.push(REST_STACK);
  }

  /**
   * On a pop command, play a lo-hi motif
   */
  pop() {
    this.draw_notes.push(REST_STACK);
    this.stack_notes.push(NOTE_STACK_LO, NOTE_STACK_HI, PAUSE_STACK);
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
      ["poly", draw_part],
      ["square", stack_part],
      ["sine", turn_part],
    ];
  }
}

const GAP_STACK = new Gap(DUR_SHORT.mul(new Rational(3)));
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

    this.state_index = 0;
    this.state_curve = [];

    this.depth_curve = [];
  }

  /**
   * Advance to the next state in the list, incrementing the counter
   * @param {Rational} duration The duration for this command
   */
  increment_state(duration) {
    const increase = new ParamCurve(
      this.state_index,
      this.state_index + 1,
      duration
    );
    this.state_curve.push(increase);
    this.state_index++;
  }

  /**
   * When we step forward, increment the line count to help with
   * progressively rendering
   * @param {number} depth Current depth in the tree
   */
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
    this.increment_state(duration);
    this.depth_curve.push(gap);
  }

  /**
   * When we push a state to the stack, increment the value gradually
   * @param {number} old_depth The depth _before_ the push command
   */
  push(old_depth) {
    const increase = new ParamCurve(old_depth, old_depth + 1, DUR_STACK);

    this.line_count_curve.push(GAP_STACK);
    this.increment_state(DUR_STACK);
    this.depth_curve.push(increase);
  }

  /**
   * When we pop from the stack, decrement the value gradually
   * @param {number} old_depth The depth _before_ the pop command
   */
  pop(old_depth) {
    const decrease = new ParamCurve(old_depth, old_depth - 1, DUR_STACK);

    this.line_count_curve.push(GAP_STACK);
    this.increment_state(DUR_STACK);
    this.depth_curve.push(decrease);
  }

  left() {
    this.line_count_curve.push(GAP_TURN);
    this.increment_state(DUR_SHORT);
    this.depth_curve.push(GAP_TURN);
  }

  right() {
    this.line_count_curve.push(GAP_TURN);
    this.increment_state(DUR_SHORT);
    this.depth_curve.push(GAP_TURN);
  }

  /**
   * Build the animation part of a score
   * @returns {AnimationCurves}
   */
  build() {
    const line_count = new Sequential(...this.line_count_curve);
    const state = new Sequential(...this.state_curve);
    const depth = new Sequential(...this.depth_curve);

    return new AnimationCurves({
      line_count,
      state,
      depth,
    });
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
    /**
     * @type {[Point, number][]}
     */
    this.states = [];

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
        animation_builder.forward(depth);
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
      animation_curves: animation_builder.build(),
    });
    [this.lines, this.states] = primitive_builder.build();
  }

  /**
   * Render the tree animation
   * @param {AnimationCurves} curves The animation curves
   * @returns {GroupPrimitive}
   */
  render(curves) {
    const line_count = curves.get_curve_val("line_count");
    const [whole_lines, fract_lines] = whole_fract(line_count);

    // Render all of the lines we've already seen, and possibly one
    // partial one in the middle of a partial line
    const visible_lines = this.lines.slice(0, whole_lines);
    let tree;
    if (!is_nearly(fract_lines, 0.0)) {
      const partial_line = this.lines[whole_lines];
      const endpoint = Point.lerp(partial_line.a, partial_line.b, fract_lines);
      const interpolated = new LinePrimitive(partial_line.a, endpoint);
      tree = style([...visible_lines, interpolated], STYLE_TREE);
    } else {
      tree = style(visible_lines, STYLE_TREE);
    }

    const state_param = curves.get_curve_val("state");
    const [state_index, state_t] = whole_fract(state_param);

    let position;
    let orientation;
    if (is_nearly(state_t, 0.0)) {
      [position, orientation] = this.states[state_index];
    } else {
      const [prev_position, prev_orientation] = this.states[state_index];
      const [next_position, next_orientation] = this.states[state_index + 1];
      position = Point.lerp(prev_position, next_position, state_t);
      orientation = lerp(prev_orientation, next_orientation, state_t);
    }

    const depth = curves.get_curve_val("depth");

    const turtle = render_turtle(position, orientation);
    const stack = render_stack(position, depth);
    return group(tree, turtle, stack);
  }
}

const RADIUS_TURTLE = 10;

const STYLE_TURTLE = new Style({
  fill: Color.GREEN,
  stroke: Color.BLACK,
});

/**
 * Draw a turtle as an isoceles triangle for now.
 * @param {Point} position Point for the turtle position
 * @param {number} orientation orientation of the turtle
 */
function render_turtle(position, orientation) {
  const dir_front = Direction.from_angle(
    -Math.PI / 2 + orientation * DELTA_ANGLE
  );
  const dir_back_left = Direction.from_angle(
    -Math.PI / 2 + orientation * DELTA_ANGLE + (5 * Math.PI) / 6
  );
  const dir_back_right = Direction.from_angle(
    -Math.PI / 2 + orientation * DELTA_ANGLE - (5 * Math.PI) / 6
  );

  const polygon = new PolygonPrimitive(
    [
      position.add(dir_front.scale(RADIUS_TURTLE)),
      position.add(dir_back_left.scale(RADIUS_TURTLE)),
      position.add(dir_back_right.scale(RADIUS_TURTLE)),
    ],
    true
  );

  return style(polygon, STYLE_TURTLE);
}

const STACK_RECT_DIMENSIONS = new Direction(RADIUS_TURTLE / 2, RADIUS_TURTLE);
const OFFSET_STACK_START = new Direction(RADIUS_TURTLE + 4, -RADIUS_TURTLE / 2);
const STACK_SPACING = 2;
const OFFSET_STACK_STRIDE = Direction.DIR_X.scale(
  STACK_RECT_DIMENSIONS.x + STACK_SPACING
);

const STYLE_STACK = new Style({
  fill: Color.CYAN,
  stroke: Color.WHITE,
});

function render_stack(position, depth) {
  const whole_depth = Math.floor(depth);
  const fract_depth = depth % 1.0;

  const rects = new Array(whole_depth);
  const first_offset = position.add(OFFSET_STACK_START);
  for (let i = 0; i < whole_depth; i++) {
    rects[i] = new RectPrimitive(
      first_offset.add(OFFSET_STACK_STRIDE.scale(i)),
      STACK_RECT_DIMENSIONS
    );
  }

  if (!is_nearly(fract_depth, 0.0)) {
    const partial_rect = new RectPrimitive(
      first_offset.add(
        OFFSET_STACK_STRIDE.scale(whole_depth + (1 - fract_depth))
      ),
      STACK_RECT_DIMENSIONS
    );
    rects.push(partial_rect);
  }

  return style(rects, STYLE_STACK);
}
