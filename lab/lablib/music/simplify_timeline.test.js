import { describe, it, expect } from "vitest";
import { Gap, Sequential } from "./Timeline";
import { N4 } from "./durations";
import { simplify_timeline } from "./simplify_timeline";

const NO_OPTIONS = {
  flatten: false,
};

function stub_interval(value, duration) {
  return {
    value,
    duration,
  };
}

describe("simplify_timeline", () => {
  describe("no simplification flags", () => {});

  describe("flatten=true", () => {
    const OPTIONS = {
      ...NO_OPTIONS,
      flatten: true,
    };

    it("with Gap is identity", () => {
      const gap = new Gap(N4);

      const result = simplify_timeline(gap, OPTIONS);

      expect(result).toBe(gap);
    });

    it("with interval is identity", () => {
      const interval = stub_interval(3, N4);

      const result = simplify_timeline(interval, OPTIONS);

      expect(result).toBe(interval);
    });

    it("with flat Sequential is identity", () => {
      const seq = new Sequential(stub_interval(1, N4), stub_interval(1, N4));

      const result = simplify_timeline(seq, OPTIONS);

      expect(result).toEqual(seq);
    });

    it("with Sequential with single interval returns inner interval", () => {
      const interval = stub_interval(1, N4);
      const seq = new Sequential(interval);

      const result = simplify_timeline(seq, OPTIONS);

      expect(result).toEqual(interval);
    });
  });
});
