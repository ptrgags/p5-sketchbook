import {
  DrawbarOrgan,
  Drawbars,
} from "../sketchlib/instruments/DrawbarOrgan.js";
import { AbsTimelineOps } from "../sketchlib/music/AbsTimelineOps.js";
import { N16 } from "../sketchlib/music/durations.js";
import { Note, Rest } from "../sketchlib/music/Music.js";
import { PatternGrid } from "../sketchlib/music/PatternGrid.js";
import {
  A4,
  B4,
  C4,
  C5,
  D4,
  D5,
  E4,
  E5,
  F4,
  F5,
  G4,
  REST,
} from "../sketchlib/music/pitches.js";
import { RelTimelineOps } from "../sketchlib/music/RelTimelineOps.js";
import { TimeInterval } from "../sketchlib/music/Timeline.js";
import { Velocity } from "../sketchlib/music/Velocity.js";
import { range } from "../sketchlib/range.js";
import { to_tone_pitch } from "../sketchlib/tone_helpers/to_tone_pitch.js";
import { to_tone_time } from "../sketchlib/tone_helpers/to_tone_time.js";
import { zip } from "../sketchlib/zip.js";

const DEFAULT_PITCHES = [
  C4,
  E4,
  G4,
  C5,
  D4,
  F4,
  A4,
  D5,
  E4,
  G4,
  B4,
  E5,
  F4,
  A4,
  C5,
  F5,
];
const DEFAULT_VELOCITIES = [
  Velocity.P,
  Velocity.P,
  Velocity.P,
  Velocity.P,
  Velocity.MP,
  Velocity.MP,
  Velocity.MP,
  Velocity.MP,
  Velocity.F,
  Velocity.F,
  Velocity.F,
  Velocity.F,
  Velocity.FF,
  Velocity.FF,
  Velocity.FF,
  Velocity.FF,
];
const DEFAULT_NOTES = zip(DEFAULT_PITCHES, DEFAULT_VELOCITIES).map(
  ([pitch, velocity]) => new Note(pitch, velocity),
);

export class PatternLooper {
  /**
   * Constructor
   * @param {import('tone')} tone
   */
  constructor(tone) {
    this.tone = tone;
    this.init_requested = false;

    // resources allocated in init()
    this.instrument = undefined;
    this.part = undefined;
  }

  async init() {
    if (this.init_requested) {
      return;
    }
    this.init_requested = true;

    await this.tone.start();

    const transport = this.tone.getTransport();
    transport.bpm.value = 128;
    transport.loopStart = "0:0";
    transport.loopEnd = "1:0";
    transport.start();

    this.init_instruments();
  }

  init_instruments() {
    this.instrument = new DrawbarOrgan(new Drawbars("00 8765 432"));
    this.instrument.init_mono(this.tone);
    this.instrument.volume = -9;
  }

  /**
   *
   * @param {import("../sketchlib/music/Timeline.js").Timeline<Note<number>>} timeline
   */
  set_pattern(timeline) {
    const transport = this.tone.getTransport();

    this.instrument.silence();

    if (this.part) {
      this.part.dispose();
      this.part = undefined;
    }

    const abs_timeline = AbsTimelineOps.from_relative(timeline);
    /**
     * @type {[string, [string, string, number]][]}
     */
    const intervals = [...AbsTimelineOps.iter_intervals(abs_timeline)].map(
      (x) => {
        return [
          to_tone_time(x.start_time),
          [
            to_tone_pitch(x.value.pitch),
            to_tone_time(x.duration),
            x.value.velocity / 127,
          ],
        ];
      },
    );

    this.part = new this.tone.Part((time, value) => {
      const [pitch, duration, velocity] = value;
      this.instrument.play_note(pitch, duration, time, velocity);
    }, intervals);

    this.part.loopStart = "0:0";
    this.part.loopEnd = "1:0";
    this.part.loop = true;

    this.part.start();
  }

  /**
   *
   * @param {boolean} is_paused
   */
  toggle_paused(is_paused) {
    const transport = this.tone.getTransport();
    if (is_paused) {
      transport.pause();
    } else {
      transport.start();
    }
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
}
