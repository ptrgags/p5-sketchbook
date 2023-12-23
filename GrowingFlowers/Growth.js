class Node {
    constructor(index, parent_index) {
        this.index = index;
        this.parent_index = parent_index;

        // The leaf nodes are flowers. Assume a leaf until
        // this node is grown.
        this.is_flower = true;
    }
}

class Growth {
    constructor(grid_width, grid_height, start_x, start_y) {
        this.grid_width = grid_width;
        this.grid_height = grid_height;

        this.grid = new Array(grid_width * grid_height);

        const start_index = this.hash(start_x, start_y);
        this.grid[start_index] = new Node(start_index, undefined);

        // Start simple with a stack
        this.frontier = [start_index];
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

        // List neighbors in order from top to bottom
        // so we favor upwards growth if selected greedily

        // up
        if (y > 0) {
            neighbors.push(index - this.grid_width);
        }

        // left
        if (x > 0) {
            neighbors.push(index - 1);
        }

        // right
        if (x < this.grid_width - 1) {
            neighbors.push(index + 1)
        }

        // down
        if (y < this.grid_width - 1) {
            neighbors.push(index + this.grid_width);
        }

        return neighbors;
    }

    // Grow one simulation step (if possible)
    grow_step() {
        // Stop when the stack is empty
        if (this.frontier.length === 0) {
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

        for (const neighbor_index of valid_neighbors) {
            // Flip a coin. If heads, skip this neighbor.
            if (Math.random() < 0.5) {
                continue;
            }

            this.grid[neighbor_index] = new Node(neighbor_index, current_index);
            this.grid[current_index].is_flower = false;
            this.frontier.push(neighbor_index);
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
            const [x, y] = this.unhash(flower_node.index);
            ellipse(x * SPACING, y * SPACING, 6);
        }
    }
}