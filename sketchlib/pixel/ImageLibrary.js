import { Direction } from "../pga2d/Direction.js";

/**
 * @typedef {{
 *  url: string,
 *  dimensions: Direction
 * }} ImageDeclaration
 */

export class ImageLibrary {
  /**
   * Constructor
   * @param {{[id: string]: ImageDeclaration}} images
   */
  constructor(images) {
    this.image_declarations = images;
    /**
     * @type {{[id: string]: import("p5").Image}}
     */
    this.images = {};
  }

  /**
   * Preload resources
   * @param {import("p5")} p
   */
  preload(p) {
    for (const [id, decl] of Object.entries(this.image_declarations)) {
      // ugh... the types changed in p5 2.0, so TypeScript is getting very
      // confused...
      const img = p.loadImage(decl.url);
      this.images[id] = img;

      const actual_dimensions = new Direction(img.width, img.height);
      if (!decl.dimensions.equals(actual_dimensions)) {
        throw new Error(
          `loaded image ${decl} is the wrong size! expected ${decl.dimensions.toString()}, got ${actual_dimensions.toString()}`,
        );
      }
    }
  }
}
