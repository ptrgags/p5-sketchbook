import { Instrument, Polyphony } from "../instruments/Instrument.js";
import { Note } from "../music/Music.js";
import { PatternGrid } from "../music/PatternGrid.js";
import { Riff } from "../music/Riff.js";
import { PatternClip } from "./PatternClip.js";
import { RiffClip } from "./RiffClip.js";

export class BackgroundMusic {
  /**
   * Constructor
   * @param {import("tone")} tone
   */
  constructor(tone) {
    this.tone = tone;
    this.transport = tone.getTransport();
    this.destination = tone.getDestination();

    /**
     * @type {Instrument[]}
     */
    this.active_instruments = [];
    /**
     * @type {import("tone").ToneEvent[]}
     */
    this.active_events = [];
  }

  reset() {
    // Unschedule all active events
    for (const event of this.active_events) {
      event.cancel();
    }

    // stop all instruments from playing in case there are notes still playing
    for (const instrument of this.active_instruments) {
      instrument.release_all();
      instrument.destroy();
    }
  }

  /**
   * Schedule a pattern for a monophonic instrument
   * @param {PatternGrid<Note<number>>} pattern
   * @param {Instrument} instrument The instrument that will play the pattern
   */
  schedule_pattern(pattern, instrument) {
    this.reset();

    instrument.init(this.tone, Polyphony.MONOPHONIC, this.destination);
    const clip = new PatternClip(pattern);
    const event = clip.to_tone_event(this.tone, instrument);
    event.start();

    this.active_instruments.push(instrument);
    this.active_events.push(event);
  }

  /**
   * Schedule a riff for a monophonic instrument
   * @param {Riff<Note<Number>>} riff The riff to play
   * @param {Instrument} instrument
   */
  schedule_riff(riff, instrument) {
    this.reset();

    instrument.init(this.tone, Polyphony.MONOPHONIC, this.destination);
    const clip = new RiffClip(riff);
    const event = clip.to_tone_event(this.tone, instrument);
    event.start();

    this.active_instruments.push(instrument);
    this.active_events.push(event);
  }
}
