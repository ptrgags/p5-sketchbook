import { Direction } from "../sketchlib/pga2d/Direction.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { MIDIPitch } from "../sketchlib/music/MIDIPitch.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { SingleOctavePiano } from "./SingleOctavePiano.js";
import { Animated } from "../sketchlib/animation/Animated.js";
import { PlayedNotes } from "./PlayedNotes.js";
import { B4, C4 } from "../sketchlib/music/pitches.js";

/**
 * Make enough pianos to span the note range
 * @param {Rectangle} bounding_rect
 * @param {number} num_octaves How many octaves to make
 * @return {SingleOctavePiano[]}
 */
function make_octaves(bounding_rect, num_octaves) {
  const { x: width, y: height } = bounding_rect.dimensions;
  const octave_width = width / num_octaves;
  const octave_dimensions = new Direction(octave_width, height);

  // Create a number of single-octave pianos
  const octave_pianos = new Array(num_octaves);
  for (let i = 0; i < num_octaves; i++) {
    const offset = bounding_rect.position.add(
      Direction.DIR_X.scale(i * octave_width),
    );
    octave_pianos[i] = new SingleOctavePiano(
      new Rectangle(offset, octave_dimensions),
    );
  }

  return octave_pianos;
}

/**
 * @implements {Animated}
 */
export class Piano {
  /**
   * Constructor
   * @param {Rectangle} bounding_rect Bounds for the whole piano
   * @param {PlayedNotes} score_notes The notes that will be played over time
   */
  constructor(bounding_rect, score_notes) {
    this.score_notes = score_notes;

    const [min_pitch, max_pitch] = this.score_notes.pitch_range ?? [C4, B4];
    this.min_octave = MIDIPitch.get_octave(min_pitch);
    this.max_octave = MIDIPitch.get_octave(max_pitch);

    const num_octaves = this.max_octave - this.min_octave + 1;
    this.octave_pianos = make_octaves(bounding_rect, num_octaves);

    this.primitive = group(...this.octave_pianos.map((x) => x.primitive));
  }

  /**
   * Every frame, get the currently pressed notes and update the
   * octave pianos
   * @param {number} time
   */
  update(time) {
    const held_pitches = this.score_notes.get_held_pitches(time);

    this.octave_pianos.forEach((x) => x.reset());
    for (const pitch of held_pitches) {
      const pitch_class = MIDIPitch.get_pitch_class(pitch);
      const octave = MIDIPitch.get_octave(pitch);
      this.octave_pianos[octave - this.min_octave].set_key(pitch_class, true);
    }
  }
}
