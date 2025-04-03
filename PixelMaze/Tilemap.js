import { Grid } from "../sketchlib/Grid.js";
import { ImageFrames } from "./ImageFrames.js";

/**
 * A tilemap is just a tuple of image frames (the tileset) and a grid of
 * indices of which tile goes where in a grid. The constructor checks to
 * make sure the indices are in range.
 */
export class Tilemap {
  /**
   * Constructor
   * @param {ImageFrames} tileset The layout of the tileset image
   * @param {Grid<number>} indices The tile indices into the tileset
   */
  constructor(tileset, indices) {
    this.tileset = tileset;
    this.indices = indices;

    const max_index = this.tileset.frame_count;
    const errors = [];
    indices.for_each((index, id) => {
      const { i, j } = index;

      if (id < 0 || id >= max_index) {
        errors.push(`(${i}, ${j}): ${id}`);
      }
    });

    if (errors.length > 0) {
      const error_messages = errors.join("\n");
      throw new Error(
        `tilemap has invalid indices (must be in [0, ${max_index})):\n${error_messages}`
      );
    }
  }
}
