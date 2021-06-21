const BOUNDARY_START = 'START';
const BOUNDARY_END = 'END';
const SIZE = 512;
const PAIR_COUNT = 50;

function rgb8(r, g, b) {
  return [r / 255, g / 255, b / 255];
}

// palette from coolors.co: https://coolors.co/5f0f40-9a031e-fb8b24-e36414-0f4c5c
const BACKGROUND_COLOR = rgb8(15, 76, 92);
const COLORS = [  
  rgb8(95, 15, 64),
  rgb8(154, 3, 30),
  rgb8(251, 139, 36),
  rgb8(227, 100, 20)
];

class Boundary {
  constructor(type) {
    this.type = type;
    this.index = undefined;
    this.angle = undefined;
    this.point = undefined;
    this.fill = undefined;
    this.pair = undefined;
    this.color = undefined;
    this.label = undefined;
  }
}

function rand_int(max) {
  return floor(random() * max);
}

function make_connection_string(pairCount) {
  let connection_string = [];
  for (var i = 0; i < pairCount; i++) {
    const index = rand_int(connection_string.length);
    
    const start = new Boundary(BOUNDARY_START);
    const end = new Boundary(BOUNDARY_END);
    start.pair = end;
    end.pair = start;
    
    const color_index = rand_int(COLORS.length);
    const pair_color = COLORS[color_index];
    start.color = pair_color;
    end.color = pair_color;
    const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const label = LABELS[color_index % LABELS.length];
    start.label = label;
    end.label = label;
    
    connection_string.splice(
      index,
      0,
      start,
      end
    );
  }
  
  return connection_string;
}

function print_connection_string(connection_string) {
  let brackets = '';
  let fill = '';
  let labels = '';
  for (const boundary of connection_string) {
    if (boundary.type === BOUNDARY_START) {
      brackets += '[';
    } else {
      brackets += ']';
    }
    
    fill += (boundary.fill && boundary.type === BOUNDARY_START) ? '.' : ' ';
    labels += boundary.label;
  }
  console.log(`${brackets}\n${fill}\n${labels}`);
}

function compute_fill(connection_string) {
  const fill_stack = [true];
  
  for (var i = 0; i < connection_string.length; i++) {
    const boundary = connection_string[i];
    boundary.fill = fill_stack[fill_stack.length - 1];
    
    const next_boundary = connection_string[(i + 1) % connection_string.length];
    const colors_match = boundary.label === next_boundary.label;
    
    if (next_boundary.type === BOUNDARY_START) {
      const fill = colors_match ? !boundary.fill : true;
      fill_stack.push(fill);
    } else {
      fill_stack.pop();
    }
  }
}

function label_connections(connection_string) {
  const connectionCount = connection_string.length;
  for (const [i, boundary] of connection_string.entries()) {
    // for monochrome images, the fill is a simple odd/even coloring.
    //boundary.fill = i % 2 == 0;
    
    const angle = i / connectionCount * TWO_PI;
    boundary.index = i;
    boundary.angle = angle;
    boundary.point = [cos(angle), sin(angle)];
  }
}

const PRIMITIVE_CIRCLE = 0.0;
const PRIMITIVE_LINE = 1.0;

