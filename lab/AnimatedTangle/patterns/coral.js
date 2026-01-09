import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Style } from "../../../sketchlib/Style.js";
import { CoralNode, CoralTree } from "../CoralTree.js";
import { AnimatedStripes } from "./stripes.js";
import { Hinge } from "../Hinge.js";
import { PALETTE_CORAL, PALETTE_SKY, Values } from "../theme_colors.js";
import { Polyp } from "./polyps.js";
import { Mask } from "../../../sketchlib/primitives/ClipMask.js";
import { ClipPrimitive } from "../../../sketchlib/primitives/ClipPrimitive.js";
import {
  ALL_CIRCLES,
  CIRCLE_A,
  CIRCLE_B,
  CIRCLE_C,
  CIRCLE_D,
  CIRCLE_E,
  CIRCLE_F,
  CIRCLE_G,
  CIRCLE_H,
  CIRCLE_I,
  CIRCLE_J,
  CIRCLE_K,
  CIRCLE_L,
  CIRCLE_M,
  CIRCLE_N,
  CIRCLE_O,
  CIRCLE_P,
} from "./coral_layout.js";

const STYLE_CORAL = new Style({
  fill: PALETTE_CORAL[Values.Medium].to_srgb(),
  stroke: PALETTE_CORAL[Values.Dark].to_srgb(),
  width: 4,
});

const STYLE_STRIPES = new Style({
  stroke: PALETTE_SKY[Values.MedLight].to_srgb(),
  width: 4,
});

const SWAY_AMPLITUDE = Math.PI / 12;
const SWAY_FREQUENCY = 0.25;
const PHASE_OFFSET = (2 * Math.PI) / 7;

class SwayingCoral {
  constructor() {
    // Unfortunately, to add the hinges, I need to create the tree
    // in a rather convoluted order

    // C -- hinges about B
    this.node_c = new CoralNode(CIRCLE_C);
    // E -- hinges about D
    this.node_e = new CoralNode(CIRCLE_E);
    // H -- hinges about G
    this.node_h = new CoralNode(CIRCLE_H);
    // Both L and K hinge around J. They use the same anchor point and sway
    // at the same frequency so the shape doesn't distort in length, since
    // K is a parent for L
    this.node_l = new CoralNode(CIRCLE_L);
    this.node_k = new CoralNode(
      CIRCLE_K,
      [this.node_l],
      // Skip for K
      { right: true }
    );
    // N -- hinges about M
    this.node_n = new CoralNode(CIRCLE_N);
    // P -- hinges about O
    this.node_p = new CoralNode(CIRCLE_P);
    this.dynamic_nodes = [
      this.node_c,
      this.node_e,
      this.node_h,
      this.node_k,
      this.node_l,
      this.node_n,
      this.node_p,
    ];

    this.tree = new CoralTree(
      // Node A in diagram on paper
      new CoralNode(CIRCLE_A, [
        // B -- hinge for C
        new CoralNode(
          CIRCLE_B,
          [
            this.node_c,
            // D
            new CoralNode(
              CIRCLE_D,
              [
                this.node_e,
                // F
                new CoralNode(
                  CIRCLE_F,
                  [
                    // G -- serves as anchor for H
                    new CoralNode(
                      CIRCLE_G,
                      [this.node_h],
                      // skip for G
                      { right: false }
                    ),
                    // I
                    new CoralNode(
                      CIRCLE_I,
                      [new CoralNode(CIRCLE_J, [this.node_k])],
                      // skip for I
                      { left: true }
                    ),
                    // M
                    new CoralNode(CIRCLE_M, [this.node_n]),
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
            new CoralNode(CIRCLE_O, [this.node_p]),
          ],
          // skip for B
          { between: [false, true] }
        ),
      ])
    );

    //this.polyps = new Polyps();

    // Make a set of animated stripes as a background
    this.stripes = new AnimatedStripes(
      new Point(150, 500),
      new Direction(-1, 2).normalize(),
      10,
      new Direction(550, 600)
    );
    const styled_stripes = style(this.stripes.render(), STYLE_STRIPES);

    const coral_shape = this.tree.render();
    this.coral_mask = new Mask(coral_shape);

    const colored_coral = style(coral_shape, STYLE_CORAL);
    // Save a reference for modifying the group when the tree
    // refreshes
    this.coral_slot = colored_coral.primitives;

    this.hinge_h = new Hinge(
      CIRCLE_G.position,
      CIRCLE_H.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY
    );
    this.hinge_l = new Hinge(
      CIRCLE_J.position,
      CIRCLE_L.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      PHASE_OFFSET
    );
    this.hinge_k = new Hinge(
      CIRCLE_J.position,
      CIRCLE_K.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      PHASE_OFFSET
    );
    this.hinge_n = new Hinge(
      CIRCLE_M.position,
      CIRCLE_N.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      2 * PHASE_OFFSET
    );
    this.hinge_p = new Hinge(
      CIRCLE_O.position,
      CIRCLE_P.position,
      0.5 * SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      3 * PHASE_OFFSET
    );
    this.hinge_e = new Hinge(
      CIRCLE_D.position,
      CIRCLE_E.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      4 * PHASE_OFFSET
    );
    this.hinge_c = new Hinge(
      CIRCLE_B.position,
      CIRCLE_C.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      5 * PHASE_OFFSET
    );
    this.hinges = [
      this.hinge_c,
      this.hinge_e,
      this.hinge_h,
      this.hinge_k,
      this.hinge_l,
      this.hinge_n,
      this.hinge_p,
    ];
    this.polyps = ALL_CIRCLES.map((c) => new Polyp(c.position));

    const polyp_primitives = group(...this.polyps.map((x) => x.render()));
    this.primitive = group(styled_stripes, colored_coral, polyp_primitives);
  }

  /**
   *
   * @param {number} time Animation time
   */
  update(time) {
    this.stripes.update(2 * time);

    this.hinges.forEach((hinge, i) => {
      // make the hinge sway
      hinge.update(time);

      // Update the node and polyp position attached to the hinge
      this.dynamic_nodes[i].circle.position = hinge.position;
      this.polyps[i].position = hinge.position;
    });

    this.polyps.forEach((x) => x.update(time));

    // re-draw the clip mask
    const coral_shape = this.tree.render();
    this.coral_mask.primitives.splice(0, Infinity, coral_shape);
    this.coral_slot.splice(0, 1, coral_shape);
  }

  render() {
    return this.primitive;
  }
}

export const SWAYING_CORAL = new SwayingCoral();
