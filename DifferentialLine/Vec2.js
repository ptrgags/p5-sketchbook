class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  draw(radius) {
    ellipse(this.x, this.y, 2 * radius, 2 * radius);
  }
  
  static add(v1, v2) {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
  }
  
  static sub(v1, v2) {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
  }
  
  static length(v) {
    return v.x * v.x + v.y * v.y;
  }
  
  static normalize(v) {
    const len = this.length(v);
    return new Vec2(v.x / len, v.y / len);
  }
  
  static scale(v, scale) {
    return new Vec2(v.x * scale, v.y * scale);
  }
  
  static lerp(v1, v2, t) {
    const s = 1.0 - t;
    const x = s * v1.x + t * v2.x;
    const y = s * v1.y + t * v2.y; 
    return new Vec2(x, y);
  }
  
  static midpoint(v1, v2) {
    const x = (v1.x + v2.x) / 2;
    const y = (v1.y + v2.y) / 2;
    return new Vec2(x, y);
  }
  
  static draw_line(v1, v2) {
    line(v1.x, v1.y, v2.x, v2.y);
  }
}
