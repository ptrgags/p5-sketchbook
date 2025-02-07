const WIDTH = 500;
const HEIGHT = 700;

class MazeCell {}

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
  };

  p.draw = () => {
    p.background(0);
  };
};
