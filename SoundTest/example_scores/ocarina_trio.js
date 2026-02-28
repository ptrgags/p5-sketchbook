import { N16, N8 } from "../../sketchlib/music/durations.js";
import { P8 } from "../../sketchlib/music/intervals.js";
import { map_pitch, Melody, Rest } from "../../sketchlib/music/Music.js";
import { MusicPatterns } from "../../sketchlib/music/MusicPatterns.js";
import { C4 } from "../../sketchlib/music/pitches.js";
import { Rhythm } from "../../sketchlib/music/Rhythm.js";
import { MIXOLYDIAN_MODE } from "../../sketchlib/music/scales.js";
import { Part, Score } from "../../sketchlib/music/Score.js";
import { Rational } from "../../sketchlib/Rational.js";

const C4_MIXOLYDIAN = MIXOLYDIAN_MODE.to_scale(C4);

// Transcribed from a song I made in Renoise
// Intro ===================================================================

const INTRO1 = MusicPatterns.scale_melody(
  new Rhythm("xxx-x-xx|x-x-x-x-|xxx-x-xx|x-x-x-x-", N8),
  C4_MIXOLYDIAN,
  [
    // measure 0
    0, 1, 2, 4, 0, 1,
    // measure 1
    -1, 3, 1, 3,
    // measure 2
    5, 4, 3, 0, 1, 3,
    // measure 3
    4, 2, 0, 4,
  ],
);
const INTRO2 = MusicPatterns.scale_melody(
  new Rhythm("x-----x-|xxx---x-|xxxxxxx-|x---xxx-", N8),
  C4_MIXOLYDIAN,
  [
    // 0
    0, 2,
    // 1
    1, 0, -1, 2,
    // 2
    0, 1, 3, 4, 5, 4, 2,
    // 3
    0, 2, 1, 0,
  ],
);

// Section A ====================================================

const PATTERN_A1 = MusicPatterns.scale_melody(
  new Rhythm("x--xx--x|x--xx-x-|x--xx-x-|x--xx-x-", N8),
  C4_MIXOLYDIAN,
  [
    // 0
    0, 1, 2, 1,
    // 1
    -1, 0, 1, -1,
    // 2
    3, 2, 3, -1,
    // 3
    0, 1, 2, 0,
  ],
);

const PATTERN_A2 = MusicPatterns.scale_melody(
  new Rhythm(
    "x-.xx-.xx---x---|x-.xx-.xx---x---|x---x---x-.xx-.x|x---x---x---x---",
    N16,
  ),
  C4_MIXOLYDIAN,
  [
    // 0
    0, 1, 2, 3, 4, 3,
    // 1
    1, 0, -1, 0, 1, 3,
    // 2
    2, 0, -2, -1, 0, 1,
    // 3
    2, 4, 2, 0,
  ],
);

const PATTERN_A3 = MusicPatterns.scale_melody(
  new Rhythm(
    "x---..x-----x---|x--.x-x-----x---|x---x---x---x---|x---..x-----x---",
    N16,
  ),
  C4_MIXOLYDIAN,
  [
    // 0
    4, 2, 4,
    // 1
    3, 3, 2, -1,
    // 2
    3, 2, 3, 0,
    // 3
    2, 0, 2,
  ],
);

const PATTERN_A4 = MusicPatterns.scale_melody(
  new Rhythm(
    "xxxxx-------x-x-|x-------x---x---|xxxxx-------x---|x-------........",
    N16,
  ),
  C4_MIXOLYDIAN,
  [
    // 0
    0, 1, 2, 3, 4, 2, 0,
    // 1
    1, 1, 3,
    // 2
    2, 1, 0, -1, -2, 1,
    // 3,
    0,
  ],
);

const BASS = new Melody(
  INTRO1,
  INTRO2,
  PATTERN_A1,
  PATTERN_A2,
  PATTERN_A3,
  PATTERN_A4,
);
const TENOR = new Melody(
  new Rest(new Rational(4)),
  map_pitch((p) => p + P8, BASS),
);
const SOPRANO = new Melody(
  new Rest(new Rational(8)),
  map_pitch((p) => p + 2 * P8, BASS),
);

export const SCORE_OCARINA_TRIO = new Score(
  new Part("soprano", SOPRANO, {
    instrument_id: "channel0",
    midi_instrument: 80 - 1, // ocarina
    midi_channel: 0,
  }),
  new Part("tenor", TENOR, {
    instrument_id: "channel1",
    midi_instrument: 80 - 1, // ocarina
    midi_channel: 1,
  }),
  new Part("bass", BASS, {
    instrument_id: "channel2",
    midi_instrument: 80 - 1, // ocarina
    midi_channel: 2,
  }),
);
