import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { make_param, ParamCurve } from "../sketchlib/animation/ParamCurve.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { N1, N4 } from "../sketchlib/music/durations.js";
import { Sequential, TimeInterval } from "../sketchlib/music/Timeline.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

// We're going to alternate between applying an interpolated parabolic transform
// in the X direction and in the Y direction. We do this 4 times per measure
// before switching directions.
//
// essentially we're making a ramp wave from [0, 1] for one measure, and hold at 0
// for the other measure.
const RAMP_T = make_param(0, 1, N4);
const HOLD0 = new TimeInterval(ParamCurve.const_val(0), N1);
const TIMELINE_X = new Sequential(RAMP_T, RAMP_T, RAMP_T, RAMP_T, HOLD0);
const TIMELINE_Y = new Sequential(HOLD0, RAMP_T, RAMP_T, RAMP_T, RAMP_T);
const CURVE_X = LoopCurve.from_timeline(TIMELINE_X);
const CURVE_Y = LoopCurve.from_timeline(TIMELINE_Y);

const OFFSET_X = Direction.DIR_X;
const OFFSET_Y = Direction.DIR_Y;

const MAX_STEP = 15;
const X_TILES = [];
const Y_TILES = [];
for (let i = -MAX_STEP; i <= MAX_STEP; i++) {
  const transform_x = CVersor.parabolic(OFFSET_X.scale(i));
  const transform_y = CVersor.parabolic(OFFSET_Y.scale(i));
  X_TILES.push(transform_x.transform_cline(Cline.Y_AXIS));
  Y_TILES.push(transform_y.transform_cline(Cline.X_AXIS));
}

const STYLE_X = new Style({
  // purple
  stroke: new Oklch(0.6098, 0.1998, 313.41),
  width: 4,
});
const STYLE_Y = new Style({
  // light green
  stroke: new Oklch(0.7136, 0.1707, 139.76),
  width: 4,
});

/**
 * @implements {Animated}
 */
export class ParabolicGridAnimation {
  /**
   * Constructor
   * @param {CVersor} to_screen Transformation from the unit circle to a larger screen space circle
   */
  constructor(to_screen) {
    this.to_screen = to_screen;

    this.x_group = style(X_TILES, STYLE_X);
    this.y_group = style(Y_TILES, STYLE_Y);
    this.primitive = group(this.x_group, this.y_group);
  }

  update(time) {
    const tx = CURVE_X.value(time);
    const ty = CURVE_Y.value(time);
    const para_x = CVersor.parabolic(OFFSET_X.scale(tx));
    const para_y = CVersor.parabolic(OFFSET_Y.scale(ty));
    const para_total = para_x.compose(para_y);
    const para_screen = this.to_screen.compose(para_total);

    const x_tiles = X_TILES.map((x) => para_screen.transform_cline(x));
    const y_tiles = Y_TILES.map((x) => para_screen.transform_cline(x));
    this.x_group.primitives = x_tiles;
    this.y_group.primitives = y_tiles;
  }
}
