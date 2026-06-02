import { ToSVG } from "./primitives/ToSVG.js";

/**
 * Encode an object as an SVG tag
 * @param {ToSVG} svg_primitive An object that can be turned into SVG tags
 * @returns {SVGSVGElement} SVG element
 */
export function encode_svg(svg_primitive) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const content = svg_primitive.to_svg();
  svg.appendChild(content);
  return svg;
}

/**
 * Encode an object to an SVG tag, then convert it to a File object for
 * downloading
 * @param {ToSVG} svg_primitive
 * @param {string} filename A filename that must end in .svg
 * @returns {File} A file for downloading
 */
export function encode_svg_file(svg_primitive, filename) {
  if (!filename.endsWith(".svg")) {
    throw new Error("filename must end with .svg");
  }

  const svg = encode_svg(svg_primitive);
  const serializer = new XMLSerializer();
  const svg_str = serializer.serializeToString(svg);

  return new File([svg_str], filename, { type: "image/svg+xml;charset=utf-8" });
}
