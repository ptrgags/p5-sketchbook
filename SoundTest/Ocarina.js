import { Animated } from "../sketchlib/animation/Animated.js";
import { MIDIPitch } from "../sketchlib/music/MIDIPitch.js";
import { A, F } from "../sketchlib/music/pitches.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { PlayedNotes } from "./PlayedNotes.js";

const RADIUS_BIG = 50;
const RADIUS_SMALL = 25;

const FINGER_HOLES_UV = [
  // four main finger holes for left hand
  new Circle(new Point(50, 50), RADIUS_BIG),
  new Circle(new Point(150, 50), RADIUS_BIG),
  new Circle(new Point(250, 50), RADIUS_BIG),
  new Circle(new Point(350, 50), RADIUS_BIG),
  // left thumb
  new Circle(new Point(400, 50), RADIUS_BIG),
  // secondary hole on left finger
  new Circle(new Point(450, 50), RADIUS_SMALL),
  // four main finger holes on right hand
  new Circle(new Point(50, 100), RADIUS_BIG),
  new Circle(new Point(150, 100), RADIUS_BIG),
  new Circle(new Point(250, 100), RADIUS_BIG),
  new Circle(new Point(350, 100), RADIUS_BIG),
  // right thumb
  new Circle(new Point(400, 100), RADIUS_BIG),
  // secondary hole on right finger
  new Circle(new Point(500, 100), RADIUS_SMALL),
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
 * @implements {Animated}
 */
export class Ocarina {
  /**
   *
   * @param {Rectangle} bounding_rect
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

    this.primitive = new ShowHidePrimitive(FINGER_HOLES_UV, NO_HOLES);
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
}
