import { N8, N1 } from "../../sketchlib/music/durations.js";
import {
  Note,
  Harmony,
  Melody,
  map_pitch,
  make_note,
} from "../../sketchlib/music/Music.js";
import { retrograde } from "../../sketchlib/music/retrograde.js";
import { transpose_scale_degree } from "../../sketchlib/music/transpose.js";
import { Rational } from "../../sketchlib/Rational.js";
import { Part, Score } from "../../sketchlib/music/Score.js";
import { MAJOR_SCALE } from "../../sketchlib/music/scales.js";
import { C4 } from "../../sketchlib/music/pitches.js";
import { PatternGrid } from "../../sketchlib/music/PatternGrid.js";

// The top line plays a short motif while the bottom line holds a long note.
const pitches = new PatternGrid([0, 2, 4, 2, 7, 6, 5, 4], N8);
const rhythm = PatternGrid.rhythm("x-x---xxx-x-x-x-", N8);
const top_motif = PatternGrid.zip(rhythm, pitches);

const bottom_motif = make_note(-5, new Rational(2));

const motif_scale = new Harmony(top_motif, bottom_motif);

const motif_third = transpose_scale_degree(2, motif_scale);
const motif_sixth = transpose_scale_degree(4, motif_scale);
const motif_ninth = transpose_scale_degree(8, motif_scale);

const final_chord = new Harmony(
  make_note(4, N1),
  make_note(2, N1),
  make_note(0, N1),
  make_note(-5, N1),
);

const sequence = new Melody(motif_scale, motif_third, motif_sixth, motif_ninth);
const sequence_retrograde = retrograde(sequence);
const part_scale = new Melody(sequence, sequence_retrograde, final_chord);

const SCALE = MAJOR_SCALE.to_scale(C4);
const part_midi = map_pitch((degree) => SCALE.value(degree), part_scale);

export const SCORE_SYMMETRY_MELODY = new Score(
  new Part("symmetry", part_midi, {
    instrument_id: "supersaw",
    midi_instrument: 12 - 1, // vibraphone
    midi_channel: 0,
  }),
);
