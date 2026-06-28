import { FixedTime, AnalogClock } from "../sketchlib/animation/AnalogClock.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { BivectorPrimitive } from "../sketchlib/primitives/BivectorPrimitive.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";
import { Style } from "../sketchlib/Style.js";

const DIAL_RADIUS = 200;
const HASH_LENGTH = 50;
const TICK_MARKS = Direction.roots_of_unity(12).map((dir) => {
  const outer_point = SCREEN_CENTER.add(dir.scale(DIAL_RADIUS));
  const inner_point = SCREEN_CENTER.add(dir.scale(DIAL_RADIUS - HASH_LENGTH));
  return new LineSegment(outer_point, inner_point);
});

const DIAL = new Circle(SCREEN_CENTER, DIAL_RADIUS);

const HOUR_WEDGE_MIN = new BivectorPrimitive(
  SCREEN_CENTER,
  Direction.DIR_X.scale(DIAL_RADIUS),
  Direction.DIR_Y.scale(DIAL_RADIUS),
);

const MIN_WEDGE_SEC = new BivectorPrimitive(
  SCREEN_CENTER,
  Direction.DIR_X.scale(DIAL_RADIUS),
  Direction.DIR_Y.scale(DIAL_RADIUS),
);

const SEC_WEDGE_HOUR = new BivectorPrimitive(
  SCREEN_CENTER,
  Direction.DIR_X.scale(DIAL_RADIUS),
  Direction.DIR_Y.scale(DIAL_RADIUS),
);

const SECOND_HAND = new VectorPrimitive(
  SCREEN_CENTER,
  SCREEN_CENTER.add(Direction.from_angle(-Math.PI / 2).scale(DIAL_RADIUS)),
);

const MINUTE_HAND = new VectorPrimitive(
  SCREEN_CENTER,
  SCREEN_CENTER.add(
    Direction.from_angle(-Math.PI / 2).scale(DIAL_RADIUS * 0.9),
  ),
);

const HOUR_HAND = new VectorPrimitive(
  SCREEN_CENTER,
  SCREEN_CENTER.add(
    Direction.from_angle(-Math.PI / 2).scale(DIAL_RADIUS * 0.5),
  ),
);

const STYLE_DIAL = new Style({
  fill: Color.WHITE,
});

const STYLE_TICKS = new Style({
  stroke: Color.BLACK,
  width: 4,
});

const STYLE_HOUR_MIN = new Style({
  stroke: Color.RED,
  fill: new Color(255, 0, 0, 127),
});

const STYLE_MIN_SEC = new Style({
  stroke: Color.GREEN,
  fill: new Color(0, 255, 0, 127),
});

const STYLE_SEC_HOUR = new Style({
  stroke: Color.BLUE,
  fill: new Color(0, 0, 255, 127),
});

const STYLE_HANDS = new Style({
  stroke: Color.BLACK,
  width: 4,
});

const SCENE = group(
  style(DIAL, STYLE_DIAL),
  style(TICK_MARKS, STYLE_TICKS),
  style(HOUR_WEDGE_MIN, STYLE_HOUR_MIN),
  style(MIN_WEDGE_SEC, STYLE_MIN_SEC),
  style(SEC_WEDGE_HOUR, STYLE_SEC_HOUR),
  style([HOUR_HAND, MINUTE_HAND, SECOND_HAND], STYLE_HANDS),
);

const WALL_CLOCK = new AnalogClock();
// uncomment to use a fixed time. It was chosen to keep the hands spread apart
// at roughly 120 degrees which makes for a nice looking screenshot
/*
const WALL_CLOCK = new WallClock(
  new FixedTime(new Date(2026, 6, 26, 8, 20, 0, 0)),
);
*/

function update_hands() {
  const sec_angle = WALL_CLOCK.get_discrete_angle("sec");
  const sec_dir = Direction.from_angle(sec_angle).scale(DIAL_RADIUS);

  const hour_angle = WALL_CLOCK.get_continuous_angle("hr12");
  const hour_dir = Direction.from_angle(hour_angle).scale(DIAL_RADIUS * 0.5);

  const min_angle = WALL_CLOCK.get_continuous_angle("min");
  const min_dir = Direction.from_angle(min_angle).scale(DIAL_RADIUS * 0.9);

  SECOND_HAND.tip = SCREEN_CENTER.add(sec_dir);
  HOUR_HAND.tip = SCREEN_CENTER.add(hour_dir);
  MINUTE_HAND.tip = SCREEN_CENTER.add(min_dir);

  HOUR_WEDGE_MIN.a = hour_dir;
  HOUR_WEDGE_MIN.b = min_dir;

  MIN_WEDGE_SEC.a = min_dir;
  MIN_WEDGE_SEC.b = sec_dir;

  SEC_WEDGE_HOUR.a = sec_dir;
  SEC_WEDGE_HOUR.b = hour_dir;
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
