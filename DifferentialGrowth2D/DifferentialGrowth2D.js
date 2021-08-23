const WIDTH = 500;
const HEIGHT = 700;
const BOUNDS = new Rectangle(0, 0, WIDTH, HEIGHT);
const QUADTREE = new Quadtree(BOUNDS);

const points = [];
const points2 = [];
const INITIAL_POINTS = 20;
const OFFSET = HEIGHT / 12;
for (let i = 0; i < INITIAL_POINTS; i++) {
  const angle = 2.0 * Math.PI * i / INITIAL_POINTS;
  const x = WIDTH / 2 + 50 * Math.cos(angle);
  const y = HEIGHT / 2 + 50 * Math.sin(angle);
  points.push([x, y - OFFSET]);
  points2.push([x, y + OFFSET]);
}

const POLYLINE = new DifferentialPolyline(points, QUADTREE);
const POLYLINE2 = new DifferentialPolyline(points2, QUADTREE);


function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(128);
}

DELTA_TIME = 0.1;

function draw() {
  background(128);
  
  // for debugging
  QUADTREE.draw();
  POLYLINE.draw(color(255, 128, 0));
  POLYLINE2.draw(color(0, 128, 0));
  
  if (frameCount % 200 == 0) {
    let index = int(random() * (POLYLINE.nodes.length - 1));
    POLYLINE.add_point(index);
    
    index = int(random() * (POLYLINE2.nodes.length - 1));
    POLYLINE2.add_point(index);
  }
  
  if (frameCount % 100 === 0) {
    POLYLINE.split_pinched_angles();
    POLYLINE2.split_pinched_angles();
  }
  
  POLYLINE.update(DELTA_TIME);
  POLYLINE2.update(DELTA_TIME);
  const results = QUADTREE.redistribute_dirty_points();
  if (results.length > 0) {
    throw new Error("DIRTY POINTS", results);
  }
  
}
