import { MINOR7, MAJOR7, HALF_DIM7 } from "../../sketchlib/music/chords.js";
import { ChordVoicing } from "../../sketchlib/music/ChordVoicing.js";
import { N8T, N1 } from "../../sketchlib/music/durations.js";
import { Melody } from "../../sketchlib/music/Music.js";
import { E4, D4, C4, B3, G4, C5 } from "../../sketchlib/music/pitches.js";
import { Part, Score } from "../../sketchlib/music/Score.js";
import { Rational } from "../../sketchlib/Rational.js";

const e_min7 = MINOR7.to_chord(E4);
const d_min7 = MINOR7.to_chord(D4);
const c_maj7 = MAJOR7.to_chord(C4);
const b_hdim7 = HALF_DIM7.to_chord(B3);
const progression = [e_min7, d_min7, c_maj7, b_hdim7];

// Make voicings as block chords
const block_chords = progression.map((x) => x.voice([0, 1, 2, 3]));

// rhythm will be:
//
// grid size: N8T
//
// Em7             Dm7
// x-- --- --- xxx|x-- --- --- xxx|
// chord       ^cascade into next chord
//

const three_beats = new Rational(3, 4);
const chords = [];
for (let i = 0; i < 3; i++) {
  const chord = block_chords[i];

  // Hold the block chord for 3 beats
  chords.push(chord.to_harmony(three_beats));
  const [, delta3, delta5, delta7] = block_chords[i + 1].sub(chord);

  // Now move the chord downwards towards the next chord one step at a time
  const cascade1 = chord.move([0, 0, 0, delta7]);
  const cascade2 = cascade1.move([0, 0, delta5, 0]);
  const cascade3 = cascade2.move([0, delta3, 0, 0]);

  chords.push(
    cascade1.to_harmony(N8T),
    cascade2.to_harmony(N8T),
    cascade3.to_harmony(N8T),
  );
}

// For the ending, it's a little different, long held chords
//
// Grid size N1
// Bhdim7 |  C
// x      |  x
chords.push(
  block_chords.at(-1).to_harmony(N1),
  new ChordVoicing([C4, E4, G4, C5]).to_harmony(N1),
);

export const SCORE_ORGAN_CHORDS = new Score(
  new Part("chords", new Melody(...chords), {
    instrument_id: "organ",
    midi_instrument: 17 - 1,
    midi_channel: 1,
  }),
);
