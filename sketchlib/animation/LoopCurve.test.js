import { describe, it, expect } from "vitest";
import { Sequential } from "../music/Timeline.js";
import { Hold, ParamCurve } from "./ParamCurve.js";
import { Rational } from "../Rational.js";
import { AnimationCurve } from "./AnimationCurve.js";
import { LoopCurve } from "./LoopCurve.js";

/**
 *
 * @returns {LoopCurve}
 */
function make_loop() {
  const timeline = new Sequential(
    new ParamCurve(0, 100, new Rational(1)),
    new Hold(new Rational(2))
  );
  return LoopCurve.from_timeline(timeline);
}

describe("LoopCurve", () => {
  describe("value", () => {
    it("with time in range returns correct value", () => {
      const loop = make_loop();

      const result = loop.value(0.5);

      expect(result).toBeCloseTo(50);
    });

    it("with negative time loops correctly", () => {
      const loop = make_loop();

      // this will be in the hold portion
      const result = loop.value(-0.25);

      expect(result).toBeCloseTo(100);
    });

    it("with out of bounds time loops correctly", () => {
      const loop = make_loop();

      // two full loops + part way up the ramped portion
      const result = loop.value(6 + 0.75);

      expect(result).toBeCloseTo(75);
    });
  });
});
