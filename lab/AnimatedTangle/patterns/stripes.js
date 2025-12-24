import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Motor } from "../../../pga2d/versors.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../../sketchlib/primitives/LinePrimitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";

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
    const start = corner.add(forward_stride.scale(i + phase));
    //.add(dir_forward.scale(phase));
    const end = start.add(right_stride);
    lines.push(new LinePrimitive(start, end));
  }

  return group(...lines);
}

export class AnimatedStripes {
  /**
   * Constructor
   * @param {Point} center Center of the pattern
   * @param {Direction} dir_forward Forward direction, perpendicular to the lines
   * @param {number} spacing Spacing between lines
   * @param {Direction} dimensions width and height of an oriented rect centered on center with the y direction facing forward.
   */
  constructor(center, dir_forward, spacing, dimensions) {
    this.center = center;
    this.dir_forward = dir_forward;
    this.spacing = spacing;
    this.dimensions = dimensions;

    /**
     * @type {GroupPrimitive}
     */
    this.primitive = make_stripes(center, dir_forward, spacing, dimensions, 0);
    this.lines_array = this.primitive.primitives;
  }

  /**
   * Update the stripes with a new offset
   * @param {number} phase Phase amount in [0, 1]
   */
  update(phase) {
    const new_stripes = make_stripes(
      this.center,
      this.dir_forward,
      this.spacing,
      this.dimensions,
      phase
    );
    this.lines_array.length = 0;
    this.lines_array.push(...new_stripes);
  }

  render() {
    return this.primitive;
  }
}
