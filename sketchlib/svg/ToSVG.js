/**
 * Primitives that can be converted to SVG
 * @interface ToSVG
 */
export class ToSVG {
  /**
   * Convert this primitive to an SVG element
   * @returns {SVGElement}
   */
  to_svg() {
    throw new Error("not implemented");
  }

  /**
   * Check if an object can be converted to SVG
   * @param {any} x
   * @returns {x is ToSVG}
   */
  static is_svg_compatible(x) {
    return x.to_svg !== undefined;
  }
}
