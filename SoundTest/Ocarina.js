import { Animated } from "../sketchlib/animation/Animated.js";
import { MIDIPitch } from "../sketchlib/music/MIDIPitch.js";
import { A, A4, F, F6 } from "../sketchlib/music/pitches.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { PlayedNotes } from "./PlayedNotes.js";

// See https://www.desmos.com/calculator/o222tjtle9 for a diagram of the
// tone hole placement

const RADIUS_BIG = 0.1;
const RADIUS_SMALL = 0.05;

/**
 * Compute the position of one of the
 * @param {number} x x-coordinate
 * @returns {number} y coordinate
 */
function right_hand(x) {
  return Math.log10(x + 0.5);
}

function dright(x) {
  // d/dx(log10(x + 0.5))
  // = 1/(x + 0.5) * 1/ln(10)
  return 1.0 / ((x + 0.5) * Math.LN10);
}

/**
 * The left hand is a rotation of the right hand position
 * @param {number} x x-coordinate
 * @returns {number} y-coordinate
 */
function left_hand(x) {
  return -Math.log10(-x + 0.5);
}

/**
 * Derivative of left_hand(x)
 * @param {number} x
 * @returns {number}
 */
function dleft(x) {
  // d/dx(-log_10(-x + 0.5))
  // = -1/(-x + 0.5) * 1/ln(10) * d/dx(-x + 0.5)
  // = 1/((0.5 - x)ln(10))
  return 1.0 / ((0.5 - x) * Math.LN10);
}

const SUBHOLE_OFFSET = 0.16;
const FINGER_HOLES_UV = [
  // four main finger holes for left hand
  new Circle(new Point(-0.8, left_hand(-0.8)), RADIUS_BIG),
  new Circle(new Point(-0.5, left_hand(-0.5)), RADIUS_BIG),
  new Circle(new Point(-0.2, left_hand(-0.2)), RADIUS_BIG),
  new Circle(new Point(0.1, left_hand(0.1)), RADIUS_BIG),
  // left thumb
  new Circle(new Point(-0.8, -0.7), RADIUS_BIG),
  // subhole on left finger, positioned based on the normal of
  // the log curve at the second tone hole
  new Circle(
    new Point(
      -0.5 + SUBHOLE_OFFSET * dleft(-0.5),
      left_hand(-0.5) - SUBHOLE_OFFSET,
    ),
    RADIUS_SMALL,
  ),
  // four main finger holes on right hand
  new Circle(new Point(-0.1, right_hand(-0.1)), RADIUS_BIG),
  new Circle(new Point(0.2, right_hand(0.2)), RADIUS_BIG),
  new Circle(new Point(0.5, right_hand(0.5)), RADIUS_BIG),
  new Circle(new Point(0.8, right_hand(0.8)), RADIUS_BIG),
  // right thumb
  new Circle(new Point(0.1, -0.7), RADIUS_BIG),
  // secondary hole on right finger, positioned based on the normal of the
  // log curve at the second tone hole
  new Circle(
    new Point(
      0.2 - SUBHOLE_OFFSET * dright(0.2),
      right_hand(0.2) + SUBHOLE_OFFSET,
    ),
    RADIUS_SMALL,
  ),
];

/**
 *
 * @param {string} fingering
 * @returns {boolean[]}
 */
function parse_fingering(fingering) {
  const result = [];
  for (const c of fingering) {
    if (c === "0") {
      result.push(false);
    } else if (c === "1") {
      result.push(true);
    }
    // ignore the | separator
  }
  return result;
}

/**
 * fingers are listed in the same order as abov
 * For the fingering chart, see the 12-hole C Major ocarina fingering chart
 * from STL Ocarina: https://www.stlocarina.com/pages/booklets?srsltid=AfmBOoqSZUzzSybXV95E4o_T4V_GTsT8Uh8lGWtOuwd5q72eexJYpk4e
 *
 * Chart is based on C ocarinas
 * Tenor ocarina range: [A4, F6]
 * sporano ocarina range: [A5, F7]
 * @type {boolean[][]}
 */
