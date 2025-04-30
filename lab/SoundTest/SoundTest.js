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
import { TouchButton } from "../lablib/TouchButton.js";

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

const MELODY_BUTTON_SIZE = 150;
const MELODY_A_BUTTON = new TouchButton(
  new Rectangle(
    Point.point(50, HEIGHT / 2 - MELODY_BUTTON_SIZE / 2),
    Point.direction(MELODY_BUTTON_SIZE, MELODY_BUTTON_SIZE)
  )
);

const MELODY_B_BUTTON = new TouchButton(
  new Rectangle(
    Point.point(
      WIDTH - 50 - MELODY_BUTTON_SIZE,
      HEIGHT / 2 - MELODY_BUTTON_SIZE / 2
    ),
    Point.direction(MELODY_BUTTON_SIZE, MELODY_BUTTON_SIZE)
  )
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
    const melody_a = MELODY_A_BUTTON.debug_render();
    const melody_b = MELODY_B_BUTTON.debug_render();

    const scene = new GroupPrimitive([sound_toggle, melody_a, melody_b]);
    draw_primitive(p, scene);
  }

  mouse_pressed(input) {
    SOUND_TOGGLE.mouse_pressed(input.mouse_coords);
    MELODY_A_BUTTON.mouse_pressed(input.mouse_coords);
    MELODY_B_BUTTON.mouse_pressed(input.mouse_coords);
  }

  mouse_moved(input) {
    SOUND_TOGGLE.mouse_moved(input.mouse_coords);
    MELODY_A_BUTTON.mouse_moved(input.mouse_coords);
    MELODY_B_BUTTON.mouse_moved(input.mouse_coords);
  }

  mouse_dragged(input) {
    SOUND_TOGGLE.mouse_dragged(input.mouse_coords);
    MELODY_A_BUTTON.mouse_dragged(input.mouse_coords);
    MELODY_B_BUTTON.mouse_dragged(input.mouse_coords);
  }

  mouse_released(input) {
    SOUND_TOGGLE.mouse_released(input.mouse_coords);
    MELODY_A_BUTTON.mouse_released(input.mouse_coords);
    MELODY_B_BUTTON.mouse_released(input.mouse_coords);
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

    SOUND_TOGGLE.events.addEventListener(
      "toggle",
      (/**@type {CustomEvent}**/ e) => {
        const state = e.detail;
        const sound_on = state === SOUND_ON;
        SOUND.toggle_sound(sound_on);
      }
    );

    MELODY_A_BUTTON.events.addEventListener("click", () => {
      SOUND.melody_a();
    });

    MELODY_B_BUTTON.events.addEventListener("click", () => {
      SOUND.melody_b();
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
