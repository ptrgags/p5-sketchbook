import { Color } from "../sketchlib/Color.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { DX7Envelope } from "./DX7Envelope.js";

/**
 *
 * @param {Direction[]} uv_coords
 * @param {Rect} bounds
 * @returns {PolygonPrimitive}
 */
function render_line(uv_coords, bounds) {
  const points = uv_coords.map((uv) =>
    bounds.position.add(bounds.dimensions.mul_components(uv)),
  );
  console.log(points.map((x) => x.toString()));

  return new PolygonPrimitive(points, false);
}

const TIME_MAX = 30;
const TIME_SUSTAIN = 10;

const LEVEL_MAX = 99;

/**
 * Compute a rough time value. This is not acurate to the real DX7 envelopes,
 * it's just to get a rough idea of the envelope shape
 * @param {number} rate 0-99
 * @param {number} level_a 0-99
 * @param {number} level_b 0-99
 * @returns {number}
 */
function compute_time(rate, level_a, level_b) {
  if (rate === 0) {
    // not infinite, but very long time
    return TIME_MAX;
  }

  return Math.abs(level_b - level_a) / rate;
}

export class DX7EnvelopeVisualizer {
  /**
   * Constructor
   * @param {DX7Envelope} envelope
   * @param {Rect} bounds
   */
  constructor(envelope, bounds) {
    const { rates, levels } = envelope;
    const [r1, r2, r3, r4] = rates;
    const [l1, l2, l3, l4] = levels;

    const t1 = compute_time(r1, l4, l1);
    const t2 = compute_time(r2, l1, l2);
    const t3 = compute_time(r3, l2, l3);
    const t4 = compute_time(r4, l3, l4);
    const total_time = t1 + t2 + t3 + t4 + TIME_SUSTAIN;

    const u_values = [
      0,
      t1,
      t1 + t2,
      t1 + t2 + t3,
      t1 + t2 + t3 + TIME_SUSTAIN,
      total_time,
    ].map((x) => x / total_time);
    const v_values = [l4, l1, l2, l3, l3, l4].map((x) => x / LEVEL_MAX);
    const uvs = u_values.map((u, i) => new Direction(u, 1.0 - v_values[i]));
    console.log(uvs.map((uv) => uv.y));

    const polyline = render_line(uvs, bounds);

    this.primitive = group(
      style(bounds, Style.flat(Color.BLUE)),
      style(polyline, Style.lines(Color.WHITE)),
    );
  }

  /**
   *
   * @param {import('p5').default} p
   */
  draw(p) {
    this.primitive.draw(p);
  }
}
