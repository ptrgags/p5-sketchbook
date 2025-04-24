import { describe, it, expect } from "vitest";
import { Color } from "./Color";

describe("Color", () => {
    it("from_hex_code with invalid hex code throws", () => {
        expect(() => {
            return Color.from_hex_code("nope");
        }).toThrowError("must be in the form");
    });

    it("to_hex_code formats as CSS color", () => {
        const color = new Color(3, 45, 255);

        const result = color.to_hex_code();

        const expected = "#032dff";
        expect(result).toEqual(expected);
    });

    it("from_hex_code parses CSS color", () => {
        const hex_code = "#0fab35";

        const result = Color.from_hex_code(hex_code);

        const expected = new Color(0x0f, 0xab, 0x35);
        expect(result).toEqual(expected);
    });

    it("from_hex_code parses color without hashtag", () => {
        const hex_code = "0fab35";

        const result = Color.from_hex_code(hex_code);

        const expected = new Color(0x0f, 0xab, 0x35);
        expect(result).toEqual(expected);
    });
});