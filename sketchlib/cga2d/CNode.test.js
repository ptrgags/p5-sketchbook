import { describe, it, expect } from "vitest";
import { CNode } from "./CNode.js";
import { CVersor } from "./CVersor.js";
import { NullPoint } from "./NullPoint.js";
import { expect_arrays } from "../test_helpers/expect_arrays.js";
import { Point } from "../pga2d/Point.js";
import { Direction } from "../pga2d/Direction.js";
import { CTile } from "./CTile.js";

describe("CNode", () => {
  it("update_transforms swaps out transformations", () => {
    const node = new CNode([], NullPoint.ORIGIN);

    node.update_transforms(CVersor.IDENTITY, CVersor.INVERSION);

    const expected = [CVersor.IDENTITY, CVersor.INVERSION];
    expect_arrays(node.transforms, expected, (r, e) =>
      expect(r).toBeCVersor(e),
    );
  });

  it("transform transforms each transform", () => {
    const node = new CNode(
      [CVersor.IDENTITY, CVersor.INVERSION],
      NullPoint.ORIGIN,
    );

    const result = node.transform(CVersor.INVERSION.versor);

    const expected = new CNode(
      [CVersor.INVERSION, CVersor.IDENTITY],
      NullPoint.ORIGIN,
    );
    expect(result.primitive).toBe(expected.primitive);
    expect_arrays(result.transforms, expected.transforms, (r, e) =>
      expect(r).toBeCVersor(e),
    );
  });

  it("bake transforms primitive", () => {
    const node = new CNode(
      [
        CVersor.translation(Direction.DIR_Y),
        CVersor.translation(Direction.DIR_X),
      ],
      NullPoint.ORIGIN,
    );

    const result = node.bake();

    const expected = [
      NullPoint.from_point(new Point(0, 1)),
      NullPoint.from_point(new Point(1, 0)),
    ];
    expect_arrays(result, expected, (r, e) => expect(r).toBeNullPoint(e));
  });

  it("bake_tile returns a CTile", () => {
    const node = new CNode(
      [
        CVersor.translation(Direction.DIR_Y),
        CVersor.translation(Direction.DIR_X),
      ],
      NullPoint.ORIGIN,
    );

    const result = node.bake_tile();

    const expected = new CTile(
      NullPoint.from_point(new Point(0, 1)),
      NullPoint.from_point(new Point(1, 0)),
    );
    expect_arrays(result.children, expected.children, (r, e) =>
      expect(r).toBeNullPoint(e),
    );
  });
});
