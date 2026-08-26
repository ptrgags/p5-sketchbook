import { describe, it, expect } from "vitest";
import { DX7Cartridge } from "../../DX7PatchViewer/DX7Cartridge.js";
import { decode_dx7 } from "./decode_dx7.js";
import { encode_dx7 } from "./encode_dx7.js";
import {
  FORMAT_32_VOICES,
  ID_YAMAHA,
  STATUS_END,
  STATUS_START,
  SUB_STATUS,
} from "./dx7_constants.js";

const HEADER = [
  STATUS_START,
  ID_YAMAHA,
  SUB_STATUS,
  FORMAT_32_VOICES,
  STATUS_END,
];

describe("decode_dx7", () => {
  it("with empty bytes throws error", () => {
    expect(() => {
      return decode_dx7(new ArrayBuffer(0));
    }).toThrowError(".syx file must start with 0xF0");
  });

  it("with bad manufacturer id throws error", () => {
    const bad_id = new Uint8Array([STATUS_START, 42]);

    expect(() => {
      return decode_dx7(bad_id.buffer);
    }).toThrowError("incorrect manufacturer id: 42");
  });

  it("with bad sub-status throws error", () => {
    const bad_sub = new Uint8Array([STATUS_START, ID_YAMAHA, 84]);

    expect(() => {
      return decode_dx7(bad_sub.buffer);
    }).toThrowError("sub status must be 0");
  });

  it("with format other than 32 voices throws error", () => {
    const bad_format = new Uint8Array([STATUS_START, ID_YAMAHA, SUB_STATUS, 0]);

    expect(() => {
      return decode_dx7(bad_format.buffer);
    }).toThrowError("Only 32-voice DX7 .syx files are supported");
  });

  it("with incorrect length for 32 voices throws error", () => {
    const bad_length = new Uint8Array([
      STATUS_START,
      ID_YAMAHA,
      SUB_STATUS,
      FORMAT_32_VOICES,
      // 155 bytes, that would be for a 1-voice message
      0x01,
      0x1b,
    ]);

    expect(() => {
      return decode_dx7(bad_length.buffer);
    }).toThrowError("incorrect data length for 32 voices: 155");
  });
});

describe("encode_dx7", () => {});

describe("dx7 integration", () => {
  it("encode then decode is identity", () => {
    const cartridge = new DX7Cartridge([]);

    const result = decode_dx7(encode_dx7(cartridge));

    expect(result).toEqual(cartridge);
  });

  it("decode then encode is identity", () => {
    const bytes = new Uint8Array([...HEADER]);

    const result = encode_dx7(decode_dx7(bytes.buffer));
    const bytes_array = new Uint8Array(bytes);
    const result_array = new Uint8Array(result);

    expect(result_array).toEqual(bytes_array);
  });
});
