import { Index2D } from "../sketchlib/Grid.js";
import { Clock } from "../sketchlib/animation/Clock.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { make_param } from "../sketchlib/animation/ParamCurve.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ImageLibrary } from "../sketchlib/pixel/ImageLibrary.js";
import { Sprite } from "../sketchlib/pixel/Sprite.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { Rational } from "../sketchlib/Rational.js";

const IMGS = new ImageLibrary({
  cube: "sprites/cube.png",
  iso: "sprites/iso-tiles.png",
});

const SCENE = group();

const ISO_TILE_SIZE = new Direction(64, 32);

/**
 * @type {Sprite}
 */
let animated;

const PATCH_CUBE_FACES = [
  [12, 8],
  [17, 29],
  [18, 27],
  [2, 7],
];

const EDGE_OFFSET = 32;
const PATCH_CUBE_EDGES = [
  [EDGE_OFFSET + 6, EDGE_OFFSET + 2, EDGE_OFFSET + 0],
  [EDGE_OFFSET + 3, EDGE_OFFSET + 6, EDGE_OFFSET + 1],
  [EDGE_OFFSET + 1, EDGE_OFFSET + 1, EDGE_OFFSET + 1],
  [EDGE_OFFSET + 2, EDGE_OFFSET + 7, EDGE_OFFSET + 0],
];

/**
 *
 * @param {import("p5")} p
 */
function init_sprites(p) {
  const iso_tiles = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(4, 8),
    new Point(16, 150),
  );

  // For now, let's manually pick out tiles to make a single iso grid
  // square from four triangles
  iso_tiles.blit_tile(new Index2D(0, 0), 12);
  iso_tiles.blit_tile(new Index2D(0, 1), 8);
  iso_tiles.blit_tile(new Index2D(1, 0), 17);
  iso_tiles.blit_tile(new Index2D(1, 1), 29);
  iso_tiles.blit_tile(new Index2D(2, 0), 18);
  iso_tiles.blit_tile(new Index2D(2, 1), 27);
  iso_tiles.blit_tile(new Index2D(3, 0), 2);
  iso_tiles.blit_tile(new Index2D(3, 1), 7);

  // now for the edges
  const EDGE_OFFSET = 32;
  iso_tiles.blit_tile(new Index2D(0, 0), EDGE_OFFSET + 6);
  iso_tiles.blit_tile(new Index2D(0, 1), EDGE_OFFSET + 2);
  iso_tiles.blit_tile(new Index2D(1, 0), EDGE_OFFSET + 3);
  iso_tiles.blit_tile(new Index2D(1, 1), EDGE_OFFSET + 6);
  iso_tiles.blit_tile(new Index2D(1, 2), EDGE_OFFSET + 1); // the outline for the rightmost edge is in the next tile over
  iso_tiles.blit_tile(new Index2D(2, 0), EDGE_OFFSET + 1);
  iso_tiles.blit_tile(new Index2D(2, 1), EDGE_OFFSET + 1);
  iso_tiles.blit_tile(new Index2D(2, 2), EDGE_OFFSET + 1);
  iso_tiles.blit_tile(new Index2D(3, 0), EDGE_OFFSET + 2);
  iso_tiles.blit_tile(new Index2D(3, 1), EDGE_OFFSET + 7);

  const iso_patch = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(5, 8),
    new Point(36, 300),
  );
  // blit whole cubes at a time
  iso_patch.blit_patch(new Index2D(0, 0), PATCH_CUBE_FACES);
  iso_patch.blit_patch(new Index2D(0, 0), PATCH_CUBE_EDGES);
  iso_patch.blit_patch(new Index2D(0, 2), PATCH_CUBE_FACES);
  iso_patch.blit_patch(new Index2D(0, 2), PATCH_CUBE_EDGES);
  iso_patch.blit_patch(new Index2D(3, 1), PATCH_CUBE_FACES);
  iso_patch.blit_patch(new Index2D(3, 1), PATCH_CUBE_EDGES);
  // these next ones partial cover existing tiles
  iso_patch.blit_patch(new Index2D(1, 1), PATCH_CUBE_FACES);
  iso_patch.blit_patch(new Index2D(1, 1), PATCH_CUBE_EDGES);
  iso_patch.blit_patch(new Index2D(2, 2), PATCH_CUBE_FACES);
  iso_patch.blit_patch(new Index2D(2, 2), PATCH_CUBE_EDGES);

  const tile_size = new Direction(64, 64);

  const cube_strip = IMGS.make_image("cube", new Point(10, 10));
  const whole_cube = IMGS.make_sprite("cube", tile_size, new Point(200, 200));

  const pyramid = IMGS.make_sprite("cube", tile_size, new Point(200, 300));
  pyramid.frame_id = 14;

  const center = new Point(32, 32);
  animated = IMGS.make_sprite("cube", tile_size, new Point(400, 300), center);

  SCENE.regroup(
    iso_tiles,
    iso_patch,
    cube_strip,
    whole_cube,
    pyramid,
    animated,
  );
}

const FRAME_CURVE = LoopCurve.from_timeline(make_param(0, 3, Rational.ONE));

/**
 *
 * @param {number} time
 */
function update_animated(time) {
  if (!animated) {
    return;
  }

  const offset = Direction.from_angle(2 * time).scale(100);
  animated.position = SCREEN_CENTER.add(offset);
  animated.frame_id = Math.floor(FRAME_CURVE.value(time) || 0);
}

const CLOCK = new Clock();

// @ts-ignore
export const sketch = (p) => {
  p.preload = () => {
    IMGS.preload(p);
  };

  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );

    init_sprites(p);
  };

  p.draw = () => {
    p.background(128);

    update_animated(CLOCK.elapsed_time);

    SCENE.draw(p);
  };
};
