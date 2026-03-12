import { describe, it, expect } from "vitest";
import { TransformationSequence } from "./TransformationSequence.js";
import { CVersor } from "./CVersor.js";
import { Direction } from "../pga2d/Direction.js";

/**
 *
 * @returns {TransformationSequence}
 */
function make_sequence() {
  // Walk around a square in the order
  // right, up, left, down
  return new TransformationSequence([
    (t) => CVersor.translation(Direction.DIR_X.scale(t)),
    (t) => CVersor.translation(Direction.DIR_Y.scale(t)),
    (t) => CVersor.translation(Direction.DIR_X.scale(-t)),
    (t) => CVersor.translation(Direction.DIR_Y.scale(-t)),
  ]);
}

describe("TransformationSequence", () => {
  it("at 0 returns identity", () => {
    const seq = make_sequence();

    const result = seq.value(0);

    const expected = CVersor.IDENTITY;
    expect(result).toBeCVersor(expected);
  });

  it("at 1/(2n) gives an interpolated value", () => {
    const seq = make_sequence();

    const result = seq.value(1 / 8);

    const expected = CVersor.translation(Direction.DIR_X.scale(0.5));
    expect(result).toBeCVersor(expected);
  });

  it("at 1/n gives the first transfomation step", () => {
    const seq = make_sequence();

    const result = seq.value(1 / 4);

    const expected = CVersor.translation(Direction.DIR_X);
    expect(result).toBeCVersor(expected);
  });

  it("at 2/n gives the composition of the first two transformations", () => {
    const seq = make_sequence();

    const result = seq.value(1 / 2);

    // T(y) * T(x) = T(x + y)
    const expected = CVersor.translation(new Direction(1, 1));
    expect(result).toBeCVersor(expected);
  });

  it("at 1 gives the composition of all steps", () => {
    // use only the first 3 transformations so the value
    // is different from identity
    const seq = new TransformationSequence([
      (t) => CVersor.translation(Direction.DIR_X.scale(t)),
      (t) => CVersor.translation(Direction.DIR_Y.scale(t)),
      (t) => CVersor.translation(Direction.DIR_X.scale(-t)),
    ]);

    const result = seq.value(1);

    // T(-x)T(y)T(x) = T(-x + y + x) = T(y)
    const expected = CVersor.translation(Direction.DIR_Y);
    expect(result).toBeCVersor(expected);
  });
});
