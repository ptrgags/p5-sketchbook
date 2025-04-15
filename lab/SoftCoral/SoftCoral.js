import { Point } from "../../pga2d/objects.js";
import {
  Constraint,
  ConstraintJoint,
  ConstraintTree,
} from "../../sketchlib/ConstraintTree.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import {
  BeziergonPrimitive,
  GroupPrimitive,
  PointPrimitive,
  VectorPrimitive,
} from "../../sketchlib/primitives.js";
import { Color, Style } from "../../sketchlib/Style.js";

const RADIUS_THIN = 20;
const RADIUS_MED = 40;
const RADIUS_THICK = 80;

// Tree of a single node
const UP = Point.DIR_Y.neg();
const DOT = new ConstraintTree(
  new ConstraintJoint(
    Point.point(WIDTH / 2 - WIDTH / 4, HEIGHT / 2),
    UP,
    RADIUS_MED
  )
);

// Tree of a single node
const CHAIN_HEAD = Point.point(WIDTH / 2 + WIDTH / 4, HEIGHT / 2 - WIDTH / 4);
const CHAIN_OFFSET = Point.DIR_Y.scale(100);
const CHAIN_FOLLOW = new Constraint(100, 100);
const CHAIN_ANGLE = new Constraint(-Math.PI / 4, Math.PI / 4);
const CHAIN = new ConstraintTree(
  new ConstraintJoint(CHAIN_HEAD, UP, RADIUS_MED, undefined, undefined, [
    new ConstraintJoint(
      CHAIN_HEAD.add(CHAIN_OFFSET),
      UP,
      RADIUS_THIN,
      CHAIN_FOLLOW,
      CHAIN_ANGLE,
      [
        new ConstraintJoint(
          CHAIN_HEAD.add(CHAIN_OFFSET.scale(2)),
          UP,
          RADIUS_THICK,
          CHAIN_FOLLOW,
          CHAIN_ANGLE
        ),
      ]
    ),
  ])
);

const TREE_HEAD = Point.point(WIDTH / 2, HEIGHT / 2);
const ANGLE_LEFT = new Constraint(-Math.PI / 4, 0);
const ANGLE_RIGHT = new Constraint(0, Math.PI);
const BRANCH_LENGTH = 50;
const TREE = new ConstraintTree(
  new ConstraintJoint(TREE_HEAD, UP, RADIUS_MED, undefined, undefined, [
    new ConstraintJoint(
      TREE_HEAD.add(CHAIN_OFFSET),
      UP,
      RADIUS_THIN,
      CHAIN_FOLLOW,
      CHAIN_ANGLE,
      [
        new ConstraintJoint(
          TREE_HEAD.add(CHAIN_OFFSET).add(
            Point.direction(-BRANCH_LENGTH, BRANCH_LENGTH)
          ),
          Point.direction(1, -1).normalize(),
          RADIUS_MED,
          CHAIN_FOLLOW,
          ANGLE_LEFT
        ),
        new ConstraintJoint(
          TREE_HEAD.add(CHAIN_OFFSET).add(
            Point.direction(BRANCH_LENGTH, BRANCH_LENGTH)
          ),
          Point.direction(-1, -1).normalize(),
          RADIUS_THIN,
          CHAIN_FOLLOW,
          ANGLE_RIGHT,
          [
            new ConstraintJoint(
              TREE_HEAD.add(CHAIN_OFFSET).add(
                Point.direction(BRANCH_LENGTH, BRANCH_LENGTH + 100)
              ),
              UP,
              RADIUS_MED,
              CHAIN_FOLLOW,
              CHAIN_ANGLE
            ),
          ]
        ),
      ]
    ),
  ])
);

const COLOR_CORAL = new Color(255, 127, 80);
const STYLE_OUTLINE = new Style({ stroke: COLOR_CORAL, width: 4 });

const STYLE_POINTS = Style.DEFAULT_STROKE_FILL;
const STYLE_SPINE = Style.DEFAULT_STROKE;

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

    const tree_vertices = TREE.get_outline_vertices();
    const tree_beziergon = BeziergonPrimitive.interpolate_points(tree_vertices);

    const outlines = new GroupPrimitive(
      [dot_beziergon, chain_beziergon, tree_beziergon],
      STYLE_OUTLINE
    );

    const points = [
      ...dot_outline_vertices,
      ...chain_outline_vertices,
      ...tree_vertices,
    ].map((x) => new PointPrimitive(x));
    const point_group = new GroupPrimitive(points, STYLE_POINTS);

    // Render as vectors
    const chain_spine_vectors = CHAIN.get_tree_edges().map(
      (x) => new VectorPrimitive(...x)
    );

    const tree_spine_vectors = TREE.get_tree_edges().map(
      (x) => new VectorPrimitive(...x)
    );

    const spines = new GroupPrimitive(
      [...chain_spine_vectors, ...tree_spine_vectors],
      STYLE_SPINE
    );

    const scene = new GroupPrimitive([outlines, spines, point_group]);
    draw_primitive(p, scene);
  };
};
