// This file is called AcmeVector because p5.js alphabetically sorts imports and that causes dependency issues :(

class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  clone_from(other) {
    this.x = other.x;
    this.y = other.y;
  }
  
  set_zero() {
    this.x = 0;
    this.y = 0;
  }
  
  add(other) {
    this.x += other.x;
    this.y += other.y;
  }
  
  sub(other) {
    this.x -= other.x;
    this.y -= other.y;
  }
  
  scale(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }
  
  get_length() {
    const x = this.x;
    const y = this.y;
    return Math.sqrt(x * x + y * y);
  }
}
