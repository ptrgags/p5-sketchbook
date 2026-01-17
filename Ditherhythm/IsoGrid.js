import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Basis3 } from "../sketchlib/Basis3.js";
import { Grid, griderator } from "../sketchlib/Grid.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";

/**
 *
 * @param {RectPrimitive} bounds
 * @param {number} rows
 * @param {number} columns
 * @returns {Basis3}
 */
function compute_basis(bounds, rows, columns) {
  const width = bounds.dimensions.x;
  const height = bounds.dimensions.y;

  if (height < width / 2) {
    throw new Error(
      "bounding box too short! height must be at least half the width"
    );
  }
  const effective_height = height - width / 2;

  const x_step = width / (rows + columns);
  const y_step = x_step / 2;

  const dx = new Direction(-x_step, y_step);
  const dy = new Direction(x_step, y_step);
  const dz = new Direction(0, -effective_height);

  const corner = bounds.position;
  const origin = new Point(
    corner.x + rows * x_step,
    corner.y + effective_height
  );

  return new Basis3(origin, dx, dy, dz);
}

export class IsoGrid {
  /**
   *
   * @param {RectPrimitive} bounds
   * @param {number} rows How many rows in the grid
   * @param {number} columns How many columns in the grid
   * @param {function(number, number): number} height_function Function of (row, col) to height in the range [0, 1]
   */
  constructor(bounds, rows, columns, height_function) {
    this.bounds = bounds;
    this.rows = rows;
    this.columns = columns;
    this.basis = compute_basis(bounds, rows, columns);
    this.height_function = height_function;
  }

  render_axes() {
    return group(this.bounds, this.basis.render());
  }

  render() {
    const blocks = new Grid(this.rows, this.columns);
    blocks.fill(({ i, j }) => {
      const z = this.height_function(i, j);

      // top face of the block is a rhombus
      const rhombus_top = this.basis.position(i, j, z);
      const rhombus_left = this.basis.position(i + 1, j, z);
      const rhombus_bottom = this.basis.position(i + 1, j + 1, z);
      const rhombus_right = this.basis.position(i, j + 1, z);

      // Additional points on the bottom of the block to help define the
      // parallelograms on the sides
      const side_left = this.basis.position(i + 1, j, 0);
      const side_bottom = this.basis.position(i + 1, j + 1, 0);
      const side_right = this.basis.position(i, j + 1, 0);

      const top_face = new PolygonPrimitive(
        [rhombus_top, rhombus_left, rhombus_bottom, rhombus_right],
        true
      );
      const left_face = new PolygonPrimitive(
        [rhombus_left, side_left, side_bottom, rhombus_bottom],
        true
      );
      const right_face = new PolygonPrimitive(
        [rhombus_right, rhombus_bottom, side_bottom, side_right],
        true
      );
      return group(left_face, right_face, top_face);
    });

    return group(...blocks);
  }
}
