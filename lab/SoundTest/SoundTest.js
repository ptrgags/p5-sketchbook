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
import { MuteButton } from "../lablib/MuteButton.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
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

/**@type {import("../lablib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {
    melody_a: layered_melody(),
    melody_b: phase_scale(),
    melody_c: symmetry_melody(),
  },
};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

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
  constructor(sound) {
    this.sound = sound;
    this.mute_button = new MuteButton();

    this.mute_button.events.addEventListener(
      "change",
      (/** @type {CustomEvent}*/ e) => {
        this.sound.toggle_sound(e.detail.sound_on);
      }
    );
  }

  draw(p) {
    const mute = this.mute_button.render();
    const melody_a = MELODY_A_BUTTON.debug_render();
    const melody_b = MELODY_B_BUTTON.debug_render();
    const melody_c = MELODY_C_BUTTON.debug_render();

    const scene = new GroupPrimitive([mute, melody_a, melody_b, melody_c]);
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
    this.mute_button.mouse_pressed(input);
    MELODY_A_BUTTON.mouse_pressed(input.mouse_coords);
    MELODY_B_BUTTON.mouse_pressed(input.mouse_coords);
    MELODY_C_BUTTON.mouse_pressed(input.mouse_coords);
  }

  mouse_moved(input) {
    this.mute_button.mouse_moved(input);
    MELODY_A_BUTTON.mouse_moved(input.mouse_coords);
    MELODY_B_BUTTON.mouse_moved(input.mouse_coords);
    MELODY_C_BUTTON.mouse_moved(input.mouse_coords);
  }

  mouse_dragged(input) {
    this.mute_button.mouse_dragged(input);
    MELODY_A_BUTTON.mouse_dragged(input.mouse_coords);
    MELODY_B_BUTTON.mouse_dragged(input.mouse_coords);
    MELODY_C_BUTTON.mouse_dragged(input.mouse_coords);
  }

  mouse_released(input) {
    this.mute_button.mouse_released(input.mouse_coords);
    MELODY_A_BUTTON.mouse_released(input.mouse_coords);
    MELODY_B_BUTTON.mouse_released(input.mouse_coords);
    MELODY_C_BUTTON.mouse_released(input.mouse_coords);
  }
}

export const sketch = (p) => {
  /** @type {PlayButtonScene | SoundScene} */
  let scene = new PlayButtonScene();
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;

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

    scene.update();

    const scene_primitive = scene.render();
    draw_primitive(p, scene_primitive);
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