const FINGERING_CHART = [
  // A4
  "111111|111111",
  // A#4
  "111111|111110",
  // B4
  "111110|111111",
  // C5
  "111110|111110",
  // C#5
  "111110|111011",
  // D5
  "111110|111010",
  // D#5
  "111110|110011",
  // E5
  "111110|110010",
  // F5
  "111110|100010",
  // F#5
  "111110|001010",
  // G5
  "111110|000010",
  // G#5
  "110110|001010",
  // A5
  "110110|000010",
  // A#5
  "100110|001010",
  // B5
  "100110|000010",
  // C6
  "000110|000010",
  // C#6
  "000100|001010",
  // D6
  "000100|000010",
  // D#6
  "000100|001000",
  // E6
  "000100|000000",
  // F6
  "000000|000000",
].map(parse_fingering);
/**
 * @type {boolean[]}
 */
const NO_HOLES = new Array(12).fill(false);

/**
 *
 * @param {Rectangle} bounding_rect
 * @returns
 */
function position_tone_holes(bounding_rect) {
  const dimensions = bounding_rect.dimensions;

  // Usually dimensions will be square, but just to be safe, take the smallest
  // dimension
  const radius_scale = Math.min(dimensions.x, dimensions.y);

  return FINGER_HOLES_UV.map((circle) => {
    const { center: center_uv, radius: radius_uv } = circle;
    const center_screen = bounding_rect.position.add(
      center_uv.to_direction().mul_components(dimensions),
    );
    const radius_screen = radius_uv * radius_scale;
    return new Circle(center_screen, radius_screen);
  });
}

/**
 * @implements {Animated}
 */
export class Ocarina {
  /**
   * Constructor
   * @param {Rectangle} bounding_rect Bounding rectangle, usually a square
   * @param {PlayedNotes} score_notes
   * @param {number} start_octave Octave of the lowest note, an A4
   */
  constructor(bounding_rect, score_notes, start_octave) {
    this.bounding_rect = bounding_rect;
    this.score_notes = score_notes;
    this.start_note = MIDIPitch.from_pitch_octave(A, start_octave);
    this.end_note = MIDIPitch.from_pitch_octave(F, start_octave + 2);

    if (score_notes.pitch_range) {
      const [min_pitch, max_pitch] = score_notes.pitch_range;
      if (min_pitch < this.start_note || max_pitch > this.end_note) {
        console.warn(
          "score_notes has pitches out of range, these will be ignored",
        );
      }
    }

    const tone_holes = position_tone_holes(bounding_rect);
    this.primitive = new ShowHidePrimitive(tone_holes, NO_HOLES);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const pitch_set = this.score_notes.get_held_pitches(time);

    if (pitch_set.size > 1) {
      throw new Error("polyphonic scores not supported");
    }

    const [pitch] = [...pitch_set];

    const index = pitch - this.start_note;
    const fingering = FINGERING_CHART[index] ?? NO_HOLES;
    this.primitive.show_flags = fingering;
  }

  /**
   *
   * @param {[number, number]} pitch_range (min_pitch, max_pitch)
   * @returns {number | undefined}
   */
  static check_compatibility(pitch_range) {
    const [min_pitch, max_pitch] = pitch_range;

    // If the range is too big, it's definitely not
    // compatible
    if (max_pitch - min_pitch > F6 - A4) {
      return undefined;
    }

    // bass = A3 to F5
    // alto/tenor = A3 to F6
    for (let octave = 3; octave <= 5; octave++) {
      const start = MIDIPitch.from_pitch_octave(A, octave);
      const end = MIDIPitch.from_pitch_octave(F, octave + 2);

      if (min_pitch >= start && max_pitch <= end) {
        return octave;
      }
    }

    // not compatible
    return undefined;
  }
}
