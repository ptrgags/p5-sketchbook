import { CVersor } from "./CVersor.js";

/**
 *
 * @param {CVersor} prefix
 * @param {CVersor[]} xforms
 * @param {number} depth
 * @returns {Generator<CVersor>}
 */
function* naive_dfs(prefix, xforms, depth) {
  if (depth === 0) {
    yield prefix;
    return;
  }

  for (const xform of xforms) {
    yield* naive_dfs(prefix.compose(xform), xforms, depth - 1);
  }
}

/**
 * Iterated Function System, as described in _Fractals Everywhere_ by Michael F. Barnsley
 * This is the most basic version that does not assume any properties
 * about the transformations.
 */
export class IFS {
  /**
   * Constructor
   * @param {CVersor[]} xforms
   */
  constructor(xforms) {
    this.xforms = xforms;
  }

  /**
   * Iterate up to a given depth, returning an xform for every leaf of the
   * DFS tree
   * @param {number} depth
   * @returns {CVersor[]}
   */
  iterate(depth) {
    return [...naive_dfs(CVersor.IDENTITY, this.xforms, depth)];
  }
}
