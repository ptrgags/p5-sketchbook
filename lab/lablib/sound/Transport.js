import { Rational } from "../Rational.js";
import { to_tone_time } from "../tone_helpers/measure_notation.js";
import { SoundSystem } from "./SoundSystem.js";

export class Transport {
  /**
   * Constructor
   * @param {SoundSystem} sound The sound system for getting the transport
   */
  constructor(sound) {
    this.sound = sound;

    this.is_playing = false;
  }

  /**
   * Get the current transport time as a float, as this is helpful for
   * animation.
   * @return {number} The current transport time in measures as a float
   */
  get current_time() {
    const transport = this.sound.tone.getTransport();
    const [measures, beats, sixteenths] = transport.position
      .toString()
      .split(":");

    return (
      parseFloat(measures) + parseFloat(beats) / 4 + parseFloat(sixteenths) / 16
    );
  }

  /**
   * Set the timeline to loop from the beginning until the specified time.
   * (usually the end of the background music score)
   * @param {Rational} duration Duration of the loop
   */
  set_loop(duration) {
    const transport = this.sound.tone.getTransport();
    transport.setLoopPoints(0, to_tone_time(duration));
    transport.loop = true;
  }

  /**
   * Play the timeline from the beginning
   */
  play() {
    const transport = this.sound.tone.getTransport();
    transport.position = 0;
    transport.start("+0.1", "0.0");
    this.is_playing = true;
  }
}
