import { describe, it, expect } from "vitest";
import {
  decode_variable_length,
  encode_variable_length,
} from "./variable_length";

/**
 * Shorthand for making a data view from an array of bytes
 * @param {number[]} bytes The bytes
 * @returns {DataView}
 */
function make_view(bytes) {
  const u8 = new Uint8Array(bytes);
  return new DataView(u8.buffer);
}

/**
 * Shorthand for making a data view from a uint8 array of the given length
 * @param {number} length
 * @returns {DataView}
 */
function make_empty_view(length) {
  const u8 = new Uint8Array(length);
  return new DataView(u8.buffer);
}

describe("encode_variable_length", () => {
  it("encodes 0 as 0", () => {
    const buffer = make_view([0xff]);
    const value = 0;

    const after = encode_variable_length(buffer, 0, value);

    const expected = make_view([0x00]);
    expect(buffer).toEqual(expected);
    expect(after).toBe(1);
  });

  it("encodes small value as same value", () => {
    const small = 0x7f;
    const buffer = make_empty_view(1);

    const after = encode_variable_length(buffer, 0, small);

    const expected = make_view([small]);
    expect(buffer).toEqual(expected);
    expect(after).toBe(1);
  });

  it("encodes a number between 128 and 255", () => {
    const value = 129;
    const buffer = make_empty_view(2);

    const after = encode_variable_length(buffer, 0, value);

    // see explanation in the decode version of this test
    const expected = make_view([0x81, 0x01]);
    expect(buffer).toEqual(expected);
    expect(after).toBe(2);
  });

  it("encodes the largest 2-byte value", () => {
    // 14 bits set is the most MIDI allows since the high bit is used
    // to indicate continuation
    const value = (1 << 14) - 1;
    const buffer = make_empty_view(2);

    const after = encode_variable_length(buffer, 0, value);

    const expected = make_view([0xff, 0x7f]);
    expect(buffer).toEqual(expected);
    expect(after).toBe(2);
  });

  it("decodes a 3-byte value", () => {
    const value = 0x100000;
    const buffer = make_empty_view(3);

    const after = encode_variable_length(buffer, 0, value);

    const expected = make_view([0xc0, 0x80, 0x00]);
    expect(buffer).toEqual(expected);
    expect(after).toBe(3);
  });

  it("decodes a 4-byte value", () => {
    const value = 0x0800000;
    const buffer = make_empty_view(4);

    const after = encode_variable_length(buffer, 0, value);

    const expected = make_view([0xc0, 0x80, 0x80, 0x00]);
    expect(buffer).toEqual(expected);
    expect(after).toBe(4);
  });

  it("encodes largest value", () => {
    const value = 0xfffffff;
    const buffer = make_empty_view(4);

    const after = encode_variable_length(buffer, 0, value);

    const expected = make_view([0xff, 0xff, 0xff, 0x7f]);
    expect(buffer).toEqual(expected);
    expect(after).toBe(4);
  });

  it("encodes with offset", () => {
    // largest 2-byte value
    const value = 0x3fff;
    const buffer = make_empty_view(5);

    const after = encode_variable_length(buffer, 2, value);

    // only 2 bytes should be set
    const expected = make_view([0x00, 0x00, 0xff, 0x7f, 0x00]);
    expect(buffer).toEqual(expected);
    expect(after).toBe(4);
  });

  it("with value too large throws error", () => {
    const too_big = 0x10000000;
    const buffer = make_empty_view(5);

    expect(() => {
      return encode_variable_length(buffer, 0, too_big);
    }).toThrowError("MIDI only allows numbers up to 0x0fffffff");
  });
});

describe("decode_variable_length", () => {
  it("with 0 decodes as 0", () => {
    const zero = make_view([0x00]);

    const [result, after] = decode_variable_length(zero, 0);

    expect(result).toBe(0);
    expect(after).toBe(1);
  });

  it("with small value decodes as same value", () => {
    const small = 0x7f;
    const view = make_view([small]);

    const [result, after] = decode_variable_length(view, 0);

    expect(result).toBe(small);
    expect(after).toBe(1);
  });

  it("decodes a number between 128 and 255", () => {
    // 129 = 0b1000_0001
    // this splits into 0b0000001 and 0b0000001
    // the first one gets a 1 prefix, so is 0b1000_0001 = 0x81
    // the second one gets a 0 prefix, so it is 0x01
    const view = make_view([0x81, 0x01]);

    const [result, after] = decode_variable_length(view, 0);

    const expected = 129;
    expect(result).toBe(expected);
    expect(after).toBe(2);
  });

  it("decodes the largest 2-byte value", () => {
    // 14 bits all set
    const view = make_view([0xff, 0x7f]);

    const [result, after] = decode_variable_length(view, 0);

    const expected = (1 << 14) - 1;
    expect(result).toBe(expected);
    expect(after).toBe(2);
  });

  it("decodes a 3-byte value", () => {
    const view = make_view([0xc0, 0x80, 0x00]);

    const [result, after] = decode_variable_length(view, 0);

    const expected = 0x100000;
    expect(result).toBe(expected);
    expect(after).toBe(3);
  });

  it("decodes a 4-byte value", () => {
    const view = make_view([0xc0, 0x80, 0x80, 0x00]);

    const [result, after] = decode_variable_length(view, 0);

    const expected = 0x08000000;
    expect(result).toBe(expected);
    expect(after).toBe(4);
  });

  it("decodes largest value", () => {
    const view = make_view([0xff, 0xff, 0xff, 0x7f]);

    const [result, after] = decode_variable_length(view, 0);

    const expected = 0x0fffffff;
    expect(result).toBe(expected);
    expect(after).toBe(4);
  });

  it("decodes with offset", () => {
    // Largest 2-byte value, but adding some zero bytes around it
    // representing other data in the buffer
    const view = make_view([0x00, 0x00, 0xff, 0x7f, 0x00]);

    const [result, after] = decode_variable_length(view, 2);

    const expected = 0x3fff;
    expect(result).toBe(expected);
    expect(after).toBe(4);
  });

  it("with value too large throws error", () => {
    // continues for too long
    const view = make_view([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f]);

    expect(() => {
      return decode_variable_length(view, 0);
    }).toThrowError(
      "invalid MIDI data: variable length quantity longer than 4 bytes detected"
    );
  });
});

describe("decode and encode variable length", () => {
  it("encode then decode is identity", () => {
    const value = 1234;
    const buffer = make_empty_view(4);

    const after_encode = encode_variable_length(buffer, 0, value);
    const [result, after_decode] = decode_variable_length(buffer, 0);

    expect(result).toBe(value);
    expect(after_encode).toBe(after_decode);
  });

  it("decode then encode is identity", () => {
    // largest 2-byte number again
    const view = make_view([0xff, 0x7f]);
    const buffer = make_empty_view(2);

    const [result, after_decode] = decode_variable_length(view, 0);
    const after_encode = encode_variable_length(buffer, 0, result);
    expect(buffer).toEqual(view);
    expect(after_encode).toBe(after_decode);
  });
});
