import { DX7Envelope } from "./DX7Envelope.js";
import { DX7FreqMode, DX7FreqSettings } from "./DX7FreqSettings.js";
import {
  DX7KeyLevelScaling,
  DX7ScalingCurve,
  DX7ScalingCurveType,
} from "./DX7KeyLevelScaling.js";
import { DX7LFO, DX7LFOType } from "./DX7LFO.js";
import { DX7Operator } from "./DX7Operator.js";
import { DX7Voice } from "./DX7Voice.js";

const LENGTH_GLOBAL = 5;
const LENGTH_ENVELOPE = 8;
const LENGTH_OPERATOR = 21;
const LENGTH_LFO = 8;
const LENGTH_LEVEL_SCALING = 5;

/**
 *
 * @param {string} cell
 * @param {number} default_val
 * @return {number}
 */
function parse_num(cell, default_val) {
  if (cell === "N/A") {
    return default_val;
  }

  return parseInt(cell);
}

/**
 * Parse a single DX7 envelope from CSV cells
 * @param {string[]} envelope_cells
 * @param {DX7Envelope} default_env Default envelope values (which are different for mod vs pitch envelopes)
 * @returns {DX7Envelope}
 */
function parse_envelope(envelope_cells, default_env) {
  const default_vals = [...default_env.levels, ...default_env.rates];
  const values = envelope_cells.map((x, i) => parse_num(x, default_vals[i]));

  const levels = values.slice(0, 4);
  const rates = values.slice(4);

  return new DX7Envelope(rates, levels);
}

/**
 * Lookup table for LFO waveforms
 * @type {{[value: string]: DX7LFOType}}
 */
const LFO_WAVE_MAP = {
  Sine: DX7LFOType.SINE,
  Triangle: DX7LFOType.TRIANGLE,
  "Saw Down": DX7LFOType.SAW_DOWN,
  "N/A": DX7LFOType.TRIANGLE,
};

/**
 *
 * @param {string[]} lfo_cells
 * @return {DX7LFO}
 */
function parse_lfo(lfo_cells) {
  const wave = LFO_WAVE_MAP[lfo_cells[0]];
  const speed = parse_num(lfo_cells[1], 35);
  const delay = parse_num(lfo_cells[2], 0);

  const keyboard_sync = lfo_cells[3] !== "OFF";

  const pitch_mod_sensitivity = parse_num(lfo_cells[5], 3);
  const pitch_mod_depth = parse_num(lfo_cells[6], 0);
  const amp_mod_depth = parse_num(lfo_cells[7], 0);

  return new DX7LFO({
    wave,
    speed,
    delay,
    keyboard_sync,
    pitch_mod_sensitivity,
    pitch_mod_depth,
    amp_mod_depth,
  });
}

/**
 * @type {{[value: string]: DX7ScalingCurveType}}
 */
const LUT_SCALING_CURVES = {
  "LIN-": DX7ScalingCurveType.NEG_LIN,
  "LIN+": DX7ScalingCurveType.POS_LIN,
  "EXP-": DX7ScalingCurveType.NEG_EXP,
  "EXP+": DX7ScalingCurveType.POS_EXP,
  "N/A": DX7ScalingCurveType.NEG_LIN,
};

/**
 * 
 * @param {string[]} level_scaling_cells 
 * @returns {DX7KeyLevelScaling}
 */
function parse_level_scaling(level_scaling_cells) {
const breakpoint = DX7KeyLevelScaling.breakpoint_from_note_name(
    level_scaling_cells[0],
  );
  const left_depth = parse_num(level_scaling_cells[1], 0);
  const right_depth = parse_num(level_scaling_cells[2], 0);
  const left_curve_type = LUT_SCALING_CURVES [level_scaling_cells[3]];
  const right_curve_type = LUT_SCALING_CURVES[level_scaling_cells[4]];


  const left_curve = new DX7ScalingCurve(left_curve_type, left_depth),
      const right_curve = new DX7ScalingCurve(right_curve_type, right_depth),

    return new DX7KeyLevelScaling(
      breakpoint,
        left_curve, right_curve
    )
}

