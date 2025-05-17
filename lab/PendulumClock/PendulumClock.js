import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { PI, TAU } from "../../sketchlib/math_consts.js";
import {
  CirclePrimitive,
  GroupPrimitive,
  LinePrimitive,
  VectorPrimitive,
} from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const MAX_HOURS = 12;

/**
 * Simpler interface for a 12-hour clock time in the local timezone.
 */
class ClockTime {
  /**
   * Constructor
   * @param {number} hours Integer number of hours
   * @param {number} minutes Integer number of minutes
   * @param {number} seconds Integer number of seconds
   * @param {number} milliseconds Integr number of milliseconds
   */
  constructor(hours, minutes, seconds, milliseconds) {
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
    this.milliseconds = milliseconds;
  }

  get total_seconds() {
    return (
      this.hours * SECONDS_PER_HOUR +
      this.minutes * SECONDS_PER_MINUTE +
      this.seconds
    );
  }

  get hour_percent() {
    const total_hours =
      this.hours +
      this.minutes / MINUTES_PER_HOUR +
      this.seconds / SECONDS_PER_HOUR;
    return total_hours / MAX_HOURS;
  }

  /**
   * Get the percentage around the clock for the minute hand
   */
  get minute_percent() {
    const total_minutes = this.minutes + this.seconds / SECONDS_PER_MINUTE;
    return total_minutes / MINUTES_PER_HOUR;
  }

  /**
   * Get the percentage around the clock for the second hand
   * @type {number}
   */
  get second_percent() {
    // The second hand returns to 12 once a minute
    return this.seconds / SECONDS_PER_MINUTE;
  }

  /**
   * Get a clock time from a JS Date object
   * @param {Date} date The selected date
   * @returns {ClockTime} The specified date as a ClockTime
   */
  static from_date(date) {
    const hours = date.getHours() % MAX_HOURS;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    return new ClockTime(hours, minutes, seconds, milliseconds);
  }

  /**
   * Get the current time as a ClockTime (local)
   * @returns {ClockTime} The current clock time
   */
  static now() {
    const date = new Date();
    return ClockTime.from_date(date);
  }
}

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
 * Render an animated pendulum based on the current seconds.
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

    const now = ClockTime.now();

    const hands = render_clock_hands(now);
    const pendulum = render_pendulum(now);

    draw_primitive(p, pendulum);
    draw_primitive(p, CLOCK_FACE);
    draw_primitive(p, hands);
  };
};
