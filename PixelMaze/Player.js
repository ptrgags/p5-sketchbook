import { sec_to_frames, Tween } from "../MosaicSlider/Tween.js";
import { Direction, to_y_down } from "../sketchlib/Direction.js";

const TILE_SIZE = 16;

const MovementState = {
  IDLE: 0,
  MOVING: 1,
};
Object.freeze(MovementState);

const SPEED_SLOW = 0.1;
const SPEED_MEDIUM = 0.2;
const SPEED_FAST = 0.4;

const WALK_DURATION = sec_to_frames(0.2);

export class Player {
  constructor(walk_sprites, idle_sprites, position) {
    this.position = position;
    this.direction = Direction.RIGHT;
    this.walk_sprites = walk_sprites;
    this.idle_sprites = idle_sprites;

    this.state = MovementState.IDLE;

    this.animation_t = 0;
    this.animation_speed = SPEED_MEDIUM;

    this.input_direction = undefined;

    this.movement_tween = undefined;
  }

  handle_input(direction) {
    this.input_direction = direction;
  }

  update_idle(frame) {
    if (this.input_direction === this.direction) {
      const offset = to_y_down(this.input_direction).scale(TILE_SIZE);
      const destination = this.position.add(offset);
      this.movement_tween = new Tween(
        this.position,
        destination,
        frame,
        WALK_DURATION
      );
      this.state = MovementState.MOVING;
    } else if (this.input_direction !== undefined) {
      // turn in place
      this.direction = this.input_direction;
    }
  }

  update_moving(frame) {
    const is_done = this.movement_tween.is_done(frame);
    if (is_done && this.input_direction !== undefined) {
      // still moving, so restart the animation
      this.position = this.movement_tween.end_value;
      const offset = to_y_down(this.input_direction).scale(TILE_SIZE);
      const destination = this.position.add(offset);
      this.movement_tween = new Tween(
        this.position,
        destination,
        frame,
        WALK_DURATION
      );
      this.direction = this.input_direction;
    } else if (is_done) {
      // go back to idling
      this.position = this.movement_tween.end_value;
      this.state = MovementState.IDLE;
      this.movement_tween = undefined;
      this.destination = undefined;
    }
  }

  update(frame) {
    // Update the animation
    this.animation_t += this.animation_speed;

    if (this.state === MovementState.IDLE) {
      this.update_idle(frame);
    } else {
      this.update_moving(frame);
    }
  }

  draw(frame) {
    if (this.state === MovementState.IDLE) {
      return {
        position: this.position,
        sprite: this.idle_sprites[this.direction],
        t: this.animation_t,
      };
    }

    // moving
    const position = this.movement_tween.get_value(frame);
    return {
      position,
      sprite: this.walk_sprites[this.direction],
      t: this.animation_t,
    };
  }
}
