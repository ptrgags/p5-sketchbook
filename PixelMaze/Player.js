import { GridDirection } from "../sketchlib/GridDiection.js";

const MovementState = {
  IDLE: 0,
  MOVING: 0,
};

const SPEED_SLOW = 0.1;
const SPEED_MEDIUM = 0.2;
const SPEED_FAST = 0.4;

export class Player {
  constructor(walk_sprites, idle_sprites, position) {
    this.position = position;
    this.direction = GridDirection.RIGHT;
    this.walk_sprites = walk_sprites;
    this.idle_sprites = idle_sprites;

    this.state = MovementState.IDLE;

    this.animation_t = 0;
    this.animation_speed = SPEED_MEDIUM;

    this.input_direction = undefined;
  }

  handle_input(direction) {
    this.input_direction = direction;

    if (direction !== undefined) {
      this.direction = direction;
    }
  }

  update() {
    // Update the animation
    this.animation_t += this.animation_speed;
  }

  draw() {
    const directonal_sprites =
      this.state === MovementState.IDLE ? this.idle_sprites : this.walk_sprites;
    const sprite = directonal_sprites[this.direction];

    return {
      position: this.position,
      sprite,
      t: this.animation_t,
    };
  }
}
