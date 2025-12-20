import { Point } from "../../pga2d/objects.js";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions.js";
import { Direction } from "../../sketchlib/Direction.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { DirectionalPad, DirectionInput } from "../lablib/DirectionalPad.js";
import { blit_sprite, blit_tilemap, P5Sprite, P5Tilemap } from "./blit.js";
import { make_maze } from "./make_maze.js";
import { parse_resources } from "./parse_resources.js";
import { Player } from "./Player.js";
import { preload_p5_resources } from "./preload.js";
import { Tilemap } from "./Tilemap.js";
import { Viewport } from "./Viewport.js";

const TILE_SIZE = 16;
const TILE_SCALE = 2;

const MAZE_ROWS = 20;
const MAZE_COLS = 20;
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
      frame_size: Point.direction(TILE_SIZE, 2 * TILE_SIZE),
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

const MOUSE = new CanvasMouseHandler();
const DPAD = new DirectionalPad();

const VIEWPORT_MARGIN = Point.direction(3, 3).scale(TILE_SIZE);
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
      Point.direction(4, 10).scale(TILE_SIZE).to_point()
    );

    p.noSmooth();

    MOUSE.setup(canvas);
    DPAD.setup();
  };

  p.draw = () => {
    p.background(0);

    player.update_direction(DPAD.direction.digital);
    player.update(p.frameCount, tilemap.tilemap);
    const { position, sprite, t } = player.draw(p.frameCount);

    VIEWPORT.track_sprite(position, sprite);

    p.push();
    p.scale(VIEWPORT.upscale_factor, VIEWPORT.upscale_factor);

    blit_tilemap(p, tilemap, VIEWPORT.map_to_viewport(Point.ORIGIN));

    blit_sprite(
      p,
      new P5Sprite(p5_resources.images.character, sprite),
      t,
      VIEWPORT.map_to_viewport(position)
    );

    p.pop();

    DPAD.render().draw(p);
  };

  p.keyPressed = (/** @type {KeyboardEvent} */ e) => {
    const code = e.code;
    DPAD.key_pressed(code);

    // you have to walk before you can run
    /*else if (p.key === "x") {
      player.handle_run(true);
      return false;
    }*/
  };

  p.keyReleased = (/** @type {KeyboardEvent} */ e) => {
    const code = e.code;
    DPAD.key_released(code);

    /*else if (p.key === "x") {
      player.handle_run(false);
      return false;
    }*/
  };

  MOUSE.mouse_pressed(p, (input) => {
    DPAD.mouse_pressed(input.mouse_coords);
  });

  p.mouseReleased = () => {
    // Even if the mouse is off the canvas, release the D-pad
    DPAD.mouse_released();
  };

  MOUSE.mouse_dragged(p, (input) => {
    DPAD.mouse_dragged(input);
  });
};
