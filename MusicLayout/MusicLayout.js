const MEASURE_WIDTH_PX = 30;
const MEASURE_HEIGHT_PX = 14;

let layout_json;

function preload() {
    layout_json = loadJSON("layouts/abba.json");
}

function setup() {
    console.log(layout_json);
    createCanvas(256 * MEASURE_WIDTH_PX, 256);
}

function draw_rule(x, y, symbol, rule) {
    const w = MEASURE_WIDTH_PX * rule.length_measures;
    const h = MEASURE_HEIGHT_PX;
    noFill();
    stroke(0);
    rect(x, y, w, h);

    textSize(MEASURE_HEIGHT_PX - 4);
    fill(0);
    noStroke();
    text(symbol, x + 2, y + h - 2);
}

function draw_layout(layout, symbol, current_x, depth) {
    const rule = layout.rules[symbol];
    draw_rule(current_x, depth * MEASURE_HEIGHT_PX, symbol, rule);

    if (rule.children === undefined) {
        return;
    }

    let x = current_x;
    for (const child_symbol of rule.children) {
        const child_rule = layout.rules[child_symbol];
        draw_layout(layout, child_symbol, x, depth + 1);
        x += child_rule.length_measures * MEASURE_WIDTH_PX;
    }
}


function draw() {
    draw_layout(layout_json, "", 0, 0);

    //draw_rule(0, 0, "A", {length_measures: 1})
}
