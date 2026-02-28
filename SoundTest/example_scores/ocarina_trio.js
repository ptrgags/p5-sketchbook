import { N8 } from "../../sketchlib/music/durations.js";
import { Melody } from "../../sketchlib/music/Music.js";
import { MusicPatterns } from "../../sketchlib/music/MusicPatterns.js";
import { C4 } from "../../sketchlib/music/pitches.js";
import { Rhythm } from "../../sketchlib/music/Rhythm.js";
import { MIXOLYDIAN_MODE } from "../../sketchlib/music/scales.js";
import { Part, Score } from "../../sketchlib/music/Score.js";

const C4_MIXOLYDIAN = MIXOLYDIAN_MODE.to_scale(C4);

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

const BASS = new Melody(INTRO1);

export const SCORE_OCARINA_TRIO = new Score(
  new Part("bass", BASS, {
    instrument_id: "channel0",
    midi_instrument: 80 - 1, // ocarina
    midi_channel: 0,
  }),
);
