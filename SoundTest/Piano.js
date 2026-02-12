import { Direction } from "../sketchlib/pga2d/Direction.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { MIDIPitch } from "../sketchlib/music/MIDIPitch.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { SingleOctavePiano } from "./SingleOctavePiano.js";
import { Animated } from "../sketchlib/animation/Animated.js";
import { PlayedNotes } from "./PlayedNotes.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { B4, C4 } from "../sketchlib/music/pitches.js";

/**
 * Multiple-octave piano visualization. The size and number of octaves is
 * configurable.
 */
class OldPiano {
  /**
   * Constructor
   * @param {Rectangle} bounding_rect Bounding rectangle for the whole keyboard
   * @param {number} octave_start Octave number of the leftmost (lowest) octave
   * @param {number} num_octaves How many octaves to fit in the bounding box
   */
  constructor(bounding_rect, octave_start, num_octaves) {
    /**
     * Key press counter for each pitch. On a key press, the counter goes
     * up, on a release, the counter goes down.
     * @type {number[]}
     */
    this.key_presses = new Array(128).fill(0);

    this.octave_start = octave_start;
    this.num_octaves = num_octaves;

    const { x: width, y: height } = bounding_rect.dimensions;
    const octave_width = width / num_octaves;
    const octave_dimensions = new Direction(octave_width, height);

    // Create a number of single-octave pianos
    /**
     * @type {SingleOctavePiano[]}
     */
    this.octave_pianos = new Array(this.num_octaves);
    for (let i = 0; i < num_octaves; i++) {
      const offset = bounding_rect.position.add(
        Direction.DIR_X.scale(i * octave_width),
      );
      this.octave_pianos[i] = new SingleOctavePiano(
        new Rectangle(offset, octave_dimensions),
      );
    }
  }

  /**
   * Trigger the specified key of the keyboard. Out of range values will be
   * ignored.
   * Duplicate key presses are tracked with a counter so to reset a key,
   * you need to call release() the same number of times as trigger()
   * @param {number} midi_note MIDI pitch number in [0, 127]
   */
  trigger(midi_note) {
    const octave = MIDIPitch.get_octave(midi_note);
    if (
      octave < this.octave_start ||
      octave >= this.octave_start + this.num_octaves
    ) {
      console.warn("Triggering out-of-range note", octave);
      return;
    }

    // Increment the counter
    this.key_presses[midi_note]++;

    const pitch = MIDIPitch.get_pitch_class(midi_note);
    this.octave_pianos[octave - this.octave_start].set_key(pitch, true);
  }

  /**
   * Release the specified key of the keyboard. Out-of range values will be
   * ignored
   * @param {number} midi_note MIDI pitch number in [0, 127]
   */
  release(midi_note) {
    const octave = MIDIPitch.get_octave(midi_note);
    if (
      octave < this.octave_start ||
      octave >= this.octave_start + this.num_octaves
    ) {
      console.warn("Releasing out-of-range note", midi_note);
      return;
    }

    // Decrement the counter
    this.key_presses[midi_note]--;

    if (this.key_presses[midi_note] < 0) {
      console.warn("more releases than triggers for note", midi_note);
    }

    if (this.key_presses[midi_note] <= 0) {
      // Only release the note if duplicates have been resolved
      const pitch = MIDIPitch.get_pitch_class(midi_note);
      this.octave_pianos[octave - this.octave_start].set_key(pitch, false);
    }
  }

  update(time) {}

  reset() {
    this.key_presses.fill(0);
    this.octave_pianos.forEach((x) => x.reset());
  }

  render() {
    const octave_primitives = this.octave_pianos.map((x) => x.primitive);
    return group(...octave_primitives);
  }
}

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

  update(time) {}
}
