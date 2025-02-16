export class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;

    // for convenience
    this.left = x;
    this.top = y;
    this.right = x + w;
    this.bottom = y + h;
  }

  contains(point) {
    return (
      this.left <= point.x &&
      point.x < this.right &&
      this.top <= point.y &&
      point.y < this.bottom
    );
  }

  intersects(other) {
    if (this.left > other.right || other.left > this.right) {
      return false;
    }

    if (this.top > other.bottom || other.top > this.bottom) {
      return false;
    }

    return true;
  }

  get_quadrant(point) {
    let x_bit = 0;
    if (point.x >= this.x + this.width / 2) {
      x_bit = 1;
    }

    let y_bit = 0;
    if (point.y >= this.y + this.height / 2) {
      y_bit = 1;
    }

    return (x_bit << 1) | y_bit;
  }

  subdivide() {
    const x = this.x;
    const y = this.y;
    const half_w = this.width / 2;
    const half_h = this.height / 2;
    const mid_x = x + half_w;
    const mid_y = y + half_h;

    return [
      new Rectangle(x, y, half_w, half_h),
      new Rectangle(x, mid_y, half_w, half_h),
      new Rectangle(mid_x, y, half_w, half_h),
      new Rectangle(mid_x, mid_y, half_w, half_h),
    ];
  }

  // for debugging
  draw(p) {
    p.noFill();
    p.stroke(0);
    p.strokeWeight(0.5);
    p.rect(this.x, this.y, this.width, this.height);
  }
}
