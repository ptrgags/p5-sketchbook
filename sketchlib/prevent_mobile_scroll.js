/**
 * Based on https://kirkdev.blogspot.com/2020/10/prevent-browser-scrolling-while-drawing.html
 * which in turn is based on https://stackoverflow.com/questions/49854201/html5-issue-canvas-scrolling-when-interacting-dragging-on-ios-11-3/51652248#51652248
 * @param {HTMLCanvasElement} canvas The canvas to use
 */
export function prevent_mobile_scroll(canvas) {
  const callback = (event) => {
    if (event.target === canvas) {
      event.preventDefault();
    }
  };

  // Since we're calling event.preventDefault(), we need to mark the event
  // as not passive.
  const options = { passive: false };
  document.body.addEventListener("touchstart", callback, options);
  document.body.addEventListener("touchend", callback, options);
  document.body.addEventListener("touchmove", callback, options);
}
