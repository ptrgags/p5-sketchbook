export class SoundManager {
  /**
   * Constructor
   * @param {import('tone')} tone_module The Tone.js module
   */
  constructor(tone_module) {
    this.tone = tone_module;

    this.init_requested = false;
    this.audio_ready = false;

    this.synths = {};
  }

  async init() {
    if (this.init_requested) {
      return;
    }

    this.init_requested = true;

    await this.tone.start();

    this.synth = new this.tone.Synth({
      oscillator: {
        type: "sine",
      },
    }).toDestination();
    this.pedal = new this.tone.Loop((time) => {
      this.synth.triggerAttackRelease("C3", "4n", time);
    }, "2n")
      .start("0:0")
      .stop("8:0");

    this.square = new this.tone.Synth({
      oscillator: { type: "triangle" },
    }).toDestination();
    this.square.volume.value = -3;
    this.arp = new this.tone.Pattern(
      (time, note) => {
        this.square.triggerAttackRelease(note, "16n", time);
      },
      ["C4", "E4", "F4", "G4", "G#4"],
      "upDown"
    )
      .start("1:0")
      .stop("12:0")
      .start("16:0")
      .stop("22:0");
    this.arp.interval = "16n";

    this.poly = new this.tone.PolySynth(this.tone.Synth, {
      oscillator: { type: "fmsine4" },
    }).toDestination();
    this.poly.volume.value = -6;
    this.cycle = new this.tone.Sequence(
      (time, note) => {
        this.poly.triggerAttackRelease(note, "8n", time);
      },
      ["C5", "C5", ["B4", "Eb5"], ["B4", "C#5", undefined]],
      "4n"
    )
      .start("2:0")
      .stop("16:0");
    this.counter_cycle = new this.tone.Sequence(
      (time, note) => {
        this.poly.triggerAttackRelease(note, "8n", time);
      },
      ["C6", "A5", ["F5", undefined, "G5"]],
      "8n"
    )
      .start("4:0")
      .stop("20:0");

    const transport = this.tone.getTransport();
    transport.bpm.value = 128;
    transport.start();

    this.audio_ready = true;
  }

  /**
   * Toggle the sound on/off.
   * @param {boolean} sound_on true if the sound should turn on
   */
  toggle_sound(sound_on) {
    const FADE_SEC = 1.0;
    const next_volume_db = sound_on ? 0 : -Infinity;
    // While you could set the destination's mute property, that abrupt change
    // can sound like crackling audio, so fade the volume quickly instead.
    this.tone.getDestination().volume.rampTo(next_volume_db, FADE_SEC);
  }

  // Temporary methods (prototyping only)
}
