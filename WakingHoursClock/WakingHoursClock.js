import { WallClock } from "../sketchlib/animation/WallClock.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

const DIAL_RADIUS = 200;
const HAND_LENGTH = 225;

const HOUR_WAKE = 6;
const HOUR_SLEEP = 22;

const ANGLES_WAKE = new ArcAngles(
  WallClock.compute_angle(HOUR_WAKE, 24),
  WallClock.compute_angle(HOUR_SLEEP, 24),
);
const ANGLES_SLEEP = ANGLES_WAKE.complement();

const ARC_WAKE = new ArcPrimitive(SCREEN_CENTER, DIAL_RADIUS, ANGLES_WAKE);
const ARC_SLEEP = new ArcPrimitive(SCREEN_CENTER, DIAL_RADIUS, ANGLES_SLEEP);

const HAND = new LineSegment(
  SCREEN_CENTER,
  SCREEN_CENTER.add(Direction.DIR_Y.scale(HAND_LENGTH)),
);

const STYLE_WAKE = new Style({
  stroke: Color.CYAN,
  width: 8,
});

const STYLE_SLEEP = new Style({
  stroke: Color.RED,
  width: 8,
});
const STYLE_HAND = new Style({
  stroke: Color.WHITE,
  width: 8,
});

const SCENE = group(
  style(ARC_SLEEP, STYLE_SLEEP),
  style(ARC_WAKE, STYLE_WAKE),
  style(HAND, STYLE_HAND),
);

const CLOCK = new WallClock();

function update_hands() {
  const angle_hour = CLOCK.get_continuous_angle("hr24");
  HAND.b = SCREEN_CENTER.add(
    Direction.from_angle(angle_hour).scale(HAND_LENGTH),
  );
}

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
    p.background(0);

    update_hands();

    SCENE.draw(p);
  };
};
