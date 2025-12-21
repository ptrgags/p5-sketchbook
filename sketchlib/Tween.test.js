import { describe, it, expect } from "vitest";
import { frames_to_sec, sec_to_frames, Tween } from "./Tween.js";
import { PGA_MATCHERS } from "../pga2d/pga_matchers.js";
import { Point } from "../pga2d/Point.js";
import { Direction } from "../pga2d/Direction.js";

function make_tween() {
  const start_value = 2;
  const end_value = 4;
  const start_time = 5;
  const duration = 3;
  return Tween.scalar(start_value, end_value, start_time, duration);
}

expect.extend(PGA_MATCHERS);

describe("Tween", () => {
  it("end_time computes the correct time", () => {
    const tween = make_tween();

    const result = tween.end_time;

    const expected = 8;
    expect(result).toBe(expected);
  });

  describe("is_done", () => {
    it("with time before start returns false", () => {
      const tween = make_tween();
      const before_start = 0;

      const result = tween.is_done(before_start);

      expect(result).toBe(false);
    });

    it("with time in middle of animation returns false", () => {
      const tween = make_tween();
      const before_start = 0;

      const result = tween.is_done(before_start);

      expect(result).toBe(false);
    });

    it("with time exactly at end returns false", () => {
      const tween = make_tween();

      const result = tween.is_done(tween.end_time);

      expect(result).toBe(false);
    });

    it("with time after end returns true", () => {
      const tween = make_tween();
      const after_end = 10;

      const result = tween.is_done(after_end);

      expect(result).toBe(true);
    });
  });

  describe("get_value with linear tween", () => {
    it("with time before start time returns start value", () => {
      const tween = make_tween();
      const before_start = 0;

      const result = tween.get_value(before_start);

      expect(result).toBe(tween.start_value);
    });

    it("with time at start time returns start value exactly", () => {
      const tween = make_tween();

      const result = tween.get_value(tween.start_time);

      expect(result).toBe(tween.start_value);
    });

    it("with time at end time returns end value exactly", () => {
      const tween = make_tween();

      const result = tween.get_value(tween.end_time);

      expect(result).toBe(tween.end_value);
    });

    it("with time after end time returns end value exactly", () => {
      const tween = make_tween();
      const after_end = 10;

      const result = tween.get_value(after_end);

      expect(result).toBe(tween.end_value);
    });
  });

  it("restart changes times without changing values", () => {
    const tween = make_tween();
    const old_start_value = tween.start_value;
    const old_end_value = tween.end_value;
    const new_start = 20;
    const new_duration = 5;

    tween.restart(new_start, new_duration);

    expect(tween.start_value).toBe(old_start_value);
    expect(tween.end_value).toBe(old_end_value);
    expect(tween.start_time).toBe(new_start);
    expect(tween.duration).toBe(new_duration);
  });

  describe("convenience constructors", () => {
    it("Tween.scalar interpolates number", () => {
      const tween = Tween.scalar(0, 1, 4, 4);

      const result = tween.get_value(6);

      const expected = 0.5;
      expect(result).toBe(expected);
    });

    it("Tween.point interpolates points", () => {
      const tween = Tween.point(new Point(0, 1), new Point(1, 0), 4, 4);

      const result = tween.get_value(6);

      const expected = new Point(0.5, 0.5);
      expect(result).toBePoint(expected);
    });

    it("Tween.dir interpolates directions", () => {
      const tween = Tween.dir(new Direction(0, 1), new Direction(1, 0), 4, 4);

      const result = tween.get_value(6);

      const expected = new Direction(0.5, 0.5);
      expect(result).toBeDirection(expected);
    });

    it("Tween.elapsed_timer interpolates times", () => {
      const tween = Tween.elapsed_timer(10, 5);

      const result = tween.get_value(12.5);

      const expected = 2.5;
      expect(result).toBe(expected);
    });
  });
});

describe("seconds to frames", () => {
  it("one second is 60 frames", () => {
    const result = sec_to_frames(1);

    expect(result).toBe(60);
  });

  it("60 frames is one second", () => {
    const result = frames_to_sec(60);

    expect(result).toBe(1);
  });
});
