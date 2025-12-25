import { describe, it, expect } from "vitest";
import { ParamCurve } from "./ParamCurve";
import { Rational } from "../Rational";
import { Gap, Sequential } from "../music/Timeline";
import { AnimationCurve } from "./AnimationCurve";

/**
 *
 * @returns {Sequential<ParamCurve>}
 */
function make_curve() {
  return new Sequential(
    // t = 0 to t = 1
    new ParamCurve(0, 100, new Rational(1)),
    // t = 1 to t = 1.5
    new ParamCurve(100, 100, new Rational(1, 2)),
    // t = 1.5 to t = 2.5
    new ParamCurve(100, 0, new Rational(1)),
    // t = 2.5 to t = 3, jump to a different value
    new ParamCurve(2, 2, new Rational(1, 2))
  );
}

describe("AnimationCurve", () => {
  describe("value", () => {
    it("with time before start returns first value", () => {
      const curve = AnimationCurve.from_timeline(make_curve());

      const result = curve.value(-1.0);

      expect(result).toBe(0);
    });

    it("with between points interpolates correctly", () => {
      const curve = AnimationCurve.from_timeline(make_curve());

      const result = curve.value(0.75);

      expect(result).toBe(75);
    });

    it("Interpolates correctly in non-uniform time interval", () => {
      const curve = AnimationCurve.from_timeline(make_curve());

      const result = curve.value(1.75);

      // t value is (1.75 - 1.5)/(2.5 - 1.5) = 0.25/1 = 0.25
      // lerp(100, 0, 0.25) = (1 - 0.25) * 100 + 0.25 * 0 = 75
      expect(result).toBeCloseTo(75);
    });

    it("with time exactly boundary returns start of next interval", () => {
      const curve = AnimationCurve.from_timeline(make_curve());

      const result = curve.value(2.5);

      expect(result).toBe(2);
    });

    it("with time after end returns last value", () => {
      const curve = AnimationCurve.from_timeline(make_curve());

      const result = curve.value(5);

      expect(result).toBe(2);
    });
  });

  describe("from_timeline", () => {
    it("with gap at beginning holds value until first start time", () => {
      const curves = AnimationCurve.from_timeline(
        new Sequential(
          new Gap(new Rational(2)),
          new ParamCurve(5, 10, new Rational(1))
        )
      );

      // The initial gap should grab the value from the
      // first tween, which starts at 5 here.
      const before_start = curves.value(1);
      expect(before_start).toBe(5);

      // At exactly the start point, the value should be the
      // start value for the first tween
      const at_start = curves.value(2);
      expect(at_start).toBe(5);

      // Middle of the tween should work as expected
      const after_start = curves.value(2.5);
      expect(after_start).toBe(7.5);
    });

    it("with gap in middle holds values", () => {
      const curves = AnimationCurve.from_timeline(
        new Sequential(
          // t = 0 to 1 -> ramp from 5 to 10
          new ParamCurve(5, 10, Rational.ONE),
          // t = 1 to 3 -> hold at 10
          new Gap(new Rational(2)),
          // t = 3 to 4 -> ramp back down from 10 to 5
          new ParamCurve(10, 5, Rational.ONE)
        )
      );

      // 1/4 * 5 + 3/4 * 10 = 5/4 + 30/4 = 35/4 = 8.75
      const ramp_up = curves.value(0.75);
      expect(ramp_up).toBeCloseTo(8.75);

      const hold = curves.value(2);
      expect(hold).toBe(10);

      // Same value as for ramp up by symmetry
      const ramp_down = curves.value(3.25);
      expect(ramp_down).toBeCloseTo(8.75);
    });

    it("with gap at end holds last value", () => {
      const curves = AnimationCurve.from_timeline(
        new Sequential(
          new ParamCurve(10, 5, new Rational(1)),
          new Gap(new Rational(2))
        )
      );

      // (10 + 5)/2 = 15/2 = 7.5
      const before_end = curves.value(0.5);
      expect(before_end).toBeCloseTo(7.5);

      const at_end = curves.value(1);
      expect(at_end).toBeCloseTo(5);

      const after_end = curves.value(10);
      expect(after_end).toBeCloseTo(5);
    });
  });
});
