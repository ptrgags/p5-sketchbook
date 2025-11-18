import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { RectPrimitive } from "../../sketchlib/rendering/primitives.js";
import { group, style } from "../../sketchlib/rendering/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { Rectangle } from "../lablib/Rectangle.js";

/**
 * Given a bounding rectangle, make 7 evenly-spaced rectangles for the
 * white keys
 * @param {Rectangle} bounding_rect Bounding rectangle for the whole piano octave
 * @return {RectPrimitive[]} An array of 7 rectangle primitives for the white keys
 */
function make_white_keys(bounding_rect) {
    const {x: width, y: height} = bounding_rect.dimensions;
    const key_dimensions = Point.direction(width / 7, height);

    const result = new Array(7);
    const NUM_WHITE_KEYS = 7;
    for (let i = 0; i < NUM_WHITE_KEYS; i++) {
        const offset = Point.DIR_X.scale(i * key_dimensions.x);
        result[i] = new RectPrimitive(bounding_rect.position.add(offset), key_dimensions);
    }
    return result;
}

/**
 * Given the bounds for a piano octave, make 5 rectangles for the black keys.
 * @param {Rectangle} bounding_rect Bounding rectangle for the whole piano octave
 * @returns {RectPrimitive[]} An array of 5 rectangle primitives for the black keys, positioned at their respective spots over the white keys
 */
function make_black_keys(bounding_rect) {
    const {x: width, y: height} = bounding_rect.dimensions;
    const key_dimensions = Point.direction(width / 14, 9 * height / 16);

    // key offsets in multiples of half the black key width, i.e. 1/28 of
    // the width of the keyboard
    const key_offsets = [3, 7, 15, 19, 23]; 

    return key_offsets.map((i) => {
        const offset = Point.DIR_X.scale(i * width / 28);
        return new RectPrimitive(bounding_rect.position.add(offset), key_dimensions)
    });
}

//const WHITE_KEY_INDICES = [0, 2, 4, 5, 7, 9, 11];
//const BLACK_KEY_INDICES = [1, 3, 6, 8, 10];

const STYLE_WHITE_KEYS = new Style({
    stroke: Color.BLACK,
    fill: Color.WHITE
})
const STYLE_BLACK_KEYS = new Style({
    fill: Color.BLACK
})

/**
 * Single octave piano keyboard
 */
export class Piano {
    constructor(bounding_rect) {
        this.white_keys = make_white_keys(bounding_rect);
        this.black_keys = make_black_keys(bounding_rect);


        /**
         * Array of 12 booleans to determine which keys are pressed
         * @type {boolean[]}
         */
        this.is_pressed = new Array(12).fill(false);
    }

    render() {
        const white_keys = style(this.white_keys, STYLE_WHITE_KEYS);
        const black_keys = style(this.black_keys, STYLE_BLACK_KEYS);

        return group(white_keys, black_keys);
    }
}