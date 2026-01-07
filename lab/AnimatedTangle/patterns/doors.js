import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../../sketchlib/primitives/Transform.js";
import { Style } from "../../../sketchlib/Style.js";
import { PALETTE_CORAL, PALETTE_SKY, Values } from "../theme_colors.js";
import { AnimatedStripes } from "./stripes.js";

const STRIPE_CENTER = new Point(200, 650);
const STRIPE_SPACING = 60;
const STRIPE_DIRECTION = new Direction(-1, -1).normalize();
const STRIPE_DIMENSIONS = new Direction(350, 300);
const ANIMATED_STRIPES = new AnimatedStripes(
  STRIPE_CENTER,
  STRIPE_DIRECTION,
  STRIPE_SPACING,
  STRIPE_DIMENSIONS
);

const STRIPE_STYLES = [
  new Style({
    stroke: PALETTE_SKY[Values.Light].to_srgb(),
    width: STRIPE_SPACING / 3,
  }),
  new Style({
    stroke: PALETTE_CORAL[Values.MedDark].to_srgb(),
    width: STRIPE_SPACING / 3,
  }),
  new Style({
    stroke: PALETTE_SKY[Values.MedDark].to_srgb(),
    width: STRIPE_SPACING / 3,
  }),
];

const XFORMS = [
  // First stripe doesn't need a transform, it's identity
  undefined,
  new Transform(STRIPE_DIRECTION.scale(STRIPE_SPACING / 3)),
  new Transform(STRIPE_DIRECTION.scale((2 * STRIPE_SPACING) / 3)),
];

const BASE_STRIPES = ANIMATED_STRIPES.render();

const BARBER_POLE = group(
  ...STRIPE_STYLES.map((style, i) => {
    return new GroupPrimitive(BASE_STRIPES, {
      transform: XFORMS[i],
      style,
    });
  })
);

class Doors {
  constructor() {
    this.primitive = BARBER_POLE;
  }

  update(time) {
    ANIMATED_STRIPES.update(time);
  }

  render() {
    return this.primitive;
  }
}

export const DOORS = new Doors();
