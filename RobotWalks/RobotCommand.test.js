import { describe, it, expect } from "vitest";
import { PGA_MATCHERS } from "../pga2d/pga_matchers";
import { RobotCommand } from "./RobotCommand";
import { Direction } from "../pga2d/Direction";

expect.extend(PGA_MATCHERS);

const FIFTH_TURN = (2.0 * Math.PI) / 5;

describe("RobotCommand", () => {
  describe("offset", () => {
    it("IDENTITY has 0 offset", () => {
      const id = RobotCommand.IDENTITY;

      const result = id.offset;

      expect(result).toBePoint(Direction.ZERO);
    });

    it("LEFT_TURN has expected offset", () => {
      const left = RobotCommand.LEFT_TURN;

      const result = left.offset;

      // omega - 1 = (cos(tau/5), sin(tau/5)) - (1, 0)
      const expected = new Direction(
        Math.cos(FIFTH_TURN) - 1.0,
        Math.sin(FIFTH_TURN)
      );
      expect(result).toBePoint(expected);
    });

    it("RIGHT_TURN has expected offset", () => {
      const right = RobotCommand.RIGHT_TURN;

      const result = right.offset;

      // 1 - omega^4 = (1, 0) - (cos(4tau/5), sin(4tau/5))
      const expected = new Direction(
        1 - Math.cos(4 * FIFTH_TURN),
        -Math.sin(4 * FIFTH_TURN)
      );
      expect(result).toBePoint(expected);
    });

    it("full turn has an offset of 0", () => {
      const full_turn = new RobotCommand([1, 1, 1, 1, 1], 0, "full_turn");

      const result = full_turn.offset;

      expect(result).toBePoint(Direction.ZERO);
    });

    it("computes offset for nontrivial path", () => {
      let path = RobotCommand.compose(
        RobotCommand.RIGHT_TURN,
        RobotCommand.LEFT_TURN
      );
      path = RobotCommand.compose(RobotCommand.RIGHT_TURN, path);

      const result = path.offset;

      // the first two commands have offset (omega - 1), and the third
      // has offset (1 - omega^4)
      // in total we have
      // 2 * (omega - 1) + (1 - omega^4)
      // 2 * omega - 2 + 1 - omega^4
      // 2 * omega -1 - omega^4
      const expected = new Direction(
        2 * Math.cos(FIFTH_TURN) - 1 - Math.cos(4 * FIFTH_TURN),
        2 * Math.sin(FIFTH_TURN) - Math.sin(4 * FIFTH_TURN)
      );
      expect(result).toBeDirection(expected);
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

    it("CCW circle gives correct path", () => {
      const left = RobotCommand.LEFT_TURN;
      const left2 = RobotCommand.compose(left, left);
      const left3 = RobotCommand.compose(left, left2);
      const left4 = RobotCommand.compose(left, left3);
      const left5 = RobotCommand.compose(left, left4);

      const expected2 = new RobotCommand([1, 1, 0, 0, 0], 2, "LL");
      const expected3 = new RobotCommand([1, 1, 1, 0, 0], 3, "LLL");
      const expected4 = new RobotCommand([1, 1, 1, 1, 0], 4, "LLLL");
      const expected5 = new RobotCommand([1, 1, 1, 1, 1], 0, "LLLLL");

      expect(left2).toEqual(expected2);
      expect(left3).toEqual(expected3);
      expect(left4).toEqual(expected4);
      expect(left5).toEqual(expected5);
    });

    it("CW circle gives correct path", () => {
      const right = RobotCommand.RIGHT_TURN;
      const right2 = RobotCommand.compose(right, right);
      const right3 = RobotCommand.compose(right, right2);
      const right4 = RobotCommand.compose(right, right3);
      const right5 = RobotCommand.compose(right, right4);

      const expected2 = new RobotCommand([0, 0, 0, 1, 1], 3, "RR");
      const expected3 = new RobotCommand([0, 0, 1, 1, 1], 2, "RRR");
      const expected4 = new RobotCommand([0, 1, 1, 1, 1], 1, "RRRR");
      const expected5 = new RobotCommand([1, 1, 1, 1, 1], 0, "RRRRR");

      expect(right2).toEqual(expected2);
      expect(right3).toEqual(expected3);
      expect(right4).toEqual(expected4);
      expect(right5).toEqual(expected5);
    });

    it("CCW circle gives correct path", () => {
      const left = RobotCommand.LEFT_TURN;
      const left2 = RobotCommand.compose(left, left);
      const left4 = RobotCommand.compose(left2, left2);
      const circle = RobotCommand.compose(left, left4);

      const expected = new RobotCommand([1, 1, 1, 1, 1], 0, "LLLLL");

      expect(circle).toEqual(expected);
    });

    it("composes left, then right", () => {
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

    it("composes right, then left", () => {
      const left = RobotCommand.LEFT_TURN;
      const right = RobotCommand.RIGHT_TURN;

      const result = RobotCommand.compose(left, right);

      // The first left arc uses offset v0 = (omega - 1). Due to the rotated perspective,
      // now the rightward arc's offset is also v0. Hence [2, 0, 0, 0, 0]
      // the orientation adds and subtracts 1
      // the label is RL since R was applyed second.
      const expected = new RobotCommand([0, 0, 0, 0, 2], 0, "LR");
      expect(result).toEqual(expected);
    });

    it("composition is associative", () => {
      const left = RobotCommand.LEFT_TURN;
      const right = RobotCommand.RIGHT_TURN;

      // Check the associative rule
      // (ll)r = l(lr)
      const ll_r = RobotCommand.compose(
        RobotCommand.compose(left, left),
        right
      );
      const l_lr = RobotCommand.compose(
        left,
        RobotCommand.compose(left, right)
      );

      expect(ll_r).toEqual(l_lr);
    });
  });
});
