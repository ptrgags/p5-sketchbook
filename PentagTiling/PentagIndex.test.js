import { describe, it, expect } from "vitest";
import { Index2D } from "../sketchlib/Grid";
import { PentagIndex, PentagSide } from "./PentagIndex";

describe("PentagIndex", () => {
  it("allows negative indices", () => {
    const index = new PentagIndex(-1, -5);

    expect(index.row).toBe(-1);
    expect(index.col).toBe(-5);
  });

  it("to_index_2d throws for negative coordinates", () => {
    const index = new PentagIndex(-1, 0);

    expect(() => {
      return index.to_index_2d();
    }).toThrowError("i must be non-negative");
  });

  it("to_index_2d converts to Index2D for non-negative coordinates", () => {
    const index = new PentagIndex(0, 1);

    const result = index.to_index_2d();

    const expected = new Index2D(0, 1);
    expect(result).toEqual(expected);
  });

  it("get_neighbor for forward tile computes correct neighbors", () => {
    const index = new PentagIndex(3, 0);

    const result = [
      index.get_neighbor(PentagSide.VERTICAL),
      index.get_neighbor(PentagSide.TOP),
      index.get_neighbor(PentagSide.TOP_DIAG),
      index.get_neighbor(PentagSide.BOTTOM_DIAG),
      index.get_neighbor(PentagSide.BOTTOM),
    ];

    const expected = [
      new PentagIndex(3, -1),
      new PentagIndex(2, 0),
      new PentagIndex(2, 1),
      new PentagIndex(3, 1),
      new PentagIndex(4, 0),
    ];
    expect(result).toEqual(expected);
  });

  it("get_neighbor for flipped and staggered tile computes correct neighbors", () => {
    const index = new PentagIndex(2, 1);

    const result = [
      index.get_neighbor(PentagSide.VERTICAL),
      index.get_neighbor(PentagSide.TOP),
      index.get_neighbor(PentagSide.TOP_DIAG),
      index.get_neighbor(PentagSide.BOTTOM_DIAG),
      index.get_neighbor(PentagSide.BOTTOM),
    ];

    const expected = [
      new PentagIndex(2, 2),
      new PentagIndex(1, 1),
      new PentagIndex(2, 0),
      new PentagIndex(3, 0),
      new PentagIndex(3, 1),
    ];
    expect(result).toEqual(expected);
  });

  it("get_neighbor for forward staggered tile computes correct neighbors", () => {
    const index = new PentagIndex(3, 2);

    const result = [
      index.get_neighbor(PentagSide.VERTICAL),
      index.get_neighbor(PentagSide.TOP),
      index.get_neighbor(PentagSide.TOP_DIAG),
      index.get_neighbor(PentagSide.BOTTOM_DIAG),
      index.get_neighbor(PentagSide.BOTTOM),
    ];

    const expected = [
      new PentagIndex(3, 1),
      new PentagIndex(2, 2),
      new PentagIndex(3, 3),
      new PentagIndex(4, 3),
      new PentagIndex(4, 2),
    ];
    expect(result).toEqual(expected);
  });

  it("get_neighbor for flipped tile computes correct neighbors", () => {
    const index = new PentagIndex(3, 3);

    const result = [
      index.get_neighbor(PentagSide.VERTICAL),
      index.get_neighbor(PentagSide.TOP),
      index.get_neighbor(PentagSide.TOP_DIAG),
      index.get_neighbor(PentagSide.BOTTOM_DIAG),
      index.get_neighbor(PentagSide.BOTTOM),
    ];

    const expected = [
      new PentagIndex(3, 4),
      new PentagIndex(2, 3),
      new PentagIndex(2, 2),
      new PentagIndex(3, 2),
      new PentagIndex(4, 3),
    ];
    expect(result).toEqual(expected);
  });

  it("from_index_2d constructs a pentag index", () => {
    const index = new Index2D(2, 1);

    const result = PentagIndex.from_index_2d(index);

    const expected = new PentagIndex(2, 1);
    expect(result).toEqual(expected);
  });
});
