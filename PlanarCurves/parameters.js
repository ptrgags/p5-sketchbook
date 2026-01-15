import { random_walk_curvature } from "./curvature.js";
import { Palette } from "./palette.js";

export class Parameters {
  constructor(options) {
    this.background_color = options.background_color || [0, 0, 0];

    // the number of curves and their colors are determined by the palette. Default palette is a bright rainbow
    const url =
      options.coolors_url ||
      "https://coolors.co/ffadad-ffd6a5-fdffb6-caffbf-9bf6ff-a0c4ff-bdb2ff-ffc6ff-fffffc";
    const palette = new Palette(url);
    this.palette = palette;
    this.num_curves = palette.colors.length;

    this.position_variation = options.position_variation || [0, 0];
    this.angle_variation = options.angle_variation || 0;

    this.initial_position = options.initial_position || [0, 0];
    this.initial_angle = options.initial_angle || 0;

    const max_points = options.max_points_per_curve || 5000;
    this.max_points_per_curve = max_points;
    this.limit_curve_length = max_points > 0;

    this.curvature_func = options.curvature_func || random_walk_curvature;
    this.curvature_amplitude = options.curvature_amplitude || 1;
    this.delta_arc_length = options.delta_arc_length || 0.5;
    this.iters_per_update = options.iters_per_update || 10;
  }
}

Parameters.RANDOM_WALK = new Parameters({
  coolors_url:
    "https://coolors.co/b7094c-a01a58-892b64-723c70-5c4d7d-455e89-2e6f95-1780a1-0091ad",
  position_variation: [0, 5],
  angle_variation: Math.PI / 8,
  curvature_func: random_walk_curvature,
});
