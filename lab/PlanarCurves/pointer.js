export class PointerControls {
  constructor(canvas) {
    canvas.id("target");

    this.pressure = 0;
    this.tilt_direction = [1, 0];

    const canvas_element = document.getElementById("target");
    canvas_element.addEventListener("pointermove", (e) => {
      if (event.pointerType === "pen") {
        event.preventDefault();
        this.pointer_move(e);
      }
    });
  }

  pointer_move(event) {
    if (event.pointerType !== "pen") {
      return;
    }

    this.pressure = event.pressure;

    const x = Math.sin((event.tiltX * Math.PI) / 180);
    const y = Math.sin((event.tiltY * Math.PI) / 180);
    this.tilt_direction = [x, y];
  }
}
