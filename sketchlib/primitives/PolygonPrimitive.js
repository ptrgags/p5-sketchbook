import { Point } from "../../pga2d/objects.js";
import { Primitive } from "./Primitive.js";

/**
 * A closed polygon
 * @implements {Primitive}
 */
export class PolygonPrimitive {
  /**
   * Constructor
   * @param {Point[]} vertices Vertices of the polygon. Do not repeat the first point, closing the polygon is handled automatically.
   * @param {boolean} closed if true, the shape is drawn closed
   */
  constructor(vertices, closed) {
    this.vertices = vertices;
    this.closed = closed;
  }

  *[Symbol.iterator]() {
    yield* this.vertices;
  }

  /**
   * Draw a closed polygon
   * @param {import("p5")} p The p5.js library
   */
  draw(p) {
    p.beginShape();
    for (const vertex of this) {
      p.vertex(vertex.x, vertex.y);
    }

    if (this.closed) {
      p.endShape(p.CLOSE);
    } else {
      p.endShape();
    }
  }
}
