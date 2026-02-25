import { describe, it, expect } from "vitest";
import { Cline } from "./Cline.js";
import { Point } from "../pga2d/Point.js";
import { CVersor } from "./CVersor.js";
import { Direction } from "../pga2d/Direction.js";
import { PGA_MATCHERS } from "../test_helpers/pga_matchers.js";
import { Circle } from "../primitives/Circle.js";
import { Line } from "../pga2d/Line.js";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";
import { NullPoint } from "./NullPoint.js";

expect.extend(PGA_MATCHERS);
expect.extend(CGA_MATCHERS);

describe("CVersor", () => {
  describe("reflection", () => {
    it("reflects point over line", () => {
      const point = NullPoint.from_point(new Point(1, -2));
      const reflection = CVersor.reflection(Direction.DIR_X);

      const result = reflection.transform_point(point);

      const expected = NullPoint.from_point(new Point(-1, -2));
      expect(result).toBeNullPoint(expected);
    });

    it("fixes point on line", () => {
      const point = NullPoint.from_point(new Point(4 / 5, -3 / 5));
      const reflection = CVersor.reflection(new Direction(3 / 5, 4 / 5));

      const result = reflection.transform_point(point);

      expect(result).toBeNullPoint(point);
    });

    it("fixes the point at infinity", () => {
      const reflection = CVersor.reflection(new Direction(3 / 5, 4 / 5));

      const result = reflection.transform_point(NullPoint.INF);

      expect(result).toBeNullPoint(NullPoint.INF);
    });

    it("fixes circle centered on line", () => {
      const circle = Cline.from_circle(new Circle(new Point(0, 5), 3));
      const reflection = CVersor.reflection(Direction.DIR_X);

      const result = reflection.transform_cline(circle);

      expect(result).toBeCline(circle);
    });

    it("flips circle preserving radius", () => {
      const circle = Cline.from_circle(new Circle(new Point(3, 4), 3));
      const reflection = CVersor.reflection(new Direction(1, 1));

      const result = reflection.transform_cline(circle);

      const expected = Cline.from_circle(new Circle(new Point(-4, -3), 3));
      expect(result).toBeCline(expected);
    });

    it("flips normal of line of reflection", () => {
      const line = Cline.from_line(new Line(1, 1, 0));
      const reflection = CVersor.reflection(new Direction(1, 1));

      const result = reflection.transform_cline(line);

      const expected = Cline.from_line(new Line(-1, -1, 0));
      expect(result).toBeCline(expected);
    });

    it("fixes orthogonal line", () => {
      const line = Cline.from_line(new Line(1, -1, 0));
      const reflection = CVersor.reflection(new Direction(1, 1));

      const result = reflection.transform_cline(line);

      expect(result).toBeCline(line);
    });

    it("is an involution", () => {
      const reflection = CVersor.reflection(new Direction(3 / 5, 4 / 5));

      const result = reflection.compose(reflection);

      const expected = CVersor.IDENTITY;
      expect(result).toEqual(expected);
    });
  });

  describe("circle_inversion", () => {
    // fixes point on unit circle
    // swaps origin and infinity
    // fixes unit circle
    // fixes line through origin
    // line outside the circle inverts to a circle through the origin...
    //    this is because inf -> 0,
    //    the closest point on the line to the origin is closest to the circle, so its inverse determines the point opposite the origin... I think?
    // is an involution
  });

  describe("translation", () => {
    it("translates point", () => {
      const point = NullPoint.from_point(new Point(1, 2));
      const translation = CVersor.translation(new Direction(3, -2));

      const result = translation.transform_point(point);

      const expected = NullPoint.from_point(new Point(4, 0));
      expect(result).toBeNullPoint(expected);
    });

    it("translates circle keeping radius fixed", () => {
      const circle = Cline.from_circle(new Circle(new Point(3, 4), 5));
      const translation = CVersor.translation(new Direction(3, -2));

      const result = translation.transform_cline(circle);

      const expected_circle = Cline.from_circle(new Circle(new Point(6, 2), 5));
      expect(result).toBeCline(expected_circle);
    });

    it("transform_cline with line with normal in direction of translation only modifies distance", () => {
      const normal = new Direction(-3 / 5, 4 / 5);
      const line = Cline.from_line(new Line(normal.x, normal.y, 1));
      const translation = CVersor.translation(normal.scale(4));

      const result = translation.transform_cline(line);

      const expected = Cline.from_line(new Line(normal.x, normal.y, 5));
      expect(result).toBeCline(expected);
    });

    it("fixes line parallel to translation direction", () => {
      const normal = new Direction(-3 / 5, 4 / 5);
      const line = Cline.from_line(new Line(normal.x, normal.y, 1));
      const translation = CVersor.translation(normal.rot90().scale(4));

      const result = translation.transform_cline(line);

      const expected = Cline.from_line(new Line(normal.x, normal.y, 1));
      expect(result).toBeCline(expected);
    });

    it("fixes point at infinity", () => {
      const translation = CVersor.translation(new Direction(3, -1));

      const result = translation.transform_point(NullPoint.INF);

      expect(result).toBeNullPoint(NullPoint.INF);
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

  describe("rotation", () => {
    it("Rotates point in the positive direction", () => {
      const point = NullPoint.from_point(new Point(3, 4));
      const rotation = CVersor.rotation(Math.PI / 2);

      const result = rotation.transform_point(point);

      // Rotate 90 degrees is (-y, x)
      const expected = NullPoint.from_point(new Point(-4, 3));
      expect(result).toBeNullPoint(expected);
    });

    it("fixes circle centered at origin", () => {
      const circle = Cline.from_circle(new Circle(Point.ORIGIN, 5));
      const rotation = CVersor.rotation(Math.PI / 2);

      const result = rotation.transform_cline(circle);

      expect(result).toBeCline(circle);
    });

    it("rotates circle center with same radius", () => {
      const circle = new Circle(new Point(5, -2), 5);
      const circle_cline = Cline.from_circle(circle);
      const rotation = CVersor.rotation(Math.PI / 2);

      const result = rotation.transform_cline(circle_cline);

      const expected = Cline.from_circle(new Circle(new Point(2, 5), 5));
      expect(result).toBeCline(expected);
    });

    it("rotates line with same distance", () => {
      const line = Cline.from_line(new Line(3 / 5, 4 / 5, 10));
      const rotation = CVersor.rotation(Math.PI / 2);

      const result = rotation.transform_cline(line);

      const expected = Cline.from_line(new Line(-4 / 5, 3 / 5, 10));
      expect(result).toBeCline(expected);
    });

    it("fixes the origin", () => {
      const rotation = CVersor.rotation(Math.PI / 2);

      const result = rotation.transform_point(NullPoint.ORIGIN);

      expect(result).toBeNullPoint(NullPoint.ORIGIN);
    });

    it("fixes the point at infinity", () => {
      const rotation = CVersor.rotation(Math.PI / 2);

      const result = rotation.transform_point(NullPoint.INF);

      expect(result).toBeNullPoint(NullPoint.INF);
    });

    it("inverse is the same as rotation with negative angle", () => {
      const rotation = CVersor.rotation(Math.PI / 2);

      const neg_angle = CVersor.rotation(-Math.PI / 2);
      const inv = rotation.inv();

      expect(inv).toBeCVersor(neg_angle);
    });
  });

  describe("dilation", () => {
    // fixes origin
    // fixes point at infinity
    // scales coordinates of point
    // with circle at origin adjusts radius
    // with general circle scales the center away from the origin and adjusts the radius
    // fixes line through origin
    // scales line distance with same normal
    // inverse is same as scale by reciprocal factor
  });

  describe("inverse", () => {
    it("a versor and its inverse compose to identity", () => {
      const translation = CVersor.translation(new Direction(1, 2));
      const rotation = CVersor.rotation(Math.PI);
      const versor = translation.compose(rotation);

      const inv = versor.inv();
      const v_inv = versor.compose(inv);
      const inv_v = inv.compose(versor);

      expect(v_inv).toBeCVersor(CVersor.IDENTITY);
      expect(inv_v).toBeCVersor(CVersor.IDENTITY);
    });
  });

  describe("compose", () => {
    it("scale and rotation make a spiral transformation", () => {
      const point = NullPoint.from_point(new Point(2, 1));
      const scale = CVersor.dilation(2);
      const rot90 = CVersor.rotation(Math.PI / 2);

      const spiral = rot90.compose(scale);
      const result = spiral.transform_point(point);

      // (2, 1) --rot--> (-1, 2) --scale--> (-2, 4)
      const expected = NullPoint.from_point(new Point(-2, 4));
      expect(result).toBeNullPoint(expected);
    });
  });

  describe("conjugate", () => {
    it("a general line reflection is T(dist * normal) sandwich reflect(normal)", () => {
      // reflection defined explicitly
      const dist = 2;
      const normal = new Direction(3 / 5, 4 / 5);
      const translate = CVersor.translation(normal.scale(dist));
      const reflect = CVersor.reflection(normal);

      // The equivalent line
      const cline = Cline.from_line(new Line(normal.x, normal.y, dist));

      // chaining the individual transforms is the same
      // as reinterpreting the line's vector as a versor.
      const sandwich = translate.conjugate(reflect);
      const line_versor = new CVersor(cline.vector);

      expect(sandwich).toBeCVersor(line_versor);
    });

    it("a general circle inversion is T(center)S(radius) sandwich circle_inversion", () => {
      const radius = 3;
      const center = new Point(3, -4);
      const translate = CVersor.translation(center.to_direction());
      const scale = CVersor.dilation(radius);
      const ts = translate.compose(scale);
      const circle = Cline.from_circle(new Circle(center, radius));
      const inv = CVersor.INVERSION;

      const sandwich = ts.conjugate(inv);
      const circle_versor = new CVersor(circle.vector);

      expect(sandwich).toBeCVersor(circle_versor);
    });
  });
});
