/**
 * @template T
 */

export class RingBuffer {
  /**
   * Constructor
   * @param {number} capacity The capacity of the underlying ring buffer
   */
  constructor(capacity) {
    /**
     * @type {T[]}
     */
    this.values = new Array(capacity);
    this.capacity = capacity;
    this.length = 0;
    this.start = 0;
    this.end = 0;
  }

  /**
   * Push an item to the end of the buffer
   * @param {T} value
   */
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

  /**
   * Iterate over the elements from oldest to newest
   */
  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this.values[(this.start + i) % this.capacity];
    }
  }
}
