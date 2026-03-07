import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/Point.js";
import { ClineArc, RayPair } from "./ClineArc.js";
import { Cline } from "./Cline.js";
import { Line } from "../pga2d/Line.js";
import { NullPoint } from "./NullPoint.js";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";
import { LineSegment } from "../primitives/LineSegment.js";
import { ArcPrimitive } from "../primitives/ArcPrimitive.js";
import { ArcAngles } from "../ArcAngles.js";
import { Circle } from "../primitives/Circle.js";
import { CVersor } from "./CVersor.js";
import { Direction } from "../pga2d/Direction.js";
import { GEOMETRY_MATCHERS } from "../test_helpers/geometry_matchers.js";
import { Ray } from "../primitives/Ray.js";

expect.extend(CGA_MATCHERS);
expect.extend(GEOMETRY_MATCHERS);

describe("ClineArc", () => {
  describe("primitive", () => {
    it("with three colinear points in order produces a line segment", () => {
      // diagonal line with normal in the x + y direction
      const a = NullPoint.from_point(new Point(-1, 1));
      const b = NullPoint.ORIGIN;
      const c = NullPoint.from_point(new Point(1, -1));
      const cline = Cline.from_line(new Line(1, 1, 0));
      const arc = new ClineArc(cline, a, b, c);

      const result = arc.primitive;

      const expected = new LineSegment(a.point, c.point);
      expect(result).toBeLineSegment(expected);
    });

    it("with three collinear points out of order produces a ray pair", () => {
      // diagonal line with normal in the x + y direction, but this time
      // we start at b so it goes through infinity
      const a = NullPoint.from_point(new Point(-1, 1));
      const b = NullPoint.ORIGIN;
      const c = NullPoint.from_point(new Point(1, -1));
      const cline = Cline.from_line(new Line(1, 1, 0));
      const arc = new ClineArc(cline, b, c, a);

      const result = arc.primitive;

      const expected = new RayPair(
        new Ray(b.point, new Direction(1, -1).normalize()),
        new Ray(a.point, new Direction(-1, 1).normalize()),
      );
      expect(result).toBeRayPair(expected);
    });

    it("with infinity at the end of segment produces a ray", () => {
      const a = NullPoint.ORIGIN;
      const b = NullPoint.from_point(new Point(1, 0));
      const c = NullPoint.INF;
      const arc = new ClineArc(Cline.X_AXIS, a, b, c);

      const result = arc.primitive;

      const expected = new Ray(Point.ORIGIN, Direction.DIR_X);
      expect(result).toBeRay(expected);
    });

    it("with infinity in the middle of segment produces a ray pair", () => {
      // TO INFINITY AND BEYOND!!
      const a = NullPoint.from_point(new Point(1, 0));
      const b = NullPoint.INF;
      const c = NullPoint.ORIGIN;
      const arc = new ClineArc(Cline.X_AXIS, a, b, c);

      const result = arc.primitive;

      const expected = new RayPair(
        new Ray(new Point(1, 0), Direction.DIR_X),
        new Ray(Point.ORIGIN, Direction.DIR_X.neg()),
      );
      expect(result).toBeRayPair(expected);
    });

    it("with 3 noncollinear points produces a circular arc", () => {
      const circle = new Circle(new Point(3, -1), 5);
      // make a 3/4 circle arc clockwise from 6 o'clock
      const a = NullPoint.from_point(new Point(3, -6));
      const b = NullPoint.from_point(new Point(-2, -1));
      const c = NullPoint.from_point(new Point(3, 4));
      const arc = new ClineArc(Cline.from_circle(circle), a, b, c);

      const result = arc.primitive;

      const expected = new ArcPrimitive(
        circle.center,
        5,
        new ArcAngles(-Math.PI / 2, -2 * Math.PI),
      );
      expect(result).toBeArc(expected);
    });
  });

  describe("transform", () => {
    it("with translation shifts a circle", () => {
      const radius = 5;
      const angles = new ArcAngles(0, Math.PI / 2);
      const arc = ClineArc.from_arc(
        new ArcPrimitive(new Point(1, -2), radius, angles),
      );
      const translation = CVersor.translation(new Direction(4, 5));

      const result = translation.transform(arc);

      const expected = ClineArc.from_arc(
        // the center shifts, but radius and angles are preserved
        new ArcPrimitive(new Point(5, 3), radius, angles),
      );
      expect(result).toBeClineArc(expected);
    });

    it("with elliptic transform turns semicircle into ray", () => {
      // half of the unit circle -y -> +x -> +y
      const semicircle = ClineArc.from_arc(
        new ArcPrimitive(
          Point.ORIGIN,
          1,
          new ArcAngles(-Math.PI / 2, Math.PI / 2),
        ),
      );

      // rotate the globe so -y -> 0 -> +y -> inf while fixing +/- x
      const elliptic = CVersor.elliptic(Direction.DIR_Y, Math.PI / 2);

      const result = elliptic.transform(semicircle);

      // -y got sent to 0
      // +x was fixed
      // +y got sent to inf
      // so we have a ray 0 -> +x -> inf
      const expected = new ClineArc(
        Cline.from_line(Line.X_AXIS),
        NullPoint.ORIGIN,
        NullPoint.from_point(new Point(1, 0)),
        NullPoint.INF,
      );
      expect(result).toBeClineArc(expected);
    });

    it("with elliptic transform turns semicircle into double ray", () => {
      // half of the unit circle -y -> +x -> +y
      const semicircle = ClineArc.from_arc(
        new ArcPrimitive(
          Point.ORIGIN,
          1,
          new ArcAngles(-Math.PI / 2, Math.PI / 2),
        ),
      );

      // rotate the globe so +/-y are fixed, and +x -> inf -> -x -> 0
      const elliptic = CVersor.elliptic(Direction.DIR_X, Math.PI / 2);

      const result = elliptic.transform(semicircle);

      // -y was fixed
      // +x got sent to infinity
      // +y was fixed
      const expected = new ClineArc(
        Cline.from_line(Line.Y_AXIS),
        NullPoint.from_point(new Point(0, -1)),
        NullPoint.INF,
        NullPoint.from_point(new Point(0, 1)),
      );
      expect(result).toBeClineArc(expected);
    });
  });

  describe("from_segment", () => {
    it("with segment computes correct cline arc", () => {
      const segment = new LineSegment(new Point(1, 1), new Point(1, -1));

      const result = ClineArc.from_segment(segment);

      const expected = new ClineArc(
        Cline.from_line(new Line(1, 0, 1)),
        NullPoint.from_point(new Point(1, 1)),
        NullPoint.from_point(new Point(1, 0)),
        NullPoint.from_point(new Point(1, -1)),
      );
      expect(result).toBeClineArc(expected);
    });
  });

  it("from_arc with arc produces correct cline arc", () => {
    const circle = new Circle(new Point(2, 3), 5);
    const arc = new ArcPrimitive(
      circle.center,
      circle.radius,
      new ArcAngles(-Math.PI / 4, Math.PI / 4),
    );

    const result = ClineArc.from_arc(arc);

    const expected_a = new Point(2 + 5 * Math.SQRT1_2, 3 - 5 * Math.SQRT1_2);
    const expected_b = new Point(7, 3);
    const expected_c = new Point(2 + 5 * Math.SQRT1_2, 3 + 5 * Math.SQRT1_2);
    const expected = new ClineArc(
      Cline.from_circle(circle),
      NullPoint.from_point(expected_a),
      NullPoint.from_point(expected_b),
      NullPoint.from_point(expected_c),
    );
    expect(result).toBeClineArc(expected);
  });
});
