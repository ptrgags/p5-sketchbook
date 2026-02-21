import { N4, N8, N1 } from "../../sketchlib/music/durations.js";
import {
  parse_melody,
  map_pitch,
  parse_cycle,
  Melody,
  Rest,
  Harmony,
} from "../../sketchlib/music/Music.js";
import { MusicPatterns } from "../../sketchlib/music/MusicPatterns.js";
import {
  B,
  C,
  C3,
  C4,
  C5,
  E,
  F,
  G,
  GS,
  REST,
} from "../../sketchlib/music/pitches.js";
import { Rhythm } from "../../sketchlib/music/Rhythm.js";
import { ScaleQuality } from "../../sketchlib/music/Scale.js";
import { Part, Score } from "../../sketchlib/music/Score.js";
import { Rational } from "../../sketchlib/Rational.js";

const pedal = parse_melody([C3, N4], [REST, N4]);

const CUSTOM_SCALE = new ScaleQuality([C, E, F, G, GS, B]);
const SCALE4 = CUSTOM_SCALE.to_scale(C4);
const SCALE5 = CUSTOM_SCALE.to_scale(C5);

const arp_rhythm = new Rhythm("x-x-x-x-x--.x--.", N8);
const scale_arp = MusicPatterns.scale_melody(
  arp_rhythm,
  SCALE4,
  [0, 1, 2, 3, 4, 5],
);

const cycle_length = N1;
const cycle_a = map_pitch(
  (deg) => SCALE5.value(deg),
  parse_cycle(cycle_length, [0, REST, 1, 2, REST, 4]),
);

const cycle_b = map_pitch(
  (deg) => SCALE5.value(deg),
  parse_cycle(cycle_length, [
    [0, 3],
    [5, REST],
    [0, 4, 2, 4],
  ]),
);

const sine_part = Melody.from_loop(pedal, new Rational(34));
const square_part = new Melody(
  new Rest(new Rational(2)),
  Melody.from_loop(scale_arp, new Rational(22)),
);
const poly_part = new Harmony(
  new Melody(
    new Rest(new Rational(8)),
    Melody.from_repeat(cycle_a, 12),
    new Rest(new Rational(4)),
    Melody.from_repeat(cycle_a, 4),
  ),
  new Melody(
    new Rest(new Rational(8)),
    Melody.from_repeat(cycle_b, 8),
    new Rest(new Rational(4)),
    Melody.from_repeat(cycle_b, 4),
    new Rest(new Rational(4)),
    Melody.from_repeat(cycle_b, 4),
  ),
);

export const SCORE_LAYERED_MELODY = new Score(
  new Part("pedal", sine_part, {
    instrument_id: "sine",
    midi_instrument: 36 - 1, // fretless bass
    midi_channel: 0,
  }),
  new Part("scale_arp", square_part, {
    instrument_id: "square",
    midi_instrument: 47 - 1, // orchestral harp
    midi_channel: 1,
  }),
  new Part("poly_part", poly_part, {
    instrument_id: "poly",
    midi_instrument: 15 - 1, // tubular bells
    midi_channel: 2,
  }),
);
