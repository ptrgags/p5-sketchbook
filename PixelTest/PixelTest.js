import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ImageLibrary } from "../sketchlib/pixel/ImageLibrary.js";
import { group } from "../sketchlib/primitives/shorthand.js";

const IMGS = new ImageLibrary({
  cube: "sprites/cube.png",
  iso: "sprites/iso-tiles.png",
});

const SCENE = group();

const ISO_TILE_SIZE = new Direction(64, 32);

function init_sprites(p) {
  const cube_strip = IMGS.make_image("cube", new Point(10, 10));

  const iso_tiles = IMGS.make_tileset(
    p,
    "iso",
    ISO_TILE_SIZE,
    new Direction(4, 8),
  );
  iso_tiles.position = new Point(16, 250);

  // For now, let's manually pick out tiles to make a single iso grid
  // square from four triangles
  iso_tiles.set_tile(new Index2D(0, 0), 12);
  iso_tiles.set_tile(new Index2D(0, 1), 8);
  iso_tiles.set_tile(new Index2D(1, 0), 17);
  iso_tiles.set_tile(new Index2D(1, 1), 29);
  iso_tiles.set_tile(new Index2D(2, 0), 18);
  iso_tiles.set_tile(new Index2D(2, 1), 27);
  iso_tiles.set_tile(new Index2D(3, 0), 2);
  iso_tiles.set_tile(new Index2D(3, 1), 7);

  // now for the edges
  const EDGE_OFFSET = 32;
  iso_tiles.set_tile(new Index2D(0, 0), EDGE_OFFSET + 6);
  iso_tiles.set_tile(new Index2D(0, 1), EDGE_OFFSET + 2);
  iso_tiles.set_tile(new Index2D(1, 0), EDGE_OFFSET + 3);
  iso_tiles.set_tile(new Index2D(1, 1), EDGE_OFFSET + 6);
  iso_tiles.set_tile(new Index2D(1, 2), EDGE_OFFSET + 1); // the outline for the rightmost edge is in the next tile over
  iso_tiles.set_tile(new Index2D(2, 0), EDGE_OFFSET + 1);
  iso_tiles.set_tile(new Index2D(2, 1), EDGE_OFFSET + 1);
  iso_tiles.set_tile(new Index2D(2, 2), EDGE_OFFSET + 1);
  iso_tiles.set_tile(new Index2D(3, 0), EDGE_OFFSET + 2);
  iso_tiles.set_tile(new Index2D(3, 1), EDGE_OFFSET + 7);

  SCENE.regroup(iso_tiles, cube_strip);
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
    p.background(128);

    SCENE.draw(p);
  };
};
