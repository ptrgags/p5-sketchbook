import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { Grid, Index2D } from "../../sketchlib/Grid.js";
import { draw_primitive } from "../../sketchlib/p5_helpers/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";
import {
  LinePrimitive,
  TextPrimitive,
} from "../../sketchlib/rendering/primitives.js";
import { group, style, xform } from "../../sketchlib/rendering/shorthand.js";
import { TextStyle } from "../../sketchlib/rendering/TextStyle.js";
import { Transform } from "../../sketchlib/rendering/Transform.js";
import { Style } from "../../sketchlib/Style.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { MouseInput } from "../lablib/MouseInput.js";
import { render_score } from "../lablib/music/render_score.js";
import { MuteButton } from "../lablib/MuteButton.js";
import { Oklch } from "../lablib/Oklch.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
import { Rectangle } from "../lablib/Rectangle.js";
import { SoundManager } from "../lablib/SoundManager.js";
import { TouchButton } from "../lablib/TouchButton.js";
import {
  binary_chords,
  layered_melody,
  phase_scale,
  symmetry_melody,
} from "./example_scores.js";

const MOUSE = new CanvasMouseHandler();

/**@type {import("../lablib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {
    layered_melody: layered_melody(),
    phase_scale: phase_scale(),
    symmetry_melody: symmetry_melody(),
    //binary_progression: binary_chords(),
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

class MelodyButtonDescriptor {
  /**
   * Data associated with a melody button
   * @param {string} id The id of the melody to play
   * @param {string} label The human-readable label for the button
   */
  constructor(id, label) {
    this.id = id;
    this.label = label;
  }
}

const MELODY_BUTTONS = new Grid(2, 2);
MELODY_BUTTONS.set(
  new Index2D(0, 0),
  new MelodyButtonDescriptor("layered_melody", "Layered Melody")
);
MELODY_BUTTONS.set(
  new Index2D(0, 1),
  new MelodyButtonDescriptor("phase_scale", "Phase Scale")
);
MELODY_BUTTONS.set(
  new Index2D(1, 0),
  new MelodyButtonDescriptor("symmetry_melody", "Symmetry Melody")
);
MELODY_BUTTONS.set(
  new Index2D(1, 1),
  new MelodyButtonDescriptor("binary_progression", "4-bit Chords")
);

const MELODY_BUTTON_SIZE = 150;
const MELODY_BUTTON_DIMENSIONS = Point.direction(
  MELODY_BUTTON_SIZE,
  MELODY_BUTTON_SIZE / 2
);
const MELODY_BUTTON_CENTER_OFFSET = MELODY_BUTTON_DIMENSIONS.scale(0.5);
const TEXT_STYLE = new TextStyle(16, "center", "center");
const TEXT_COLOR = new Style({
  fill: Color.WHITE,
});

const GRID_BOUNDARY = new Rectangle(
  Point.point(0, HEIGHT / 2),
  Point.direction(WIDTH, HEIGHT / 2)
);
const GRID_MARGIN = Point.direction(75, 80);
const [BUTTON_OFFSET, BUTTON_STRIDE] = MELODY_BUTTONS.compute_layout(
  GRID_BOUNDARY,
  MELODY_BUTTON_DIMENSIONS,
  GRID_MARGIN
);

/**
 * Make the text primitives for the buttons.
 * @param {Grid<MelodyButtonDescriptor>} buttons The button descriptions
 * @return {GroupPrimitive} A single group containing all the text
 */
function make_button_labels(buttons) {
  const primitives = buttons.map_array((index, descriptor) => {
    const point = index.to_world(
      BUTTON_OFFSET.add(MELODY_BUTTON_CENTER_OFFSET),
      BUTTON_STRIDE
    );
    return new TextPrimitive(descriptor.label, point);
  });

  return new GroupPrimitive(primitives, {
    style: TEXT_COLOR,
    text_style: TEXT_STYLE,
  });
}

const BUTTON_LABELS = make_button_labels(MELODY_BUTTONS);

const TIMELINE_TOP = HEIGHT / 8;

const CURSOR = style(
  new LinePrimitive(
    Point.point(WIDTH / 2, TIMELINE_TOP),
    Point.point(WIDTH / 2, TIMELINE_TOP + HEIGHT / 4)
  ),
  Style.DEFAULT_STROKE
);

class SoundScene {
  /**
   * Constructor
   * @param {SoundManager} sound Reference to the sound manager
   * @param {Grid<MelodyButtonDescriptor>} melodies The melodies to create buttons for
   */
  constructor(sound, melodies) {
    this.sound = sound;
    this.mute_button = new MuteButton();
    this.events = new EventTarget();
    this.mute_button.events.addEventListener(
      "change",
      (/** @type {CustomEvent}*/ e) => {
        this.sound.toggle_sound(e.detail.sound_on);
      }
    );

    /**
     * ID of the score currently playing
     * @type {string}
     */
    this.selected_melody = undefined;

    this.melody_buttons = melodies.map_array((index, descriptor) => {
      const corner = index.to_world(BUTTON_OFFSET, BUTTON_STRIDE);
      const rectangle = new Rectangle(corner, MELODY_BUTTON_DIMENSIONS);
      const button = new TouchButton(rectangle);
      button.events.addEventListener("click", () => {
        this.selected_melody = descriptor.id;
        this.sound.play_score(this.selected_melody);
      });
      return button;
    });
  }

  render() {
    const mute = this.mute_button.render();

    const melody_buttons = this.melody_buttons.map((x) => x.debug_render());

    const primitives = [mute, ...melody_buttons, BUTTON_LABELS];

    if (this.selected_melody !== undefined) {
      const current_time = SOUND.transport_time;
      const x = current_time * MEASURE_DIMENSIONS.x;
      const transform = new Transform(
        Point.direction(WIDTH / 2 - x, TIMELINE_TOP)
      );
      const timeline = RENDERED_TIMELINES[this.selected_melody];
      const shifted = xform(timeline, transform);

      return group(...primitives, shifted, CURSOR);
    }

    return group(...primitives);
  }

  update() {}

  /**
   *
   * @param {MouseInput} input
   */
  mouse_pressed(input) {
    this.mute_button.mouse_pressed(input);
    this.melody_buttons.forEach((x) => x.mouse_pressed(input.mouse_coords));
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_moved(input) {
    this.mute_button.mouse_moved(input);
    this.melody_buttons.forEach((x) => x.mouse_moved(input.mouse_coords));
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_dragged(input) {
    this.mute_button.mouse_dragged(input);
    this.melody_buttons.forEach((x) => x.mouse_moved(input.mouse_coords));
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_released(input) {
    this.mute_button.mouse_released(input);
    this.melody_buttons.forEach((x) => x.mouse_released(input.mouse_coords));
  }
}

/**
 *
 * @param {import("p5")} p
 */
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
      scene = new SoundScene(SOUND, MELODY_BUTTONS);
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
