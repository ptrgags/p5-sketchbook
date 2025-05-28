import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/p5_helpers/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";
import {
  LinePrimitive,
  TextPrimitive,
} from "../../sketchlib/rendering/primitives.js";
import { TextStyle } from "../../sketchlib/rendering/TextStyle.js";
import { Transform } from "../../sketchlib/rendering/Transform.js";
import { Style } from "../../sketchlib/Style.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { render_score } from "../lablib/music/render_score.js";
import { MuteButton } from "../lablib/MuteButton.js";
import { Oklch } from "../lablib/Oklch.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
import { Rectangle } from "../lablib/Rectangle.js";
import { SoundManager } from "../lablib/SoundManager.js";
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

const PART_STYLES = Oklch.gradient(
  new Oklch(0.7, 0.1, 0),
  new Oklch(0.7, 0.1, 350),
  5
).map(
  (x) =>
    new Style({
      stroke: x.adjust_lightness(-0.2).to_srgb(),
      fill: x.to_srgb(),
    })
);

const RENDERED_TIMELINES = {};
const MEASURE_DIMENSIONS = Point.direction(25, 25);

for (const [key, score] of Object.entries(SOUND_MANIFEST.scores)) {
  RENDERED_TIMELINES[key] = render_score(
    Point.ORIGIN,
    score,
    MEASURE_DIMENSIONS,
    PART_STYLES
  );
}

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

const MARGIN = 50;
const MELODY_BUTTON_SIZE = 150;
const MELODY_BUTTON_DIMENSIONS = Point.direction(
  MELODY_BUTTON_SIZE,
  MELODY_BUTTON_SIZE
);

const TEXT_STYLE = new TextStyle(24, "center", "center");
const TEXT_A = new TextPrimitive(
  "Melody A",
  Point.point(MARGIN + MELODY_BUTTON_SIZE / 2, HEIGHT / 2)
);
const TEXT_B = new TextPrimitive(
  "Melody B",
  Point.point(WIDTH - MARGIN - MELODY_BUTTON_SIZE / 2, HEIGHT / 2)
);
const TEXT_C = new TextPrimitive(
  "Melody C",
  Point.point(MARGIN + MELODY_BUTTON_SIZE / 2, HEIGHT / 2 + MELODY_BUTTON_SIZE)
);

const TEXT_COLOR = new Style({
  fill: Color.WHITE,
});
const BUTTON_LABELS = new GroupPrimitive([TEXT_A, TEXT_B, TEXT_C], {
  style: TEXT_COLOR,
  text_style: TEXT_STYLE,
});

const TIMELINE_TOP = HEIGHT / 8;

const CURSOR = new GroupPrimitive(
  new LinePrimitive(
    Point.point(WIDTH / 2, TIMELINE_TOP),
    Point.point(WIDTH / 2, TIMELINE_TOP + HEIGHT / 4)
  ),
  { style: Style.DEFAULT_STROKE }
);

class SoundScene {
  constructor(sound) {
    this.sound = sound;
    this.mute_button = new MuteButton();
    this.events = new EventTarget();

    this.mute_button.events.addEventListener(
      "change",
      (/** @type {CustomEvent}*/ e) => {
        this.sound.toggle_sound(e.detail.sound_on);
      }
    );

    this.melody_a_button = new TouchButton(
      new Rectangle(
        Point.point(MARGIN, HEIGHT / 2 - MELODY_BUTTON_SIZE / 2),
        MELODY_BUTTON_DIMENSIONS
      )
    );

    this.melody_b_button = new TouchButton(
      new Rectangle(
        Point.point(
          WIDTH - MARGIN - MELODY_BUTTON_SIZE,
          HEIGHT / 2 - MELODY_BUTTON_SIZE / 2
        ),
        MELODY_BUTTON_DIMENSIONS
      )
    );

    this.melody_c_button = new TouchButton(
      new Rectangle(
        Point.point(MARGIN, HEIGHT / 2 + MELODY_BUTTON_SIZE / 2),
        MELODY_BUTTON_DIMENSIONS
      )
    );

    this.selected_melody = undefined;

    this.melody_a_button.events.addEventListener("click", () => {
      this.selected_melody = "melody_a";
      this.sound.play_score(this.selected_melody);
    });

    this.melody_b_button.events.addEventListener("click", () => {
      this.selected_melody = "melody_b";
      this.sound.play_score(this.selected_melody);
    });

    this.melody_c_button.events.addEventListener("click", () => {
      this.selected_melody = "melody_c";
      this.sound.play_score(this.selected_melody);
    });
  }

  render() {
    const mute = this.mute_button.render();
    const melody_a = this.melody_a_button.debug_render();
    const melody_b = this.melody_b_button.debug_render();
    const melody_c = this.melody_c_button.debug_render();

    const primitives = [mute, melody_a, melody_b, melody_c, BUTTON_LABELS];

    if (this.selected_melody !== undefined) {
      const current_time = SOUND.transport_time;
      const x = current_time * MEASURE_DIMENSIONS.x;
      const transform = new Transform(
        Point.direction(WIDTH / 2 - x, TIMELINE_TOP)
      );
      const timeline = RENDERED_TIMELINES[this.selected_melody];
      const shifted = new GroupPrimitive(timeline, { transform });

      return new GroupPrimitive([...primitives, shifted, CURSOR]);
    }

    return new GroupPrimitive(primitives);
  }

  update() {}

  mouse_pressed(input) {
    this.mute_button.mouse_pressed(input);
    this.melody_a_button.mouse_pressed(input.mouse_coords);
    this.melody_b_button.mouse_pressed(input.mouse_coords);
    this.melody_c_button.mouse_pressed(input.mouse_coords);
  }

  mouse_moved(input) {
    this.mute_button.mouse_moved(input);
    this.melody_a_button.mouse_moved(input.mouse_coords);
    this.melody_b_button.mouse_moved(input.mouse_coords);
    this.melody_c_button.mouse_moved(input.mouse_coords);
  }

  mouse_dragged(input) {
    this.mute_button.mouse_dragged(input);
    this.melody_a_button.mouse_dragged(input.mouse_coords);
    this.melody_b_button.mouse_dragged(input.mouse_coords);
    this.melody_c_button.mouse_dragged(input.mouse_coords);
  }

  mouse_released(input) {
    this.mute_button.mouse_released(input);
    this.melody_a_button.mouse_released(input.mouse_coords);
    this.melody_b_button.mouse_released(input.mouse_coords);
    this.melody_c_button.mouse_released(input.mouse_coords);
  }
}

export const sketch = (p) => {
  /** @type {PlayButtonScene | SoundScene} */
  let scene = new PlayButtonScene(SOUND);
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;

    MOUSE.setup(canvas);

    scene.events.addEventListener("scene-change", () => {
      scene = new SoundScene(SOUND);
    });
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
