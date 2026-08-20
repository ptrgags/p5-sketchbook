import { Color } from "../sketchlib/Color.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { DX7Envelope } from "./DX7Envelope.js";

const AREA_GRADIENT = "9c528b-007ea7-77cbb9-f57200-f9dc5c"
  .split("-")
  .map((x) => Color.from_hex_code(x));

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

  return new PolygonPrimitive(points, false);
}

/**
 *
 * @param {Direction[]} uv_coords
 * @param {Rect} bounds
 * @returns {Primitive}
 */
function render_areas(uv_coords, bounds) {
  const [a, b, c, d, e, f] = uv_coords.map((uv) =>
    bounds.position.add(bounds.dimensions.mul_components(uv)),
  );

  const [b_bottom, c_bottom, d_bottom, e_bottom] = uv_coords
    .slice(1, 6)
    .map((uv) => {
      return bounds.position.add(
        new Direction(uv.x * bounds.dimensions.x, bounds.dimensions.y),
      );
    });

  const area1 = new PolygonPrimitive([a, b, b_bottom], true);
  const area2 = new PolygonPrimitive([b, c, c_bottom, b_bottom], true);
  const area3 = new PolygonPrimitive([c, d, d_bottom, c_bottom], true);
  const area4 = new PolygonPrimitive([d, e, e_bottom, d_bottom], true);
  const area5 = new PolygonPrimitive([e, f, e_bottom], true);
  const areas = [area1, area2, area3, area4, area5];

  return group(...areas.map((x, i) => style(x, Style.flat(AREA_GRADIENT[i]))));
}

const TIME_MAX = 10;
const TIME_SUSTAIN = 5;

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

    const polyline = render_line(uvs, bounds);
    const areas = render_areas(uvs, bounds);

    this.primitive = group(
      style(bounds, Style.flat(Color.BLACK)),
      areas,
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
