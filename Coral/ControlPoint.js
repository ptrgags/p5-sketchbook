import { add, sub } from "./vector.js";

export class ControlPoint {
  constructor(position, tangent) {
    this.position = position;
    this.tangent = tangent;
  }

  get forward_point() {
    return add(this.position, this.tangent);
  }

  get backward_point() {
    return sub(this.position, this.tangent);
  }
}
