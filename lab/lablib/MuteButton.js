import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH } from "../../sketchlib/dimensions.js";
import {
  GroupPrimitive,
  LinePrimitive,
  PolygonPrimitive,
} from "../../sketchlib/rendering/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import { Rectangle } from "./Rectangle.js";
import { ToggleButton, ToggleState } from "./ToggleButton.js";

const SOUND_ON = ToggleState.STATE_A;
const SOUND_OFF = ToggleState.STATE_B;
const SOUND_TOGGLE_SIZE = 50;
const SOUND_TOGGLE_CORNER = Point.point(WIDTH - SOUND_TOGGLE_SIZE, 0);

const SPEAKER_CONE = new PolygonPrimitive([
  SOUND_TOGGLE_CORNER.add(Point.direction(8, 4)),
  SOUND_TOGGLE_CORNER.add(Point.direction(8, SOUND_TOGGLE_SIZE - 4)),
  SOUND_TOGGLE_CORNER.add(
    Point.direction(
      SOUND_TOGGLE_SIZE / 2,
      SOUND_TOGGLE_SIZE - SOUND_TOGGLE_SIZE / 3
    )
  ),
  SOUND_TOGGLE_CORNER.add(
    Point.direction(SOUND_TOGGLE_SIZE / 2, SOUND_TOGGLE_SIZE / 3)
  ),
]);
const SPEAKER_BASE = new PolygonPrimitive([
  SOUND_TOGGLE_CORNER.add(
    Point.direction(SOUND_TOGGLE_SIZE / 2, SOUND_TOGGLE_SIZE / 3)
  ),
  SOUND_TOGGLE_CORNER.add(
    Point.direction(
      SOUND_TOGGLE_SIZE / 2,
      SOUND_TOGGLE_SIZE - SOUND_TOGGLE_SIZE / 3
    )
  ),
  SOUND_TOGGLE_CORNER.add(
    Point.direction(
      SOUND_TOGGLE_SIZE / 2 + 10,
      SOUND_TOGGLE_SIZE - SOUND_TOGGLE_SIZE / 3
    )
  ),
  SOUND_TOGGLE_CORNER.add(
    Point.direction(SOUND_TOGGLE_SIZE / 2 + 10, SOUND_TOGGLE_SIZE / 3)
  ),
]);

const SPEAKER = new GroupPrimitive(
  [SPEAKER_BASE, SPEAKER_CONE],
  new Style({ stroke: Color.WHITE })
);

const SPEAKER_SLASH = new GroupPrimitive(
  [
    new LinePrimitive(
      SOUND_TOGGLE_CORNER.add(Point.direction(2, 2)),
      SOUND_TOGGLE_CORNER.add(
        Point.direction((3 * SOUND_TOGGLE_SIZE) / 4 - 2, SOUND_TOGGLE_SIZE - 2)
      )
    ),
  ],
  new Style({ stroke: Color.RED })
);
const GROUP_MUTED = new GroupPrimitive([SPEAKER, SPEAKER_SLASH]);
const GROUP_UNMUTED = SPEAKER;

export class MuteButton {
  constructor(sound) {
    this.sound_toggle = new ToggleButton(
      new Rectangle(
        SOUND_TOGGLE_CORNER,
        Point.direction(SOUND_TOGGLE_SIZE, SOUND_TOGGLE_SIZE)
      ),
      SOUND_ON
    );

    this.events = new EventTarget();

    this.sound_toggle.events.addEventListener(
      "toggle",
      (/**@type {CustomEvent}**/ e) => {
        const state = e.detail;
        const sound_on = state === SOUND_ON;
        this.events.dispatchEvent(
          new CustomEvent("change", { detail: { sound_on } })
        );
      }
    );
  }

  render() {
    return this.sound_toggle.toggle_state == SOUND_OFF
      ? GROUP_MUTED
      : GROUP_UNMUTED;
  }

  mouse_pressed(input) {
    this.sound_toggle.mouse_pressed(input.mouse_coords);
  }

  mouse_moved(input) {
    this.sound_toggle.mouse_moved(input.mouse_coords);
  }

  mouse_dragged(input) {
    this.sound_toggle.mouse_dragged(input.mouse_coords);
  }

  mouse_released(input) {
    this.sound_toggle.mouse_released(input.mouse_coords);
  }
}
