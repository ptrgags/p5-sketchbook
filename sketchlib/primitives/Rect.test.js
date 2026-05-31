import { describe, it, expect } from "vitest";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Rect } from "./Rect.js";
import { Grid } from "../Grid.js";

describe("Rect", () => {
  it("center computes center", () => {
    const rect = new Rect(new Point(-3, 5), new Direction(5, 3));

    const result = rect.center;

    const expected = new Point(-0.5, 6.5);
    expect(result).toBePoint(expected);
  });

  it("far_corner computes far corner", () => {
    const rect = new Rect(new Point(-3, 5), new Direction(5, 3));

    const result = rect.far_corner;

    const expected = new Point(2, 8);
    expect(result).toBePoint(expected);
  });

  describe("clamp", () => {
    it("with point inside rect returns same point", () => {
      const rect = new Rect(new Point(-3, 5), new Direction(5, 3));
      const point = new Point(0, 6);

      const result = rect.clamp(point);

      expect(result).toBePoint(point);
    });

    it("with point outside near side returns point clamped to boundary", () => {
      const rect = new Rect(new Point(-3, 5), new Direction(5, 3));
      const point = new Point(-5, 6);

      const result = rect.clamp(point);

      const expected = new Point(-3, 6);
      expect(result).toBePoint(expected);
    });

    it("with point outside far side returns point clamped to boundary", () => {
      const rect = new Rect(new Point(-3, 5), new Direction(5, 3));
      const point = new Point(1, 10);

      const result = rect.clamp(point);

      const expected = new Point(1, 8);
      expect(result).toBePoint(expected);
    });

    it("with point outside corner returns point clamped to boundary", () => {
      const rect = new Rect(new Point(-3, 5), new Direction(5, 3));
      const point = new Point(20, -10);

      const result = rect.clamp(point);

      const expected = new Point(2, 5);
      expect(result).toBePoint(expected);
    });
  });

  describe("contains", () => {
    it("with point inside rectangle returns true", () => {
      const rect = new Rect(new Point(1, 2), new Direction(4, 5));
      const point = new Point(2, 3);

      const result = rect.contains(point);

      const expected = true;
      expect(result).toEqual(expected);
    });

    it("with point outside side returns false", () => {
      const rect = new Rect(new Point(1, 2), new Direction(4, 5));
      const point = new Point(-2, 3);

      const result = rect.contains(point);

      const expected = false;
      expect(result).toEqual(expected);
    });

    it("with point outside corner returns false", () => {
      const rect = new Rect(new Point(1, 2), new Direction(4, 5));
      const point = new Point(-2, 3);

      const result = rect.contains(point);

      const expected = false;
      expect(result).toEqual(expected);
    });
  });

  it("from_center computes correct rectangle", () => {
    const center = new Point(2, 3);
    const dimensions = new Direction(10, 12);

    const result = Rect.from_center(center, dimensions);

    const expected = new Rect(new Point(-3, -3), dimensions);
    expect(result).toBeRect(expected);
  });

  it("uv_to_world computes correct screen position", () => {
    const rect = new Rect(new Point(-1, -1), new Direction(4, 4));
    const uv = new Point(0.25, 0.75);

    const result = rect.uv_to_world(uv);

    // It feels weird that this is y-down... see GH #472
    const expected = new Point(0, 0);
    expect(result).toBePoint(expected);
  });

  it("world_to_uv computes correct uvs", () => {
    const rect = new Rect(new Point(-1, -1), new Direction(4, 4));
    const uv = new Point(0, 0);

    const result = rect.world_to_uv(uv);

    const expected = new Point(0.25, 0.75);
    expect(result).toBePoint(expected);
  });

  it("subdivide_grid divides rect into smaller quads", () => {
    const rect = new Rect(new Point(-1, -1), new Direction(3, 6));

    const result = rect.subdivide_grid(3);

    const cell_size = new Direction(1, 2);
    const expected = new Grid(3, 3);
    expected.fill((index) => {
      const { i, j } = index;

      return new Rect(new Point(-1 + j, -1 + 2 * i), cell_size);
    });
    expect(result).toEqual(expected);
  });
});
