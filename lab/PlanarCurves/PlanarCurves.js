import { Parameters } from "./parameters.js";
import { GamepadAxisControls } from "./gamepad.js";
import { MidiControls } from "./midi.js";
import { PointerControls } from "./pointer.js";
import { signed_random } from "./curvature.js";

const PARAMETERS = Parameters.RANDOM_WALK;

const CURVES = new Array(PARAMETERS.num_curves);
const GAMEPAD = new GamepadAxisControls();

const midi_enabled = PARAMETERS === Parameters.MIDI;
const MIDI = new MidiControls(midi_enabled);

class PlanarCurve {
  constructor(initial_position, initial_angle, line_color, curvature_func) {
    this.positions = [initial_position];
    this.angle = initial_angle;
    this.curvature_func = curvature_func;
    this.arc_length = 0;
    this.line_color = line_color;
  }

  draw(p) {
    p.noFill();
    p.stroke(this.line_color);
    p.strokeWeight(2);
    p.beginShape();
    for (const [x, y] of this.positions) {
      p.vertex(x, y);
    }
    p.endShape();
  }

  update(delta_s) {
    const curvature =
      PARAMETERS.curvature_amplitude * this.curvature_func(this.arc_length);
    const delta_angle = curvature * delta_s;
    const tangent_x = Math.cos(this.angle);
    const tangent_y = Math.sin(this.angle);
    const delta_x = tangent_x * delta_s;
    const delta_y = tangent_y * delta_s;

    const [x, y] = this.positions[this.positions.length - 1];
    const position = [x + delta_x, y + delta_y];
    this.positions.push(position);
    this.angle += delta_angle;
    this.arc_length += delta_s;

    if (
      PARAMETERS.limit_curve_length &&
      this.positions.length > PARAMETERS.max_points_per_curve
    ) {
      this.positions.shift();
    }
  }
}

function init_curves() {
  const [x0, y0] = PARAMETERS.initial_position;
  const [amp_x, amp_y] = PARAMETERS.position_variation;
  for (let i = 0; i < PARAMETERS.num_curves; i++) {
    const position = [
      x0 + amp_x * signed_random(),
      y0 + amp_y * signed_random(),
    ];
    const angle =
      PARAMETERS.initial_angle + PARAMETERS.angle_variation * signed_random();
    CURVES[i] = new PlanarCurve(
      position,
      angle,
      PARAMETERS.palette.colors[i],
      PARAMETERS.curvature_func
    );
  }
}

export const sketch = (p) => {
  let pointer;
  p.setup = () => {
    const canvas = p.createCanvas(500, 700);
    pointer = new PointerControls(canvas);
    init_curves();
  };

  p.draw = () => {
    p.background(0);

    for (const curve of CURVES) {
      p.push();
      p.translate(p.width / 2, p.height / 2);
      curve.draw(p);
      p.pop();
      for (let i = 0; i < PARAMETERS.iters_per_update; i++) {
        curve.update(PARAMETERS.delta_arc_length);
      }
    }

    GAMEPAD.update();
  };
};
