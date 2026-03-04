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
