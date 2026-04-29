import { Rational } from "../Rational.js";
import { to_tone_time } from "./to_tone_time.js";

/**
 * Wrapper around Tone.Transport that works with my custom
 * music classes that use Rational time values.
 *
 * This manages tempo and playback, but not event scheduling!
 */
export class Transport {
  /**
   *
   * @param {import("tone")} tone Tonejs library
   */
  constructor(tone) {
    this.transport = tone.getTransport();
  }

  /**
   * Set a new tempo
   * @param {number} bpm Beats per minute
   */
  set_tempo(bpm) {
    this.transport.bpm.value = bpm;
  }

  /**
   * Get the current transport time in measures as a float, as this is helpful for
   * animation.
   * @return {number} The current transport time in measures as a float
   */
  get time() {
    const [measures, beats, sixteenths] = this.transport.position
      .toString()
      .split(":");

    return (
      parseFloat(measures) + parseFloat(beats) / 4 + parseFloat(sixteenths) / 16
    );
  }

  /**
   * Turn off looping on the timeline.
   */
  no_loop() {
    this.transport.loop = false;
  }

  /**
   * Set the loop points on the transport
   * @param {Rational} start_time Rational measures from the start of the score where the loop starts
   * @param {Rational} duration How long the loop should be.
   */
  set_loop(start_time, duration) {
    this.transport.loopStart = to_tone_time(start_time);
    this.transport.loopEnd = to_tone_time(start_time.add(duration));
    this.transport.loop = true;
  }

  /**
   * Jump to a specific time on the timeline
   * @param {Rational} time Time to jump to in measures from the start
   */
  jump_to(time) {
    this.transport.position = to_tone_time(time);
  }

  /**
   * Start playing at the beginning of the timeline
   */
  start() {
    this.transport.start("+0.1", "0:0");
  }

  /**
   * Stop the transport playback (without unscheduling events)
   */
  stop() {
    this.transport.stop();
  }
}
