import { Growth } from "./Growth.js";

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
};

// No growth below this y value
const START_X = 25;
const START_Y = FLOWERPOT.y - 2;

// Make a grid for the plant growth simulation, but limit the grid
// to only above the start y
const GROWTH = new Growth(GRID_WIDTH, START_Y + 1, START_X, START_Y);

export const sketch = (p) => {
  const FLOWER_COLORS = [
    // Purple
    p.color(148, 3, 252),
    // Red
    p.color(255, 0, 0),
    // Pale blue
    p.color(173, 224, 237),
    // Yellow
    p.color(255, 208, 38),
    // Blue
    p.color(34, 5, 255),
    // Orange
    p.color(255, 149, 0),
  ];

  let flower_color;
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
    flower_color = p.random(FLOWER_COLORS);
  };

  p.draw = () => {
    p.background(0);

    p.push();
    p.translate(OFFSET_X, OFFSET_Y);

    // Draw a trellis
    p.stroke(71, 52, 26);
    p.strokeWeight(8);

    // Draw the bottom-most stem in green
    const STEM_COLOR = p.color(33, 112, 37);
    p.stroke(STEM_COLOR);
    p.strokeWeight(4);
    p.noFill();
    p.line(
      START_X * SPACING,
      START_Y * SPACING,
      START_X * SPACING,
      (START_Y + 2) * SPACING
    );

    GROWTH.draw(p, SPACING, STEM_COLOR, flower_color);

    // Draw the flowerpot in brown. Draw it last so it hides the bottom of
    // the bottom stem
    p.fill(71, 52, 26);
    p.stroke(0);
    p.rect(
      (FLOWERPOT.x + 1) * SPACING,
      FLOWERPOT.y * SPACING,
      (FLOWERPOT.width - 2) * SPACING,
      FLOWERPOT.height * SPACING
    );
    p.rect(
      FLOWERPOT.x * SPACING,
      FLOWERPOT.y * SPACING,
      FLOWERPOT.width * SPACING,
      SPACING
    );

    p.pop();

    if (p.frameCount % 10 == 0) {
      GROWTH.grow_step();
    }
  };
};
