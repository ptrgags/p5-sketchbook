import { describe, it, expect } from "vitest";
import { Cline } from "./Cline.js";
import { Point } from "../pga2d/Point.js";
import { CVersor } from "./CVersor.js";
import { Direction } from "../pga2d/Direction.js";
import { PGA_MATCHERS } from "../test_helpers/pga_matchers.js";
import { Circle } from "../primitives/Circle.js";
import { Line } from "../pga2d/Line.js";
import { COdd } from "./COdd.js";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";
import { CEven } from "./CEven.js";

expect.extend(PGA_MATCHERS);
expect.extend(CGA_MATCHERS);

describe("CVersor", () => {
  describe("reflection", () => {});

  describe("translation", () => {
    it("translates point", () => {
      const point = Cline.from_point(new Point(1, 2));
      const translation = CVersor.translation(new Direction(3, -2));

      const result = translation.transform_cline(point);

      const expected = new Point(4, 0);
      expect(result.primitive).toBePoint(expected);
    });

    it("translates circle keeping radius fixed", () => {
      const circle = Cline.from_circle(new Circle(new Point(3, 4), 5));
      const translation = CVersor.translation(new Direction(3, -2));

      const result = translation.transform_cline(circle);

      const expected_circle = new Circle(new Point(6, 2), 5);
      expect(result.primitive).toEqual(expected_circle);
    });

    it("transform_cline with line with normal in direction of translation only modifies distance", () => {
      const normal = new Direction(-3 / 5, 4 / 5);
      const line = Cline.from_line(new Line(normal.x, normal.y, 1));
      const translation = CVersor.translation(normal.scale(4));

      const result = translation.transform_cline(line);

      const expected = new Line(normal.x, normal.y, 5);
      expect(result.primitive).toEqual(expected);
    });

    it("fixes line parallel to translation direction", () => {
      const normal = new Direction(-3 / 5, 4 / 5);
      const line = Cline.from_line(new Line(normal.x, normal.y, 1));
      const translation = CVersor.translation(normal.rot90().scale(4));

      const result = translation.transform_cline(line);

      const expected = new Line(normal.x, normal.y, 1);
      expect(result.primitive).toEqual(expected);
    });

    it("fixes point at infinity", () => {
      const translation = CVersor.translation(new Direction(3, -1));

      const result = translation.transform_cline(Cline.INF);

      const expected = Cline.INF;
      expect(result).toEqual(expected);
    });

    it("inverse is the same as translation with negative offset", () => {
      const offset = new Direction(-4, 5);
      const translation = CVersor.translation(offset);

      const neg_offset = CVersor.translation(offset.neg());
      const inv = translation.inv();

      const expected = CVersor.translation(new Direction(4, -5));
      expect(neg_offset.versor).toBeCEven(expected.versor);
      expect(inv.versor).toBeCEven(expected.versor);
    });
  });

  describe("rotation", () => {});

  describe("dilation", () => {});

  describe("compose", () => {});

  describe("conjugate", () => {});
});
