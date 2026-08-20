import { Color } from "../sketchlib/Color.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Style } from "../sketchlib/Style.js";
import { DX7Envelope } from "./DX7Envelope.js";
import { DX7Operator } from "./DX7Operator.js";

/**
 *
 * @param {DX7Envelope} envelope
 * @param {Rect} bounds
 */
function render_envelope(envelope, bounds) {
  const { rates, levels } = envelope;
  const [r1, r2, r3, r4] = rates;
  const [l1, l2, l3, l4] = levels;

  const T_SUSTAIN = 10;
  const t1 = Math.abs(l1 - l4) / r1;
  const t2 = Math.abs(l2 - l1) / r2;
  const t3 = Math.abs(l3 - l2) / r3;
  const t4 = Math.abs(l4 - l3) / r4;

  const total_time = t1 + t2 + t3 + t4 + T_SUSTAIN;

  const MAX_LEVEL = 99;
  // UV coordinates but y-down to make converting to pixels easier
  const uv_a = new Direction(0, 1 - l4 / MAX_LEVEL);
  const uv_b = new Direction(t1 / total_time, 1 - l1 / MAX_LEVEL);
  const uv_c = new Direction((t1 + t2) / total_time, 1 - l2 / MAX_LEVEL);
  const uv_d = new Direction((t1 + t2 + t3) / total_time, 1 - l3 / MAX_LEVEL);
  // I'm including an extra point to show the sustain portion more clearly
  const uv_e = new Direction(
    (t1 + t2 + t3 + T_SUSTAIN) / total_time,
    1 - l3 / MAX_LEVEL,
  );
  const uv_f = new Direction(1, 1 - l4 / MAX_LEVEL);

  const px_a = bounds.position.add(uv_a.mul_components(bounds.dimensions));
  const px_b = bounds.position.add(uv_b.mul_components(bounds.dimensions));
  const px_c = bounds.position.add(uv_c.mul_components(bounds.dimensions));
  const px_d = bounds.position.add(uv_d.mul_components(bounds.dimensions));
  const px_e = bounds.position.add(uv_e.mul_components(bounds.dimensions));
  const px_f = bounds.position.add(uv_f.mul_components(bounds.dimensions));

  return new PolygonPrimitive([px_a, px_b, px_c, px_d, px_e, px_f], false);
}

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
    const envelope_prim = render_envelope(operator.envelope, env_bounds);

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
