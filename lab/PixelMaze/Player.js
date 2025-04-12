import { sec_to_frames, Tween } from "../../sketchlib/Tween.js";
import { Direction, to_y_down } from "../../sketchlib/Direction.js";
import { Index2D } from "../../sketchlib/Grid.js";
import { Tiles } from "./make_maze.js";
import { Tilemap } from "./Tilemap.js";
import { DirectionInput } from "../lablib/DirectionInput.js";

const TILE_SIZE = 16;

const MovementState = {
  IDLE: 0,
  MOVING: 1,
};
Object.freeze(MovementState);

// How fast to update the animation t value for sprites
const ANIMATION_SPEED_SLOW = 0.1;
const ANIMATION_SPEED_MEDIUM = 0.2;
const ANIMATION_SPEED_FAST = 0.41;

// How long the position tweens should take
const DURATION_WALK = sec_to_frames(0.1);
const DURATION_WALK_IN_PLACE = sec_to_frames(0.2);

export class Player {
  constructor(walk_sprites, idle_sprites, position) {
    this.position = position;
    this.direction = Direction.RIGHT;
    this.walk_sprites = walk_sprites;
    this.idle_sprites = idle_sprites;

    this.state = MovementState.IDLE;

    this.animation_t = 0;
    this.animation_speed = ANIMATION_SPEED_SLOW;

    this.input_direction = undefined;

    this.movement_tween = undefined;

    this.is_running = false;
  }

  /**
   * Handle an arrow/WASD/virtual D-pad input event. This works for both
   * pressed/released events, as we only care about the current state.
   * @param {DirectionInput} input The directional input from a DirectionalPad
   */
  handle_direction_input(input) {
    this.input_direction = input.digital;
  }

  /**
   * Handle the run button pressed.
   * @param {boolean} run_button_pressed True if the run button is pressed
   */
  handle_run(run_button_pressed) {
    this.is_running = run_button_pressed;
  }

  find_destination_cell(tilemap, position, direction) {
    const { x, y } = position;
    const cell_id = new Index2D(y / TILE_SIZE, x / TILE_SIZE);

    const indices = tilemap.indices;
    const neighbor = indices.get_neighbor(cell_id, direction);

    // Check for obstacles in our path
    if (neighbor === undefined || indices.get(neighbor) !== Tiles.FLOOR) {
      return undefined;
    }

    // Move to the adjacent cell
    const offset = to_y_down(direction).scale(TILE_SIZE);
    return this.position.add(offset);
  }

  start_moving(tilemap, start_frame) {
    const destination = this.find_destination_cell(
      tilemap,
      this.position,
      this.input_direction
    );

    if (destination !== undefined) {
      this.movement_tween = Tween.point(
        this.position,
        destination,
        start_frame,
        DURATION_WALK
      );
      this.animation_speed = ANIMATION_SPEED_MEDIUM;
    } else {
      // Walk in place by setting start and end position to the current
      // position
      this.movement_tween = Tween.point(
        this.position,
        this.position,
        start_frame,
        DURATION_WALK_IN_PLACE
      );
      // Render the walk cycle slower to look like we're obstructed
      this.animation_speed = ANIMATION_SPEED_SLOW;
    }

    this.state = MovementState.MOVING;
  }

  /**
   * Update logic for the IDLE state
   * @param {number} frame The frame number
   * @param {Tilemap} tilemap the tilemap
   */
  update_idle(frame, tilemap) {
    if (this.input_direction === this.direction) {
      this.start_moving(tilemap, frame);
    } else if (this.input_direction !== undefined) {
      // turn in place
      this.direction = this.input_direction;
    }
  }

  /**
   * update logic for the MOVING state
   * @param {number} frame The frame number
   * @param {Tilemap} tilemap the tilemap
   */
  update_moving(frame, tilemap) {
    const is_done = this.movement_tween.is_done(frame);
    if (is_done && this.input_direction !== undefined) {
      // still moving, so restart the animation
      this.position = this.movement_tween.end_value;
      this.start_moving(tilemap, frame);
      this.direction = this.input_direction;
    } else if (is_done) {
      // go back to idling
      this.position = this.movement_tween.end_value;
      this.state = MovementState.IDLE;
      this.animation_speed = ANIMATION_SPEED_SLOW;
      this.movement_tween = undefined;
      this.destination = undefined;
    }
  }

  /**
   *
   * @param {number} frame The frame number
   * @param {Tilemap} tilemap The tilemap
   */
  update(frame, tilemap) {
    // Update the animation
    this.animation_t += this.is_running
      ? ANIMATION_SPEED_FAST
      : this.animation_speed;

    if (this.state === MovementState.IDLE) {
      this.update_idle(frame, tilemap);
    } else {
      this.update_moving(frame, tilemap);
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
