import { describe, it, expect } from "vitest";
import { Hold, make_param, ParamCurve } from "./ParamCurve";
import { Rational } from "../Rational";
import { Gap, Sequential } from "../music/Timeline";
import { AnimationCurve } from "./AnimationCurve";
import { Tween } from "../Tween.js";

/**
 *
 * @returns {Sequential<ParamCurve>}
 */
function make_curve() {
  return new Sequential(
    // t = 0 to t = 1
    make_param(0, 100, new Rational(1)),
    // t = 1 to t = 1.5
    make_param(100, 100, new Rational(1, 2)),
    // t = 1.5 to t = 2.5
    make_param(100, 0, new Rational(1)),
    // t = 2.5 to t = 3, jump to a different value
    make_param(2, 2, new Rational(1, 2)),
  );
}

describe("AnimationCurve", () => {
  it("with no tweens throws", () => {
    expect(() => {
      return new AnimationCurve([]);
    }).toThrowError("tweens must have at least one element");
  });

  describe("duration", () => {
    it("with one tween computes the correct duration", () => {
      const curve = new AnimationCurve([Tween.scalar(0, 10, 2, 8)]);

      expect(curve.duration).toBe(8);
    });

    it("with several tweens computes correct duration", () => {
      const curve = AnimationCurve.from_timeline(make_curve());

      expect(curve.duration).toBe(3);
    });

    it("with timeline with gap computes correct duration", () => {
      const curve = AnimationCurve.from_timeline(
        new Sequential(
          make_param(0, 1, Rational.ONE),
          new Hold(new Rational(2)),
          make_param(1, 2, Rational.ONE),
        ),
      );

      expect(curve.duration).toBe(4);
    });

    it("with timeline ending in hold computes correct duration", () => {
      const curve = AnimationCurve.from_timeline(
        new Sequential(
          make_param(0, 1, Rational.ONE),
          new Hold(new Rational(2)),
        ),
      );

      expect(curve.duration).toBe(3);
    });

    it("with timeline beginning in hold computes correct duration", () => {
      const curve = AnimationCurve.from_timeline(
        new Sequential(
          new Hold(new Rational(2)),
          make_param(0, 1, Rational.ONE),
        ),
      );

      expect(curve.duration).toBe(3);
    });
  });

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
          make_param(5, 10, new Rational(1)),
        ),
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
          make_param(5, 10, Rational.ONE),
          // t = 1 to 3 -> hold at 10
          new Gap(new Rational(2)),
          // t = 3 to 4 -> ramp back down from 10 to 5
          make_param(10, 5, Rational.ONE),
        ),
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
          make_param(10, 5, new Rational(1)),
          new Gap(new Rational(2)),
        ),
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
