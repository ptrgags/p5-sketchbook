// Number of grid squares
const NUM_CELLS = 20;
const NUM_CORNERS = NUM_CELLS + 1;

const OFFSET_RIGHT = 0;
const OFFSET_UP = 1;
const OFFSET_LEFT = 2;
const OFFSET_DOWN = 3;

class Corner {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    // position of tangent point for bezier curve grid lines
    // 0 = right
    // 1 = up
    // 2 = left
    // 3 = down
    // values are stored as vec2s
    this.tangents = new Array(2 * 4);
    this.update_tangents();
  }
  
  update_tangents() {
    const r = 0.6 * width / NUM_CELLS;
    const r_cos_theta = r * cos(this.angle);
    const r_sin_theta = r * sin(this.angle);
    const x = this.x;
    const y = this.y;
    
    this.tangents = [
      // right: (cos, -sin)
      x + r_cos_theta,
      y - r_sin_theta,
      // up: (-sin, -cos)
      x - r_sin_theta,
      y - r_cos_theta,
      // left: (-cos, sin)
      x - r_cos_theta,
      y + r_sin_theta,
      // down: (sin, cos)
      x + r_sin_theta,
      y + r_cos_theta
    ];
  }
}

function init_grid() {
  const grid = new Array(NUM_CORNERS * NUM_CORNERS);
  const x_spacing = width / NUM_CELLS;
  const y_spacing = height / NUM_CELLS;
  
  for (let i = 0; i < NUM_CORNERS; i++) {
    let prev_angle = 0;
    for (let j = 0; j < NUM_CORNERS; j++) {
      const index = i * NUM_CORNERS + j;
      let angle = PI / 3.0 * random();
      angle += prev_angle;
      angle /= 2.0;
      prev_angle = angle;
      
      const sign = j % 2 === 0 ? 1 : -1;
      
      //const angle = j / (NUM_CORNERS - 1) * PI - HALF_PI;
      
      const x = j * x_spacing + x_spacing * (0.5 * random() - 0.25);
      const y = i * y_spacing + y_spacing * (0.5 * random() - 0.25);
      
      grid[index] = new Corner(x, y, angle);
    }
  }
  
  return grid;
}

function draw_grid(grid) {
  noFill();
  stroke(255, 0, 0);
  
  // First draw the "horizontal" curves
  for (let i = 0; i < NUM_CORNERS; i++) {
    for (let j = 0; j < NUM_CELLS; j++) {
      const index = i * NUM_CORNERS + j;
      const left_corner = grid[index];
      const right_corner = grid[index + 1];
      
      const ax = left_corner.x;
      const ay = left_corner.y;
      const bx = left_corner.tangents[2 * OFFSET_RIGHT];
      const by = left_corner.tangents[2 * OFFSET_RIGHT + 1];
      const cx = right_corner.tangents[2 * OFFSET_LEFT];
      const cy = right_corner.tangents[2 * OFFSET_LEFT + 1];
      const dx = right_corner.x;
      const dy = right_corner.y;
      
      bezier(ax, ay, bx, by, cx, cy, dx, dy);
    }
  }
  
  stroke(0, 127, 255);
  // And now the "vertical" curves
  for (let i = 0; i < NUM_CORNERS; i++) {
    for (let j = 0; j < NUM_CELLS; j++) {
      const top_corner = grid[j * NUM_CORNERS + i];
      const bottom_corner = grid[(j + 1) * NUM_CORNERS + i];
      
      const ax = top_corner.x;
      const ay = top_corner.y;
      const bx = top_corner.tangents[2 * OFFSET_DOWN];
      const by = top_corner.tangents[2 * OFFSET_DOWN + 1];
      const cx = bottom_corner.tangents[2 * OFFSET_UP];
      const cy = bottom_corner.tangents[2 * OFFSET_UP + 1];
      const dx = bottom_corner.x;
      const dy = bottom_corner.y;
      
      bezier(ax, ay, bx, by, cx, cy, dx, dy);
    }
  }
  
  // Draw a dot at each vertex for debugging
  /*
  noStroke();
  fill(0);
  for (const corner of grid) {
    circle(corner.x, corner.y, 10);
  }
  */
}

function setup() {
  createCanvas(750, 1050);
  background(255);
  const grid = init_grid();
  draw_grid(grid);
}


function draw() {
}
