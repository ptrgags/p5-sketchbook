import { AnalogClock } from "../sketchlib/animation/AnalogClock.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Style } from "../sketchlib/Style.js";
import {
  DIAL_RADIUS,
  HASH_LENGTH,
  NUMERAL_RADIUS,
  HAND_LENGTH,
  COLOR_WAKE,
  COLOR_SLEEP,
} from "./constants.js";
import { HourSelector } from "./HourSelector.js";

const TICK_MARKS = Direction.roots_of_unity(24).map((dir) => {
  const outer_point = SCREEN_CENTER.add(dir.scale(DIAL_RADIUS));
  const inner_point = SCREEN_CENTER.add(dir.scale(DIAL_RADIUS + HASH_LENGTH));
  return new LineSegment(outer_point, inner_point);
});

const MINOR_TICKS = Direction.roots_of_unity(24 * 4).map((dir) => {
  const outer_point = SCREEN_CENTER.add(dir.scale(DIAL_RADIUS));
  const inner_point = SCREEN_CENTER.add(
    dir.scale(DIAL_RADIUS + HASH_LENGTH * 0.5),
  );
  return new LineSegment(outer_point, inner_point);
});

const PORTION_TICKS = Direction.roots_of_unity(6).map((dir) => {
  const outer_point = SCREEN_CENTER.add(dir.scale(DIAL_RADIUS));
  const inner_point = SCREEN_CENTER.add(dir.scale(DIAL_RADIUS - HASH_LENGTH));
  return new LineSegment(outer_point, inner_point);
});

const NUMERALS = Direction.roots_of_unity(24).map((dir, i) => {
  const numeral = (i + 6) % 24;
  return new TextPrimitive(
    `${numeral}`,
    SCREEN_CENTER.add(dir.scale(NUMERAL_RADIUS)),
  );
});
const TEXT_STYLE_NUMERALS = new TextStyle(25, "center", "center");

const HOUR_WAKE = 6;
const HOUR_SLEEP = 22;

const ANGLES_WAKE = new ArcAngles(
  AnalogClock.compute_angle(HOUR_WAKE, 24),
  AnalogClock.compute_angle(HOUR_SLEEP, 24),
);
const ANGLES_SLEEP = ANGLES_WAKE.complement();

const ARC_WAKE = new ArcPrimitive(SCREEN_CENTER, DIAL_RADIUS, ANGLES_WAKE);
const ARC_SLEEP = new ArcPrimitive(SCREEN_CENTER, DIAL_RADIUS, ANGLES_SLEEP);

const HAND = new LineSegment(
  SCREEN_CENTER,
  SCREEN_CENTER.add(Direction.DIR_Y.scale(HAND_LENGTH)),
);

const STYLE_TICKS = new Style({
  stroke: Color.WHITE,
  width: 4,
});

const STYLE_MINOR_TICKS = new Style({
  stroke: Color.WHITE,
  width: 2,
});

const STYLE_PORTION_TICKS = new Style({
  stroke: new Oklch(0.7, 0.1, 140),
  width: 4,
});

const STYLE_NUMERALS = new Style({
  fill: Color.WHITE,
});

const STYLE_WAKE = new Style({
  // Orange
  stroke: COLOR_WAKE,
  width: 8,
});
const STYLE_SLEEP = new Style({
  // Purple
  stroke: COLOR_SLEEP,
  width: 8,
});

const STYLE_HAND = new Style({
  stroke: Color.WHITE,
  width: 8,
});

const WAKE_HANDLE = new HourSelector(6, "wake");
const SLEEP_HANDLE = new HourSelector(22, "sleep");

const SCENE = group(
  style(MINOR_TICKS, STYLE_MINOR_TICKS),
  style(TICK_MARKS, STYLE_TICKS),
  style(PORTION_TICKS, STYLE_PORTION_TICKS),
  new GroupPrimitive(NUMERALS, {
    style: STYLE_NUMERALS,
    text_style: TEXT_STYLE_NUMERALS,
  }),
  style(ARC_SLEEP, STYLE_SLEEP),
  style(ARC_WAKE, STYLE_WAKE),
  WAKE_HANDLE.primitive,
  SLEEP_HANDLE.primitive,
  style(HAND, STYLE_HAND),
);

const CLOCK = new AnalogClock();

function update_hands() {
  const angle_hour = CLOCK.get_continuous_angle("hr24");
  HAND.b = SCREEN_CENTER.add(
    Direction.from_angle(angle_hour).scale(HAND_LENGTH),
  );
}

const MOUSE = new CanvasMouseHandler();

// @ts-ignore
export const sketch = (p) => {
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);
  };

  p.draw = () => {
    p.background(0);

    update_hands();

    SCENE.draw(p);
  };

  MOUSE.mouse_moved(p, (mouse) => {
    WAKE_HANDLE.update_highlight(mouse.mouse_coords);
    SLEEP_HANDLE.update_highlight(mouse.mouse_coords);
  });
  MOUSE.mouse_pressed(p, (mouse) => {
    // if we clicked one of the drag handles, start editing the corresponding time
    // else if we clicked the bezel, start editing the corresponding time
  });
  MOUSE.mouse_dragged(p, (mouse) => {});
  MOUSE.mouse_released(p, (mouse) => {});
};
