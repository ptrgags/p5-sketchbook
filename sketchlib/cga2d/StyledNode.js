import { Style } from "../Style.js";
import { StyleRuns } from "../styling/StyleRuns.js";
import { CEven } from "./CEven.js";
import { COdd } from "./COdd.js";
import { ConformalPrimitive } from "./ConfomalPrimitive.js";
import { CVersor } from "./CVersor.js";
import { StyledTile } from "./StyledTile.js";

/**
 * Styled version of CNode
 * @implements {ConformalPrimitive}
 */
export class StyledNode {
  /**
   * Constructor
   * @param {CVersor | CVersor[]} transforms
   * @param {Style | Style[] | StyleRuns} styles
   * @param {ConformalPrimitive} primitive
   */
  constructor(transforms, styles, primitive) {
    this.transforms = transforms instanceof CVersor ? [transforms] : transforms;

    /**
     * @type {Style | StyleRuns}
     */
    this.styles = Array.isArray(styles)
      ? StyleRuns.from_styles(styles)
      : styles;

    this.primitive = primitive;
  }

  /**
   * Swap out the transformations
   * @param  {...CVersor} transforms New transformations
   */
  update_transforms(...transforms) {
    this.transforms.splice(0, Infinity, ...transforms);
  }

  /**
   *
   * @param {COdd | CEven} versor
   * @returns {StyledNode}
   */
  transform(versor) {
    const transforms = this.transforms.map((x) => {
      const v = versor.gp(x.versor);
      return new CVersor(v);
    });
    return new StyledNode(transforms, this.styles, this.primitive);
  }

  /**
   * Bake the transformations, and wrap in a
   * StyledTile
   * @returns {StyledTile}
   */
  bake_tile() {
    const primitives = this.transforms.map((x) => x.transform(this.primitive));
    return new StyledTile(primitives, this.styles);
  }

  draw(p) {
    StyleRuns.draw_styled(
      p,
      this.transforms.length,
      this.styles,
      (start, end) => {
        for (let i = start; i < end; i++) {
          const transformed = this.transforms[i].transform(this.primitive);
          transformed.draw(p);
        }
      },
    );
  }
}
