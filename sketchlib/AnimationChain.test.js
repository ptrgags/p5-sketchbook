import { describe, it, expect } from "vitest";
import { AnimationChain, Joint } from "./AnimationChain";
import { PGA_MATCHERS } from "../sketchlib/pga2d/pga_matchers";
import { Point } from "../sketchlib/pga2d/Point";

expect.extend(PGA_MATCHERS);

describe("Joint", () => {
  it("constraint_follow with the same point throws", () => {
    const point = new Point(1, 0);
    const follow_dist = 1.0;

    expect(() => {
      Joint.constraint_follow(point, point, follow_dist);
    }).toThrowError("set length of null vector");
  });

  it("constraint_follow with large separation moves the point closer", () => {
    const point = new Point(1, 0);
    const target = new Point(0, -1);
    const follow_dist = 1.0;

    const result = Joint.constraint_follow(target, point, follow_dist);

    // The direction fro point to target is at a 45 degree angle, so we
    // want to move sqrt(2)/2 in the x and y direction starting from target.
    const expected = new Point(Math.SQRT1_2, -(1.0 - Math.SQRT1_2));
    expect(result).toBePoint(expected);
  });

  it("constraint_follow with small separation moves the point further away", () => {
    const point = new Point(0.25, -0.75);
    const target = new Point(0, -1);
    const follow_dist = 1.0;

    const result = Joint.constraint_follow(target, point, follow_dist);

    // The direction fro point to target is at a 45 degree angle, so we
    // want to move sqrt(2)/2 in the x and y direction starting from target.
    const expected = new Point(Math.SQRT1_2, -(1.0 - Math.SQRT1_2));
    expect(result).toBePoint(expected);
  });

  it("constraint_follow at the separation distance doesn't move the point", () => {
    const point = new Point(1, 0);
    const target = new Point(0, -1);
    const follow_dist = Math.SQRT2;

    const result = Joint.constraint_follow(target, point, follow_dist);

    expect(result).toBePoint(point);
  });

  describe("constraint_follow_bend", () => {
    it("Handles point in straight line gracefully", () => {
      const a = new Point(0, 0);
      const b = new Point(0, -1);
      const follow_dist = 1.0;
      const min_bend = (3 * Math.PI) / 4;
      const c = new Point(0, -5);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend,
      );

      const expected = new Point(0, -2);
      expect(result).toBePoint(expected);
    });

    it("with shallow bend angle does simple following", () => {
      const a = new Point(0, 0);
      const b = new Point(0, -1);
      const follow_dist = 1.0;
      const min_bend = (3 * Math.PI) / 4;
      const c = new Point(0.5, -3);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend,
      );

      // Computed in this Desmos graph: https://www.desmos.com/calculator/afwiazpyir
      // this is B + normalize(C - B)
      const expected = new Point(0.242535625036, -1.97014250015);
      expect(result).toBePoint(expected);
    });

    it("handles zero angle bend gracefully", () => {
      const a = new Point(0, 0);
      const b = new Point(0, -1);
      const follow_dist = 1;
      const min_bend = (3 * Math.PI) / 4;
      const c = new Point(0, 2);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend,
      );

      const expected = new Point(-Math.SQRT1_2, -Math.SQRT1_2 - 1);
      expect(result).toBePoint(expected);
    });

    it("with sharp bend on right snaps to right constraint angle", () => {
      const a = new Point(0, 0);
      const b = new Point(0, -1);
      const follow_dist = 1;
      const min_bend = (3 * Math.PI) / 4;
      const c = new Point(1, 0);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend,
      );

      const expected = new Point(Math.SQRT1_2, -Math.SQRT1_2 - 1);
      expect(result).toBePoint(expected);
    });

    it("with sharp bend on left snaps to right constraint angle", () => {
      const a = new Point(0, 0);
      const b = new Point(0, -1);
      const follow_dist = 1;
      const min_bend = (3 * Math.PI) / 4;
      const c = new Point(-1, 0);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend,
      );

      const expected = new Point(-Math.SQRT1_2, -1 - Math.SQRT1_2);
      expect(result).toBePoint(expected);
    });

    it("with simple following uses the following distance from b to c, not a to b", () => {
      const a = new Point(0, 0);
      const b = new Point(0, -1);
      const follow_dist = 2.0;
      const min_bend = (3 * Math.PI) / 4;
      const c = new Point(0, -5);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend,
      );

      const expected = new Point(0, -3);
      expect(result).toBePoint(expected);
    });

    it("with sharp bend on right uses the following distance from b to c, not a to b", () => {
      const a = new Point(0, 0);
      const b = new Point(0, -1);
      const follow_dist = 2;
      const min_bend = (3 * Math.PI) / 4;
      const c = new Point(1, 0);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend,
      );

      const expected = new Point(2 * Math.SQRT1_2, -2 * Math.SQRT1_2 - 1);
      expect(result).toBePoint(expected);
    });

    it("with sharp bend on left uses the following distance from b to c, not a to b", () => {
      const a = new Point(0, 0);
      const b = new Point(0, -1);
      const follow_dist = 2;
      const min_bend = (3 * Math.PI) / 4;
      const c = new Point(-1, 0);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend,
      );

      const expected = new Point(-2 * Math.SQRT1_2, -2 * Math.SQRT1_2 - 1);
      expect(result).toBePoint(expected);
    });
  });
});

