import { describe, it, expect } from "vitest";
import { Style } from "./Style";
import { Color } from "./Color";


describe("Style", () => {
  it("constructor with empty object returns transparent style", () => {
    const style = new Style({});

    expect(style.stroke).toBeUndefined();
    expect(style.fill).toBeUndefined();
    expect(style.stroke_width).toBe(1);
  });

  it("constructor configures style settings", () => {
    const style = new Style({
      stroke: Color.RED,
      fill: Color.BLUE,
      width: 4,
    });

    expect(style.stroke).toEqual(Color.RED);
    expect(style.fill).toEqual(Color.BLUE);
    expect(style.stroke_width).toBe(4);
  });

  it("with_stroke creates a new style with a different stroke color", () => {
    const style = Style.DEFAULT_STROKE_FILL;

    const result = style.with_stroke(Color.RED);

    expect(result).not.toBe(style);
    expect(result.stroke).toEqual(Color.RED);
    expect(result.fill).toEqual(style.fill);
    expect(result.stroke_width).toEqual(style.stroke_width);
  });

  it("with_fill creates a new style with a different fill color", () => {
    const style = Style.DEFAULT_STROKE_FILL;

    const result = style.with_fill(Color.RED);

    expect(result).not.toBe(style);
    expect(result.stroke).toEqual(style.stroke);
    expect(result.fill).toEqual(Color.RED);
    expect(result.stroke_width).toEqual(style.stroke_width);
  });

  it("with_width creates a new style with a different fill color", () => {
    const style = Style.DEFAULT_STROKE_FILL;

    const result = style.with_width(10);

    expect(result).not.toBe(style);
    expect(result.stroke).toEqual(style.stroke);
    expect(result.fill).toEqual(style.fill);
    expect(result.stroke_width).toEqual(10);
  });
});
