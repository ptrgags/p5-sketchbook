import { describe, it, expect } from "vitest";
import { CTile } from "./CTile.js";
import { NullPoint } from "./NullPoint.js";
import { CVersor } from "./CVersor.js";
import { expect_arrays } from "../test_helpers/expect_arrays.js";

describe("CTile", () => {
  it("transform transforms children", () => {
    const tile = new CTile(NullPoint.ORIGIN, NullPoint.INF);
    const versor = CVersor.INVERSION;

    // For one test, making a custom matcher isn't worth it,
    // so let's just compare the children.
    const transformed = tile.transform(versor.versor);
    const result = transformed.children;

    const expected = [NullPoint.INF, NullPoint.ORIGIN];
    expect_arrays(result, expected, (r, e) => expect(r).toBeNullPoint(e));
  });
});
