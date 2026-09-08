import { describe, it, expect } from "vitest";
import { decode_opm } from "./decode_opm.js";
import { OPMVoice } from "./OPMVoice.js";
import { OPMLFO, OPMLFOWaveform } from "./OPMLFO.js";
import { OPMChannel } from "./OPMChannel.js";
import { OPMOperator } from "./OPMOperator.js";
import { OPMEnvelope } from "./OPMEnvelope.js";
// example modified from https://vgmrips.net/wiki/OPM_File_Format
const EXAMPLE_OPM = `
//@:[Num] [Name]
//LFO: LFRQ AMD PMD WF NFRQ
//CH: PAN   FL CON AMS PMS SLOT NE
//[OPname]: AR D1R D2R  RR D1L  TL  KS MUL DT1 DT2 AMS-EN

@:0 Instrument 0
LFO: 0 0 0 0 0
CH: 64 6 6 0 0 120 0
M1: 31 18 0 15 15 24 0 15 3 0 0
C1: 31 17 10 15 0 18 0 1 3 0 0
M2: 31 14 7 15 1 18 0 1 3 0 0
C2: 31 0 9 15 0 18 0 1 3 0 0

@:1 Instrument 1
LFO: 0 0 0 0 0
CH: 64 1 0 0 0 120 0
M1: 31 18 0 15 2 36 0 10 3 0 0
C1: 31 14 4 15 2 45 0 0 0 0 0
M2: 31 10 4 15 2 19 1 0 6 0 0
C2: 31 10 3 15 2 11 1 0 3 0 0
`;

const INSTRUMENT0 = new OPMVoice({
  name: "Instrument 0",
  lfo: new OPMLFO({
    freq: 0,
    amp_mod_depth: 0,
    pitch_mod_depth: 0,
    waveform: OPMLFOWaveform.SAW,
    noise_freq: 0,
  }),
  channel: new OPMChannel({
    channel_enable: 64,
    feedback_level: 6,
    connection: 6,
    amp_mod_sensitivity: 0,
    pitch_mod_sensitivity: 0,
    slot_mask: 120,
    noise_enable: false,
  }),
  operators: [
    new OPMOperator({
      envelope: new OPMEnvelope({
        attack_rate: 31,
        decay1_rate: 18,
        decay2_rate: 0,
        release_rate: 15,
        decay1_level: 15,
      }),
      total_level: 24,
      keyboard_rate_scaling: 0,
      multiplier: 15,
      detune1: 3,
      detune2: 0,
      amp_mod_sensitivity_enable: false,
    }),
    new OPMOperator({
      envelope: new OPMEnvelope({
        attack_rate: 31,
        decay1_rate: 17,
        decay2_rate: 10,
        release_rate: 15,
        decay1_level: 0,
      }),
      total_level: 18,
      keyboard_rate_scaling: 0,
      multiplier: 1,
      detune1: 3,
      detune2: 0,
      amp_mod_sensitivity_enable: false,
    }),
    new OPMOperator({
      envelope: new OPMEnvelope({
        attack_rate: 31,
        decay1_rate: 14,
        decay2_rate: 7,
        release_rate: 15,
        decay1_level: 1,
      }),
      total_level: 18,
      keyboard_rate_scaling: 0,
      multiplier: 1,
      detune1: 3,
      detune2: 0,
      amp_mod_sensitivity_enable: false,
    }),
    new OPMOperator({
      envelope: new OPMEnvelope({
        attack_rate: 31,
        decay1_rate: 0,
        decay2_rate: 9,
        release_rate: 15,
        decay1_level: 0,
      }),
      total_level: 18,
      keyboard_rate_scaling: 0,
      multiplier: 1,
      detune1: 3,
      detune2: 0,
      amp_mod_sensitivity_enable: false,
    }),
  ],
});

const INSTRUMENT1 = new OPMVoice({
  name: "Instrument 1",
  lfo: new OPMLFO({
    freq: 0,
    amp_mod_depth: 0,
    pitch_mod_depth: 0,
    waveform: OPMLFOWaveform.SAW,
    noise_freq: 0,
  }),
  channel: new OPMChannel({
    channel_enable: 64,
    feedback_level: 1,
    connection: 0,
    amp_mod_sensitivity: 0,
    pitch_mod_sensitivity: 0,
    slot_mask: 120,
    noise_enable: false,
  }),
  operators: [
    new OPMOperator({
      envelope: new OPMEnvelope({
        attack_rate: 31,
        decay1_rate: 18,
        decay2_rate: 0,
        release_rate: 15,
        decay1_level: 2,
      }),
      total_level: 36,
      keyboard_rate_scaling: 0,
      multiplier: 10,
      detune1: 3,
      detune2: 0,
      amp_mod_sensitivity_enable: false,
    }),
    new OPMOperator({
      envelope: new OPMEnvelope({
        attack_rate: 31,
        decay1_rate: 14,
        decay2_rate: 4,
        release_rate: 15,
        decay1_level: 2,
      }),
      total_level: 45,
      keyboard_rate_scaling: 0,
      multiplier: 0,
      detune1: 0,
      detune2: 0,
      amp_mod_sensitivity_enable: false,
    }),
    new OPMOperator({
      envelope: new OPMEnvelope({
        attack_rate: 31,
        decay1_rate: 10,
        decay2_rate: 4,
        release_rate: 15,
        decay1_level: 2,
      }),
      total_level: 19,
      keyboard_rate_scaling: 1,
      multiplier: 0,
      detune1: 6,
      detune2: 0,
      amp_mod_sensitivity_enable: false,
    }),
    new OPMOperator({
      envelope: new OPMEnvelope({
        attack_rate: 31,
        decay1_rate: 10,
        decay2_rate: 3,
        release_rate: 15,
        decay1_level: 2,
      }),
      total_level: 11,
      keyboard_rate_scaling: 1,
      multiplier: 0,
      detune1: 3,
      detune2: 0,
      amp_mod_sensitivity_enable: false,
    }),
  ],
});

describe("decode_opm", () => {
  it("parses voices correctly", () => {
    const result = decode_opm(EXAMPLE_OPM);

    const expected = [INSTRUMENT0, INSTRUMENT1];
    expect(result).toEqual(expected);
  });
});
