import { describe, it, expect } from "vitest";
import { LayerPrimitive } from "./LayerPrimitive.js";
import { Primitive } from "./Primitive.js";
import { Color } from "../Color.js";
import { Style } from "../Style.js";
import { group, style } from "./shorthand.js";
import { Point } from "../pga2d/Point.js";
import { Transform } from "./Transform.js";
import { Direction } from "../pga2d/Direction.js";
import { GroupPrimitive } from "./GroupPrimitive.js";

/**
 *
 * @param {Primitive[]} primitives
 * @returns
 */
function stub_render_layers(primitives) {
  return {
    layers: primitives,
  };
}

const STYLE = new Style({
  stroke: Color.BLUE,
});
const STYLE2 = new Style({
  fill: Color.RED,
});

describe("LayerPrimitive", () => {
  it("with no primitives creates no groups", () => {
    const layers = new LayerPrimitive([], []);

    const result = layers.groups;

    const expected = [];
    expect(result).toEqual(expected);
  });

  it("with wrong number of layers throws error", () => {
    const layers = stub_render_layers([Primitive.EMPTY, Primitive.EMPTY]);

    expect(() => {
      // each set of layers has 2 layers, but we only provided one style
      return new LayerPrimitive([layers, layers], [STYLE]);
    }).toThrowError("every instance must have the same length as settings");
  });

  it("with mismatched layer lengths throws error", () => {
    const layers1 = stub_render_layers([Primitive.EMPTY, Primitive.EMPTY]);
    const layers2 = stub_render_layers([Primitive.EMPTY]);

    expect(() => {
      return new LayerPrimitive([layers1, layers2], [STYLE, STYLE]);
    }).toThrowError("every instance must have the same length as settings");
  });

  it("with undefined settings creates simple groups", () => {
    const point = new Point(3, 4);
    const layers = stub_render_layers([Primitive.EMPTY, point]);
    const layer_prim = new LayerPrimitive(
      [layers, layers],
      [undefined, undefined],
    );

    const result = layer_prim.groups;

    const expected = [
      group(Primitive.EMPTY, Primitive.EMPTY),
      group(point, point),
    ];
    expect(result).toEqual(expected);
  });

  it("with style creates styled groups", () => {
    const point = new Point(3, 4);
    const layers = stub_render_layers([Primitive.EMPTY, point]);
    const layer_prim = new LayerPrimitive([layers, layers], [STYLE, STYLE2]);

    const result = layer_prim.groups;

    const expected = [
      style([Primitive.EMPTY, Primitive.EMPTY], STYLE),
      style([point, point], STYLE2),
    ];
    expect(result).toEqual(expected);
  });

  it("with group settings creates group primitives", () => {
    const settings1 = {
      style: STYLE,
    };
    const settings2 = {
      transform: new Transform(Direction.DIR_X),
    };

    const point = new Point(3, 4);
    const layers = stub_render_layers([Primitive.EMPTY, point]);
    const layer_prim = new LayerPrimitive(
      [layers, layers],
      [settings1, settings2],
    );

    const result = layer_prim.groups;

    const expected = [
      new GroupPrimitive([Primitive.EMPTY, Primitive.EMPTY], settings1),
      new GroupPrimitive([point, point], settings2),
    ];
    expect(result).toEqual(expected);
  });
});
