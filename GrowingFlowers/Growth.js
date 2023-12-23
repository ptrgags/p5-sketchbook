const MAX_GROWTH_STEPS = 500;
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

class Growth {
    constructor(grid_width, grid_height, start_x, start_y) {
        this.grid_width = grid_width;
        this.grid_height = grid_height;

        this.grid = new Array(grid_width * grid_height);

        const start_index = this.hash(start_x, start_y);
        this.grid[start_index] = new Node(start_index, undefined, 0);

        // Start simple with a stack
        this.frontier = [start_index];

        this.growth_step = 0;
    }

    hash(x, y) {
        return y * this.grid_width + x;
    }

    unhash(index) {
        return [
            index % this.grid_width,
            Math.floor(index / this.grid_width)
        ];
    }

    neighbor_indices(index) {
        const [x, y] = this.unhash(index);
        const neighbors = [];

        // List neighbors in order from bottom to top so
        // when we push to the stack we favor upwards growth

        // down
        /*
        if (y < this.grid_width - 1) {
            neighbors.push(index + this.grid_width);
        }
        */

        // left
        if (x > 0) {
            neighbors.push(index - 1);
        }

        // right
        if (x < this.grid_width - 1) {
            neighbors.push(index + 1);
        }

        // up
        if (y > 0) {
            neighbors.push(index - this.grid_width);
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
            // Still keep the simulat
            console.log("Max growth reached!");
            return;
        }

        // Pop the top node from the stack
        const current_index = this.frontier.pop();

        // Get the possible neighbors
        const possible_neighbors = this.neighbor_indices(current_index);

        // Neighbors are only valid if 
        const valid_neighbors = possible_neighbors.filter(
            (i) => this.grid[i] === undefined
        );

        // For the first few steps, make the chance of skipping low
        const skip_chance = step < EARLY_GROWTH_TIME ? 0.1 : 0.45;

        let added_branches = false;
        for (const neighbor_index of valid_neighbors) {
            // Flip a coin. If heads, skip this neighbor.
            if (Math.random() < skip_chance) {
                continue;
            }

            this.grid[neighbor_index] = new Node(neighbor_index, current_index, this.growth_step);
            this.frontier.push(neighbor_index);
            added_branches = true;
        }

        // If we didn't add branches, mark this node as a flower
        if (!added_branches) {
            this.grid[current_index].is_flower = true;
        }
    }

    draw(spacing, stem_color, flower_color) {
        const flowers = [];
        for (const node of this.grid) {
            if (node === undefined) {
                continue;
            }

            // Draw a stem connecting this node to the parent
            fill(stem_color);
            noFill();
            if (node.parent_index !== undefined) {
                const [x, y] = this.unhash(node.index);
                const [px, py] = this.unhash(node.parent_index);
                line(x * spacing, y * spacing, px * spacing, py * spacing);
            }

            // Mark flower nodes for drawing that in the second pass
            if (node.is_flower) {
                flowers.push(node);
            }
        }

        fill(flower_color);
        noStroke();
        for (const flower_node of flowers) {
            // Only draw the flower if the node has been around for a while
            if (this.growth_step - flower_node.growth_step <= BUD_TIME) {
                continue;
            }

            const [x, y] = this.unhash(flower_node.index);
            ellipse(x * SPACING, y * SPACING, 6);
        }
    }
}