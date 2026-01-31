import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { xform, group, style } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { Style } from "../sketchlib/Style.js";
import { CanvasMouseHandler } from "../sketchlib/CanvasMouseHandler.js";
import { encode_midi_file } from "../sketchlib/midi/encode_midi.js";
import {
  MIDIExportFormat,
  score_to_midi,
} from "../sketchlib/midi/score_to_midi.js";
import { MouseInput } from "../sketchlib/MouseInput.js";
import { render_score } from "../sketchlib/music/render_score.js";
import { MuteButton } from "../sketchlib/MuteButton.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { PlayButtonScene } from "../sketchlib/PlayButtonScene.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { TouchButton } from "../sketchlib/TouchButton.js";
import {
  binary_chords,
  layered_melody,
  phase_scale,
  symmetry_melody,
  organ_chords,
} from "./example_scores.js";
import { Piano } from "./Piano.js";
import { SpiralBurst } from "./SpiralBurst.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { decode_midi } from "../sketchlib/midi/decode_midi.js";
import { Cue, MusicalCues } from "../sketchlib/music/MusicalCues.js";
import { BasicSynth } from "../sketchlib/instruments/BasicSynth.js";
import {
  DrawbarOrgan,
  Drawbars,
} from "../sketchlib/instruments/DrawbarOrgan.js";
import { InstrumentMap } from "../sketchlib/instruments/InstrumentMap.js";

const MOUSE = new CanvasMouseHandler();

const INSTRUMENTS_ORIGINAL = new InstrumentMap({
  sine: new BasicSynth("sine"),
  square: new BasicSynth("square"),
  poly: new BasicSynth("triangle"),
  supersaw: new BasicSynth("sawtooth"),
  organ: new DrawbarOrgan(new Drawbars("88 8800 000")),
});

const INSTRUMENTS_ORGAN = new InstrumentMap({
  sine: new DrawbarOrgan(new Drawbars("00 8000 000")),
  square: new DrawbarOrgan(new Drawbars("00 8060 400")),
  poly: new DrawbarOrgan(new Drawbars("00 8030 100")),
  supersaw: new DrawbarOrgan(new Drawbars("00 8765 432")),
  organ: new DrawbarOrgan(new Drawbars("88 8800 000")),
});

/**@type {import("../sketchlib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {
    layered_melody: layered_melody(),
    phase_scale: phase_scale(),
    symmetry_melody: symmetry_melody(),
    binary_progression: binary_chords(),
    organ_chords: organ_chords(),
  },
  instruments: {
    original: INSTRUMENTS_ORIGINAL,
    organ: INSTRUMENTS_ORGAN,
  },
};

const PART_STYLES = Oklch.gradient(
  new Oklch(0.7, 0.1, 0),
  new Oklch(0.7, 0.1, 350),
  5,
).map(
  (x) =>
    new Style({
      stroke: x.adjust_lightness(-0.2),
      fill: x,
    }),
);

const RENDERED_TIMELINES = {};
const MEASURE_DIMENSIONS = new Direction(25, 50);

for (const [key, score] of Object.entries(SOUND_MANIFEST.scores)) {
  RENDERED_TIMELINES[key] = render_score(
    Point.ORIGIN,
    score,
    MEASURE_DIMENSIONS,
    PART_STYLES,
  );
}

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);
//@ts-ignore
const CUES = new MusicalCues(Tone);

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

const MELODY_BUTTONS = new Grid(3, 2);
MELODY_BUTTONS.set(
  new Index2D(0, 0),
  new MelodyButtonDescriptor("layered_melody", "Layered Melody"),
);
MELODY_BUTTONS.set(
  new Index2D(0, 1),
  new MelodyButtonDescriptor("phase_scale", "Phase Scale"),
);
MELODY_BUTTONS.set(
  new Index2D(1, 0),
  new MelodyButtonDescriptor("symmetry_melody", "Symmetry Melody"),
);
MELODY_BUTTONS.set(
  new Index2D(1, 1),
  new MelodyButtonDescriptor("binary_progression", "4-bit Chords"),
);
MELODY_BUTTONS.set(
  new Index2D(2, 0),
  new MelodyButtonDescriptor("organ_chords", "Organ Test Chords"),
);

const MELODY_BUTTON_SIZE = 150;
const MELODY_BUTTON_DIMENSIONS = new Direction(
  MELODY_BUTTON_SIZE,
  MELODY_BUTTON_SIZE / 3,
);
const MELODY_BUTTON_CENTER_OFFSET = MELODY_BUTTON_DIMENSIONS.scale(0.5);
const TEXT_STYLE = new TextStyle(16, "center", "center");
const TEXT_COLOR = new Style({
  fill: Color.WHITE,
});

const GRID_BOUNDARY = new Rectangle(
  new Point(0, HEIGHT / 2),
  new Direction(WIDTH, HEIGHT / 2),
);
const GRID_MARGIN = new Direction(75, 80);
const [FIRST_BUTTON_POSITION, BUTTON_STRIDE] = MELODY_BUTTONS.compute_layout(
  GRID_BOUNDARY,
  MELODY_BUTTON_DIMENSIONS,
  GRID_MARGIN,
);

/**
 * Make the text primitives for the buttons.
 * @param {Grid<MelodyButtonDescriptor>} buttons The button descriptions
 * @return {GroupPrimitive} A single group containing all the text
 */
