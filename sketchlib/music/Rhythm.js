import { Rational } from "../Rational.js";
import { PatternGrid } from "./PatternGrid.js";
import { RelTimelineOps } from "./RelTimelineOps.js";
import { RhythmStep } from "./RhythmStep.js";
import { Gap, Sequential, TimeInterval } from "./Timeline.js";

/**
 *
 * @param {string} rhythm_str
 * @param {Rational} step_size
 * @returns {PatternGrid<RhythmStep>}
 */
function parse_rhythm(rhythm_str, step_size) {
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
    } else if (c === " " || c === "|") {
      // treat spaces and | as comments to help make
      // rhythms more readable
      continue;
    } else {
      throw new Error(`invalid rhythm, ${rhythm_str}`);
    }
  }
  return new PatternGrid(values, step_size);
}

/**
 * A fancy pattern grid for representing rhythms
 * as strings like
 *
 * x.x.x.x.|xxxxx---
 *
 * if the step-size was 1/8 note, the above represents:
 * Measure 1: 4 eighth notes, one per beat
 * Measure 2: a flurry of 4 eighth notes, plus one half note (4/8 duration)
 */
export class Rhythm {
  /**
   * Constructor
   * @param {string | RhythmStep[]} rhythm String of characters from RhythmStep, i.e. x for note onset, - for sustain, . for rest. | and space can be used as separators for readability. It can also be an explicit array of RhythmStep, this is mainly used internally
   * @param {Rational} step_size Duration of each step
   */
  constructor(rhythm, step_size) {
    /**
     * @type {PatternGrid<RhythmStep>}
     */
    this.pattern =
      typeof rhythm === "string"
        ? parse_rhythm(rhythm, step_size)
        : new PatternGrid(rhythm, step_size);
  }

  get length_steps() {
    return this.pattern.length;
  }

  get length_beats() {
    // Count the number of note onsets - this is the number
    // of beats.
    return this.pattern.values
      .map((x) => Number(x === RhythmStep.HIT))
      .reduce((acc, x) => acc + x);
  }

  get duration() {
    return this.pattern.duration;
  }

  /**
   * Iterate over a RhythmGrid and return runs of rests/sustained notes.
   * This version returns the durations in steps of the rhythm grid.
   * @returns {Generator<[boolean, number]>} (is_note, duration_steps) pair.
   */
  *beat_iter() {
    const steps = [...this.pattern];

    if (steps.length === 0) {
      return;
    }

    // Scan one run of notes/rests at a time
    let next_index = 0;
    do {
      // Notes start with x. a stray sustain at the start is treated
      // as a rest.
      const is_note = steps[next_index] === RhythmStep.HIT;
      let length = 1;
      for (let j = 1; next_index + j <= steps.length; j++) {
        const lookahead = steps[next_index + j];
        if (
          // The run reaches the end of the array
          lookahead === undefined ||
          // notes continue with sustains, and end at the start
          // of a new note or a rest
          (is_note && lookahead !== RhythmStep.SUSTAIN) ||
          // rests continue through following rests or sustains
          // but end on a new hit
          (!is_note && lookahead === RhythmStep.HIT)
        ) {
          length = j;
          break;
        }
      }

      yield [is_note, length];

      next_index += length;
    } while (next_index < steps.length);
  }

  /**
   * Take the beats of this rhythm and zip them with
   * a list of values so you get TimeInterval(value, duration) | Gap(duration)
   * pairs. The result is returned as Sequential of these
   * @template T
   * @param {T[] | PatternGrid<T>} values Values to zip with. This must have at least as many values as this rhythm's number of beats. If a PatternGrid is given, the step size is ignored
   * @returns {Sequential<T>} A Sequential containing a flat array of TimeInterval and Gap
   */
  zip(values) {
    // Peel the PatternGrid to access the juicy array within...
    if (values instanceof PatternGrid) {
      values = values.values;
    }

    const beats = [...this.beat_iter()];
    const note_count = beats.reduce(
      (acc, [is_note]) => acc + Number(is_note),
      0,
    );

    if (note_count > values.length) {
      throw new Error(
        `rhythm needs at least ${note_count} values, got ${values.length}`,
      );
    }

    const intervals = [];
    let next_step = 0;
    for (const [is_note, steps] of beats) {
      const duration = new Rational(steps).mul(this.pattern.step_size);
      if (is_note) {
        intervals.push(new TimeInterval(values[next_step], duration));
        next_step++;
      } else {
        intervals.push(new Gap(duration));
      }
    }

    return new Sequential(...intervals);
  }

