import { Point } from "../pga2d/objects.js";
import { ImageFrames } from "./ImageFrames.js";
import { Sprite } from "./Sprite.js";
import { Tilemap } from "./Tilemap.js";

/**
 * Low-level function for pasting a single-frame sprite/tile to the screen.
 * @param {any} p p5 instance
 * @param {any} p5_image p5.Image for the image frames
 * @param {ImageFrames} image_frames The layout of the image frames
 * @param {number} frame_id The ID of the frame to draw
 * @param {Point} position The position of the top left corner of the grid on the screen
 */
function blit_frame(p, p5_image, image_frames, frame_id, position) {
  const frame_offset = image_frames.get_frame_offset(frame_id);
  const dims = image_frames.frame_size;

  p.image(
    p5_image,
    position.x,
    position.y,
    dims.x,
    dims.y,
    frame_offset.x,
    frame_offset.y,
    dims.x,
    dims.y
  );
}

export class P5Sprite {
  constructor(p5_image, sprite) {
    this.p5_image = p5_image;
    this.sprite = sprite;

    // TODO: check that the dimensions match
  }

  get spritesheet() {
    return this.sprite.spritesheet;
  }

  get_frame_id(t) {
    return this.sprite.get_frame_id(t);
  }
}

/**
 *
 * @param {any} p p5 instance
 * @param {P5Sprite} p5_sprite Sprite including p5 sprite information
 * @param {number} t The animation time
 * @param {Point} position The position
 */
export function blit_sprite(p, p5_sprite, t, position) {
  const frame_id = p5_sprite.get_frame_id(t);
  blit_frame(p, p5_sprite.p5_image, p5_sprite.spritesheet, frame_id, position);
}

export class P5Tilemap {
  /**
   *
   * @param {any} p5_image p5.image
   * @param {Tilemap} tilemap tilemap
   */
  constructor(p5_image, tilemap) {
    this.p5_image = p5_image;
    this.tilemap = tilemap;
  }
}

/**
 * Blit a tilemap to the screen at once
 * @param {any} p p5 instance
 * @param {P5Tilemap} p5_tilemap The tilemap to draw
 * @param {Point} origin The position to draw
 */
export function blit_tilemap(p, p5_tilemap, origin) {
  const { tileset, indices } = p5_tilemap.tilemap;
  const tile_size = tileset.frame_size.x;
  indices.for_each((index, tile_id) => {
    const { i, j } = index;
    const offset = Point.direction(j, i).scale(tile_size);
    const position = origin.add(offset);
    blit_frame(p, p5_tilemap.p5_image, tileset, tile_id, position);
  });
}
