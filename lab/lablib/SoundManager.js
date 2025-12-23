import { Tween } from "../../sketchlib/Tween.js";
import { ParamCurve } from "./animation/ParamCurve.js";
import { Score } from "./music/Score.js";
import { to_events } from "./music/Timeline.js";
import { Rational } from "./Rational.js";
import { compile_score } from "./tone_helpers/compile_music.js";
import { to_tone_time } from "./tone_helpers/measure_notation.js";
import { schedule_clips } from "./tone_helpers/schedule_music.js";

/**
 * @typedef {{[id: string]: Score}} ScoreDeclarations
 *
 * @typedef {{
 *  bpm?: number,
 *  scores?: ScoreDeclarations,
 *  sfx?: ScoreDeclarations,
 * }} SoundManifest
 */

const DEFAULT_BPM = 128;

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
    this.transport_playing = false;

    // these may be stored a different way
    this.synths = {};
    this.patterns = {};

    this.current_score = undefined;
    this.scores = {};
    this.score_note_events = {};
    /**
     * Compiled tweens stored by (score_id, param_id)
     * @private
     * @type {{[score_id: string]: {[param_id: string]: Tween<number>[]}}}
     */
    this.score_tweens = {};
    this.sfx = {};

    /**
     * Event target for listening to events
     * @readonly
     * @type {EventTarget}
     */
    this.events = new EventTarget();
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
    transport.bpm.value = this.manifest.bpm ?? DEFAULT_BPM;

    this.audio_ready = true;
  }

  process_manifest() {
    const scores = this.manifest.scores ?? {};
    for (const [score_id, score] of Object.entries(scores)) {
      this.register_score(score_id, score);
    }

    const sfx = this.manifest.sfx ?? {};
    for (const [sfx_id, score] of Object.entries(sfx)) {
      this.register_sfx(sfx_id, score);
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

    const bell = new this.tone.FMSynth({
      envelope: {
        attack: 0,
        decay: 2.0,
        sustain: 0.0,
        release: 2.0,
      },
    }).toDestination();
    bell.volume.value = -3;

    const tick = new this.tone.FMSynth({
      modulationIndex: 25,
      // C:M ratio
      harmonicity: 2,
      oscillator: {
        type: "sine",
      },
      modulation: {
        type: "sine",
      },
      modulationEnvelope: {
        attack: 0,
        sustain: 1,
        decay: 0,
        release: 0,
      },
      envelope: {
        attack: 0,
        decay: 0.05,
        sustain: 0.0,
        release: 0.05,
      },
    }).toDestination();
    tick.volume.value = -2;

    this.synths.sine = sine;
    this.synths.square = square;
    this.synths.poly = poly;
    this.synths.supersaw = supersaw;
    this.synths.bell = bell;
    this.synths.tick = tick;
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

    // TODO: this should become part of converting score to note on/off events
    const score_events = [];
    for (const [i, [part_id, music]] of score.parts.entries()) {
      score_events.push({
        instrument_index: i,
        instrument_id: part_id,
        events: to_events(Rational.ZERO, music),
      });
    }
    this.score_note_events[score_id] = score_events;
  }

  /**
   * Register a sound effect. These are short scores that can be triggered
   * immediately
   * @param {string} sfx_id The ID of the sfx
   * @param {Score<number>} score Score expressed in MIDI note numbers
   */
  register_sfx(sfx_id, score) {
    const compiled = compile_score(this.tone, this.synths, score);
    this.sfx[sfx_id] = compiled;
  }

  stop_the_music() {
    const transport = this.tone.getTransport();
    transport.cancel();
  }

  /**
   * Stop the music and play a score.
   * @param {string} score_id ID of a score registered when initializing the sound system.
   */
  play_score(score_id) {
    const score = this.scores[score_id];
    if (score === undefined) {
      throw new Error(`can't play unregistered score ${score_id}`);
    }

    // Clear the timeline so we can continue
    this.stop_the_music();

    const transport = this.tone.getTransport();
    const draw = this.tone.getDraw();

    const schedule = schedule_clips(Rational.ZERO, score);
    for (const [clip, start_time, end_time] of schedule) {
      clip.material.start(start_time).stop(end_time);
    }

    // Schedule note on/off events for animations
    const note_events = this.score_note_events[score_id];
    for (const part of note_events) {
      const { instrument_index, instrument_id, events } = part;
      for (const [note, start_time, end_time] of events) {
        const detail = {
          instrument_index,
          instrument_id,
          note,
          start_time,
          end_time,
        };

        transport.schedule((time) => {
          draw.schedule(() => {
            const note_on = new CustomEvent("note-on", { detail });
            this.events.dispatchEvent(note_on);
          }, time);
        }, to_tone_time(start_time));
        transport.schedule((time) => {
          draw.schedule(() => {
            const note_off = new CustomEvent("note-off", { detail });
            this.events.dispatchEvent(note_off);
          }, time);
        }, to_tone_time(end_time));
      }
    }

    transport.position = 0;
    transport.start("+0.1", "0:0");
    this.current_score = score_id;
    this.transport_playing = true;
  }

  play_sfx(sfx_id) {
    const sfx_score = this.sfx[sfx_id];
    if (sfx_score === undefined) {
      throw new Error(`can't play unregistered SFX ${sfx_id}`);
    }

    const schedule = schedule_clips(Rational.ZERO, sfx_score);
    const A_LITTLE_BIT = 0; //0.05;
    const now = this.tone.now() + A_LITTLE_BIT;
    for (const [clip, start_time, end_time] of schedule) {
      const start = this.tone.Time(start_time).toSeconds();
      const end = this.tone.Time(end_time).toSeconds();
      try {
        clip.material.start(now + start).stop(now + end);
      } catch (e) {
        console.error("scheduling error", e);
      }
    }

    if (!this.transport_playing) {
      const transport = this.tone.getTransport();
      transport.start(this.tone.now());
      this.transport_playing = true;
    }
  }
}
