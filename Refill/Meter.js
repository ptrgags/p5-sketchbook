export const METER_WIDTH = 50;
export const METER_HEIGHT = 70;

const MAX_AMOUNT = 255;

export class Meter {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.amount = MAX_AMOUNT;
  }

  fill(amount) {
    this.amount = Math.min(this.amount + amount, MAX_AMOUNT);
  }

  drain(amount) {
    this.amount = Math.max(this.amount - amount, 0);
  }

  draw(p) {
    p.push();

    // Fill a rect proportional to the current amount out of 255
    p.noStroke();
    p.fill(127, 127, 255);
    const fill_height = (this.amount / 255) * METER_HEIGHT;
    p.rect(
      this.x,
      this.y + METER_HEIGHT - fill_height,
      METER_WIDTH,
      fill_height
    );

    // Draw the frame of the meter
    p.stroke(255);
    p.noFill();
    p.rect(this.x, this.y, METER_WIDTH, METER_HEIGHT);

    // Draw graduation markings at 3/4, 1/2, and 1/4 full
    const GRADUATION_HEIGHTS = [0.25, 0.5, 0.75];
    for (const h of GRADUATION_HEIGHTS) {
      p.line(
        this.x + 0.6 * METER_WIDTH,
        this.y + h * METER_HEIGHT,
        this.x + METER_WIDTH,
        this.y + h * METER_HEIGHT
      );
    }

    p.pop();
  }
}
