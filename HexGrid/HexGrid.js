/**
 * Convert polar to rectangular coords
 * 
 * @param {number} radius The radius of the point
 * @param {number} angle The angle of the point
 * @returns {number[]} Rectangular [x, y] coordinates
 */
function to_rect(radius, angle) {
    const x = radius * Math.cos(angle);
    const y = radius * -Math.sin(angle);
    return [x, y];
}

/**
 * Vectors for the corners of a hexagon
 * relative to the center
 * @param {number} radius The radius from center to vertex
 * @param {number} flat_top If true, the hex will be flat-topped, false it will be pointy
 * @yields {number[]} coordinates of the hexagon
 */
function * hex_points(radius, flat_top) {
    const angle_offset = flat_top ? 0 : Math.PI / 6;
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i + angle_offset;
        yield to_rect(radius, angle);
    }
}

function draw_hex(p, center, radius, flat_top) {
    const [cx, cy] = center;
    p.beginShape();
    for (const [x, y] of hex_points(radius, flat_top)) {
        p.vertex(cx + x, cy + y);
    }
    p.endShape(p.CLOSE);
}
    
function hex_dims(size) {
    const h = size * 2;
    const w = Math.sqrt(3) * size;
    return [w, h];
}

function to_cube(r, q) {
    const x = q;
    const z = r;
    const y = -x - z;
    return [x, y, z];
}

const GRID_RADIUS = 10;
const HEX_SIZE = 30
const IS_FLAT_TOP = false;

const [w, h] = hex_dims(HEX_SIZE);
const r_basis = [w / 2, h * 3 / 4];
const q_basis = [w, 0];

function add(a, b) {
    const [ax, ay] = a;
    const [bx, by] = b;
    return [ax + bx, ay + by];   
}

function scalar(r, v) {
    const [x, y] = v;
    return [r * x, r *y];
}

export const sketch = (p) => {
    p.setup = () => {
        p.createCanvas(500, 700);
    }

    p.draw = () => {
        p.background(0);
        
        p.noFill();
        p.stroke(255);
        
        p.translate(p.width / 2, p.height / 2);
        
        for (let r = -GRID_RADIUS; r <= GRID_RADIUS; r++) {
            for (let q = -GRID_RADIUS; q < GRID_RADIUS; q++) {
                const [x, y, z] = to_cube(r, q);
                const c = add(scalar(r, r_basis), scalar(q, q_basis));
                if (-GRID_RADIUS <= y && y <= GRID_RADIUS) {
                    p.stroke(255);
                    draw_hex(p, c, HEX_SIZE, IS_FLAT_TOP);
                }
                if (x == 0) {
                    p.stroke(255, 0, 0);
                }
                if (y == 0) {
                    p.stroke(0, 255, 0);
                }
                if (z == 0) {
                    p.stroke(0, 0, 255);
                }
                if (y == 0 || x == 0 || z == 0) {
                    const [cx, cy] = c;
                    p.ellipse(cx, cy, 10, 10);
                }
            }
        }
    }
}