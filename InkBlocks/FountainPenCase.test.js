import { describe, it, expect } from "vitest";
import { FountainPen, FountainPenCase } from "./FountainPenCase.js";

const TEST_COLORS = [
  { hue: 0 / 8, saturation: 1, value: 1 },
  { hue: 1 / 8, saturation: 1, value: 1 },
  { hue: 2 / 8, saturation: 1, value: 1 },
  { hue: 3 / 8, saturation: 1, value: 1 },
  { hue: 4 / 8, saturation: 1, value: 1 },
  { hue: 5 / 8, saturation: 1, value: 1 },
  { hue: 6 / 8, saturation: 1, value: 1 },
  { hue: 7 / 8, saturation: 1, value: 1 },
];

const PEN_CASE_SIZE = 4;
const MAX_CAPACITY = 10;
// Make a pen case with 4 colors from the palette
function make_pen_case() {
  const pens = TEST_COLORS.slice(0, PEN_CASE_SIZE).map(
    (x) => new FountainPen(x, MAX_CAPACITY)
  );
  return new FountainPenCase(pens, TEST_COLORS, MAX_CAPACITY, PEN_CASE_SIZE);
}

describe("PenCase", () => {
  describe("next_iter", () => {
    it("throws if ink_usage is empty", () => {
      const pen_case = make_pen_case();

      expect(() => {
        pen_case.next_iter([]);
      }).toThrow(/usage must be an array of 4 numbers/);
    });

    it("throws if ink_usage is the wrong length", () => {
      const pen_case = make_pen_case();

      expect(() => {
        pen_case.next_iter([1, 3, 5, 2, 1]);
      }).toThrow(/usage must be an array of 4 numbers/);
    });

    it("does not modify original pen case", () => {
      const pen_case = make_pen_case();

      const result = pen_case.next_iter([1, 2, 3, 4]);

      for (const [i, pen] of result.pens.entries()) {
        expect(pen_case.pens[i]).not.toBe(pen);
      }
    });

    it("propagates available colors to results", () => {
      const pen_case = make_pen_case();
      const result = pen_case.next_iter([1, 2, 3, 4]);

      expect(result.available_colors).toBe(TEST_COLORS);
    });

    it("ink usage within capacity of pens returns new pen case with same colors", () => {
      const pen_case = make_pen_case();

      const result = pen_case.next_iter([3, 2, 1, 4]);

      const original_colors = pen_case.pens.map((x) => x.color);
      const result_colors = result.pens.map((x) => x.color);
      expect(original_colors).toEqual(result_colors);
    });

    it("ink usage within capacity of pens returns new pen case with smaller capacity", () => {
      const pen_case = make_pen_case();

      const result = pen_case.next_iter([3, 2, 1, 4]);

      const expected_capacities = [7, 8, 9, 6];
      const result_capacities = result.pens.map((x) => x.capacity);
      expect(result_capacities).toEqual(expected_capacities);
    });

    it("Pens slide left when a pen runs out of ink", () => {
      const pen_case = make_pen_case();

      // Use up the second pen
      const result = pen_case.next_iter([4, MAX_CAPACITY, 2, 1]);

      // First pen is the same
      expect(result.pens[0].color).toEqual(TEST_COLORS[0]);
      // The second pen was removed, so the other two colors shift left
      // one place
      expect(result.pens[1].color).toEqual(TEST_COLORS[2]);
      expect(result.pens[2].color).toEqual(TEST_COLORS[3]);
    });

    it("When a pen runs out of ink, a new pen is added on the right", () => {
      const pen_case = make_pen_case();

      const result = pen_case.next_iter([4, MAX_CAPACITY, 2, 1]);

      const last_pen = result.pens[3];
      expect(last_pen.color).toEqual(TEST_COLORS[4]);
      expect(last_pen.capacity).toBe(MAX_CAPACITY);
    });

    it("Returns correct colors when multiple pens run out of ink", () => {
      const pen_case = make_pen_case();

      const result = pen_case.next_iter([MAX_CAPACITY, 3, 5, MAX_CAPACITY]);

      const result_colors = result.pens.map((x) => x.color);
      const expected_colors = [
        TEST_COLORS[1],
        TEST_COLORS[2],
        // Two new colors from the palette
        TEST_COLORS[4],
        TEST_COLORS[5],
      ];
      expect(result_colors).toEqual(expected_colors);
    });

    it("Returns correct capacities when multiple pens run out of ink", () => {
      const pen_case = make_pen_case();

      const result = pen_case.next_iter([MAX_CAPACITY, 3, 5, MAX_CAPACITY]);

      const result_capacities = result.pens.map((x) => x.capacity);
      const expected_capacities = [7, 5, MAX_CAPACITY, MAX_CAPACITY];
      expect(result_capacities).toEqual(expected_capacities);
    });

    it("Treats the available colors as a circular buffer", () => {
      const pen_case = make_pen_case();

      // Use up 7 out of the 8 colors in the palette
      const temp = pen_case.next_iter([
        MAX_CAPACITY,
        MAX_CAPACITY,
        MAX_CAPACITY,
        MAX_CAPACITY,
      ]);
      const result = temp.next_iter([
        MAX_CAPACITY,
        3,
        MAX_CAPACITY,
        MAX_CAPACITY,
      ]);

      // The one unused pen slides left into the first slot
      expect(result.pens.map((x) => x.color)).toEqual([
        TEST_COLORS[5],
        TEST_COLORS[0],
        TEST_COLORS[1],
        TEST_COLORS[2],
      ]);
    });
  });
});
