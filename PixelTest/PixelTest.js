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
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";

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

const ISO_BASIS_TILES = {
  x: new Direction(-1, 1),
  y: new Direction(1, 1),
  z: new Direction(0, -2),
};

/**
 *
 * @param {Tilemap} tilemap
 * @param {Index2D} coords
 */
function blit_cube(tilemap, coords) {
  tilemap.blit_patch(coords, PATCH_CUBE_FACES);
  tilemap.blit_patch(coords, PATCH_CUBE_EDGES);
}

/**
 * @param {Tilemap} tilemap The tilemap to blit into
 * @param {Index2D} center_coords coordinates for the top left of the center cube
 * @param {boolean[]} connection_flags flags for (-x, -y, -z, +x, +y, +z) connections
 */
function penrose_vertex(tilemap, center_coords, connection_flags) {
  const [neg_x, neg_y, neg_z, pos_x, pos_y, pos_z] = connection_flags;

  // convert to a direction to do math
  const center_dir = new Direction(center_coords.j, center_coords.i);

  // -x, -y, -z are farthest away from viewer so render them first
  if (neg_x) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.x.neg());
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  if (neg_y) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.y.neg());
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  if (neg_z) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.z.neg());
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  // center cube is always present
  blit_cube(tilemap, center_coords);

  // +x, +y, +z are closest to the viewer
  if (pos_x) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.x);
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  if (pos_y) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.y);
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  if (pos_z) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.z);
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }
}

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

  // For now, let's manually pick out tiles to make a cube where only the top
  // is filled in.
  iso_tiles.blit_tile(new Index2D(0, 0), 12);
  iso_tiles.blit_tile(new Index2D(0, 1), 8);
  iso_tiles.blit_tile(new Index2D(1, 0), 1);
  iso_tiles.blit_tile(new Index2D(1, 1), 5);

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

  // Make a truchet pattern that fills a whole tilemap
  const truchet = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(4, 4),
    new Point(0, 550),
  );
  truchet.blit_all([
    [10, 11, 10, 11],
    [10, 11, 10, 11],
    [10, 11, 10, 11],
    [10, 11, 10, 11],
  ]);

  const penrose = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(7, 16),
  );
  penrose_vertex(penrose, new Index2D(0, 0), [
    false,
    false,
    true,
    false,
    true,
    false,
  ]);
  penrose_vertex(penrose, new Index2D(4, 4), [
    false,
    true,
    true,
    true,
    false,
    false,
  ]);
  penrose_vertex(penrose, new Index2D(8, 0), [
    true,
    false,
    false,
    false,
    true,
    true,
  ]);
  penrose_vertex(penrose, new Index2D(12, 4), [
    false,
    true,
    false,
    false,
    false,
    true,
  ]);

  const tile_size = new Direction(64, 64);

  const cube_strip = IMGS.make_image("cube", new Point(10, 10));
  const whole_cube = IMGS.make_sprite("cube", tile_size, new Point(200, 200));

  const pyramid = IMGS.make_sprite("cube", tile_size, new Point(200, 300));
  pyramid.frame_id = 14;

  const center = new Point(32, 32);
  animated = IMGS.make_sprite("cube", tile_size, new Point(400, 300), center);

  /*
  SCENE.regroup(
    iso_tiles,
    iso_patch,
    truchet,
    cube_strip,
    whole_cube,
    pyramid,
    animated,
  );
  */

  SCENE.regroup(penrose);
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
