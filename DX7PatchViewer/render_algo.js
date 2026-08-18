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
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { SimpleGroupPrimitive } from "../sketchlib/primitives/SimpleGroupPrimitive.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { Style } from "../sketchlib/Style.js";
import { Operator } from "./algos.js";

const OP_SLOT_DIMENSIONS = new Direction(WIDTH / 4, HEIGHT / 7);

const STYLE_TEXT = Style.flat(Color.RED);

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

const OP_DIMENSIONS = new Direction(WIDTH / 6, HEIGHT / 8);

const STYLE_OP_CARD = Style.flat(Color.YELLOW);

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

    this.card = style(Primitive.EMPTY, STYLE_OP_CARD);
    this.text = style(Primitive.EMPTY, STYLE_TEXT);

    /**
     * @type {SimpleGroupPrimitive}
     */
    this.primitive = group(this.card, this.text);
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

    const card_rect = align_rect(bound_rect, OP_DIMENSIONS);

    const title = new TextPrimitive(
      `OP ${this.num}`,
      card_rect.position.add(Direction.DIR_Y.scale(12)),
    );

    this.card.regroup(card_rect);
    this.text.regroup(title);
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

const STYLE_LINES = Style.lines(Color.WHITE, 2);

class OpConnection {
  /**
   * Constructor
   * @param {number} src Source operator number (1-6)
   * @param {number} dst Destination operator number (1-6)
   */
  constructor(src, dst) {
    this.src = src;
    this.dst = dst;
  }
}

/**
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
function expect_last(arr) {
  const last = arr.at(-1);
  if (!last) {
    throw new Error(`expected at least one element: ${arr}`);
  }
  return last;
}

/**
 *
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} src
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} dst
 * @returns {Generator<OpConnection>}
 */
function* old_modulate(src, dst) {
  if (src instanceof TimeInterval && dst instanceof TimeInterval) {
    yield new OpConnection(src.value.num, dst.value.num);
  } else if (src instanceof TimeInterval && dst instanceof Sequential) {
    yield* old_modulate(src, dst.children[0]);
  } else if (src instanceof TimeInterval && dst instanceof Parallel) {
    for (const child of dst.children) {
      yield* old_modulate(src, child);
    }
  } else if (src instanceof Sequential && dst instanceof TimeInterval) {
    const last = expect_last(src.children);
    yield* old_modulate(last, dst);
  } else if (src instanceof Sequential && dst instanceof Sequential) {
    const last = expect_last(src.children);
    yield* old_modulate(last, dst.children[0]);
  } else if (src instanceof Sequential && dst instanceof Parallel) {
    const last = expect_last(src.children);
    for (const child of dst.children) {
      yield* old_modulate(last, child);
    }
  } else if (src instanceof Parallel && dst instanceof TimeInterval) {
    for (const child of src.children) {
      yield* old_modulate(child, dst);
    }
  } else if (src instanceof Parallel && dst instanceof Sequential) {
    for (const child of src.children) {
      yield* old_modulate(child, dst.children[0]);
    }
  } else if (src instanceof Parallel && dst instanceof Parallel) {
    for (const src_child of src.children) {
      for (const dst_child of dst.children) {
        yield* old_modulate(src_child, dst_child);
      }
    }
  }
}

/**
 * Gather up all of the values at one end of the timeline
 *
 * @template T
 * @param {import("../sketchlib/music/Timeline.js").Timeline<T>} timeline
 * @param {"first" | "last"} seq_end Whether to take the first or last element from Sequential timelines
 * @returns {Generator<T>}
 */
function* get_ends(timeline, seq_end) {
  if (timeline instanceof TimeInterval) {
    yield timeline.value;
  } else if (timeline instanceof Sequential) {
    const index = seq_end === "first" ? 0 : -1;
    const end = timeline.children.at(index);
    if (end) {
      yield* get_ends(end, seq_end);
    }
  } else if (timeline instanceof Parallel) {
    for (const lane of timeline.children) {
      yield* get_ends(lane, seq_end);
    }
  }
}

/**
 *
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} src
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} dst
 * @returns {Generator<OpConnection>}
 */
function* connect_pair(src, dst) {
  const src_ends = get_ends(src, "first")
    .map((x) => x.num)
    .toArray();
  const dst_ends = get_ends(dst, "last")
    .map((x) => x.num)
    .toArray();

  for (const src_op of src_ends) {
    for (const dst_op of dst_ends) {
      yield new OpConnection(src_op, dst_op);
    }
  }
}

/**
 * Connect operators. This only handles operators
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} algorithm
 * @returns {Generator<OpConnection>}
 */
function* connect_operators(algorithm) {
  if (algorithm instanceof Sequential) {
    const children = algorithm.children;
    for (let i = 0; i < children.length - 1; i++) {
      yield* connect_pair(children[i + 1], children[i]);
    }
  }

  // recurse
  if (algorithm instanceof Sequential || algorithm instanceof Parallel) {
    for (const child of algorithm.children) {
      yield* connect_operators(child);
    }
  }
}

