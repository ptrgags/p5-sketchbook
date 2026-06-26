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

      const expected = 13;
      expect(result).toEqual(expected);
    });

    it("with min returns minutes component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_time("min");

      const expected = 10;
      expect(result).toEqual(expected);
    });

    it("with sec returns seconds component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_time("sec");

      const expected = 30;
      expect(result).toEqual(expected);
    });

    it("with ms returns milliseconds component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_time("ms");

      const expected = 100;
      expect(result).toEqual(expected);
    });
  });

  describe("get_discrete_angle", () => {
    it("with hr returns hour component", () => {
      const clock = make_clock();

      const result = clock.get_discrete_angle("hr");

      const expected = 13;
      expect(result).toEqual(expected);
    });

    it("with min returns minutes component", () => {
      const clock = make_clock();

      const result = clock.get_discrete_angle("min");

      const expected = 10;
      expect(result).toEqual(expected);
    });

    it("with sec returns seconds component", () => {
      const clock = make_clock();

      const result = clock.get_discrete_angle("sec");

      const expected = 30;
      expect(result).toEqual(expected);
    });

    it("with ms returns milliseconds component", () => {
      const clock = make_clock();

      const result = clock.get_discrete_angle("ms");

      const expected = 100;
      expect(result).toEqual(expected);
    });
  });

  describe("get_continuous_angle", () => {
    it("with hr returns computed hours", () => {
      const clock = make_clock();

      const result = clock.get_continuous_angle("hr");

      const expected = 13;
      expect(result).toEqual(expected);
    });

    it("with min returns minutes component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_angle("min");

      const expected = 10;
      expect(result).toEqual(expected);
    });

    it("with sec returns seconds component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_angle("sec");

      const expected = 30;
      expect(result).toEqual(expected);
    });

    it("with ms returns milliseconds component", () => {
      const clock = make_clock();

      const result = clock.get_continuous_angle("ms");

      const expected = 100;
      expect(result).toEqual(expected);
    });
  });
});
