import { describe, it, expect } from "vitest";
import { Rational } from "../Rational.js";
import { AbsInterval, AbsParallel, AbsSequential } from "./AbsTimeline.js";

describe("AbsSequential", () => {
  it("constructor with no children sets start/end/duration to zero", () => {
    const timeline = new AbsSequential();

    expect(timeline.start_time).toEqual(Rational.ZERO);
    expect(timeline.end_time).toEqual(Rational.ZERO);
    expect(timeline.duration).toEqual(Rational.ZERO);
  });

  it("constructor with intervals with gaps throws", () => {
    expect(() => {
      return new AbsSequential(
        new AbsInterval(1, Rational.ZERO, Rational.ONE),
        new AbsInterval(2, new Rational(2), new Rational(3)),
      );
    }).toThrowError(
      "children of AbsSequential must not have any implicit gaps",
    );
  });

  it("constructor with intervals listed out of order throws", () => {
    expect(() => {
      return new AbsSequential(
        new AbsInterval(2, Rational.ONE, new Rational(2)),
        new AbsInterval(1, Rational.ZERO, Rational.ONE),
      );
    }).toThrowError(
      "children of AbsSequential must not have any implicit gaps",
    );
  });

  it("start_time returns start time of first child", () => {
    const timeline = new AbsSequential(
      new AbsInterval(1, Rational.ZERO, Rational.ONE),
      new AbsInterval(2, Rational.ONE, new Rational(2)),
      new AbsInterval(3, new Rational(2), new Rational(3)),
    );

    expect(timeline.start_time).toEqual(Rational.ZERO);
  });

  it("end_time returns end time of last child", () => {
    const timeline = new AbsSequential(
      new AbsInterval(1, Rational.ZERO, Rational.ONE),
      new AbsInterval(2, Rational.ONE, new Rational(2)),
      new AbsInterval(3, new Rational(2), new Rational(3)),
    );

    expect(timeline.end_time).toEqual(new Rational(3));
  });

  it("duration returns difference between end and start time", () => {
    const timeline = new AbsSequential(
      new AbsInterval(1, new Rational(1, 2), Rational.ONE),
      new AbsInterval(2, Rational.ONE, new Rational(2)),
      new AbsInterval(3, new Rational(2), new Rational(3)),
    );

    // 3 - 1/2 = 5/2
    expect(timeline.duration).toEqual(new Rational(5, 2));
  });
});

describe("AbsParallel", () => {
  it("constructor with no children sets start/end/duration to zero", () => {
    const timeline = new AbsParallel();

    expect(timeline.start_time).toEqual(Rational.ZERO);
    expect(timeline.end_time).toEqual(Rational.ZERO);
    expect(timeline.duration).toEqual(Rational.ZERO);
  });

  it("constructor with intervals with different start times throws error", () => {
    expect(() => {
      return new AbsParallel(
        new AbsInterval(1, Rational.ZERO, Rational.ONE),
        new AbsInterval(2, Rational.ONE, new Rational(2)),
      );
    }).toThrowError("children of AbsParallel must all start at the same time");
  });

  it("start_time returns the start time of the children", () => {
    const timeline = new AbsParallel(
      new AbsInterval(1, new Rational(1, 2), Rational.ONE),
      new AbsInterval(2, new Rational(1, 2), new Rational(2)),
    );

    expect(timeline.start_time).toEqual(new Rational(1, 2));
  });

  it("end_time returns the max end time of the children", () => {
    const timeline = new AbsParallel(
      new AbsInterval(1, Rational.ONE, new Rational(2)),
      new AbsInterval(2, Rational.ONE, new Rational(2)),
    );

    expect(timeline.end_time).toEqual(new Rational(2));
  });

  it("duration is the duration of the longest child", () => {
    const timeline = new AbsParallel(
      new AbsInterval(1, Rational.ZERO, Rational.ONE),
      new AbsInterval(2, Rational.ZERO, new Rational(2)),
    );

    expect(timeline.duration).toEqual(new Rational(2));
  });
});
