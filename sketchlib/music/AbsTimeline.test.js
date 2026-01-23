import { describe, it, expect } from "vitest";
import { Rational } from "../Rational.js";
import { Gap, Parallel, Sequential } from "./Timeline.js";
import {
  AbsGap,
  AbsInterval,
  AbsParallel,
  AbsSequential,
  AbsTimelineOps,
} from "./AbsTimeline.js";

/**
 * Make an interval object for use in tests below
 * @param {Rational} duration
 * @param {number} value
 * @returns {object} An interval
 */
function stub_interval(duration, value) {
  return {
    duration,
    value,
  };
}

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

  it("iterator returns inner intervals", () => {
    const timeline = new AbsSequential(
      new AbsInterval(1, new Rational(1, 2), Rational.ONE),
      new AbsGap(Rational.ONE, new Rational(2)),
      new AbsInterval(3, new Rational(2), new Rational(3)),
    );

    const result = [...timeline];

    const expected = [
      new AbsInterval(1, new Rational(1, 2), Rational.ONE),
      new AbsInterval(3, new Rational(2), new Rational(3)),
    ];
    expect(result).toEqual(expected);
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

  it("iterator returns inner children in sorted order by start time", () => {
    const timeline = new AbsParallel(
      new AbsSequential(
        new AbsGap(Rational.ZERO, new Rational(1, 2)),
        new AbsInterval(2, new Rational(1, 2), Rational.ONE),
      ),
      new AbsInterval(1, Rational.ZERO, Rational.ONE),
    );

    const result = [...timeline];

    const expected = [
      new AbsInterval(1, Rational.ZERO, Rational.ONE),
      new AbsInterval(2, new Rational(1, 2), Rational.ONE),
    ];
    expect(result).toEqual(expected);
  });
});

