import { Color } from "../sketchlib/Color.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Style } from "../sketchlib/Style.js";
import { DX7Operator } from "./DX7Operator.js";
import { DX7EnvelopeVisualizer } from "./DX7EnvelopeVisualizer.js";

const TEXT_STYLE_OP = new TextStyle(12, "left", "top");

export class DX7OperatorVisualizer {
  /**
   * Constructor
   * @param {DX7Operator} operator
   * @param {Rect} bounds
   */
  constructor(operator, bounds) {
    const env_bound_size = bounds.dimensions.mul_components(
      new Direction(1, 1 / 3),
    );
    const env_bounds = new Rect(
      bounds.position.add(new Direction(0, (2 * bounds.dimensions.y) / 3)),
      env_bound_size,
    );
    const envelope_prim = new DX7EnvelopeVisualizer(
      operator.envelope,
      env_bounds,
    );

    const text = `${operator.name}    L:${operator.level}\nf:${operator.freq}\n${operator.key_scaling}`;
    this.primitive = group(
      new GroupPrimitive(new TextPrimitive(text, bounds.position), {
        style: Style.flat(Color.BLACK),
        text_style: TEXT_STYLE_OP,
      }),
      style(envelope_prim, Style.lines(Color.RED)),
    );
  }

  /**
   *
   * @param {import("p5").default} p
   */
  draw(p) {
    this.primitive.draw(p);
  }
}
