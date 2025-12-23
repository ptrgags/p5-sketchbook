import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Mask } from "../sketchlib/primitives/ClipMask.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { VectorTangle } from "../sketchlib/primitives/VectorTangle.js";
import { Style } from "../sketchlib/Style.js";
import { CORAL } from "./patterns/coral.js";

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
const QUARTERS = style(
  [QUARTER_HITOMEZASHI, QUARTER_CIRCLE_FAN, QUARTER_BRICK_WALL, QUARTER_PEEK],
  STYLE_QUARTERS
);

const TANGLE = new VectorTangle([[new Mask(PANEL_QUARTERS), QUARTERS]], PANELS);

// TEMP
const CORAL_LAYER = CORAL.render();
const CORAL_DEBUG = style(
  CORAL.debug_render(),
  new Style({ stroke: Color.RED, width: 2 })
);

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
    p.background(0, 0, 63);

    TANGLE.draw(p);
    CORAL_LAYER.draw(p);
    //CORAL_DEBUG.draw(p);
  };
};
