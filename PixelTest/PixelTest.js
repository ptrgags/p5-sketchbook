import { Index2D } from "../sketchlib/Grid.js";
import { Clock } from "../sketchlib/animation/Clock.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { make_param } from "../sketchlib/animation/ParamCurve.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ImageLibrary } from "../sketchlib/pixel/ImageLibrary.js";
import { Sprite } from "../sketchlib/pixel/Sprite.js";
import { group, style, xform } from "../sketchlib/primitives/shorthand.js";
import { Rational } from "../sketchlib/Rational.js";
import { DirectionFlags, penrose_edge, penrose_vertex } from "./penrose.js";
import { Drawing } from "../sketchlib/pixel/Drawing.js";
import { Style } from "../sketchlib/Style.js";
import { Color } from "../sketchlib/Color.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";
import { Rigid } from "../sketchlib/primitives/Rigid.js";

const IMGS = new ImageLibrary({
  cube: "sprites/cube.png",
  iso: "sprites/iso-tiles.png",
});

const SCENE = group();

const ISO_TILE_SIZE = new Direction(64, 32);

const RIGID_ORBIT = new Rigid({
  translation: SCREEN_CENTER.to_direction(),
  rotation: 0,
});
const RIGID_SPIN = new Rigid({
  translation: Direction.DIR_X.scale(150),
  rotation: 0,
});
const FREQ_ORBIT = 0.25;
const FREQ_SPIN = FREQ_ORBIT * 2;

/**
 * @type {Sprite}
 */
let spr_animated;

/**
 * @type {Sprite}
 */
let chopped_sprite;

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
    new Point(16, 112),
  );
  penrose_vertex(
    penrose,
    new Index2D(0, 0),
    DirectionFlags.NEG_Z | DirectionFlags.POS_Y,
  );
  penrose_vertex(
    penrose,
    new Index2D(4, 4),
    DirectionFlags.NEG_Y | DirectionFlags.NEG_Z | DirectionFlags.POS_X,
  );
  penrose_vertex(
    penrose,
    new Index2D(8, 0),
    DirectionFlags.NEG_X | DirectionFlags.POS_Y | DirectionFlags.POS_Z,
  );
  penrose_vertex(
    penrose,
    new Index2D(12, 4),
    DirectionFlags.NEG_Y | DirectionFlags.POS_Z,
  );
  penrose_edge(penrose, new Index2D(6, 2), "x");
  penrose_edge(penrose, new Index2D(2, 2), "y");
  penrose_edge(penrose, new Index2D(10, 2), "y");
  penrose_edge(penrose, new Index2D(4, 0), "z");
  penrose_edge(penrose, new Index2D(8, 4), "z");

  const tile_size = new Direction(64, 64);

  const cube_strip = IMGS.make_image("cube", new Point(10, 10));
  const whole_cube = IMGS.make_sprite("cube", tile_size, new Point(200, 200));

  const pyramid = IMGS.make_sprite("cube", tile_size, new Point(200, 300));
  pyramid.frame_id = 14;

  const center = new Point(32, 32);
  spr_animated = IMGS.make_sprite("cube", tile_size, Point.ORIGIN, center);

  // create an offscreen buffer, draw on it with the primitive system, then
  // chop it up and use it like a tilemap!
  const motif_style = new Style({
    stroke: Color.BLACK,
    fill: Color.RED,
  });
  const motif_scene = style(
    [
      new Rect(new Point(0, 10), new Direction(32, 4)),
      new Rect(new Point(0, 18), new Direction(32, 4)),
      new Circle(new Point(16, 16), 10),
    ],
    motif_style,
  );
  const gfx = p.createGraphics(32, 32);
  gfx.noSmooth();
  const drawing = new Drawing(gfx, new Point(350, 150));
  drawing.draw_primitive(motif_scene);

  const chopped = new Tilemap(
    p,
    gfx,
    new Direction(16, 16),
    new Direction(4, 4),
    new Point(350 + 64, 150),
  );
  chopped.blit_all([
    [1, 2, 1, 2],
    [3, 0, 3, 0],
    [1, 2, 1, 2],
    [3, 0, 3, 0],
  ]);

  chopped_sprite = new Sprite(
    gfx,
    new Direction(16, 32),
    new Point(350, 200),
    0,
    Point.ORIGIN,
  );

  SCENE.regroup(
    cube_strip,
    iso_tiles,
    truchet,
    penrose,
    whole_cube,
    pyramid,

    drawing,
    chopped,
    chopped_sprite,
    xform(xform(spr_animated, RIGID_SPIN), RIGID_ORBIT),
  );
}

const FRAME_CURVE = LoopCurve.from_timeline(make_param(0, 3, Rational.ONE));

/**
 *
 * @param {number} time
 */
function update_animated(time) {
  RIGID_ORBIT.rotation = -2 * Math.PI * FREQ_ORBIT * time;
  RIGID_SPIN.rotation = -2 * Math.PI * FREQ_SPIN * time;

  if (spr_animated) {
    spr_animated.frame_id = Math.floor(FRAME_CURVE.value(time) || 0);
  }
}

/**
 *
 * @param {number} time
 */
function update_chopped_sprite(time) {
  if (!chopped_sprite) {
    return;
  }

  chopped_sprite.frame_id = Math.floor(time % 2);
}

const CLOCK = new Clock();

// @ts-ignore
export const sketch = (p) => {
  p.setup = async () => {
    await IMGS.preload(p);

    p.createCanvas(WIDTH, HEIGHT);

    p.noSmooth();
    p.pixelDensity(1);

    init_sprites(p);
  };

  p.draw = () => {
    p.background(128);

    const time = CLOCK.elapsed_time;
    update_animated(time);
    update_chopped_sprite(time);

    SCENE.draw(p);
  };
};
