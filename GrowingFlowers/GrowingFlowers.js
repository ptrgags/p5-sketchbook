const WIDTH = 500;
const HEIGHT = 700;

const GRID_WIDTH = 51;
const GRID_HEIGHT = 70;
const SPACING = 8;

const GRID_WIDTH_PX = SPACING * (GRID_WIDTH - 1);
const GRID_HEIGHT_PX = SPACING * (GRID_HEIGHT - 1);
const OFFSET_X = (WIDTH - GRID_WIDTH_PX) / 2;
const OFFSET_Y = (HEIGHT - GRID_HEIGHT_PX) / 2;

const FLOWERPOT = {
    x: 25 - 4,
    y: GRID_HEIGHT - 6,
    width: 8,
    height: 6,
}

// No growth below this y value
const START_X = 25;
const START_Y = FLOWERPOT.y - 2;

function setup() {
    createCanvas(WIDTH, HEIGHT);
}

function draw() {
    background(0);

    push();
    translate(OFFSET_X, OFFSET_Y);

    // Draw the background grid for reference
    fill(128);
    noStroke();
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            ellipse(i * SPACING, j * SPACING, 2);
        }
    }

    // Draw the bottom-most stem in green
    stroke(33, 112, 37);
    strokeWeight(4);
    noFill();
    line(START_X * SPACING, START_Y * SPACING, START_X * SPACING, (START_Y + 2) * SPACING);

    // Draw other stems

    // Draw flowers

    // Draw the flowerpot in brown. Draw it last so it hides the bottom of the
    // bottom stem
    fill(71, 52, 26);
    stroke(0);
    rect(
        (FLOWERPOT.x + 1) * SPACING,
        FLOWERPOT.y * SPACING,
        (FLOWERPOT.width - 2) * SPACING,
        FLOWERPOT.height * SPACING
    );
    rect(FLOWERPOT.x * SPACING, FLOWERPOT.y * SPACING, FLOWERPOT.width * SPACING, SPACING);


    pop();
}
