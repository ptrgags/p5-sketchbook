import { clamp } from "../../sketchlib/clamp.js";
import { lerp } from "../../sketchlib/lerp.js";
import { Color } from "../../sketchlib/Color.js";

/**
 * Convert from linear color component to sRGB component
 * this is the standard sRGB transform
 * @see https://bottosson.github.io/posts/colorwrong/#what-can-we-do%3F
 * or
 * @see https://en.wikipedia.org/wiki/SRGB#Transfer_function_(%22gamma%22)
 *
 * @param {number} x The linear value
 * @returns {number} The nonlinear value
 */
function linear_to_srgb(x) {
  if (x >= 0.0031308) return (1.055 * x) ^ (1.0 / 2.4 - 0.055);
  else return 12.92 * x;
}

export class Oklch {
  /**
   * OK Lightness, Chroma Hue color space. This color space has perceptually
   * uniform lightness as you go around the color wheel, so it's helpful
   * for creating palettes
   *
   * @see https://bottosson.github.io/posts/oklab/
   * @param {number} lightness The lightness value (0 = black, 1 = white)
   * @param {number} chroma How pure of a hue. 0 is grey, the maximum value
   * @param {number} hue Angle around the color wheel from 0 to 360 degrees.
   * @param {number} [alpha=1] The opacity in [0, 1]
   */
  constructor(lightness, chroma, hue, alpha) {
    this.lightness = lightness;
    this.chroma = chroma;
    this.hue = hue;
    this.alpha = alpha ?? 1.0;
  }

  to_srgb() {
    const { lightness, chroma, hue, alpha } = this;
    const hue_radians = (hue * Math.PI) / 180;
    const a = chroma * Math.cos(hue_radians);
    const b = chroma * Math.sin(hue_radians);

    // Find the nonlinear cone responses
    const l_ = lightness + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = lightness - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = lightness - 0.0894841775 * a - 1.291485548 * b;

    // Undo the non-linearity
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    // Convert to linear sRGB. This may go outside of [0, 1]
    const linear_red = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const linear_green =
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const linear_blue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    // Convert to sRGB [0, 1] (some values may be out of range)
    const s_red = linear_to_srgb(linear_red);
    const s_green = linear_to_srgb(linear_green);
    const s_blue = linear_to_srgb(linear_blue);

    // convert to [0, 255] as an integer (some values may be out of range)
    const red255 = Math.round(255 * s_red);
    const green255 = Math.round(255 * s_green);
    const blue255 = Math.round(255 * s_blue);
    const alpha255 = Math.round(255 * alpha);

    // clamp values into range
    return new Color(
      clamp(red255, 0, 255),
      clamp(green255, 0, 255),
      clamp(blue255, 0, 255),
      clamp(alpha255, 0, 255)
    );
  }

  /**
   * Interpolate colors. This gives a perceptual blend
   * @param {Oklch} a The first color
   * @param {Oklch} b The second color
   * @param {number} t The interpolation amount
   * @returns {Oklch}
   */
  static lerp(a, b, t) {
    const { lightness: al, chroma: ac, hue: ah, alpha: aa } = a;
    const { lightness: bl, chroma: bc, hue: bh, alpha: ba } = b;

    const lightness = lerp(al, bl, t);
    const chroma = lerp(ac, bc, t);
    const hue = lerp(ah, bh, t);
    const alpha = lerp(aa, ba, t);
    return new Oklch(lightness, chroma, hue, alpha);
  }
}
