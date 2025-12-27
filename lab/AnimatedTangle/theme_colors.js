import { Oklch } from "../lablib/Oklch.js";

export const PALETTE_NAVY = Oklch.gradient(
  new Oklch(0.1662, 0.1152, 264.05),
  new Oklch(0.3, 0.1152, 264.05),
  5
);

export const PALETTE_SKY = Oklch.gradient(
  new Oklch(0.4462, 0.0981, 246.1),
  new Oklch(0.75, 0.0981, 246.1),
  5
);

export const PALETTE_CORAL = Oklch.gradient(
  new Oklch(0.3442, 0.14, 27.53),
  new Oklch(0.7617, 0.14, 27.53),
  5
);

export const PALETTE_ROCK = Oklch.gradient(
  new Oklch(0.3, 0, 0),
  new Oklch(0.7, 0, 0),
  5
);
