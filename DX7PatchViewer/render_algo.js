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
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
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

const STYLE_OP_CARD = Style.flat(Color.CYAN);

class OperatorPrimitive {
  /**
   *
   * @param {Operator} operator
   */
  constructor(operator) {
    this.num = operator.num;
    this.feedback_from = operator.feedback_from;
    this.row = 0;
    this.col = 0;
    /**
     * @type {GroupPrimitive}
     */
    this.primitive = style(Primitive.EMPTY, STYLE_OP_CARD);
  }

  /**
   *
   * @param {number} row
   * @param {number} col
   */
  set_position(row, col) {
    this.row = row;
    this.col = col;

    const bound_rect = new Rect(
      OP_SLOT_DIMENSIONS.mul_components(new Direction(col, row)).to_point(),
      OP_SLOT_DIMENSIONS,
    );

    this.primitive.regroup(align_rect(bound_rect, OP_DIMENSIONS));
  }

  /**
   *
   * @param {import("p5").default} p
   */
  draw(p) {
    this.primitive.draw(p);
  }
}

/**
 * Align a smaller rect within a larger rect with a percent
 * @param {Rect} container
 * @param {Direction} item_dims
 * @param {Direction} [percents]
 * @returns {Rect}
 */
function align_rect(container, item_dims, percents) {
  const effective_percents = percents ?? new Direction(0.5, 0.5);
  const margin = container.dimensions.sub(item_dims);
  const position = container.position.add(
    margin.mul_components(effective_percents),
  );
  return new Rect(position, item_dims);
}

/**
 *
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} algorithm
 * @returns {[Direction, OperatorPrimitive[]]} (bounding_rect, primitive )
 */
function layout_rects(algorithm) {
  if (algorithm instanceof TimeInterval) {
    const op = new OperatorPrimitive(algorithm.value);
    op.set_position(0, 0);
    return [new Direction(1, 1), [op]];
  }

  if (algorithm instanceof Sequential) {
    let rows = 0;
    let cols = 0;
    const prims = [];
    for (const child of algorithm.children) {
      const [child_bounds, child_prims] = layout_rects(child);

      child_prims.forEach((x) => x.set_position(x.row, x.col + cols));
      prims.push(...child_prims);

      cols += child_bounds.x;
      rows = Math.max(rows, child_bounds.y);
    }

    return [new Direction(cols, rows), prims];
  }

  if (algorithm instanceof Parallel) {
    let rows = 0;
    let cols = 0;
    const prims = [];
    for (const child of algorithm.children) {
      const [child_bounds, child_prims] = layout_rects(child);

      child_prims.forEach((x) => x.set_position(x.row + rows, x.col));
      prims.push(...child_prims);

      cols = Math.max(cols, child_bounds.x);
      rows += child_bounds.y;
    }

    return [new Direction(cols, rows), prims];
  }

  throw new Error("Impossible!");
}

/**
 *
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} algorithm
 */
export function render_algo(algorithm) {
  const [, primitives] = layout_rects(algorithm);
  console.log(primitives);
  return group(OP_SLOTS, ...primitives);
}
