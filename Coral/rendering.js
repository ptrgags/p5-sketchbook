import { Point } from "../pga2d/objects.js";
import { LinePrimitive, RectPrimitive } from "../sketchlib/primitives.js";
import { GridDirection } from "../sketchlib/GridDiection.js";
import { Rect } from "./Rect.js";
import { CoralTile } from "./CoralTile.js";

/**
 * Render the boundaries and cross-bars of a quad to uncolored geometry
 *
 * @param {Rect} rect quad boundary
 * @returns {(RectPrimitive|LinePrimitive)[]} a list of computed primitives
 */
export function render_quad(rect) {
  const { x, y } = rect.position;
  const { x: w, y: h } = rect.dimensions;
  return [
    // Boundary
    new RectPrimitive(rect.position, rect.dimensions),
    // Crossbars
    new LinePrimitive(Point.point(x, y + h / 2), Point.point(x + w, y + h / 2)),
    new LinePrimitive(Point.point(x + w / 2, y), Point.point(x + w / 2, y + h)),
  ];
}

const CONNECT_POINTS = [
  Point.point(1.0, 0.5),
  Point.point(0.5, 1.0),
  Point.point(0.0, 0.5),
  Point.point(0.5, 0.0),
];

/**
 * Visualize the connections between grid cells by drawing lines connecting
 * neighboring tiles that are connected.
 *
 * @param {CoralTile} tile The tile to render
 * @returns {LinePrimitive[]} The lines representing the connections between tiles
 */
export function render_tile_connections(tile) {
  const quad = tile.quad;
  const flags = tile.connection_flags;
  const center = quad.uv_to_world(Point.point(0.5, 0.5));
  const primitives = [];
  for (let i = 0; i < GridDirection.COUNT; i++) {
    if (!flags.has_flag(i)) {
      continue;
    }

    const connect_point = quad.uv_to_world(CONNECT_POINTS[i]);

    primitives.push(new LinePrimitive(center, connect_point));
  }

  return primitives;
}

const WALLS = [
  [Point.point(1, 0), Point.point(1, 1)],
  [Point.point(1, 1), Point.point(0, 1)],
  [Point.point(0, 1), Point.point(0, 0)],
  [Point.point(0, 0), Point.point(1, 0)],
];

/**
 * Render the walls of a maze (walls on sides of grid cells with no connections)
 *
 * @param {CoralTile} tile The tile to render
 * @returns {LinePrimitive} The lines representing wall segments.
 */
export function render_tile_walls(tile) {
  const quad = tile.quad;
  const flags = tile.connection_flags;
  const primitives = [];
  for (let i = 0; i < GridDirection.COUNT; i++) {
    if (flags.has_flag(i)) {
      continue;
    }

    const [start, end] = WALLS[i];
    primitives.push(
      new LinePrimitive(quad.uv_to_world(start), quad.uv_to_world(end))
    );
  }
  return primitives;
}
