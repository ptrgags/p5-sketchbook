import { ADSR } from "./instruments/ADSR.js";
import { BasicSynth } from "./instruments/BasicSynth.js";
import { FMSynth } from "./instruments/FMSynth.js";
import { WaveStack } from "./instruments/Wavestack.js";
import { Note } from "./music/Music.js";
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

/**
 * @typedef {{
 * instrument_id: string,
 * events: [Note<number>, Rational, Rational][]
 * }} CompiledPart
 *
 * @typedef {{[score_id: string]: CompiledPart[]}} CompiledScore
 *
 * @typedef {{
 *  instrument_id: string,
 *  note: Note<number>,
 *  start_time: Rational,
 *  end_time: Rational
 * }} NoteEventDetail
 */

/**
 * Class to manage playing sounds through Tone.js
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
    this.transport_playing = false;

    // these may be stored a different way
    this.synths = {};
    this.patterns = {};

    this.current_score = undefined;
    this.scores = {};
    /**
     * @type {CompiledScore}
     */
    this.score_note_events = {};
    this.sfx = {};
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
   * Compile and save a score
   * @param {string} score_id The score ID to use. This must be the same as
   * the ID used for play_score() later.
   * @param {Score<number>} score Score expressed in MIDI note numbers
   */
  register_score(score_id, score) {
    const compiled = compile_score(this.tone, this.synths, score);
    this.scores[score_id] = compiled;

    const score_events = [];
    for (const part of score.parts) {
      score_events.push({
        instrument_id: part.instrument_id,
        events: to_events(Rational.ZERO, part.music),
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

    const schedule = schedule_clips(Rational.ZERO, score);
    for (const [clip, start_time, end_time] of schedule) {
      clip.material.start(start_time).stop(end_time);
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
