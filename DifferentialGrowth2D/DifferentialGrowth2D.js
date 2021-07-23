const WIDTH = 500;
const HEIGHT = 700;
const BOUNDS = new Rectangle(0, 0, WIDTH, HEIGHT);
const QUADTREE = new Quadtree(BOUNDS);
const POLYLINE = new DifferentialPolyline([
  [100, 100],
  [400, 100],
  [300, 200],
  [100, 600],
  [400, 600],
], QUADTREE);

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
  
  if (frameCount % 100 === 0) {
    const index = int(random() * (POLYLINE.nodes.length - 1));
    POLYLINE.add_point(index);
  }
  
  POLYLINE.update(DELTA_TIME);
  const results = QUADTREE.redistribute_dirty_points();
  if (results.length > 0) {
    throw new Error("DIRTY POINTS", results);
  }
  
}
