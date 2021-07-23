function curvature(s) {
  return 0.1;
}

function torsion(s) {
  return 0.1;
}

class FrenetSerretCurve {
  constructor() {
    this.points = [];
    this.curvature = curvature;
    this.torsion = torsion;
    this.max_points = 5000;
    
    this.position = [0, 0, 0];
    this.arc_length = 0;
    this.tangent = [1, 0, 0];
    this.normal = [0, 1, 0];
    this.binormal = [0, 0, 1];
  }
  
  update(delta_s) {
    const k = this.curvature(this.arc_length);
    const tau = this.torsion(this.arc_length);
    this.arc_length += delta_s;
    
    const [tx, ty, tz] = this.tangent;
    const [nx, ny, nz] = this.normal;
    const [bx, by, bz] = this.binormal;
    const delta_tangent = [k * nx, k * ny, k * nz];
    const delta_normal = [
      -k * tx + tau * bx,
      -k * ty + tau * by, 
      -k * tz + tau * bz
    ];
    const delta_binormal = [-tau * nx, -tau * ny, -tau * nz];
    
    const [dtx, dty, dtz] = delta_tangent;
    this.tangent = [tx +  dtx * delta_s, ty + dty * delta_s, tz + dtz * delta_s];
    
    const [dnx, dny, dnz] = delta_normal;
    this.normal = [nx +  dnx * delta_s, ny + dny * delta_s, nz + dnz * delta_s];
    
    const [dbx, dby, dbz] = delta_binormal;
    this.binormal = [bx +  dbx * delta_s, by + dby * delta_s, bz + dbz * delta_s];
    
    const [tx2, ty2, tz2] = this.tangent;
    const [x, y, z] = this.position;
    const position = [x + tx2 * delta_s, y + ty2 * delta_s, z + tz2 * delta_s];
    this.points.push(position);
    this.position = position;
    
    if (this.points.length > this.max_points) {
      this.points.shift();
    }
  }
  
  draw() {
    stroke(0, 127, 255);
    for (let i = 0; i < this.points.length - 1; i++) {
      const [x1, y1, z1] = this.points[i];
      const [x2, y2, z2] = this.points[i + 1];
      line(x1, y1, z1, x2, y2, z2);
    }
    
    const [x, y, z] = this.position;
    const [tx, ty, tz] = this.tangent;
    const [nx, ny, nz] = this.normal;
    const [bx, by, bz] = this.binormal;
    
    stroke(255, 0, 0);
    line(x, y, z, x + tx, y + ty, z + tz);
    stroke(0, 255, 0);
    line(x, y, z, x + nx, y + ny, z + nz);
    stroke(0, 0, 255);
    line(x, y, z, x + bx, y + by, z + bz);
  }
}

const ITERS_PER_FRAME = 10;
const DELTA_ARC_LENGTH = 0.1;
const curve = new FrenetSerretCurve();

function setup() {
  createCanvas(500, 700, WEBGL);
}


function draw() {
  background(128);
  orbitControl();
  
  curve.draw();
  
  for (let i = 0; i < ITERS_PER_FRAME; i++) {
    curve.update(DELTA_ARC_LENGTH);
  }
  
  stroke(255, 0, 0);
  line(0, 0, 0, 100, 0, 0);
  
  stroke(0, 255, 0);
  line(0, 0, 0, 0, 100, 0);
 
  stroke(0, 0, 255);
  line(0, 0, 0, 0, 0, 100);
}
