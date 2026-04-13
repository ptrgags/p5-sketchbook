/**
 * Convert a MIDI velocity value to ToneJS velocity
 * @param {number} midi_velocity MIDI velocity in [0, 127]
 * @returns {number} Velocity in [0, 1]
 */
export function to_tone_velocity(midi_velocity) {
  return midi_velocity / 127;
}
