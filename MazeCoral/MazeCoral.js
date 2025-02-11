import { GridDirection } from "../sketchlib/GridDiection.js";
import {
  RectPrimitive,
  GroupPrimitive,
  LinePrimitive,
} from "../sketchlib/primitives.js";
import { Point } from "../pga2d/objects.js";
import { Color, Style } from "../sketchlib/Style.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { generate_maze } from "./RandomDFSMaze.js";
import { CoralTile } from "../sketchlib/coral/CoralTile.js";
import { Rect } from "../sketchlib/coral/Rect.js";
import {
  render_quad,
  render_tile_walls,
  render_tile_connections,
} from "../sketchlib/coral/rendering.js";
import { find_splines } from "../sketchlib/coral/find_splines.js";

const WIDTH = 500;
const HEIGHT = 700;
const GRID_ROWS = 14;
const GRID_COLS = 10;
const CELL_WIDTH = WIDTH / GRID_COLS;
const CELL_HEIGHT = HEIGHT / GRID_ROWS;

const GRID = generate_maze(GRID_ROWS, GRID_COLS);
// Preallocate these quads since they are constant over the lifetime of the
// sketch
const QUADS = GRID.map((index) => {
  const { i, j } = index;
  return new Rect(j * CELL_WIDTH, i * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
});

const QUAD_STYLE = new Style()
  .with_stroke(new Color(127, 127, 127))
  .with_width(0.5);
const QUAD_PRIMS = QUADS.map_array((_, quad) => {
  return render_quad(quad);
}).flat();
const QUAD_GROUP = new GroupPrimitive(QUAD_PRIMS, QUAD_STYLE);

function make_default_tiles() {
  return GRID.map((index, cell) => {
    return new CoralTile(QUADS.get(index), cell.connection_flags);
  });
}

function make_tiles_from_tileset(coral_tiles) {
  return GRID.map((index, cell) => {
    const quad = QUADS.get(index);
    const tile_json = coral_tiles[cell.connection_flags.to_int()];
    return CoralTile.parse_json(tile_json, quad);
  });
}

const SPLINE_STYLE = new Style()
  .with_stroke(new Color(37, 194, 39))
  .with_width(4);
function render_splines(tile_grid) {
  const splines = find_splines(tile_grid);
  const spline_prims = splines.flatMap((x) => x.to_bezier_world());
  return new GroupPrimitive(spline_prims, SPLINE_STYLE);
}

const CONNECTION_STYLE = new Style()
  .with_stroke(new Color(255, 127, 0))
  .with_width(4);

function render_connections(tile_grid) {
  const connection_prims = tile_grid
    .map_array((_, tile) => {
      return render_tile_connections(tile);
    })
    .flat();
  return new GroupPrimitive(connection_prims, CONNECTION_STYLE);
}

const WALL_STYLE = new Style().with_stroke(new Color(84, 50, 8)).with_width(4);
function render_walls(tile_grid) {
  const wall_prims = tile_grid
    .map_array((_, tile) => {
      return render_tile_walls(tile);
    })
    .flat();
  return new GroupPrimitive(wall_prims, WALL_STYLE);
}

function update_geometry(tile_grid) {
  const splines = render_splines(tile_grid);
  const walls = render_walls(tile_grid);
  return new GroupPrimitive([splines, walls]);
}

function slurp_json(file) {
  const reader = new FileReader();
  const promise = new Promise((resolve, reject) => {
    reader.addEventListener("load", (e) => {
      try {
        const tileset = JSON.parse(e.target.result);
        resolve(tileset);
      } catch (err) {
        reject(err);
      }
    });
  });
  reader.readAsText(file);
  return promise;
}

function parse_tileset(json) {
  if (!Array.isArray(json.coral_tiles) || json.coral_tiles.length !== 16) {
    throw new Error("coral_tiles must be an array of 16 tiles");
  }
  return json;
}

async function import_tileset(file_list) {
  if (file_list.length === 0) {
    throw new Error("Please choose a coral tileset file");
  }

  const json_file = file_list[0];

  const json = await slurp_json(json_file);
  return parse_tileset(json);
}

function clear_errors() {
  document.getElementById("errors").innerText = "";
}

function show_error(message) {
  document.getElementById("errors").innerText = message;
}

export const sketch = (p) => {
  let tiles;
  let dynamic_primitives;
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);

    tiles = make_default_tiles();
    dynamic_primitives = update_geometry(tiles);

    document.getElementById("import").addEventListener("input", async (e) => {
      clear_errors();
      try {
        const tileset = await import_tileset(e.target.files);
        tiles = make_tiles_from_tileset(tileset.coral_tiles);
        dynamic_primitives = update_geometry(tiles);
      } catch (err) {
        console.error(err);
        show_error(err);
      }
    });
  };

  p.draw = () => {
    p.background(0);
    draw_primitive(p, QUAD_GROUP);
    draw_primitive(p, dynamic_primitives);
  };
};
