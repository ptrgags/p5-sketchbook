/*
 * a(length, duration, angle) -> F(length, duration)
 *                          - rotate(delta) a(length * length_scale, duration * dur_scale)
 *                          - rotate(-delta) a(length * length_scale, duration * dur_scale)
 * */

import { Rational } from "../lablib/Rational";

/**
 * L-system symbol
 */
export class LSymbol {
  /**
   * constructor
   * @param {string} symbol The symbol that identifies this symbol
   * @param {{[key: string]: any}} [params] Optional parameters
   * @param {LSymbol[][]} [children=[]] Children of the symbols
   */
  constructor(symbol, params, children) {
    this.symbol = symbol;
    this.params = params;
    this.children = children;
  }
}

const DELTA_ANGLE = 8;
const SCALE_LENGTH = 0.9;
const SCALE_DURATION = new Rational(1, 2);

// no context, no condition: symbol(params) -> replacement(params)
// left context, no condition: symbol(params) symbol(params) -> replacement(params)

// Conditional rule: [terms, cond(terms)-> bool, func(terms)]

export function subs_tree(symbol) {
  if (symbol.symbol === "a") {
    // a(length, dur) -> F(length, dur)
    //                     R(delta)a(length * length_scale, dur * dur_scale)
    //                     R(-delta)a(length * length_scale, dur * dur_scale)
    /**
     * @type {number}
     */
    const parent_length = symbol.params.length;
    /**
     * @type {Rational}
     */
    const parent_dur = symbol.params.duration;

    const child_length = parent_length * SCALE_LENGTH;
    const child_duration = parent_dur.mul(SCALE_DURATION);

    const left_children = [
      new LSymbol("R", { angle: DELTA_ANGLE }),
      new LSymbol("a", {
        length: child_length,
        duration: child_duration,
      }),
    ];
    const right_children = [
      new LSymbol("R", { angle: -DELTA_ANGLE }),
      new LSymbol("a", {
        length: parent_length,
        duration: child_duration,
      }),
    ];
    return [
      new LSymbol("F", { length: parent_length, dur: parent_dur }, [
        left_children,
        right_children,
      ]),
    ];
  }
}