// compute a circle orthogonal to the unit circle that goes through
// a pair of boundary points. Only the start point is needed.
// If the points are on opposite sides of the circle, a line is returned
// instead of a circle.
function orthogonal_circle(boundary_start) {
  const boundary_end = boundary_start.pair;
  
  const index_diff = (boundary_end.index - boundary_start.index) % (2 * PAIR_COUNT);
  if (index_diff === PAIR_COUNT) {
    // compute the tangent direction
    const [x1, y1] = boundary_start.point;
    const [x2, y2] = boundary_end.point;
    const diff_x = x2 - x1;
    const diff_y = y2 - y1;
    const diff_length = sqrt(diff_x * diff_x + diff_y * diff_y);
    const tx = diff_x / diff_length;
    const ty = diff_y / diff_length;
    
    // rotate the tangent vector 90 degrees 
    const [nx, ny] = [-ty, tx];
    
    // the diameter goes through the origin, so we always have a line of the form
    // nx x + ny y = 0
    const n_dot_p1 = 0.0;
    
    return {
      primitive: [nx, ny, n_dot_p1, PRIMITIVE_LINE],
      fill: [boundary_start.fill, true],
      color: boundary_start.color,
    };
  }
  
  // if we take the two boundary points as vectors from the origin, what is the
  // angle of the bisectors? the center of the new circle will be in this direction
  let angle_bisector = (boundary_start.angle + boundary_end.angle) / 2;
  
  let interior = true;
  
  // there are two possible bisectors on a circle. We want the one 
  // through the smaller interval.
  if ((boundary_end.angle - boundary_start.angle) % TWO_PI > PI) {
    angle_bisector += PI;
    angle_bisector %= TWO_PI;
    interior = false;
  }
  
  const [ax, ay] = boundary_start.point;
  const [bx, by] = boundary_end.point;
  
  // compute the cross diagonal length
  const dx = bx - ax;
  const dy = by - ay;
  const cross_diag_squared = dx * dx + dy * dy;
  const cross_diag = sqrt(cross_diag_squared);
  
  // compute the distance of the orthogonal circle from the origin.
  // and its radius
  // We have a kite formed by:
  // - The origin O
  // - One of the boundary points A
  // - The center of the orthogonal circle C
  // - The other boundary point B
  //
  // Notice:
  // - |OA| = |OB| = 1 since the boundary points are unit length
  // - |AC| = |CB| = r the radius of the orthogonal circle
  // - angle OAC and angle CBA are both 90 degrees since an orthogonal
  //   circle intersects the unit circle at 90 degrees
  //
  // The area of a kite has a couple forms. Here we care about two of them:
  // - A = a * b * sin(theta) where a and b are the two side lengths and theta
  //   is the angle between them
  // - A = (p * q) / 2 where p and q are the two diagonals
  //
  // In our case: 
  // - a = |OA| = 1
  // - b = |AC| = r
  // - theta = angle OAC = pi / 2
  // - p = |OC| = diag  -- the main diagonal
  // - q = |AB| = cross_diag -- the cross diagonal
  //
  // a * b * sin(theta) = (p * q) / 2
  // 1 * r * sin(pi / 2) = diag * cross_diag / 2
  // r = diag * cross_diag / 2
  //
  // but also we have a right triangle formed by OA, AC, OC so:
  // 1^2 + r^2 = diag^2
  // 1 + ((diag * cross_diag) / 2)^2 = diag^2
  // 1 + (diag^2 * cross_diag^2) / 4 = diag^2
  // 4 + diag^2 * cross_diag^2 = 4 * diag^2
  // 4 = (4 - cross_diag^2) * diag^2
  // 4 / (4 - cross_diag^2) = diag^2
  // sqrt(4 / (4 - cross_diag^2)) = diag
  //
  // diag is the radial coordinate of the circle center, whereas the
  // angle bisector computed above is the aziumuthal coordinate.
  // r is the radius of the circle.
  const diag = sqrt(4 / (4 - cross_diag_squared));
  const radius = (diag * cross_diag) / 2;
  
  // compute the circle center in rectangular coordinates
  const cx = diag * cos(angle_bisector);
  const cy = diag * sin(angle_bisector);
  
  return {
    primitive: [cx, cy, radius, PRIMITIVE_CIRCLE], 
    fill: [boundary_start.fill, interior],
    color: boundary_start.color
  };
}

function compute_geometry(connection_string) {
  const geometry = [];
  for (const boundary of connection_string) {
    if (boundary.type === BOUNDARY_START) {
      // usually a circle, but if the boundary points are opposite
      // this is a circle.
      const cline = orthogonal_circle(boundary);
      geometry.push(cline);
    }
  }
  return geometry;
}

function set_uniforms(shader, geometry) {
  const primitive_buffer = [];
  const fill_buffer = [];
  const color_buffer = [];
  
  for (let i = 0; i < PAIR_COUNT; i++) {
    const geom = geometry[i];
    primitive_buffer.push(...geom.primitive);
    fill_buffer.push(...geom.fill);
    color_buffer.push(...geom.color);
  }
  
  shader.setUniform('mouse_uv', [0.0, 0.0]);
  shader.setUniform('primitives', primitive_buffer);
  shader.setUniform('fill_flags', fill_buffer);
  shader.setUniform('colors', color_buffer);
  shader.setUniform('background_color', BACKGROUND_COLOR);
}

let geometry;
let connection_string;
let poincare_shader;
function setup() {
  const connection_string = make_connection_string(PAIR_COUNT);
  label_connections(connection_string);
  compute_fill(connection_string);
  print_connection_string(connection_string);
  const geometry = compute_geometry(connection_string);
  createCanvas(SIZE, SIZE, WEBGL);
  
  poincare_shader = createShader(VERTEX_SHADER, FRAGMENT_SHADER(PAIR_COUNT));
  shader(poincare_shader);
  set_uniforms(poincare_shader, geometry);
}

function draw() {
  background(128);
  shader(poincare_shader);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function mouseDragged() {
  poincare_shader.setUniform('mouse_uv', [mouseX / (width - 1), mouseY / (height - 1)]);
}
