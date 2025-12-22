import { SoundSystem } from "./SoundSystem.js";

export class Transport {
  /**
   * Constructor
   * @param {SoundSystem} sound The sound system for getting the transport
   */
  constructor(sound) {
    this.sound = sound;
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
}
