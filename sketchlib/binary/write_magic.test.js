import { describe, it, expect } from "vitest";
import { write_ascii } from "./write_ascii.js";

const EMPTY_VALUES = new Array(8).fill(0);

describe("write_str", () => {
  it("with empty string writes nothing", () => {
    const buffer = new Uint8Array(EMPTY_VALUES);
    const data_view = new DataView(buffer.buffer);

    const after_offset = write_ascii(data_view, "", 0);

    const expected_array = new Uint8Array(EMPTY_VALUES);
    expect(buffer).toEqual(expected_array);
    expect(after_offset).toBe(0);
  });

  it("with magic number writes correct bytes", () => {
    const buffer = new Uint8Array(EMPTY_VALUES);
    const data_view = new DataView(buffer.buffer);

    const after_offset = write_ascii(data_view, "ABCD", 0);

    // ASCII A = 65
    const expected = new Uint8Array([65, 66, 67, 68, 0, 0, 0, 0]);
    expect(buffer).toEqual(expected);
    expect(after_offset).toBe(4);
  });

  it("with magic number and offset writes correct bytes", () => {
    const buffer = new Uint8Array(EMPTY_VALUES);
    const data_view = new DataView(buffer.buffer);

    const after_offset = write_ascii(data_view, "ABCD", 2);

    const expected = new Uint8Array([0, 0, 65, 66, 67, 68, 0, 0]);
    expect(buffer).toEqual(expected);
    expect(after_offset).toBe(6);
  });
});
