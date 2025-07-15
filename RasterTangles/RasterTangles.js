const MASK_WIDTH = 500;
const MASK_HEIGHT = 700;

const LOW_MASK_COUNT = 5;
const MED_MASK_COUNT = 6;
const FINE_MASK_COUNT = 5;

const PALETTE = ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"];

let low_masks = new Array(LOW_MASK_COUNT);
let med_masks = new Array(MED_MASK_COUNT);
let fine_masks = new Array(FINE_MASK_COUNT);

/**
 * Convert a p5.image to a Raster Tangles index mask
 * @param {import('p5').Image} img The p5.js
 * @returns {Array<number>} An array of mask indices in [0, 7]
 */
function img_to_mask(img) {
  const pixel_count = img.width * img.height;
  const result = new Array(pixel_count);
  img.loadPixels();

  // I was lazy and didn't pay attention to which color was which. Let's
  // reindex as we go.
  const color_map = new Map();
  let next_index = 0;

  for (let i = 0; i < pixel_count; i++) {
    // Image was encoded as 0b rxxxxxxx gxxxxxxx bxxxxxxx
    // we want 0b 00000rgb
    const r = (img.pixels[4 * i + 0] >> 7) & 1;
    const g = (img.pixels[4 * i + 1] >> 7) & 1;
    const b = (img.pixels[4 * i + 2] >> 7) & 1;
    const value = (r << 2) | (g << 1) | b;

    let index = color_map.get(value);
    if (index === undefined) {
      index = next_index;
      color_map.set(value, index);
      next_index++;
    }

    result[i] = index;
  }
  return result;
}

/**
 * Select many items from the array of choices with replacement.
 *
 * @template T
 * @param {import('p5')} p p5.js context for the random function
 * @param {Array<T>} choices The items to choose from
 * @param {number} n The number of selections to make
 * @returns {Array<T>} An array of length n that contains the random selections
 */
function select_many(p, choices, n) {
  const result = new Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = p.random(choices);
  }

  return result;
}

/**
 * Perform the classic Raster Tangles algorithm. It acts by repeated
 * subdivision of regions of an image to make an intricate geometric doodle.
 *
 * See the {@link https://github.com/ptrgags/raster-tangles/blob/main/raster-tangles.md|Raster Tangles Guide}
 * in the raster-tangles repo for full explanation. However, note that this sketch
 * is an older version that doesn't have a concept of outlines. Index 0 is treated
 * like a background fill color like all the other indices.
 *
 * @param {import('p5')} p p5.js context
 * @param {Array<number>} coarse_mask The image mask for coarse detail. This is the root of the tree of substitutions
 * @param {Array<Array<number>>} medium_masks The image masks for the medium level of detail. In terms of substitutions, these are the children of the coarse mask
 * @param {Array<Array<number>>} fine_masks The image masks for the fine level of detail. These are the grandchildren of the coarse mask in the substitution tree.
 * @returns {import('p5').Image} The generated tangle as a p5.js image
 */
function raster_tangle(p, coarse_mask, medium_masks, fine_masks) {
  const img = p.createImage(MASK_WIDTH, MASK_HEIGHT);
  img.loadPixels();

  const pixel_count = MASK_WIDTH * MASK_HEIGHT;
  for (let i = 0; i < pixel_count; i++) {
    const level0 = coarse_mask[i];
    const level1 = (level0 << 3) | medium_masks[level0][i];
    const level2 = (level1 << 3) | fine_masks[level1][i];
    const pixel_color = p.color(PALETTE[level2 % PALETTE.length]);

    // img.set() is likely redundant, just operate on the pixels array
    img.pixels[4 * i + 0] = p.red(pixel_color);
    img.pixels[4 * i + 1] = p.green(pixel_color);
    img.pixels[4 * i + 2] = p.blue(pixel_color);
    img.pixels[4 * i + 3] = 255;
  }
  img.updatePixels();
  return img;
}

/**
 * Sketch function
 * @param {import("p5")} p p5.js context
 */
export const sketch = (p) => {
  let dirty = true;

  p.preload = () => {
    for (let i = 0; i < LOW_MASK_COUNT; i++) {
      low_masks[i] = p.loadImage(`masks/low-${i}.png`);
    }

    for (let i = 0; i < MED_MASK_COUNT; i++) {
      med_masks[i] = p.loadImage(`masks/med-${i}.png`);
    }

    for (let i = 0; i < FINE_MASK_COUNT; i++) {
      fine_masks[i] = p.loadImage(`masks/fine-${i}.png`);
    }
  };

  p.setup = () => {
    p.createCanvas(MASK_WIDTH, MASK_HEIGHT);

    document.getElementById("regen").addEventListener("click", () => {
      dirty = true;
    });

    // Preprocess input images
    low_masks = low_masks.map(img_to_mask);
    med_masks = med_masks.map(img_to_mask);
    fine_masks = fine_masks.map(img_to_mask);
  };

  p.draw = () => {
    if (!dirty) {
      return;
    }
    dirty = false;

    // Randomly select a root mask
    const root_mask = p.random(low_masks);

    // Randomly select masks for each granularity (except for the first)
    // even if they don't get used. This way the values are consistent across
    // all pixels.
    const first_choices = select_many(p, med_masks, 8);
    const second_choices = select_many(p, fine_masks, 8 * 8);

    const tangle = raster_tangle(p, root_mask, first_choices, second_choices);
    p.noSmooth();
    p.pixelDensity(1);
    p.image(tangle, 0, 0, p.width, p.height);
  };
};
