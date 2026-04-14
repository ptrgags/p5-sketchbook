import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { xform, group, style } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { Style } from "../sketchlib/Style.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { encode_midi_file } from "../sketchlib/midi/encode_midi.js";
import {
  MIDIExportFormat,
  score_to_midi,
} from "../sketchlib/midi/score_to_midi.js";
import { render_score } from "../sketchlib/music/render_score.js";
import { MuteButton } from "../sketchlib/MuteButton.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { PlayButtonScene } from "../sketchlib/scenes/PlayButtonScene.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { TouchButton } from "../sketchlib/input/TouchButton.js";
import { Piano } from "./Piano.js";
import { SpiralBurst } from "./SpiralBurst.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { decode_midi } from "../sketchlib/midi/decode_midi.js";
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
import { Ocarina } from "../sketchlib/music_vis/Ocarina.js";
import { RelTimelineOps } from "../sketchlib/music/RelTimelineOps.js";
import { minmax } from "../sketchlib/minmax.js";
import { Note } from "../sketchlib/music/Music.js";
import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { SCORE_OCARINA_TRIO } from "./example_scores/ocarina_trio.js";
import { Rational } from "../sketchlib/Rational.js";
import { MouseCallbacks } from "../sketchlib/input/MouseCallbacks.js";
import { SoundScene } from "../sketchlib/scenes/SoundScene.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { download_file } from "../sketchlib/dom/download_file.js";
import { KeywordRecognizer } from "../sketchlib/KeywordRecognizer.js";
import {
  sawtooth,
  sine,
  triangle,
  square,
} from "../sketchlib/waveforms/basic_waves.js";
import { encode_wav_file } from "../sketchlib/waveforms/encode_wav.js";
import { sample_n_cycles } from "../sketchlib/waveforms/sample_wave.js";

const DEBUG_LOOP = false;
const LOOP_START = new Rational(14 * 4);
const LOOP_DURATION = new Rational(4 * 4);

const DEBUG_JUMP = false;
const JUMP_POINT = LOOP_START;

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
    ocarina_trio: SCORE_OCARINA_TRIO,
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

