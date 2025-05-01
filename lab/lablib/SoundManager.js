import { N2, N4, N8 } from "./music/durations.js";
import { MidiPitch } from "./music/pitch_conversions.js";
import { B, C, C3, E, F, G, GS, REST } from "./music/pitches.js";
import { Melody, Note } from "./music/Score.js";
import { Rational } from "./Rational.js";
import { compile_part } from "./tone_helpers/compile_music.js";

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

    this.init_patterns();

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

    this.synths.sine = sine;
    this.synths.square = square;
    this.synths.poly = poly;
  }

  init_patterns() {
    const patterns = this.patterns;

    const pedal_score = Melody.from_tuples([C3, N4], [REST, N4]);
    const pedal = compile_part(this.tone, this.synths.sine, pedal_score);
    pedal.loop = true;
    pedal.loopStart = "0:0";
    pedal.loopEnd = "0:2";

    // Not sure what you call this but it sounds kinda neat
    const NOTES = ["C", "E", "F", "G", "G#", "B"];
    // Notes at different octaves
    const NOTES3 = NOTES.map((x) => `${x}3`);
    const NOTES4 = NOTES.map((x) => `${x}4`);
    const NOTES5 = NOTES.map((x) => `${x}5`);

    const SCALE = [C, E, F, G, GS, B];
    const N4D = new Rational(3, 8);

    const arp_score = Melody.from_tuples(
      // score in scale degrees
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
    ).map_pitch((scale_degree) => {
      // Convert to MIDI notes starting at C4
      const pitch_class = SCALE[scale_degree];
      return MidiPitch.from_pitch_octave(pitch_class, 4);
    });
    const scale_arp = compile_part(this.tone, this.synths.square, arp_score);
    scale_arp.loop = true;
    scale_arp.loopStart = "0:0";
    scale_arp.loopEnd = "2:0";

    const cycle_a = new this.tone.Sequence(
      (time, note) => {
        this.synths.poly.triggerAttackRelease(NOTES5[note], "8n", time);
      },
      [0, undefined, 1, 2, undefined, 4],
      "8n"
    );

    const cycle_b = new this.tone.Sequence(
      (time, note) => {
        this.synths.poly.triggerAttackRelease(NOTES5[note], "8n", time);
      },
      [0, 4, [1, 2], 3, [0, undefined, 3]],
      "8n"
    );

    // Three scales initially the same, but with different lengths
    const phase_a = new this.tone.Sequence(
      (time, note) => {
        this.synths.poly.triggerAttackRelease(NOTES3[note], "8n", time);
      },
      [0, 1, 2, 3, 2, 1],
      "8n"
    );
    const phase_b = new this.tone.Sequence(
      (time, note) => {
        this.synths.poly.triggerAttackRelease(NOTES4[note], "8n", time);
      },
      [0, 1, 2, 3, 4, 3, 2, 1],
      "8n"
    );
    const phase_c = new this.tone.Sequence(
      (time, note) => {
        this.synths.poly.triggerAttackRelease(NOTES5[note], "8n", time);
      },
      [0, 1, 2, 3, 4, 5, 4, 3, 2, 1],
      "8n"
    );

    patterns.pedal = pedal;
    patterns.scale_arp = scale_arp;
    patterns.cycle_a = cycle_a;
    patterns.cycle_b = cycle_b;
    patterns.phase_a = phase_a;
    patterns.phase_b = phase_b;
    patterns.phase_c = phase_c;
  }

  stop_the_music() {
    const transport = this.tone.getTransport();
    transport.cancel();
  }

  melody_a() {
    this.stop_the_music();

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

    const transport = this.tone.getTransport();
    transport.position = 0;
    transport.start("+0.1", "0:0");
  }

  melody_b() {
    this.stop_the_music();

    const { phase_a, phase_b, phase_c } = this.patterns;

    // The sequences are 6, 8, 10 quarter notes
    // lcm(6, 8, 10) = lcm(2*3, 2^3, 2*5) = 2^3*3*5 = 120 quarter notes
    // 120 quarter notes = 30 measures
    phase_a.start("0:0").stop("30:0");
    phase_b.start("0:0").stop("30:0");
    phase_c.start("0:0").stop("30:0");

    const transport = this.tone.getTransport();
    transport.position = 0;
    transport.start("+0.1", "0:0");
  }
}
