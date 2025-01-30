import { Grid, Index2D } from "../sketchlib/Grid.js";

const MAX_GROWTH_STEPS = 2000;
const BUD_TIME = 10;
const EARLY_GROWTH_TIME = 10;

class Node {
  constructor(index, parent_index, growth_step) {
    this.index = index;
    this.parent_index = parent_index;
    this.growth_step = growth_step;

    // The leaf nodes are flowers. Assume a leaf until
    // this node is grown.
    this.is_flower = false;
  }
}

export class Growth {
  constructor(grid_width, grid_height, start_x, start_y) {
    this.grid_width = grid_width;
    this.grid_height = grid_height;

    this.grid = new Grid(grid_height, grid_width);

    const start_index = new Index2D(start_y, start_x);
    this.grid.set_2d(start_index, new Node(start_index, undefined, 0));

    // Start simple with a stack
    this.frontier = [start_index];

    this.growth_step = 0;
  }

  neighbor_indices(index) {
    const neighbors = [];

    // List neighbors in order from bottom to top so
    // when we push to the stack we favor upwards growth

    // left
    const left = index.left();
    if (left) {
      neighbors.push(left);
    }

    // right
    const right = this.grid.right(index);
    if (right) {
      neighbors.push(right);
    }

    // up
    const up = index.up();
    if (up) {
      neighbors.push(up);
    }

    return neighbors;
  }

  // Grow one simulation step (if possible)
  grow_step() {
    // Always keep the simulation time ticking so flowers grow
    // even if we stop early.
    const step = this.growth_step;
    this.growth_step++;

    // Stop when the stack is empty
    if (this.frontier.length === 0) {
      console.log("Done growing!");
      return;
    }

    if (step > MAX_GROWTH_STEPS) {
      console.log("Max growth reached!");
      return;
    }

    // Pop the top node from the stack
    const current_index = this.frontier.pop();

    // Get the possible neighbors
    const possible_neighbors = this.neighbor_indices(current_index);

    // Neighbors are only valid if that grid cell is empty
    const valid_neighbors = possible_neighbors.filter(
      (index) => this.grid.get_2d(index) === undefined
    );

    // For the first few steps, make the chance of skipping low
    const skip_chance = step < EARLY_GROWTH_TIME ? 0.1 : 0.45;

    let added_branches = false;
    for (const neighbor_index of valid_neighbors) {
      // Flip a coin. If heads, skip this neighbor.
      if (Math.random() < skip_chance) {
        continue;
      }

      this.grid.set_2d(
        neighbor_index,
        new Node(neighbor_index, current_index, this.growth_step)
      );
      this.frontier.push(neighbor_index);
      added_branches = true;
    }

    // Every once and a while, shuffle the list so the growth
    // happens all over, not just DFS
    if (step % 20 === 0) {
      this.shuffle();
    }

    // If we didn't add branches, mark this node as a flower
    if (!added_branches) {
      this.grid.get_2d(current_index).is_flower = true;
    }
  }

  shuffle() {
    const array = this.frontier;
    for (let i = array.length - 1; i >= 1; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[j], array[i]] = [array[i], array[j]];
    }
  }

  draw(p, spacing, stem_color, flower_color) {
    const flowers = [];
    for (const node of this.grid) {
      if (node === undefined) {
        continue;
      }

      // Draw a stem connecting this node to the parent
      p.fill(stem_color);
      p.noFill();
      if (node.parent_index !== undefined) {
        const { i, j } = node.index;
        const { i: pi, j: pj } = node.parent_index;
        p.line(j * spacing, i * spacing, pj * spacing, pi * spacing);
      }

      // Mark flower nodes for drawing that in the second pass
      if (node.is_flower) {
        flowers.push(node);
      }
    }

    p.fill(flower_color);
    p.noStroke();
    for (const flower_node of flowers) {
      // Only draw the flower if the node has been around for a while
      if (this.growth_step - flower_node.growth_step <= BUD_TIME) {
        continue;
      }

      const { i, j } = flower_node.index;
      p.ellipse(j * spacing, i * spacing, 6);
    }
  }
}
