import { describe, it, expect } from "vitest";
import {
  DIAGONAL,
  EDGE_HIGHLIGHT_OFFSET,
  iso_edge_patch,
  iso_edge_tile,
  iso_face_patch,
  iso_face_tile,
  IsoSlant,
  LEFT,
  NONE,
  RIGHT,
  TOP,
  VERTICAL,
} from "./iso_tiles.js";

describe("iso_face_tile", () => {
  it("with a left-slanted tile computes correct index", () => {
    const result = iso_face_tile(IsoSlant.LEFT, RIGHT, LEFT);

    const expected = 23;
    expect(result).toEqual(expected);
  });

  it("with a right-slanted tile computes correct index", () => {
    const result = iso_face_tile(IsoSlant.RIGHT, LEFT, TOP);

    const expected = 10;
    expect(result).toEqual(expected);
  });
});

describe("iso_face_patch", () => {
  it("with faces computes correct patch", () => {
    const result = iso_face_patch([
      [
        [NONE, TOP],
        [NONE, TOP],
      ],
      [
        [TOP, LEFT],
        [TOP, RIGHT],
      ],
    ]);

    const expected = [
      [8, 12],
      [21, 25],
    ];
    expect(result).toEqual(expected);
  });
});

describe("iso_edge_tile", () => {
  it("with a left-slanted tile computes correct index", () => {
    const result = iso_edge_tile(IsoSlant.LEFT, VERTICAL);

    const expected = 37;
    expect(result).toEqual(expected);
  });

  it("with a right-slanted tile computes correct index", () => {
    const result = iso_edge_tile(IsoSlant.RIGHT, VERTICAL);

    const expected = 33;
    expect(result).toEqual(expected);
  });

  it("with different edge offset computes correct index", () => {
    const result = iso_edge_tile(
      IsoSlant.RIGHT,
      VERTICAL,
      EDGE_HIGHLIGHT_OFFSET,
    );

    const expected = 41;
    expect(result).toEqual(expected);
  });
});

describe("iso_edge_patch", () => {
  it("with edges computes correct edge tiles", () => {
    const result = iso_edge_patch([
      [DIAGONAL, VERTICAL | DIAGONAL],
      [DIAGONAL, VERTICAL | DIAGONAL],
    ]);

    const expected = [
      [34, 39],
      [38, 35],
    ];
    expect(result).toEqual(expected);
  });

  it("with offset computes correct edge tiles", () => {
    const result = iso_edge_patch(
      [
        [DIAGONAL, VERTICAL | DIAGONAL],
        [DIAGONAL, VERTICAL | DIAGONAL],
      ],
      EDGE_HIGHLIGHT_OFFSET,
    );

    const expected = [
      [42, 47],
      [46, 43],
    ];
    expect(result).toEqual(expected);
  });
});
