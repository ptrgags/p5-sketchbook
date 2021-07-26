const DEFAULT_CAPACITY = 4;

function partition(array, condition) {
  const pass = [];
  const fail = [];
  for (const element of array) {
    if (condition(element)) {
      pass.push(element);
    } else {
      fail.push(element);
    }
  }
  return [pass, fail];
}

class Quadtree {
  constructor(bounds, capacity=DEFAULT_CAPACITY) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.points = [];
    
    // children has either 0 or 4 children
    // if 4 children, they are ordered by quadrant
    // see rectangle.get_quadrant(point)
    this.children = [];
  }
  
  contains(point) {
    return this.bounds.contains(point.position);
  }
  
  get is_leaf() {
    return this.children.length === 0;
  }
  
  get is_empty() {
    return this.points.length === 0;
  }
  
  count_nodes() {
    if (this.is_leaf) {
      return 1;
    }
    
    let sum = 1;
    for (const child of this.children) {
      sum += child.count_nodes();
    }
    return sum;
  }
  
  insert_point(point) {
    if (!this.bounds.contains(point.position)) {
      throw new Error("OUT OF BOUNDS!");
    }
    
    if (this.is_leaf) {
      point.quadtree_node = this;
      this.points.push(point);
      
      if (this.points.length > this.capacity) {
        this.subdivide();
      }
    } else {
      const quadrant = this.bounds.get_quadrant(point.position);
      this.children[quadrant].insert_point(point);
    }
  }
  
  subdivide() {
    const children_bounds = this.bounds.subdivide();
    this.children = children_bounds.map((rect) => {
      return new Quadtree(rect, this.capacity);
    });
    
    // Move all points from this node to the children
    for (const point of this.points) {
      const quadrant = this.bounds.get_quadrant(point.position);
      this.children[quadrant].insert_point(point);
    }
    this.points = [];
  }
  
  // recursively redistribute dirty points
  redistribute_dirty_points() {
    if (this.is_leaf) {
      // separate the dirty points and send them up the tree. Keep the clean points.
      const [dirty_points, clean_points] = partition(this.points, (x) => x.is_dirty);
      this.points = clean_points;
      return dirty_points;
    }
    
    let empty_count = 0;
    const child_dirty_list = [];
    for (const child of this.children) {
      const child_dirty_points = child.redistribute_dirty_points();
      child_dirty_list.push(...child_dirty_points);
      
      if (child.is_empty) {
        empty_count++;
      }
    }
    
    const outside_parent_list = [];
    for (const point of child_dirty_list) {
      if (this.bounds.contains(point.position)) {
        // point moved from one child to another,
        // redistribute the point.
        point.is_dirty = false;
        this.insert_point(point);
      } else {
        // Point moved outside the parent, propagate
        // it up the tree
        outside_parent_list.push(point);
      }
    }
    
    // If all the points moved out of the parent,
    // we can remove the child cells.
    //if (empty_count === 4) {
    //  this.children = [];
    //}
    
    // propagate points we weren't able to redistribute
    return outside_parent_list;
  }
  
  circle_query(circle) {
    const square = circle.get_bounding_square();
    const points = this.rectangle_query(square);
    return points.filter((p) => circle.contains(p.position));
  }
  
  rectangle_query(rectangle) {
    if (this.is_leaf) {
      return this.points.filter((p) => rectangle.contains(p.position));
    }
    
    const child_points = [];
    for (const child of this.children) {
      if (rectangle.intersects(child.bounds)) {
        const quadrant_points = child.rectangle_query(rectangle);
        child_points.push(...quadrant_points);
      }
    }
    return child_points;
  }
  
  // for debugging
  draw() {
    this.bounds.draw();
    
    for (const point of this.points) {
      point.draw();
    }
    
    for (const child of this.children) {
      child.draw();
    }
  }
}
