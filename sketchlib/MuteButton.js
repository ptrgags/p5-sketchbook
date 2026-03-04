import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Color } from "./Color.js";
import { WIDTH } from "./dimensions.js";
import { LinePrimitive } from "./primitives/LinePrimitive.js";
import { PolygonPrimitive } from "./primitives/PolygonPrimitive.js";
import { group, style } from "./primitives/shorthand.js";
import { Style } from "./Style.js";
import { Rectangle } from "./Rectangle.js";
import { ToggleButton, ToggleState } from "./ToggleButton.js";
import { SoundManager } from "./SoundManager.js";
import { ShowHidePrimitive } from "./primitives/ShowHidePrimitive.js";
import { Animated } from "./animation/Animated.js";
import { MouseCallbacks } from "./input/MouseCallbacks.js";

const SOUND_ON = ToggleState.STATE_A;
const SOUND_OFF = ToggleState.STATE_B;
const SOUND_TOGGLE_SIZE = 50;
const SOUND_TOGGLE_CORNER = new Point(WIDTH - SOUND_TOGGLE_SIZE, 0);

const SPEAKER_CONE = new PolygonPrimitive(
  [
    SOUND_TOGGLE_CORNER.add(new Direction(8, 4)),
    SOUND_TOGGLE_CORNER.add(new Direction(8, SOUND_TOGGLE_SIZE - 4)),
    SOUND_TOGGLE_CORNER.add(
      new Direction(
        SOUND_TOGGLE_SIZE / 2,
        SOUND_TOGGLE_SIZE - SOUND_TOGGLE_SIZE / 3,
      ),
    ),
    SOUND_TOGGLE_CORNER.add(
      new Direction(SOUND_TOGGLE_SIZE / 2, SOUND_TOGGLE_SIZE / 3),
    ),
  ],
  true,
);
const SPEAKER_BASE = new PolygonPrimitive(
  [
    SOUND_TOGGLE_CORNER.add(
      new Direction(SOUND_TOGGLE_SIZE / 2, SOUND_TOGGLE_SIZE / 3),
    ),
    SOUND_TOGGLE_CORNER.add(
      new Direction(
        SOUND_TOGGLE_SIZE / 2,
        SOUND_TOGGLE_SIZE - SOUND_TOGGLE_SIZE / 3,
      ),
    ),
    SOUND_TOGGLE_CORNER.add(
      new Direction(
        SOUND_TOGGLE_SIZE / 2 + 10,
        SOUND_TOGGLE_SIZE - SOUND_TOGGLE_SIZE / 3,
      ),
    ),
    SOUND_TOGGLE_CORNER.add(
      new Direction(SOUND_TOGGLE_SIZE / 2 + 10, SOUND_TOGGLE_SIZE / 3),
    ),
  ],
  true,
);

const SPEAKER = style(
  [SPEAKER_BASE, SPEAKER_CONE],
  new Style({ stroke: Color.WHITE }),
);

const SPEAKER_SLASH = style(
  new LinePrimitive(
    SOUND_TOGGLE_CORNER.add(new Direction(2, 2)),
    SOUND_TOGGLE_CORNER.add(
      new Direction((3 * SOUND_TOGGLE_SIZE) / 4 - 2, SOUND_TOGGLE_SIZE - 2),
    ),
  ),
  new Style({ stroke: Color.RED }),
);

/**
 * @implements {Animated}
 */
export class MuteButton {
  /**
   * Constructor
   * @param {SoundManager} sound
   */
  constructor(sound) {
    this.sound_toggle = new ToggleButton(
      new Rectangle(
        SOUND_TOGGLE_CORNER,
        new Direction(SOUND_TOGGLE_SIZE, SOUND_TOGGLE_SIZE),
      ),
      SOUND_ON,
    );

    this.sound_toggle.events.addEventListener(
      "toggle",
      (/**@type {CustomEvent}**/ e) => {
        const state = e.detail;
        const sound_on = state === SOUND_ON;
        sound.toggle_sound(sound_on);
      },
    );

    this.slash = new ShowHidePrimitive([SPEAKER_SLASH], [false]);
    this.primitive = group(SPEAKER, this.slash);
  }

  update() {
    this.slash.show_flags = [this.sound_toggle.toggle_state === SOUND_OFF];
  }

  /**
   * @type {MouseCallbacks}
   */
  get mouse_callbacks() {
    return this.sound_toggle.mouse_callbacks;
  }
}
