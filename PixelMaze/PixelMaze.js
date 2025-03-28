const TILE_SIZE = 16;
const TILE_SCALE = 2;

export const sketch = (p) => {
  let canvas;
  const images = {};

  p.preload = () => {
    images.tileset = p.loadImage("./sprites/placeholder-tileset.png");
    images.walk_cycle = p.loadImage("./sprites/placeholder-walk-cycle.png");
  };

  p.setup = () => {
    canvas = p.createCanvas(500, 700).elt;
    p.noSmooth();
  };

  p.draw = () => {
    p.background(0);

    p.image(
      images.tileset,
      0,
      0,
      TILE_SCALE * TILE_SIZE,
      TILE_SCALE * 3 * TILE_SIZE
    );
    p.image(
      images.walk_cycle,

      4 * TILE_SCALE * TILE_SIZE,
      0,
      TILE_SCALE * TILE_SIZE,
      TILE_SCALE * 2 * TILE_SIZE,
      // source
      0,
      0,
      TILE_SIZE,
      2 * TILE_SIZE
    );
  };
};