/**
 * Make a path between each operator, with turns drawn as right angles.
 * @param {OpConnection[]} connections
 * @param {OperatorPrimitive[]} sorted_ops
 */
function make_connection_prims(connections, sorted_ops) {
  return connections.map(({ src, dst }) => {
    const op_src = sorted_ops[src - 1];
    const op_dst = sorted_ops[dst - 1];

    const src_x = (op_src.col + 0.5) * OP_SLOT_DIMENSIONS.x;
    const middle_x = op_src.col * OP_SLOT_DIMENSIONS.x;
    const dst_x = (op_dst.col + 0.5) * OP_SLOT_DIMENSIONS.x;

    const src_y = (op_src.row + 0.5) * OP_SLOT_DIMENSIONS.y;
    const dst_y = (op_dst.row + 0.5) * OP_SLOT_DIMENSIONS.y;

    return new PolygonPrimitive(
      [
        new Point(src_x, src_y),
        new Point(middle_x, src_y),
        new Point(middle_x, dst_y),
        new Point(dst_x, dst_y),
      ],
      false,
    );
  });
}

/**
 *
 * @param {OperatorPrimitive[]} primitives
 * @returns {SimpleGroupPrimitive}
 */
function make_carrier_prim(primitives) {
  const X_VERTICAL = 0.1 * OP_SLOT_DIMENSIONS.x;
  const X_CARD_CENTER = 0.5 * OP_SLOT_DIMENSIONS.x;

  let min_row = 7;
  let max_row = 0;
  const horizontal_lines = [];
  for (const primitive of primitives) {
    // Only the first column of operators are connected to the audio output
    // and thus are the "carrier" signals for the frequency modulation.
    if (primitive.col !== 0) {
      continue;
    }

    const row = primitive.row;

    min_row = Math.min(min_row, row);
    max_row = Math.max(max_row, row);

    const y = (row + 0.5) * OP_SLOT_DIMENSIONS.y;
    horizontal_lines.push(
      new LineSegment(new Point(X_VERTICAL, y), new Point(X_CARD_CENTER, y)),
    );
  }

  const vertical_line = new LineSegment(
    new Point(X_VERTICAL, (min_row + 0.5) * OP_SLOT_DIMENSIONS.y),
    new Point(X_VERTICAL, (max_row + 0.5) * OP_SLOT_DIMENSIONS.y),
  );

  return group(...horizontal_lines, vertical_line);
}

/**
 *
 * @param {OperatorPrimitive[]} primitives
 * @returns {[number, number]} (src, dst) operator numbers
 */
function find_feedback(primitives) {
  for (const primitive of primitives) {
    if (primitive.feedback_from !== undefined) {
      return [primitive.feedback_from, primitive.num];
    }
  }
  throw new Error("missing feedback loop");
}

/**
 * Draw lines indicating the feedback loop
 * @param {OperatorPrimitive[]} sorted_ops
 * @returns {PolygonPrimitive}
 */
function make_feedback_prim(sorted_ops) {
  const [src, dst] = find_feedback(sorted_ops);

  const src_op = sorted_ops[src - 1];
  const dst_op = sorted_ops[dst - 1];

  const src_x = (src_op.col + 0.5) * OP_SLOT_DIMENSIONS.x;
  const dst_x = (dst_op.col + 0.5) * OP_SLOT_DIMENSIONS.x;
  const dst_right = (dst_op.col + 1) * OP_SLOT_DIMENSIONS.x;

  // in all 32 of the DX7 algorithms, the feedback loop will be in the same
  // vertical stack of operators, so the row numbers will match
  const card_center_y = (src_op.row + 0.5) * OP_SLOT_DIMENSIONS.y;
  const slot_bottom = (src_op.row + 1) * OP_SLOT_DIMENSIONS.y;

  return new PolygonPrimitive(
    [
      new Point(src_x, card_center_y),
      new Point(src_x, slot_bottom),
      new Point(dst_right, slot_bottom),
      new Point(dst_right, card_center_y),
      new Point(dst_x, card_center_y),
    ],
    false,
  );
}

/**
 *
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} algorithm
 */
export function render_algo(algorithm) {
  const [, primitives] = layout_rects(algorithm);
  const connections = connect_operators(algorithm).toArray();
  const by_operator_number = primitives.sort((a, b) => a.num - b.num);

  const connection_lines = make_connection_prims(
    connections,
    by_operator_number,
  );
  const carrier_lines = make_carrier_prim(primitives);
  const feedback_loop = make_feedback_prim(by_operator_number);

  return group(
    OP_SLOTS,
    style([carrier_lines, feedback_loop, ...connection_lines], STYLE_LINES),
    ...primitives,
  );
}
