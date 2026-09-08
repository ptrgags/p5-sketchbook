import { describe, it, expect } from "vitest";
import { DX7Voice } from "./DX7Voice.js";
import { DX7LFO } from "./DX7LFO.js";
import { DX7Envelope } from "./DX7Envelope.js";
import { DX7Operator } from "./DX7Operator.js";
import { DX7FreqMode, DX7FreqSettings } from "./DX7FreqSettings.js";
import {
  DX7KeyLevelScaling,
  DX7ScalingCurve,
  DX7ScalingCurveType,
} from "./DX7KeyLevelScaling.js";
import { dx7_from_csv } from "./dx7_csv.js";

const EXAMPLE_CSV = `
,,,,GLOBAL,,,,,OP 1,,,,,,,,,,,,,,,,,,,,,OP 2,,,,,,,,,,,,,,,,,,,,,OP 3,,,,,,,,,,,,,,,,,,,,,OP 4,,,,,,,,,,,,,,,,,,,,,OP 5,,,,,,,,,,,,,,,,,,,,,OP 6,,,,,,,,,,,,,,,,,,,,,LFO,,,,,,,,Pitch EG,,,,,,,
FM-1 Patch,Name,Role,Type,Algorithm,Feedback,Transpose,Osc Sync,Mono/Poly,Level,Tune,Coarse,Fine,Ratio/Fixed,Level 1,Level 2,Level 3,Level 4,Rate 1,Rate 2,Rate 3,Rate 4,Breakpoint,L Depth,R Depth,L Curve,R Curve,Rate Scaling,A Mod Sens,Key Vel,Level,Tune,Coarse,Fine,Ratio/Fixed,Level 1,Level 2,Level 3,Level 4,Rate 1,Rate 2,Rate 3,Rate 4,Breakpoint,L Depth,R Depth,L Curve,R Curve,Rate Scaling,A Mod Sens,Key Vel,Level,Tune,Coarse,Fine,Ratio/Fixed,Level 1,Level 2,Level 3,Level 4,Rate 1,Rate 2,Rate 3,Rate 4,Breakpoint,L Depth,R Depth,L Curve,R Curve,Rate Scaling,A Mod Sens,Key Vel,Level,Tune,Coarse,Fine,Ratio/Fixed,Level 1,Level 2,Level 3,Level 4,Rate 1,Rate 2,Rate 3,Rate 4,Breakpoint,L Depth,R Depth,L Curve,R Curve,Rate Scaling,A Mod Sens,Key Vel,Level,Tune,Coarse,Fine,Ratio/Fixed,Level 1,Level 2,Level 3,Level 4,Rate 1,Rate 2,Rate 3,Rate 4,Breakpoint,L Depth,R Depth,L Curve,R Curve,Rate Scaling,A Mod Sens,Key Vel,Level,Tune,Coarse,Fine,Ratio/Fixed,Level 1,Level 2,Level 3,Level 4,Rate 1,Rate 2,Rate 3,Rate 4,Breakpoint,L Depth,R Depth,L Curve,R Curve,Rate Scaling,A Mod Sens,Key Vel,Wave,Speed,Delay,LFO Key Sync,OSC Key Sync,P Mod Sens,PMD,AMD,Level 1,Level 2,Level 3,Level 4,Rate 1,Rate 2,Rate 3,Rate 4
1,Piano 1,,,5,6,24,OFF,Poly,99,3,1,0,Ratio,99,75,0,0,96,25,25,67,A-1,0,0,LIN-,LIN-,3,0,2,58,0,14,0,Ratio,99,75,0,0,95,50,35,78,A-1,0,0,LIN-,LIN-,3,0,7,99,0,1,0,Ratio,99,95,0,0,95,20,20,50,A-1,0,0,LIN-,LIN-,7,0,2,89,0,1,0,Ratio,99,95,0,0,95,29,20,50,A-1,0,0,LIN-,LIN-,3,0,6,99,-7,1,0,Ratio,99,95,0,0,95,20,20,50,A-1,0,0,LIN-,LIN-,3,0,0,79,7,1,0,Ratio,99,95,0,0,95,29,20,50,D2,0,19,LIN-,LIN-,3,0,6,N/A,N/A,N/A,N/A,N/A,N/A,0,0,50,50,50,50,99,99,99,99
`.trim();

