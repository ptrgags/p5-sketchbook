import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions.js";
import { PI, TAU } from "../../sketchlib/math_consts.js";
import {
  CirclePrimitive,
  GroupPrimitive,
  LinePrimitive,
  VectorPrimitive,
} from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import { ClockTime } from "./ClockTime.js";

const OUTER_RADIUS = 100;
const INNER_RADIUS = 70;
const CLOCK_CENTER = Point.point(WIDTH / 2, HEIGHT / 4);
const CLOCK_CIRCLE = new CirclePrimitive(CLOCK_CENTER, OUTER_RADIUS);

const DIRS_12 = new Array(12).fill(0).map((_, i) => {
  const angle = (TAU * i) / 12;
  return Point.dir_from_angle(angle);
});
const HASH_LENGTH = OUTER_RADIUS - INNER_RADIUS;
const CLOCK_HASHES = DIRS_12.map((dir) => {
  const tail = CLOCK_CENTER.add(dir.scale(INNER_RADIUS));
  const head = tail.add(dir.scale(HASH_LENGTH));
  return new LinePrimitive(tail, head);
});
const STYLE_CLOCK = new Style({
  stroke: Color.from_hex_code("#444444"),
  width: 5,
  fill: Color.WHITE,
});
const CLOCK_FACE = new GroupPrimitive(
  [CLOCK_CIRCLE, ...CLOCK_HASHES],
  STYLE_CLOCK
);

const LENGTH_SECOND_HAND = (OUTER_RADIUS * 9) / 10;
const LENGTH_MINUTE_HAND = (OUTER_RADIUS * 7) / 10;
const LENGTH_HOUR_HAND = (OUTER_RADIUS * 5) / 10;

const ARM_LENGTH = HEIGHT / 2;
const BOB_RADIUS = OUTER_RADIUS / 3;
const STYLE_ARM = new Style({
  stroke: Color.from_hex_code("#555555"),
  width: 8,
});
const STYLE_BOB = new Style({
  stroke: Color.from_hex_code("#666666"),
  fill: Color.from_hex_code("#777777"),
});

/**
 * Render hands of the clock
 * @param {ClockTime} time The time to display
 */
function render_clock_hands(time) {
  const hour_angle = time.hour_percent * TAU - PI / 2;
  const minute_angle = time.minute_percent * TAU - PI / 2;
  const second_angle = time.second_percent * TAU - PI / 2;

  const dir_hour = Point.dir_from_angle(hour_angle);
  const dir_minute = Point.dir_from_angle(minute_angle);
  const dir_second = Point.dir_from_angle(second_angle);

  const hour_hand = new VectorPrimitive(
    CLOCK_CENTER,
    CLOCK_CENTER.add(dir_hour.scale(LENGTH_HOUR_HAND))
  );
  const minute_hand = new VectorPrimitive(
    CLOCK_CENTER,
    CLOCK_CENTER.add(dir_minute.scale(LENGTH_MINUTE_HAND))
  );
  const second_hand = new VectorPrimitive(
    CLOCK_CENTER,
    CLOCK_CENTER.add(dir_second.scale(LENGTH_SECOND_HAND))
  );

  const style_second = new Style({
    stroke: Color.RED,
    width: 4,
  });

  const style_hands = new Style({
    stroke: Color.BLACK,
    width: 4,
  });

  const hour_minute = new GroupPrimitive([hour_hand, minute_hand], style_hands);
  const second = new GroupPrimitive([second_hand], style_second);
  return new GroupPrimitive([hour_minute, second]);
}

/**
 * Render an animated pendulum based on the current seconds. It is not
 * a physically accurate simulation
 * @param {ClockTime} time The current time to determine what second we're at
 */
function render_pendulum(time) {
  // The pendulum will have a period of 2 seconds, so the math for the
  // percentage looks a little different
  const milliseconds = (time.seconds % 2) * 1000 + time.milliseconds;
  const percent_of_period = milliseconds / 2000;

  const angle_variation = (PI / 24) * Math.cos(percent_of_period * TAU);
  const angle = PI / 2 + angle_variation;
  const dir = Point.dir_from_angle(angle);

  const bob_center = CLOCK_CENTER.add(dir.scale(ARM_LENGTH));

  const arm = new LinePrimitive(CLOCK_CENTER, bob_center);

  const bob = new CirclePrimitive(bob_center, BOB_RADIUS);

  const pendulum_arm = new GroupPrimitive([arm], STYLE_ARM);
  const pendulum_bob = new GroupPrimitive([bob], STYLE_BOB);
  return new GroupPrimitive([pendulum_arm, pendulum_bob]);
}

export class Clock {
  constructor() {
    this.current_time = ClockTime.now();
    this.events = new EventTarget();

    this.prev_seconds = this.current_time.seconds;
  }

  update() {
    this.current_time = ClockTime.now();

    if (this.current_time.seconds !== this.prev_seconds) {
      this.events.dispatchEvent(
        new CustomEvent("tick", { detail: this.current_time })
      );
    }
    this.prev_seconds = this.current_time.seconds;
  }

  render() {
    const pendulum = render_pendulum(this.current_time);
    const clock_hands = render_clock_hands(this.current_time);
    return new GroupPrimitive([pendulum, CLOCK_FACE, clock_hands]);
  }
}
