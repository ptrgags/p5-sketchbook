const HEIGHT = TILE_HEIGHT;
const WIDTH = TILE_WIDTH;

let tile;

function setup() {
  createCanvas(WIDTH, TILE_HEIGHT);
  tile = new PrimroseTile();
}

function A() {
  translate(0, HEIGHT);
  rotate(-HALF_PI);
  scale(0.5, 0.5);
}

function B() {
  translate(WIDTH, 0);
  rotate(HALF_PI);
  scale(0.5, 0.5);
}

function C() {
  translate(HEIGHT/2, 0);
  scale(0.5, 0.5);
}

function D() {
  translate(3 * HEIGHT/2, HEIGHT);
  rotate(PI);
  scale(0.5, 0.5);
}

const FUNCS = [A, B, C, D];

function draw_tiling(depth) {
  if (depth === 0) {
    tile.draw();
    return;
  }
  
  for (const f of FUNCS) {
    push();
    f();
    draw_tiling(depth - 1);
    pop();
  }
}


function draw() {
  draw_tiling(MAX_DEPTH);
}
