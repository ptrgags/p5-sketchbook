import { Point } from "../../pga2d/objects.js";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions.js";
import { Direction } from "../../sketchlib/Direction.js";
import { blit_sprite, blit_tilemap, P5Sprite, P5Tilemap } from "./blit.js";
import { DPad } from "./DPad.js";
import { make_maze } from "./make_maze.js";
import { parse_resources } from "./parse_resources.js";
import { Player } from "./Player.js";
import { preload_p5_resources } from "./preload.js";
import { Tilemap } from "./Tilemap.js";
import { Viewport } from "./Viewport.js";

const TILE_SIZE = 16;
const TILE_SCALE = 1;

const MAZE_ROWS = 8;
const MAZE_COLS = 4;
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

const VIEWPORT_MARGIN = Point.direction(2 * TILE_SIZE, 3 * TILE_SIZE);
const VIEWPORT = new Viewport(
  Point.ORIGIN,
  Point.direction(WIDTH, HEIGHT),
  VIEWPORT_MARGIN,
  TILE_SCALE
);

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

  p.preload = () => {
    preload_p5_resources(p, RESOURCE_MANIFEST, p5_resources);
  };

  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;

    // Turn off keyboard events so the arrow keys don't scroll the page
    window.addEventListener("keydown", (e) => {
      if (DPad.is_dpad_key(e.code)) {
        e.preventDefault();
      }
    });

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
      Point.direction(4, 9).scale(TILE_SIZE).to_point()
    );

    p.noSmooth();
  };

  p.draw = () => {
    p.background(0);

    player.update(p.frameCount, tilemap.tilemap);
    const { position, sprite, t } = player.draw(p.frameCount);

    VIEWPORT.track_sprite(position, sprite);

    p.push();
    p.scale(TILE_SCALE, TILE_SCALE);

    blit_tilemap(p, tilemap, VIEWPORT.get_tilemap_origin());

    blit_sprite(
      p,
      new P5Sprite(p5_resources.images.character, sprite),
      t,
      VIEWPORT.map_to_screen(position)
    );

    p.pop();
  };

  p.keyPressed = () => {
    if (DPad.is_dpad_key(p.key)) {
      DPAD.pressed(p.key);
      player.handle_input(DPAD.direction);
      return false;
    } else if (p.key === "x") {
      player.handle_run(true);
      return false;
    }
    return true;
  };

  p.keyReleased = () => {
    if (DPad.is_dpad_key(p.key)) {
      DPAD.released(p.key);
      player.handle_input(DPAD.direction);
      return false;
    } else if (p.key === "x") {
      player.handle_run(false);
      return false;
    }
    return true;
  };
};