const PIANO1 = new DX7Voice({
  name: "Piano 1",
  operators: [
    new DX7Operator({
      num: 1,
      level: 99,
      // note: CSV shows (de)tune as 3, but stored unsigned as 3+7=10
      freq: new DX7FreqSettings(DX7FreqMode.RATIO, 10, 1, 0),
      envelope: new DX7Envelope([96, 25, 25, 67], [99, 75, 0, 0]),
      // A-1 is breakpoint 0
      key_level_scaling: new DX7KeyLevelScaling(
        0,
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
      ),
      key_rate_scaling: 3,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 2,
    }),
    new DX7Operator({
      num: 2,
      level: 58,
      freq: new DX7FreqSettings(DX7FreqMode.RATIO, 7, 14, 0),
      envelope: new DX7Envelope([95, 50, 35, 78], [99, 75, 0, 0]),
      // A-1 is breakpoint 0
      key_level_scaling: new DX7KeyLevelScaling(
        0,
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
      ),
      key_rate_scaling: 3,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 7,
    }),
    new DX7Operator({
      num: 3,
      level: 99,
      freq: new DX7FreqSettings(DX7FreqMode.RATIO, 7, 1, 0),
      envelope: new DX7Envelope([95, 20, 20, 50], [99, 95, 0, 0]),
      // A-1 is breakpoint 0
      key_level_scaling: new DX7KeyLevelScaling(
        0,
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
      ),
      key_rate_scaling: 7,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 2,
    }),
    new DX7Operator({
      num: 4,
      level: 89,
      freq: new DX7FreqSettings(DX7FreqMode.RATIO, 7, 1, 0),
      envelope: new DX7Envelope([95, 29, 20, 50], [99, 95, 0, 0]),
      // A-1 is breakpoint 0
      key_level_scaling: new DX7KeyLevelScaling(
        0,
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
      ),
      key_rate_scaling: 3,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 6,
    }),
    new DX7Operator({
      num: 5,
      level: 99,
      freq: new DX7FreqSettings(DX7FreqMode.RATIO, 0, 1, 0),
      envelope: new DX7Envelope([95, 20, 20, 50], [99, 95, 0, 0]),

      key_level_scaling: new DX7KeyLevelScaling(
        // A-1 is breakpoint 0
        0,
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
      ),
      key_rate_scaling: 3,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 0,
    }),
    new DX7Operator({
      num: 6,
      level: 79,
      freq: new DX7FreqSettings(DX7FreqMode.RATIO, 14, 1, 0),
      envelope: new DX7Envelope([95, 29, 20, 50], [99, 95, 0, 0]),
      // A-1 is breakpoint 0
      key_level_scaling: new DX7KeyLevelScaling(
        // D2 is 2 octaves and 5 semitones above A-1
        // that's 2 * 12 + 5 = 24 + 5 = 29
        29,
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
        new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 19),
      ),
      key_rate_scaling: 3,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 6,
    }),
  ],
  // 5 in the CSV, 4 in memory
  algorithm: 4,
  feedback: 6,
  // 24 in both CSV and memory
  transpose: 24,
  // set to OFF
  osc_key_sync: false,
  pitch_env: DX7Envelope.DEFAULT_PITCH,
  // N/A entries should turn into the default
  lfo: DX7LFO.INIT,
});

describe("dx7_from_csv", () => {
  it("parses voices correctly", () => {
    const result = dx7_from_csv(EXAMPLE_CSV);

    const expected = [PIANO1];
    expect(result).toEqual(expected);
  });
});
