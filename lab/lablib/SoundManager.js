import { N1, N2, N4, N8 } from "./music/durations.js";
import { MidiPitch } from "./music/pitch_conversions.js";
import { B, C, C3, E, F, G, GS, REST } from "./music/pitches.js";
import {
  parse_melody,
  parse_cycle,
  map_pitch,
  MusicLoop,
  Melody,
  Rest,
  Harmony,
  Score,
} from "./music/Score.js";
import { Rational } from "./Rational.js";
import { compile_music, compile_score } from "./tone_helpers/compile_music.js";
import { schedule_clips } from "./tone_helpers/schedule_music.js";

export class SoundManager {
  /**
   * Constructor
   * @param {import('tone')} tone_module The Tone.js module
   */
  constructor(tone_module) {
    this.tone = tone_module;

    this.init_requested = false;
    this.audio_ready = false;

    // these may be stored a different way
    this.synths = {};
    this.patterns = {};

    this.scores = {};
  }

  async init() {
    if (this.init_requested) {
      return;
    }

    this.init_requested = true;

    await this.tone.start();

    this.init_synths();

    const transport = this.tone.getTransport();
    transport.bpm.value = 128;

    this.audio_ready = true;
  }

  /**
   * Toggle the sound on/off.
   * @param {boolean} sound_on true if the sound should turn on
   */
  toggle_sound(sound_on) {
    const FADE_SEC = 0.2;
    const next_volume_db = sound_on ? 0 : -Infinity;
    // While you could set the destination's mute property, that abrupt change
    // can sound like crackling audio, so fade the volume quickly instead.
    this.tone.getDestination().volume.rampTo(next_volume_db, FADE_SEC);
  }

  // Temporary methods (prototyping only)

  init_synths() {
    const sine = new this.tone.Synth({
      oscillator: {
        type: "sine",
      },
    }).toDestination();

    const square = new this.tone.Synth({
      oscillator: { type: "triangle" },
    }).toDestination();
    square.volume.value = -3;

    const poly = new this.tone.PolySynth(this.tone.Synth, {
      oscillator: { type: "fmsine2" },
    }).toDestination();
    poly.volume.value = -9;

    const supersaw = new this.tone.PolySynth(this.tone.Synth, {
      oscillator: { type: "fatsawtooth" },
    });

    this.synths.sine = sine;
    this.synths.square = square;
    this.synths.poly = poly;
    this.synths.supersaw = supersaw;
  }

  /**
   * Compile and save a score
   * @param {string} score_id The score ID to use. This must be the same as
   * the ID used for play_score() later.
   * @param {Score<number>} score Score expressed in MIDI note numbers
   */
  register_score(score_id, score) {
    const compiled = compile_score(this.tone, this.synths, score);
    this.scores[score_id] = compiled;
  }

