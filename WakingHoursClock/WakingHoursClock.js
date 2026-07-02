import { AnalogClock } from "../sketchlib/animation/AnalogClock.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { Bezel } from "./Bezel.js";
import { HAND_LENGTH } from "./constants.js";
import { DayDivisions } from "./DayDivisions.js";
import { HourSelector } from "./HourSelector.js";
import { WakingHours } from "./WakingHours.js";

const HAND = new LineSegment(
  SCREEN_CENTER,
  SCREEN_CENTER.add(Direction.DIR_Y.scale(HAND_LENGTH)),
);

const STYLE_PORTION_TICKS = new Style({
  stroke: new Oklch(0.7, 0.1, 140),
  width: 4,
});

const STYLE_HAND = new Style({
  stroke: Color.WHITE,
  width: 8,
});

const STATE = new WakingHours();
const WAKE_HANDLE = new HourSelector(STATE, "wake");
const SLEEP_HANDLE = new HourSelector(STATE, "sleep");
const BEZEL = new Bezel(STATE);
const DIVISIONS = new DayDivisions(STATE);

const PRIORITY_ORDER = [WAKE_HANDLE, SLEEP_HANDLE, BEZEL];

const SCENE = group(
  DIVISIONS.primitive,
  BEZEL.primitive,
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
  /**
   * @type {HourSelector | Bezel | undefined}
   */
  let selected_object;

  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);
    STATE.init();
  };

  p.draw = () => {
    p.background(0);

    update_hands();

    SCENE.draw(p);
  };

  MOUSE.mouse_moved(p, (mouse) => {
    // clear all highlights
    for (const x of PRIORITY_ORDER) {
      x.update_highlight(false);
    }

    for (const x of PRIORITY_ORDER) {
      if (x.is_hovering(mouse.mouse_coords)) {
        x.update_highlight(true);
        break;
      }
    }
  });

  MOUSE.mouse_pressed(p, (mouse) => {
    // if we clicked one of the drag handles, start editing the corresponding time
    // else if we clicked the bezel, start editing the corresponding time

    for (const x of PRIORITY_ORDER) {
      if (x.is_hovering(mouse.mouse_coords)) {
        selected_object = x;
        x.select(mouse.mouse_coords);
        break;
      }
    }
  });

  MOUSE.mouse_dragged(p, (mouse) => {
    if (selected_object) {
      selected_object.move(mouse.mouse_coords);
    }
  });

  MOUSE.mouse_released(p, (mouse) => {
    selected_object = undefined;
  });
};
