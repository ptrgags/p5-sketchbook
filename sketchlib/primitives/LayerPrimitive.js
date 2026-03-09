import {
  PrimitiveCollectionStats,
  RenderStats,
} from "../perf/PrimitiveCollectionStats.js";
import { Style } from "../Style.js";
import { GroupPrimitive } from "./GroupPrimitive.js";
import { Primitive } from "./Primitive.js";
import { group, style } from "./shorthand.js";

/**
 * Interface for an object that contains several layers of primitives that
 * correspond to the layers of other instances
 * @interface RenderLayers
 */
export class RenderLayers {
  /**
   * Get an array of primitives to render layer-by-layer. in a LayerPrimitive
   * The array must have a fixed size set at construction time. The layers
   * are typically unstyled, as the LayerPrimitive will apply styling
   * @type {Primitive[]}
   */
  get layers() {
    throw new Error("not implemented");
  }
}

/**
 * often I have several objects on the screen each with several styled layers
 * e.g.
 *
 * X1 = A1, B1, C1
 * X2 = A2, B2, C2
 * ...
 * Xn = An, Bn, Cn
 *
 * Normally this would get rendered A1, B1, C1, A2, B2, C2, ..., An, Bn, Cn
 * but this is inefficient since it requires switching graphics settings
 * for every object/layer combination.
 *
 * It's better to order them like this so you only need to switch settings
 * once per layer:
 *
 * A1, A2, ..., An, B1, B2, ..., Bn, C1, C2, ...Cn
 *
 * This class helps create this render order
 *
 * @implements {Primitive}
 * @implements {PrimitiveCollectionStats}
 */
export class LayerPrimitive {
  /**
   * Constructor
   * @param {RenderLayers[]} instances Collection of objects with corresponding layers to render
   * @param {(undefined | Style | import("./GroupPrimitive.js").GroupSettings)[]} settings Array of settings. use undefined for a simmple group, Style for a styled group, or a settings object for more complex settings.
   */
  constructor(instances, settings) {
    // make sure everything has matching lengths
    if (!instances.every((x) => x.layers.length === settings.length)) {
      throw new Error("every instance must have the same length as settings");
    }

    /**
     * @type {Primitive[]}
     */
    this.groups = settings.map((x, i) => {
      const prims = instances.map((x) => x.layers[i]);

      // Depending on what settings were provided,
      if (x === undefined) {
        return group(...prims);
      } else if (x instanceof Style) {
        return style(prims, x);
      }
      return new GroupPrimitive(prims, x);
    });
  }

  draw(p) {
    this.groups.forEach((g) => g.draw(p));
  }

  /**
   * @type {RenderStats}
   */
  get render_stats() {
    const stats = {
      type: "layers",
      push_pop_count: 0,
      simple_prim_count: 0,
      children: [],
    };

    PrimitiveCollectionStats.aggregate(stats, ...this.groups);

    return stats;
  }
}
