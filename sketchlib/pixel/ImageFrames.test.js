import { describe, it, expect } from "vitest";
import { ImageFrames } from "./ImageFrames.js";
import { Direction } from "../pga2d/Direction.js";
import { Index2D } from "../Grid.js";
import { Rect } from "../primitives/Rect.js";
import { Point } from "../pga2d/Point.js";

describe("ImageFrames", () => {
  it("Throws for frame size not evenly divisible", () => {
    expect(() => {
      return new ImageFrames(new Direction(10, 10), new Direction(3, 7));
    }).toThrowError("must be divisible by");
  });

  it("get_frame computes frame offset correctly", () => {
    // Dimensions of a character sprite sheet for 16x16 tiles and characters
    // two cells tall
    const frame_size = new Direction(16, 32);
    const frames = new ImageFrames(new Direction(64, 128), frame_size);
    const frame_id = 6;

    const result = frames.get_frame(frame_id);

    const expected = new Rect(new Point(32, 32), frame_size);
    expect(result).toBeRect(expected);
  });

  it("get_frame_2d computes frame offset correctly", () => {
    // Dimensions of a character sprite sheet for 16x16 tiles and characters
    // two cells tall
    const frame_size = new Direction(16, 32);
    const frames = new ImageFrames(new Direction(64, 128), frame_size);
    const frame_index = new Index2D(1, 2);

    const result = frames.get_frame_2d(frame_index);

    const expected = new Rect(new Point(32, 32), frame_size);
    expect(result).toBeRect(expected);
  });
});
