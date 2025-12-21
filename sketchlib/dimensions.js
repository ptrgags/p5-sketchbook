import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";

export const WIDTH = 500;
export const HEIGHT = 700;
export const SCREEN_DIMENSIONS = new Direction(WIDTH, HEIGHT);
export const SCREEN_CENTER = new Point(0.5 * WIDTH, 0.5 * HEIGHT);
