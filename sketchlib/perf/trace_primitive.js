import { Primitive } from "../primitives/Primitive.js";
import {
  PrimitiveCollectionStats,
  RenderStats,
} from "./PrimitiveCollectionStats.js";

/**
 * Trace
 * @param {Primitive} primitive
 * @returns {string | RenderStats}
 */
export function trace_primitive(primitive) {
  if (PrimitiveCollectionStats.has_stats(primitive)) {
    return primitive.render_stats;
  }

  return primitive.constructor.name;
}
