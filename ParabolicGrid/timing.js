// We're going to alternate between applying an interpolated parabolic transform
// in the X direction and in the Y direction. We do this 4 times per measure

import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { make_param, ParamCurve } from "../sketchlib/animation/ParamCurve.js";
import { N1, N4 } from "../sketchlib/music/durations.js";
import { Sequential, TimeInterval } from "../sketchlib/music/Timeline.js";

// before switching directions.
const RAMP_T = make_param(0, 1, N4);
const HOLD0 = new TimeInterval(ParamCurve.const_val(0), N1);
const TIMELINE_X = new Sequential(
  // Initial hold so you can see the grid
  HOLD0,
  // Animate in the X direction
  RAMP_T,
  RAMP_T,
  RAMP_T,
  RAMP_T,
  // Hold so you can see the grid
  HOLD0,
  // Y direction animates
  HOLD0,
);
const TIMELINE_Y = new Sequential(
  // Initial hold
  HOLD0,
  // X direction animates
  HOLD0,
  // Pause
  HOLD0,
  // Y direction animates
  RAMP_T,
  RAMP_T,
  RAMP_T,
  RAMP_T,
);

// The timing is the same for both the parabolic and
// translation animations!
export const CURVE_X = LoopCurve.from_timeline(TIMELINE_X);
export const CURVE_Y = LoopCurve.from_timeline(TIMELINE_Y);
