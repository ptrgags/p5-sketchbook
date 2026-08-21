import { OPMChannel } from "./OPMChannel.js";
import { OPMEnvelope } from "./OPMEnvelope.js";
import { OPMLFO } from "./OPMLFO.js";
import { OPMOperator } from "./OPMOperator.js";
import { OPMVoice } from "./OPMVoice.js";

/**
 * Decode the name from strings like '@:[num] [Name]'
 * @param {string} name_line
 * @returns {string}
 */
function decode_name(name_line) {
  const [, ...rest] = name_line.split(" ");
  return rest.join(" ");
}

/**
 * Decode the LFO settings
 * @param {string} lfo_line
 * @returns {OPMLFO}
 */
function decode_lfo(lfo_line) {
  const [magic, lfreq, amd, pmd, wf, nfreq] = lfo_line.split(" ");
  if (magic !== "LFO:") {
    throw new Error("LFO line must start with 'LFO:'");
  }

  return new OPMLFO({
    freq: parseInt(lfreq),
    amp_mod_depth: parseInt(amd),
    pitch_mod_depth: parseInt(pmd),
    waveform: parseInt(wf),
    noise_freq: parseInt(nfreq),
  });
}

/**
 * Parse one operator line
 * @param {string} op_line
 * @returns {OPMOperator}
 */
function decode_op(op_line) {
  const [magic, ar, d1r, d2r, rr, d1l, tl, ks, mul, dt1, dt2, ams_en] =
    op_line.split(" ");

  if (!/[MC][12]:/.test(magic)) {
    throw new Error("operator line must start with one of M1:/C1:/M2:/C2:");
  }

  const envelope = new OPMEnvelope({
    attack_rate: parseInt(ar),
    decay1_rate: parseInt(d1r),
    decay2_rate: parseInt(d2r),
    decay1_level: parseInt(d1l),
    release_rate: parseInt(rr),
  });

  return new OPMOperator({
    envelope,
    total_level: parseInt(tl),
    keyboard_scaling: parseInt(ks),
    multiplier: parseInt(mul),
    detune1: parseInt(dt1),
    detune2: parseInt(dt2),
    amp_mod_sensitivity_enable: Boolean(parseInt(ams_en)),
  });
}

/**
 *
 * @param {string} ch_line
 * @returns {OPMChannel}
 */
function decode_ch(ch_line) {
  const [magic, pan, fl, con, ams, pms, slot, ne] = ch_line.split(" ");

  if (magic !== "CH: ") {
    throw new Error("channel line must start with CH:");
  }

  return new OPMChannel({
    // the OPM file format refers to this as PAN, but it's really a L/R pattern enable
    channel_enable: parseInt(pan),
    feedback_level: parseInt(fl),
    connection: parseInt(con),
    amp_mod_sensitivity: parseInt(ams),
    pitch_mod_sensitivity: parseInt(pms),
    slot_mask: parseInt(slot),
    noise_enable: Boolean(parseInt(ne)),
  });
}

/**
 * Decode a single voice
 * @param {string[]} voice_lines 7 lines from the opm file defining one voice
 */
export function decode_voice(voice_lines) {
  if (voice_lines.length !== 7) {
    throw new Error("voice_lines must have exactly 7 entries");
  }

  const [name_line, lfo_line, ch_line, m1_line, c1_line, m2_line, c2_line] =
    voice_lines;

  const name = decode_name(name_line);
  const channel = decode_ch(ch_line);
  const lfo = decode_lfo(lfo_line);

  const operators = [m1_line, c1_line, m2_line, c2_line].map(decode_op);

  return new OPMVoice({
    name,
    channel,
    lfo,
    operators,
  });
}

/**
 *
 * @param {string} opm_text
 * @returns {}
 */
export function decode_opm(opm_text) {
  const lines = opm_text.split("\n");

  const voices = [];
  for (const [i, line] of lines.entries()) {
    if (line.startsWith("@")) {
      const voice = decode_voice(lines.slice(i, i + 7));
      voices.push(voice);
    }
  }

  return;
}