function make_button_labels(buttons) {
  const primitives = buttons.map_array((index, descriptor) => {
    if (!descriptor) {
      return GroupPrimitive.EMPTY;
    }
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
    new Point(WIDTH / 2, TIMELINE_TOP + HEIGHT / 4),
  ),
  Style.DEFAULT_STROKE,
);

/**
 * Download a generated file
 * @param {File} file The file to downlowd
 */
function download_file(file) {
  const url = URL.createObjectURL(file);

  const anchor = document.createElement("a");
  anchor.setAttribute("href", url);
  anchor.setAttribute("download", file.name);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function clear_errors() {
  document.getElementById("errors").innerText = "";
}

function show_error(message) {
  document.getElementById("errors").innerText = message;
}

/**
 * Import a MIDI file from a file picker
 * @param {File[]} file_list
 * @returns {Promise<[string, ArrayBuffer]>} The filename and the buffer containing the MIDI data
 */
async function import_midi_file(file_list) {
  if (file_list.length === 0) {
    throw new Error("please chose a .mid file");
  }

  const file = file_list[0];
  const fname = file.name;
  const buffer = await file.arrayBuffer();

  return [fname, buffer];
}

const PIANO_BOUNDS = new Rectangle(
  new Point(0, 300),
  new Direction(500, 300 / 3),
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
    this.piano = new Piano(PIANO_BOUNDS, 3, 4);
    this.spiral_burst = new SpiralBurst();

    this.mute_button.events.addEventListener(
      "change",
      (/** @type {CustomEvent}*/ e) => {
        this.sound.toggle_sound(e.detail.sound_on);
      },
    );

    // This button is disabled until a score is selected.
    this.export_button = expect_element("export_clips", HTMLButtonElement);
    this.export_button.addEventListener("click", () =>
      this.export_selected(MIDIExportFormat.CLIPS),
    );

    this.export_gm_button = expect_element("export_gm", HTMLButtonElement);
    this.export_gm_button.addEventListener("click", () =>
      this.export_selected(MIDIExportFormat.GENERAL_MIDI),
    );

    this.import_input = expect_element("import", HTMLInputElement);
    this.import_input.addEventListener("input", async (e) => {
      clear_errors();
      try {
        //@ts-ignore
        const [fname, midi_data] = await import_midi_file(e.target.files);
        const midi = decode_midi(midi_data);
        console.log(midi);
      } catch (err) {
        console.error(err);
        show_error(err);
      }
    });
    this.import_input.disabled = false;

    /**
     * ID of the score currently playing
     * @type {string}
     */
    this.selected_melody = undefined;

    CUES.events.addEventListener("note-on", (/** @type {CustomEvent} */ e) => {
      this.piano.trigger(e.detail.value.pitch);
    });
    CUES.events.addEventListener("note-off", (/** @type {CustomEvent} */ e) => {
      this.piano.release(e.detail.value.pitch);
    });

    this.melody_buttons = melodies.map_array((index, descriptor) => {
      const corner = index.to_world(FIRST_BUTTON_POSITION, BUTTON_STRIDE);
      const rectangle = new Rectangle(corner, MELODY_BUTTON_DIMENSIONS);
      const button = new TouchButton(rectangle);
      button.events.addEventListener("click", () => {
        this.selected_melody = descriptor.id;
        this.export_button.disabled = false;
        this.export_gm_button.disabled = false;
        this.piano.reset();

        this.sound.play_score(this.selected_melody);

        // This only works after play_score because SoundManager clears
        // the _entire_ timeline. The next version should keep track of
        // scheduled IDs and only clear ones pertaining to music.
        const score = SOUND_MANIFEST.scores[this.selected_melody];
        CUES.unschedule_all();
        CUES.schedule_notes(score);
      });
      return button;
    });
  }

  /**
   *
   * @param {MIDIExportFormat} export_format
   * @returns
   */
  export_selected(export_format) {
    if (!this.selected_melody) {
      return;
    }

    const midi = score_to_midi(
      SOUND_MANIFEST.scores[this.selected_melody],
      export_format,
    );

    const suffix = export_format === MIDIExportFormat.CLIPS ? "clips" : "gm";

    const file = encode_midi_file(
      midi,
      `${this.selected_melody}-${suffix}.mid`,
    );
    download_file(file);
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

    const mute = this.mute_button.render();
    const melody_buttons = this.melody_buttons.map((x) => x.debug_render());
    const piano = this.piano.render();
    const burst = this.spiral_burst.render(current_time);
    const timeline = this.render_timeline(current_time);

    return group(
      mute,
      ...melody_buttons,
      BUTTON_LABELS,
      piano,
      timeline,
      CURSOR,
      burst,
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
      document.getElementById("sketch-canvas"),
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
