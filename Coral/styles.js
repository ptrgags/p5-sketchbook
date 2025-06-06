import { Color } from "../sketchlib/Color.js";
import { Style } from "../sketchlib/Style.js";
const THICK = new Style({
  width: 4,
});
export const GRID_STYLE = new Style({
  stroke: new Color(127, 127, 127),
  width: 0.5,
});
export const WALL_STYLE = THICK.with_stroke(new Color(85, 59, 112));
export const CONNECTION_STYLE = THICK.with_stroke(new Color(33, 41, 102));

// It's coral, so it should be coral color :D
export const SPLINE_STYLE = THICK.with_stroke(new Color(255, 127, 80));
