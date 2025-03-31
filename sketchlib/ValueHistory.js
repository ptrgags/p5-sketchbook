export class ValueHistory {
  /**
   *
   * @param {number} capacity The capacity of the underlying ring buffer
   */
  constructor(capacity) {
    this.values = new Array(capacity);
    this.capacity = capacity;
    this.length = 0;
    this.start = 0;
    this.end = 0;
  }

  push(value) {
    this.values[this.end] = value;
    this.end++;
    this.end %= this.capacity;

    if (this.length === this.capacity) {
      this.start++;
      this.start %= this.capacity;
    } else {
      this.length++;
    }
  }

  get history() {
    const result = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      result[i] = this.values[(this.start + i) % this.capacity];
    }
    return result;
  }
}
