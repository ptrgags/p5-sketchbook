import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import {
  GroupPrimitive,
  LinePrimitive,
  PolygonPrimitive,
} from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { Rectangle, SCREEN_RECT } from "../lablib/Rectangle.js";
import { SoundManager } from "../lablib/SoundManager.js";
import { ToggleButton, ToggleState } from "../lablib/ToggleButton.js";
import { TouchButton } from "../lablib/TouchButton.js";
import {
  layered_melody,
  phase_scale,
  symmetry_melody,
} from "./example_scores.js";

const MOUSE = new CanvasMouseHandler();

const SOUND_ON = ToggleState.STATE_A;
const SOUND_OFF = ToggleState.STATE_B;
const SOUND_TOGGLE_SIZE = 50;
const SOUND_TOGGLE_CORNER = Point.point(WIDTH - SOUND_TOGGLE_SIZE, 0);
const SOUND_TOGGLE = new ToggleButton(
  new Rectangle(
    SOUND_TOGGLE_CORNER,
    Point.direction(SOUND_TOGGLE_SIZE, SOUND_TOGGLE_SIZE)
  ),
  SOUND_ON
);

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

//@ts-ignore
const SOUND = new SoundManager(Tone);

const MARGIN = 50;
const MELODY_BUTTON_SIZE = 150;
const MELODY_A_BUTTON = new TouchButton(
  new Rectangle(
    Point.point(MARGIN, HEIGHT / 2 - MELODY_BUTTON_SIZE / 2),
    Point.direction(MELODY_BUTTON_SIZE, MELODY_BUTTON_SIZE)
  )
);

const MELODY_B_BUTTON = new TouchButton(
  new Rectangle(
    Point.point(
      WIDTH - MARGIN - MELODY_BUTTON_SIZE,
      HEIGHT / 2 - MELODY_BUTTON_SIZE / 2
    ),
    Point.direction(MELODY_BUTTON_SIZE, MELODY_BUTTON_SIZE)
  )
);

const MELODY_C_BUTTON = new TouchButton(
  new Rectangle(
    Point.point(MARGIN, HEIGHT / 2 + MELODY_BUTTON_SIZE / 2),
    Point.direction(MELODY_BUTTON_SIZE, MELODY_BUTTON_SIZE)
  )
);

class SoundScene {
  draw(p) {
    //const sound_toggle = SOUND_TOGGLE.debug_render();
    const melody_a = MELODY_A_BUTTON.debug_render();
    const melody_b = MELODY_B_BUTTON.debug_render();
    const melody_c = MELODY_C_BUTTON.debug_render();

    const speaker =
      SOUND_TOGGLE.toggle_state == SOUND_OFF
        ? [SPEAKER, SPEAKER_SLASH]
        : [SPEAKER];

    const scene = new GroupPrimitive([
      ...speaker,
      melody_a,
      melody_b,
      melody_c,
    ]);
    draw_primitive(p, scene);

    p.push();
    p.fill(255);
    p.textSize(24);
    p.textAlign(p.CENTER);
    p.text("Melody A", MARGIN + MELODY_BUTTON_SIZE / 2, HEIGHT / 2);
    p.text("Melody B", WIDTH - MARGIN - MELODY_BUTTON_SIZE / 2, HEIGHT / 2);
    p.text(
      "Melody C",
      MARGIN + MELODY_BUTTON_SIZE / 2,
      HEIGHT / 2 + MELODY_BUTTON_SIZE
    );

    p.pop();
  }

  mouse_pressed(input) {
    SOUND_TOGGLE.mouse_pressed(input.mouse_coords);
    MELODY_A_BUTTON.mouse_pressed(input.mouse_coords);
    MELODY_B_BUTTON.mouse_pressed(input.mouse_coords);
    MELODY_C_BUTTON.mouse_pressed(input.mouse_coords);
  }

  mouse_moved(input) {
    SOUND_TOGGLE.mouse_moved(input.mouse_coords);
    MELODY_A_BUTTON.mouse_moved(input.mouse_coords);
    MELODY_B_BUTTON.mouse_moved(input.mouse_coords);
    MELODY_C_BUTTON.mouse_moved(input.mouse_coords);
  }

  mouse_dragged(input) {
    SOUND_TOGGLE.mouse_dragged(input.mouse_coords);
    MELODY_A_BUTTON.mouse_dragged(input.mouse_coords);
    MELODY_B_BUTTON.mouse_dragged(input.mouse_coords);
    MELODY_C_BUTTON.mouse_dragged(input.mouse_coords);
  }

  mouse_released(input) {
    SOUND_TOGGLE.mouse_released(input.mouse_coords);
    MELODY_A_BUTTON.mouse_released(input.mouse_coords);
    MELODY_B_BUTTON.mouse_released(input.mouse_coords);
    MELODY_C_BUTTON.mouse_released(input.mouse_coords);
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

    PLAY.events.addEventListener("click", async () => {
      await SOUND.init();
      SOUND.register_score("melody_a", layered_melody());
      SOUND.register_score("melody_b", phase_scale());
      SOUND.register_score("melody_c", symmetry_melody());
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
      SOUND.play_score("melody_a");
    });

    MELODY_B_BUTTON.events.addEventListener("click", () => {
      SOUND.play_score("melody_b");
    });

    MELODY_C_BUTTON.events.addEventListener("click", () => {
      SOUND.play_score("melody_c");
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
