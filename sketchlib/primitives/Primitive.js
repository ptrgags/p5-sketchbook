/**
 * Interface for geometric primitives that can be drawn when passed a p5
 * instance. Some properties of primitives:
 *
 * - Primitives are composable. GroupPrimitive acts as a container
 * for other primitives, with additional styling and transformations.
 * - Often, I like to make primitives immutable. Construct as much as I can
 * once at the start of a sketch, then render as often as needed.
 * - However, in scenes with dynamic geometry, there may be cases where I
 * make primitives with inner immutability if that helps with performance.
 * - This decouples my sketch code (which uses a lot of custom types like Point)
 * from the p5 drawing commands
 *
 * @interface Primitive
 */
export class Primitive {
  /**
   * Draw the primitive to the screen
   * @param {import("p5")} p the p5.js instance
   */
  draw(p) {
    throw new Error("not implemented: draw(p)")
  }
}
