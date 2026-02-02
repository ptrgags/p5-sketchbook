import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { Point } from "../../sketchlib/pga2d/Point.js";
import { Ease } from "../../sketchlib/Ease.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { PolygonPrimitive } from "../../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { group, style, xform } from "../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../sketchlib/primitives/Transform.js";
import { Style } from "../../sketchlib/Style.js";
import { Animated } from "../../sketchlib/animation/Animated.js";
import { LoopCurve } from "../../sketchlib/animation/LoopCurve.js";
import { ParamCurve } from "../../sketchlib/animation/ParamCurve.js";
import { Sequential } from "../../sketchlib/music/Timeline.js";
import { Rational } from "../../sketchlib/Rational.js";
import {
  PALETTE_CORAL,
  PALETTE_NAVY,
  PALETTE_ROCK,
  PALETTE_SKY,
  Values,
} from "../theme_colors.js";
import { AnimatedStripes } from "./stripes.js";

const STRIPE_CENTER = new Point(200, 650);
const STRIPE_SPACING = 60;
const STRIPE_DIRECTION = new Direction(-1, -1).normalize();
const STRIPE_DIMENSIONS = new Direction(350, 300);
const ANIMATED_STRIPES = new AnimatedStripes(
  STRIPE_CENTER,
  STRIPE_DIRECTION,
  STRIPE_SPACING,
  STRIPE_DIMENSIONS,
);

const STRIPE_STYLES = [
  new Style({
    stroke: PALETTE_SKY[Values.LIGHT],
    width: STRIPE_SPACING / 3,
  }),
  new Style({
    stroke: PALETTE_CORAL[Values.MED_DARK],
    width: STRIPE_SPACING / 3,
  }),
  new Style({
    stroke: PALETTE_SKY[Values.MED_DARK],
    width: STRIPE_SPACING / 3,
  }),
];

const XFORMS = [
  // First stripe doesn't need a transform, it's identity
  undefined,
  new Transform(STRIPE_DIRECTION.scale(STRIPE_SPACING / 3)),
  new Transform(STRIPE_DIRECTION.scale((2 * STRIPE_SPACING) / 3)),
];

const BASE_STRIPES = ANIMATED_STRIPES.primitive;

const BARBER_POLE = group(
  ...STRIPE_STYLES.map((style, i) => {
    return new GroupPrimitive(BASE_STRIPES, {
      transform: XFORMS[i],
      style,
    });
  }),
);

const DOOR_WIDTH = 50;
const DOOR_HEIGHT = 150;
// some of the offsets in the concept art are 25/2 pixels wide, which is
// halfway between pixels. So let's round to the nearest pixel for all
// coordinates
const QUARTER = Math.round(DOOR_WIDTH / 4);
const HALF = DOOR_WIDTH / 2;
const THREE_QUARTERS = Math.round((3 * DOOR_WIDTH) / 4);
const LOWER_DOOR = new PolygonPrimitive(
  [
    // bottom points on door
    new Point(0, DOOR_HEIGHT),
    new Point(DOOR_WIDTH, DOOR_HEIGHT),
    // square shapes that jut in and out
    new Point(DOOR_WIDTH, 0),
    new Point(THREE_QUARTERS, 0),
    new Point(THREE_QUARTERS, -QUARTER),
    new Point(HALF, -QUARTER),
    new Point(HALF, QUARTER),
    new Point(QUARTER, QUARTER),
    new Point(QUARTER, 0),
    new Point(0, 0),
  ],
  true,
);
const UPPER_DOOR = new PolygonPrimitive(
  [
    // top points on door
    new Point(50, -DOOR_HEIGHT),
    new Point(0, -DOOR_HEIGHT),
    // Same square shapes as for the lower door, but wound the other way
    new Point(0, 0),
    new Point(QUARTER, 0),
    new Point(QUARTER, QUARTER),
    new Point(HALF, QUARTER),
    new Point(HALF, -QUARTER),
    new Point(THREE_QUARTERS, -QUARTER),
    new Point(THREE_QUARTERS, 0),
    new Point(DOOR_WIDTH, 0),
  ],
  true,
);

const DURATION_OPEN = new Rational(1);
const LIFT_HEIGHT = 50;

const OPEN_AND_SHUT = LoopCurve.from_timeline(
  new Sequential(
    new ParamCurve(0, LIFT_HEIGHT, DURATION_OPEN, Ease.in_out_cubic),
    new ParamCurve(LIFT_HEIGHT, 0, DURATION_OPEN, Ease.in_out_cubic),
  ),
);

const STYLE_DOOR_BACKGROUND = new Style({
  stroke: PALETTE_NAVY[Values.DARK],
  fill: PALETTE_NAVY[Values.MEDIUM],
  width: 2,
});

const STYLE_DOOR = new Style({
  stroke: PALETTE_ROCK[Values.MED_DARK],
  fill: PALETTE_ROCK[Values.MED_LIGHT],
  width: 2,
});

/**
 * @implements {Animated}
 */
class Door {
  /**
   * Constructor
   * @param {Direction} shut_offset Shut offset
   * @param {number} shut_time Time when the door should shut
   */
  constructor(shut_offset, shut_time) {
    this.shut_offset = shut_offset;
    this.shut_time = shut_time;
    this.lower_xform = new Transform(shut_offset);
    this.upper_xform = new Transform(shut_offset);

    const background = new RectPrimitive(
      Point.ORIGIN.add(this.shut_offset).add(
        Direction.DIR_Y.scale(-DOOR_HEIGHT),
      ),
      new Direction(DOOR_WIDTH, 2 * DOOR_HEIGHT),
    );

    this.primitive = group(
      style(background, STYLE_DOOR_BACKGROUND),
      new GroupPrimitive(LOWER_DOOR, {
        transform: this.lower_xform,
        style: STYLE_DOOR,
      }),
      new GroupPrimitive(UPPER_DOOR, {
        transform: this.upper_xform,
        style: STYLE_DOOR,
      }),
    );
  }

  update(time) {
    const height = OPEN_AND_SHUT.value(time - this.shut_time);
    this.lower_xform.translation = this.shut_offset.add(
      Direction.DIR_Y.scale(height),
    );
    this.upper_xform.translation = this.shut_offset.add(
      Direction.DIR_Y.scale(-height),
    );
  }
}

/**
 * @implements {Animated}
 */
class Doors {
  constructor() {
    this.doors = [
      new Door(new Direction(0, 700), 0),
      new Door(new Direction(75, 675), 0.5),
      new Door(new Direction(150, 650), 1.0),
      new Door(new Direction(225, 675), 1.5),
    ];

    this.primitive = group(BARBER_POLE, ...this.doors.map((x) => x.primitive));
  }

  update(time) {
    ANIMATED_STRIPES.update(time);
    this.doors.forEach((x) => x.update(time));
  }
}

export const DOORS = new Doors();
