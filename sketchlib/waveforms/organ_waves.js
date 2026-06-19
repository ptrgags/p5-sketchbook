import { Drawbars } from "../instruments/DrawbarOrgan.js";
import { fourier_series } from "./fourier_series.js";

/**
 *
 * @param {Drawbars} drawbars
 * @returns {function(number): number}
 */
export function organ_wave(drawbars) {
  const [sub1, , sub3] = drawbars.sub_partials;
  const [f1, f2, f3, f4, f5, f6, f8] = drawbars.main_partials;

  return fourier_series([
    [sub1, 1 / 2],
    [sub3, 3 / 2],
    [f1, 1],
    [f2, 2],
    [f3, 3],
    [f4, 4],
    [f5, 5],
    [f6, 6],
    [f8, 8],
  ]);
}
