import { describe, it, expect } from "vitest";
import { Viewport } from "./Viewport";
import { Point } from "../../pga2d/objects";
import { PGA_MATCHERS } from "../../pga2d/pga_matchers";

expect.extend(PGA_MATCHERS);

/**
 * @param {Point} position
 * @param {number} upscale_factor
 * @returns {Viewport}
 */
function make_viewport(position, upscale_factor) {
  // More padding on the left/right than top/bottom
  const MARGIN = Point.direction(16, 8);

  // Size of a Gameboy Advance screen for nostalgia reasons.
  const DIMENSIONS = Point.direction(240, 160);

  return new Viewport(position, DIMENSIONS, MARGIN, upscale_factor);
}

describe("Viewport", () => {
  describe("no upscale factor", () => {
    const NO_UPSCALE = 1;
    it("tilemap_origin is the negation of the viewport position", () => {
      const position = Point.point(32, 48);
      const viewport = make_viewport(position, NO_UPSCALE);

      const result = viewport.tilemap_origin;

      const expected = Point.point(-32, -48);
      expect(result).toBePoint(expected);
    });

    it("map_to_screen computes position in screen space", () => {
      const position = Point.point(32, 48);
      const viewport = make_viewport(position, NO_UPSCALE);
      const test_point = Point.point(48, 56);

      const result = viewport.map_to_screen(test_point);

      const expected = Point.point(16, 8);
      expect(result).toBePoint(expected);
    });

    it("map_to_screen rounds to the nearest pixel", () => {
      const position = Point.point(32, 48);
      const viewport = make_viewport(position, NO_UPSCALE);
      const test_point = Point.point(47.8, 56.3);

      const result = viewport.map_to_screen(test_point);

      const expected = Point.point(16, 8);
      expect(result).toBePoint(expected);
    });
  });

  describe("with upscale factor", () => {
    const UPSCALE = 2;
    it("tilemap_origin is the negation of the viewport position", () => {
      const position = Point.point(32, 48);
      const viewport = make_viewport(position, UPSCALE);

      const result = viewport.tilemap_origin;

      const expected = Point.point(-64, -96);
      expect(result).toBePoint(expected);
    });

    it("map_to_screen computes position in screen space", () => {
      const position = Point.point(32, 48);
      const viewport = make_viewport(position, UPSCALE);
      const test_point = Point.point(48, 56);

      const result = viewport.map_to_screen(test_point);

      const expected = Point.point(32, 16);
      expect(result).toBePoint(expected);
    });

    it("map_to_screen rounds to the nearest pixel", () => {
      const position = Point.point(32, 48);
      const viewport = make_viewport(position, UPSCALE);
      const test_point = Point.point(47.8, 56.3);

      const result = viewport.map_to_screen(test_point);

      // (47.8 - 32) * 2 = 31.6 -> 32
      // (56.3 - 48) * 2 = 16.6 -> 17
      const expected = Point.point(32, 17);
      expect(result).toBePoint(expected);
    });
  });
});
