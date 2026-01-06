import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Mask } from "../../../sketchlib/primitives/ClipMask.js";
import { ClipPrimitive } from "../../../sketchlib/primitives/ClipPrimitive.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { RectPrimitive } from "../../../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../../sketchlib/primitives/Transform.js";
import { Style } from "../../../sketchlib/Style.js";
import { PALETTE_CORAL, PALETTE_ROCK, Values } from "../theme_colors.js";
import { make_stripes } from "./stripes.js";

const FALL_DURATION = 1;
const HIT_TIMES = [
  0,
  1 / 2,
  1,
  1 + 1 / 3,
  1 + 2 / 3,
  2,
  2 + 1 / 2,
  3,
  3 + 1 / 3,
  3 + 2 / 3,
];

const PANEL_CORNER = new Point(300, 300);
const PANEL_DIMENSIONS = new Direction(200, 200);
const BRICK_DIMENSIONS = PANEL_DIMENSIONS.mul_components(
  new Direction(0.5, 0.25)
);

const STYLE_BACKGROUND = new Style({
  fill: PALETTE_CORAL[Values.MedDark].to_srgb(),
});
const BRICK_BACKGROUND = style(
  new RectPrimitive(PANEL_CORNER, PANEL_DIMENSIONS),
  STYLE_BACKGROUND
);

const STRIPE_SPACING = 20;

const STYLE_STRIPES = new Style({
  stroke: PALETTE_CORAL[Values.Dark].to_srgb(),
  width: STRIPE_SPACING / 2,
});
const BRICK_STRIPES = style(
  make_stripes(
    new Point(400, 400),
    new Direction(1, -1).normalize(),
    STRIPE_SPACING,
    new Direction(200 * Math.SQRT2, 200 * Math.SQRT2),
    0
  ),
  STYLE_STRIPES
);
const BRICK_PATTERN = group(BRICK_BACKGROUND, BRICK_STRIPES);

class Brick {
  constructor(position) {
    this.primitive = new RectPrimitive(position, BRICK_DIMENSIONS);
  }

  render() {
    return this.primitive;
  }
}

// Brick offsets in multiples of BRICK_DIMENSIONS
const BRICK_OFFSETS = [
  new Direction(1, 3),
  new Direction(0, 3),
  new Direction(1.5, 2),
  new Direction(0.5, 2),
  new Direction(-0.5, 2),
  new Direction(1, 1),
  new Direction(0, 1),
  new Direction(1.5, 0),
  new Direction(0.5, 0),
  new Direction(-0.5, 0),
];

const STYLE_DROP_SHADOW = new Style({
  fill: PALETTE_ROCK[Values.Dark].to_srgb(),
});
const DROP_SHADOW_OFFSET = new Direction(25, 25);

class BrickWall {
  constructor() {
    this.bricks = BRICK_OFFSETS.map((offset, i) => {
      const position = PANEL_CORNER.add(
        BRICK_DIMENSIONS.mul_components(offset)
      );
      return new Brick(position);
    });

    // The Bricks will update their positions in place in update()
    // BrickWall groups them together and composites the layers:
    //
    // ---TOP---
    // bricks used as a clipping mask
    //     - parts of the striped brick pattern are shown through the clipping path
    // drop shadow (bricks offset down and right a bit)
    // ---BOTTOM---
    const brick_shape = group(...this.bricks.map((x) => x.render()));
    const drop_shadow = new GroupPrimitive(brick_shape, {
      transform: new Transform(DROP_SHADOW_OFFSET),
      style: STYLE_DROP_SHADOW,
    });
    const striped_bricks = new ClipPrimitive(
      new Mask(brick_shape),
      BRICK_PATTERN
    );

    this.primitive = group(drop_shadow, striped_bricks);
  }

  render() {
    return this.primitive;
  }
}

export const BRICKS = new BrickWall();
