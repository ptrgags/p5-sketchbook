import { describe, it, expect } from "vitest";
import { Primordium } from "./Primordium.js";

/**
 * Make a primordium with the specified options. Options not specified are given
 * defaults
 * @param {object} options options matching the parameter names for the Primordium constructor.
 * @returns a Primordium
 */
function make_primordium(options) {
  return new Primordium(
    options.index ?? 0,
    options.start_time ?? 0,
    options.start_size ?? 4,
    options.speed ?? 5,
    options.growth_rate ?? 10
  );
}

describe("Primordium", () => {
  describe("get_position", () => {
    it("returns undefined for times before the start time", () => {
      const primordium = make_primordium({
        start_time: 42,
      });

      const result = primordium.get_position(0);

      expect(result).toBeUndefined();
    });

    it("the result angle is proportional to the index", () => {
      const primordium = make_primordium({
        index: 4,
      });

      const some_time_later = 100;
      const { theta } = primordium.get_position(some_time_later);

      const expected_angle = 9.599853;
      expect(theta).toBeCloseTo(expected_angle);
    });

    it("the result angle stays constant", () => {
      const start_time = 10;
      const some_time_later = 50;
      const primordium = make_primordium({
        index: 7,
        start_time,
      });

      const { theta: theta1 } = primordium.get_position(start_time);
      const { theta: theta2 } = primordium.get_position(some_time_later);

      expect(theta1).toBe(theta2);
    });

    it("at the start time, the r component is 0", () => {
      const start_time = 14;
      const primordium = make_primordium({
        start_time,
      });

      const { r } = primordium.get_position(start_time);

      expect(r).toBe(0);
    });

    it("The r increases linearly with time", () => {
      const start_time = 10;
      const speed = 4;
      const primordium = make_primordium({
        start_time,
        speed,
      });

      const some_time_later = 20;
      const { r } = primordium.get_position(some_time_later);

      expect(r).toBe(40);
    });
  });

  describe("get_size", () => {
    it("returns undefined for time less than start time", () => {
      const primordium = make_primordium({
        start_time: 42,
        start_size: 10,
      });

      const result = primordium.get_size(0);

      expect(result).toBeUndefined();
    });

    it("At start_time returns the initial size", () => {
      const start_size = 10;
      const start_time = 42;
      const primordium = make_primordium({
        start_time,
        start_size,
      });

      const result = primordium.get_size(start_time);

      expect(result).toBe(start_size);
    });

    it("grows linearly after the start time", () => {
      const primordium = make_primordium({
        start_size: 10,
        start_time: 42,
        growth_rate: 10,
      });

      const five_frames_later = 47;
      const result = primordium.get_size(five_frames_later);

      const expected_size = 60;
      expect(result).toBe(expected_size);
    });
  });
});
