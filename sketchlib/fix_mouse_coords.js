import { Point } from "../sketchlib/pga2d/Point.js";

/**
 * In my CSS I use object-fit: contain to scale the canvases while
 * maintaining aspect ratio and canvas resolution. p5 is not aware
 * of this and computes e.g. the mouse coordinates incorrectly
 *
 * IMPORTANT: to use this, make sure the sketch is set to use pixelDensity(1),
 * else calculations may be incorrect
 *
 * @param {HTMLCanvasElement} canvas The HTML canvas used by p5
 * @param {number} mouse_x the mouseX coordinate from p5
 * @param {number} mouse_y the mouseY coordinate from p5
 * @returns {Point} Fixed coords (x, y). If the canvas wasn't ready yet, this returns (0, 0)
 */
export function fix_mouse_coords(canvas, mouse_x, mouse_y) {
  // The canvas hasn't been added to the page yet! gracefully return (0, 0)
  if (!canvas) {
    return new Point(0, 0);
  }

  // Get the resolution of the canvas' pixel data
  // This assumes pixelDensity is set to 1 (which I usually do)
  const canvas_width = canvas.width;
  const canvas_height = canvas.height;
  const aspect_ratio = canvas_width / canvas_height;

  const bounding_rect = canvas.getBoundingClientRect();

  let effective_width;
  let effective_height;
  let margin_left;
  let margin_top;
  if (aspect_ratio <= 1.0) {
    // Portrait
    effective_width = canvas_width;
    effective_height = bounding_rect.width / aspect_ratio;
    const remaining_height = bounding_rect.height - effective_height;
    margin_left = 0;
    margin_top = remaining_height / 2;
  } else {
    // Landscape
    effective_width = bounding_rect.height * aspect_ratio;
    effective_height = canvas_height;
    const remaining_width = bounding_rect.width - effective_width;
    margin_left = remaining_width / 2;
    margin_top = 0;
  }

  const x = ((mouse_x - margin_left) * canvas_width) / effective_width;
  const y = ((mouse_y - margin_top) * canvas_height) / effective_height;
  return new Point(x, y);
}
