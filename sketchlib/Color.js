const REGEX_HEX_COLOR = /^#?[0-9A-Fa-f]{6}$/;

/**
 * Format a u8 as a 2-digit hex number with leading 0s as needed
 * @param {number} value_u8
 */
function format_hex_u8(value_u8) {
    const hex_value = value_u8.toString(16);
    if (hex_value.length === 1) {
        return `0${hex_value}`;
    }

    return hex_value;
}

/**
 * sRGBA color with values in the range [0, 255]
 */
export class Color {
    /**
     * Constructor
     * @param {number} r The red component from 0 to 255
     * @param {number} g The green component from 0 to 255
     * @param {number} b The blue component from 0 to 255
     * @param {number} [a = 255] the alpha component from 0 to 255
     */
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a ?? 255;
    }

    /**
     * Convert a color to a CSS color code
     * @returns {string} A string in the form #RRGGBB
     */
    to_hex_code() {
        const r = format_hex_u8(this.r);
        const g = format_hex_u8(this.g);
        const b = format_hex_u8(this.b);
        return `#${r}${g}${b}`;
    }

    /**
     * Parse a color from a hex code like RRGGBB or #RRGGBB. This is useful
     * when the input came from an HTML color input
     * @param {string} hex_code The hex code
     * @returns {Color} The parsed color
     */
    static from_hex_code(hex_code) {
        if (!REGEX_HEX_COLOR.test(hex_code)) {
            throw new Error("hex_code must be in the form RRGGBB or #RRGGBB");
        }

        const start = hex_code.charAt(0) === "#" ? 1 : 0;
        const red_string = hex_code.slice(start, start + 2);
        const green_string = hex_code.slice(start + 2, start + 4);
        const blue_string = hex_code.slice(start + 4);

        const red = parseInt(red_string, 16);
        const green = parseInt(green_string, 16);
        const blue = parseInt(blue_string, 16);

        return new Color(red, green, blue);
    }
}
// Basic 8 colors for quick prototyping. In practice, these colors are harsh
// so for final sketches, pick colors more intentionally
Color.BLACK = Object.freeze(new Color(0, 0, 0));
Color.RED = Object.freeze(new Color(255, 0, 0));
Color.GREEN = Object.freeze(new Color(0, 255, 0));
Color.BLUE = Object.freeze(new Color(0, 0, 255));
Color.YELLOW = Object.freeze(new Color(255, 255, 0));
Color.MAGENTA = Object.freeze(new Color(255, 0, 255));
Color.CYAN = Object.freeze(new Color(0, 255, 255));
Color.WHITE = Object.freeze(new Color(255, 255, 255));