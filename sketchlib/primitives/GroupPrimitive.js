import { is_nearly } from "../is_nearly.js";
import { Style } from "../Style.js";
import { Primitive } from "./Primitive.js";
import { TextStyle } from "./TextStyle.js";
import { Transform } from "./Transform.js";

/**
 * Apply stroke and fill styling
 * @param {import("p5")} p p5.js context
 * @param {Style} style The style to use
 */
function apply_style(p, style) {
  if (style.stroke && !is_nearly(style.stroke.a, 0)) {
    const { r, g, b, a } = style.stroke;
    p.stroke(r, g, b, a);
  } else {
    p.noStroke();
  }

  if (style.fill && !is_nearly(style.fill.a, 0)) {
    const { r, g, b, a } = style.fill;
    p.fill(r, g, b, a);
  } else {
    p.noFill();
  }

  p.strokeWeight(style.stroke_width);
}

/**
 * Convert string align values to p5.js constants
 * @param {import("p5")} p p5.js library
 * @param {"left" | "center" | "right"} h_align The horizontal align value
 * @returns {import("p5").HORIZ_ALIGN} the corresponding p5.js constant
 */
function get_horizontal_align(p, h_align) {
  switch (h_align) {
    case "center":
      return p.CENTER;
    case "right":
      return p.RIGHT;
    default:
      return p.LEFT;
  }
}

/**
 * Convert string align values to p5.js constants
 * @param {import("p5")} p p5.js library
 * @param {"top" | "bottom" | "center" | "baseline"} v_align The vertical align value
 * @returns {import("p5").VERT_ALIGN} The corresponding p5.js constant
 */
function get_vertical_align(p, v_align) {
  switch (v_align) {
    case "center":
      return p.CENTER;
    case "top":
      return p.TOP;
    case "baseline":
      return p.BASELINE;
    default:
      return p.BOTTOM;
  }
}

/**
 * Apply any text styles present in a TextStyle object
 * @param {import("p5")} p p5.js library
 * @param {TextStyle} text_style The text style
 */
function apply_text_style(p, text_style) {
  if (text_style.size !== undefined) {
    p.textSize(text_style.size);
  }

  const h_align = text_style.h_align
    ? get_horizontal_align(p, text_style.h_align)
    : undefined;
  const v_align = text_style.v_align
    ? get_vertical_align(p, text_style.v_align)
    : undefined;

  if (h_align || v_align) {
    p.textAlign(h_align, v_align);
  }
}

/**
 * Apply a transform
 * @param {import("p5")} p p5.js library
 * @param {Transform} transform The transform to apply
 */
function apply_transform(p, transform) {
  const translation = transform.translation;
  p.translate(translation.x, translation.y);
}

/**
 * @typedef {{
 *  style?: Style,
 *  text_style?: TextStyle,
 *  transform?: Transform
 * }} GroupSettings
 */

/**
 * A logical grouping of primitives to be rendered together, in the order
 * listed in the primitives array. This is the main way to apply styling and
 * transformations to primitives.
 *
 * Note: GroupPrimitive can be nested, but the most specific settings will
 * be applied.
 * @implements {Primitive}
 */
export class GroupPrimitive {
  /**
   * Constructor
   * @param {Primitive | Primitive[]} primitives The primitive(s) to store in the group
   * @param {GroupSettings} [settings] Optional settings to apply to everything in the group.
   */
  constructor(primitives, settings) {
    // For convenience, if there is a single primitive, wrap it in an array
    if (!Array.isArray(primitives)) {
      primitives = [primitives];
    }
    this.primitives = primitives;

    settings = settings ?? {};
    this.style = settings.style;
    this.transform = settings.transform;
    this.text_style = settings.text_style;
  }

  *[Symbol.iterator]() {
    yield* this.primitives;
  }

  /**
   * Draw a group primitive. This will always push a new drawing state, apply
   * any settings, and pop at the end.
   * @param {import("p5")} p p5.js library
   */
  draw(p) {
    p.push();
    if (this.style) {
      apply_style(p, this.style);
    }

    if (this.text_style) {
      apply_text_style(p, this.text_style);
    }

    if (this.transform) {
      apply_transform(p, this.transform);
    }

    for (const child of this) {
      child.draw(p);
    }

    p.pop();
  }
}
GroupPrimitive.EMPTY = Object.freeze(new GroupPrimitive([]));
