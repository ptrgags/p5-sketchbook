import { describe, it, expect } from "vitest";
import { Viewport } from "./Viewport";
import { PGA_MATCHERS } from "../../pga2d/pga_matchers";
import { Sprite } from "./Sprite";
import { ImageFrames } from "./ImageFrames";
import { Direction } from "../../pga2d/Direction";
import { Point } from "../../pga2d/Point";

expect.extend(PGA_MATCHERS);

// More padding on the left/right than top/bottom
const MARGIN = new Direction(16, 8);

// Size of a Gameboy Advance screen for nostalgia reasons.
const DIMENSIONS = new Direction(240, 160);

/**
 * @param {Point} position
 * @param {number} upscale_factor
 * @returns {Viewport}
 */
function make_viewport(position, upscale_factor) {
  return new Viewport(position, DIMENSIONS, MARGIN, upscale_factor);
}

const DIMS = new Direction(16, 32);
const IMAGE_FRAMES = new ImageFrames(DIMS, DIMS);
const ORIGIN = new Direction(0, 16);
function make_character_sprite() {
  return new Sprite(IMAGE_FRAMES, 0, 1, ORIGIN);
}

describe("Viewport", () => {
  describe("no upscale factor", () => {
    const NO_UPSCALE = 1;
    it("map_to_screen computes position in screen space", () => {
      const position = new Point(32, 48);
      const viewport = make_viewport(position, NO_UPSCALE);
      const test_point = new Point(48, 56);

      const result = viewport.map_to_screen(test_point);

      const expected = new Point(16, 8);
      expect(result).toBePoint(expected);
    });

    it("map_to_screen rounds to the nearest pixel", () => {
      const position = new Point(32, 48);
      const viewport = make_viewport(position, NO_UPSCALE);
      const test_point = new Point(47.8, 56.3);

      const result = viewport.map_to_screen(test_point);

      const expected = new Point(16, 8);
      expect(result).toBePoint(expected);
    });

    it("track_sprite with sprite in frame does not change viewport", () => {
      const position = new Point(32, 48);
      const viewport = make_viewport(position, NO_UPSCALE);
      const in_frame = new Point(50, 80);
      const sprite = make_character_sprite();

      viewport.track_sprite(in_frame, sprite);

      expect(viewport.position).toBePoint(position);
    });

    it("track_sprite with sprite within margin moves viewport moves (top left corner)", () => {
      const position = new Point(32, 48);
      const viewport = make_viewport(position, NO_UPSCALE);
      const in_corner = new Point(32, 64);
      const sprite = make_character_sprite();

      viewport.track_sprite(in_corner, sprite);

      const expected = new Point(16, 40);
      expect(viewport.position).toBePoint(expected);
    });

    it("track_sprite with sprite within margin moves viewport moves (bottom right corner)", () => {
      const position = new Point(32, 48);
      const viewport = make_viewport(position, NO_UPSCALE);
      const in_corner = new Point(256, 192);
      const sprite = make_character_sprite();

      viewport.track_sprite(in_corner, sprite);

      const expected = new Point(48, 56);
      expect(viewport.position).toBePoint(expected);
    });

    // inside margin (top left corner)
    // inside margin (bottom right corner)
    // inside margin (side)
    // outside viewport (top left)
    // outside viewport (bottom right)
    // outside viewport (side)
  });

  describe("with upscale factor", () => {
    const UPSCALE = 2;

    it("map_to_screen computes position in screen space", () => {
      const position = new Point(32, 48);
      const viewport = make_viewport(position, UPSCALE);
      const test_point = new Point(48, 56);

      const result = viewport.map_to_screen(test_point);

      const expected = new Point(32, 16);
      expect(result).toBePoint(expected);
    });

    it("map_to_screen rounds to the nearest pixel", () => {
      const position = new Point(32, 48);
      const viewport = make_viewport(position, UPSCALE);
      const test_point = new Point(47.8, 56.3);

      const result = viewport.map_to_screen(test_point);

      // (47.8 - 32) * 2 = 31.6 -> 32
      // (56.3 - 48) * 2 = 16.6 -> 17
      const expected = new Point(32, 17);
      expect(result).toBePoint(expected);
    });
  });
});
