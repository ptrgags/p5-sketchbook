import { draw_primitive } from "../../sketchlib/p5_helpers/draw_primitive.js";
import { generate_maze } from "../../sketchlib/RandomDFSMaze.js";
import { CoralTile } from "../CoralTile.js";
import { Rect } from "../Rect.js";
import {
  render_quad,
  render_tile_walls,
  render_tile_connections,
} from "../rendering.js";
import { find_splines } from "../find_splines.js";
import {
  GRID_STYLE,
  WALL_STYLE,
  CONNECTION_STYLE,
  SPLINE_STYLE,
} from "../styles.js";
import { Grid } from "../../sketchlib/Grid.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";
import { style } from "../../sketchlib/rendering/shorthand.js";

const WIDTH = 500;
const HEIGHT = 700;
const GRID_ROWS = 7;
const GRID_COLS = 5;
const CELL_WIDTH = WIDTH / GRID_COLS;
const CELL_HEIGHT = HEIGHT / GRID_ROWS;

// The quads are constant even if the maze changes.
const QUADS = new Grid(GRID_ROWS, GRID_COLS);
QUADS.fill((index) => {
  const { i, j } = index;
  return new Rect(j * CELL_WIDTH, i * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
});

const QUAD_PRIMS = QUADS.map_array((_, quad) => {
  return render_quad(quad);
}).flat();
const QUAD_GROUP = style(QUAD_PRIMS, GRID_STYLE);

function make_default_tiles(grid) {
  return grid.map((index, cell) => {
    return new CoralTile(QUADS.get(index), cell.connection_flags);
  });
}

function make_tiles_from_tileset(grid, coral_tiles) {
  return grid.map((index, cell) => {
    const quad = QUADS.get(index);
    const tile_json = coral_tiles[cell.connection_flags.to_int()];
    return CoralTile.parse_json(tile_json, quad);
  });
}

function render_splines(tile_grid) {
  const splines = find_splines(tile_grid);
  const spline_prims = splines.flatMap((x) => x.to_bezier_world());
  return style(spline_prims, { style: SPLINE_STYLE });
}

function render_connections(tile_grid) {
  const connection_prims = tile_grid
    .map_array((_, tile) => {
      return render_tile_connections(tile);
    })
    .flat();
  return style(connection_prims, { style: CONNECTION_STYLE });
}

function render_walls(tile_grid) {
  const wall_prims = tile_grid
    .map_array((_, tile) => {
      return render_tile_walls(tile);
    })
    .flat();
  return style(wall_prims, { style: WALL_STYLE });
}

function render_geometry(tile_grid) {
  const connections = render_connections(tile_grid);
  const walls = render_walls(tile_grid);
  const splines = render_splines(tile_grid);
  return style([connections, walls, splines]);
}

function slurp_json(file) {
  const reader = new FileReader();
  const promise = new Promise((resolve, reject) => {
    reader.addEventListener("load", (/** @type {ProgressEvent} */ e) => {
      try {
        //@ts-ignore
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
  let maze;
  let tileset;
  let tiles;
  let dynamic_primitives;

  function update_maze() {
    maze = generate_maze(GRID_ROWS, GRID_COLS);
    update_geometry();
  }

  function update_geometry() {
    if (tileset) {
      tiles = make_tiles_from_tileset(maze, tileset.coral_tiles);
    } else {
      tiles = make_default_tiles(maze);
    }

    dynamic_primitives = render_geometry(tiles);
  }

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);

    update_maze();

    document.getElementById("import").addEventListener("input", async (e) => {
      clear_errors();
      try {
        //@ts-ignore
        tileset = await import_tileset(e.target.files);
        update_geometry();
      } catch (err) {
        console.error(err);
        show_error(err);
      }
    });

    document.getElementById("regen").addEventListener("click", update_maze);
  };

  p.draw = () => {
    p.background(0);
    draw_primitive(p, QUAD_GROUP);
    draw_primitive(p, dynamic_primitives);
  };
};