  init_scores() {
    const patterns = this.patterns;

    const pedal = parse_melody([C3, N4], [REST, N4]);
    /*
    pedal.loop = true;
    pedal.loopStart = "0:0";
    pedal.loopEnd = "0:2";
    */

    /*
    const SCALE = [C, E, F, G, GS, B];
    const SCALE3 = scale_to_pitch(SCALE, 3);
    const SCALE4 = scale_to_pitch(SCALE, 4);
    const SCALE5 = scale_to_pitch(SCALE, 5);

    const N4D = new Rational(3, 8);

    // scores are expressed in scale degrees then converted to pitches
    const scale_arp = map_pitch(
      SCALE4,
      parse_melody(
        // Measure 1
        [0, N4],
        [1, N4],
        [2, N4],
        [3, N4],
        // Measure 2
        [4, N4D],
        [REST, N8],
        [5, N4D],
        [REST, N8]
      )
    );
    */

    /*scale_arp.loop = true;
    scale_arp.loopStart = "0:0";
    scale_arp.loopEnd = "2:0";*/

    /*
    const cycle_length = N1;
    const cycle_a = map_pitch(
      SCALE5,
      parse_cycle(cycle_length, [0, REST, 1, 2, REST, 4])
    );

    const cycle_b = map_pitch(
      SCALE5,
      parse_cycle(cycle_length, [
        [0, 3],
        [5, REST],
        [0, 4, 2, 4],
      ])
    );

    const sine_part = new MusicLoop(new Rational(34, 1), pedal);
    const square_part = new Melody(
      new Rest(new Rational(2, 1)),
      new MusicLoop(new Rational(22, 1), scale_arp)
    );
    const poly_part = new Harmony(
      new Melody(
        new Rest(new Rational(8, 1)),
        new MusicLoop(new Rational(12, 1), cycle_a),
        new Rest(new Rational(4, 1)),
        new MusicLoop(new Rational(4, 1), cycle_a)
      ),
      new Melody(
        new Rest(new Rational(8, 1)),
        new MusicLoop(new Rational(8, 1), cycle_b),
        new Rest(new Rational(4, 1)),
        new MusicLoop(new Rational(4, 1), cycle_b),
        new Rest(new Rational(4, 1)),
        new MusicLoop(new Rational(4, 1), cycle_b)
      )
    );
    const score_a = new Score(
      ["sine", sine_part],
      ["square", square_part],
      ["poly", poly_part]
    );

    // Three scales initially the same, but with different lengths
    const phase_a = map_pitch(
      SCALE3,
      parse_cycle(new Rational(6, 8), [0, 1, 2, 3, 2, 1])
    );
    const phase_b = map_pitch(
      SCALE3,
      parse_cycle(new Rational(1, 1), [0, 1, 2, 3, 4, 3, 2, 1])
    );
    const phase_c = map_pitch(
      SCALE3,
      parse_cycle(new Rational(10, 8), [0, 1, 2, 3, 4, 5, 4, 3, 2, 1])
    );

    const phase_part = new MusicLoop(
      new Rational(30, 1),
      new Harmony(phase_a, phase_b, phase_c)
    );

    const score_b = new Score(["poly", phase_part]);

    this.scores = {
      score_a: compile_score(this.tone, this.synths, score_a),
      score_b: compile_score(this.tone, this.synths, score_b),
    };
    */

    /*
    patterns.pedal = pedal;
    patterns.scale_arp = scale_arp;
    patterns.cycle_a = cycle_a;
    patterns.cycle_b = cycle_b;
    patterns.phase_a = phase_a;
    patterns.phase_b = phase_b;
    patterns.phase_c = phase_c;
    */
  }

  stop_the_music() {
    const transport = this.tone.getTransport();
    transport.cancel();
  }

  play_score(score_id) {
    const score = this.scores[score_id];
    if (score === undefined) {
      throw new Error(`can't play unregistered score ${score_id}`);
    }

    this.stop_the_music();

    const schedule = schedule_clips(Rational.ZERO, score);
    console.log(schedule);
    for (const [clip, start_time, end_time] of schedule) {
      clip.material.start(start_time).stop(end_time);
    }

    const transport = this.tone.getTransport();
    transport.position = 0;
    transport.start("+0.1", "0:0");
  }

  melody_a() {
    this.stop_the_music();

    /*
    const { pedal, scale_arp, cycle_a, cycle_b } = this.patterns;

    pedal.start("0:0").stop("34:0");
    scale_arp.start("2:0").stop("24:0");
    cycle_a.start("8:0").stop("20:0").start("24:0").stop("28:0");
    cycle_b
      .start("8:0")
      .stop("16:0")
      .start("20:0")
      .stop("24:0")
      .start("28:0")
      .stop("32:0");
      */
    const clips = schedule_clips(Rational.ZERO, this.scores.score_a);
    console.log(clips);

    const transport = this.tone.getTransport();
    transport.position = 0;
    transport.start("+0.1", "0:0");
  }

  melody_b() {
    this.stop_the_music();

    schedule_clips(Rational.ZERO, this.scores.score_b);

    /*
    const { phase_a, phase_b, phase_c } = this.patterns;

    // The sequences are 6, 8, 10 quarter notes
    // lcm(6, 8, 10) = lcm(2*3, 2^3, 2*5) = 2^3*3*5 = 120 quarter notes
    // 120 quarter notes = 30 measures
    phase_a.start("0:0").stop("30:0");
    phase_b.start("0:0").stop("30:0");
    phase_c.start("0:0").stop("30:0");
    */

    const transport = this.tone.getTransport();
    transport.position = 0;
    transport.start("+0.1", "0:0");
  }
}
