import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Ease } from "../../../sketchlib/Ease.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { PolygonPrimitive } from "../../../sketchlib/primitives/PolygonPrimitive.js";
import { group, xform } from "../../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../../sketchlib/primitives/Transform.js";
import { Style } from "../../../sketchlib/Style.js";
import { LoopCurve } from "../../lablib/animation/LoopCurve.js";
import { ParamCurve } from "../../lablib/animation/ParamCurve.js";
import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";
import { PALETTE_CORAL, PALETTE_SKY, Values } from "../theme_colors.js";
import { AnimatedStripes } from "./stripes.js";

const STRIPE_CENTER = new Point(200, 650);
const STRIPE_SPACING = 60;
const STRIPE_DIRECTION = new Direction(-1, -1).normalize();
const STRIPE_DIMENSIONS = new Direction(350, 300);
const ANIMATED_STRIPES = new AnimatedStripes(
  STRIPE_CENTER,
  STRIPE_DIRECTION,
  STRIPE_SPACING,
  STRIPE_DIMENSIONS
);

const STRIPE_STYLES = [
  new Style({
    stroke: PALETTE_SKY[Values.Light].to_srgb(),
    width: STRIPE_SPACING / 3,
  }),
  new Style({
    stroke: PALETTE_CORAL[Values.MedDark].to_srgb(),
    width: STRIPE_SPACING / 3,
  }),
  new Style({
    stroke: PALETTE_SKY[Values.MedDark].to_srgb(),
    width: STRIPE_SPACING / 3,
  }),
];

const XFORMS = [
  // First stripe doesn't need a transform, it's identity
  undefined,
  new Transform(STRIPE_DIRECTION.scale(STRIPE_SPACING / 3)),
  new Transform(STRIPE_DIRECTION.scale((2 * STRIPE_SPACING) / 3)),
];

const BASE_STRIPES = ANIMATED_STRIPES.render();

const BARBER_POLE = group(
  ...STRIPE_STYLES.map((style, i) => {
    return new GroupPrimitive(BASE_STRIPES, {
      transform: XFORMS[i],
      style,
    });
  })
);

const DOOR_HEIGHT = 150;
const LOWER_DOOR = new PolygonPrimitive(
  [
    // bottom points on door
    new Point(0, DOOR_HEIGHT),
    new Point(50, DOOR_HEIGHT),
    // square shapes that jut in and out
    new Point(50, 0),
    new Point(75 / 2, 0),
    new Point(75 / 2, -25 / 2),
    new Point(25, -25 / 2),
    new Point(25, 25 / 2),
    new Point(25 / 2, 25 / 2),
    new Point(25 / 2, 0),
    new Point(0, 0),
  ],
  true
);
const UPPER_DOOR = new PolygonPrimitive(
  [
    // top points on door
    new Point(50, -DOOR_HEIGHT),
    new Point(0, -DOOR_HEIGHT),
    // Same square shapes as for the lower door, but wound the other way
    new Point(0, 0),
    new Point(25 / 2, 0),
    new Point(25 / 2, 25 / 2),
    new Point(25, 25 / 2),
    new Point(25, -25 / 2),
    new Point(75 / 2, -25 / 2),
    new Point(75 / 2, 0),
    new Point(50, 0),
  ],
  true
);

const DURATION_OPEN = new Rational(1);
const LIFT_HEIGHT = 50;

const OPEN_AND_SHUT = LoopCurve.from_timeline(
  new Sequential(
    new ParamCurve(0, LIFT_HEIGHT, DURATION_OPEN, Ease.in_out_cubic),
    new ParamCurve(LIFT_HEIGHT, 0, DURATION_OPEN, Ease.in_out_cubic)
  )
);

class Door {
  /**
   * Constructor
   * @param {Direction} shut_offset Shut offset
   * @param {number} shut_time Time when the door should shut
   */
  constructor(shut_offset, shut_time) {
    this.shut_point = shut_offset;
    this.shut_time = shut_time;
    this.lower_xform = new Transform(shut_offset);
    this.upper_xform = new Transform(shut_offset);

    this.primitive = group(
      xform(LOWER_DOOR, this.lower_xform),
      xform(UPPER_DOOR, this.upper_xform)
    );
  }

  update(time) {
    const height = OPEN_AND_SHUT.value(time - this.shut_time);
    this.lower_xform.translation = this.shut_point.add(
      Direction.DIR_Y.scale(height)
    );
    this.upper_xform.translation = this.shut_point.add(
      Direction.DIR_Y.scale(-height)
    );
  }

  render() {
    return this.primitive;
  }
}

class Doors {
  constructor() {
    this.doors = [
      new Door(new Direction(0, 700), 0),
      new Door(new Direction(75, 675), 0.5),
      new Door(new Direction(150, 650), 1.0),
      new Door(new Direction(225, 675), 1.5),
    ];

    this.primitive = group(BARBER_POLE, ...this.doors.map((x) => x.render()));
  }

  update(time) {
    ANIMATED_STRIPES.update(time);
    this.doors.forEach((x) => x.update(time));
  }

  render() {
    return this.primitive;
  }
}

export const DOORS = new Doors();
