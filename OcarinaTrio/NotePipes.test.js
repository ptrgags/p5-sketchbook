import { describe, it, expect } from "vitest";
import { make_gate_signal } from "./NotePipes.js";
import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { Note } from "../sketchlib/music/Music.js";
import { C4 } from "../sketchlib/music/pitches.js";
import { Rational } from "../sketchlib/Rational.js";

/**
 *
 * @param {Rational} start_time
 * @param {Rational} end_time
 * @returns {AbsInterval<Note<number>>}
 */
function stub_note(start_time, end_time) {
  // the note doesn't matter here, just the timing
  return new AbsInterval(new Note(C4), start_time, end_time);
}

describe("make_gate_signal", () => {
  it("with overlapping intervals throws error", () => {
    const intervals = [
      stub_note(Rational.ZERO, Rational.ONE),
      stub_note(new Rational(1, 2), new Rational(2)),
    ];

    expect(() => {
      return make_gate_signal(intervals);
    }).toThrowError("intervals must not overlap in time");
  });
  it("with no intervals returns empty signal", () => {
    const result = make_gate_signal([]);

    const expected = [];
    expect(result).toEqual(expected);
  });

  it("with single interval returns that interval", () => {
    const intervals = [stub_note(Rational.ZERO, Rational.ONE)];

    const result = make_gate_signal(intervals);

    const expected = [new AbsInterval(1, Rational.ZERO, Rational.ONE)];
    expect(result).toEqual(expected);
  });

  it("with adjacent intervals merges them", () => {
    const intervals = [
      stub_note(Rational.ZERO, Rational.ONE),
      stub_note(Rational.ONE, new Rational(2)),
    ];

    const result = make_gate_signal(intervals);

    const expected = [new AbsInterval(1, Rational.ZERO, new Rational(2))];
    expect(result).toEqual(expected);
  });

  it("with intervals with gaps does not merge them", () => {
    const intervals = [
      stub_note(Rational.ZERO, Rational.ONE),
      stub_note(new Rational(2), new Rational(3)),
    ];

    const result = make_gate_signal(intervals);

    const expected = [
      new AbsInterval(1, Rational.ZERO, Rational.ONE),
      new AbsInterval(1, new Rational(2), new Rational(3)),
    ];
    expect(result).toEqual(expected);
  });

  it("with many intervals merges them correctly", () => {
    const intervals = [
      stub_note(Rational.ZERO, Rational.ONE),
      stub_note(Rational.ONE, new Rational(2)),
      stub_note(new Rational(4), new Rational(5)),
      stub_note(new Rational(5), new Rational(11, 2)),
    ];

    const result = make_gate_signal(intervals);

    const expected = [
      new AbsInterval(1, Rational.ZERO, new Rational(2)),
      new AbsInterval(1, new Rational(4), new Rational(11, 2)),
    ];
    expect(result).toEqual(expected);
  });
});
