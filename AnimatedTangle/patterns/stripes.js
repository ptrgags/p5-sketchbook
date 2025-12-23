import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { Motor } from "../../pga2d/versors.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../sketchlib/primitives/LinePrimitive.js";
import { group } from "../../sketchlib/primitives/shorthand.js";

/**
 * Make a set of parallel stripes
 * @param {Point} center Center of the pattern
 * @param {Direction} dir_forward Forward direction, perpendicular to the lines
 * @param {number} spacing Spacing between lines
 * @param {Direction} dimensions width and height of an oriented rect centered on center with the y direction facing forward.
 * @param {number} phase Phase offset from [0, 1] for animation
 * @return {GroupPrimitive}
 */
export function make_stripes(center, dir_forward, spacing, dimensions, phase) {
  const dir_right = Motor.ROT90.transform_dir(dir_forward);

  const { x: width, y: height } = dimensions;

  const corner = center
    .add(dir_right.scale(-width / 2))
    .add(dir_forward.scale(-height / 2));

  const num_stripes = Math.ceil(height / spacing);

  const forward_stride = dir_forward.scale(spacing);
  const right_stride = dir_right.scale(width);

  const lines = [];
  for (let i = 0; i < num_stripes; i++) {
    const start = corner.add(forward_stride.scale(i));
    const end = start.add(right_stride);
    lines.push(new LinePrimitive(start, end));
  }

  return group(...lines);
}
