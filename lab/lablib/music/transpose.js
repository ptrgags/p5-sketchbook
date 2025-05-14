import { map_pitch } from "./Score.js";

export function transpose_scale_degree(interval, music) {
  return map_pitch((pitch) => pitch + interval, music);
}
