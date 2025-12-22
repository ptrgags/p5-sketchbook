import { AnimationCurves } from "../../lablib/animation/AnimationCurves.js";
import { N4, N8, N1 } from "../../lablib/music/durations.js";
import { C3, C4, C5, REST } from "../../lablib/music/pitches.js";
import { DOUBLE_HARMONIC, make_scale } from "../../lablib/music/scales.js";
import {
  parse_melody,
  map_pitch,
  parse_cycle,
  Melody,
  Rest,
  Harmony,
  Score,
} from "../../lablib/music/Score.js";
import { Rational } from "../../lablib/Rational.js";
import { SpiralBurst } from "../SpiralBurst.js";

const pedal = parse_melody([C3, N4], [REST, N4]);

const N4D = new Rational(3, 8);

const SCALE4 = make_scale(DOUBLE_HARMONIC, C4);
const SCALE5 = make_scale(DOUBLE_HARMONIC, C5);

// scores are expressed in scale degrees then converted to pitches
const scale_arp = map_pitch(
  SCALE4,
  parse_melody(
    // Measure 1
    [0, N4],
    [1, N4],
    [2, N4],
    [3, N4],
    // Measure 2
    [4, N4D],
    [REST, N8],
    [5, N4D],
    [REST, N8]
  )
);

const cycle_length = N1;
const cycle_a = map_pitch(
  SCALE5,
  parse_cycle(cycle_length, [0, REST, 1, 2, REST, 4])
);

const cycle_b = map_pitch(
  SCALE5,
  parse_cycle(cycle_length, [
    [0, 3],
    [5, REST],
    [0, 4, 2, 4],
  ])
);

const sine_part = Melody.from_loop(pedal, new Rational(34));
const square_part = new Melody(
  new Rest(new Rational(2)),
  Melody.from_loop(scale_arp, new Rational(22))
);
const poly_part = new Harmony(
  new Melody(
    new Rest(new Rational(8)),
    Melody.from_repeat(cycle_a, 12),
    new Rest(new Rational(4)),
    Melody.from_repeat(cycle_a, 4)
  ),
  new Melody(
    new Rest(new Rational(8)),
    Melody.from_repeat(cycle_b, 8),
    new Rest(new Rational(4)),
    Melody.from_repeat(cycle_b, 4),
    new Rest(new Rational(4)),
    Melody.from_repeat(cycle_b, 4)
  )
);

export const SCORE_LAYERED_MELODY = new Score({
  parts: [
    ["sine", sine_part],
    ["square", square_part],
    ["poly", poly_part],
  ],
});

export const CURVES_LAYERED_MELODY = new AnimationCurves(
  SpiralBurst.spiral_burst_curves(sine_part.duration)
);

SpiralBurst.spiral_burst_curves(sine_part.duration);
