import { CEven } from "../sketchlib/cga2d/CEven.js";
import { COdd } from "../sketchlib/cga2d/COdd.js";
import { ConformalPrimitive } from "../sketchlib/cga2d/ConfomalPrimitive.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";

/**
 * @implements {ConformalPrimitive}
 */
export class OrbitTile {
  /**
   * Constructor
   * @param {ConformalPrimitive} motif Motif to draw
   * @param {CVersor} xform Transformation that serves as an identifier for this tile
   * @param {CVersor[]} to_adj Transformations to adjacent tiles
   */
  constructor(motif, xform, to_adj) {
    this.motif = motif;
    this.xform = xform;
    this.to_adj = to_adj;
  }

  /**
   * Take a step into an adjacent tile
   * @param {number} index index
   * @returns {OrbitTile}
   */
  step(index) {
    const xform = this.to_adj[index];
    if (!xform) {
      throw new Error("index out of range");
    }
    return this.transform(xform.versor);
  }

  /**
   *
   * @param {COdd | CEven} versor
   * @returns
   */
  transform(versor) {
    return new OrbitTile(
      this.motif.transform(versor),
      new CVersor(versor.gp(this.xform.versor)),
      this.to_adj.map((x) => new CVersor(versor.unit_sandwich(x.versor))),
    );
  }

  draw(p) {
    this.motif.draw(p);
  }
}
