import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
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
import { Piano } from "./Piano.js";
import { SpiralBurst } from "./SpiralBurst.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { decode_midi } from "../sketchlib/midi/decode_midi.js";
import { MusicalCues } from "../sketchlib/music/MusicalCues.js";
import { midi_to_score } from "../sketchlib/midi/midi_to_score.js";
import { SCORE_PHASE_SCALE } from "./example_scores/phase_scale.js";
import { SCORE_SYMMETRY_MELODY } from "./example_scores/symmetry_melody.js";
import { SCORE_BINARY_CHORDS } from "./example_scores/binary_chords.js";
import { SCORE_ORGAN_CHORDS } from "./example_scores/organ_chords.js";
import { SCORE_PATTERN_TEST } from "./example_scores/pattern_test.js";
import { SCORE_LAYERED_MELODY } from "./example_scores/layered_melody.js";
import { Part, Score } from "../sketchlib/music/Score.js";
import { AbsTimelineOps } from "../sketchlib/music/AbsTimelineOps.js";
import { PlayedNotes } from "./PlayedNotes.js";
import { Ocarina } from "./Ocarina.js";
import { RelTimelineOps } from "../sketchlib/music/RelTimelineOps.js";
import { A4, F6 } from "../sketchlib/music/pitches.js";

const MOUSE = new CanvasMouseHandler();

/**@type {import("../sketchlib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {
    layered_melody: SCORE_LAYERED_MELODY,
    phase_scale: SCORE_PHASE_SCALE,
    symmetry_melody: SCORE_SYMMETRY_MELODY,
    binary_progression: SCORE_BINARY_CHORDS,
    chord_cascade: SCORE_ORGAN_CHORDS,
    pattern_test: SCORE_PATTERN_TEST,
  },
};

const PART_STYLES = Oklch.gradient(
  new Oklch(0.7, 0.1, 0),
  new Oklch(0.7, 0.1, 350),
  16,
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
  new MelodyButtonDescriptor("chord_cascade", "Chord Cascade"),
);
MELODY_BUTTONS.set(
  new Index2D(2, 1),
  new MelodyButtonDescriptor("pattern_test", "PatternGrid Test"),
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
    this.piano = new Piano(PIANO_BOUNDS, new PlayedNotes([]));
    this.ocarina = new Ocarina(
      new Rectangle(Point.ORIGIN, new Direction(400, 400)),
      new PlayedNotes([]),
      4,
    );
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
        const [score, tempos] = midi_to_score(midi);

        const basename = fname.replace(/\.mid$/i, "");
        const score_id = `imported_${basename}`;

        // Tuck this away here for now...
        SOUND_MANIFEST.scores[score_id] = score;

        this.sound.register_score(score_id, score);
        RENDERED_TIMELINES[score_id] = render_score(
          Point.ORIGIN,
          score,
          MEASURE_DIMENSIONS,
          PART_STYLES,
        );
        this.change_score(score_id);

        const bpm = tempos[0] ?? 120;
        SOUND.set_tempo(bpm);
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

    this.melody_buttons = melodies.map_array((index, descriptor) => {
      const corner = index.to_world(FIRST_BUTTON_POSITION, BUTTON_STRIDE);
      const rectangle = new Rectangle(corner, MELODY_BUTTON_DIMENSIONS);
      const button = new TouchButton(rectangle);
      button.events.addEventListener("click", () => {
        this.change_score(descriptor.id);
      });
      return button;
    });
  }

  change_score(score_id) {
    const score = SOUND_MANIFEST.scores[score_id];

    this.selected_melody = score_id;
    this.replace_instruments(score);
    this.sound.play_score(score_id);
    this.export_button.disabled = false;
    this.export_gm_button.disabled = false;
  }

  /**
   *
   * @param {Score<number>} score
   * @returns {{
   * drums: Part<number>[],
   * monophonic: Part<number>[],
   * polyphonic: Part<number>[]
   * }}
   */
  classify_parts(score) {
    const drums = [];
    const monophonic = [];
    const polyphonic = [];
    for (const part of score.parts) {
      const DRUMS = 9;
      if (part.midi_channel === DRUMS) {
        drums.push(part);
        continue;
      }

      const voices = RelTimelineOps.num_lanes(part.music);
      if (voices === 1) {
        monophonic.push(part);
      } else {
        polyphonic.push(part);
      }
    }

    return {
      drums,
      monophonic,
      polyphonic,
    };
  }

  /**
   *
   * @param {Score<number>} score
   */
  replace_instruments(score) {
    const { polyphonic, monophonic } = this.classify_parts(score);

    const all_intervals = [];

    const ocarina_compatible = [];
    for (const mono_part of monophonic) {
      const abs_music = AbsTimelineOps.from_relative(mono_part.music);
      const intervals = [...AbsTimelineOps.iter_intervals(abs_music)];
      const notes = new PlayedNotes(intervals);

      if (notes.pitch_range) {
        const octave = Ocarina.check_compatibility(notes.pitch_range);
        console.log("octave", octave);
      }

      // check if ocarina compatible for a tenor ocarina
      if (
        notes.pitch_range &&
        notes.pitch_range[0] >= A4 &&
        notes.pitch_range[1] <= F6 &&
        // only kep the first compatible melody
        ocarina_compatible.length === 0
      ) {
        ocarina_compatible.push(notes);
      } else {
        all_intervals.push(...intervals);
      }

      console.log(mono_part, notes.pitch_range);
    }

    console.log("ocarina compatible: ", ocarina_compatible);
    if (ocarina_compatible.length === 0) {
      this.ocarina = new Ocarina(
        new Rectangle(Point.ORIGIN, new Direction(400, 400)),
        new PlayedNotes([]),
        4,
      );
    } else {
      const [ocarina_notes] = ocarina_compatible;
      this.ocarina = new Ocarina(
        new Rectangle(Point.ORIGIN, new Direction(400, 400)),
        ocarina_notes,
        4,
      );
    }

    for (const poly_part of polyphonic) {
      const abs_music = AbsTimelineOps.from_relative(poly_part.music);
      all_intervals.push(...AbsTimelineOps.iter_intervals(abs_music));
    }
    const played_notes = new PlayedNotes(all_intervals);
    this.piano = new Piano(PIANO_BOUNDS, played_notes);
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

    // this should really go in update()
    this.piano.update(current_time);
    this.ocarina.update(current_time);

    const mute = this.mute_button.render();
    const melody_buttons = this.melody_buttons.map((x) => x.debug_render());
    const burst = this.spiral_burst.render(current_time);
    const timeline = this.render_timeline(current_time);

    // TODO: this should be rewritten to use the Animated interface
    return group(
      mute,
      ...melody_buttons,
      BUTTON_LABELS,
      this.piano.primitive,
      timeline,
      CURSOR,
      this.ocarina.primitive,
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
