export class FlagSet {
  constructor(flags, flag_count) {
    this.flags = flags;
    this.flag_count = flag_count;
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
