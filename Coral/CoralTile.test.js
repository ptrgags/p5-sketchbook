import { describe, it, expect } from "vitest";
import { Rect } from "./Rect.js";
import { CoralTile } from "./CoralTile.js";
import { Direction } from "../sketchlib/CardinalDirection.js";
import { FlagSet } from "../sketchlib/FlagSet.js";
import { ControlPoint } from "./ControlPoint.js";
import { Point } from "../pga2d/objects.js";

describe("CoralTile", () => {
  const QUAD = new Rect(0, 0, 200, 200);

  it("to_json serializes default tile", () => {
    const flags_right_up = new FlagSet(0b0011, Direction.COUNT);
    const tile = new CoralTile(QUAD, flags_right_up);

    const result = tile.to_json();

    const expected = {
      connections: 0b0011,
      control_points: [
        {
          position: [0.5, 0.25],
          tangent: [0.1, 0],
        },
        {
          position: [1, 0.75],
          tangent: [-0.1, -0],
        },
        {
          position: [0.25, 1],
          tangent: [-0, -0.1],
        },
        {
          position: [0.25, 0.5],
          tangent: [-0, -0.1],
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  it("parse_json with valid json parses tile", () => {
    const json_tile = {
      connections: 0b1111,
      control_points: [
        {
          position: [0.6, 0],
          tangent: [0.2, 0.2],
        },
        {
          position: [1, 0.6],
          tangent: [-0.2, 0.2],
        },
        {
          position: [0.4, 1],
          tangent: [-0.2, -0.2],
        },
        {
          position: [0, 0.4],
          tangent: [0.2, -0.2],
        },
      ],
    };

    const result = CoralTile.parse_json(json_tile, QUAD);

    const expected_control_points = [
      new ControlPoint(new Point(0.6, 0), Point.direction(0.2, 0.2)),
      new ControlPoint(new Point(1, 0.6), Point.direction(-0.2, 0.2)),
      new ControlPoint(new Point(0.4, 1), Point.direction(-0.2, -0.2)),
      new ControlPoint(new Point(0, 0.4), Point.direction(0.2, -0.2)),
    ];

    expect(result.quad).toBe(QUAD);
    expect(result.control_points).toEqual(expected_control_points);
  });
});
