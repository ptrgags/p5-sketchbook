import { Point } from "../../pga2d/objects.js";
import { ImageFrames } from "./ImageFrames.js";
import { Sprite } from "./Sprite.js";

function parse_image_frames(p5_images, manifest, image_frames) {
  for (const [id, tileset_info] of Object.entries(manifest)) {
    const { image, frame_size } = tileset_info;
    const p5_image = p5_images[image];
    const dimensions = new Direction(p5_image.width, p5_image.height);

    const tileset = new ImageFrames(dimensions, frame_size);
    image_frames[id] = tileset;
  }
}

function parse_sprites(manifest, image_frames, sprites) {
  for (const [id, sprite_info] of Object.entries(manifest)) {
    const { type, spritesheet, origin: maybe_origin } = sprite_info;
    const frames = image_frames[spritesheet];
    const origin = maybe_origin ?? Point.ZERO;

    if (type === "directional") {
      const { start_row, frame_count, origin } = sprite_info;
      sprites[id] = Sprite.make_direction_sprites(
        frames,
        start_row,
        frame_count,
        origin
      );
    } else if (type === "row") {
      const { row, frame_count, origin } = sprite_info;
      sprites[id] = Sprite.from_row(frames, row, frame_count, origin);
    } else if (type === "sprite") {
      const { start_frame, frame_count } = sprite_info;
      sprites[id] = new Sprite(frames, start_frame, frame_count, origin);
    } else {
      throw new Error(`invalid sprite type: ${type}`);
    }
  }
}

export function parse_resources(manifest, p5_resources, resources) {
  parse_image_frames(
    p5_resources.images,
    manifest.image_frames,
    resources.image_frames
  );
  parse_sprites(manifest.sprites, resources.image_frames, resources.sprites);
}
