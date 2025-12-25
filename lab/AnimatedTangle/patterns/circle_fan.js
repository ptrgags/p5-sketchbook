import { Gap, Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";
import { Point } from "../../../pga2d/Point.js";
import { Color } from "../../../sketchlib/Color.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { style } from "../../../sketchlib/primitives/shorthand.js";
import { Style } from "../../../sketchlib/Style.js";
import { Hold, ParamCurve } from "../../lablib/animation/ParamCurve.js";

const CENTER = new Point(500, 300);
const MAX_RADII = [5, 4, 3, 2, 1].map((x) => x * 50);
const CIRCLE_COUNT = MAX_RADII.length;

const STYLE_CIRCLES = new Style({
  fill: Color.RED,
  stroke: Color.WHITE,
  width: 5,
});

class CircleFan {
  constructor() {
    this.circles = MAX_RADII.map((r) => {
      return new CirclePrimitive(CENTER, r);
    });

    this.prim = style(this.circles, STYLE_CIRCLES);
  }

  update(anim) {
    const r = anim.get_curve_val("circle_fan");

    for (const [i, max_radius] of MAX_RADII.entries()) {
      this.circles[i].radius = Math.min(r, max_radius);
    }
  }

  render() {
    return this.prim;
  }

  make_curves() {
    const EXPAND_DURATION = new Rational(3);
    const PAUSE_DURATION = new Rational(1);
    return {
      circle_fan: new Sequential(
        new ParamCurve(0, CIRCLE_COUNT * 50, EXPAND_DURATION),
        new Hold(PAUSE_DURATION),
        new ParamCurve(CIRCLE_COUNT * 50, 0, EXPAND_DURATION)
      ),
    };
  }
}

export const CIRCLE_FAN = new CircleFan();
