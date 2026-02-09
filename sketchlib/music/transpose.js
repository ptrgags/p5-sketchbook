import { map_pitch } from "./Music.js";

/**
 * Transpose music
 * @param {number} interval
 * @param {import("./Music.js").Music<number>} music
 * @returns
 */
export function transpose_scale_degree(interval, music) {
  return map_pitch((pitch) => pitch + interval, music);
}
