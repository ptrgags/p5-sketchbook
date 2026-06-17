import { Point } from "../pga2d/Point.js";
import { Image } from "./Image.js";

export class ImageLibrary {
  /**
   * Constructor
   * @param {{[id: string]: string}} manifest Dictionary of image ID to URL for an image
   */
  constructor(manifest) {
    this.manifest = manifest;
    /**
     * @type {{[id: string]: import("p5").Image}}
     */
    this.images = {};
  }

  /**
   * Call this in preload
   * @param {import("p5")} p
   */
  preload(p) {
    for (const [id, url] of Object.entries(this.manifest)) {
      // preload changed in p5.js 2.0 so the type hints are wonky
      // @ts-ignore
      this.images[id] = p.loadImage(url);
    }
  }

  /**
   * Create an image
   * @param {string} id ID. it must match one of the keys declared in the manifest
   * @param {Point} position Initial position for the image
   * @returns {Image}
   */
  make_image(id, position) {
    const img = this.images[id];
    if (!img) {
      throw new Error(`unknown image ID ${id}`);
    }

    return new Image(img, position);
  }
}
