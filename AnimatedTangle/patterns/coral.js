import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { CoralNode, CoralTree } from "../CoralTree.js";
import { AnimatedStripes } from "./stripes.js";
import { Hinge } from "../Hinge.js";
import { PALETTE_CORAL, PALETTE_SKY, Values } from "../theme_colors.js";
import { Polyp } from "./polyps.js";
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
import { Animated } from "../../sketchlib/animation/Animated.js";

const STYLE_CORAL = new Style({
  fill: PALETTE_CORAL[Values.Medium],
  stroke: PALETTE_CORAL[Values.Dark],
  width: 4,
});

const STYLE_STRIPES = new Style({
  stroke: PALETTE_SKY[Values.MedDark],
  width: 4,
});

const SWAY_AMPLITUDE = Math.PI / 12;
const SWAY_FREQUENCY = 0.25;
const PHASE_OFFSET = (2 * Math.PI) / 7;

const CODE_POINT_A = 65;
/**
 * Take an ASCII value and convert it to an index relative to 'A'
 * @param {string} letter A capital letter.
 * @returns {number} array Index of letter in ASCIIbetical order
 */
function letter_to_index(letter) {
  return letter.codePointAt(0) - CODE_POINT_A;
}

/**
 * @implements {Animated}
 */
class SwayingCoral {
  constructor() {
    // Unfortunately, to add the hinges, I need to create the tree
    // in a rather convoluted order

    // C -- hinges about B
    const node_c = new CoralNode(CIRCLE_C);
    // E -- hinges about D
    const node_e = new CoralNode(CIRCLE_E);
    // H -- hinges about G
    const node_h = new CoralNode(CIRCLE_H);
    // Both L and K hinge around J. They use the same anchor point and sway
    // at the same frequency so the shape doesn't distort in length, since
    // K is a parent for L
    const node_l = new CoralNode(CIRCLE_L);
    const node_k = new CoralNode(
      CIRCLE_K,
      [node_l],
      // Skip for K
      { right: true }
    );
    // N -- hinges about M
    const node_n = new CoralNode(CIRCLE_N);
    // P -- hinges about O
    const node_p = new CoralNode(CIRCLE_P);
    this.dynamic_nodes = [
      node_c,
      node_e,
      node_h,
      node_k,
      node_l,
      node_n,
      node_p,
    ];

    this.tree = new CoralTree(
      // Node A in diagram on paper
      new CoralNode(CIRCLE_A, [
        // B -- hinge for C
        new CoralNode(
          CIRCLE_B,
          [
            node_c,
            // D
            new CoralNode(
              CIRCLE_D,
              [
                node_e,
                // F
                new CoralNode(
                  CIRCLE_F,
                  [
                    // G -- serves as anchor for H
                    new CoralNode(
                      CIRCLE_G,
                      [node_h],
                      // skip for G
                      { right: false }
                    ),
                    // I
                    new CoralNode(
                      CIRCLE_I,
                      [new CoralNode(CIRCLE_J, [node_k])],
                      // skip for I
                      { left: true }
                    ),
                    // M
                    new CoralNode(CIRCLE_M, [node_n]),
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
            new CoralNode(CIRCLE_O, [node_p]),
          ],
          // skip for B
          { between: [false, true] }
        ),
      ])
    );

    // Make a set of animated stripes as a background
    this.stripes = new AnimatedStripes(
      new Point(150, 500),
      new Direction(-1, 2).normalize(),
      10,
      new Direction(550, 600)
    );
    const styled_stripes = style(this.stripes.primitive, STYLE_STRIPES);

    // Save a reference for modifying the group when the tree
    // refreshes
    const colored_coral = style(this.tree.render(), STYLE_CORAL);
    this.coral_slot = colored_coral.primitives;

    // For coral nodes that sway, we need some hinges to help calculate the
    // position over time
    this.hinges = [
      // Hinge for node C
      new Hinge(
        CIRCLE_B.position,
        CIRCLE_C.position,
        SWAY_AMPLITUDE,
        SWAY_FREQUENCY,
        5 * PHASE_OFFSET
      ),
      // Hinge for node E
      new Hinge(
        CIRCLE_D.position,
        CIRCLE_E.position,
        SWAY_AMPLITUDE,
        SWAY_FREQUENCY,
        4 * PHASE_OFFSET
      ),
      // Hinge for node H
      new Hinge(
        CIRCLE_G.position,
        CIRCLE_H.position,
        SWAY_AMPLITUDE,
        SWAY_FREQUENCY
      ),
      // Hinge for node k
      new Hinge(
        CIRCLE_J.position,
        CIRCLE_K.position,
        SWAY_AMPLITUDE,
        SWAY_FREQUENCY,
        PHASE_OFFSET
      ),
      // Hinge for node L
      new Hinge(
        CIRCLE_J.position,
        CIRCLE_L.position,
        SWAY_AMPLITUDE,
        SWAY_FREQUENCY,
        PHASE_OFFSET
      ),
      // Hinge for node N
      new Hinge(
        CIRCLE_M.position,
        CIRCLE_N.position,
        SWAY_AMPLITUDE,
        SWAY_FREQUENCY,
        2 * PHASE_OFFSET
      ),
      // Hinge for node P
      new Hinge(
        CIRCLE_O.position,
        CIRCLE_P.position,
        0.5 * SWAY_AMPLITUDE,
        SWAY_FREQUENCY,
        3 * PHASE_OFFSET
      ),
    ];
    this.polyps = ALL_CIRCLES.map((c) => new Polyp(c.position));

    this.dynamic_polyps = ["C", "E", "H", "K", "L", "N", "P"].map((c) => {
      const index = letter_to_index(c);
      return this.polyps[index];
    });

    const polyp_primitives = group(...this.polyps.map((x) => x.primitive));
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
      this.dynamic_polyps[i].update_position(hinge.position);
    });

    this.polyps.forEach((x) => x.update(time));

    // Re-draw the coral
    this.coral_slot.splice(0, Infinity, this.tree.render());
  }
}

export const SWAYING_CORAL = new SwayingCoral();
