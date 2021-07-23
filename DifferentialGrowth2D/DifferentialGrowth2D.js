const WIDTH = 500;
const HEIGHT = 700;
const BOUNDS = new Rectangle(0, 0, WIDTH, HEIGHT);
const QUADTREE = new Quadtree(BOUNDS);
const POLYLINE = new DifferentialPolyline([
  [100, 100],
  [400, 100],
  [100, 600],
  [400, 600],
], QUADTREE);

function setup() {
  createCanvas(WIDTH, HEIGHT);
}

DELTA_TIME = 0.1;

function draw() {
  background(128);
  
  POLYLINE.draw();
  POLYLINE.update(DELTA_TIME);
  
  // for debugging
  QUADTREE.draw();
}
