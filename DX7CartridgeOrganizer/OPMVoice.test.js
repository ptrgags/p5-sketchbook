import { describe, it, expect } from "vitest";
import { OPMChannel } from "./OPMChannel.js";
import { OPMEnvelope } from "./OPMEnvelope.js";
import { OPMLFO, OPMLFOWaveform } from "./OPMLFO.js";
import { OPMOperator } from "./OPMOperator.js";
import { OPMVoice } from "./OPMVoice.js";
import { DX7Voice } from "../sketchlib/dx7/DX7Voice.js";
import { DX7Operator } from "../sketchlib/dx7/DX7Operator.js";
import { DX7Envelope } from "../sketchlib/dx7/DX7Envelope.js";
import { DX7LFO } from "../sketchlib/dx7/DX7LFO.js";
import { DX7FreqSettings } from "../sketchlib/dx7/DX7FreqSettings.js";
import { DX7KeyLevelScaling } from "../sketchlib/dx7/DX7KeyLevelScaling.js";

// example modified from https://vgmrips.net/wiki/OPM_File_Format
const OPM_INSTRUMENT0 = new OPMVoice({
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

const DX7_INSTRUMENT0 = new DX7Voice({
  // The name gets truncated to 10 characters
  name: "Instrument",
  // Connection 6 maps onto DX7 algorithm 30 (0-indexed).
  // So we have: op1(FB) -> op2 ->
  //                       op3 ->
  //                       op4 ->
  // The DX7 algorithm looks like this:
  //            op6(FB) -> op5 ->
  //                       op4 ->
  //                       op3 ->
  //                       op2 ->
  //                       op1 ->
  // So DX7 op 1 and 2 will be dummies.
  //    DX7 op 3 will be OPM op 4
  //    DX7 op 4 will be OPM op 3
  //    DX7 op 5 will be OPM op 2
  //    DX7 op 6 will be OPM op 1
  algorithm: 30,
  feedback: 0,
  operators: [
    // Dummy operators
    DX7Operator.init(1, 0),
    DX7Operator.init(2, 0),
    // OPM Operator 4
    new DX7Operator({
      num: 3,
      envelope: DX7Envelope.DEFAULT_ENV,
      level: 99,
      freq: DX7FreqSettings.INIT,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 0,
      key_rate_scaling: 0,
      key_level_scaling: DX7KeyLevelScaling.INIT,
    }),
    // OPM Operator 3
    new DX7Operator({
      num: 4,
      envelope: DX7Envelope.DEFAULT_ENV,
      level: 99,
      freq: DX7FreqSettings.INIT,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 0,
      key_rate_scaling: 0,
      key_level_scaling: DX7KeyLevelScaling.INIT,
    }),
    // OPM Operator 2
    new DX7Operator({
      num: 5,
      envelope: DX7Envelope.DEFAULT_ENV,
      level: 99,
      freq: DX7FreqSettings.INIT,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 0,
      key_rate_scaling: 0,
      key_level_scaling: DX7KeyLevelScaling.INIT,
    }),
    // OPM Operator 1
    new DX7Operator({
      num: 6,
      envelope: DX7Envelope.DEFAULT_ENV,
      // (1 - 24/127) * 99 ~ 80.291 which rounds down to 80
      level: 80,
      freq: DX7FreqSettings.INIT,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 0,
      key_rate_scaling: 0,
      key_level_scaling: DX7KeyLevelScaling.INIT,
    }),
  ],
  lfo: DX7LFO.INIT,
  // unused, so use defaults
  pitch_env: DX7Envelope.DEFAULT_PITCH,
  osc_key_sync: true,
  transpose: 24,
});

describe("OPMVoice", () => {
  it("to_dx7_voice translates to DX7 parameters", () => {
    const result = OPM_INSTRUMENT0.to_dx7_voice();

    const expected = DX7_INSTRUMENT0;
    expect(result).toEqual(expected);
  });
});
