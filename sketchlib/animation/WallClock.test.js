import { describe, it, expect } from "vitest";
import { FixedTime, WallClock } from "./WallClock.js";

// oh wow, you could write today's date as 26/6/26, a palindrome. Neat.
// Let's set the time to 13:50:30.100 so all the components are different
const TEST_TIME = new Date(2026, 6, 26, 13, 10, 30, 100);

function make_clock() {
  return new WallClock(new FixedTime(TEST_TIME));
}

describe("WallClock", () => {
  describe("get_discrete_time", () => {
    it("with hr returns hour component", () => {
      const clock = make_clock();

      const result = clock.get_discrete_time("hr");

      const expected = 13;
      expect(result).toEqual(expected);
    });

    it("with min returns minutes component", () => {
      const clock = make_clock();

      const result = clock.get_discrete_time("min");

      const expected = 10;
      expect(result).toEqual(expected);
    });

    it("with sec returns seconds component", () => {
      const clock = make_clock();

      const result = clock.get_discrete_time("sec");

      const expected = 30;
      expect(result).toEqual(expected);
    });

    it("with ms returns milliseconds component", () => {
      const clock = make_clock();

      const result = clock.get_discrete_time("ms");

      const expected = 100;
      expect(result).toEqual(expected);
    });
  });

  describe("get_continuous_time", () => {
    it("with hr returns computed hours", () => {
      const clock = make_clock();

      const result = clock.get_continuous_time("hr");

      // 13 + 10 / 60 + 30 / 3600 + 100 / 3_600_000
      const expected = 13.175;
      expect(result).toBeCloseTo(expected);
    });

    it("with min returns minutes component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_time("min");

      // 13 * 60 + 10 + 30 / 60 + 100 / 60_000
      const expected = 790.502;
      expect(result).toBeCloseTo(expected);
    });

    it("with sec returns seconds component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_time("sec");

      // 13 * 3600 + 10 * 60 + 30 + 100 / 1000
      const expected = 47430.1;
      expect(result).toEqual(expected);
    });

    it("with ms returns milliseconds component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_time("ms");

      // 13 * 3_600_000 + 10 * 60_000 + 30 * 1000 + 100
      const expected = 47430100;
      expect(result).toEqual(expected);
    });
  });

  describe("get_discrete_angle", () => {
    it("with hr returns correct angle", () => {
      const clock = make_clock();

      const result = clock.get_discrete_angle("hr");

      // -pi/2 + 1 * pi/6
      // = -3pi/6 + pi/6
      // = -2pi/6
      // = -pi/3
      const expected = -Math.PI / 3;
      expect(result).toBeCloseTo(expected);
    });

    it("with min returns corrrect angle", () => {
      const clock = make_clock();

      const result = clock.get_discrete_angle("min");

      // -pi/2 + 10 * pi/30
      // = -pi/2 + pi/3
      // = -3pi/6 + 2pi/6
      // = -pi/6
      const expected = -Math.PI / 6;
      expect(result).toBeCloseTo(expected);
    });

    it("with sec returns correct angle", () => {
      const clock = make_clock();

      const result = clock.get_discrete_angle("sec");

      // -pi/2 + 30 * pi/30
      // = -pi/2 + 2pi/2
      // = pi/2
      const expected = Math.PI / 2;
      expect(result).toBeCloseTo(expected);
    });

    it("with ms returns correct angle", () => {
      const clock = make_clock();

      const result = clock.get_discrete_angle("ms");

      // -pi/2 + 100 * pi/500
      // = -pi/2 + pi/5
      // = -5pi/10 + 2pi/10
      // = -3pi/10
      const expected = (-3 * Math.PI) / 10;
      expect(result).toBeCloseTo(expected);
    });
  });

  describe("get_continuous_angle", () => {
    it("with hr returns computed hours", () => {
      const clock = make_clock();

      const result = clock.get_continuous_angle("hr");

      // okay these are annoying to compute by hand
      // time is 13.175 hr (from the continuous time tests above)
      // mod 12 is 1.175
      // -pi/2 + 1.175 * pi/6
      const expected = -Math.PI / 2 + (1.175 * Math.PI) / 6;
      expect(result).toBeCloseTo(expected);
    });

    it("with min returns minutes component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_angle("min");

      // 790.502 % 60 is around 10.502
      // -pi/2 + 10.502 * pi/30
      const expected = -Math.PI / 2 + (10.502 * Math.PI) / 30;
      expect(result).toBeCloseTo(expected);
    });

    it("with sec returns seconds component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_angle("sec");

      // 47430.1 % 60 is around 30.1
      // -pi/2 + 30.1 * pi/30
      const expected = -Math.PI / 2 + (30.1 * Math.PI) / 30;
      expect(result).toBeCloseTo(expected);
    });

    it("with ms returns milliseconds component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_angle("ms");

      // 47430100 % 1000 = 100
      // = -pi/2 + 100 * pi/500
      // = -3pi/10 like in the discrete version of the test
      const expected = (-3 * Math.PI) / 10;
      expect(result).toBeCloseTo(expected);
    });
  });
});
