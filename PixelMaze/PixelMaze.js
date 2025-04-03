import { Point } from "../pga2d/objects.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/Direction.js";
import { blit_sprite, blit_tilemap, P5Sprite, P5Tilemap } from "./blit.js";
import { DPad } from "./DPad.js";
import { make_maze } from "./make_maze.js";
import { parse_resources } from "./parse_resources.js";
import { Player } from "./Player.js";
import { preload_p5_resources } from "./preload.js";
import { Tilemap } from "./Tilemap.js";

const TILE_SIZE = 16;
const TILE_SCALE = 1;

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

const DPAD = new DPad();

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
  let player;
  let viewport_offset = Point.ORIGIN;

  p.preload = () => {
    preload_p5_resources(p, RESOURCE_MANIFEST, p5_resources);
  };

  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;

    parse_resources(RESOURCE_MANIFEST, p5_resources, resources);

    current_sprite = new P5Sprite(
      p5_resources.images.character,
      resources.sprites.walk[Direction.LEFT]
    );
    tilemap = new P5Tilemap(
      p5_resources.images.tileset,
      new Tilemap(resources.image_frames.tileset_basic, INDICES)
    );

    player = new Player(
      resources.sprites.walk,
      resources.sprites.idle,
      Point.direction(4, 9).scale(TILE_SIZE)
    );

    p.noSmooth();
  };

  p.draw = () => {
    p.background(0);

    player.update(p.frameCount, tilemap.tilemap);
    const { position, sprite, t } = player.draw(p.frameCount);

    const VIEWPORT_DIMENSIONS = Point.direction(WIDTH, HEIGHT);
    const VIEWPORT_MARGIN = Point.direction(2 * TILE_SIZE, 3 * TILE_SIZE);

    const { x, y } = position.sub(VIEWPORT_DIMENSIONS.scale(0.5));
    viewport_offset = Point.direction(Math.round(x), Math.round(y));
    //viewport_offset.x = Math.round(viewport_offset.x);
    //viewport_offset.y = Math.round(viewport_offset.y);

    /*
    const from_viewport = position.sub(viewport_offset);

    let viewport_x = viewport_offset.x;
    if (from_viewport.x < VIEWPORT_MARGIN.x) {
      viewport_x = position.x - VIEWPORT_MARGIN.x;
    } else {
      viewport_x =
        position.x + TILE_SIZE + VIEWPORT_MARGIN.x - VIEWPORT_DIMENSIONS.x;
    }

    let viewport_y = viewport_offset.y;
    if (from_viewport.y < VIEWPORT_MARGIN.y) {
      // TODO: The TILE_SIZE should be pulled from sprite direction
      viewport_y = position.y - TILE_SIZE - VIEWPORT_MARGIN.y;
    } else {
      viewport_y =
        position.y + TILE_SIZE + VIEWPORT_MARGIN.y - VIEWPORT_DIMENSIONS.y;
    }

    viewport_offset = Point.direction(viewport_x, viewport_y);
    */

    p.push();
    p.scale(TILE_SCALE, TILE_SCALE);

    blit_tilemap(p, tilemap, viewport_offset.neg());

    blit_sprite(
      p,
      new P5Sprite(p5_resources.images.character, sprite),
      t,
      position.sub(viewport_offset)
    );

    p.pop();
  };

  p.keyPressed = () => {
    if (DPad.is_dpad_key(p.key)) {
      DPAD.pressed(p.key);
      player.handle_input(DPAD.direction);
    } else if (p.key === "z") {
      player.handle_run(true);
    }
  };

  p.keyReleased = () => {
    if (DPad.is_dpad_key(p.key)) {
      DPAD.released(p.key);
      player.handle_input(DPAD.direction);
    } else if (p.key === "z") {
      player.handle_run(false);
    }
  };
};
