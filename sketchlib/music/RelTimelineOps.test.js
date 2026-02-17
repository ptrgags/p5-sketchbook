import { describe, it, expect } from "vitest";
import { RelTimelineOps } from "./RelTimelineOps.js";
import { Gap, Parallel, Sequential, TimeInterval } from "./Timeline.js";
import { Rational } from "../Rational.js";

describe("RelTimelineOps", () => {
  describe("iter_with_gaps", () => {
    it("with Gap returns gap", () => {
      const timeline = new Gap(Rational.ONE);

      const result = [...RelTimelineOps.iter_with_gaps(timeline)];

      const expected = [timeline];
      expect(result).toEqual(expected);
    });

    it("with TimeInterval returns interval", () => {
      const timeline = new TimeInterval(1, Rational.ONE);

      const result = [...RelTimelineOps.iter_with_gaps(timeline)];

      const expected = [timeline];
      expect(result).toEqual(expected);
    });

    it("with Sequential returns inner intervals", () => {
      const timeline = new Sequential(
        new TimeInterval(1, new Rational(1, 2)),
        new Gap(Rational.ONE),
        new TimeInterval(3, Rational.ONE),
      );

      const result = [...RelTimelineOps.iter_with_gaps(timeline)];

      const expected = [
        new TimeInterval(1, new Rational(1, 2)),
        new Gap(Rational.ONE),
        new TimeInterval(3, Rational.ONE),
      ];
      expect(result).toEqual(expected);
    });

    it("with Parallel returns inner intervals in order listed", () => {
      const timeline = new Parallel(
        new Sequential(
          new Gap(new Rational(1, 2)),
          new TimeInterval(2, new Rational(1, 2)),
        ),
        new TimeInterval(1, Rational.ONE),
      );

      const result = [...RelTimelineOps.iter_with_gaps(timeline)];

      const expected = [
        new Gap(new Rational(1, 2)),
        new TimeInterval(2, new Rational(1, 2)),
        new TimeInterval(1, Rational.ONE),
      ];
      expect(result).toEqual(expected);
    });
  });

  describe("iter_intervals", () => {
    it("with Gap yields nothing", () => {
      const timeline = new Gap(Rational.ONE);

      const result = [...RelTimelineOps.iter_intervals(timeline)];

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with TimeInterval returns interval", () => {
      const timeline = new TimeInterval(1, Rational.ONE);

      const result = [...RelTimelineOps.iter_intervals(timeline)];

      const expected = [timeline];
      expect(result).toEqual(expected);
    });

    it("with Sequential returns inner intervals", () => {
      const timeline = new Sequential(
        new TimeInterval(1, new Rational(1, 2)),
        new Gap(Rational.ONE),
        new TimeInterval(3, Rational.ONE),
      );

      const result = [...RelTimelineOps.iter_intervals(timeline)];

      const expected = [
        new TimeInterval(1, new Rational(1, 2)),
        new TimeInterval(3, Rational.ONE),
      ];
      expect(result).toEqual(expected);
    });

    it("with Parallel returns inner intervals in the order listed", () => {
      const timeline = new Parallel(
        new Sequential(
          new Gap(new Rational(1, 2)),
          new TimeInterval(2, new Rational(1, 2)),
        ),
        new TimeInterval(1, Rational.ONE),
      );

      const result = [...RelTimelineOps.iter_intervals(timeline)];

      const expected = [
        new TimeInterval(2, new Rational(1, 2)),
        new TimeInterval(1, Rational.ONE),
      ];
      expect(result).toEqual(expected);
    });
  });

  describe("smallest_subdivision", () => {});
});
