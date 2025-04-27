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

class PlayButtonScene {
  draw(p) {
    const play_button = PLAY.debug_render();
    const scene = new GroupPrimitive([play_button, PLAY_GROUP]);
    draw_primitive(p, scene);
  }

  mouse_pressed(input) {
    PLAY.mouse_pressed(input.mouse_coords);
  }

  mouse_moved(input) {
    PLAY.mouse_moved(input.mouse_coords);
  }

  mouse_dragged(input) {
    PLAY.mouse_dragged(input.mouse_coords);
  }

  mouse_released(input) {
    if (!SOUND.audio_ready && !SOUND.init_requested) {
      PLAY.mouse_released(input.mouse_coords);
    }
  }
}

class SoundScene {
  draw(p) {
    const sound_toggle = SOUND_TOGGLE.debug_render();
    draw_primitive(p, sound_toggle);
  }

  mouse_pressed(input) {
    SOUND_TOGGLE.mouse_pressed(input.mouse_coords);
  }

  mouse_moved(input) {
    SOUND_TOGGLE.mouse_moved(input.mouse_coords);
  }

  mouse_dragged(input) {
    SOUND_TOGGLE.mouse_dragged(input.mouse_coords);
  }

  mouse_released(input) {
    SOUND_TOGGLE.mouse_released(input.mouse_coords);
  }
}

export const sketch = (p) => {
  let scene = new PlayButtonScene();
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;

    PLAY.events.addEventListener("click", () => {
      SOUND.init();
      scene = new SoundScene();
    });

    MOUSE.setup(canvas);
  };

  p.draw = () => {
    p.background(0);
    scene.draw(p);
  };

  MOUSE.mouse_pressed(p, (input) => {
    scene.mouse_pressed(input);
  });

  MOUSE.mouse_moved(p, (input) => {
    scene.mouse_moved(input);
  });

  MOUSE.mouse_released(p, (input) => {
    scene.mouse_released(input);
  });

  MOUSE.mouse_dragged(p, (input) => {
    scene.mouse_dragged(input);
  });
};
