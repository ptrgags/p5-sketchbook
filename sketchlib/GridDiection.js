export class GridDirection {
  static opposite(direction) {
    switch (direction) {
      case GridDirection.LEFT:
        return GridDirection.RIGHT;
      case GridDirection.RIGHT:
        return GridDirection.LEFT;
      case GridDirection.UP:
        return GridDirection.DOWN;
      case GridDirection.DOWN:
        return GridDirection.UP;
    }
  }
}
GridDirection.RIGHT = 0;
GridDirection.UP = 1;
GridDirection.LEFT = 2;
GridDirection.DOWN = 3;
GridDirection.COUNT = 4;
Object.freeze(GridDirection);
