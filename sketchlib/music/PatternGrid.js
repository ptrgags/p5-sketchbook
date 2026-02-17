import { lcm } from "../gcd.js";
import { Rational } from "../Rational.js";
import { flatten_timeline } from "./flatten_timeline.js";
import { make_note, Melody, Note, Rest } from "./Music.js";
import { RelTimelineOps } from "./RelTimelineOps.js";
import { RhythmStep } from "./RhythmStep.js";
import { Velocity } from "./Velocity.js";

/**
 * Compute the smallest subdivision, i.e. the largest denominator in all of the
 * duration values
 * @param {import("./Music.js").Music<number>} melody
 * @return {Rational} denominator value
 */
function compute_subdivision(melody) {
  let subdivision = 1;
  for (const note_or_rest of RelTimelineOps.iter_with_gaps(melody)) {
    subdivision = lcm(subdivision, note_or_rest.duration.denominator);
  }

  return new Rational(1, subdivision);
}

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
   * @template T
   * @returns {PatternGrid<T>}
   */
  static empty() {
    return new PatternGrid([], Rational.ONE);
  }

  /**
   * Zip the beats of a rhythm together with pitch and velocity to make a melody
   * @param {PatternGrid<RhythmStep>} rhythm The rhythm to determine the length of notes
   * @param {PatternGrid<number>} pitches The pitches. There must be at least one for every beat of the rhythm. The step size of the grid is ignored.
   * @param {PatternGrid<number>} [velocities] Optional grid of velocity values. If omitted, everything will be mezzo-forte. The step size of this grid is ignored
   * @returns {import("./Music.js").Music<number>}
   */
  static zip(rhythm, pitches, velocities) {
    if (!velocities) {
      const all_mf = new Array(pitches.length).fill(Velocity.MF);
      velocities = new PatternGrid(all_mf, pitches.step_size);
    }

    if (velocities.length != pitches.length) {
      throw new Error("pitches and velocities must have the same length");
    }

    const beats = [...beat_iter_duration(rhythm)];
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
        notes.push(make_note(pitch, duration, velocity));
        next_note++;
      } else {
        notes.push(new Rest(duration));
      }
    }

    const result = new Melody(...notes);
    return flatten_timeline(result);
  }

  /**
   * Unzip a (monophonic) timeline into rhythm, pitch, and velocity. This will be quantized
   * to the smallest denominator in the score.
   * @param {import("./Music.js").Music<number>} melody The original melody
   * @returns {{
   *    rhythm: PatternGrid<RhythmStep>,
   *    pitch: PatternGrid<number>,
   *    velocity: PatternGrid<number>,
   * }} The rhythm, pitch and velocity of the melody
   */
  static unzip(melody) {
    // First, check if the melody is monophonic
    if (RelTimelineOps.num_lanes(melody) > 1) {
      throw new Error("unzip is only defined for monophonic melodies");
    }

    // First, figure out the grid subdivision
    const subdivision = compute_subdivision(melody);

    const SMALL_SUBDIVISION = new Rational(1, 128);
    if (subdivision.lt(SMALL_SUBDIVISION)) {
      console.warn("Unusual grid subdivision detected:", subdivision);
    }

    const rhythm_values = [];
    const pitch_values = [];
    const velocity_values = [];

    for (const note of RelTimelineOps.iter_with_gaps(melody)) {
      const repeat_count = note.duration.div(subdivision).numerator;
      if (note instanceof Rest) {
        // Make a pattern like .....
        const rests = new Array(repeat_count).fill(RhythmStep.REST);
        rhythm_values.push(...rests);
      } else {
        // Make a pattern like x------ where the total length is based on
        // the repeat
        const steps = new Array(repeat_count).fill(RhythmStep.SUSTAIN);
        steps[0] = RhythmStep.HIT;
        rhythm_values.push(...steps);
        pitch_values.push(note.value.pitch);
        velocity_values.push(note.value.velocity);
      }
    }

    return {
      rhythm: new PatternGrid(rhythm_values, subdivision),
      pitch: new PatternGrid(pitch_values, subdivision),
      velocity: new PatternGrid(velocity_values, subdivision),
    };
  }

  /**
   * Overlay rhythm, pitch and velocity grids to create a monophonic melody
   * @param {PatternGrid<RhythmStep>} rhythm The rhythm to determine the length of notes
   * @param {PatternGrid<number>} pitches The pitches. There must be at least one for every beat of the rhythm. The step size of the grid is ignored.
   * @param {PatternGrid<number>} [velocities] Optional grid of velocity values. If omitted, everything will be mezzo-forte. The step size of this grid is ignored
   * @returns {import("./Timeline.js").Timeline<Note<number>>} A monophonic melody
   */
  static overlay(rhythm, pitches, velocities) {
    if (!velocities) {
      const velocity_values = new Array(rhythm.length).fill(Velocity.MF);
      velocities = new PatternGrid(velocity_values, rhythm.step_size);
    }

    if (
      pitches.length !== rhythm.length ||
      velocities.length !== rhythm.length ||
      !pitches.step_size.equals(rhythm.step_size) ||
      !velocities.step_size.equals(rhythm.step_size)
    ) {
      throw new Error("grid sizes must match");
    }

    let notes = [];
    let step = 0;
    for (const [is_note, steps] of beat_iter_steps(rhythm)) {
      const duration = rhythm.step_size.mul(new Rational(steps));
      if (is_note) {
        const pitch = pitches.values[step];
        const velocity = velocities.values[step];
        notes.push(make_note(pitch, duration, velocity));
      } else {
        notes.push(new Rest(duration));
      }
      step += steps;
    }

    const result = new Melody(...notes);
    return flatten_timeline(result);
  }

  /**
   * Split the layers of a (monophonic) music into rhythm, pitch, and velocity. This will be quantized
   * to the smallest denominator in the score.
   *
   * Rests are encoded as undefined pitch/velocity
   * Sustained notes have constant pitch/velocity
   * @param {import("./Timeline.js").Timeline<Note>} melody The original melody
   * @returns {{
   *    rhythm: PatternGrid<RhythmStep>,
   *    pitch: PatternGrid<number | undefined>,
   *    velocity: PatternGrid<number | undefined>,
   * }} The rhythm, pitch and velocity of the melody
   */
  static deoverlay(melody) {
    // First, check if the melody is monophonic
    if (RelTimelineOps.num_lanes(melody) > 1) {
      throw new Error("unzip is only defined for monophonic melodies");
    }

    // First, figure out the grid subdivision
    const subdivision = compute_subdivision(melody);

    const SMALL_SUBDIVISION = new Rational(1, 128);
    if (subdivision.lt(SMALL_SUBDIVISION)) {
      console.warn("Unusual grid subdivision detected:", subdivision);
    }

    const rhythm_values = [];
    const pitch_values = [];
    const velocity_values = [];

    for (const note of RelTimelineOps.iter_with_gaps(melody)) {
      const step_count = note.duration.div(subdivision).numerator;
      if (note instanceof Rest) {
        // Make a pattern like .....
        const rests = new Array(step_count).fill(RhythmStep.REST);
        rhythm_values.push(...rests);

        // We don't have pitch or rhythm information, so store undefined in
        // each step
        const values = new Array(step_count);
        pitch_values.push(...values);
        velocity_values.push(...values);
      } else {
        // Make a pattern like x------ where the total length is based on
        // the repeat
        const steps = new Array(step_count).fill(RhythmStep.SUSTAIN);
        steps[0] = RhythmStep.HIT;
        rhythm_values.push(...steps);

        const pitches = new Array(step_count).fill(note.value.pitch);
        pitch_values.push(...pitches);

        const velocities = new Array(step_count).fill(note.value.velocity);
        velocity_values.push(...velocities);
      }
    }

    return {
      rhythm: new PatternGrid(rhythm_values, subdivision),
      pitch: new PatternGrid(pitch_values, subdivision),
      velocity: new PatternGrid(velocity_values, subdivision),
    };
  }

  /**
   * Take two patterns and merge them together
   * @template A
   * @template B
   * @template C
   * @param {PatternGrid<A>} a
   * @param {PatternGrid<B>} b
   * @param {function(A, B): C} merge_func
   * @returns {PatternGrid<C>}
   */
  static merge(a, b, merge_func) {
    return PatternGrid.empty();
  }
}
