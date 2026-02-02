import { fix_mouse_coords } from "../../sketchlib/fix_mouse_coords.js";
import { Rect } from "../Rect.js";
import { CoralTile } from "../CoralTile.js";
import { InteractiveTangent, InteractiveVertex } from "./interactive.js";
import { find_splines } from "../find_splines.js";
import { FlagSet } from "../../sketchlib/FlagSet.js";
import { Style } from "../../sketchlib/Style.js";
import {
  render_quad,
  render_tile_connections,
  render_tile_walls,
} from "../rendering.js";
import {
  GRID_STYLE,
  WALL_STYLE,
  CONNECTION_STYLE,
  SPLINE_STYLE,
} from "../styles.js";
import { Color } from "../../sketchlib/Color.js";
import { CardinalDirection } from "../../sketchlib/CardinalDirection.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { Circle } from "../../sketchlib/primitives/Circle.js";
import { LinePrimitive } from "../../sketchlib/primitives/LinePrimitive.js";

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
    CardinalDirection.COUNT,
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
      new InteractiveVertex(control_point, vertex_constraint, tile.quad),
    );
    TANGENTS.push(
      new InteractiveTangent(control_point, tangent_constraint, tile.quad),
    );
  }
}

// Order to check for mouse hits. Note that this doesn't scale well.
const SELECTION_ORDER = [...TANGENTS, ...VERTICES];
const SPLINES = find_splines(TILES);

// These styles are only used in this sketch
export const HIGHLIGHT_STYLE = new Style({ fill: Color.CYAN });
export const VERTEX_STYLE = new Style({ fill: Color.YELLOW });
export const TANGENT_TIP_STYLE = new Style({ fill: Color.GREEN });
export const TANGENT_STYLE = new Style({ stroke: Color.GREEN, width: 1.5 });

function render_control_points(tiles) {
  const tangent_lines = [];
  const vertices = [];
  const tangent_tips = [];

  for (const tile of tiles) {
    const quad = tile.quad;
    for (const point of tile.control_points) {
      const vertex = quad.uv_to_world(point.position);
      const tangent_point = quad.uv_to_world(point.forward_point);
      tangent_lines.push(new LinePrimitive(vertex, tangent_point));
      vertices.push(vertex);
      tangent_tips.push(tangent_point);
    }
  }

  // It's important to draw the points over the line
  const tangent_line_group = style(tangent_lines, TANGENT_STYLE);
  const vertex_group = style(vertices, VERTEX_STYLE);
  const tangent_group = style(tangent_tips, TANGENT_TIP_STYLE);
  return group(tangent_line_group, vertex_group, tangent_group);
}

const HIGHLIGHT_RADIUS = 8;
function highlight_selection(selected_object) {
  const circle = new Circle(selected_object.position_world, HIGHLIGHT_RADIUS);
  return style(circle, HIGHLIGHT_STYLE);
}

const QUAD_PRIMS = SMALL_QUADS.map_array((_, quad) => {
  return render_quad(quad);
}).flat();
const QUADS = style(QUAD_PRIMS, GRID_STYLE);

const CONNECTION_PRIMS = TILES.map_array((_, tile) => {
  return render_tile_connections(tile);
}).flat();
const CONNECTIONS = style(CONNECTION_PRIMS, CONNECTION_STYLE);

const WALL_PRIMS = TILES.map_array((_, tile) => {
  return render_tile_walls(tile);
}).flat();
const WALLS = style(WALL_PRIMS, WALL_STYLE);

const STATIC_GEOMETRY = group(QUADS, CONNECTIONS, WALLS);

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

function update_spline_primitives() {
  const spline_prims = SPLINES.flatMap((x) => x.to_bezier_world());
  return style(spline_prims, SPLINE_STYLE);
}

export const sketch = (p) => {
  let canvas;
  let highlight;
  let selected_object;
  let control_points;
  let splines;

  p.setup = () => {
    canvas = p.createCanvas(500, 700).elt;
    document.getElementById("export").addEventListener("click", (e) => {
      const tileset = serialize_tileset(TILES);
      you_wouldnt_download_a_json(tileset, "coral_tiles.json");
    });

    splines = update_spline_primitives();
    control_points = render_control_points(TILES);
  };

  p.draw = () => {
    p.background(0);

    STATIC_GEOMETRY.draw(p);

    // Draw the Bezier spline
    splines.draw(p);

    if (highlight) {
      highlight.draw(p);
    }

    control_points.draw(p);
  };

  p.mousePressed = () => {
    if (!canvas) {
      return;
    }

    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);

    for (const object of SELECTION_ORDER) {
      if (object.is_hovering(mouse)) {
        selected_object = object;
        highlight = highlight_selection(object);
        break;
      }
    }
  };

  p.mouseDragged = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);

    if (selected_object) {
      selected_object.move(mouse);
      highlight = highlight_selection(selected_object);
      splines = update_spline_primitives();
      control_points = render_control_points(TILES);
    }
  };

  p.mouseReleased = () => {
    selected_object = undefined;
    highlight = undefined;
  };
};
