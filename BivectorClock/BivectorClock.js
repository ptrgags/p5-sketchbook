import { WallClock } from "../sketchlib/animation/WallClock.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { BivectorPrimitive } from "../sketchlib/primitives/BivectorPrimitive.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";

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

const SCENE = group(
  DIAL,
  group(...TICK_MARKS),
  HOUR_WEDGE_MIN,
  MIN_WEDGE_SEC,
  HOUR_HAND,
  MINUTE_HAND,
  SECOND_HAND,
);

const WALL_CLOCK = new WallClock();

function update_hands() {
  const seconds = WALL_CLOCK.discrete_sec;
  const sec_angle = -Math.PI / 2 + ((seconds % 60) * Math.PI) / 30;
  const sec_dir = Direction.from_angle(sec_angle).scale(DIAL_RADIUS);

  const hours = WALL_CLOCK.continuous_hours;
  const hour_angle = -Math.PI / 2 + ((hours % 12) * Math.PI) / 6;
  const hour_dir = Direction.from_angle(hour_angle).scale(DIAL_RADIUS * 0.5);

  const minutes = WALL_CLOCK.continuous_min;
  const min_angle = -Math.PI / 2 + ((minutes % 60) * Math.PI) / 30;
  const min_dir = Direction.from_angle(min_angle).scale(DIAL_RADIUS * 0.9);

  SECOND_HAND.tip = SCREEN_CENTER.add(sec_dir);
  HOUR_HAND.tip = SCREEN_CENTER.add(hour_dir);
  MINUTE_HAND.tip = SCREEN_CENTER.add(min_dir);

  HOUR_WEDGE_MIN.a = hour_dir;
  HOUR_WEDGE_MIN.b = min_dir;

  MIN_WEDGE_SEC.a = min_dir;
  MIN_WEDGE_SEC.b = sec_dir;
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
