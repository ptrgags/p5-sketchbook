import { describe, it, expect } from "vitest";
import { PGA_MATCHERS } from "../../pga2d/pga_matchers";
import { RobotCommand } from "./RobotCommand";
import { Point } from "../../pga2d/objects";

expect.extend(PGA_MATCHERS);

const FIFTH_TURN = (2.0 * Math.PI) / 5;

describe("RobotCommand", () => {
  describe("offset", () => {
    it("IDENTITY has 0 offset", () => {
      const id = RobotCommand.IDENTITY;

      const result = id.offset;

      expect(result).toBePoint(Point.ZERO);
    });

    it("LEFT_TURN has expected offset", () => {
      const left = RobotCommand.LEFT_TURN;

      const result = left.offset;

      // omega - 1 = (cos(tau/5), sin(tau/5)) - (1, 0)
      const expected = Point.direction(
        Math.cos(FIFTH_TURN) - 1.0,
        Math.sin(FIFTH_TURN)
      );
      expect(result).toBePoint(expected);
    });

    it("RIGHT_TURN has expected offset", () => {
      const right = RobotCommand.RIGHT_TURN;

      const result = right.offset;

      // 1 - omega^4 = (1, 0) - (cos(4tau/5), sin(4tau/5))
      const expected = Point.direction(
        1 - Math.cos(4 * FIFTH_TURN),
        -Math.sin(4 * FIFTH_TURN)
      );
      expect(result).toBePoint(expected);
    });

    it("full turn has an offset of 0", () => {
      const full_turn = new RobotCommand([1, 1, 1, 1, 1], 0, "full_turn");

      const result = full_turn.offset;

      expect(result).toBePoint(Point.ZERO);
    });

    it("computes offset for nontrivial path", () => {
      let path = RobotCommand.compose(
        RobotCommand.RIGHT_TURN,
        RobotCommand.LEFT_TURN
      );
      path = RobotCommand.compose(RobotCommand.RIGHT_TURN, path);

      const result = path.offset;

      // the first left and right turns have offset omega - 1, and the second
      // right turn has offset 1 - omega
      const expected = Point.direction(0, 0);
      expect(result).toBePoint(expected);
    });
  });

  describe("compose", () => {
    it("IDENTITY is the identity", () => {
      const left = RobotCommand.LEFT_TURN;
      const id = RobotCommand.IDENTITY;

      // check that I * L = L = I * L
      const id_left = RobotCommand.compose(id, left);
      const left_id = RobotCommand.compose(left, id);

      expect(id_left).toEqual(left_id);
      expect(id_left).toEqual(left);
    });

    it("composes right, then left", () => {
      const left = RobotCommand.LEFT_TURN;
      const right = RobotCommand.RIGHT_TURN;

      const result = RobotCommand.compose(right, left);

      // The first left arc uses offset v0 = (omega - 1). Due to the rotated perspective,
      // now the rightward arc's offset is also v0. Hence [2, 0, 0, 0, 0]
      // the orientation adds and subtracts 1
      // the label is RL since R was applyed second.
      const expected = new RobotCommand([2, 0, 0, 0, 0], 0, "RL");
      expect(result).toEqual(expected);
    });
  });
});
