export const METER_WIDTH = 50;
export const METER_HEIGHT = 70;

const MAX_AMOUNT = 255;

export class Meter {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.amount = MAX_AMOUNT;
    this.empty_count = 0;
  }

  fill(amount) {
    this.amount += amount;
    // Overfilling the meter helps you catch up. Though it takes a few clicks
    // to do so.
    if (this.amount >= MAX_AMOUNT) {
      this.amount = MAX_AMOUNT;
      this.empty_count = Math.max(this.empty_count - 64, 0);
    }
  }

  drain(amount) {
    this.amount -= amount;
    // Letting the meter drain completely means you're behind. The longer
    // you let it sit, the worse it gets.
    if (this.amount <= 0) {
      this.amount = 0;
      this.empty_count = Math.min(this.empty_count + 2, 255);
    }
  }

  draw(p) {
    p.push();

    // Fill a rect proportional to the current amount out of 255
    p.noStroke();
    // The color gets more red the more you fail to empty the meter.
    const red = Math.min(this.empty_count, 255);
    const blue_green = 255 - red;
    p.fill(red, 0, blue_green);
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
