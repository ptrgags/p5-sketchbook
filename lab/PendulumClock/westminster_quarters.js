import { Rational } from "../lablib/Rational.js";
import {
  Melody,
  MusicLoop,
  Note,
  parse_melody,
  Score,
} from "../lablib/music/Score.js";
import { N1, N2, N4, N8 } from "../lablib/music/durations.js";
import { B3, E3, E4, FS4, GS4 } from "../lablib/music/pitches.js";

// Bell changes for the Westminster Quarters
// See https://en.wikipedia.org/wiki/Westminster_Quarters#Description
const CHANGES = [
  parse_melody([GS4, N8], [FS4, N8], [E4, N8], [B3, N4]),
  parse_melody([E4, N8], [GS4, N8], [FS4, N8], [B3, N4]),
  parse_melody([E4, N8], [FS4, N8], [GS4, N8], [E4, N4]),
  parse_melody([GS4, N8], [E4, N8], [FS4, N8], [B3, N4]),
  parse_melody([B3, N8], [FS4, N8], [GS4, N8], [E4, N4]),
];

// Each quarter hour plays a different set of changes, increasingly long
const FIRST_QUARTER = CHANGES[0];
const SECOND_QUARTER = new Melody(CHANGES[1], CHANGES[2]);
const THIRD_QUARTER = new Melody(CHANGES[3], CHANGES[4], CHANGES[1]);
const FOURTH_QUARTER = new Melody(
  CHANGES[1],
  CHANGES[2],
  CHANGES[3],
  CHANGES[4]
);

const HOUR_BELL = new Note(E3, N2);

/**
 * Make a score for the chimes at the selected hour. This is four quarters
 * plus n rings of the main bell
 * @param {number} hour hour number
 * @returns {Score}
 */
function make_hour_score(hour) {
  // Every hour the hour bell rings n times, for a half note each.
  const hour_chimes = new MusicLoop(new Rational(hour, 2), HOUR_BELL);
  const hour_part = new Melody(FOURTH_QUARTER, hour_chimes);
  return new Score(["bell", hour_part]);
}

/**
 * @type {{[key: string]: Score}}
 */
export const WESTMINSTER_QUARTERS_SCORES = {
  quarter1: new Score(["bell", FIRST_QUARTER]),
  quarter2: new Score(["bell", SECOND_QUARTER]),
  quarter3: new Score(["bell", THIRD_QUARTER]),
  hour1: make_hour_score(1),
  hour2: make_hour_score(2),
  hour3: make_hour_score(3),
  hour4: make_hour_score(4),
  hour5: make_hour_score(5),
  hour6: make_hour_score(6),
  hour7: make_hour_score(7),
  hour8: make_hour_score(8),
  hour9: make_hour_score(9),
  hour10: make_hour_score(10),
  hour11: make_hour_score(11),
  hour12: make_hour_score(12),
};

// 3 quarter notes + 1 half note
const QUARTER_LENGTH = 2.5;
const HOUR_BELL_LENGTH = 2;

/**
 * @type {{[key: string]: number}}
 */
export const WESTMINSTER_SCORE_LENGTHS = {
  quarter1: QUARTER_LENGTH,
  quarter2: 2 * QUARTER_LENGTH,
  quarter3: 3 * QUARTER_LENGTH,
  hour1: 4 * QUARTER_LENGTH + HOUR_BELL_LENGTH,
  hour2: 4 * QUARTER_LENGTH + 2 * HOUR_BELL_LENGTH,
  hour3: 4 * QUARTER_LENGTH + 3 * HOUR_BELL_LENGTH,
  hour4: 4 * QUARTER_LENGTH + 4 * HOUR_BELL_LENGTH,
  hour5: 4 * QUARTER_LENGTH + 5 * HOUR_BELL_LENGTH,
  hour6: 4 * QUARTER_LENGTH + 6 * HOUR_BELL_LENGTH,
  hour7: 4 * QUARTER_LENGTH + 7 * HOUR_BELL_LENGTH,
  hour8: 4 * QUARTER_LENGTH + 8 * HOUR_BELL_LENGTH,
  hour9: 4 * QUARTER_LENGTH + 9 * HOUR_BELL_LENGTH,
  hour10: 4 * QUARTER_LENGTH + 10 * HOUR_BELL_LENGTH,
  hour11: 4 * QUARTER_LENGTH + 11 * HOUR_BELL_LENGTH,
  hour12: 4 * QUARTER_LENGTH + 12 * HOUR_BELL_LENGTH,
};
