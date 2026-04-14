import { SAMPLE_RATE } from "./encode_wav.js";

/**
 * Sample a waveform
 * @param {function(number): number} f Waveform to sample. It should be periodic with period 1 unit, and the output must be normalized within [-1, 1]
 * @param {number} frequency Desired frequency in Hz
 * @param {number} sample_count
 * @returns {Float32Array} Array of samples
 */
export function sample_wave(f, frequency, sample_count) {
  if (frequency <= 0) {
    throw new Error("frequency must be positive");
  }

  const result = new Float32Array(sample_count);
  for (let i = 0; i < sample_count; i++) {
    const t = i / SAMPLE_RATE;
    result[i] = f(frequency * t);
  }
  return result;
}

/**
 * Sample a specific number of cycles from a wave
 * @param {function(number):number} f Waveform to sample. It should be periodic with period 1 unit, and the output must be normalized within [-1, 1]
 * @param {number} frequency Frequency of the wave in Hz
 * @param {number} cycle_count How many complete cycles to sample
 * @returns {Float32Array} Buffer of samples
 */
export function sample_n_cycles(f, frequency, cycle_count) {
  const period = Math.round(SAMPLE_RATE / frequency);
  const sample_count = Math.round(period * cycle_count);
  return sample_wave(f, frequency, sample_count);
}
