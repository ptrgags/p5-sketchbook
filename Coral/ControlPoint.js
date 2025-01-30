export class ControlPoint {
  constructor(position, tangent) {
    this.position = position;
    this.tangent = tangent;
  }

  get forward_point() {
    return this.position.add(this.tangent);
  }

  get backward_point() {
    return this.position.sub(this.tangent);
  }
}
