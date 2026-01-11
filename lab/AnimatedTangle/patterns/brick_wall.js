import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Mask } from "../../../sketchlib/primitives/ClipMask.js";
import { ClipPrimitive } from "../../../sketchlib/primitives/ClipPrimitive.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { RectPrimitive } from "../../../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../../sketchlib/primitives/Transform.js";
import { Style } from "../../../sketchlib/Style.js";
import { Tween } from "../../../sketchlib/Tween.js";
import { Animated } from "../../lablib/animation/Animated.js";
import { LoopCurve } from "../../lablib/animation/LoopCurve.js";
import { ParamCurve } from "../../lablib/animation/ParamCurve.js";
import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";
import { PALETTE_CORAL, PALETTE_ROCK, Values } from "../theme_colors.js";
import { make_stripes } from "./stripes.js";

const FALL_DURATION = 1;
const HIT_TIMES = [
  // First layer hits on quarter notes (there are two bricks)
  0,
  1 / 2,
  // Second layer hits on quarter note triplets (there are three bricks, although the ones on the end are slightly out-of-frame)
  1,
  1 + 1 / 3,
  1 + 2 / 3,
  // Third layer hits on quarter notes
  2,
  2 + 1 / 2,
  // Fourth layer hits on quarter note triplets
  3,
  3 + 1 / 3,
  3 + 2 / 3,
];

const PANEL_CORNER = new Point(300, 300);
const PANEL_DIMENSIONS = new Direction(200, 200);
const BRICK_DIMENSIONS = PANEL_DIMENSIONS.mul_components(
  new Direction(0.5, 0.25)
);

const STYLE_BACKGROUND = new Style({
  fill: PALETTE_CORAL[Values.MedDark].to_srgb(),
});
const BRICK_BACKGROUND = style(
  new RectPrimitive(PANEL_CORNER, PANEL_DIMENSIONS),
  STYLE_BACKGROUND
);

const STRIPE_SPACING = 20;

const STYLE_STRIPES = new Style({
  stroke: PALETTE_CORAL[Values.Dark].to_srgb(),
  width: STRIPE_SPACING / 2,
});
const BRICK_STRIPES = style(
  make_stripes(
    new Point(400, 400),
    new Direction(1, -1).normalize(),
    STRIPE_SPACING,
    new Direction(200 * Math.SQRT2, 200 * Math.SQRT2),
    0
  ),
  STYLE_STRIPES
);
const BRICK_PATTERN = group(BRICK_BACKGROUND, BRICK_STRIPES);

const FALL_LENGTH = 300;

/**
 * Single falling brick
 * @implements {Animated}
 */
class Brick {
  /**
   * Constructor
   * @param {Point} position Point where the position will hit
   * @param {number} hit_time The time when the brick should hit the bottom of its motion
   */
  constructor(position, hit_time) {
    this.hit_position = position;

    // Tween between above the panel and the hit position
    this.tween = Tween.scalar(
      -FALL_LENGTH,
      0,
      hit_time - FALL_DURATION,
      FALL_DURATION
    );

    // The brick is an unstyled rectangle. BrickWall will use this primitive
    // both for a drop shadow and a clip mask, hence the leaving it unstyled
    this.primitive = new RectPrimitive(position, BRICK_DIMENSIONS);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    this.height = this.tween.get_value(time);
    this.primitive.position = this.hit_position.add(
      Direction.DIR_Y.scale(this.height)
    );
  }
}

// Brick offsets in multiples of BRICK_DIMENSIONS
const BRICK_OFFSETS = [
  new Direction(1, 3),
  new Direction(0, 3),
  new Direction(1.5, 2),
  new Direction(0.5, 2),
  new Direction(-0.5, 2),
  new Direction(1, 1),
  new Direction(0, 1),
  new Direction(1.5, 0),
  new Direction(0.5, 0),
  new Direction(-0.5, 0),
];

const STYLE_DROP_SHADOW = new Style({
  fill: PALETTE_ROCK[Values.Dark].to_srgb(),
});
const DROP_SHADOW_OFFSET = new Direction(25, 25);

const DURATION_FALL = new Rational(6);
const DURATION_LIFT = new Rational(3);

// Fall at a regular speed, then speed up when undoing the animation
const CURVE_TIMING = LoopCurve.from_timeline(
  new Sequential(
    new ParamCurve(-FALL_DURATION, 4 + FALL_DURATION, DURATION_FALL),
    new ParamCurve(4 + FALL_DURATION, -FALL_DURATION, DURATION_LIFT)
  )
);

/**
 * @implements {Animated}
 */
class BrickWall {
  constructor() {
    this.bricks = BRICK_OFFSETS.map((offset, i) => {
      const position = PANEL_CORNER.add(
        BRICK_DIMENSIONS.mul_components(offset)
      );
      return new Brick(position, HIT_TIMES[i]);
    });

    // The Bricks will update their positions in place in update()
    // BrickWall groups them together and composites the layers:
    //
    // ---TOP---
    // bricks used as a clipping mask
    //     - parts of the striped brick pattern are shown through the clipping path
    // drop shadow (bricks offset down and right a bit)
    // ---BOTTOM---
    const brick_shape = group(...this.bricks.map((x) => x.primitive));
    const drop_shadow = new GroupPrimitive(brick_shape, {
      transform: new Transform(DROP_SHADOW_OFFSET),
      style: STYLE_DROP_SHADOW,
    });
    const striped_bricks = new ClipPrimitive(
      new Mask(brick_shape),
      BRICK_PATTERN
    );

    this.primitive = group(drop_shadow, striped_bricks);
  }

  /**
   *
   * @param {number} time Animation time
   */
  update(time) {
    // Apply a curve to adjust the playback speed and loop the animation.
    const brick_t = CURVE_TIMING.value(time);

    // The warped time value is used to make the bricks fall/lift over time
    this.bricks.forEach((x) => x.update(brick_t));
  }
}

export const BRICKS = new BrickWall();
