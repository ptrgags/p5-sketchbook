import { SCREEN_DIMENSIONS } from "../dimensions.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { clamp } from "../clamp.js";
import { Grid } from "../Grid.js";

/**
 * Rectangle
 */
export class Rectangle {
  /**
   * Constructor
   * @param {Point} position The top left corner of the rectangle as a Point
   * @param {Direction} dimensions The dimensions of the rectangle as a Direction
   */
  constructor(position, dimensions) {
    this.position = position;
    this.dimensions = dimensions;
  }

  /**
   * Get the center of the rectangle
   * @type {Point}
   */
  get center() {
    return this.position.add(this.dimensions.scale(0.5));
  }

  /**
   * @type {Point}
   */
  get far_corner() {
    return this.position.add(this.dimensions);
  }

  /**
   * Returns true if the point is inside the rectangle
   * @param {Point} point A point to compare with the rectangle
   * @returns {boolean} True if the point is within the bounds of the rectangle
   */
  contains(point) {
    const { x, y } = point;
    const { x: x_min, y: y_min } = this.position;
    const { x: width, y: height } = this.dimensions;
    const x_max = x_min + width;
    const y_max = y_min + height;
    return x >= x_min && x < x_max && y >= y_min && y < y_max;
  }

  /**
   * Clamp a point to fit within the bounds
   * @param {Point} point
   * @returns {Point}
   */
  clamp(point) {
    const { x, y } = point;
    const { x: near_x, y: near_y } = this.position;
    const { x: far_x, y: far_y } = this.far_corner;

    return new Point(clamp(x, near_x, far_x), clamp(y, near_y, far_y));
  }

  /**
   * Check if two rectangles intersect
   * @param {Rectangle} other
   * @returns {boolean} true if the rectangles overlap
   */
  intersects(other) {
    const a_near = this.position;
    const b_near = other.position;

    const a_far = this.far_corner;
    const b_far = other.far_corner;

    if (a_near.x > b_far.x || b_near.x > a_far.x) {
      return false;
    }

    if (a_near.y > b_far.y || b_near.y > a_far.y) {
      return false;
    }

    return true;
  }

  /**
   * Convert a position from UV coordinates to screen pixels
   * @param {Point} uv
   * @returns {Point}
   */
  uv_to_world(uv) {
    const { x: u, y: v } = uv;

    return new Point(
      this.position.x + u * this.dimensions.x,
      this.position.y + (1 - v) * this.dimensions.y,
    );
  }

  /**
   * Convert screen pixels to UV coordinates
   * @param {Point} world
   * @returns {Point}
   */
  world_to_uv(world) {
    const { x, y } = world;

    const u = (x - this.position.x) / this.dimensions.x;
    const v = 1 - (y - this.position.y) / this.dimensions.y;
    return new Point(u, v);
  }

  /**
   * Determine which of the 4 quadrants a point is in
   * @param {Point} point A point to check
   * @returns {number} The index 0-3 of the quadrant in the same order that subdivide() returns children
   */
  get_quadrant(point) {
    const { x: cx, y: cy } = this.center;

    let x_bit = 0;
    if (point.x >= cx) {
      x_bit = 1;
    }

    let y_bit = 0;
    if (point.y >= cy) {
      y_bit = 1;
    }

    return (x_bit << 1) | y_bit;
  }

  /**
   *
   * @returns {Rectangle[]}
   */
  subdivide_quadrants() {
    const { x, y } = this.position;
    const center = this.center;
    const half_dims = this.dimensions.scale(0.5);

    return [
      new Rectangle(this.position, half_dims),
      new Rectangle(new Point(x, center.y), half_dims),
      new Rectangle(new Point(center.x, y), half_dims),
      new Rectangle(center, half_dims),
    ];
  }

  /**
   * Subdivide into a n x n grid of smaller quads
   * @param {number} n the number of divisions on a side
   * @returns {Grid<Rectangle>} The sub-tiles
   */
  subdivide_grid(n) {
    const result = new Grid(n, n);
    const sub_dimensions = this.dimensions.scale(1 / n);
    result.fill((index) => {
      const { i, j } = index;
      const y = this.position.y + i * sub_dimensions.y;
      const x = this.position.x + j * sub_dimensions.x;
      const position = new Point(x, y);

      return new Rectangle(position, sub_dimensions);
    });

    return result;
  }

  /**
   * Draw a rectangle to the screen
   * @param {import("p5")} p p5.js library
   */
  draw(p) {
    const { x, y } = this.position;
    const { x: w, y: h } = this.dimensions;
    p.rect(x, y, w, h);
  }
}
Rectangle.SCREEN_RECT = new Rectangle(Point.ORIGIN, SCREEN_DIMENSIONS);
