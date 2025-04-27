import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import {
  GroupPrimitive,
  PolygonPrimitive,
} from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { Rectangle, SCREEN_RECT } from "../lablib/Rectangle.js";
import { SoundManager } from "../lablib/SoundManager.js";
import { ToggleButton, ToggleState } from "../lablib/ToggleButton.js";
import { ButtonState, TouchButton } from "../lablib/TouchButton.js";

const MOUSE = new CanvasMouseHandler();
const PLAY = new TouchButton(SCREEN_RECT);

const SOUND_ON = ToggleState.STATE_A;
const SOUND_OFF = ToggleState.STATE_B;
const SOUND_TOGGLE_SIZE = 50;
const SOUND_TOGGLE = new ToggleButton(
  new Rectangle(
    Point.point(WIDTH - SOUND_TOGGLE_SIZE, 0),
    Point.direction(SOUND_TOGGLE_SIZE, SOUND_TOGGLE_SIZE)
  ),
  SOUND_ON
);

//@ts-ignore
const SOUND = new SoundManager(Tone);

const TRIANGLE_WIDTH = 200;
const PLAY_TRIANGLE = new PolygonPrimitive([
  Point.point(WIDTH / 2 - TRIANGLE_WIDTH / 2, HEIGHT / 2 - TRIANGLE_WIDTH / 2),
  Point.point(WIDTH / 2 - TRIANGLE_WIDTH / 2, HEIGHT / 2 + TRIANGLE_WIDTH / 2),
  Point.point(WIDTH / 2 + TRIANGLE_WIDTH / 2, HEIGHT / 2),
]);
const PLAY_GROUP = new GroupPrimitive(
  [PLAY_TRIANGLE],
  new Style({ stroke: Color.WHITE })
);

export const sketch = (p) => {
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;

    MOUSE.setup(canvas);
  };

  function draw_before_play(p) {
    const play_button = PLAY.debug_render();
    const scene = new GroupPrimitive([play_button, PLAY_GROUP]);
    draw_primitive(p, scene);
  }

  p.draw = () => {
    p.background(0);

    if (!SOUND.audio_ready) {
      draw_before_play(p);
      return;
    }

    const sound_toggle = SOUND_TOGGLE.debug_render();
    draw_primitive(p, sound_toggle);
  };

  MOUSE.mouse_pressed(p, (input) => {
    PLAY.mouse_pressed(input.mouse_coords);
    SOUND_TOGGLE.mouse_pressed(input.mouse_coords);
  });

  MOUSE.mouse_moved(p, (input) => {
    PLAY.mouse_moved(input.mouse_coords);
    SOUND_TOGGLE.mouse_moved(input.mouse_coords);
  });

  MOUSE.mouse_released(p, (input) => {
    if (!SOUND.audio_ready && !SOUND.init_requested) {
      PLAY.mouse_released(input.mouse_coords);
      // This is terrible, it should be an event.
      if (PLAY.state === ButtonState.HOVER) {
        // button clicked
        SOUND.init();
      }
    } else {
      SOUND_TOGGLE.mouse_released(input.mouse_coords);
    }
  });

  MOUSE.mouse_dragged(p, (input) => {
    PLAY.mouse_dragged(input.mouse_coords);
    SOUND_TOGGLE.mouse_dragged(input.mouse_coords);
  });
};
