// The color palette both colors the curves and determines the number of them. 
const PALETTE = new Palette(
  //"https://coolors.co/7400b8-6930c3-5e60ce-5390d9-4ea8de-48bfe3-56cfe1-64dfdf-72efdd-80ffdb"
  "https://coolors.co/b7094c-a01a58-892b64-723c70-5c4d7d-455e89-2e6f95-1780a1-0091ad"
);
const NUM_CURVES = PALETTE.colors.length;

// amplitude of random function added to initial [position.x, position.y];
const POSITION_VARIATION = [0, 5];
// similarly, vary the initial angle by this amplitude of random();
const ANGLE_VARIATION = Math.PI / 8;

const INITIAL_POSITION = [0, 0];
const INITIAL_ANGLE = 0;
const MAXIMUM_POINTS = 5000;

// See curvature.js for the full list of functions.
const CURVATURE_FUNCTION = random_curvature;
const DELTA_ARC_LENGTH = 0.5;
const ITERS_PER_UPDATE = 10;

const CURVES = new Array(PALETTE.colors.length);

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
    
    if (this.positions.length > MAXIMUM_POINTS) {
      this.positions.shift();
    }
  }
}



function init_curves() {
  const [x0, y0] = INITIAL_POSITION;
  const [amp_x, amp_y] = POSITION_VARIATION;
  for (let i = 0; i < NUM_CURVES; i++) {
    const position = [x0 + amp_x * signed_random(), y0 + amp_y * signed_random()];
    const angle = INITIAL_ANGLE + ANGLE_VARIATION * signed_random();
    CURVES[i] = new PlanarCurve(position, angle, PALETTE.colors[i], CURVATURE_FUNCTION);
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
    for (let i = 0; i < ITERS_PER_UPDATE; i++) {
      curve.update(DELTA_ARC_LENGTH);
    }
  }
}
