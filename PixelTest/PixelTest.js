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
});

const SCENE = group();

/**
 * @type {Sprite}
 */
let animated;

function init_sprites() {
  const TILE_SIZE = new Direction(64, 64);

  const cube_strip = IMGS.make_image("cube", new Point(10, 10));
  const whole_cube = IMGS.make_sprite("cube", TILE_SIZE, new Point(200, 200));

  const pyramid = IMGS.make_sprite("cube", TILE_SIZE, new Point(200, 300));
  pyramid.frame_id = 14;

  animated = IMGS.make_sprite("cube", TILE_SIZE, new Point(400, 300));

  SCENE.regroup(cube_strip, whole_cube, pyramid, animated);
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

    init_sprites();
  };

  p.draw = () => {
    p.background(0);

    update_animated(CLOCK.elapsed_time);

    SCENE.draw(p);
  };
};
