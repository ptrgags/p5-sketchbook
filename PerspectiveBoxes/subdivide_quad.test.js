import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/objects";
import { PerspectiveQuad } from "./PerspectiveQuad";
import { subdivide_quad } from "./subdivide_quad";
import { PGA_TESTERS } from "../pga2d/pga_testers";

//expect.addEqualityTesters(PGA_TESTERS);

describe("subdivide_quad", () => {
  it("with n = 0 returns input quad", () => {
    const quad = new PerspectiveQuad(
      Point.point(0, 0),
      Point.point(3, 2),
      Point.point(1, 3),
      Point.point(-1, 2)
    );

    const result_grid = subdivide_quad(quad, 0);
    const result = [...result_grid];

    const expected = [quad];
    expect(result).toEqual(expected);
  });

  function make_orthog_quad() {
    return new PerspectiveQuad(
      Point.point(-1, -1),
      Point.point(1, -1),
      Point.point(1, 1),
      Point.point(-1, 1)
    );
  }

  function make_perspective_quad() {
    // see https://www.desmos.com/calculator/v63cqhvrm8
    return new PerspectiveQuad(
      Point.point(-2, 0),
      Point.point(0, -2),
      Point.point(2, 0),
      Point.point(0, 1)
    );
  }

  it("with orthogonal quad and n=1 splits at the center", () => {
    const quad = make_orthog_quad();

    const result_grid = subdivide_quad(quad, 1);
    const result = [...result_grid];

    const expected = [
      new PerspectiveQuad(
        Point.point(-1, 1),
        Point.point(0, -1),
        Point.point(0, 0),
        Point.point(-1, 0)
      ),
      new PerspectiveQuad(
        Point.point(0, -1),
        Point.point(1, -1),
        Point.point(1, 0),
        Point.point(0, 0)
      ),
      new PerspectiveQuad(
        Point.point(-1, 0),
        Point.point(0, 0),
        Point.point(0, 1),
        Point.point(-1, 1)
      ),
      new PerspectiveQuad(
        Point.point(0, 0),
        Point.point(1, 0),
        Point.point(1, 1),
        Point.point(0, 1)
      ),
    ];
    expect(result).toEqual(expected);
  });

  it("with perspective quad and n=1 splits at the intersection of diagonals", () => {
    const quad = make_perspective_quad();

    const result_grid = subdivide_quad(quad, 1);
    const result = [...result_grid];

    // centers of sides, see desmos graph https://www.desmos.com/calculator/v63cqhvrm8
    const top = Point.point(0.8571428571428572, 0.5714285714285714);
    const left = Point.point(-0.8571428571428572, 0.5714285714285714);
    const right = Point.point(1.2, -0.8);
    const bottom = Point.point(-1.2, -0.8);
    const expected = [
      new PerspectiveQuad(Point.point(-2, 0), bottom, Point.point(0, 0), left),
      new PerspectiveQuad(bottom, Point.point(0, -2), right, Point.point(0, 0)),
      new PerspectiveQuad(left, Point.point(0, 0), top, Point.point(0, 1)),
      new PerspectiveQuad(Point.point(0, 0), right, Point.point(2, 0), top),
    ];

    expect(-0).toEqual(0);
    expect(result).toEqual(expected);
  });
});
