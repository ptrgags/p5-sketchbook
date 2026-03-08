import { ClipMask, Mask } from "../primitives/ClipMask.js";
import { ClipPrimitive } from "../primitives/ClipPrimitive.js";
import { GroupPrimitive } from "../primitives/GroupPrimitive.js";
import { Primitive } from "../primitives/Primitive.js";
import { VectorTangle } from "../primitives/VectorTangle.js";

/**
 *
 * @param {GroupPrimitive} group
 * @returns {object}
 */
function trace_group(group) {
  const has_style = group.style !== undefined;
  const has_text_style = group.text_style !== undefined;
  const has_transform = group.transform !== undefined;

  let total_push_pop = 1;
  let total_prims = 0;
  const children = [];
  for (const child of group.primitives) {
    const trace = trace_primitive(child);
    total_push_pop += trace.total_push_pop ?? 0;
    total_prims += trace.total_prims ?? 1;
    children.push(trace);
  }

  return {
    type: "group",
    has_style,
    has_text_style,
    has_transform,
    total_push_pop,
    total_prims,
    children: children,
  };
}

/**
 *
 * @param {ClipMask} mask
 * @returns {object}
 */
function trace_mask(mask) {
  if (mask instanceof Mask) {
    const children = [];
    let total_push_pop = 0;
    let total_prims = 0;
    for (const child of mask.primitives) {
      const trace = trace_primitive(child);
      total_push_pop += trace.total_push_pop ?? 0;
      total_prims += trace.total_prims ?? 1;
      children.push(trace);
    }

    return {
      mask_type: mask.constructor.name,
      total_push_pop,
      total_prims,
      children,
    };
  }

  return {
    mask_type: mask.constructor.name,
  };
}

/**
 *
 * @param {ClipPrimitive} clip_prim
 * @returns {object}
 */
function trace_clip(clip_prim) {
  const child = trace_primitive(clip_prim.primitive);
  const mask = trace_mask(clip_prim.mask);

  const total_push_pop =
    1 + (child.total_push_pop ?? 0) + (mask.total_push_pop ?? 0);
  const total_prims = (child.total_prims ?? 1) + (mask.total_prims ?? 1);
  return {
    type: "clip",
    total_push_pop,
    total_prims,
    child,
    mask,
  };
}

/**
 *
 * @param {VectorTangle} tangle
 * @returns {object}
 */
function trace_vector_tangle(tangle) {
  let total_push_pop = 0;
  let total_prims = 0;

  let decoration;
  if (tangle.decoration) {
    decoration = trace_primitive(tangle.decoration);
    total_push_pop += decoration.total_push_pop ?? 0;
    total_prims = decoration.total_prims ?? 1;
  }

  const panels = [];

  for (const [mask, primitive] of tangle.subdivisions) {
    const child = trace_primitive(primitive);
    const panel_push_pop = child.total_push_pop ?? 0;
    const panel_prims = child.total_prims ?? 1;
    total_push_pop += 1 + panel_push_pop;
    total_prims += panel_prims;
    panels.push({
      clip_type: mask.constructor.name,
      total_push_pop: panel_push_pop,
      total_prims: panel_prims,
      child,
    });
  }

  return {
    type: "vector-tangle",
    total_push_pop,
    total_prims,
    decoration,
    panels,
  };
}

/**
 *
 * @param {Primitive} primitive
 * @returns {object}
 */
export function trace_primitive(primitive) {
  if (primitive instanceof GroupPrimitive) {
    return trace_group(primitive);
  } else if (primitive instanceof ClipPrimitive) {
    return trace_clip(primitive);
  } else if (primitive instanceof VectorTangle) {
    return trace_vector_tangle(primitive);
  }

  return primitive.constructor.name;
}
