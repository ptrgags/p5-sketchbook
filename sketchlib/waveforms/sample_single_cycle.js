import { SAMPLE_RATE } from "./encode_wav.js";

/**
 * Create a single-cycle waveform
 * @param {function(number): number} f Waveform to sample. It should be a function from [0, 1] to [-1, 1]
 * @param {number} frequency Desired frequency in Hz
 * @returns {Float32Array} A single-cycle waveform as float samples in [-1, 1]
 */
export function sample_single_cycle(f, frequency) {
  const sample_count = Math.floor(SAMPLE_RATE / frequency);
  const result = new Float32Array(sample_count);
  for (let i = 0; i < sample_count; i++) {
    const t = i / sample_count;
    result[i] = f(frequency * t);
  }
  return result;
}
