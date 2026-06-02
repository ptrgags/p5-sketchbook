/**
 * Shorthand for creating SVG tags
 * @param {keyof SVGElementTagNameMap} tag
 * @param {{[key: string]: string}} attribute_dict
 * @returns {SVGElement}
 */
export function svg_tag(tag, attribute_dict) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, val] of Object.entries(attribute_dict)) {
    element.setAttribute(key, val);
  }

  return element;
}
