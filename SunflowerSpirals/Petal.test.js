import { Polar } from "../sketchlib/Polar.js";
import { Petal } from "./Petal.js";
import { describe, it, expect } from "vitest";

// Since I might tweak the exact sizing of the petal, these
// tests just check the relative relationship between the vertices.
describe("Petal", () => {
  it("If anchor point is too close to the origin, inner vertices are snapped to the origin", () => {
    const anchor_point = new Polar(1, Math.PI);

    const petal = new Petal(anchor_point, 1);

    expect(petal.start.r).toBe(0);
    expect(petal.side_cw.r).toBe(0);
  });

  it("the start, tip control point, and tip are colinear with the anchor point", () => {
    const center_angle = 1.0;
    const anchor_point = new Polar(100, center_angle);
    const size = 10;

    const petal = new Petal(anchor_point, size);
    const theta_start = petal.start.theta;
    const theta_control_tip = petal.control_tip.theta;
    const theta_tip = petal.tip.theta;

    expect(theta_start).toBe(center_angle);
    expect(theta_control_tip).toBe(center_angle);
    expect(theta_tip).toBe(center_angle);
  });

  it("Points on center line are in correct order: start, anchor, tip control, tip", () => {
    const r_anchor = 100;
    const anchor_point = new Polar(r_anchor, Math.PI);
    const size = 10;

    const petal = new Petal(anchor_point, size);
    const r_start = petal.start.r;
    const r_control_tip = petal.control_tip.r;
    const r_tip = petal.tip.r;

    expect(r_start).toBeLessThan(r_anchor);
    expect(r_anchor).toBeLessThan(r_control_tip);
    expect(r_control_tip).toBeLessThan(r_tip);
  });

  it("The corresponding side and side control points are colinear", () => {
    const anchor_point = new Polar(100, Math.PI);
    const size = 10;

    const petal = new Petal(anchor_point, size);

    expect(petal.side_ccw.theta).toBe(petal.control_ccw.theta);
    expect(petal.side_cw.theta).toBe(petal.control_cw.theta);
  });

  it("The side control points are further away from the origin than the side vertices", () => {
    const anchor_point = new Polar(100, Math.PI);
    const size = 10;

    const petal = new Petal(anchor_point, size);

    expect(petal.side_ccw.r).toBeLessThan(petal.control_ccw.r);
    expect(petal.side_cw.r).toBeLessThan(petal.control_cw.r);
  });

  it("The corresponding CW and CCW points have the same radius", () => {
    const anchor_point = new Polar(100, Math.PI);
    const size = 10;

    const petal = new Petal(anchor_point, size);

    expect(petal.side_ccw.r).toBe(petal.side_cw.r);
    expect(petal.control_ccw.r).toBe(petal.control_cw.r);
  });

  it("The CW and CCW sides are displaced symmetrically from the center line", () => {
    const theta_anchor = Math.PI;
    const anchor_point = new Polar(100, theta_anchor);
    const size = 10;

    const petal = new Petal(anchor_point, size);

    const diff_cw = anchor_point.theta - petal.side_cw.theta;
    const diff_ccw = petal.side_ccw.theta - anchor_point.theta;
    expect(diff_cw).toBe(diff_ccw);
  });
});
