import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { Rect, SCREEN_RECT } from "../sketchlib/primitives/Rect.js";
import { group, style, xform } from "../sketchlib/primitives/shorthand.js";
import { SimpleGroupPrimitive } from "../sketchlib/primitives/SimpleGroupPrimitive.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { Random } from "../sketchlib/random.js";
import { Style } from "../sketchlib/Style.js";

/**
 * There are 15 rhyme schemes for a quatrain, this is the basis for this
 * song structure
 *
 * @see {@link https://en.wikipedia.org/wiki/Rhyme_scheme|Rhym Scheme}
 * @see {@link https://en.wikipedia.org/wiki/Bell_number|Bell Numbers}
 * @type {number[][]}
 */
const QUATRAIN_INDICES = [
  [0, 0, 0, 0],
  [0, 0, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 1, 1],
  [0, 0, 1, 2],
  [0, 1, 0, 0],
  [0, 1, 0, 1],
  [0, 1, 0, 2],
  [0, 1, 1, 0],
  [0, 1, 1, 1],
  [0, 1, 1, 2],
  [0, 1, 2, 0],
  [0, 1, 2, 1],
  [0, 1, 2, 2],
  [0, 1, 2, 3],
];

const SECTION_LABELS = ["A", "B", "C", "D"];
const LINE_LABELS = ["a", "b", "c", "d"];
const PHRASE_LABELS = ["1", "2", "3", "4"];

/**
 * Select a random quatrain structure of the 15 possibilities, but label the
 * (up to 4) unique parts with the given labels
 * @param {string[]} labels The labels for the parts
 * @returns {string[]} An array of 4 string labels
 */
function rand_quatrain(labels) {
  const indices = Random.rand_choice(QUATRAIN_INDICES);
  return indices.map((i) => labels[i]);
}

/**
 * Iterate over a quatrain structure and return the unique labels
 * @template T
 * @param {T[]} quatrain Quatrain structure
 * @returns {Generator<T>}
 */
function* iter_unique(quatrain) {
  const visited = new Set();
  for (const label of quatrain) {
    if (!visited.has(label)) {
      yield label;
    }
    visited.add(label);
  }
}

const MEASURE_SIZE = new Direction(32, 32);
const PHRASE_CENTER = new Point(32, 16);
const TEXT_STYLE_CENTERED = new TextStyle(24, "center", "center");
const STYLE_PHRASE_LABELS = Style.flat(Color.BLACK);
const STYLE_LINE_RECT = new Style({
  stroke: Color.BLACK,
  fill: Color.YELLOW,
});

/**
 * Generate a primitive that displays a random quatrain structure for
 * a single line of a song
 * @returns {SimpleGroupPrimitive}
 */
function rand_line() {
  const quatrain = Random.rand_choice(QUATRAIN_INDICES);

  const labels = [];
  for (const [i, index] of quatrain.entries()) {
    const label = PHRASE_LABELS[index];
    const text = new TextPrimitive(
      label,
      PHRASE_CENTER.add(Direction.DIR_X.scale(2 * MEASURE_SIZE.x * i)),
    );
    labels.push(text);
  }

  const background_rect = new Rect(
    Point.ORIGIN,
    MEASURE_SIZE.mul_components(new Direction(8, 1)),
  );
  const line_background = style(background_rect, STYLE_LINE_RECT);

  return group(
    line_background,
    new GroupPrimitive(labels, {
      style: STYLE_PHRASE_LABELS,
      text_style: TEXT_STYLE_CENTERED,
    }),
  );
}

const TEXT_STYLE_LEFT = new TextStyle(24, "left", "center");
const STYLE_LINE_LABELS = Style.flat(Color.WHITE);

/**
 * Compute a random section, a quatrain of four lines of music
 * @returns {SimpleGroupPrimitive}
 */
function rand_section() {
  const quatrain = Random.rand_choice(QUATRAIN_INDICES);

  const unique_lines = iter_unique(quatrain)
    .map(() => rand_line())
    .toArray();

  const labels = [];
  const line_groups = [];
  for (const [i, index] of quatrain.entries()) {
    const label = LINE_LABELS[index];
    const text = new TextPrimitive(
      label,
      Point.ORIGIN.add(
        MEASURE_SIZE.mul_components(new Direction(8.5, i + 0.5)),
      ),
    );
    labels.push(text);

    const offset = new Transform(new Direction(0, i * MEASURE_SIZE.y));
    const translated_line = xform(unique_lines[index], offset);
    line_groups.push(translated_line);
  }

  return group(
    ...line_groups,
    new GroupPrimitive(labels, {
      style: STYLE_LINE_LABELS,
      text_style: TEXT_STYLE_LEFT,
    }),
  );
}

const STYLE_SECTION_LABELS = Style.flat(Color.WHITE);

const SECTION_STRIDE = 5;
function rand_song() {
  const quatrain = Random.rand_choice(QUATRAIN_INDICES);
  const unique_sections = iter_unique(quatrain)
    .map(() => rand_section())
    .toArray();

  const labels = [];
  const section_groups = [];
  for (const [i, index] of quatrain.entries()) {
    const label = SECTION_LABELS[index];
    const text = new TextPrimitive(
      label,
      Point.ORIGIN.add(
        MEASURE_SIZE.mul_components(new Direction(4, SECTION_STRIDE * i + 0.5)),
      ),
    );
    labels.push(text);

    const offset = new Transform(
      new Direction(0, (SECTION_STRIDE * i + 1) * MEASURE_SIZE.y),
    );
    const translated_section = xform(unique_sections[index], offset);
    section_groups.push(translated_section);
  }

  return group(
    ...section_groups,
    new GroupPrimitive(labels, {
      style: STYLE_SECTION_LABELS,
      text_style: TEXT_STYLE_CENTERED,
    }),
  );
}

/**
 *
 * @param {Rect} rect
 * @param {Direction} dimensions
 */
function center_rect(rect, dimensions) {
  const margin = rect.dimensions.sub(dimensions).scale(0.5);
  return new Rect(rect.position.add(margin), dimensions);
}

const offset = center_rect(
  SCREEN_RECT,
  MEASURE_SIZE.mul_components(new Direction(9, 20)),
).position.to_direction();

const SCENE = xform(rand_song(), new Transform(offset));

// @ts-ignore
export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );
  };

  p.draw = () => {
    p.background(0);

    SCENE.draw(p);
  };
};
