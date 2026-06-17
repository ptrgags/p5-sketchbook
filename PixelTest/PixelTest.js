import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ImageLibrary } from "../sketchlib/pixel/ImageLibrary.js";
import { group } from "../sketchlib/primitives/shorthand.js";

const IMGS = new ImageLibrary({
  cube: "sprites/cube.png",
});

const SCENE = group();

function init_sprites() {
  const TILE_SIZE = new Direction(64, 64);

  const cube_strip = IMGS.make_image("cube", new Point(10, 10));
  const whole_cube = IMGS.make_sprite("cube", TILE_SIZE, new Point(200, 200));

  const pyramid = IMGS.make_sprite("cube", TILE_SIZE, new Point(200, 300));
  pyramid.frame_id = 14;

  SCENE.regroup(cube_strip, whole_cube, pyramid);
}

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

    SCENE.draw(p);
  };
};
