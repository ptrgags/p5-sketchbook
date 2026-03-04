import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { Rectangle } from "../sketchlib/primitives/Rectangle.js";
import { DifferentialNode } from "./DifferentialNode.js";

/**
 * Get a bounding square around a circle
 * @param {Circle} circle
 * @returns {Rectangle}
 */
function get_bounding_square(circle) {
  const { x: cx, y: cy } = circle.center;
  const r = circle.radius;
  return new Rectangle(new Point(cx - r, cy - r), new Direction(2 * r, 2 * r));
}

const DEFAULT_CAPACITY = 10;

/**
 * Partition an array based on a predicate
 * @template T
 * @param {T[]} array
 * @param {function(T): boolean} condition
 * @returns {[T[], T[]]}, (true_values, false_valeus)
 */
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

export class Quadtree {
  /**
   *
   * @param {Rectangle} bounds
   * @param {number} capacity
   */
  constructor(bounds, capacity = DEFAULT_CAPACITY) {
    /**
     * @type {Rectangle}
     */
    this.bounds = bounds;
    /**
     * @type {number}
     */
    this.capacity = capacity;
    /**
     * @type {DifferentialNode[]}
     */
    this.nodes = [];

    /**
     * There are either 0 or 4 children. If 4, they are ordered by
     * quadrant. See Rectangle.get_quadrant(point)
     * @type {Quadtree[]}
     */
    this.children = [];
  }

  /**
   * Check if a node is inside the quadtree tile
   * @param {DifferentialNode} node Node to check
   * @returns {boolean}
   */
  contains(node) {
    const point = new Point(node.position.x, node.position.y);
    return this.bounds.contains(point);
  }

  get is_leaf() {
    return this.children.length === 0;
  }

  get is_empty() {
    return this.nodes.length === 0;
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

  /**
   * Insert a growth node
   * @param {DifferentialNode} node
   */
  insert_node(node) {
    if (!this.bounds.contains(node.position)) {
      throw new Error("OUT OF BOUNDS!");
    }

    if (this.is_leaf) {
      node.quadtree_node = this;
      this.nodes.push(node);

      if (this.nodes.length > this.capacity) {
        this.subdivide();
      }
    } else {
      const quadrant = this.bounds.get_quadrant(node.position);
      this.children[quadrant].insert_node(node);
    }
  }

  subdivide() {
    const children_bounds = this.bounds.subdivide_quadrants();
    this.children = children_bounds.map((rect) => {
      return new Quadtree(rect, this.capacity);
    });

    // Move all points from this node to the children
    for (const point of this.nodes) {
      const quadrant = this.bounds.get_quadrant(point.position);
      this.children[quadrant].insert_node(point);
    }
    this.nodes = [];
  }

  // recursively redistribute dirty points
  redistribute_dirty_points() {
    if (this.is_leaf) {
      // separate the dirty points and send them up the tree. Keep the clean points.
      const [dirty_points, clean_points] = partition(
        this.nodes,
        (x) => x.is_dirty,
      );
      this.nodes = clean_points;
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
    for (const node of child_dirty_list) {
      if (this.bounds.contains(node.position)) {
        // point moved from one child to another,
        // redistribute the point.
        node.is_dirty = false;
        this.insert_node(node);
      } else {
        // Point moved outside the parent, propagate
        // it up the tree
        outside_parent_list.push(node);
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

  /**
   * Get points within a circle
   * @param {Circle} circle
   * @returns
   */
  circle_query(circle) {
    const square = get_bounding_square(circle);
    const points = this.rectangle_query(square);
    return points.filter((p) => circle.contains(p.position));
  }

  /**
   *
   * @param {Rectangle} rectangle
   * @returns {DifferentialNode[]}
   */
  rectangle_query(rectangle) {
    if (this.is_leaf) {
      return this.nodes.filter((p) => rectangle.contains(p.position));
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
  draw(p) {
    this.bounds.draw(p);

    for (const point of this.nodes) {
      point.draw(p);
    }

    for (const child of this.children) {
      child.draw(p);
    }
  }
}