const MELODY_BUTTONS = new Grid(3, 3);
MELODY_BUTTONS.set(
  new Index2D(0, 0),
  new MelodyButtonDescriptor("layered_melody", "Layered Melody"),
);
MELODY_BUTTONS.set(
  new Index2D(0, 1),
  new MelodyButtonDescriptor("phase_scale", "Phase Scale"),
);
MELODY_BUTTONS.set(
  new Index2D(0, 2),
  new MelodyButtonDescriptor("ocarina_trio", "Ocarina Trio"),
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
const MELODY_BUTTON_DIMENSIONS = new Direction(MELODY_BUTTON_SIZE, 40);
const MELODY_BUTTON_CENTER_OFFSET = MELODY_BUTTON_DIMENSIONS.scale(0.5);
const TEXT_STYLE = new TextStyle(16, "center", "center");
const TEXT_COLOR = new Style({
  fill: Color.WHITE,
});

const PIANO_BOUNDS = new Rectangle(new Point(0, 200), new Direction(500, 100));

const BASS_OCARINA = {
  bounds: new Rectangle(new Point(0, 500), new Direction(200, 200)),
  // Orange
  color: new Oklch(0.6, 0.1, 60),
  octave: Ocarina.OCTAVE_BASS,
};
const TENOR_OCARINA = {
  bounds: new Rectangle(new Point(200, 550), new Direction(150, 150)),
  // Purple
  color: new Oklch(0.5, 0.1, 300),
  octave: Ocarina.OCTAVE_TENOR,
};
const SOPRANO_OCARINA = {
  bounds: new Rectangle(new Point(350, 700 - 112), new Direction(112, 112)),
  // Blue green
  color: new Oklch(0.6, 0.1, 213),
  octave: Ocarina.OCTAVE_SOPRANO,
};

const GRID_BOUNDARY = new Rectangle(
  new Point(0, 300),
  new Direction(WIDTH, 200),
);
const GRID_MARGIN = new Direction(20, 40);
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
      return Primitive.EMPTY;
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

const TIMELINE_TOP = 0;

const CURSOR = style(
  new LineSegment(
    new Point(WIDTH / 2, TIMELINE_TOP),
    new Point(WIDTH / 2, TIMELINE_TOP + HEIGHT / 4),
  ),
  Style.DEFAULT_STROKE,
);

function clear_errors() {
  document.getElementById("errors").innerText = "";
}

function show_error(message) {
  document.getElementById("errors").innerText = message;
}

const SLASH = new KeywordRecognizer();

// A4 = 440 Hz, so
// A2 is A4/2^2 = 110
const SAMPLE_FREQ = 110;
const SAMPLE_NOTE = "A2";
// In Renoise I was getting artifacts with a single cycle, so let's use
// several instead.
const CYCLE_COUNT = 100;

// /trace logs a trace of the scene for investigating performance issues.
SLASH.register(["Slash", "KeyS", "KeyI", "KeyN", "KeyE"], () => {
  const samples = sample_n_cycles(sine, SAMPLE_FREQ, CYCLE_COUNT);
  const wav_file = encode_wav_file(samples, `sine-${SAMPLE_NOTE}.wav`);
  download_file(wav_file);
});

SLASH.register(["Slash", "KeyS", "KeyA", "KeyW"], () => {
  const samples = sample_n_cycles(sawtooth, SAMPLE_FREQ, CYCLE_COUNT);
  const wav_file = encode_wav_file(samples, `saw-${SAMPLE_NOTE}.wav`);
  download_file(wav_file);
});

SLASH.register(["Slash", "KeyT", "KeyR", "KeyI"], () => {
  const samples = sample_n_cycles(triangle, SAMPLE_FREQ, CYCLE_COUNT);
  const wav_file = encode_wav_file(samples, `tri-${SAMPLE_NOTE}.wav`);
  download_file(wav_file);
});

SLASH.register(["Slash", "KeyS", "KeyQ", "KeyR"], () => {
  const samples = sample_n_cycles(square, SAMPLE_FREQ, CYCLE_COUNT);
  const wav_file = encode_wav_file(samples, `square-${SAMPLE_NOTE}.wav`);
  download_file(wav_file);
});

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

class SoundTestAnimation {
  /**
   * Constructor
   * @param {SoundManager} sound Reference to the sound manager
   * @param {Grid<MelodyButtonDescriptor>} melodies The melodies to create buttons for
   */
  constructor(sound, melodies) {
    this.sound = sound;
    this.mute_button = new MuteButton(sound);
    this.events = new EventTarget();
    this.piano = new Piano(PIANO_BOUNDS, new PlayedNotes([]));
    this.ocarinas = {
      bass: new Ocarina(BASS_OCARINA),
      tenor: new Ocarina(TENOR_OCARINA),
      soprano: new Ocarina(SOPRANO_OCARINA),
    };
    this.spiral_burst = new SpiralBurst();

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

        const grid_sizes = score.parts.map((x) =>
          RelTimelineOps.smallest_subdivision(x.music),
        );
        console.log("grid sizes", grid_sizes);

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

    // Need to store the buttons so we can access the callbacks
    this.melody_buttons = melodies.map_array((index, descriptor) => {
      const corner = index.to_world(FIRST_BUTTON_POSITION, BUTTON_STRIDE);
      const rectangle = new Rectangle(corner, MELODY_BUTTON_DIMENSIONS);
      const button = new TouchButton(rectangle);
      button.events.addEventListener("click", () => {
        this.change_score(descriptor.id);
      });
      return button;
    });
    this.button_group = new AnimationGroup(...this.melody_buttons);

    this.timeline_prim = group();
    this.ocarina_prims = group(
      this.ocarinas.bass.primitive,
      this.ocarinas.tenor.primitive,
      this.ocarinas.soprano.primitive,
    );
    this.piano_prim = group();

    this.primitive = group(
      this.button_group.primitive,
      BUTTON_LABELS,
      this.piano_prim,
      this.timeline_prim,
      CURSOR,
      this.ocarina_prims,
      this.spiral_burst.primitive,
    );
  }

  /**
   *
   * @param {string} score_id
   */
  change_score(score_id) {
    const score = SOUND_MANIFEST.scores[score_id];

    this.selected_melody = score_id;
    this.replace_instruments(score);

    this.sound.play_score(score_id);

    if (DEBUG_LOOP) {
      this.sound.set_loop(LOOP_START, LOOP_DURATION);
    }

    if (DEBUG_JUMP) {
      this.sound.jump_to(JUMP_POINT);
    }

    this.export_button.disabled = false;
    this.export_gm_button.disabled = false;
  }

  /**
   * Classify parts as drums, monophonic melodies or polyphonic music
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
   * Assign parts from the score to either
   * @param {Score<number>} score Score of MIDI notes
   * @returns {{
   *    piano: PlayedNotes,
   *    bass_ocarina: PlayedNotes,
   *    tenor_ocarina: PlayedNotes,
   *    soprano_ocarina: PlayedNotes,
   * }}
   */
  assign_instruments(score) {
    const { polyphonic, monophonic } = this.classify_parts(score);

    /**
     * Temporary storage for intervals that might be used for the ocarinas
     * @type {{[key: string]: AbsInterval<Note<number>>[][]}}
     */
    const ocarina_candidates = {
      bass: [],
      tenor: [],
      soprano: [],
    };

    /**
     * @type {AbsInterval<Note<number>>[]}
     */
    const piano_intervals = [];

    // See if any of the parts would fit in the ocarina range
    // and hold them aside.
    for (const mono_part of monophonic) {
      const abs_music = AbsTimelineOps.from_relative(mono_part.music);
      const intervals = [...AbsTimelineOps.iter_intervals(abs_music)];
      const pitches = intervals.map((x) => x.value.pitch);
      const pitch_range = minmax(pitches);

      if (!pitch_range) {
        // Empty part, skip
        continue;
      }

      const ocarina_octave = Ocarina.check_compatibility(pitch_range);
      if (ocarina_octave === Ocarina.OCTAVE_BASS) {
        ocarina_candidates.bass.push(intervals);
      } else if (ocarina_octave === Ocarina.OCTAVE_TENOR) {
        ocarina_candidates.tenor.push(intervals);
      } else if (ocarina_octave === Ocarina.OCTAVE_SOPRANO) {
        ocarina_candidates.soprano.push(intervals);
      } else {
        // not a match for any of the three ocarinas, so assign to the piano.
        piano_intervals.push(...intervals);
      }
    }

    // Take the first candidate from each list, and assign the rest to the
    // piano
    const [selected_bass, ...rest_bass] = ocarina_candidates.bass;
    const [selected_tenor, ...rest_tenor] = ocarina_candidates.tenor;
    const [selected_soprano, ...rest_soprano] = ocarina_candidates.soprano;
    piano_intervals.push(
      ...rest_bass.flat(),
      ...rest_tenor.flat(),
      ...rest_soprano.flat(),
    );

    // Polyphonic parts are always sent to the piano
    for (const poly_part of polyphonic) {
      const abs_music = AbsTimelineOps.from_relative(poly_part.music);
      piano_intervals.push(...AbsTimelineOps.iter_intervals(abs_music));
    }

    return {
      piano: new PlayedNotes(piano_intervals),
      bass_ocarina: selected_bass ? new PlayedNotes(selected_bass) : undefined,
      tenor_ocarina: selected_tenor
        ? new PlayedNotes(selected_tenor)
        : undefined,
      soprano_ocarina: selected_soprano
        ? new PlayedNotes(selected_soprano)
        : undefined,
    };
  }

  /**
   *
   * @param {Score<number>} score
   */
  replace_instruments(score) {
    const assigned_notes = this.assign_instruments(score);

    this.piano = new Piano(PIANO_BOUNDS, assigned_notes.piano);

    this.ocarinas.bass = new Ocarina(BASS_OCARINA, assigned_notes.bass_ocarina);
    this.ocarinas.tenor = new Ocarina(
      TENOR_OCARINA,
      assigned_notes.tenor_ocarina,
    );
    this.ocarinas.soprano = new Ocarina(
      SOPRANO_OCARINA,
      assigned_notes.soprano_ocarina,
    );

    // Update the primitives
    this.piano_prim.regroup(this.piano.primitive);
    this.ocarina_prims.regroup(
      this.ocarinas.bass.primitive,
      this.ocarinas.tenor.primitive,
      this.ocarinas.soprano.primitive,
    );
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
      return Primitive.EMPTY;
    }

    const x = time * MEASURE_DIMENSIONS.x;
    const transform = new Transform(new Direction(WIDTH / 2 - x, TIMELINE_TOP));
    const timeline = RENDERED_TIMELINES[this.selected_melody];
    return xform(timeline, transform);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    this.piano.update(time);
    this.ocarinas.bass.update(time);
    this.ocarinas.tenor.update(time);
    this.ocarinas.soprano.update(time);
    this.spiral_burst.update(time);
    this.button_group.update(time);

    this.timeline_prim.regroup(this.render_timeline(time));
  }

  /**
   * @type {MouseCallbacks[]}
   */
  get mouse_callbacks() {
    return this.melody_buttons;
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
      // @ts-ignore
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);
    MOUSE.callbacks = scene.mouse_callbacks;

    scene.events.addEventListener("scene-change", () => {
      const anim = new SoundTestAnimation(SOUND, MELODY_BUTTONS);
      scene = new SoundScene(SOUND, anim);
      MOUSE.callbacks = scene.mouse_callbacks;
    });
  };

  p.draw = () => {
    p.background(0);

    scene.update();
    scene.primitive.draw(p);
  };

  MOUSE.configure_callbacks(p);

  p.keyReleased = (/** @type {KeyboardEvent}*/ e) => {
    SLASH.input(e.code);
  };
};