  /**
   * Similar to zip, this takes a rhythm and values and turns them into a timeline.
   * However, instead of zipping the values one per beat, each beat looks up the
   * value at that step. This means some values may be skipped over in the case of rests.
   *
   * This allows making step sequencers where you can have a pitch assigned for each
   * step of a sequence, yet toggle them on and off.
   * @template T
   * @param {PatternGrid<T>} values Values to overlay. It must have the same duration as the rhythm (but different step_size is allowed)
   * @returns {Sequential<T>}
   */
  overlay(values) {
    if (
      values.length !== this.pattern.length ||
      !values.step_size.equals(this.pattern.step_size)
    ) {
      throw new Error("grid sizes must match");
    }

    let notes = [];
    let step = 0;
    for (const [is_note, steps] of this.beat_iter()) {
      const duration = this.pattern.step_size.mul(new Rational(steps));
      if (is_note) {
        notes.push(new TimeInterval(values.values[step], duration));
      } else {
        notes.push(new Gap(duration));
      }
      step += steps;
    }

    return new Sequential(...notes);
  }

  /**
   * Split a timeline into a rhythm + a sequence of values, one per beat
   *
   * This is approximately an inverse of zip(), however it accepts a broader
   * range of timeline values (any single-lane timeline)
   *
   * @template T
   * @param {import("./Timeline.js").Timeline<T>} timeline Timeline of values. It must have a single lane.
   * @returns {{
   *    rhythm: Rhythm,
   *    values: T[]
   * }}
   */
  static unzip(timeline) {
    if (RelTimelineOps.num_lanes(timeline) > 1) {
      throw new Error("unzip is only defined for single-lane timelines");
    }

    // First, figure out the grid subdivision
    const subdivision = RelTimelineOps.smallest_subdivision(timeline);

    const SMALL_SUBDIVISION = new Rational(1, 128);
    if (subdivision.lt(SMALL_SUBDIVISION)) {
      console.warn("Unusual grid subdivision detected:", subdivision);
    }

    const rhythm_values = [];
    const values = [];

    for (const note of RelTimelineOps.iter_with_gaps(timeline)) {
      const repeat_count = note.duration.div(subdivision).numerator;
      if (note instanceof Gap) {
        // Make a pattern like .....
        const rests = new Array(repeat_count).fill(RhythmStep.REST);
        rhythm_values.push(...rests);
      } else {
        // Make a pattern like x------ where the total length is based on
        // the repeat
        const steps = new Array(repeat_count).fill(RhythmStep.SUSTAIN);
        steps[0] = RhythmStep.HIT;
        rhythm_values.push(...steps);

        values.push(note.value);
      }
    }

    return {
      rhythm: new Rhythm(rhythm_values, subdivision),
      values,
    };
  }

  /**
   * The sort-of-inverse of overlay, this takes a single-lane timeline and
   * splits it into a rhythm and a grid of values at the same
   * resolution (based on the finest resolution in the timeline)
   * @template T
   * @param {import("./Timeline.js").Timeline<T>} timeline
   * @returns {{
   *    rhythm: Rhythm,
   *    values: PatternGrid<T | undefined>
   * }}
   */
  static deoverlay(timeline) {
    if (RelTimelineOps.num_lanes(timeline) > 1) {
      throw new Error("deoverlay is only defined for single-lane timelines");
    }

    // First, figure out the grid subdivision
    const subdivision = RelTimelineOps.smallest_subdivision(timeline);

    const SMALL_SUBDIVISION = new Rational(1, 128);
    if (subdivision.lt(SMALL_SUBDIVISION)) {
      console.warn("Unusual grid subdivision detected:", subdivision);
    }

    const rhythm_values = [];
    const values = [];

    for (const interval of RelTimelineOps.iter_with_gaps(timeline)) {
      const step_count = interval.duration.div(subdivision).numerator;
      if (interval instanceof Gap) {
        // Make a pattern like .....
        const rests = new Array(step_count).fill(RhythmStep.REST);
        rhythm_values.push(...rests);

        // A gap doesn't have a value, so store undefineds
        values.push(...new Array(step_count));
      } else {
        // Make a pattern like x------ where the total length is based on
        // the repeat
        const steps = new Array(step_count).fill(RhythmStep.SUSTAIN);
        steps[0] = RhythmStep.HIT;
        rhythm_values.push(...steps);

        const vals = new Array(step_count).fill(interval.value);
        values.push(...vals);
      }
    }

    return {
      rhythm: new Rhythm(rhythm_values, subdivision),
      values: new PatternGrid(values, subdivision),
    };
  }
}
Rhythm.EMPTY = Object.freeze(new Rhythm("", Rational.ONE));
