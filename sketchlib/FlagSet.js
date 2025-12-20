/**
 * Set of bit flags indexed using an enum.
 * NOTE: the enum values are 0, 1, 2, 3, this class handles the bit shifting.
 */
export class FlagSet {
  /**
   * constructor
   * @param {number} flags Initial bit flags
   * @param {number} flag_count How many flags
   */
  constructor(flags, flag_count) {
    this.flags = flags;
    this.flag_count = flag_count;
  }

  /**
   * Get the integer representation of the set of bit flags
   * @returns {number}
   */
  to_int() {
    return this.flags;
  }

  /**
   * Set a bit flag to 1
   * @param {number} flag Flag index
   */
  set_flag(flag) {
    if (flag < 0 || flag >= this.flag_count) {
      throw new Error("flag index out of bounds!");
    }
    this.flags |= 1 << flag;
  }

  /**
   * Return true if the selected flag is present
   * @param {number} flag Flag index
   * @returns {boolean}
   */
  has_flag(flag) {
    if (flag < 0 || flag >= this.flag_count) {
      throw new Error("flag index out of bounds!");
    }
    return ((this.flags >> flag) & 1) === 1;
  }
}
