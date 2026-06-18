import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Image } from "./Image.js";
import { Tilemap } from "./Tilemap.js";
import { Sprite } from "./Sprite.js";

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
   * Get a p5 Image from the library. This must be called in setup() or later
   * timing-wise.
   * @param {string} id Image ID. It must match one of the keys of the manifest
   * @returns {import("p5").Image} The loaded image
   */
  get_p5_image(id) {
    const img = this.images[id];
    if (!img) {
      throw new Error(`unknown image ID ${id}`);
    }
    return img;
  }

  /**
   * Shorthand for creating an image primitive
   * @param {string} id ID. it must match one of the keys declared in the manifest
   * @param {Point} position Initial position for the image
   * @returns {Image}
   */
  make_image(id, position) {
    const img = this.get_p5_image(id);
    return new Image(img, position);
  }

  /**
   * Shorthand for creating a sprite primitive
   * @param {string} id image ID for the spritesheet. It must match
   * @param {Direction} frame_size Size of each frame
   * @param {Point} position Position on the screen for the sprite
   * @param {Point} [origin=Point.ORIGIN] The anchor point for positioning the sprite
   * @param {number} [frame_id=0] The frame to use
   * @returns {Sprite}
   */
  make_sprite(id, frame_size, position, origin = Point.ORIGIN, frame_id = 0) {
    const spritesheet = this.get_p5_image(id);
    return new Sprite(spritesheet, frame_size, position, frame_id, origin);
  }

  /**
   * Shorthand for making a tilemap
   * @param {import("p5")} p
   * @param {string} id
   * @param {Direction} tile_size
   * @param {Direction} map_size
   * @param {Point} [position=Point.ORIGIN] Where to draw the tilemap
   */
  make_tilemap(p, id, tile_size, map_size, position) {
    const tileset = this.get_p5_image(id);
    return new Tilemap(p, tileset, tile_size, map_size, position);
  }
}
