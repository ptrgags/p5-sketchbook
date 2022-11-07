const MEASURE_WIDTH_PX = 30;
const MEASURE_HEIGHT_PX = 14;
const TEXT_SIZE = 12;

let abba;
let grid_mod3;

function preload() {
    abba = loadJSON("layouts/abba.json");
    grid_mod3 = loadJSON("layouts/grid_mod3.json");
}

function setup() {
    createCanvas(16 * MEASURE_WIDTH_PX, 256 * MEASURE_HEIGHT_PX);
}

const visited = new Set();
function draw_rule(x, y, symbol, rule) {
    const w = MEASURE_WIDTH_PX;
    const h = MEASURE_HEIGHT_PX * rule.length_measures;

    const fill_color = visited.has(symbol) ? color(255, 127, 63) : color(0, 255, 0);
    visited.add(symbol);

    fill(fill_color);
    stroke(0);
    rect(x, y, w, h);

    textSize(TEXT_SIZE);
    fill(0);
    noStroke();
    text(symbol, x + 2, y + TEXT_SIZE);
}

function draw_layout(layout, symbol, current_y, depth) {
    const rule = layout.rules[symbol];
    draw_rule(depth * MEASURE_WIDTH_PX, current_y, symbol, rule);

    if (rule.children === undefined) {
        return;
    }

    let y = current_y;
    for (const child_symbol of rule.children) {
        const child_rule = layout.rules[child_symbol];
        draw_layout(layout, child_symbol, y, depth + 1);
        y += child_rule.length_measures * MEASURE_HEIGHT_PX;
    }
}


function draw() {
    visited.clear();
    draw_layout(abba, "", 0, 0);

    visited.clear();
    translate(8 * MEASURE_WIDTH_PX, 0);
    draw_layout(grid_mod3, "", 0, 0);
}
