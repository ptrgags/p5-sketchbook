// This file is called AcmeVector because p5.js alphabetically sorts imports and that causes dependency issues :(

class Vector2 {
  constructor(x=0, y=0) {
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
  
  set_magnitude(magnitude) {
    const old_magnitude = this.get_length();
    if (old_magnitude !== 0) {
      this.scale(magnitude / old_magnitude);
    }
  }
  
  limit(maximum) {
    const old_magnitude = this.get_length();
    const magnitude = Math.min(old_magnitude, maximum);
    this.set_magnitude(magnitude);
  }
  
  normalize() {
    const magnitude = this.get_length();
    if (magnitude !== 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
  }
  
  static distance(v1, v2) {
    const x = v2.x - v1.x;
    const y = v2.y - v2.y;
    return Math.sqrt(x * x + y * y);
  }
  
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }
}
