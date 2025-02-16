const MASK_WIDTH = 500;
const MASK_HEIGHT = 700;

const LOW_MASK_COUNT = 5;
const MED_MASK_COUNT = 6;
const FINE_MASK_COUNT = 5;

//const PALETTE = ["#fb6107","#f3de2c","#7cb518","#5c8001","#fbb02d"];
const PALETTE = ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"];
//const PALETTE = ["#03071e","#370617","#6a040f","#9d0208","#d00000","#dc2f02","#e85d04","#f48c06","#faa307","#ffba08"];

let low_masks = new Array(LOW_MASK_COUNT);
let med_masks = new Array(MED_MASK_COUNT);
let fine_masks = new Array(FINE_MASK_COUNT);

function preload() {}

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

function select_many(p, choices, n) {
  const result = new Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = p.random(choices);
  }

  return result;
}

function raster_tangle(p, root_mask, first_choices, second_choices) {
  const img = p.createImage(MASK_WIDTH, MASK_HEIGHT);
  img.loadPixels();

  const pixel_count = MASK_WIDTH * MASK_HEIGHT;
  for (let i = 0; i < pixel_count; i++) {
    const level0 = root_mask[i];
    const level1 = (level0 << 3) | first_choices[level0][i];
    const level2 = (level1 << 3) | second_choices[level1][i];
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

export const sketch = (p) => {
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
    p.noLoop();
    p.createCanvas(MASK_WIDTH, MASK_HEIGHT);

    // pre-process the masks
    low_masks = low_masks.map(img_to_mask);
    med_masks = med_masks.map(img_to_mask);
    fine_masks = fine_masks.map(img_to_mask);

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
