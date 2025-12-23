import { describe, it, expect } from "vitest";
import { ParamCurve } from "./ParamCurve";
import { Rational } from "../Rational";
import { Sequential } from "../music/Timeline";
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
      // lerp(100, 0, 0.25) is 25
      expect(result).toBeCloseTo(25);
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
});
