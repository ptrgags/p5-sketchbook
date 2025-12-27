import { AnimationCurves } from "../lablib/animation/AnimationCurves.js";
import { Rational } from "../lablib/Rational.js";
import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../../sketchlib/dimensions.js";
import { mod } from "../../sketchlib/mod.js";
import { Mask } from "../../sketchlib/primitives/ClipMask.js";
import { PolygonPrimitive } from "../../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { style } from "../../sketchlib/primitives/shorthand.js";
import { VectorTangle } from "../../sketchlib/primitives/VectorTangle.js";
import { Style } from "../../sketchlib/Style.js";
import { CIRCLE_FAN } from "./patterns/circle_fan.js";
import { CORAL_PANEL, CORAL_STRIPES } from "./patterns/coral.js";
import { GEODE } from "./patterns/geode.js";
import { LANDSCAPE } from "./patterns/landscape.js";
import { EYE } from "./patterns/peek.js";
import { make_stripes } from "./patterns/stripes.js";
import { PALETTE_NAVY, PALETTE_SKY } from "./theme_colors.js";

/**
 * Shorthand for making arrays of points
 * @param {[number, number][]} coords Coordinates as number literals
 * @returns {Point[]}
 */
function make_points(...coords) {
  return coords.map(([x, y]) => new Point(x, y));
}

const PANEL_LANDSCAPE = new PolygonPrimitive(
  make_points([0, 0], [0, 100], [500, 100], [500, 0]),
  true
);

const PANEL_TRAFFIC = new PolygonPrimitive(
  make_points([0, 100], [0, 200], [200, 200], [400, 100]),
  true
);

const PANEL_QUARTERS = new PolygonPrimitive(
  make_points([500, 100], [400, 100], [200, 200], [300, 400], [500, 500]),
  true
);
const PANEL_CORAL = new PolygonPrimitive(
  make_points([0, 200], [0, 700], [200, 600], [300, 400], [200, 200]),
  true
);
const PANEL_GEODE = new PolygonPrimitive(
  make_points([500, 700], [500, 500], [300, 400], [200, 600], [300, 700]),
  true
);
const PANEL_STRIPES = new PolygonPrimitive(
  make_points([0, 700], [300, 700], [200, 600]),
  true
);

const PANEL_STYLE = new Style({
  stroke: PALETTE_SKY[0].to_srgb(),
  width: 10,
});

const PANELS = style(
  [
    PANEL_LANDSCAPE,
    PANEL_TRAFFIC,
    PANEL_QUARTERS,
    PANEL_CORAL,
    PANEL_GEODE,
    PANEL_STRIPES,
  ],
  PANEL_STYLE
);

const QUARTERS_DIMENSIONS = new Direction(200, 200);
const QUARTER_HITOMEZASHI = new RectPrimitive(
  new Point(100, 100),
  QUARTERS_DIMENSIONS
);
const QUARTER_CIRCLE_FAN = new RectPrimitive(
  new Point(300, 100),
  QUARTERS_DIMENSIONS
);
const QUARTER_BRICK_WALL = new RectPrimitive(
  new Point(300, 300),
  QUARTERS_DIMENSIONS
);
const QUARTER_PEEK = new RectPrimitive(
  new Point(100, 300),
  QUARTERS_DIMENSIONS
);

const STYLE_QUARTERS = new Style({
  stroke: Color.MAGENTA,
  width: 4,
});
const QUARTERS = new VectorTangle([
  [new Mask(QUARTER_HITOMEZASHI), style(QUARTER_HITOMEZASHI, STYLE_QUARTERS)],
  [new Mask(QUARTER_CIRCLE_FAN), CIRCLE_FAN.render()],
  [new Mask(QUARTER_BRICK_WALL), style(QUARTER_BRICK_WALL, STYLE_QUARTERS)],
  [new Mask(QUARTER_PEEK), EYE.eye],
]);

// Full scene

const TANGLE = new VectorTangle(
  [
    [new Mask(PANEL_LANDSCAPE), LANDSCAPE.render()],
    [new Mask(PANEL_QUARTERS), QUARTERS],
    [new Mask(PANEL_CORAL), CORAL_PANEL.render()],
    [new Mask(PANEL_GEODE), GEODE.render()],
  ],
  PANELS
);

const STYLE_BACKGROUND_STRIPES = new Style({
  // navy blue
  stroke: PALETTE_NAVY[0].to_srgb(),
  width: 15,
});
const BACKGROUND_STRIPES = style(
  make_stripes(
    SCREEN_CENTER,
    new Direction(1, 1).normalize(),
    20,
    new Direction(800, 800),
    0
  ),
  STYLE_BACKGROUND_STRIPES
);

// Needs to be a multiple of 4 seconds due to some of the looping animation
const ANIMATION_LENGTH = new Rational(8);

const CURVE_DEFS = {
  ...EYE.make_curves(ANIMATION_LENGTH),
  ...CIRCLE_FAN.make_curves(),
  ...GEODE.make_curves(ANIMATION_LENGTH),
};

const ANIM = new AnimationCurves(CURVE_DEFS);

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );
  };

  p.draw = () => {
    p.background(0);

    const frame = p.frameCount;
    const elapsed_sec = frame / 60;
    const length_sec = ANIMATION_LENGTH.real;
    const t_sec = mod(elapsed_sec, length_sec);

    const t_normalized = t_sec / length_sec;
    LANDSCAPE.update(t_normalized);
    CORAL_STRIPES.update(mod(10 * t_normalized, 1.0));
    CORAL_PANEL.update(t_sec);

    ANIM.update(t_sec);
    EYE.update(ANIM);
    CIRCLE_FAN.update(ANIM);
    GEODE.update(ANIM);

    BACKGROUND_STRIPES.draw(p);
    TANGLE.draw(p);
  };
};
