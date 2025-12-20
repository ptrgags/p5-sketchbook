import { describe, it, expect } from "vitest";
import { ImageFrames } from "./ImageFrames.js";
import { Point } from "../../pga2d/objects.js";
import { PGA_MATCHERS } from "../../pga2d/pga_matchers.js";

expect.extend(PGA_MATCHERS);

describe("ImageFrames", () => {
  it("Throws for frame size not evenly divisible", () => {
    expect(() => {
      return new ImageFrames(new Direction(10, 10), new Direction(3, 7));
    }).toThrowError("must be divisible by");
  });

  it("computes frame offset correctly", () => {
    // Dimensions of a character sprite sheet for 16x16 tiles and characters
    // two cells tall
    const frames = new ImageFrames(
      new Direction(64, 128),
      new Direction(16, 32)
    );
    // second row, third column
    const frame_id = 6;

    const result = frames.get_frame_offset(frame_id);

    const expected = new Direction(32, 32);
    expect(result).toBePoint(expected);
  });
});
