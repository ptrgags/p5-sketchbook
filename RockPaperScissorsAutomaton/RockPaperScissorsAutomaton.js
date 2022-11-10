// winner[i, j] is the winner when symbols i and j have a rock-paper-scissors
// battle

const WINNER = [
    [0, 0, 0, 3, 4],
    [0, 1, 1, 1, 4],
    [0, 1, 2, 2, 2],
    [3, 1, 2, 3, 3],
    [4, 4, 2, 3, 4],
];

const COLORS = [
    "#233d4d",
    "#fe7f2d",
    "#fcca46",
    "#a1c181", 
    "#619b8a"
];

const ROWS = 100;
const COLS = 100;
const PIXEL_COUNT = ROWS * COLS;

let read_grid = new Array(PIXEL_COUNT);
let write_grid = new Array(PIXEL_COUNT);

// drawing with point() is too slow, we can just set the pixels in
// an array and render the whole image at once
let img;

function ping_pong() {
    [read_grid, write_grid] = [write_grid, read_grid];
}

function setup() {
    createCanvas(4 * COLS, 4 * ROWS);
    img = createImage(COLS, ROWS);

    // Randomly populate the grid
    const SYMBOLS = [0, 1, 2, 3, 4];
    for (let i = 0; i < PIXEL_COUNT; i++) {
        read_grid[i] = random(SYMBOLS);
    }
}

function populate_image() {
    img.loadPixels();
    for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
            const index = j * COLS + i;
            const value = read_grid[index];
            const pixel_color = color(COLORS[value]);
            img.set(i, j, pixel_color)
        }
    }
    img.updatePixels();
}

function mod(x, n) {
    return ((x % n) + n) % n;
}

function neighbor(x, y, delta_x, delta_y) {
    const nx = mod(x + delta_x, COLS);
    const ny = mod(y + delta_y, ROWS);
    const index = ny * COLS + nx;
    return read_grid[index];
}

function rps(x, y) {
    const index = y * COLS + x;
    const value = read_grid[index];

    const w = WINNER[value][neighbor(x, y, -1, 0)]
    const e = WINNER[value][neighbor(x, y, 1, 0)]
    const n = WINNER[value][neighbor(x, y, 0, -1)]
    const s = WINNER[value][neighbor(x, y, 0, 1)]

    // we have up to 4 possible winners, keep doing
    // RPS tournament style to pick a winner. Since
    // RPS is not associative and I want to keep things
    // balanced, I handle west/east and north/south, then
    // take the winner of those two.
    const we = WINNER[w][e];
    const ns = WINNER[n][s];
    return WINNER[we][ns];
}

function simulate() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const index = i * COLS + j;
            write_grid[index] = rps(i, j);
        }
    }
}

function draw() {
    populate_image();
    noSmooth();
    image(img, 0, 0, 4 * COLS, 4 * ROWS);

    if (frameCount % 8 == 0) {
        simulate();
        ping_pong();
    }
}