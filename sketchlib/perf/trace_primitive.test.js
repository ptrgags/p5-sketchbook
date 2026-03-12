import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/Point.js";
import { trace_primitive } from "./trace_primitive.js";
import { GroupPrimitive } from "../primitives/GroupPrimitive.js";
import { group, style, xform } from "../primitives/shorthand.js";
import { Circle } from "../primitives/Circle.js";
import { Style } from "../Style.js";
import { Color } from "../Color.js";
import { Transform } from "../primitives/Transform.js";
import { Direction } from "../pga2d/Direction.js";
import { TextStyle } from "../primitives/TextStyle.js";
import { TextPrimitive } from "../primitives/TextPrimitive.js";
import { ClipPrimitive } from "../primitives/ClipPrimitive.js";
import { InvMask, Mask } from "../primitives/ClipMask.js";
import { VectorTangle } from "../primitives/VectorTangle.js";
import { LayerPrimitive } from "../primitives/LayerPrimitive.js";
import { CTile } from "../cga2d/CTile.js";
import { NullPoint } from "../cga2d/NullPoint.js";
import { Cline } from "../cga2d/Cline.js";

const STYLE = new Style({
  stroke: Color.RED,
});

const TRANSLATE = new Transform(new Direction(3, -4));

const TEXT_STYLE = new TextStyle(24, "left", "top");

