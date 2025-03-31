import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/objects.js";
import { ImageFrames } from "./ImageFrames.js";
import { Sprite } from "./Sprite.js";

function make_image_frames() {
  const image_dimensions = Point.direction(64, 256);
  const frame_size = Point.direction(16, 32);
  return new ImageFrames(image_dimensions, frame_size);
}

describe("Sprite", () => {
  it("with no frames throws", () => {
    const image_frames = make_image_frames();
    expect(() => {
      return new Sprite(image_frames, 3, 0, Point.ZERO);
    }).toThrowError("frame_count must be positive");
  });

  it("with start frame out of bounds throws", () => {
    const image_frames = make_image_frames();
    const out_of_bounds = 100;

    expect(() => {
      return new Sprite(image_frames, out_of_bounds, 4, Point.ZERO);
    }).toThrowError("start frame out of bounds");
  });

  it("with frame range past end of image throws", () => {
    const image_frames = make_image_frames();
    const start_of_last_row = 28;
    const too_long = 5;

    expect(() => {
      return new Sprite(image_frames, start_of_last_row, too_long, Point.ZERO);
    }).toThrowError("animation too long");
  });

  describe("get_frame_id", () => {
    function make_sprite() {
      const image_frames = make_image_frames();
      return new Sprite(image_frames, 2, 4, Point.ZERO);
    }

    it("with integer t in range computes correct frame number", () => {
      const sprite = make_sprite();

      const result = sprite.get_frame_id(1);

      // the animation is frames [2, 3, 4, 5], so animation frame 1 is
      // image frame 3
      expect(result).toBe(3);
    });
  });

  it("from_row computes correct sprite", () => {
    const image_frames = make_image_frames();

    const result = Sprite.from_row(image_frames, 2, 2, Point.ZERO);

    const expected = new Sprite(image_frames, 8, 2, Point.ZERO);
    expect(result).toEqual(expected);
  });

  it("make_direction_animations computes correct sprites", () => {
    const image_frames = make_image_frames();

    const result = Sprite.make_direction_animations(
      image_frames,
      4,
      2,
      Point.ZERO
    );

    const expected = [
      new Sprite(image_frames, 16, 2, Point.ZERO),
      new Sprite(image_frames, 20, 2, Point.ZERO),
      new Sprite(image_frames, 24, 2, Point.ZERO),
      new Sprite(image_frames, 28, 2, Point.ZERO),
    ];
    expect(result).toEqual(expected);
  });
});
