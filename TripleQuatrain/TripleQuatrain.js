import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Random } from "../sketchlib/random.js";

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
 * @param {string[]} quatrain Quatrain structure
 * @returns {Generator<string>}
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
  };
};
