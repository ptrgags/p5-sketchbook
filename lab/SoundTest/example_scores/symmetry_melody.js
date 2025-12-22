import { AnimationCurves } from "../../lablib/animation/AnimationCurves.js";
import { N4, N2, N8, N1 } from "../../lablib/music/durations.js";
import { C4 } from "../../lablib/music/pitches.js";
import { retrograde } from "../../lablib/music/retrograde.js";
import { MAJOR, make_scale } from "../../lablib/music/scales.js";
import {
  parse_melody,
  Note,
  Harmony,
  Melody,
  map_pitch,
  Score,
} from "../../lablib/music/Score.js";
import { transpose_scale_degree } from "../../lablib/music/transpose.js";
import { Rational } from "../../lablib/Rational.js";
import { SpiralBurst } from "../SpiralBurst.js";

// The top line plays a short motif while the bottom line holds a long note.
const top_motif = parse_melody(
  [0, N4],
  [2, N2],
  [4, N8],
  [2, N8],
  [7, N4],
  [6, N4],
  [5, N4],
  [4, N4]
);
const bottom_motif = new Note(0, new Rational(2));

const motif_scale = new Harmony(top_motif, bottom_motif);

const motif_third = transpose_scale_degree(2, motif_scale);
const motif_sixth = transpose_scale_degree(4, motif_scale);
const motif_ninth = transpose_scale_degree(8, motif_scale);

const final_chord = new Harmony(
  new Note(0, N1),
  new Note(2, N1),
  new Note(4, N1)
);

const sequence = new Melody(motif_scale, motif_third, motif_sixth, motif_ninth);
const sequence_retrograde = retrograde(sequence);
const part_scale = new Melody(sequence, sequence_retrograde, final_chord);

const SCALE = make_scale(MAJOR, C4);
const part_midi = map_pitch(SCALE, part_scale);

export const SCORE_SYMMETRY_MELODY = new Score({
  parts: [["supersaw", part_midi]],
});

export const CURVES_SYMMETRY_MELODY = new AnimationCurves(
  SpiralBurst.spiral_burst_curves(part_midi.duration)
);
