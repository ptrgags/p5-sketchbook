// Number of grid squares
const NUM_CELLS = 8;
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
    const r = 0.5 * width / NUM_CELLS;
    const r_cos_theta = r * cos(this.angle);
    const r_sin_theta = r * sin(this.angle);
    const x = this.x;
    const y = this.y;
    
    this.tangents = [
      // right: (cos, sin)
      x + r_cos_theta,
      y + r_sin_theta,
      // up: (-sin, cos)
      x - r_sin_theta,
      y + r_cos_theta,
      // left: (-cos, -sin)
      x - r_cos_theta,
      y - r_sin_theta,
      // down: (sin, -cos)
      x + r_sin_theta,
      y - r_cos_theta
    ];
  }
}

function init_grid() {
  const grid = new Array(NUM_CORNERS * NUM_CORNERS);
  const spacing = width / NUM_CELLS;
  for (let i = 0; i < NUM_CORNERS; i++) {
    for (let j = 0; j < NUM_CORNERS; j++) {
      const index = i * NUM_CORNERS + j;
      grid[index] = new Corner(j * spacing, i * spacing, j * PI / 24.0);
    }
  }
  return grid;
}

function draw_grid(grid) {
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
  
  // And now the "vertical" curves
}

function setup() {
  createCanvas(500, 500);
  const grid = init_grid();
  draw_grid(grid);
}


function draw() {
}