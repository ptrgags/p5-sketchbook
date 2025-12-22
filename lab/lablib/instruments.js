/**
 * @typedef {{
 * attack: number,
 * decay: number,
 * sustain: number,
 * release: number
 * }} ADSR
 */

/**
 *
 * @param {import("tone")} tone
 * @param {boolean} is_polyphonic
 * @param {"sine" | "sawtooth" | "triangle" | "square"} waveform
 * @param {ADSR} envelope
 * @returns {import("tone").Synth | import("tone").PolySynth}
 */
export function basic_synth(tone, is_polyphonic, waveform, envelope) {
  if (is_polyphonic) {
    return new tone.PolySynth(tone.Synth, {
      oscillator: { type: waveform },
      envelope,
    });
  }

  return new tone.Synth({
    oscillator: { type: waveform },
    envelope,
  });
}

/**
 *
 * @param {import("tone")} tone
 * @param {boolean} is_polyphonic
 * @param {number} cm_ratio
 * @param {number} depth
 * @param {ADSR} envelope
 * @param {ADSR} mod_envelope
 * @returns
 */
export function fm_synth(
  tone,
  is_polyphonic,
  cm_ratio,
  depth,
  envelope,
  mod_envelope
) {
  if (is_polyphonic) {
    return new tone.PolySynth(tone.FMSynth, {
      harmonicity: cm_ratio,
      modulationIndex: depth,
      oscillator: {
        type: "sine",
      },
      modulation: {
        type: "sine",
      },
      envelope,
      modulationEnvelope: mod_envelope,
    });
  }

  return new tone.FMSynth({
    harmonicity: cm_ratio,
    modulationIndex: depth,
    oscillator: {
      type: "sine",
    },
    modulation: {
      type: "sine",
    },
    envelope,
    modulationEnvelope: mod_envelope,
  });
}

export function detuned_synth() {
  return {};
}

export function super_synth() {
  return {};
}

export function noise_synth() {
  return {};
}

export function pluck_synth() {}

export function metal_synth() {}
