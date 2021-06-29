const DEFAULT_SPEED = 0.1;
const ATTRACTION = 0.3;
const ALIGNMENT = 0.5;

class Point {
  constructor(position, speed) {
    this.position = position;
    this.next_position = position;
    
    this.prev = undefined;
    this.next = undefined;
  }
  
  update() {
    this.position = Vec2.lerp(this.position, this.next_position, ATTRACTION);
  }
  
  draw() {
    this.position.draw(3);
  }
}

class Polyline {
  constructor(points) {
    this.points = points;
    
    // Link points. This is just a line.
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      p1.next = p2;
      p2.prev = p1;
    }
  }
  
  draw() {
    for (let i = 0; i < this.points.length - 1; i++) {
      Vec2.draw_line(this.points[i].position, this.points[i + 1].position);
    }
    
    for (const point of this.points) {
      point.draw();
    }
  }
  
  add_node() {
    const rand_edge = int(random() * (this.points.length - 1));
    const before = this.points[rand_edge];
    const after = before.next;
    
    const midpoint = Vec2.midpoint(before.position, after.position);
    const mid = new Point(midpoint);
    
    before.next = mid;
    mid.prev = before;
    
    mid.next = after;
    after.prev = mid;
    
    this.points.splice(rand_edge + 1, 0, mid);
  }
  
  point_attraction() {
    for (const point of this.points) {
      let total_velocity = new Vec2(0, 0); 
      
      if (point.prev) {
        let v_previous = new Vec2(0, 0); 
        v_previous = Vec2.sub(point.prev.position, point.position);
        v_previous = Vec2.normalize(v_previous);
        v_previous = Vec2.scale(v_previous, ATTRACTION);
        total_velocity = Vec2.add(total_velocity, v_previous);
      }
      
      if (point.next) {
        let v_next = new Vec2(0, 0); 
        v_next = Vec2.sub(point.next.position, point.position);
        v_next = Vec2.normalize(v_next);
        v_next = Vec2.scale(v_next, ATTRACTION);
        total_velocity = Vec2.add(total_velocity, v_next);
      }
      
      point.next_position = Vec2.add(point.next_position, total_velocity);
    }
  }
  
  point_alignment() {
    for (const point of this.points) {
      // endpoints don't have a midpoint to move towards
      if (point.prev === undefined || point.next === undefined) {
        continue;
      }
      
      const midpoint = Vec2.midpoint(point.prev.position, point.next.position);
      let v_next = Vec2.sub(midpoint, point.position);
      if (Vec2.length(v_next) != 0) {
        v_next = Vec2.normalize(v_next);
      }
      v_next = Vec2.scale(v_next, ALIGNMENT);
      
      point.next_position = Vec2.add(point.next_position, v_next);
    }
  }
  
  update() {
    if (frameCount % 100 == 0) {
      this.add_node();
    }
    
    this.point_attraction();
    this.point_alignment();
    
    for (const point of this.points) {
      point.next_position.y += (2.0 * random() - 1.0);
      point.update();
    }
  }
}

let polyline;
function setup() {
  createCanvas(640, 480);
  
  const points = [];
  for (let i = 0; i < 10; i++) {
    const x = i * width / (10.0 - 1);
    const position = new Vec2(x, height/2);
    points.push(new Point(position));
  }
  polyline = new Polyline(points);
}


function draw() {
  background(128);
  
  stroke(0);
  noFill();
  polyline.draw();
  
  polyline.update();
}
