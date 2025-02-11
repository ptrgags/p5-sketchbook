import { Style, Color } from "../Style.js";
const THICK = new Style().with_width(4);

export const GRID_STYLE = new Style()
  .with_stroke(new Color(127, 127, 127))
  .with_width(0.5);
export const WALL_STYLE = THICK.with_stroke(new Color(153, 92, 18));
export const CONNECTION_STYLE = THICK.with_stroke(new Color(33, 41, 102));
export const SPLINE_STYLE = THICK.with_stroke(new Color(131, 71, 181));
