import { AnimationCurves } from "../../lablib/animation/AnimationCurves.js";
import { B, C, C3, E, F, G, GS } from "../../lablib/music/pitches.js";
import { make_scale } from "../../lablib/music/scales.js";
import {
  parse_cycle,
  Harmony,
  Melody,
  map_pitch,
  Score,
} from "../../lablib/music/Score.js";
import { Rational } from "../../lablib/Rational.js";
import { SpiralBurst } from "../SpiralBurst.js";

// Three scales initially the same, but with different lengths
const phase_a = parse_cycle(new Rational(6, 8), [0, 1, 2, 3, 2, 1]);
const phase_b = parse_cycle(Rational.ONE, [0, 1, 2, 3, 4, 3, 2, 1]);
const phase_c = parse_cycle(
  new Rational(10, 8),
  [0, 1, 2, 3, 4, 5, 4, 3, 2, 1]
);

// lcm(6, 8, 10) = 120 eighth notes duration total
const total_duration = new Rational(120, 8);
const phase_part_scale = new Harmony(
  Melody.from_loop(phase_a, total_duration),
  Melody.from_loop(phase_b, total_duration),
  Melody.from_loop(phase_c, total_duration)
);

const SCALE_NOTES = [C, E, F, G, GS, B];
const SCALE3 = make_scale(SCALE_NOTES, C3);

const phase_part_midi = map_pitch(SCALE3, phase_part_scale);

export const SCORE_PHASE_SCALE = new Score({
  parts: [["poly", phase_part_midi]],
});

export const CURVES_PHASE_SCALE = new AnimationCurves(
  SpiralBurst.spiral_burst_curves(phase_part_scale.duration)
);
