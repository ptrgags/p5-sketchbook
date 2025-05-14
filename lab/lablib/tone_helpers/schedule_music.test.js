import { describe, it, expect } from "vitest";
import { N1, N2, N4 } from "../music/durations";
import { schedule_clips } from "./schedule_music";
import { Rational } from "../Rational";
import { Loop, Parallel, Sequential } from "../music/Timeline";

function stub_clip(duration, value) {
  return { duration, value };
}

describe("schedule_clips", () => {
  it("schedules single clip", () => {
    const clip = stub_clip(N1, 3);

    const result = schedule_clips(Rational.ZERO, clip);

    const expected = [[clip, "0:0", "1:0"]];
    expect(result).toEqual(expected);
  });

  it("schedules clip with offset", () => {
    const clip = stub_clip(N1, 3);
    const offset = N4;

    const result = schedule_clips(offset, clip);

    const expected = [[clip, "0:1", "1:1"]];
    expect(result).toEqual(expected);
  });

  it("schedules sequential timeline with correct timing", () => {
    const clip1 = stub_clip(N1, 1);
    const clip2 = stub_clip(N2, 2);
    const timeline = new Sequential(clip2, clip1, clip2);

    const result = schedule_clips(Rational.ZERO, timeline);

    const expected = [
      [clip2, "0:0", "0:2"],
      [clip1, "0:2", "1:2"],
      [clip2, "1:2", "2:0"],
    ];
    expect(result).toEqual(expected);
  });

  it("schedules sequential timeline with offset", () => {
    const clip1 = stub_clip(N1, 1);
    const clip2 = stub_clip(N2, 2);
    const timeline = new Sequential(clip2, clip1, clip2);
    const offset = N2;

    const result = schedule_clips(offset, timeline);

    const expected = [
      [clip2, "0:2", "1:0"],
      [clip1, "1:0", "2:0"],
      [clip2, "2:0", "2:2"],
    ];
    expect(result).toEqual(expected);
  });

  it("schedules parallel timeline", () => {
    const clip1 = stub_clip(N1, 1);
    const clip2 = stub_clip(N2, 2);
    const timeline = new Parallel(clip1, clip2, clip2);

    const result = schedule_clips(Rational.ZERO, timeline);

    const expected = [
      [clip1, "0:0", "1:0"],
      [clip2, "0:0", "0:2"],
      [clip2, "0:0", "0:2"],
    ];
    expect(result).toEqual(expected);
  });

  it("schedules loop with no repeating or cropping", () => {
    const clip = stub_clip(N2, 1);
    const loop = new Loop(N2, clip);

    const result = schedule_clips(Rational.ZERO, loop);

    const expected = [[clip, "0:0", "0:2"]];
    expect(result).toEqual(expected);
  });

  it("schedules loop that repeats exactly", () => {
    const clip = stub_clip(N1, 1);
    const repeat_four = new Loop(new Rational(4, 1), clip);

    const result = schedule_clips(Rational.ZERO, repeat_four);

    const expected = [
      [clip, "0:0", "1:0"],
      [clip, "1:0", "2:0"],
      [clip, "2:0", "3:0"],
      [clip, "3:0", "4:0"],
    ];
    expect(result).toEqual(expected);
  });

  it("schedules loop that repeats with a little extra duration", () => {
    const clip = stub_clip(N1, 1);
    // 4 + 1/2 measures = 9/2 measures
    const repeat = new Loop(new Rational(9, 2), clip);

    const result = schedule_clips(Rational.ZERO, repeat);

    const expected = [
      [clip, "0:0", "1:0"],
      [clip, "1:0", "2:0"],
      [clip, "2:0", "3:0"],
      [clip, "3:0", "4:0"],
      // extra half-clip
      [clip, "4:0", "4:2"],
    ];
    expect(result).toEqual(expected);
  });

  it("schedules cropped clip", () => {
    const long_clip = stub_clip(new Rational(10, 1), 1);
    const short_loop = new Loop(N1, long_clip);

    const result = schedule_clips(Rational.ZERO, short_loop);

    const expected = [[long_clip, "0:0", "1:0"]];
    expect(result).toEqual(expected);
  });
});
