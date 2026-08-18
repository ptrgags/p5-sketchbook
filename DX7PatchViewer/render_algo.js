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

/**
 * @enum {number}
 */
const OpConnectionType = {
  CARRIER: 0,
  MODULATOR: 1,
  FEEDBACK: 2,
};

class OpConnection {
  /**
   * Constructor
   * @param {number} src Source
   * @param {number | undefined} dst Destination. For carriers this will be undefined.
   * @param {OpConnectionType} connection_type
   */
  constructor(src, dst, connection_type) {
    this.a = src;
    this.b = dst;
    this.type = connection_type;
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
function* modulate(src, dst) {
  const MOD = OpConnectionType.MODULATOR;

  if (src instanceof TimeInterval && dst instanceof TimeInterval) {
    yield new OpConnection(src.value.num, dst.value.num, MOD);
  } else if (src instanceof TimeInterval && dst instanceof Sequential) {
    yield* modulate(src, dst.children[0]);
  } else if (src instanceof TimeInterval && dst instanceof Parallel) {
    for (const child of dst.children) {
      yield* modulate(src, child);
    }
  } else if (src instanceof Sequential && dst instanceof TimeInterval) {
    const last = expect_last(src.children);
    yield* modulate(last, dst);
  } else if (src instanceof Sequential && dst instanceof Sequential) {
    const last = expect_last(src.children);
    yield* modulate(last, dst.children[0]);
  } else if (src instanceof Sequential && dst instanceof Parallel) {
    const last = expect_last(src.children);
    for (const child of dst.children) {
      yield* modulate(last, child);
    }
  } else if (src instanceof Parallel && dst instanceof TimeInterval) {
    for (const child of src.children) {
      yield* modulate(child, dst);
    }
  } else if (src instanceof Parallel && dst instanceof Sequential) {
    for (const child of src.children) {
      yield* modulate(child, dst.children[0]);
    }
  } else if (src instanceof Parallel && dst instanceof Parallel) {
    for (const src_child of src.children) {
      for (const dst_child of dst.children) {
        yield* modulate(src_child, dst_child);
      }
    }
  }
}

/**
 * Connect operators. This only handles operators
 * @param {import("../sketchlib/music/Timeline.js").Timeline<Operator>} algorithm
 * @returns {Generator<OpConnection>}
 */
function* connect_operators(algorithm) {
  if (algorithm instanceof TimeInterval) {
    // feedback loops will be handled elsewhere
    return;
  } else if (algorithm instanceof Sequential) {
    const children = algorithm.children;
    for (let i = 0; i < children.length - 1; i++) {
      yield* modulate(children[i + 1], children[i]);
    }
  } else if (algorithm instanceof Parallel) {
    for (const child of algorithm.children) {
      yield* connect_operators(child);
    }
  }
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
 * @param {OperatorPrimitive[]} sorted_primitives
 * @returns {PolygonPrimitive}
 */
function make_feedback_prim(sorted_primitives) {
  const [src, dst] = find_feedback(sorted_primitives);

  const src_op = sorted_primitives[src - 1];
  const dst_op = sorted_primitives[dst - 1];

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

  const carrier_lines = make_carrier_prim(primitives);

  const by_operator_number = primitives.sort((a, b) => a.num - b.num);

  const feedback_loop = make_feedback_prim(by_operator_number);

  /**
   * @type {LineSegment[]}
   */
  const connectors = [];
  for (const connection of connections) {
    const op_a = by_operator_number[connection.a - 1];
    const op_b = by_operator_number[(connection.b ?? 1) - 1];
    connectors.push(
      new LineSegment(
        OP_SLOT_DIMENSIONS.mul_components(
          new Direction(op_a.col + 0.5, op_a.row + 0.5),
        ).to_point(),
        OP_SLOT_DIMENSIONS.mul_components(
          new Direction(op_b.col + 0.5, op_b.row + 0.5),
        ).to_point(),
      ),
    );
  }

  console.log(
    primitives,
    connections,
    connectors.map((x) => [x.a.toString(), x.b.toString()]),
  );
  return group(
    OP_SLOTS,
    style([carrier_lines, feedback_loop, ...connectors], STYLE_LINES),
    ...primitives,
  );
}
