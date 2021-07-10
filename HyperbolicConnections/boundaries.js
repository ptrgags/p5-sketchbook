// random int in [min, max)
function rand_int(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function rand_choice(array) {
  const index = rand_int(0, array.length);
  return array[index];
}

const BOUNDARY_START = '[';
const BOUNDARY_END = ']';

class BoundaryPoint {
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
  
  // compute a circle orthogonal to the unit circle that goes through
  // a pair of boundary points. Only the start point is needed.
  // If the points are on opposite sides of the circle, a line is returned
  // instead of a circle.
  compute_orthogonal_circle() {
    const start = this;
    const end = this.pair;
    
    const index_diff = (end.index - start.index) % (2 * PAIR_COUNT);
    if (index_diff === PAIR_COUNT) {
      // compute the tangent direction
      const [x1, y1] = start.point;
      const [x2, y2] = end.point;
      const diff_x = x2 - x1;
      const diff_y = y2 - y1;
      const diff_length = Math.sqrt(diff_x * diff_x + diff_y * diff_y);
      const tx = diff_x / diff_length;
      const ty = diff_y / diff_length;
      
      // rotate the tangent vector 90 degrees to get the normal
      const [nx, ny] = [-ty, tx];
      
      // the diameter goes through the origin, so we always have a line of the form
      // nx x + ny y = 0
      const n_dot_p1 = 0.0;
      
      return {
        primitive: [nx, ny, n_dot_p1, PRIMITIVE_LINE],
        fill: [start.fill, true],
        color: start.color,
      };
    }
    
    // if we take the two boundary points as vectors from the origin, what is the
    // angle of the bisectors? the center of the new circle will be in this direction
    let angle_bisector = (start.angle + end.angle) / 2;
    
    let interior = true;
    
    // there are two possible bisectors on a circle. We want the one 
    // through the smaller interval.
    if ((end.angle - start.angle) % (2.0 * Math.PI) > Math.PI) {
      angle_bisector += Math.PI;
      angle_bisector %= 2.0 * Math.PI;
      interior = false;
    }
    
    const [ax, ay] = start.point;
    const [bx, by] = end.point;
    
    // compute the cross diagonal length
    const dx = bx - ax;
    const dy = by - ay;
    const cross_diag_squared = dx * dx + dy * dy;
    const cross_diag = Math.sqrt(cross_diag_squared);
    
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
    const diag = Math.sqrt(4 / (4 - cross_diag_squared));
    const radius = (diag * cross_diag) / 2;
    
    // compute the circle center in rectangular coordinates
    const cx = diag * Math.cos(angle_bisector);
    const cy = diag * Math.sin(angle_bisector);
    
    return {
      primitive: [cx, cy, radius, PRIMITIVE_CIRCLE], 
      fill: [start.fill, interior],
      color: start.color
    };
  }
}


class Boundary {
  constructor(palette) {
    this.palette = palette;
    this.boundary_points = [];
  }
  
  get length() {
    return this.boundary_points.length;
  }
  
  insert_chunk(insert_index, chunk) {
    this.boundary_points.splice(insert_index, 0, ...chunk);
  }
  
  label_points() {
    const length = this.length;
    for (const [i, point] of this.boundary_points.entries()) {
      point.index = i;
      
      // use a simple even/odd fill algorithm. This works best when
      // trying to match two boundaries
      point.fill = i % 2 == 0;
      
      const angle = i / length * (2.0 * Math.PI);
      point.angle = angle;
      point.point = [Math.cos(angle), Math.sin(angle)];
    }
  }
  
  compute_geometry() {
    const geometry = [];
    for (const point of this.boundary_points) {
      if (point.type === BOUNDARY_START) {
        // usually a circle, but if the boundary points are opposite
        // this is a circle.
        const cline = point.compute_orthogonal_circle();
        geometry.push(cline);
      }
    }
    return geometry;
  }
 
  print() {
    let brackets = '';
    let fill = '';
    let labels = '';
    for (const point of this.boundary_points) {
      if (point.type === BOUNDARY_START) {
        brackets += '[';
      } else {
        brackets += ']';
      }
      
      fill += (point.fill && point.type === BOUNDARY_START) ? '.' : ' ';
      labels += point.label;
    }
    console.log(`${brackets}\n${fill}\n${labels}`);
  }
  
  static generate_boundary_chunk(pair_count, chunk_color, color_index) {
    const chunk = [];
    for (var i = 0; i < pair_count; i++) {
      const start = new BoundaryPoint(BOUNDARY_START);
      const end = new BoundaryPoint(BOUNDARY_END);
      start.pair = end;
      end.pair = start;
      
      start.color = chunk_color;
      end.color = chunk_color;
      const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const label = LABELS[color_index % LABELS.length];
      start.label = label;
      end.label = label;
      
      const insert_index = rand_int(0, chunk.length);
      chunk.splice(
        insert_index,
        0,
        start,
        end
      );
    }
    
    return chunk;
  }
  
  /**
   * Generate <code>boundary_count</code> <code>Boundary</code>s of length <code>pair_count</code>.
   * Each will be randomly generated, but some things are done in lockstep to ensure the color
   * and fill patterns will be consistent in the boundary.
   *
   * TODO: Explain this better.
   */
  static generate_multiple(pair_count, boundary_count, palette, max_chunk_length) {
    const boundaries = new Array(boundary_count);
    for (let i = 0; i < boundary_count; i++) {
      boundaries[i] = new Boundary(palette);
    }
     
    let remaining_count = pair_count;
    while (remaining_count > 0) {
      const max_length = Math.min(max_chunk_length, remaining_count); 
      const chunk_length = rand_int(1, max_length + 1);
      const color_index = rand_int(0, palette.colors.length);
      const chunk_color = palette.colors[color_index];
      const insert_index = 2 * rand_int(0, boundaries[0].length / 2);
      for (let i = 0; i < boundary_count; i++) {
        const chunk = this.generate_boundary_chunk(chunk_length, chunk_color, color_index);
        boundaries[i].insert_chunk(insert_index, chunk);
      }
      remaining_count -= chunk_length;
    }
    
    return boundaries;
  }
}
