import { SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";

export const DEFAULT_WAKE_HOUR = 6;
export const DEFAULT_SLEEP_HOUR = 22;

export const DIAL_CENTER = SCREEN_CENTER;
export const DIAL_RADIUS = 175;
export const HAND_LENGTH = 225;
export const HASH_LENGTH = 30;
export const NUMERAL_RADIUS = 235;

export const COLOR_WAKE = new Oklch(0.8, 0.15, 51); // orange
export const COLOR_SLEEP = new Oklch(0.5, 0.1, 277); // purple
export const COLOR_HIGHLIGHT = new Oklch(0.7, 0.1, 250); // light blue
