import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import { Palette } from "./palette.js";
import { Boundary, PAIR_COUNT } from "./boundaries.js";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./shaders.js";

// The boundary pattern is generated randomly in chunks of the same
// color. This is the largest number of boundary point pairs generated
// in a single chunk. Smaller means more color variation but less shape
// variation. Larger means more shape variation but less color variation.
const MAX_CHUNK_LENGTH = 8;

// Choose your colors
// desert
//const PALETTE = new Palette("https://coolors.co/5f0f40-9a031e-fb8b24-e36414-0f4c5c");
// rainbow
//const PALETTE = new Palette("https://coolors.co/f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1");
// nautical
//const PALETTE = new Palette("https://coolors.co/0081a7-00afb9-fdfcdc-fed9b7-f07167");
// Simple - black, red & white
//const PALETTE = new Palette("https://coolors.co/000000-ff0000-ffffff");
// lemon-lime
//const PALETTE = new Palette("https://coolors.co/007f5f-2b9348-55a630-80b918-aacc00-bfd200-d4d700-dddf00-eeef20-ffff3f")
// blues
const PALETTE = new Palette(
  "https://coolors.co/000000-7400b8-6930c3-5e60ce-5390d9-4ea8de-48bfe3-56cfe1-64dfdf-72efdd-80ffdb"
);
// maroon and blue
//const PALETTE = new Palette("https://coolors.co/780000-c1121f-fdf0d5-003049-669bbc");

// Elephant-like
//const PALETTE = new Palette("https://coolors.co/093824-ee6055-2f0a28-aaf683-565961-093824");

// Purples
//const PALETTE = new Palette("https://coolors.co/49306b-635380-90708c-ace4aa-e1cdb5");

// Pistachio
//const PALETTE = new Palette("https://coolors.co/c9cba3-ffe1a8-e26d5c-723d46-472d30");

const NORTH_HEMISPHERE = 1;
const SOUTH_HEMISPHERE = -1;

function set_uniforms(poincare_shader, geometry) {
  const primitive_buffer = [];
  const fill_buffer = [];
  const color_buffer = [];

  for (let i = 0; i < PAIR_COUNT; i++) {
    const geom = geometry[i];
    primitive_buffer.push(...geom.primitive);
    fill_buffer.push(...geom.fill);
    color_buffer.push(...geom.color);
  }

  poincare_shader.setUniform("mouse_uv", [0.0, 0.0]);
  poincare_shader.setUniform("primitives", primitive_buffer);
  poincare_shader.setUniform("fill_flags", fill_buffer);
  poincare_shader.setUniform("colors", color_buffer);
  poincare_shader.setUniform("hemisphere", NORTH_HEMISPHERE);
  poincare_shader.setUniform("background_color", PALETTE.background_color);
}

export const sketch = (p) => {
  let poincare_shader;
  let canvas;
  const boundary = Boundary.generate_one(PAIR_COUNT, PALETTE, MAX_CHUNK_LENGTH);

  p.setup = () => {
    boundary.label_points();
    const geometry = boundary.compute_geometry();

    console.log("Making sketch for boundary");
    boundary.print();

    canvas = p.createCanvas(500, 700, p.WEBGL).elt;
    poincare_shader = p.createShader(
      VERTEX_SHADER,
      FRAGMENT_SHADER(PAIR_COUNT)
    );
    p.shader(poincare_shader);
    set_uniforms(poincare_shader, geometry);
  };

  p.draw = () => {
    p.background(128);
    p.shader(poincare_shader);
    p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
  };

  p.mouseDragged = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    poincare_shader.setUniform("mouse_uv", [
      mouse.x / (p.width - 1),
      mouse.y / (p.height - 1),
    ]);
  };
};
