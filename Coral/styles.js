import { Color } from "../sketchlib/Color.js";
import { Style } from "../sketchlib/Style.js";
export const GRID_STYLE = Style.lines(new Color(127, 127, 127), 0.5);
export const WALL_STYLE = Style.lines(new Color(85, 59, 112), 4);
export const CONNECTION_STYLE = Style.lines(new Color(33, 41, 102), 4);

// It's coral, so it should be coral color :D
export const SPLINE_STYLE = Style.lines(new Color(255, 127, 80), 4);
