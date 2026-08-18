import {
  Parallel,
  Sequential,
  TimeInterval,
} from "../sketchlib/music/Timeline.js";
import { Rational } from "../sketchlib/Rational.js";
import { FMAlgorithm } from "./FMAlgorithm.js";

export class Operator {
  /**
   *
   * @param {number} num
   * @param {number} [feedback_from]
   */
  constructor(num, feedback_from) {
    this.num = num;
    this.feedback_from = feedback_from;
  }
}

/**
 * Shorthand for making an operator and wrapping it in a dummy TimeInterval
 * so we can use Timeline
 * @param {number} num
 * @param {number} [feedback_from]
 * @returns {TimeInterval<Operator>}
 */
function op(num, feedback_from) {
  return new TimeInterval(new Operator(num, feedback_from), Rational.ONE);
}

const ALGO1 = new Parallel(
  new Sequential(op(1), op(2)),
  new Sequential(op(3), op(4), op(5), op(6, 6)),
);

const ALGO2 = new Parallel(
  new Sequential(op(1), op(2, 2)),
  new Sequential(op(3), op(4), op(5), op(6)),
);

const ALGO3 = new Parallel(
  new Sequential(op(1), op(2), op(3)),
  new Sequential(op(4), op(5), op(6, 6)),
);

const ALGO4 = new Parallel(
  new Sequential(op(1), op(2), op(3)),
  new Sequential(op(4), op(5), op(6, 4)),
);

const ALGO5 = new Parallel(
  new Sequential(op(1), op(2)),
  new Sequential(op(3), op(4)),
  new Sequential(op(5), op(6, 6)),
);

const ALGO6 = new Parallel(
  new Sequential(op(1), op(2)),
  new Sequential(op(3), op(4)),
  new Sequential(op(5), op(6, 5)),
);

const ALGO7 = new Parallel(
  new Sequential(op(1), op(2)),
  new Sequential(op(3), new Parallel(op(4), new Sequential(op(5), op(6, 6)))),
);

const ALGO8 = new Parallel(
  new Sequential(op(1), op(2)),
  new Sequential(op(3), new Parallel(op(4, 4), new Sequential(op(5), op(6)))),
);

const ALGO9 = new Parallel(
  new Sequential(op(1), op(2, 2)),
  new Sequential(op(3), new Parallel(op(4), new Sequential(op(5), op(6)))),
);

const ALGO10 = new Parallel(
  new Sequential(op(1), op(2), op(3, 3)),
  new Sequential(op(4), new Parallel(op(5), op(6))),
);

const ALGO11 = new Parallel(
  new Sequential(op(1), op(2), op(3)),
  new Sequential(op(4), new Parallel(op(5), op(6, 6))),
);

const ALGO12 = new Parallel(
  new Sequential(op(1), op(2, 2)),
  new Sequential(op(3), new Parallel(op(4), op(5), op(6))),
);

const ALGO13 = new Parallel(
  new Sequential(op(1), op(2)),
  new Sequential(op(3), new Parallel(op(4), op(5), op(6, 6))),
);

const ALGO14 = new Parallel(
  new Sequential(op(1), op(2)),
  new Sequential(op(3), op(4), new Parallel(op(5), op(6, 6))),
);

const ALGO15 = new Parallel(
  new Sequential(op(1), op(2, 2)),
  new Sequential(op(3), op(4), new Parallel(op(5), op(6))),
);

const ALGO16 = new Sequential(
  op(1),
  new Parallel(
    op(2),
    new Sequential(op(3), op(4)),
    new Sequential(op(5), op(6, 6)),
  ),
);

const ALGO17 = new Sequential(
  op(1),
  new Parallel(
    op(2, 2),
    new Sequential(op(3), op(4)),
    new Sequential(op(5), op(6)),
  ),
);

const ALGO18 = new Sequential(
  op(1),
  new Parallel(op(2), op(3, 3), new Sequential(op(4), op(5), op(6))),
);

const ALGO19 = new Parallel(
  new Sequential(op(1), op(2), op(3)),
  new Sequential(new Parallel(op(4), op(5)), op(6, 6)),
);

const ALGO20 = new Parallel(
  new Sequential(new Parallel(op(1), op(2)), op(3, 3)),
  new Sequential(op(4), new Parallel(op(5), op(6))),
);

const ALGO21 = new Parallel(
  new Sequential(new Parallel(op(1), op(2)), op(3, 3)),
  new Sequential(new Parallel(op(4), op(5)), op(6)),
);

const ALGO22 = new Parallel(
  new Sequential(op(1), op(2)),
  new Sequential(new Parallel(op(3), op(4), op(5)), op(6, 6)),
);

const ALGO23 = new Parallel(
  op(1),
  new Sequential(op(2), op(3)),
  new Sequential(new Parallel(op(4), op(5)), op(6, 6)),
);

const ALGO24 = new Parallel(
  op(1),
  op(2),
  new Sequential(new Parallel(op(3), op(4), op(5)), op(6, 6)),
);

const ALGO25 = new Parallel(
  op(1),
  op(2),
  op(3),
  new Sequential(new Parallel(op(4), op(5)), op(6, 6)),
);

const ALGO26 = new Parallel(
  op(1),
  new Sequential(op(2), op(3)),
  new Sequential(op(4), new Parallel(op(5), op(6, 6))),
);

const ALGO27 = new Parallel(
  op(1),
  new Sequential(op(2), op(3, 3)),
  new Sequential(op(4), new Parallel(op(5), op(6))),
);

const ALGO28 = new Parallel(
  new Sequential(op(1), op(2)),
  new Sequential(op(3), op(4), op(5, 5)),
  op(6),
);

const ALGO29 = new Parallel(
  op(1),
  op(2),
  new Sequential(op(3), op(4)),
  new Sequential(op(5), op(6, 6)),
);

const ALGO30 = new Parallel(
  op(1),
  op(2),
  new Sequential(op(3), op(4), op(5, 5)),
  op(6),
);

const ALGO31 = new Parallel(
  op(1),
  op(2),
  op(3),
  op(4),
  new Sequential(op(5), op(6, 6)),
);

const ALGO32 = new Parallel(op(1), op(2), op(3), op(4), op(5), op(6, 6));

/**
 * Pre-render all 32 algorithm types
 * @type {FMAlgorithm[]}
 */
export const ALGORITHMS = [
  ALGO1,
  ALGO2,
  ALGO3,
  ALGO4,
  ALGO5,
  ALGO6,
  ALGO7,
  ALGO8,
  ALGO9,
  ALGO10,
  ALGO11,
  ALGO12,
  ALGO13,
  ALGO14,
  ALGO15,
  ALGO16,
  ALGO17,
  ALGO18,
  ALGO19,
  ALGO20,
  ALGO21,
  ALGO22,
  ALGO23,
  ALGO24,
  ALGO25,
  ALGO26,
  ALGO27,
  ALGO28,
  ALGO29,
  ALGO30,
  ALGO31,
  ALGO32,
].map((x) => new FMAlgorithm(x));
