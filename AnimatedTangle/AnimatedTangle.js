import { AnimationCurves } from "../lab/lablib/animation/AnimationCurves.js";
import { ParamCurve } from "../lab/lablib/music/ParamCurve.js";
import { Oklch } from "../lab/lablib/Oklch.js";
import { Rational } from "../lab/lablib/Rational.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { mod } from "../sketchlib/mod.js";
import { Mask } from "../sketchlib/primitives/ClipMask.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { VectorTangle } from "../sketchlib/primitives/VectorTangle.js";
import { Style } from "../sketchlib/Style.js";
import { CIRCLE_FAN } from "./patterns/circle_fan.js";
import { CORAL_PANEL } from "./patterns/coral.js";
import { GEODE } from "./patterns/geode.js";
import { LANDSCAPE } from "./patterns/landscape.js";
import { EYE } from "./patterns/peek.js";
import { make_stripes } from "./patterns/stripes.js";

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
  stroke: Color.YELLOW,
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

/*
style(
  [QUARTER_HITOMEZASHI, QUARTER_CIRCLE_FAN, QUARTER_BRICK_WALL, QUARTER_PEEK],
  STYLE_QUARTERS
);
*/

// Full scene

const TANGLE = new VectorTangle(
  [
    [new Mask(PANEL_LANDSCAPE), LANDSCAPE.render()],
    [new Mask(PANEL_QUARTERS), QUARTERS],
    [new Mask(PANEL_CORAL), CORAL_PANEL],
    [new Mask(PANEL_GEODE), GEODE.render()],
  ],
  PANELS
);

const STYLE_BACKGROUND_STRIPES = new Style({
  // navy blue
  stroke: new Color(0, 0, 63),
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

    ANIM.update(t_sec);
    EYE.update(ANIM);
    CIRCLE_FAN.update(ANIM);
    GEODE.update(ANIM);

    BACKGROUND_STRIPES.draw(p);
    TANGLE.draw(p);

    LANDSCAPE.update(t_sec / length_sec);

    //EYE.eye.draw(p);

    p.push();
    p.fill(255);
    p.textSize(24);
    p.text(
      `t:${t_sec.toPrecision(2)}, r:${ANIM.get_curve_val(
        "circle_fan"
      ).toPrecision(3)}, angle:${ANIM.get_curve_val("peek_angle").toPrecision(
        2
      )}`,
      100,
      50
    );
    p.pop();
  };
};
