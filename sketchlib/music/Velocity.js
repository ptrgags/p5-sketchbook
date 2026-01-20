/**
 * Musical dynamics as
 * MIDI velocity values.
 *
 * Values are chosen to match the Logic Pro row of this table: https://en.wikipedia.org/wiki/Dynamics_(music)#Interpretation_by_notation_programs
 * @enum {number}
 */
export const Velocity = {
  PPP: 16,
  PP: 32,
  P: 48,
  MP: 64,
  MF: 80,
  F: 96,
  FF: 112,
  FFF: 127,
};
Object.freeze(Velocity);
