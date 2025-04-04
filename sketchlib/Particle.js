export class Particle {
  constructor(position, velocity) {
    this.position = position;
    this.velocity = velocity;
  }

  update(dt, acceleration) {
    this.velocity += acceleration.scale(dt);
    this.position += this.velocity.scale(dt);
  }
}
