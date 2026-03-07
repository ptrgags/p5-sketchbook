import { describe, it, expect } from "vitest";
import { Primitive } from "../primitives/Primitive.js";
import { Animated } from "./Animated.js";
import { GroupPrimitive } from "../primitives/GroupPrimitive.js";
import { SelectAnimated } from "./SelectAnimated.js";
import { Point } from "../pga2d/Point.js";
import { group } from "../primitives/shorthand.js";

/**
 * Stub out the Animated interface
 * @param {Primitive} primitive
 * @returns {Animated}
 */
function stub_animated(primitive) {
  return {
    primitive,
    update: () => {},
  };
}

/**
 * Mock an animated for testing the update method. update sets
 * this.time, you can assert on that
 * @implements {Animated}
 */
class MockAnimated {
  constructor() {
    this.time = 0;
    this.primitive = GroupPrimitive.EMPTY;
  }

  /**
   *
   * @param {number} t
   */
  update(t) {
    this.time = t;
  }
}

describe("SelectAnimated", () => {
  describe("primitive", () => {
    it("with empty select returns empty group", () => {
      const select = new SelectAnimated([]);

      const result = select.primitive;

      const expected = GroupPrimitive.EMPTY;
      expect(result).toEqual(expected);
    });

    it("by default contains primitive from first animation", () => {
      const prim_a = new Point(1, 2);
      const prim_b = new Point(3, 4);
      const select = new SelectAnimated([
        stub_animated(prim_a),
        stub_animated(prim_b),
      ]);

      const result = select.primitive;

      const expected = group(prim_a);
      expect(result).toEqual(expected);
    });

    it("after selecting an animation, returns the primitive from that animation", () => {
      const prim_a = new Point(1, 2);
      const prim_b = new Point(3, 4);
      const select = new SelectAnimated([
        stub_animated(prim_a),
        stub_animated(prim_b),
      ]);

      select.select(1);
      const result = select.primitive;

      const expected = group(prim_b);
      expect(result).toEqual(expected);
    });
  });

  it("update only updates the currently selected primitive", () => {
    const a = new MockAnimated();
    const b = new MockAnimated();
    const c = new MockAnimated();
    const select = new SelectAnimated([a, b, c]);

    // update the middle entry in the list, i.e. b
    select.select(1);
    select.update(10);

    expect(a.time).toEqual(0);
    expect(b.time).toEqual(10);
    expect(c.time).toEqual(0);
  });

  describe("select", () => {
    it("with negative index wraps correctly", () => {
      const anim_a = stub_animated(new Point(1, 2));
      const anim_b = stub_animated(new Point(3, 4));
      const anim_c = stub_animated(new Point(4, 5));
      const select = new SelectAnimated([anim_a, anim_b, anim_c]);

      select.select(-2);
      const result = select.selected_animation;

      const expected = anim_b;
      expect(result).toBe(expected);
    });

    it("with index out of range wraps correctly", () => {
      const anim_a = stub_animated(new Point(1, 2));
      const anim_b = stub_animated(new Point(3, 4));
      const anim_c = stub_animated(new Point(4, 5));
      const select = new SelectAnimated([anim_a, anim_b, anim_c]);

      select.select(5);
      const result = select.selected_animation;

      const expected = anim_c;
      expect(result).toBe(expected);
    });

    it("with in-range returns correct animation", () => {
      const anim_a = stub_animated(new Point(1, 2));
      const anim_b = stub_animated(new Point(3, 4));
      const anim_c = stub_animated(new Point(4, 5));
      const select = new SelectAnimated([anim_a, anim_b, anim_c]);

      select.select(2);
      const result = select.selected_animation;

      const expected = anim_c;
      expect(result).toBe(expected);
    });
  });

  describe("next/prev", () => {
    it("next advances to the next animation", () => {
      const anim_a = stub_animated(new Point(1, 2));
      const anim_b = stub_animated(new Point(3, 4));
      const anim_c = stub_animated(new Point(4, 5));
      const select = new SelectAnimated([anim_a, anim_b, anim_c]);

      select.next();
      const result = select.selected_animation;

      const expected = anim_b;
      expect(result).toBe(expected);
    });

    it("next loops at the end of the list", () => {
      const anim_a = stub_animated(new Point(1, 2));
      const anim_b = stub_animated(new Point(3, 4));
      const anim_c = stub_animated(new Point(4, 5));
      const select = new SelectAnimated([anim_a, anim_b, anim_c]);
      select.select(2);

      select.next();
      const result = select.selected_animation;

      const expected = anim_a;
      expect(result).toBe(expected);
    });

    it("prev advances to the previous value", () => {
      const anim_a = stub_animated(new Point(1, 2));
      const anim_b = stub_animated(new Point(3, 4));
      const anim_c = stub_animated(new Point(4, 5));
      const select = new SelectAnimated([anim_a, anim_b, anim_c]);
      select.select(2);

      select.prev();
      const result = select.selected_animation;

      const expected = anim_b;
      expect(result).toBe(expected);
    });

    it("prev loops at the start of the list", () => {
      const anim_a = stub_animated(new Point(1, 2));
      const anim_b = stub_animated(new Point(3, 4));
      const anim_c = stub_animated(new Point(4, 5));
      const select = new SelectAnimated([anim_a, anim_b, anim_c]);

      select.prev();
      const result = select.selected_animation;

      const expected = anim_c;
      expect(result).toBe(expected);
    });
  });
});
