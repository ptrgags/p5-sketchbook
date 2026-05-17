import { StaticAnimation } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { ConformalPrimitive } from "../sketchlib/cga2d/ConfomalPrimitive.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { StyledTile } from "../sketchlib/cga2d/StyledTile.js";
import { Color } from "../sketchlib/Color.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import {
  compute_geometry,
  make_tiling,
  TileType,
} from "./hyperbolic_tilings.js";
import { OrbitTile } from "./OrbitTile.js";

const FOLDS_P = 7;
const FOLDS_Q = 4;

const GEOMETRY = compute_geometry(FOLDS_P, FOLDS_Q);
const GENERATORS = make_tiling(FOLDS_P, FOLDS_Q);
const ROTATIONS = GENERATORS.corner_rotation_group;
const REFLECTIONS = GENERATORS.reflection_group;

const FC = REFLECTIONS.circle_inversion;
const FY = REFLECTIONS.flip_y;
const RP = ROTATIONS.rotate_center;
const E2 = ROTATIONS.arc_elliptic;

const ROT_ITER = new PowerIterator(RP);
const ROTATE_SEVENFOLD = ROT_ITER.iterate(0, FOLDS_P - 1);
const ROOT_TILE = new CNode(ROTATE_SEVENFOLD, GEOMETRY.tile_edge).bake_tile();
const SMALLER = CVersor.dilation(0.9);

const ROOT_HEPTAGON = new StyledTile(
  SMALLER.transform(ROOT_TILE),
  new Style({
    stroke: new Oklch(0.7, 0.1, 50),
  }),
);
const HEPTAGON = E2.transform(ROOT_HEPTAGON);
const MOTIF = HEPTAGON;

const TO_ADJ = range(7)
  .toArray()
  .map((i) => {
    const r = ROTATE_SEVENFOLD.at(-i) ?? CVersor.IDENTITY;
    return FC.compose(r).compose(FY);
  });
const ORBIT_TILE = new OrbitTile(MOTIF, CVersor.IDENTITY, TO_ADJ);

/**
 *
 * @param {ConformalPrimitive[]} output
 * @param {OrbitTile} tile
 * @param {TileType} tile_type
 * @param {number} remaining_height
 */
function render_tile74(output, tile, tile_type, remaining_height) {
  output.push(tile.motif);
  if (remaining_height === 0) {
    return;
  }

  const start_index = tile_type === TileType.EDGE ? 2 : 3;
  //const remaining_indices = tile_type === TileType.EDGE ? [3, 4] : [4];
  const remaining_indices = [];

  render_tile74(
    output,
    tile.step(start_index),
    TileType.VERTEX,
    remaining_height - 1,
  );

  for (const index of remaining_indices) {
    render_tile74(
      output,
      tile.step(index),
      TileType.EDGE,
      remaining_height - 1,
    );
  }
}

/**
 *
 * @param {ConformalPrimitive} root_motif
 * @param {OrbitTile} first_tile
 * @param {number} max_height
 * @returns {CTile}
 */
function render_tiling74(root_motif, first_tile, max_height) {
  const output = [root_motif];

  ROTATE_SEVENFOLD.forEach((r) => {
    const edge_tile = first_tile.transform(r.versor);
    render_tile74(output, edge_tile, TileType.EDGE, max_height);

    const vertex_tile = edge_tile.step(6);
    render_tile74(output, vertex_tile, TileType.VERTEX, 1);
  });

  return new CTile(...output);
}

const TILE74 = render_tiling74(ROOT_HEPTAGON, ORBIT_TILE, 4);

const STYLE_BG = new Style({ stroke: Color.WHITE });
const BACKGROUND = new StyledTile([Cline.UNIT_CIRCLE], STYLE_BG);

const SCENE = new CTile(BACKGROUND, TILE74);
const TO_SCREEN = CVersor.to_screen(new Circle(new Point(250, 350), 250));

export const HYPERBOLIC_TILING_74 = new StaticAnimation(
  TO_SCREEN.transform(SCENE),
);