describe("AbsTimelineOps", () => {
  describe("from_relative", () => {
    it("with Gap gives AbsGap", () => {
      const result = AbsTimelineOps.from_relative(
        new Gap(Rational.ONE),
        new Rational(2),
      );

      const expected = new AbsGap(new Rational(2), new Rational(3));
      expect(result).toEqual(expected);
    });

    it("With interval gives AbsInterval", () => {
      const duration = new Rational(1, 2);
      const timeline = stub_interval(duration, 3);

      const result = AbsTimelineOps.from_relative(timeline, new Rational(2));

      const expected = new AbsInterval(
        timeline,
        new Rational(2),
        new Rational(5, 2),
      );
      expect(result).toEqual(expected);
    });

    it("with offset schedules event with times offset", () => {
      const timeline = stub_interval(Rational.ONE, 3);
      const offset = new Rational(1, 4);

      const result = AbsTimelineOps.from_relative(timeline, offset);

      const expected = new AbsInterval(timeline, offset, new Rational(5, 4));
      expect(result).toEqual(expected);
    });

    it("schedules sequential timeline with correct timing", () => {
      const timeline1 = stub_interval(Rational.ONE, 1);
      const timeline2 = stub_interval(new Rational(1, 2), 2);
      const timeline = new Sequential(timeline2, timeline1, timeline2);

      const result = AbsTimelineOps.from_relative(timeline, Rational.ZERO);

      const expected = new AbsSequential(
        new AbsInterval(timeline2, Rational.ZERO, new Rational(1, 2)),
        new AbsInterval(timeline1, new Rational(1, 2), new Rational(3, 2)),
        new AbsInterval(timeline2, new Rational(3, 2), new Rational(2)),
      );
      expect(result).toEqual(expected);
    });

    it("with sequential timeline produces one event per child", () => {
      const timeline1 = stub_interval(Rational.ONE, 1);
      const timeline2 = stub_interval(new Rational(1, 2), 2);
      const timeline = new Sequential(timeline2, timeline1, timeline2);
      const offset = new Rational(1, 2);

      const result = AbsTimelineOps.from_relative(timeline, offset);

      const expected = new AbsSequential(
        new AbsInterval(timeline2, offset, Rational.ONE),
        new AbsInterval(timeline1, Rational.ONE, new Rational(2)),
        new AbsInterval(timeline2, new Rational(2), new Rational(5, 2)),
      );
      expect(result).toEqual(expected);
    });

    it("with parallel timeline produces AbsParallel with correct timing", () => {
      const timeline1 = stub_interval(Rational.ONE, 1);
      const timeline2 = stub_interval(new Rational(1, 2), 2);
      const timeline = new Parallel(timeline1, timeline2);

      const result = AbsTimelineOps.from_relative(timeline, Rational.ZERO);

      const expected = new AbsParallel(
        new AbsInterval(timeline1, Rational.ZERO, Rational.ONE),
        new AbsInterval(timeline2, Rational.ZERO, new Rational(1, 2)),
      );
      expect(result).toEqual(expected);
    });
  });

  describe("from_intervals", () => {
    it("with no intervals returns empty timeline", () => {
      const result = AbsTimelineOps.from_intervals([]);

      expect(result).toEqual(AbsGap.ZERO);
    });

    it("with single interval returns interval", () => {
      const interval = new AbsInterval(1, Rational.ZERO, Rational.ONE);

      const result = AbsTimelineOps.from_intervals([interval]);

      expect(result).toBe(interval);
    });

    it("with two intervals that meet exactly returns AbsSequential", () => {
      const intervals = [
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(2), new Rational(3)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsSequential(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(2), new Rational(3)),
      );
      expect(result).toEqual(expected);
    });

    it("with two intervals that are out of order returns AbsSequential in sorted order", () => {
      const intervals = [
        new AbsInterval(2, new Rational(2), new Rational(3)),
        new AbsInterval(1, Rational.ONE, new Rational(2)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsSequential(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(2), new Rational(3)),
      );
      expect(result).toEqual(expected);
    });

    it("with two intervals with gap in between returns AbsSequential including gap", () => {
      const intervals = [
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(3), new Rational(4)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsSequential(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsGap(new Rational(2), new Rational(3)),
        new AbsInterval(2, new Rational(3), new Rational(4)),
      );
      expect(result).toEqual(expected);
    });

    it("with two simultaneous intervals returns AbsParallel", () => {
      const intervals = [
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, Rational.ONE, new Rational(2)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsParallel(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, Rational.ONE, new Rational(2)),
      );
      expect(result).toEqual(expected);
    });

    it("with partially overlapping intervals returns AbsParallel including explicit gap", () => {
      const intervals = [
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(3, 2), new Rational(2)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsParallel(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsSequential(
          new AbsGap(Rational.ONE, new Rational(3, 2)),
          new AbsInterval(2, new Rational(3, 2), new Rational(2)),
        ),
      );
      expect(result).toEqual(expected);
    });

    it("with brick wall overlap returns AbsParallel with two lanes", () => {
      // |   |   |   |   |
      // 1-------
      //     2-------
      //         3-------
      const intervals = [
        new AbsInterval(1, Rational.ZERO, new Rational(2)),
        new AbsInterval(2, Rational.ONE, new Rational(3)),
        new AbsInterval(3, new Rational(2), new Rational(4)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      // The third interval should slot in like this:
      // |   |   |   |   |
      // 1-------3-------
      // ~~~~2-------
      const expected = new AbsParallel(
        new AbsSequential(
          new AbsInterval(1, Rational.ZERO, new Rational(2)),
          new AbsInterval(3, new Rational(2), new Rational(4)),
        ),
        new AbsSequential(
          new AbsGap(Rational.ZERO, Rational.ONE),
          new AbsInterval(2, Rational.ONE, new Rational(3)),
        ),
      );
      expect(result).toEqual(expected);
    });

    it("with three overlapping intervals returns AbsParallel with three lanes", () => {
      // |   |   |   |   |
      // 1-----------
      //     2-------
      //         3-------
      const intervals = [
        new AbsInterval(1, Rational.ZERO, new Rational(3)),
        new AbsInterval(2, Rational.ONE, new Rational(3)),
        new AbsInterval(3, new Rational(2), new Rational(4)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      // |   |   |   |   |
      // 1-----------
      // ~~~~2-------
      // ~~~~~~~~3-------
      const expected = new AbsParallel(
        new AbsInterval(1, Rational.ZERO, new Rational(3)),
        new AbsSequential(
          new AbsGap(Rational.ZERO, Rational.ONE),
          new AbsInterval(2, Rational.ONE, new Rational(3)),
        ),
        new AbsSequential(
          new AbsGap(Rational.ZERO, new Rational(2)),
          new AbsInterval(3, new Rational(2), new Rational(4)),
        ),
      );
      expected(result).toEqual(expected);
    });
  });
});
