import { Rational } from "../Rational.js";
import { PatternGrid } from "./PatternGrid.js";
import { RhythmStep } from "./RhythmStep.js";
import { Sequential } from "./Timeline.js";

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
   * @param {string} rhythm_str String of characters from RhythmStep, i.e. x for note onset, - for sustain, . for rest. | and space can be used as separators for readability.
   * @param {Rational} step_size Duration of each step
   */
  constructor(rhythm_str, step_size) {
    this.pattern = parse_rhythm(rhythm_str, step_size);
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
    /**
     * @type {RhythmStep | undefined}
     */
    let previous = undefined;
    let is_note = undefined;
    let run_length = 0;
    for (const step of this.pattern) {
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
        yield [is_note, run_length];

        // Start a note run
        is_note = true;
        run_length = 1;
      } else if (previous !== RhythmStep.REST && step === RhythmStep.REST) {
        // Emit previous run
        yield [is_note, run_length];

        is_note = false;
        run_length = 1;
      } else {
        // all other cases, sustain the current run
        run_length++;
      }
      previous = step;
    }

    yield [is_note, run_length];
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
    return new Sequential();
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
    return new Sequential();
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
    return {
      rhythm: Rhythm.EMPTY,
      values: [],
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
    return {
      rhythm: Rhythm.EMPTY,
      values: PatternGrid.empty(),
    };
  }
}
Rhythm.EMPTY = Object.freeze(new Rhythm("", Rational.ONE));
