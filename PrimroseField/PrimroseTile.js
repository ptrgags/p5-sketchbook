// the crosses at the corners of grid squares can't ever be smaller than 2x4 px
// else it stops looking like a cross and the illusion becomes less effective.
const MIN_CROSS_WIDTH = 2;
const MIN_CROSS_LENGTH = 4 * MIN_CROSS_WIDTH;

const MIN_SQUARE_SIZE = 16;
// GRID_SIZE This should be either 8 or 16 depending on desired look
// of an individual tile. Note that the larger this is, the smaller the possible
// depth for a given image size.
const GRID_SIZE = 16;
const MIN_TILE_HEIGHT = MIN_SQUARE_SIZE * GRID_SIZE;
const MIN_TILE_WIDTH = 2 * MIN_TILE_HEIGHT;

// Desired output size = 4096 x 2048, roughly 4K but at a 2:1 aspect
// ratio since that's required for this tiling.
const IMAGE_HEIGHT = 512;
const IMAGE_WIDTH = 2 * IMAGE_HEIGHT;

// we need to scale the tile up to compensate for the shrinking
// that will happen by the tiling. The recursion depth can be computed
// from this as well.
const MAX_SCALE = IMAGE_HEIGHT / MIN_TILE_HEIGHT;
const MAX_DEPTH = Math.log2(MAX_SCALE);
const TILE_WIDTH = IMAGE_WIDTH;
const TILE_HEIGHT = IMAGE_HEIGHT;
const CROSS_STROKE_LENGTH = MAX_SCALE * MIN_CROSS_LENGTH;
const CROSS_STROKE_THICKNESS = MAX_SCALE * MIN_CROSS_WIDTH;
const SQUARE_SIZE = MAX_SCALE * MIN_SQUARE_SIZE;

// Draw an outline around each tile for reference/debugging
const ENABLE_OUTLINES = false;
const OUTLINE_THICKNESS = 4.0 * MAX_SCALE;

const DARK_MAGENTA = [55, 8, 28];
const MEDIUM_PURPLE = [103, 58, 161];
const MEDIUM_BLUE = [36, 142, 236];
const LIGHT_BLUE = [66, 253, 228];

class PrimroseTile {
  constructor() {
    this.gfx = createGraphics(TILE_WIDTH, TILE_HEIGHT);

    this.palette = {
      checkerboard_bg: color(...MEDIUM_BLUE),
      checkerboard_fg: color(...MEDIUM_PURPLE),
      cross_dark: color(...DARK_MAGENTA),
      cross_light: color(...LIGHT_BLUE),
    };

    this.make_graphics();
  }

  checkerboard(bg_color, fg_color) {
    // To save half the effort, draw a background for one
    // color and then just draw the
    this.gfx.noStroke();
    this.gfx.fill(bg_color);
    this.gfx.rect(0, 0, TILE_HEIGHT, TILE_HEIGHT);

    this.gfx.fill(fg_color);
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const diag = i + j;
        if (diag % 2 == 0) {
          this.gfx.rect(
            i * SQUARE_SIZE,
            j * SQUARE_SIZE,
            SQUARE_SIZE,
            SQUARE_SIZE
          );
        }
      }
    }
  }

  draw_primrose_field(invert_y = false) {
    const colors = this.palette;
    this.checkerboard(colors.checkerboard_bg, colors.checkerboard_fg);

    // The original Primrose Field uses an ABBABAAB pattern to create the illusion
    const colormap = [
      colors.cross_dark,
      colors.cross_light,
      colors.cross_light,
      colors.cross_dark,
      colors.cross_light,
      colors.cross_dark,
      colors.cross_dark,
      colors.cross_light,
    ];

    for (let i = 0; i < GRID_SIZE - 1; i++) {
      for (let j = 0; j < GRID_SIZE - 1; j++) {
        const diag = invert_y ? i + (GRID_SIZE - 1 - j) : i + j;
        const selected_color = colormap[diag % colormap.length];
        this.gfx.fill(selected_color);
        const center_x = (i + 1) * SQUARE_SIZE;
        const center_y = (j + 1) * SQUARE_SIZE;
        // horizontal stroke
        this.gfx.rect(
          center_x - CROSS_STROKE_LENGTH / 2,
          center_y - CROSS_STROKE_THICKNESS / 2,
          CROSS_STROKE_LENGTH,
          CROSS_STROKE_THICKNESS
        );

        // vertical stroke
        this.gfx.rect(
          center_x - CROSS_STROKE_THICKNESS / 2,
          center_y - CROSS_STROKE_LENGTH / 2,
          CROSS_STROKE_THICKNESS,
          CROSS_STROKE_LENGTH
        );
      }
    }
  }

  make_graphics() {
    this.draw_primrose_field();

    this.gfx.push();
    this.gfx.translate(TILE_WIDTH / 2, 0);
    this.draw_primrose_field(true);
    this.gfx.pop();

    if (ENABLE_OUTLINES) {
      this.gfx.stroke(255, 0, 0);
      this.gfx.strokeWeight(OUTLINE_THICKNESS);
      this.gfx.noFill();
      this.gfx.rect(0, 0, TILE_WIDTH, TILE_HEIGHT);
    }
  }

  draw() {
    image(this.gfx, 0, 0);
  }
}
