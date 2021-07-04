// Need 2 for a stereographic projection, but this sketch
// will generate more for you if you want.
const IMAGE_COUNT = 2;

// Images are square IMAGE_SIZE x IMAGE_SIZE
const IMAGE_SIZE = 512;

// How many pairs of boundary points around the edge of the circle
const PAIR_COUNT = 20;

// The boundary pattern is generated randomly in chunks of the same
// color. This is the largest number of boundary point pairs generated
// in a single chunk. Smaller means more color variation but less shape
// variation. Larger means more shape variation but less color variation.
const MAX_CHUNK_LENGTH = 3;

// Choose your colors
// desert
//const PALETTE = new Palette("https://coolors.co/5f0f40-9a031e-fb8b24-e36414-0f4c5c");
// rainbow
//const PALETTE = new Palette("https://coolors.co/f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1");
// nautical
//const PALETTE = new Palette("https://coolors.co/0081a7-00afb9-fdfcdc-fed9b7-f07167");

// Simple - black, red & white
const PALETTE = new Palette("https://coolors.co/000000-ff0000-ffffff");

//const PALETTE = new Palette("https://coolors.co/007f5f-2b9348-55a630-80b918-aacc00-bfd200-d4d700-dddf00-eeef20-ffff3f");

function make_sketch(sketch_index, boundary, hemisphere) {
  return (p5) => {
    let poincare_shader;
    
    function set_uniforms(geometry) {
      const primitive_buffer = [];
      const fill_buffer = [];
      const color_buffer = [];
      
      for (let i = 0; i < PAIR_COUNT; i++) {
        const geom = geometry[i];
        primitive_buffer.push(...geom.primitive);
        fill_buffer.push(...geom.fill);
        color_buffer.push(...geom.color);
      }
      
      poincare_shader.setUniform('mouse_uv', [0.0, 0.0]);
      poincare_shader.setUniform('primitives', primitive_buffer);
      poincare_shader.setUniform('fill_flags', fill_buffer);
      poincare_shader.setUniform('colors', color_buffer);
      poincare_shader.setUniform('hemisphere', hemisphere);
      poincare_shader.setUniform('background_color', PALETTE.background_color);
    }
    
    p5.setup = () => {
      boundary.label_points();
      const geometry = boundary.compute_geometry();
      
      console.log("Making sketch for boundary", sketch_index);
      boundary.print();
      
      p5.createCanvas(IMAGE_SIZE, IMAGE_SIZE, p5.WEBGL);
      poincare_shader = p5.createShader(VERTEX_SHADER, FRAGMENT_SHADER(PAIR_COUNT));
      p5.shader(poincare_shader);
      set_uniforms(geometry);
    };
    
    p5.draw = () => {
      p5.background(128);
      p5.shader(poincare_shader);
      p5.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    };
    
    p5.mouseDragged = () => {
      // TODO: This doesn't work well for multiple sketches, I'll need to find something else
      //poincare_shader.setUniform('mouse_uv', [p5.mouseX / (p5.width - 1), p5.mouseY / (p5.height - 1)]);
    };
  };
}

// The circle boundaries must all be generated together to ensure they have the same
// pattern around the unit circle.
const boundaries = Boundary.generate_multiple(PAIR_COUNT, IMAGE_COUNT, PALETTE, MAX_CHUNK_LENGTH);
const sketches = new Array(IMAGE_COUNT);
const NORTH_HEMISPHERE = +1;
const SOUTH_HEMISPHERE = -1;

for (const [i, boundary] of boundaries.entries()) {
  // Alternate between northern and southern hemisphere. This is used to
  // reverse any twisting distortion so we get a smooth boundary if used
  // as a stereographic projection
  const hemisphere = i % 2 == 0 ? NORTH_HEMISPHERE : SOUTH_HEMISPHERE;
  const sketch = make_sketch(i, boundary, hemisphere);
  sketches.push(new p5(sketch));
}
