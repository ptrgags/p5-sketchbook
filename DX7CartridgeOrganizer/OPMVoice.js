import { DX7Envelope } from "../sketchlib/dx7/DX7Envelope.js";
import { DX7Operator } from "../sketchlib/dx7/DX7Operator.js";
import { DX7Voice } from "../sketchlib/dx7/DX7Voice.js";
import { OPMChannel } from "./OPMChannel.js";
import { OPMLFO } from "./OPMLFO.js";
import { OPMOperator } from "./OPMOperator.js";

/**
 * @typedef {{algorithm: number, opm_indices: number[]}} AlgoMap
 */

//
/**
 * map of OPM connection index (0-7) to:
 *  - DX7 algorithm index (0-31)
 *  - indices in the OPM convention (see comment in remap_operators())
 * @type {AlgoMap[]}
 */
const CONNECTION_TO_ALGORITHM = [
  { algorithm: 0, opm_indices: [4, 5, 3, 2, 1, 0] },
  { algorithm: 13, opm_indices: [4, 5, 3, 2, 1, 0] },
  { algorithm: 16, opm_indices: [3, 0, 2, 1, 4, 5] },
  { algorithm: 6, opm_indices: [4, 5, 3, 2, 1, 0] },
  { algorithm: 4, opm_indices: [3, 2, 4, 5, 1, 0] },
  { algorithm: 23, opm_indices: [4, 5, 3, 2, 1, 0] },
  { algorithm: 30, opm_indices: [4, 5, 3, 2, 1, 0] },
  { algorithm: 31, opm_indices: [4, 5, 3, 2, 1, 0] },
];

/**
 * Convert the OPM "connection" to a DX7 algorithm. This involves reordering
 * and renumbering the operators
 * @param {AlgoMap} algo_map
 * @param {DX7Operator[]} parsed_operators
 * @returns {DX7Operator[]} Operators in the correct order for the DX7 version
 * with the correct operator labels
 */
function remap_operators(algo_map, parsed_operators) {
  // Gather all the operators numbered with the OPM convention
  // 0 = M1
  // 1 = C1
  // 2 = M2
  // 3 = C2
  // 4 = <unused>
  // 5 = <unused>
  const opm_operators = [
    ...parsed_operators,
    // the DX7 has 6 operators, so add two dummy oscillators.
    DX7Operator.init(1, 0),
    DX7Operator.init(1, 0),
  ];

  const dx7_operators = algo_map.opm_indices.map((opm_index, i) => {
    const num = i + 1;
    const op = opm_operators[opm_index];

    return op.renumber(num);
  });

  return dx7_operators;
}

/**
 * @typedef {{
 *  name: string,
 *  lfo: OPMLFO,
 *  channel: OPMChannel
 *  operators: OPMOperator[],
 * }} OPMVoiceOptions
 */

export class OPMVoice {
  /**
   * Constructor
   * @param {OPMVoiceOptions} options
   */
  constructor(options) {
    this.name = options.name;
    this.lfo = options.lfo;
    this.channel = options.channel;
    this.operators = options.operators;
  }

  /**
   * Make a best-effort conversion to a DX7 voice
   * @returns {DX7Voice}
   */
  to_dx7_voice() {
    // NOTE: Noise settings don't have an equivalent, so they are ignored.

    const connection = this.channel.connection;

    const parsed_operators = this.operators.map((x) => x.to_dx7_op());

    const algo_map = CONNECTION_TO_ALGORITHM[connection];

    const operators = remap_operators(algo_map, parsed_operators);

    return new DX7Voice({
      name: this.name,
      // TODO: Convert connection to algorithm
      algorithm: algo_map.algorithm,
      // both OPM and DX7 have feedback: 0-7
      feedback: this.channel.feedback_level,
      operators,
      lfo: this.lfo.to_dx7_lfo(),
      // The OPM chip doesn't have an equivalent of the remaining parameters,
      // so use defaults
      pitch_env: DX7Envelope.DEFAULT_PITCH,
      osc_key_sync: true,
      transpose: 24, // transpose is stored unsigned, so this is 0 - 24
    });
  }
}
