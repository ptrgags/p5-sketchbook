import { Rect } from "../primitives/Rect.js";
import { ToSVG } from "./ToSVG.js";

/**
 * Encode an object as an SVG tag
 * @param {ToSVG} svg_primitive An object that can be turned into SVG tags
 * @param {Rect} [view_box] The bounding box to view
 * @returns {SVGSVGElement} SVG element
 */
export function encode_svg(svg_primitive, view_box) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");

  if (view_box) {
    const { x, y } = view_box.position;
    const { x: w, y: h } = view_box.dimensions;
    svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
  }

  const content = svg_primitive.to_svg();
  svg.appendChild(content);
  return svg;
}

/**
 * Encode an object to an SVG tag, then convert it to a File object for
 * downloading
 * @param {ToSVG} svg_primitive The primitive to convert to SVG
 * @param {string} filename A filename that must end in .svg
 * @param {Rect} [view_box] The bounding box to view
 * @returns {File} A file for downloading
 */
export function encode_svg_file(svg_primitive, filename, view_box) {
  if (!filename.endsWith(".svg")) {
    throw new Error("filename must end with .svg");
  }

  const svg = encode_svg(svg_primitive, view_box);
  const serializer = new XMLSerializer();
  const svg_str = serializer.serializeToString(svg);

  return new File([svg_str], filename, { type: "image/svg+xml;charset=utf-8" });
}
