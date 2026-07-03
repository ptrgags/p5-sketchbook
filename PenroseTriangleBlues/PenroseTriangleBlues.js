import {
  DIAGONAL,
  EDGE_HIGHLIGHT_OFFSET,
  iso_edge_patch,
  VERTICAL,
} from "../PixelTest/iso_tiles.js";
import { Clock } from "../sketchlib/animation/Clock.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Index2D } from "../sketchlib/Grid.js";
import { Tempo } from "../sketchlib/music/Tempo.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ImageLibrary } from "../sketchlib/pixel/ImageLibrary.js";
import { group } from "../sketchlib/primitives/shorthand.js";

const IMGS = new ImageLibrary({
  iso: "../PixelTest/sprites/iso-tiles.png",
});

const ISO_TILE_SIZE = new Direction(64, 32);
const TILE_ORIGIN = new Point(10, 10);

const ISO_DIR = {
  x: ISO_TILE_SIZE.mul_components(new Direction(-1, 1)),
  y: ISO_TILE_SIZE.mul_components(new Direction(1, 1)),
  z: ISO_TILE_SIZE.mul_components(new Direction(0, 2)),
};

const SCENE = group();

const CLOCK = new Clock();

const PATCH_X = iso_edge_patch(
  [
    [DIAGONAL, DIAGONAL, 0],
    [DIAGONAL, DIAGONAL, VERTICAL],
    [0, VERTICAL, VERTICAL],
    [0, VERTICAL | DIAGONAL, 0],
  ],
  EDGE_HIGHLIGHT_OFFSET,
);

const PATCH_X_UNDER = iso_edge_patch(
  [
    [0, DIAGONAL, 0],
    [0, DIAGONAL, VERTICAL],
    [0, VERTICAL, VERTICAL],
    [0, VERTICAL | DIAGONAL, 0],
  ],
  EDGE_HIGHLIGHT_OFFSET,
);

const PATCH_Y = iso_edge_patch(
  [
    [DIAGONAL, DIAGONAL, 0],
    [VERTICAL | DIAGONAL, DIAGONAL, 0],
    [VERTICAL, VERTICAL, 0],
    [DIAGONAL, VERTICAL, 0],
  ],
  EDGE_HIGHLIGHT_OFFSET,
);

const PATCH_Y_UNDER = iso_edge_patch(
  [
    [DIAGONAL, DIAGONAL, 0],
    [VERTICAL | DIAGONAL, DIAGONAL, 0],
    [VERTICAL, 0, 0],
    [0, 0, 0],
  ],
  EDGE_HIGHLIGHT_OFFSET,
);

const PATCH_Z = iso_edge_patch(
  [
    [0, 0, 0],
    [VERTICAL | DIAGONAL, DIAGONAL, VERTICAL],
    [VERTICAL, VERTICAL, VERTICAL],
    [DIAGONAL, VERTICAL | DIAGONAL, 0],
  ],
  EDGE_HIGHLIGHT_OFFSET,
);

const PATCH_Z_UNDER = iso_edge_patch(
  [
    [0, 0, 0],
    [VERTICAL | DIAGONAL, 0, 0],
    [VERTICAL, VERTICAL, 0],
    [DIAGONAL, VERTICAL | DIAGONAL, 0],
  ],
  EDGE_HIGHLIGHT_OFFSET,
);

/**
 *
 * @param {import("p5")} p
 */
function init_sprites(p) {
  const highlight_y = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(3, 4),
    TILE_ORIGIN,
  );
  highlight_y.blit_patch(new Index2D(0, 0), PATCH_Y);

  const highlight_y_under = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(3, 4),
    TILE_ORIGIN.add(ISO_DIR.y.scale(3)),
  );
  highlight_y_under.blit_patch(new Index2D(0, 0), PATCH_Y_UNDER);

  const highlight_x = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(3, 4),
    TILE_ORIGIN.add(ISO_DIR.y.scale(4)),
  );
  highlight_x.blit_patch(new Index2D(0, 0), PATCH_X);

  const highlight_x_under = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(3, 4),
    TILE_ORIGIN.add(ISO_DIR.y.scale(4)).add(ISO_DIR.x.scale(3)),
  );
  highlight_x_under.blit_patch(new Index2D(0, 0), PATCH_X_UNDER);

  const highlight_z = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(3, 4),
    TILE_ORIGIN.add(ISO_DIR.z.scale(4)),
  );
  highlight_z.blit_patch(new Index2D(0, 0), PATCH_Z);

  const highlight_z_under = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(3, 4),
    TILE_ORIGIN.add(ISO_DIR.z.scale(1)),
  );
  highlight_z_under.blit_patch(new Index2D(0, 0), PATCH_Z_UNDER);

  SCENE.regroup(
    highlight_y,
    highlight_y_under,
    highlight_x,
    highlight_x_under,
    highlight_z,
    highlight_z_under,
  );
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

    init_sprites(p);
  };

  p.draw = () => {
    p.background(0);

    const time = Tempo.sec_to_measures(CLOCK.elapsed_time, 128);

    SCENE.draw(p);
  };
};
