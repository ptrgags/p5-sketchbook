import { describe, it, expect } from "vitest";
import { ImageFrames } from "./ImageFrames";
import { Point } from "../../pga2d/objects";
import { Grid, Index2D } from "../../sketchlib/Grid";
import { Tilemap } from "./Tilemap.js";

function make_tileset() {
  return new ImageFrames(new Direction(64, 64), new Direction(16, 16));
}

describe("Tilemap", () => {
  it("constructor throws for bad indices", () => {
    const tileset = make_tileset();

    const bad_indices = new Grid(2, 2);
    bad_indices.fill(() => 3);
    const out_of_bounds = 100;
    bad_indices.set(new Index2D(1, 0), out_of_bounds);

    expect(() => {
      return new Tilemap(tileset, bad_indices);
    }).toThrowError("(1, 0): 100");
  });
});
