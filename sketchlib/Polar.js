export class Polar {
  constructor(r, theta) {
    this.r = r;
    this.theta = theta;
  }

  get x() {
    return this.r * Math.cos(this.theta);
  }

  get y() {
    return this.r * Math.sin(this.theta);
  }
}
