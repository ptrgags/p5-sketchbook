import { Point } from "../pga2d/objects.js";
import {
  Constraint,
  ConstraintJoint,
  ConstraintTree,
} from "../sketchlib/ConstraintTree.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";
import {
  BeziergonPrimitive,
  GroupPrimitive,
  PointPrimitive,
  PolygonPrimitive,
  VectorPrimitive,
} from "../sketchlib/primitives.js";
import { Color, Style } from "../sketchlib/Style.js";

const RADIUS_THIN = 20;
const RADIUS_MED = 30;
const RADIUS_THICK = 60;

// Tree of a single node
const DOT = new ConstraintTree(
  new ConstraintJoint(
    Point.point(WIDTH / 2 - WIDTH / 4, HEIGHT / 2),
    Point.DIR_Y.neg(),
    RADIUS_MED
  )
);

// Tree of a single node
const CHAIN_HEAD = Point.point(WIDTH / 2 + WIDTH / 4, HEIGHT / 2 - WIDTH / 4);
const CHAIN_OFFSET = Point.DIR_Y.scale(100);
const CHAIN_FOLLOW = new Constraint(100, 100);
const CHAIN_ANGLE = new Constraint(-Math.PI / 4, Math.PI / 4);
const CHAIN = new ConstraintTree(
  new ConstraintJoint(
    CHAIN_HEAD,
    Point.DIR_Y.neg(),
    RADIUS_MED,
    undefined,
    undefined,
    [
      new ConstraintJoint(
        CHAIN_HEAD.add(CHAIN_OFFSET),
        Point.DIR_Y.neg(),
        RADIUS_THICK,
        CHAIN_FOLLOW,
        CHAIN_ANGLE,
        [
          new ConstraintJoint(
            CHAIN_HEAD.add(CHAIN_OFFSET.scale(2)),
            Point.DIR_Y.neg(),
            RADIUS_THIN,
            CHAIN_FOLLOW,
            CHAIN_ANGLE
          ),
        ]
      ),
    ]
  )
);

const COLOR_CORAL = new Color(255, 127, 80);
const STYLE_OUTLINE = new Style().with_stroke(COLOR_CORAL).with_width(4);

const STYLE_POINTS = new Style().with_fill(new Color(255, 255, 255));

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );
  };

  p.draw = () => {
    p.background(0);

    const dot_outline_vertices = DOT.get_outline_vertices();
    const dot_beziergon =
      BeziergonPrimitive.interpolate_points(dot_outline_vertices);

    const chain_outline_vertices = CHAIN.get_outline_vertices();
    const chain_beziergon = BeziergonPrimitive.interpolate_points(
      chain_outline_vertices
    );

    const outlines = new GroupPrimitive(
      [dot_beziergon, chain_beziergon],
      STYLE_OUTLINE
    );

    const points = [...dot_outline_vertices, ...chain_outline_vertices].map(
      (x) => new PointPrimitive(x)
    );
    const point_group = new GroupPrimitive(points, STYLE_POINTS);

    // Render as vectors
    const chain_spine_vectors = CHAIN.get_tree_edges().map(
      (x) => new VectorPrimitive(...x)
    );

    const spines = new GroupPrimitive(chain_spine_vectors, STYLE_OUTLINE);

    const scene = new GroupPrimitive([outlines, spines, point_group]);
    draw_primitive(p, scene);
  };
};
