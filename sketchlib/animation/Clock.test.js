import { describe, it, expect } from "vitest";
import { Clock, StubClockSource } from "./Clock.js";

describe("Clock", () => {
  it("elapsed_time gets the time from construction in seconds", () => {
    const clock_source = new StubClockSource([0, 1000]);
    const clock = new Clock(clock_source);

    const result = clock.elapsed_time;

    const expected = 1;
    expect(result).toEqual(expected);
  });

  it("elapsed_time value updates for the current frame", () => {
    const clock_source = new StubClockSource([0, 500, 1500]);
    const clock = new Clock(clock_source);

    let result = clock.elapsed_time;
    expect(result).toBe(0.5);

    // some time later
    result = clock.elapsed_time;
    expect(result).toEqual(1.5);
  });

  it("reset resets counting", () => {
    const clock_source = new StubClockSource([0, 500, 1500]);
    const clock = new Clock(clock_source);

    // at 500ms, reset the clock
    clock.reset();
    const result = clock.elapsed_time;

    // 1.5s is 1 second after the last reset time
    expect(result).toBe(1);
  });
});
