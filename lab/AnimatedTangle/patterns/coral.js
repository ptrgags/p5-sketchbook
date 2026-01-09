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

    // H -- hinges about G
    this.node_h = new CoralNode(CIRCLE_H);
    // G -- serves as anchor for H
    this.node_g = new CoralNode(
      CIRCLE_G,
      [this.node_h],
      // skip for G
      { right: false }
    );

    // L -- Hinges about J
    this.node_l = new CoralNode(CIRCLE_L);
    // K -- hinges about J
    this.node_k = new CoralNode(
      CIRCLE_K,
      [this.node_l],
      // Skip for K
      { right: true }
    );
    // J -- serves as the hinge point for both L and K
    this.node_j = new CoralNode(CIRCLE_J, [this.node_k]);

    // N -- hinges about M
    this.node_n = new CoralNode(CIRCLE_N);
    // M -- hinge for n
    this.node_m = new CoralNode(CIRCLE_M, [this.node_n]);

    // P -- hinges about O
    this.node_p = new CoralNode(CIRCLE_P);
    // O
    this.node_o = new CoralNode(CIRCLE_O, [this.node_p]);

    // E -- hinges about D
    this.node_e = new CoralNode(CIRCLE_E);
    // D
    this.node_d = new CoralNode(
      CIRCLE_D,
      [
        this.node_e,
        // F
        new CoralNode(
          CIRCLE_F,
          [
            this.node_g,
            // I
            new CoralNode(
              CIRCLE_I,
              [this.node_j],
              // skip for I
              { left: true }
            ),
            // M
            this.node_m,
          ],
          // Skip for F
          { between: [true, true] }
        ),
      ],
      // Skip for D
      // Turns out I needed the left point else the curve is too
      // broad
      { between: [true] }
    );

    // C -- hinges about B
    this.node_c = new CoralNode(CIRCLE_C);
    // B -- hinge for C
    this.node_b = new CoralNode(
      CIRCLE_B,
      [this.node_c, this.node_d, this.node_o],
      // skip for B
      { between: [false, true] }
    );

    this.tree = new CoralTree(
      // Node A in diagram on paper
      new CoralNode(CIRCLE_A, [this.node_b])
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

    /*
    const clipped_polyps = new ClipPrimitive(
      this.coral_mask,
      this.polyps.render()
    );
    */

    this.primitive = group(styled_stripes, colored_coral /*clipped_polyps*/);
  }

  /**
   *
   * @param {number} time Animation time
   */
  update(time) {
    this.stripes.update(2 * time);

    // Make the hinges sway
    this.hinge_c.update(time);
    this.hinge_e.update(time);
    this.hinge_h.update(time);
    this.hinge_l.update(time);
    this.hinge_k.update(time);
    this.hinge_n.update(time);
    this.hinge_p.update(time);

    // Update the nodes attached to the hinges
    this.node_c.circle.position = this.hinge_c.position;
    this.node_e.circle.position = this.hinge_e.position;
    this.node_h.circle.position = this.hinge_h.position;
    this.node_l.circle.position = this.hinge_l.position;
    this.node_k.circle.position = this.hinge_k.position;
    this.node_n.circle.position = this.hinge_n.position;
    this.node_p.circle.position = this.hinge_p.position;

    // re-draw the clip mask
    const coral_shape = this.tree.render();
    this.coral_mask.primitives.splice(0, Infinity, coral_shape);
    this.coral_slot.splice(0, 1, coral_shape);

    //this.polyps.update(time);
  }

  render() {
    return this.primitive;
  }
}

export const SWAYING_CORAL = new SwayingCoral();
