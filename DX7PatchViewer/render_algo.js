import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { griderator } from "../sketchlib/Grid.js";
import {
  Gap,
  Parallel,
  Sequential,
  TimeInterval,
} from "../sketchlib/music/Timeline.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { Rigid } from "../sketchlib/primitives/Rigid.js";
import { group, style, xform } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { Operator } from "./algos.js";

const OP_SLOT_DIMENSIONS = new Direction(WIDTH / 4, HEIGHT / 7);

/** @type {Rect[]} */
const OP_SLOT_RECTS = [];
griderator(6, 4, (i, j) => {
  const rect = new Rect(
    OP_SLOT_DIMENSIONS.mul_components(new Direction(j, i)).to_point(),
    OP_SLOT_DIMENSIONS,
  );
  OP_SLOT_RECTS.push(rect);
});

const OP_SLOTS = style(
  OP_SLOT_RECTS,
  new Style({
    stroke: Oklch.grey(0.1),
    fill: Oklch.grey(0.25),
  }),
);

const OP_DIMENSIONS = new Direction(50, 50);
const RECT_OP = new Rect(Point.ORIGIN, new Direction(35, 35));

/**
 *
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} algorithm
 * @returns {[Rect, Primitive]} (bounding_rect, primitive )
 */
function layout_rects(algorithm) {
  if (algorithm instanceof TimeInterval) {
    // base case: simple rectangle. it is its own bounds
    const bounds = new Rect(Point.ORIGIN, OP_DIMENSIONS);
    return [bounds, RECT_OP];
  }

  if (algorithm instanceof Sequential) {
    let width = 0;
    let height = 0;
    const child_prims = [];
    for (const child of algorithm.children) {
      const [child_bounds, child_prim] = layout_rects(child);

      const translation = Rigid.translation(Direction.DIR_X.scale(width));
      child_prims.push(xform(child_prim, translation));

      width += child_bounds.dimensions.x;
      height = Math.max(height, child_bounds.dimensions.y);
    }

    const bounds = new Rect(Point.ORIGIN, new Direction(width, height));

    return [bounds, group(...child_prims)];
  }

  if (algorithm instanceof Parallel) {
    let width = 0;
    let height = 0;
    const child_prims = [];
    for (const child of algorithm.children) {
      const [child_bounds, child_prim] = layout_rects(child);

      const translation = Rigid.translation(Direction.DIR_Y.scale(height));
      child_prims.push(xform(child_prim, translation));

      width = Math.max(width, child_bounds.dimensions.x);
      height += child_bounds.dimensions.y;
    }

    const bounds = new Rect(Point.ORIGIN, new Direction(width, height));

    return [bounds, group(...child_prims)];
  }

  throw new Error("Impossible!");
}

/**
 *
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} algorithm
 */
export function render_algo(algorithm) {
  const [, primitive] = layout_rects(algorithm);
  return group(OP_SLOTS, primitive);
}
