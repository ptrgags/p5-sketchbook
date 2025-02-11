/**
 * Set of bit flags indexed using an enum.
 * NOTE: the enum values are 0, 1, 2, 3, this class handles the bit shifting.
 */
export class FlagSet {
  constructor(flags, flag_count) {
    this.flags = flags;
    this.flag_count = flag_count;
  }

  to_int() {
    return this.flags;
  }

  set_flag(flag) {
    if (flag < 0 || flag >= this.flag_count) {
      throw new Error("flag index out of bounds!");
    }
    this.flags |= 1 << flag;
  }

  has_flag(flag) {
    if (flag < 0 || flag >= this.flag_count) {
      throw new Error("flag index out of bounds!");
    }
    return ((this.flags >> flag) & 1) === 1;
  }
}
