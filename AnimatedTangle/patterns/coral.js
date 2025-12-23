import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { CirclePrimitive } from "../../sketchlib/primitives/CirclePrimitive.js";
import { CoralNode, CoralTree } from "../CoralTree.js";

const RADIUS_BIG = 25;
const RADIUS_SMALL = RADIUS_BIG / 2;

export const CORAL = new CoralTree(
  // Node A in diagram on paper
  new CoralNode(
    CirclePrimitive.from_two_points(new Point(-75, 600), new Point(0, 600)),
    [
      // B
      new CoralNode(
        new CirclePrimitive(new Point(50, 600), RADIUS_BIG),
        [
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
              // E -- movable
              new CoralNode(
                CirclePrimitive.from_two_points(
                  // tweaked a bit from diagram
                  new Point(150, 600).add(new Direction(25, 0)),
                  new Point(175, 550).add(new Direction(25, 0))
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
                    new CirclePrimitive(new Point(175, 375), RADIUS_SMALL),
                    [
                      // H
                      new CoralNode(
                        // Adjusted slightly from diagram
                        new CirclePrimitive(new Point(225, 325), RADIUS_BIG)
                      ),
                    ],
                    // skip for G
                    { right: false }
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
                            new CirclePrimitive(
                              new Point(125, 275),
                              RADIUS_BIG
                            ),
                            [
                              // L
                              new CoralNode(
                                new CirclePrimitive(
                                  new Point(75, 250),
                                  RADIUS_BIG
                                )
                              ),
                            ],
                            // Skip for K
                            { right: true }
                          ),
                        ]
                      ),
                    ],
                    // skip for I
                    { left: true }
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
                ],
                // Skip for F
                { between: [true, true] }
              ),
            ],
            // Skip for D
            // Turns out I needed the left point else the curve is too
            // broad
            { between: [true] }
          ),
          // O
          new CoralNode(
            CirclePrimitive.from_two_points(
              new Point(50, 525),
              new Point(50, 550)
            ),
            [
              // P
              new CoralNode(
                new CirclePrimitive(new Point(25, 425), RADIUS_BIG)
              ),
            ]
          ),
        ],
        // skip for B
        { between: [false, true] }
      ),
    ]
  )
);
