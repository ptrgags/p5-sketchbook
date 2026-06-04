import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { download_file } from "../sketchlib/dom/download_file.js";
import { KeywordRecognizer } from "../sketchlib/KeywordRecognizer.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { SpeechBubblePrimitive } from "../sketchlib/primitives/SpeechBubblePrimitive.js";
import { Style } from "../sketchlib/Style.js";
import { encode_svg_file } from "../sketchlib/svg/encode_svg.js";

// I want to 3D print this, the width I want is 2.5 cm, or 25 mm
const MAX_WIDTH = 25;

const BUBBLE_PRINT = new SpeechBubblePrimitive(
  Rect.from_center(Point.ORIGIN, new Direction(MAX_WIDTH, MAX_WIDTH / 2)),
  Direction.ZERO,
  new Point(-MAX_WIDTH / 2, MAX_WIDTH / 4),
  1,
);

// Scale up things for the screen
const PX_PER_MM = 10;
const BUBBLE_SCREEN = new SpeechBubblePrimitive(
  Rect.from_center(
    SCREEN_CENTER,
    new Direction(MAX_WIDTH, MAX_WIDTH / 2).scale(PX_PER_MM),
  ),
  Direction.ZERO,
  new Point(
    SCREEN_CENTER.x - (MAX_WIDTH / 2) * PX_PER_MM,
    SCREEN_CENTER.y + (MAX_WIDTH / 4) * PX_PER_MM,
  ),
  1 * PX_PER_MM,
);

const BUBBLE = new SpeechBubblePrimitive(
  Rect.from_center(SCREEN_CENTER, new Direction(150, 50)),
  new Direction(50, 50),
  new Point(150, 450),
  8,
);

const ELLIPSIS_STRIDE_PRINT = Direction.DIR_X.scale(6);
const ELLIPSIS_RADIUS_PRINT = 1.25;
const ELLIPSIS_PRINT = group(
  new Circle(
    Point.ORIGIN.add(ELLIPSIS_STRIDE_PRINT.neg()),
    ELLIPSIS_RADIUS_PRINT,
  ),
  new Circle(Point.ORIGIN, ELLIPSIS_RADIUS_PRINT),
  new Circle(Point.ORIGIN.add(ELLIPSIS_STRIDE_PRINT), ELLIPSIS_RADIUS_PRINT),
);

const ELLIPSIS_STRIDE_SCREEN = ELLIPSIS_STRIDE_PRINT.scale(PX_PER_MM);
const ELLIPSIS_RADIUS_SCREEN = ELLIPSIS_RADIUS_PRINT * PX_PER_MM;
const ELLIPSIS_SCREEN = group(
  new Circle(
    SCREEN_CENTER.add(ELLIPSIS_STRIDE_SCREEN.neg()),
    ELLIPSIS_RADIUS_SCREEN,
  ),
  new Circle(SCREEN_CENTER, ELLIPSIS_RADIUS_SCREEN),
  new Circle(SCREEN_CENTER.add(ELLIPSIS_STRIDE_SCREEN), ELLIPSIS_RADIUS_SCREEN),
);

const STYLE_ELLIPSIS = new Style({
  fill: Color.BLACK,
});

const SCENE = group(BUBBLE_SCREEN, style(ELLIPSIS_SCREEN, STYLE_ELLIPSIS));

const STYLE_OUTLINE = new Style({ fill: Color.BLACK });
const STYLE_INTERIOR = new Style({ fill: Color.WHITE });
const SVG_SCENE = group(
  style(BUBBLE_PRINT.outer_primitiive, STYLE_OUTLINE),
  style(BUBBLE_PRINT.inner_primitiive, STYLE_INTERIOR),
  style(ELLIPSIS_PRINT, STYLE_ELLIPSIS),
);

const SVG_VIEWPORT = Rect.from_center(
  Point.ORIGIN,
  new Direction(MAX_WIDTH, MAX_WIDTH),
);

const SLASH = new KeywordRecognizer();
// export SVG version of ellipse
SLASH.register(["Slash", "KeyS", "KeyV", "KeyG"], () => {
  const svg_file = encode_svg_file(
    SVG_SCENE,
    SVG_VIEWPORT,
    "speech-bubble.svg",
  );
  download_file(svg_file);
});

// @ts-ignore
export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );
  };

  p.draw = () => {
    p.background(128);

    SCENE.draw(p);
  };

  p.keyReleased = (/** @type {KeyboardEvent} */ e) => {
    SLASH.input(e.code);
  };
};
