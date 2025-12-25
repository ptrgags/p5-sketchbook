import { Tween } from "../../sketchlib/Tween.js";
import { ADSR } from "./instruments/ADSR.js";
import { BasicSynth } from "./instruments/BasicSynth.js";
import { FMSynth } from "./instruments/FMSynth.js";
import { WaveStack } from "./instruments/Wavestack.js";
import { ParamCurve } from "./music/ParamCurve.js";
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
    const sine = new BasicSynth("sine");
    sine.init_mono(this.tone);
    sine.volume = -6;

    const square = new BasicSynth("square");
    square.init_mono(this.tone);
    square.volume = -24;

    const poly = new BasicSynth("triangle");
    poly.init_poly(this.tone);
    poly.volume = -18;

    const supersaw = new WaveStack("sawtooth", 3, 20);
    supersaw.init_poly(this.tone);
    supersaw.volume = -18;

    const bell = new FMSynth(3, 12, ADSR.pluck(2.0));
    bell.init_mono(this.tone);
    bell.volume = -3;

    const tick = new FMSynth(2, 25, ADSR.pluck(0.05));
    tick.init_mono(this.tone);
    tick.volume = -2;

    this.synths.sine = sine.synth;
    this.synths.square = square.synth;
    this.synths.poly = poly.synth;
    this.synths.supersaw = supersaw.synth;
    this.synths.bell = bell.synth;
    this.synths.tick = tick.synth;
  }

  /**
   * Get the current transport time as a float, as this is helpful for
   * animation.
   * @return {number} The current transport time in measures as a float
   */
  get transport_time() {
    const transport = this.tone.getTransport();
    const [measures, beats, sixteenths] = transport.position
      .toString()
      .split(":");

    return (
      parseFloat(measures) + parseFloat(beats) / 4 + parseFloat(sixteenths) / 16
    );
  }

  /**
   * Get the current value of a parameter from the currently playing score
   * @param {string} param_id The ID of the parameter in the score
   * @returns {number | undefined} The current value of the parameter, or undefined if no value is set
   */
  get_param(param_id) {
    const tween_list = this.score_tweens[this?.current_score]?.[param_id];
    if (tween_list === undefined || tween_list.length === 0) {
      return undefined;
    }

    const time = this.transport_time;

    // Find the last tween that's before or during the current time.
    let tween = tween_list[0];
    for (const candidate of tween_list) {
      if (candidate.start_time > time) {
        break;
      }

      tween = candidate;
    }

    // Get the current value. This uses the fact that the tween holds its
    // value constant if you use an out of range time
    return tween.get_value(time);
  }

  /**
   * Convert a timeline of ParamCurve to an array of Tween, assuming a start time of 0
   * @param {import("./music/Timeline.js").Timeline<ParamCurve>} timeline the timeline to convert
   * @return {Tween[]} The corresponding tweens,
   */
  compile_tweens(timeline) {
    const events = to_events(Rational.ZERO, timeline);
    return events.map(([curve, start_time]) => {
      return Tween.scalar(
        curve.start_value,
        curve.end_value,
        start_time.real,
        curve.duration.real
      );
    });
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

    const score_events = [];
    for (const [i, [part_id, music]] of score.parts.entries()) {
      score_events.push({
        instrument_index: i,
        instrument_id: part_id,
        events: to_events(Rational.ZERO, music),
      });
    }
    this.score_note_events[score_id] = score_events;

    if (score.params) {
      /**
       * @type {{[param_id: string]: Tween<number>[]}}
       */
      const score_params = {};
      for (const [param_id, timeline] of score.params) {
        score_params[param_id] = this.compile_tweens(timeline);
      }
      this.score_tweens[score_id] = score_params;
    }
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

  /**
   * Prototype of animations based on note events.
   * @template T
   * @param {[T, Rational, Rational][]} events
   * @param {function(T): void} on_start function to call at the start of a note.
   * @param {function(T): void} on_end function to call at the end of each note.
   */
  schedule_cues(events, on_start, on_end) {
    const transport = this.tone.getTransport();
    const tone_draw = this.tone.getDraw();
    for (const [data, start_time, end_time] of events) {
      transport.schedule((time) => {
        tone_draw.schedule(() => on_start(data), time);
      }, to_tone_time(start_time));
      transport.schedule((time) => {
        tone_draw.schedule(() => on_end(data), time);
      }, to_tone_time(end_time));
    }
  }
}
