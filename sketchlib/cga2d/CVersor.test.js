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
import { COdd } from "./COdd.js";

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
    it("fixes point on unit circle", () => {
      const point = NullPoint.from_point(new Point(3 / 5, -4 / 5));

      const result = CVersor.INVERSION.transform_point(point);

      expect(result).toBeNullPoint(point);
    });

    it("sends the origin to infinity", () => {
      const result = CVersor.INVERSION.transform_point(NullPoint.ORIGIN);

      expect(result).toBeNullPoint(NullPoint.INF);
    });

    it("fixes unit circle", () => {
      const result = CVersor.INVERSION.transform_cline(Cline.UNIT_CIRCLE);

      expect(result).toBeCline(Cline.UNIT_CIRCLE);
    });

    it("fixes line through the origin", () => {
      const line = Cline.from_line(new Line(3 / 5, -4 / 5, 0));

      const result = CVersor.INVERSION.transform_cline(line);

      expect(result).toBeCline(line);
    });

    it("line outside unit circle inverts to a circle through the origin", () => {
      const line = Cline.from_line(new Line(1, 0, 4));

      const result = CVersor.INVERSION.transform_cline(line);

      // A line outside the unit circle inverts to a circle inside the unit
      // circle. we can find points on an identify if we watch what happens
      // to the nearest and furthest points to the unit circle

      // the furthest point on the line is the point at infinity, which
      // inverts to the origin.

      // the nearest point on the line is (4, 0)
      // the magnitude is 4, so it inverts to (1/4, 0)
      // so we have a circle through the origin and this point
      // so the center is 1/2 * (1/4, 0) = (1/8, 0)
      // and the radius is 1/8
      const expected = Cline.from_circle(
        new Circle(new Point(1 / 8, 0), 1 / 8),
      );
      expect(result).toBeCline(expected);
    });

    it("is an involution", () => {
      const inv = CVersor.INVERSION;

      const result = inv.compose(inv);

      expect(result).toBeCVersor(CVersor.IDENTITY);
    });
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

    // n-fold rotation repeated n times is identity
  });

  describe("dilation", () => {
    it("fixes origin", () => {
      const scale = CVersor.dilation(3);

      const result = scale.transform_point(NullPoint.ORIGIN);

      expect(result).toBeNullPoint(NullPoint.ORIGIN);
    });

    it("fixes point at infinity", () => {
      const scale = CVersor.dilation(3);

      const result = scale.transform_point(NullPoint.INF);

      expect(result).toBeNullPoint(NullPoint.INF);
    });

    it("scales coordinates of point", () => {
      const point = NullPoint.from_point(new Point(3, -4));
      const scale = CVersor.dilation(3);

      const result = scale.transform_point(point);

      const expected = NullPoint.from_point(new Point(9, -12));
      expect(result).toBeNullPoint(expected);
    });

    it("With circle at origin scales radius", () => {
      const circle = Cline.from_circle(new Circle(Point.ORIGIN, 3));
      const scale = CVersor.dilation(4);

      const result = scale.transform_cline(circle);

      const expected = Cline.from_circle(new Circle(Point.ORIGIN, 12));
      expect(result).toBeCline(expected);
    });

    it("With general circle scales the center away from the origin and scales radius", () => {
      const circle = Cline.from_circle(new Circle(new Point(1, -1), 3));
      const scale = CVersor.dilation(4);

      const result = scale.transform_cline(circle);

      const expected = Cline.from_circle(new Circle(new Point(4, -4), 12));
      expect(result).toBeCline(expected);
    });

    it("fixes line through origin", () => {
      const line = Cline.from_line(new Line(3 / 5, 4 / 5, 0));
      const scale = CVersor.dilation(3);

      const result = scale.transform_cline(line);

      expect(result).toBeCline(line);
    });

    it("scales line distance with same normal", () => {
      const line = Cline.from_line(new Line(3 / 5, 4 / 5, 2));
      const scale = CVersor.dilation(3);

      const result = scale.transform_cline(line);

      const expected = Cline.from_line(new Line(3 / 5, 4 / 5, 6));
      expect(result).toBeCline(expected);
    });

    it("inverse is scale by reciprocal factor", () => {
      const scale = CVersor.dilation(4);

      const reciprocal = CVersor.dilation(0.25);
      const inv = scale.inv();

      expect(reciprocal).toBeCVersor(inv);
    });
  });

  describe("spiral", () => {
    // is the same as S * R
    // inverse is inv(S) * inv(R)
  });

  describe("hyperbolic", () => {
    // Fixes source
    // Fixes sink
    // moves origin in direction specified
    // inverse uses reciprocal scale factor
    // fixes unit circle
    // Fixes other circle through the poles
    // fixes line through poles
  });

  describe("elliptic", () => {
    // with point on equator moves along line
    // fixes north pole
    // fixes south pole
    // fixes equator
    // fixes other latitude circle
    // n-fold rotation repeated n times is identity
  });

  describe("loxodromic", () => {
    // is same as H times E
    // inverse is same as inverses of H, E
  });

  describe("parabolic", () => {
    // Fixes origin
    // moves inf in direction
    // Moves point along axis
    // Fixes circles tangent to origin in perpendicular direction
    // Fixes line through origin in direction
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

    it("Inverse of product is reversed product of inverses", () => {
      const t = CVersor.translation(Direction.DIR_X);
      const s = CVersor.elliptic(Direction.DIR_Y, Math.PI / 4);
      const r = CVersor.dilation(4);

      // We expect the group theory identity
      // (TRS)^(-1) = S^(-1)R^(-1)T^(-1) to hold
      const trs_inv = t.compose(r).compose(s).inv();
      const product = s.inv().compose(r.inv()).compose(t.inv());

      expect(trs_inv).toBeCVersor(product);
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

  describe("commutative transformation pairs", () => {
    it("rotation and dilation commute", () => {
      const rotation = CVersor.rotation(Math.PI / 4);
      const scale = CVersor.dilation(3);

      const rs = rotation.compose(scale);
      const sr = scale.compose(rotation);

      expect(rs).toBeCVersor(sr);
    });

    it("elliptic and hyperbolic in orthogonal directions commute", () => {
      const hyp_direction = new Direction(3 / 5, 4 / 5);
      const ellip_direction = hyp_direction.rot90();

      const ellip = CVersor.elliptic(ellip_direction, Math.PI / 4);
      const hyp = CVersor.hyperbolic(hyp_direction, 3);

      const eh = ellip.compose(hyp);
      const he = hyp.compose(ellip);

      expect(eh).toBeCVersor(he);
    });

    it("translations in orthogonal directions commute", () => {
      const dir_x = new Direction(4, 2);
      const x = CVersor.translation(dir_x);
      const y = CVersor.translation(dir_x.rot90());

      const xy = x.compose(y);
      const yx = y.compose(x);

      expect(xy).toBeCVersor(yx);
    });

    it("parabolic transformations in orthogonal directions commute", () => {
      const dir_x = new Direction(4, 2);
      const x = CVersor.parabolic(dir_x);
      const y = CVersor.parabolic(dir_x.rot90());

      const xy = x.compose(y);
      const yx = y.compose(x);

      expect(xy).toBeCVersor(yx);
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

      // The above are only equivalent up to scalar multiple... I don't have
      // an easy way to check for that right now... so let's do this.
      if (
        sandwich.versor instanceof COdd &&
        circle_versor.versor instanceof COdd
      ) {
        expect(sandwich.versor.normalize_o()).toBeCOdd(
          circle_versor.versor.normalize_o(),
        );
      } else {
        // impossible
        expect(true).toBe(false);
      }
    });
  });
});
