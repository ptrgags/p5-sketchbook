import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { make_param, ParamCurve } from "../sketchlib/animation/ParamCurve.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { N1, N4 } from "../sketchlib/music/durations.js";
import { Gap, Sequential, TimeInterval } from "../sketchlib/music/Timeline.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

const TRANSLATE_CENTER = CVersor.translation(SCREEN_CENTER.to_direction());
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

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

const STYLE_X = new Style({
  stroke: Color.RED,
});
const STYLE_Y = new Style({
  stroke: Color.BLUE,
});

const MAX_STEP = 15;
const X_TILES = [];
const Y_TILES = [];
for (let i = -MAX_STEP; i <= MAX_STEP; i++) {
  const transform_x = CVersor.parabolic(OFFSET_X.scale(i));
  const transform_y = CVersor.parabolic(OFFSET_Y.scale(i));
  X_TILES.push(transform_x.transform_cline(Cline.Y_AXIS));
  Y_TILES.push(transform_y.transform_cline(Cline.X_AXIS));
}

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );
  };

  p.draw = () => {
    p.background(0);

    const time_sec = p.frameCount / 60;
    const SEC_PER_MIN = 60;
    const BPM = 128;
    const BEATS_PER_MEASURE = 4;
    const time_measures = ((time_sec / SEC_PER_MIN) * BPM) / BEATS_PER_MEASURE;

    const tx = CURVE_X.value(time_measures);
    const ty = CURVE_Y.value(time_measures);
    const para_x = CVersor.parabolic(OFFSET_X.scale(tx));
    const para_y = CVersor.parabolic(OFFSET_Y.scale(ty));

    const para_x_screen = TO_SCREEN.compose(para_x);
    const para_y_screen = TO_SCREEN.compose(para_y);

    const x_tiles = X_TILES.map((x) => para_x_screen.transform_cline(x));
    const y_tiles = Y_TILES.map((x) => para_y_screen.transform_cline(x));

    const primitive = group(style(x_tiles, STYLE_X), style(y_tiles, STYLE_Y));
    primitive.draw(p);
  };
};
