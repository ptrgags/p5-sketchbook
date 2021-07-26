const WIDTH = 500;
const HEIGHT = 700;
const BOUNDS = new Rectangle(0, 0, WIDTH, HEIGHT);
const QUADTREE = new Quadtree(BOUNDS);

const points = [];
const INITIAL_POINTS = 10;
for (let i = 0; i < INITIAL_POINTS; i++) {
  const angle = 2.0 * Math.PI * i / INITIAL_POINTS;
  const x = WIDTH / 2 + 100 * Math.cos(angle);
  const y = HEIGHT / 2 + 100 * Math.sin(angle);
  points.push([x, y]);
}

const POLYLINE = new DifferentialPolyline(points, QUADTREE);


function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(128);
}

DELTA_TIME = 0.1;

function draw() {
  background(128);
  
  // for debugging
  QUADTREE.draw();
  POLYLINE.draw();
  
  if (frameCount % 50 === 0) {
    const index = int(random() * (POLYLINE.nodes.length - 1));
    POLYLINE.add_point(index);
  }
  
  POLYLINE.update(DELTA_TIME);
  const results = QUADTREE.redistribute_dirty_points();
  if (results.length > 0) {
    throw new Error("DIRTY POINTS", results);
  }
  
}
