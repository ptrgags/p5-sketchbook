import { Point } from "../../pga2d/objects.js";
import { ArcAngles } from "../../sketchlib/ArcAngles.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/p5_helpers/draw_primitive.js";
import {
  ArcPrimitive,
  CirclePrimitive,
  PolygonPrimitive,
} from "../../sketchlib/rendering/primitives.js";
import { group, style } from "../../sketchlib/rendering/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { Tween } from "../../sketchlib/Tween.js";
import { RobotCommand } from "./RobotCommand.js";

const QUARTER_ARC = new ArcAngles(-Math.PI / 4, Math.PI / 4);
const arc_primitive = new ArcPrimitive(
  Point.point(WIDTH / 2, HEIGHT / 2),
  100,
  QUARTER_ARC
);
const GREY_LINES = new Style({
  stroke: Color.from_hex_code("#333333"),
  width: 4,
});
const RED_LINES = new Style({
  stroke: Color.RED,
  width: 4,
});

const BACKGROUND_LAYER = style(arc_primitive, GREY_LINES);
const ANIMATION = Tween.scalar(-Math.PI / 4, (2 * Math.PI) / 3, 100, 500);

const SAMPLE_PATH = [
  RobotCommand.LEFT_TURN,
  RobotCommand.LEFT_TURN,
  RobotCommand.RIGHT_TURN,
  RobotCommand.LEFT_TURN,
  RobotCommand.RIGHT_TURN,
];

let current = RobotCommand.IDENTITY;
const START_POINT = Point.ORIGIN.add(SCREEN_CENTER);
const STEP_LENGTH = 100;
const PATH = [START_POINT];
for (const [i, command] of SAMPLE_PATH.entries()) {
  current = RobotCommand.compose(command, current);
  const local_offset = command.offset;
  const global_offset = current.offset;

  // TODO: compute the arc that corresponds to the local offset but scaled up
  // to world space

  const point = START_POINT.add(global_offset.scale(STEP_LENGTH));
  PATH.push(point);
}

const POLY = new PolygonPrimitive(PATH);
const POLY_LAYER = style(POLY, RED_LINES);

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

    draw_primitive(p, BACKGROUND_LAYER);

    const current_angle = ANIMATION.get_value(p.frameCount);
    const current_arc = new ArcPrimitive(
      SCREEN_CENTER,
      100,
      new ArcAngles(-Math.PI / 4, current_angle)
    );
    const dynamic_layer = style(current_arc, RED_LINES);
    //draw_primitive(p, dynamic_layer);

    draw_primitive(p, POLY_LAYER);
  };
};
