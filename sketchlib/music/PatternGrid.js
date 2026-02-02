import { Rational } from "../Rational.js";
import { Melody, Note, Rest } from "./Music.js";
import { RhythmStep } from "./RhythmStep.js";
import { Velocity } from "./Velocity.js";

/**
 * @template T
 */
export class PatternGrid {
  /**
   * Constructor
   * @param {T[]} values Values for each step
   * @param {Rational} step_size The size of each step. E.g. 1/4 for quarter notes
   */
  constructor(values, step_size) {
    this.values = values;
    this.step_size = step_size;
  }

  *[Symbol.iterator]() {
    yield* this.values;
  }

  get length() {
    return this.values.length;
  }

  get duration() {
    return this.step_size.mul(new Rational(this.values.length));
  }

  /**
   *
   * @param {string} rhythm_str
   * @param {Rational} step_size
   * @returns {PatternGrid<RhythmStep>}
   */
  static rhythm(rhythm_str, step_size) {
    /**
     * @type {RhythmStep[]}
     */
    const values = [];
    for (const c of rhythm_str) {
      if (
        c === RhythmStep.HIT ||
        c === RhythmStep.REST ||
        c === RhythmStep.SUSTAIN
      ) {
        values.push(c);
      } else {
        throw new Error(`invalid rhythm, ${rhythm_str}`);
      }
    }
    return new PatternGrid(values, step_size);
  }

  /**
   * Zip the beats of a rhythm together with
   * @param {PatternGrid<RhythmStep>} rhythm The rhythm to determine the length of notes
   * @param {PatternGrid<number>} pitches The pitches. There must be at least one for every beat of the rhythm. The step size of the grid is ignored.
   * @param {PatternGrid<number>} [velocities] Optional grid of velocity values. If omitted, everything will be mezzo-forte. The step size of this grid is ignored
   * @returns {import("./Timeline.js").Timeline<Note<number>>}
   */
  static zip(rhythm, pitches, velocities) {
    if (!velocities) {
      const all_mf = new Array(pitches.length).fill(Velocity.MF);
      velocities = new PatternGrid(all_mf, pitches.step_size);
    }

    if (velocities.length != pitches.length) {
      throw new Error("pitches and velocities must have the same length");
    }

    const beats = [...beat_iter(rhythm)];
    const note_count = beats.reduce(
      (acc, [is_note]) => acc + Number(is_note),
      0,
    );

    if (note_count > pitches.length) {
      throw new Error("Not enough pitches for this rhythm");
    }

    const notes = [];
    let next_note = 0;
    for (const [is_note, duration] of beats) {
      if (is_note) {
        const pitch = pitches.values[next_note];
        const velocity = velocities.values[next_note];
        notes.push(new Note(pitch, duration, velocity));
        next_note++;
      } else {
        notes.push(new Rest(duration));
      }
    }

    return new Melody(...notes);
  }
}

/**
 * Iterate over a RhythmGrid and
 * @param {PatternGrid<RhythmStep>} rhythm
 * @returns {Generator<[boolean, Rational]>} (is_note, duration) pair.
 */
function* beat_iter(rhythm) {
  /**
   * @type {RhythmStep | undefined}
   */
  let previous = undefined;
  let is_note = undefined;
  let run_length = 0;
  for (const step of rhythm) {
    // (prev, step)
    // (undefined, rest | sustain) => start rest
    // (undefined, hit) => start a beat

    // (rest, hit) => emit run, start note
    // (hit, hit) => emit run, start note
    // (sustain, hit) => emit run, start note

    // (hit, rest) => emit run, start rest
    // (sustain, rest) | run is note => emit run, start rest

    // (rest, rest | sustain) => run_length++
    // (hit, sustain) => run_length++
    // (sustain, rest) | run is rest => run_length++
    // (sustain, sustain) => run_length++

    // If this is the first step, start a new run of note/rest.
    // Here SUSTAIN is treated like a rest since there is no note before it.
    if (previous === undefined) {
      is_note = step === RhythmStep.HIT;
      run_length = 1;
    } else if (step === RhythmStep.HIT) {
      // Emit previous run
      yield [is_note, rhythm.step_size.mul(new Rational(run_length))];

      // Start a note run
      is_note = true;
      run_length = 1;
    } else if (previous !== RhythmStep.REST && step === RhythmStep.REST) {
      // Emit previous run
      yield [is_note, rhythm.step_size.mul(new Rational(run_length))];

      is_note = false;
      run_length = 1;
    } else {
      // all other cases, sustain the current run
      run_length++;
    }
    previous = step;
  }

  yield [is_note, rhythm.step_size.mul(new Rational(run_length))];
}
