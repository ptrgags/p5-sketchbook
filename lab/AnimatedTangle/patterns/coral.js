import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Style } from "../../../sketchlib/Style.js";
import { CoralNode, CoralTree } from "../CoralTree.js";
import { AnimatedStripes } from "./stripes.js";
import { Hinge } from "../Hinge.js";
import { PALETTE_CORAL, PALETTE_SKY, Values } from "../theme_colors.js";
import { Polyps } from "./polyps.js";
import { Mask } from "../../../sketchlib/primitives/ClipMask.js";
import { ClipPrimitive } from "../../../sketchlib/primitives/ClipPrimitive.js";

const RADIUS_BIG = 25;
const RADIUS_SMALL = RADIUS_BIG / 2;

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
    // Node letter labels refer to the concept art diagram
    // Unfortunately, to add the hinges, I need to create the tree
    // in a rather convoluted order

    // H -- hinges about G
    this.node_h = new CoralNode(
      // Adjusted slightly from diagram
      new CirclePrimitive(new Point(225, 325), RADIUS_BIG)
    );
    // G -- serves as anchor for H
    this.node_g = new CoralNode(
      new CirclePrimitive(new Point(175, 375), RADIUS_SMALL),
      [this.node_h],
      // skip for G
      { right: false }
    );
    this.hinge_h = new Hinge(
      this.node_g.circle.position,
      this.node_h.circle.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY
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
      SWAY_FREQUENCY,
      PHASE_OFFSET
    );
    this.hinge_k = new Hinge(
      this.node_j.circle.position,
      this.node_k.circle.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      PHASE_OFFSET
    );

    // N -- hinges about M
    this.node_n = new CoralNode(
      new CirclePrimitive(new Point(50, 350), RADIUS_BIG)
    );
    // M -- hinge for n
    this.node_m = new CoralNode(
      CirclePrimitive.from_two_points(new Point(75, 400), new Point(75, 425)),
      [this.node_n]
    );
    this.hinge_n = new Hinge(
      this.node_m.circle.position,
      this.node_n.circle.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      2 * PHASE_OFFSET
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
      0.5 * SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      3 * PHASE_OFFSET
    );

    // E -- hinges about D
    this.node_e = new CoralNode(
      CirclePrimitive.from_two_points(
        // tweaked a bit from diagram
        new Point(150, 600).add(new Direction(25, 0)),
        new Point(175, 550).add(new Direction(25, 0))
      )
    );
    // D
    this.node_d = new CoralNode(
      CirclePrimitive.from_two_points(new Point(100, 550), new Point(125, 550)),
      [
        this.node_e,
        // F
        new CoralNode(
          CirclePrimitive.from_two_points(
            new Point(150, 500),
            new Point(100, 475)
          ),
          [
            this.node_g,
            // I
            new CoralNode(
              new CirclePrimitive(new Point(125, 400), RADIUS_SMALL),
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
    this.hinge_e = new Hinge(
      this.node_d.circle.position,
      this.node_e.circle.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      4 * PHASE_OFFSET
    );

    // C -- hinges about B
    this.node_c = new CoralNode(
      CirclePrimitive.from_two_points(new Point(50, 675), new Point(75, 650))
    );
    // B -- hinge for C
    this.node_b = new CoralNode(
      new CirclePrimitive(new Point(50, 600), RADIUS_BIG),
      [this.node_c, this.node_d, this.node_o],
      // skip for B
      { between: [false, true] }
    );
    this.hinge_c = new Hinge(
      this.node_b.circle.position,
      this.node_c.circle.position,
      SWAY_AMPLITUDE,
      SWAY_FREQUENCY,
      5 * PHASE_OFFSET
    );

    this.tree = new CoralTree(
      // Node A in diagram on paper
      new CoralNode(
        CirclePrimitive.from_two_points(new Point(-75, 600), new Point(0, 600)),
        [this.node_b]
      )
    );

    this.polyps = new Polyps();

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

    const clipped_polyps = new ClipPrimitive(
      this.coral_mask,
      this.polyps.render()
    );

    this.primitive = group(styled_stripes, colored_coral, clipped_polyps);
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

    this.polyps.update(time);
  }

  render() {
    return this.primitive;
  }
}

export const SWAYING_CORAL = new SwayingCoral();
