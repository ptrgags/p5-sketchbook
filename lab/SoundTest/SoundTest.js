import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { Grid, Index2D } from "../../sketchlib/Grid.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../sketchlib/primitives/LinePrimitive.js";
import { xform, group, style } from "../../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../../sketchlib/primitives/TextStyle.js";
import { Transform } from "../../sketchlib/primitives/Transform.js";
import { Style } from "../../sketchlib/Style.js";
import { AnimationCurves } from "../lablib/animation/AnimationCurves.js";
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
import { Piano } from "./Piano.js";
import { SpiralBurst } from "./SpiralBurst.js";

const MOUSE = new CanvasMouseHandler();

/**@type {import("../lablib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {
    layered_melody: layered_melody(),
    phase_scale: phase_scale(),
    symmetry_melody: symmetry_melody(),
    binary_progression: binary_chords(),
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
const MEASURE_DIMENSIONS = new Direction(25, 50);

for (const [key, score] of Object.entries(SOUND_MANIFEST.scores)) {
  RENDERED_TIMELINES[key] = render_score(
    Point.ORIGIN,
    score,
    MEASURE_DIMENSIONS,
    PART_STYLES
  );
}

/**
 * @type {{[score_id: string]: AnimationCurves}}
 */
const ANIM = {};
for (const [score_id, score] of Object.entries(SOUND_MANIFEST.scores)) {
  ANIM[score_id] = score.curves;
}
const DEFAULT_CURVES = new AnimationCurves({});

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
const MELODY_BUTTON_DIMENSIONS = new Direction(
  MELODY_BUTTON_SIZE,
  MELODY_BUTTON_SIZE / 2
);
const MELODY_BUTTON_CENTER_OFFSET = MELODY_BUTTON_DIMENSIONS.scale(0.5);
const TEXT_STYLE = new TextStyle(16, "center", "center");
const TEXT_COLOR = new Style({
  fill: Color.WHITE,
});

const GRID_BOUNDARY = new Rectangle(
  new Point(0, HEIGHT / 2),
  new Direction(WIDTH, HEIGHT / 2)
);
const GRID_MARGIN = new Direction(75, 80);
const [FIRST_BUTTON_POSITION, BUTTON_STRIDE] = MELODY_BUTTONS.compute_layout(
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
    const offset = FIRST_BUTTON_POSITION.add(MELODY_BUTTON_CENTER_OFFSET);
    const position_world = index.to_world(offset, BUTTON_STRIDE);
    return new TextPrimitive(descriptor.label, position_world);
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
    new Point(WIDTH / 2, TIMELINE_TOP),
    new Point(WIDTH / 2, TIMELINE_TOP + HEIGHT / 4)
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
    this.piano = new Piano(
      new Rectangle(new Point(0, 300), new Direction(500, 300 / 3)),
      3,
      4
    );
    this.spiral_burst = new SpiralBurst();

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

    this.sound.events.addEventListener(
      "note-on",
      (/** @type {CustomEvent} */ e) => {
        this.piano.trigger(e.detail.note.pitch);
      }
    );
    this.sound.events.addEventListener(
      "note-off",
      (/** @type {CustomEvent} */ e) => {
        this.piano.release(e.detail.note.pitch);
      }
    );

    this.melody_buttons = melodies.map_array((index, descriptor) => {
      const corner = index.to_world(FIRST_BUTTON_POSITION, BUTTON_STRIDE);
      const rectangle = new Rectangle(corner, MELODY_BUTTON_DIMENSIONS);
      const button = new TouchButton(rectangle);
      button.events.addEventListener("click", () => {
        this.selected_melody = descriptor.id;
        this.piano.reset();
        this.sound.play_score(this.selected_melody);
      });
      return button;
    });
  }

  render_timeline(time) {
    if (this.selected_melody === undefined) {
      return GroupPrimitive.EMPTY;
    }

    const x = time * MEASURE_DIMENSIONS.x;
    const transform = new Transform(new Direction(WIDTH / 2 - x, TIMELINE_TOP));
    const timeline = RENDERED_TIMELINES[this.selected_melody];
    return xform(timeline, transform);
  }

  render() {
    const current_time = SOUND.transport_time;
    const animation = ANIM[this.selected_melody] ?? DEFAULT_CURVES;
    animation.update(current_time);

    const mute = this.mute_button.render();
    const melody_buttons = this.melody_buttons.map((x) => x.debug_render());
    const piano = this.piano.render();
    const burst = this.spiral_burst.render(animation);
    const timeline = this.render_timeline(current_time);

    return group(
      mute,
      ...melody_buttons,
      BUTTON_LABELS,
      piano,
      timeline,
      CURSOR,
      burst
    );
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
      // @ts-ignore
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
    scene_primitive.draw(p);
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
