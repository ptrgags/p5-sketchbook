import { Point } from "../../pga2d/Point.js";
import { CirclePrimitive } from "../../sketchlib/primitives/CirclePrimitive.js";
import { CoralNode, CoralTree } from "../CoralTree.js";

const RADIUS_BIG = 25;
const RADIUS_SMALL = RADIUS_BIG / 2;

export const CORAL = new CoralTree(
  // Node A in diagram
  new CoralNode(
    CirclePrimitive.from_two_points(new Point(-75, 600), new Point(0, 600)),
    [
      // B
      new CoralNode(new CirclePrimitive(new Point(50, 600), RADIUS_BIG), [
        // C
        new CoralNode(
          CirclePrimitive.from_two_points(
            new Point(50, 675),
            new Point(75, 650)
          )
        ),
        // D
        new CoralNode(
          CirclePrimitive.from_two_points(
            new Point(100, 550),
            new Point(125, 550)
          ),
          [
            //E
            new CoralNode(
              CirclePrimitive.from_two_points(
                new Point(150, 600),
                new Point(175, 550)
              )
            ),
            // F
            new CoralNode(
              CirclePrimitive.from_two_points(
                new Point(150, 500),
                new Point(100, 425)
              )
            ),
          ]
        ),
        // O
        new CoralNode(
          CirclePrimitive.from_two_points(
            new Point(50, 525),
            new Point(50, 550)
          ),
          [
            // P
            new CoralNode(new CirclePrimitive(new Point(25, 425), RADIUS_BIG)),
          ]
        ),
      ]),
    ]
  )
);
