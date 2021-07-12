const PARAMETERS = Parameters.RANDOM_WALK;

const CURVES = new Array(PARAMETERS.num_curves);

class PlanarCurve {
  constructor(initial_position, initial_angle, line_color, curvature_func) {
    this.positions = [initial_position];
    this.angle = initial_angle;
    this.curvature_func = curvature_func;
    this.arc_length = 0;
    this.line_color = line_color;
  }
  
  draw() {
    noFill();
    stroke(this.line_color);
    strokeWeight(2);
    beginShape();
    for (const [x, y] of this.positions) {
      vertex(x, y);
    }
    endShape();
  }
  
  update(delta_s) {
    const curvature = this.curvature_func(this.arc_length);
    const delta_angle = curvature * delta_s;
    const tangent_x = cos(this.angle);
    const tangent_y = sin(this.angle);
    const delta_x = tangent_x * delta_s;
    const delta_y = tangent_y * delta_s;
    
    const [x, y] = this.positions[this.positions.length - 1];
    const position = [x + delta_x, y + delta_y];
    this.positions.push(position);
    this.angle += delta_angle;
    this.arc_length += delta_s;
    
    if (this.positions.length > PARAMETERS.max_points_per_curve) {
      this.positions.shift();
    }
  }
}

function init_curves() {
  const [x0, y0] = PARAMETERS.initial_position;
  const [amp_x, amp_y] = PARAMETERS.position_variation;
  for (let i = 0; i < PARAMETERS.num_curves; i++) {
    const position = [x0 + amp_x * signed_random(), y0 + amp_y * signed_random()];
    const angle = PARAMETERS.initial_angle + PARAMETERS.angle_variation * signed_random();
    CURVES[i] = new PlanarCurve(position, angle, PARAMETERS.palette.colors[i], PARAMETERS.curvature_func);
  }
}

function setup() {
  createCanvas(500, 700);
  init_curves();
}


function draw() {
  background(0);
  
  for (const curve of CURVES) {
    push();
    translate(width / 2, height / 2);
    curve.draw();
    pop();
    for (let i = 0; i < PARAMETERS.iters_per_update; i++) {
      curve.update(PARAMETERS.delta_arc_length);
    }
  }
}
