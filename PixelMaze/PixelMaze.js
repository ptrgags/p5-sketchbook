import { Point } from "../pga2d/objects.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";
import { GridDirection } from "../sketchlib/GridDiection.js";
import { generate_maze } from "../sketchlib/RandomDFSMaze.js";
import { blit_sprite, blit_tilemap, P5Sprite, P5Tilemap } from "./blit.js";
import { make_maze } from "./make_maze.js";
import { parse_resources } from "./parse_resources.js";
import { preload_p5_resources } from "./preload.js";
import { Tilemap } from "./Tilemap.js";

const TILE_SIZE = 16;
const TILE_SCALE = 2;

const MAZE_ROWS = 4;
const MAZE_COLS = 3;
const INDICES = make_maze(MAZE_ROWS, MAZE_COLS);

const ORIGIN_CHARACTER = Point.direction(0, TILE_SIZE);
const RESOURCE_MANIFEST = {
  images: {
    tileset: "./sprites/placeholder-tileset.png",
    character: "./sprites/placeholder-character.png",
  },
  image_frames: {
    tileset_basic: {
      image: "tileset",
      frame_size: Point.direction(TILE_SIZE, TILE_SIZE),
    },
    character: {
      image: "character",
      frame_size: Point.point(TILE_SIZE, 2 * TILE_SIZE),
    },
  },
  sprites: {
    walk: {
      type: "directional",
      spritesheet: "character",
      start_row: 0,
      frame_count: 4,
      origin: ORIGIN_CHARACTER,
    },
    idle: {
      type: "directional",
      spritesheet: "character",
      start_row: 4,
      frame_count: 2,
      origin: ORIGIN_CHARACTER,
    },
  },
};

export const sketch = (p) => {
  let canvas;

  // p5.js specific resources
  const p5_resources = {
    images: {},
  };

  // logical resources that do not depend on p5.js
  const resources = {
    image_frames: {},
    sprites: {},
  };

  let current_sprite;
  let tilemap;

  p.preload = () => {
    preload_p5_resources(p, RESOURCE_MANIFEST, p5_resources);
  };

  p.setup = () => {
    canvas = p.createCanvas(500, 700).elt;

    parse_resources(RESOURCE_MANIFEST, p5_resources, resources);

    current_sprite = new P5Sprite(
      p5_resources.images.character,
      resources.sprites.walk[GridDirection.LEFT]
    );
    tilemap = new P5Tilemap(
      p5_resources.images.tileset,
      new Tilemap(resources.image_frames.tileset_basic, INDICES)
    );

    p.noSmooth();
  };

  p.draw = () => {
    p.background(0);

    p.push();
    p.scale(TILE_SCALE, TILE_SCALE);
    blit_tilemap(p, tilemap, Point.ORIGIN);

    const t = p.frameCount / 16.0;

    const sprite_pos = Point.direction(1, 6).scale(TILE_SIZE);
    blit_sprite(p, current_sprite, t, sprite_pos);

    p.pop();
  };
};
