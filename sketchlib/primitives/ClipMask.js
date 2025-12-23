import { Primitive } from "./Primitive.js";

/**
 * A clipping mask, which handles organizing the p5.beginClip()/p5.endClip()
 * commands as these can be confusing. See Mask, InvMask, and
 * IntersectionMask for specific versions.
 *
 * These masks are intended for use with the ClipPrimitive and VectorTangle
 * primitives
 *
 * @interface ClipMask
 */
export class ClipMask {
  /**
   * Draw the clip path
   * @param {import("p5")} p p5.js instance
   */
  clip(p) {
    throw new Error("Not implemented: clip(p)");
  }
}

/**
 * Clipping mask. The child primitives are drawn to the clip path (implicitly
 * UNION-ing them together).
 *
 * The styling of mask primitives does not matter, masking is done by which
 * pixels are rendered. Filled primitives are usually best
 *
 * @implements {ClipMask}
 */
export class Mask {
  /**
   * Constructor
   * @param  {...Primitive} primitives The primitives to render. They will be
   * implicitly UNIONed together. None of the primitives or their descendants
   * can be a ClipPrimitive or VectorTangle, or you will end up nesting
   * beginClip/endClip blocks. This is {@link https://github.com/processing/p5.js/blob/main/src/core/p5.Renderer.js#L107 | disallowed by p5.js}
   */
  constructor(...primitives) {
    this.primitives = primitives;
  }

  /**
   * Set the clip path as the union of the mask's primitives
   * @param {import("p5")} p p5.js instance
   */
  clip(p) {
    p.beginClip();
    for (const child of this.primitives) {
      child.draw(p);
    }
    p.endClip();
  }
}

/**
 * Same thing as Mask, but the mask is drawn inverted. When multiple
 * primitives are included, this is the equivalent of doing
 * NOT (union of primitives)
 *
 * @implements {ClipMask}
 */
export class InvMask extends Mask {
  /**
   * Set the clip path as NOT(union of primitives)
   * @param {import("p5")} p p5.js instance
   */
  clip(p) {
    p.beginClip({ invert: true });
    for (const child of this.primitives) {
      child.draw(p);
    }
    p.endClip();
  }
}

/**
 * A collection of masks that are intersected together. This is done
 * by making a sequence of beginClip/endClip blocks.
 *
 * The fact that subsequent clip paths gives intersection is not at all obvious,
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip |MDN docs for canvas clip() function}
 * for where I learned this
 *
 * @implements {ClipMask}
 */
export class IntersectionMask {
  /**
   * Constructor
   * @param  {...ClipMask} masks
   */
  constructor(...masks) {
    this.masks = masks;
  }

  /**
   * Draw the clip path
   * @param {import("p5")} p p5.js instance
   */
  clip(p) {
    for (const mask of this.masks) {
      mask.clip(p);
    }
  }
}
