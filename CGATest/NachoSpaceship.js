import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { StyledTile } from "../sketchlib/cga2d/StyledTile.js";
import { Color } from "../sketchlib/Color.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Style } from "../sketchlib/Style.js";

const DIR_45 = Direction.from_angle(Math.PI / 4);
const DIR_135 = Direction.from_angle((3 * Math.PI) / 4);

const POINT_A = Point.ORIGIN;
const POINT_B = POINT_A.add(DIR_45.scale(0.5));
const POINT_C = POINT_A.add(DIR_135.scale(0.5));

const STYLE_SPACESHIP = new Style({
  stroke: Color.from_hex_code("#ffaf00"),
  width: 3,
});
const NACHO = new StyledTile(
  [
    ClineArc.from_segment(new LineSegment(POINT_A, POINT_B)),
    ClineArc.from_arc(
      new ArcPrimitive(
        Point.ORIGIN,
        0.5,
        new ArcAngles(Math.PI / 4, (3 * Math.PI) / 4),
      ),
    ),
    ClineArc.from_segment(new LineSegment(POINT_C, POINT_A)),
  ],
  STYLE_SPACESHIP,
);

/**
 *
 * @param {number} t
 * @returns {CVersor}
 */
function rotate_globe(t) {
  const angle = 2 * Math.PI * t;

  return CVersor.elliptic(Direction.DIR_Y.neg(), angle);
}

export class NachoSpaceship {
  /**
   * Constructor
   * @param {CVersor} to_screen
   */
  constructor(to_screen) {
    this.to_screen = to_screen;

    this.rotate_node = new CNode(CVersor.IDENTITY, NACHO);
    this.primitive = new CNode(to_screen, this.rotate_node);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const xform = rotate_globe(time);
    this.rotate_node.update_transforms(xform);
  }
}