describe("AnimationChain", () => {
  function make_chain() {
    const follow_distance = 1;
    const min_bend_angle = Math.PI / 2;
    const joints = [
      new Joint(new Point(0, 0), 0),
      new Joint(new Point(-1, 0), follow_distance),
      new Joint(new Point(-2, 0), follow_distance),
      new Joint(new Point(-3, 0), follow_distance),
    ];
    return new AnimationChain(joints, min_bend_angle);
  }

  it("move with same target as head of chain is a no-op", () => {
    const chain = make_chain();
    const target = new Point(0, 0);

    chain.move(target);

    const expected_positions = chain.get_positions();

    for (let i = 0; i < expected_positions.length; i++) {
      const joint_position = chain.get_joint(i).position;
      expect(joint_position).toBePoint(expected_positions[i]);
    }
  });

  it("move with target in front of chain moves chain in straight line", () => {
    const chain = make_chain();
    const target = new Point(2, 0);

    chain.move(target);

    const expected_positions = [
      new Point(2, 0),
      new Point(1, 0),
      new Point(0, 0),
      new Point(-1, 0),
    ];

    for (let i = 0; i < expected_positions.length; i++) {
      const joint_position = chain.get_joint(i).position;
      expect(joint_position).toBePoint(expected_positions[i]);
    }
  });

  it("move with shallow bend moves curve correctly", () => {
    // See the red points in https://www.desmos.com/calculator/pogiooom3m
    const chain = make_chain();
    const target = new Point(2, 1);

    chain.move(target);

    const expected_positions = [
      new Point(2, 1),
      new Point(1.0513167, 0.683772234),
      new Point(0.07551733, 0.4651045),
      new Point(-0.91324018, 0.31557662),
    ];

    for (let i = 0; i < expected_positions.length; i++) {
      const joint_position = chain.get_joint(i).position;
      expect(joint_position).toBePoint(expected_positions[i]);
    }
  });

  it("move with sharp bend moves curve correctly", () => {
    // See the blue points in https://www.desmos.com/calculator/pogiooom3m
    const chain = make_chain();
    const target = new Point(-2, 1);

    chain.move(target);

    const expected_positions = [
      new Point(-2, 1),
      // the point (-1, 0) moves on a 45 degree diagonal towards (-2, 1)
      new Point(-2 + Math.SQRT1_2, 1 - Math.SQRT1_2),
      // Since the constraint is set at 90 degrees, we will make a corner
      // of a square with side length 1. So the diagonal is sqrt(2), but
      // the top corner is at +1,
      new Point(-2, 1 - Math.SQRT2),
      // Okay the last one is a bit messy, let's just use the numeric approximation
      new Point(-2.923879532, -0.03153013),
    ];

    for (let i = 0; i < expected_positions.length; i++) {
      const joint_position = chain.get_joint(i).position;
      expect(joint_position).toBePoint(expected_positions[i]);
    }
  });
});
