import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { RectPrimitive } from "../../../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Style } from "../../../sketchlib/Style.js";
import { PALETTE_CORAL, Values } from "../theme_colors.js";
import { make_stripes } from "./stripes.js";

const BRICK_DIMENSIONS = new Direction(100, 50);

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

class Brick {
  constructor() {
    this.primitive = group(BRICK_BACKGROUND, BRICK_STRIPES);
  }

  render() {
    return this.primitive;
  }
}

export const BRICKS = new Brick();
