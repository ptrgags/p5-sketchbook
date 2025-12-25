import { Oklch } from "../../lablib/Oklch.js";
import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Color } from "../../../sketchlib/Color.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { InvMask, Mask } from "../../../sketchlib/primitives/ClipMask.js";
import { RectPrimitive } from "../../../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { VectorTangle } from "../../../sketchlib/primitives/VectorTangle.js";
import { Style } from "../../../sketchlib/Style.js";
import { CoralNode, CoralTree } from "../CoralTree.js";
import { AnimatedStripes, make_stripes } from "./stripes.js";
import { Hinge } from "../Hinge.js";

const RADIUS_BIG = 25;
const RADIUS_SMALL = RADIUS_BIG / 2;

const COLOR_CORAL = new Oklch(0.7617, 0.14, 27.53);
const STYLE_CORAL = new Style({
  fill: COLOR_CORAL.to_srgb(),
  stroke: COLOR_CORAL.adjust_lightness(-0.2).to_srgb(),
  width: 4,
});

export const CORAL_STRIPES = new AnimatedStripes(
  new Point(150, 500),
  new Direction(-1, 2).normalize(),
  10,
  new Direction(550, 600)
);

const STYLE_STRIPES = new Style({
  stroke: new Oklch(0.5386, 0.0765, 147.18).to_srgb(),
  width: 4,
});

const GREEN_STRIPES = style(CORAL_STRIPES.render(), STYLE_STRIPES);

const SWAY_AMPLITUDE = Math.PI / 6;
const SWAY_FREQUENCY = 1;

class SwayingCoral {
  constructor() {
    // Node letter labels refer to the concept art diagram
    // E -- hinges about D
    this.node_e = new CoralNode(
      CirclePrimitive.from_two_points(
        // tweaked a bit from diagram
        new Point(150, 600).add(new Direction(25, 0)),
        new Point(175, 550).add(new Direction(25, 0))
      )
    );

    // H -- hinges about G
    this.node_h = new CoralNode(
      // Adjusted slightly from diagram
      new CirclePrimitive(new Point(225, 325), RADIUS_BIG)
    );

    // L -- Hinges about J
    this.node_l = new CoralNode(
      new CirclePrimitive(new Point(75, 250), RADIUS_BIG)
    );

    // K -- hinges about J
    this.node_k = new CoralNode(
      new CirclePrimitive(new Point(125, 275), RADIUS_BIG),
      [this.node_l],
      // Skip for K
      { right: true }
    );

    // J -- serves as the hinge point for both L and K
    this.node_j = new CoralNode(
      CirclePrimitive.from_two_points(new Point(125, 325), new Point(125, 350)),
      [this.node_k]
    );

    this.hinge_l = new Hinge(
      this.node_j.circle.position,
      this.node_l.circle.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY
    );

    // N -- hinges about M
    this.node_n = new CoralNode(
      new CirclePrimitive(new Point(50, 350), RADIUS_BIG)
    );

    // P -- hinges about O
    this.node_p = new CoralNode(
      new CirclePrimitive(new Point(25, 425), RADIUS_BIG)
    );

    // O
    this.node_o = new CoralNode(
      CirclePrimitive.from_two_points(new Point(50, 525), new Point(50, 550)),
      [this.node_p]
    );

    this.hinge_p = new Hinge(
      this.node_o.circle.position,
      this.node_p.circle.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY
    );

    this.tree = new CoralTree(
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
                  this.node_e,
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
                        [this.node_h],
                        // skip for G
                        { right: false }
                      ),
                      // I
                      new CoralNode(
                        new CirclePrimitive(new Point(125, 400), RADIUS_SMALL),
                        [this.node_j],
                        // skip for I
                        { left: true }
                      ),
                      // M
                      new CoralNode(
                        CirclePrimitive.from_two_points(
                          new Point(75, 400),
                          new Point(75, 425)
                        ),
                        [this.node_n]
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
              this.node_o,
            ],
            // skip for B
            { between: [false, true] }
          ),
        ]
      )
    );

    const colored_coral = style(this.tree.render(), STYLE_CORAL);
    // Save a reference for modifying the group when the tree
    // refreshes
    this.coral_slot = colored_coral.primitives;

    this.primitive = group(GREEN_STRIPES, colored_coral);
  }

  /**
   *
   * @param {number} time Animation time
   */
  update(time) {
    // Make the hinges sway
    this.hinge_l.update(time);
    this.hinge_p.update(time);

    // Update the nodes attached to the hinges
    this.node_l.circle.position = this.hinge_l.position;
    this.node_p.circle.position = this.hinge_p.position;

    // re-draw the primitive
    this.coral_slot[0] = this.tree.render();
  }

  render() {
    return this.primitive;
  }
}

export const CORAL_PANEL = new SwayingCoral();
