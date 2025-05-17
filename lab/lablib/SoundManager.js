import { Score } from "./music/Score.js";
import { Rational } from "./Rational.js";
import { compile_score } from "./tone_helpers/compile_music.js";
import { schedule_clips } from "./tone_helpers/schedule_music.js";

/**
 * @typedef {{[id: string]: Score}} ScoreDeclarations
 *
 * @typedef {{scores: ScoreDeclarations}} SoundManifest
 */

export class SoundManager {
  /**
   * Constructor
   * @param {import('tone')} tone_module The Tone.js module
   * @param {SoundManifest} manifest The manifest of sounds and scores to declare once initialized
   */
  constructor(tone_module, manifest) {
    this.tone = tone_module;

    this.manifest = manifest;

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
    this.process_manifest();

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

  process_manifest() {
    for (const [score_id, score] of Object.entries(this.manifest.scores)) {
      this.register_score(score_id, score);
    }
  }

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
    }).toDestination();
    supersaw.volume.value = -9;

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
    for (const [clip, start_time, end_time] of schedule) {
      clip.material.start(start_time).stop(end_time);
    }

    const transport = this.tone.getTransport();
    transport.position = 0;
    transport.start("+0.1", "0:0");
  }
}
