import { Style } from "../Style.js";
import { StyleRuns } from "../styling/StyleRuns.js";
import { CEven } from "./CEven.js";
import { COdd } from "./COdd.js";
import { ConformalPrimitive } from "./ConfomalPrimitive.js";

/**
 * Like CTile, but the primitives can be styled
 * @implements {ConformalPrimitive}
 */
export class StyledTile {
  /**
   * Constructor
   * @param {ConformalPrimitive[]} children
   * @param {Style | Style[] | StyleRuns} styles If a single style, it will be applyed to everything. If a
   */
  constructor(children, styles) {
    this.children = children;

    /**
     * @type {Style | StyleRuns}
     */
    this.styles = undefined;
    if (Array.isArray(styles)) {
      this.styles = StyleRuns.from_styles(styles);
    } else {
      this.styles = styles;
    }
  }

  /**
   *
   * @param  {...ConformalPrimitive} children
   */
  regroup(...children) {
    this.children.splice(0, Infinity, ...children);
  }

  /**
   *
   * @param {COdd | CEven} versor
   * @returns {StyledTile}
   */
  transform(versor) {
    const children = this.children.map((x) => x.transform(versor));
    return new StyledTile(children, this.styles);
  }

  /**
   *
   * @param {import("p5")} p
   */
  draw(p) {
    StyleRuns.draw_styled(
      p,
      this.children.length,
      this.styles,
      (start, end) => {
        for (let i = start; i < end; i++) {
          this.children[i].draw(p);
        }
      },
    );
  }
}
