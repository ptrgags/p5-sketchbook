// class to get the axes from 
class GamepadAxisControls {
  constructor() {
    this.gamepad_index = undefined;
    this.axes = [0.0, 0.0, 0.0, 0.0];
    
    window.addEventListener("gamepadconnected", (e) => {
      this.gamepad_index = e.gamepad.index;
    });
    
    window.addEventListener("gamepaddisconnected", (e) => {
      this.gamepad_index = undefined;
    });
  }
  
  update() {
    if (this.gamepad_index !== undefined) {
      const gamepad = navigator.getGamepads()[this.gamepad_index];
      for (let i = 0; i < this.axes.length; i++) {
        this.axes[i] = gamepad.axes[i];
      }
    } else {
      this.axes.fill(0.0);
    }
  }
}