/**
 *
 * @param {string[]} operator_cells
 * @param {number} num Operator number 1-6
 * @return {DX7Operator}
 */
function parse_operator(operator_cells, num) {
  const level = parse_num(operator_cells[0], 0);
  const detune = parse_num(operator_cells[1], 0);
  const coarse = parse_num(operator_cells[2], 1);
  const fine = parse_num(operator_cells[3], 0);
  // The FM-1 labels it as Fix, but I usually write Fixed so
  // allow both
  const mode = operator_cells[4].startsWith("Fix")
    ? DX7FreqMode.FIXED
    : DX7FreqMode.RATIO;
  const envelope = parse_envelope(
    operator_cells.slice(5, 5 + LENGTH_ENVELOPE),
    DX7Envelope.DEFAULT_ENV,
  );
  const key_level_scaling = parse_level_scaling(operator_cells.slice(13, 13 + LENGTH_LEVEL_SCALING))
  const key_rate_scaling = parse_num(operator_cells[10], 0);
  const amp_mod_sensitivity = parse_num(operator_cells[11], 0);
  const key_vel_sensitivity = parse_num(operator_cells[12], 0);

  return new DX7Operator({
    num,
    envelope,
    level,
    freq: new DX7FreqSettings(mode, detune, coarse, fine),
    key_level_scaling, 
    key_rate_scaling,
    amp_mod_sensitivity,
    key_vel_sensitivity,
  });
}

/**
 *
 * @param {string} line
 * @param {{[section: string]: number}} start_indices
 * @returns {DX7Voice}
 */
function parse_voice(line, start_indices) {
  const cells = line.split(",");
  const name = cells[start_indices.name];
  const global_cells = cells.slice(
    start_indices.global,
    start_indices.global + LENGTH_GLOBAL,
  );
  const operator_cells = [1, 2, 3, 4, 5, 6].map((num) => {
    const start = start_indices[`op${num}`];
    return cells.slice(start, start + LENGTH_OPERATOR);
  });
  const lfo_cells = cells.slice(
    start_indices.lfo,
    start_indices.lfo + LENGTH_LFO,
  );
  const pitch_env_cells = cells.slice(
    start_indices.pitch_env,
    start_indices.pitch_env + LENGTH_ENVELOPE,
  );

  const algorithm = parse_num(global_cells[0], 1);
  const feedback = parse_num(global_cells[1], 0);
  const transpose = parse_num(global_cells[2], 0);
  const osc_key_sync = global_cells[2] === "ON";

  const operators = operator_cells.map((x, i) => parse_operator(x, i + 1));
  const pitch_env = parse_envelope(pitch_env_cells, DX7Envelope.DEFAULT_PITCH);
  const lfo = parse_lfo(lfo_cells);

  return new DX7Voice({
    name,
    // algorithm is 1-32 in the CSV file, but 0-31 in memory
    algorithm: algorithm - 1,
    feedback,
    // transpose is 0-48 in both spreadsheet and in memory, though
    // it represents -24 to 24
    transpose: transpose,
    osc_key_sync,
    lfo,
    operators,
    pitch_env,
  });
}

/**
 * Parse DX7 voices from a CSV file I made
 * @param {string} csv_text text of CSV file
 * @return {DX7Voice[]}
 */
export function dx7_from_csv(csv_text) {
  const [category_line, header_line, ...voice_lines] = csv_text.split("\n");

  const start_indices = {
    name: header_line.indexOf("Name"),
    global: category_line.indexOf("GLOBAL"),
    op1: category_line.indexOf("OP 1"),
    op2: category_line.indexOf("OP 2"),
    op3: category_line.indexOf("OP 3"),
    op4: category_line.indexOf("OP 4"),
    op5: category_line.indexOf("OP 5"),
    op6: category_line.indexOf("OP 6"),
    lfo: header_line.indexOf("LFO"),
    pitch_env: header_line.indexOf("Pitch EG"),
  };

  return voice_lines.map((line) => parse_voice(line, start_indices));
}
