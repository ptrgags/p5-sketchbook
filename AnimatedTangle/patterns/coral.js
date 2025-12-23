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
            //E -- movable
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
                new Point(100, 475)
              ),
              [
                // G
                new CoralNode(
                  new CirclePrimitive(new Point(175, 425), RADIUS_SMALL),
                  [
                    // H
                    new CoralNode(
                      new CirclePrimitive(new Point(200, 350), RADIUS_BIG)
                    ),
                  ]
                ),
                // I
                new CoralNode(
                  new CirclePrimitive(new Point(125, 400), RADIUS_SMALL),
                  [
                    // J
                    new CoralNode(
                      CirclePrimitive.from_two_points(
                        new Point(125, 325),
                        new Point(125, 350)
                      ),
                      [
                        // K
                        new CoralNode(
                          new CirclePrimitive(new Point(125, 275), RADIUS_BIG),
                          [
                            // L
                            new CoralNode(
                              new CirclePrimitive(
                                new Point(75, 250),
                                RADIUS_BIG
                              )
                            ),
                          ]
                        ),
                      ]
                    ),
                  ]
                ),
                // M
                new CoralNode(
                  CirclePrimitive.from_two_points(
                    new Point(75, 400),
                    new Point(75, 425)
                  ),
                  [
                    // N
                    new CoralNode(
                      new CirclePrimitive(new Point(50, 350), RADIUS_BIG)
                    ),
                  ]
                ),
              ]
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