describe("trace_primitive", () => {
  it("with basic primitive returns constructor name", () => {
    const prim = new Point(3, 4);

    const result = trace_primitive(prim);

    const expected = "Point";
    expect(result).toEqual(expected);
  });

  describe("simple group", () => {
    it("with empty simple group returns correct stats", () => {
      const result = trace_primitive(group());

      const expected = {
        type: "group",
        push_pop_count: 0,
        simple_prim_count: 0,
        children: [],
      };
      expect(result).toEqual(expected);
    });

    it("with simple group returns correct stats", () => {
      const result = trace_primitive(
        group(new Point(3, 4), new Circle(new Point(5, 6), 10)),
      );

      const expected = {
        type: "group",
        push_pop_count: 0,
        simple_prim_count: 2,
        children: ["Point", "Circle"],
      };
      expect(result).toEqual(expected);
    });
  });

  describe("group primitive", () => {
    it("with empty group computes correct stats", () => {
      const result = trace_primitive(new GroupPrimitive([]));

      const expected = {
        type: "group",
        has_style: false,
        has_text_style: false,
        has_transform: false,
        push_pop_count: 0,
        simple_prim_count: 0,
        children: [],
      };
      expect(result).toEqual(expected);
    });

    it("with group with primitives but no styles returns correct stats", () => {
      const prim = new GroupPrimitive([
        new Point(1, 3),
        new Circle(new Point(1, 2), 1),
      ]);

      const result = trace_primitive(prim);

      const expected = {
        type: "group",
        has_style: false,
        has_transform: false,
        has_text_style: false,
        push_pop_count: 0,
        simple_prim_count: 2,
        children: ["Point", "Circle"],
      };
      expect(result).toEqual(expected);
    });

    it("with styled primitive returns correct stats", () => {
      const prim = style(new Point(3, 4), STYLE);

      const result = trace_primitive(prim);

      const expected = {
        type: "group",
        has_style: true,
        has_transform: false,
        has_text_style: false,
        push_pop_count: 0,
        simple_prim_count: 1,
        children: ["Point"],
      };
      expect(result).toEqual(expected);
    });

    it("with transformed primitive returns correct stats", () => {
      const prim = xform(new Point(3, 4), TRANSLATE);

      const result = trace_primitive(prim);

      const expected = {
        type: "group",
        has_style: false,
        has_transform: true,
        has_text_style: false,
        push_pop_count: 1,
        simple_prim_count: 1,
        children: ["Point"],
      };
      expect(result).toEqual(expected);
    });

    it("with primitive with text style returns correct stats", () => {
      const prim = new GroupPrimitive(
        new TextPrimitive("hello", new Point(3, 4)),
        { text_style: TEXT_STYLE },
      );

      const result = trace_primitive(prim);

      const expected = {
        type: "group",
        has_style: false,
        has_transform: false,
        has_text_style: true,
        push_pop_count: 0,
        simple_prim_count: 1,
        children: ["TextPrimitive"],
      };
      expect(result).toEqual(expected);
    });

    it("with children aggregates stats", () => {
      const prim = group(
        group(new Point(3, 4), new Point(4, 5)),
        style(new Point(3, 4), STYLE),
        new ClipPrimitive(
          new Mask(new Circle(Point.ORIGIN, 500)),
          new Circle(new Point(400, 400), 200),
        ),
        new Point(3, 4),
      );

      const result = trace_primitive(prim);

      const expected = {
        type: "group",
        push_pop_count: 1,
        simple_prim_count: 6,
        children: [
          {
            type: "group",
            push_pop_count: 0,
            simple_prim_count: 2,
            children: ["Point", "Point"],
          },
          {
            type: "group",
            has_style: true,
            has_text_style: false,
            has_transform: false,
            push_pop_count: 0,
            simple_prim_count: 1,
            children: ["Point"],
          },
          {
            type: "clip",
            children: ["Circle"],
            mask: {
              type: "mask",
              children: ["Circle"],
              simple_prim_count: 1,
              push_pop_count: 0,
            },
            push_pop_count: 1,
            simple_prim_count: 2,
          },
          "Point",
        ],
      };
      expect(result).toEqual(expected);
    });
  });

  describe("vector tangle", () => {
    it("with empty tangle returns correct stats", () => {
      const prim = new VectorTangle([]);

      const result = trace_primitive(prim);

      const expected = {
        type: "vector-tangle",
        push_pop_count: 0,
        simple_prim_count: 0,
        children: [],
      };
      expect(result).toEqual(expected);
    });

    it("with decoration returns correct stats", () => {
      const prim = new VectorTangle([], new Point(3, 4));

      const result = trace_primitive(prim);

      const expected = {
        type: "vector-tangle",
        push_pop_count: 0,
        simple_prim_count: 1,
        children: ["Point"],
      };
      expect(result).toEqual(expected);
    });

    it("with panels returns stats for each panel", () => {
      const prim = new VectorTangle([
        [new Mask(new Circle(Point.ORIGIN, 100)), group(new Point(3, 4))],
        [new InvMask(new Circle(Point.ORIGIN, 100)), new Point(3, 5)],
      ]);

      const result = trace_primitive(prim);

      const expected = {
        type: "vector-tangle",
        // 2 panels
        // 1 for the group inside the first panel
        // 1 for the decoration empty group
        push_pop_count: 2,
        simple_prim_count: 4,
        children: [
          {
            type: "tangle-panel",
            push_pop_count: 1,
            simple_prim_count: 2,
            mask: {
              type: "mask",
              push_pop_count: 0,
              simple_prim_count: 1,
              children: ["Circle"],
            },
            children: [
              {
                type: "group",
                push_pop_count: 0,
                simple_prim_count: 1,
                children: ["Point"],
              },
            ],
          },
          {
            type: "tangle-panel",
            push_pop_count: 1,
            simple_prim_count: 2,
            mask: {
              type: "inv-mask",
              push_pop_count: 0,
              simple_prim_count: 1,
              children: ["Circle"],
            },
            children: ["Point"],
          },
        ],
      };
      expect(result).toEqual(expected);
    });
  });

  describe("clip primitive", () => {
    it("with simple primitive returns correct stats", () => {
      const prim = new ClipPrimitive(
        new Mask(new Circle(Point.ORIGIN, 500)),
        new Point(1, 2),
      );

      const result = trace_primitive(prim);

      const expected = {
        type: "clip",
        mask: {
          type: "mask",
          push_pop_count: 0,
          simple_prim_count: 1,
          children: ["Circle"],
        },
        push_pop_count: 1,
        simple_prim_count: 2,
        children: ["Point"],
      };
      expect(result).toEqual(expected);
    });

    it("with group primitive aggregates stats", () => {
      const prim = new ClipPrimitive(
        new Mask(new Circle(Point.ORIGIN, 500)),
        style([new Point(1, 2), new Point(3, 4)], STYLE),
      );

      const result = trace_primitive(prim);

      const expected = {
        type: "clip",
        push_pop_count: 1,
        simple_prim_count: 3,
        mask: {
          type: "mask",
          push_pop_count: 0,
          simple_prim_count: 1,
          children: ["Circle"],
        },
        children: [
          {
            type: "group",
            has_style: true,
            has_text_style: false,
            has_transform: false,
            push_pop_count: 0,
            simple_prim_count: 2,
            children: ["Point", "Point"],
          },
        ],
      };
      expect(result).toEqual(expected);
    });

    it("with group in mask aggregates stats", () => {
      const prim = new ClipPrimitive(
        new Mask(
          style([new Point(1, 2), new Point(3, 4)], STYLE),
          group(new Point(3, 2)),
        ),
        new Circle(Point.ORIGIN, 500),
      );

      const result = trace_primitive(prim);

      const expected = {
        type: "clip",
        push_pop_count: 1,
        simple_prim_count: 4,
        mask: {
          type: "mask",
          push_pop_count: 0,
          simple_prim_count: 3,
          children: [
            {
              type: "group",
              has_style: true,
              has_text_style: false,
              has_transform: false,
              push_pop_count: 0,
              simple_prim_count: 2,
              children: ["Point", "Point"],
            },
            {
              type: "group",
              push_pop_count: 0,
              simple_prim_count: 1,
              children: ["Point"],
            },
          ],
        },
        children: ["Circle"],
      };
      expect(result).toEqual(expected);
    });
  });

  it("with layer primitive aggregates child layers", () => {
    const prim = new LayerPrimitive(
      [
        { layers: [new Point(3, 4), new Circle(new Point(1, 1), 10)] },
        { layers: [new Point(1, 2), new Point(1, 1)] },
      ],
      [undefined, new Style({})],
    );

    const result = trace_primitive(prim);

    const expected = {
      type: "layers",
      push_pop_count: 0,
      simple_prim_count: 4,
      children: [
        {
          type: "group",
          children: ["Point", "Point"],
          push_pop_count: 0,
          simple_prim_count: 2,
        },
        {
          type: "group",
          has_style: true,
          has_transform: false,
          has_text_style: false,
          children: ["Circle", "Point"],
          push_pop_count: 0,
          simple_prim_count: 2,
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  it("with conformal tile aggregates child primitives", () => {
    const tile = new CTile(
      NullPoint.ORIGIN,
      new CTile(Cline.UNIT_CIRCLE, Cline.X_AXIS),
    );

    const result = trace_primitive(tile);

    const expected = {
      type: "ctile",
      push_pop_count: 0,
      simple_prim_count: 3,
      children: [
        "NullPoint",
        {
          type: "ctile",
          push_pop_count: 0,
          simple_prim_count: 2,
          children: ["Cline", "Cline"],
        },
      ],
    };
    expect(result).toEqual(expected);
  });
});
