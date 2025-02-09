import { fix_mouse_coords } from "../common/fix_mouse_coords.js";
import { Rect } from "../sketchlib/coral/Rect.js";
import { CoralTile } from "../sketchlib/coral/CoralTile.js";
import { Color } from "../sketchlib/Style.js";
import {
  SELECT_RADIUS,
  InteractiveTangent,
  InteractiveVertex,
} from "./interactive.js";
import { find_splines } from "../sketchlib/coral/find_splines.js";
import { FlagSet } from "../sketchlib/FlagSet.js";
import { GridDirection } from "../sketchlib/GridDiection.js";
import { Style } from "../sketchlib/Style.js";
import {
  render_quad,
  render_tile_connections,
  render_tile_walls,
} from "../sketchlib/coral/rendering.js";
import { GroupPrimitive } from "../sketchlib/primitives.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";

const WIDTH = 500;
const HEIGHT = 700;

const BIG_QUAD = new Rect(0, HEIGHT / 2 - WIDTH / 2, WIDTH, WIDTH);
const SMALL_QUADS = BIG_QUAD.subdivide_grid(4);

// prettier-ignore
const CONNECTION_ORDER = [
  // all 16 connection types, arranged in a 4x4 grid to form closed
  // loops.
  [0b1001, 0b1101, 0b1100, 0b1000],
  [0b1011, 0b1111, 0b1110, 0b1010], 
  [0b0011, 0b0111, 0b0110, 0b0010],
  [0b0001, 0b0101, 0b0100, 0b0000],
];

const TILES = SMALL_QUADS.map(({ i, j }, quad) => {
  const connection_flags = new FlagSet(
    CONNECTION_ORDER[i][j],
    GridDirection.COUNT
  );
  return new CoralTile(quad, connection_flags);
});

const VERTICES = [];
const TANGENTS = [];
for (const tile of TILES) {
  for (const [
    control_point,
    vertex_constraint,
    tangent_constraint,
  ] of tile.get_constraints()) {
    VERTICES.push(
      new InteractiveVertex(control_point, vertex_constraint, tile.quad)
    );
    TANGENTS.push(
      new InteractiveTangent(control_point, tangent_constraint, tile.quad)
    );
  }
}

// Order to check for mouse hits. Note that this doesn't scale well.
const SELECTION_ORDER = [...TANGENTS, ...VERTICES];

function draw_tile_tangents(p, tile) {
  const quad = tile.quad;
  for (const point of tile.control_points) {
    const a = quad.uv_to_world(point.position);
    const b = quad.uv_to_world(point.forward_point);
    p.line(a.x, a.y, b.x, b.y);
  }
}

function draw_tile_tangent_tips(p, tile) {
  const quad = tile.quad;
  for (const point of tile.control_points) {
    const pos = quad.uv_to_world(point.forward_point);
    p.point(pos.x, pos.y);
  }
}

function draw_tile_vertices(p, tile) {
  const quad = tile.quad;
  for (const point of tile.control_points) {
    const pos = quad.uv_to_world(point.position);
    p.point(pos.x, pos.y);
  }
}

const SPLINES = find_splines(TILES);
function draw_spline(p, spline) {
  for (const [a, b, c, d] of spline.to_bezier_world()) {
    p.bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
  }
}

function highlight_selction(p, selected_object) {
  const position = selected_object.position_world;
  p.circle(position.x, position.y, SELECT_RADIUS * 2);
}

const DEFAULT_STYLE = new Style();

const QUAD_STYLE = new Style()
  .with_stroke(new Color(127, 127, 127))
  .with_width(0.5);
const QUAD_PRIMS = SMALL_QUADS.map_array((_, quad) => {
  return render_quad(quad);
}).flat();
const QUADS = new GroupPrimitive(QUAD_PRIMS, QUAD_STYLE);

const CONNECTION_STYLE = DEFAULT_STYLE.with_stroke(
  new Color(255, 127, 0)
).with_width(4);
const CONNECTION_PRIMS = TILES.map_array((_, tile) => {
  return render_tile_connections(tile);
}).flat();
const CONNECTIONS = new GroupPrimitive(CONNECTION_PRIMS, CONNECTION_STYLE);

const WALL_STYLE = DEFAULT_STYLE.with_stroke(new Color(84, 50, 8)).with_width(
  4
);
const WALL_PRIMS = TILES.map_array((_, tile) => {
  return render_tile_walls(tile);
}).flat();
const WALLS = new GroupPrimitive(WALL_PRIMS, WALL_STYLE);

const STATIC_GEOMETRY = new GroupPrimitive([QUADS, CONNECTIONS, WALLS]);

// serialize a 16-tile tileset of coral shapes from the tiles in the editor.
function serialize_tileset(tiles) {
  const result = new Array(16);
  for (const tile of tiles) {
    const index = tile.connection_flags.to_int();
    result[index] = tile.to_json();
  }
  return {
    coral_tiles: result,
  };
}

// Based on https://stackoverflow.com/a/30800715
function you_wouldnt_download_a_json(json, fname) {
  // Format with 2 space tabs
  const json_str = encodeURIComponent(JSON.stringify(json, undefined, 2));
  const data_url = `data:text/json;charset=utf-8,${json_str}`;

  const anchor = document.createElement("a");
  anchor.setAttribute("href", data_url);
  anchor.setAttribute("download", fname);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export const sketch = (p) => {
  let canvas;
  let selected_object;

  p.setup = () => {
    canvas = p.createCanvas(500, 700).elt;
    document.getElementById("export").addEventListener("click", (e) => {
      const tileset = serialize_tileset(TILES);
      you_wouldnt_download_a_json(tileset, "coral_tiles.json");
    });
  };

  p.draw = () => {
    p.background(0);

    draw_primitive(p, STATIC_GEOMETRY);

    // Draw the Bezier spline
    p.stroke(131, 71, 181);
    p.noFill();
    p.strokeWeight(2);
    for (const spline of SPLINES) {
      draw_spline(p, spline);
    }

    // Draw tangents
    p.stroke(0, 255, 0);
    p.noFill();
    p.strokeWeight(1);
    for (const tile of TILES) {
      draw_tile_tangents(p, tile);
    }

    // Draw a circle at the tips of the tangents
    p.stroke(0, 255, 0);
    p.noFill();
    p.strokeWeight(6);
    for (const tile of TILES) {
      draw_tile_tangent_tips(p, tile);
    }

    // Draw vertices
    p.stroke(255, 255, 0);
    p.strokeWeight(6);
    p.noFill();
    for (const tile of TILES) {
      draw_tile_vertices(p, tile);
    }

    p.stroke(255);
    p.noFill();
    p.strokeWeight(1);
    if (selected_object) {
      highlight_selction(p, selected_object);
    }
  };

  p.mousePressed = () => {
    if (!canvas) {
      return;
    }

    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);

    for (const object of SELECTION_ORDER) {
      if (object.is_hovering(mouse)) {
        selected_object = object;
        break;
      }
    }
  };

  p.mouseDragged = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);

    if (selected_object) {
      selected_object.move(mouse);
    }
  };

  p.mouseReleased = () => {
    selected_object = undefined;
  };
};
