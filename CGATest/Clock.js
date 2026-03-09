const MS_PER_SEC = 1000;
const SEC_PER_MIN = 60;
const BEATS_PER_MEASURE = 4;

export class Clock {
  constructor() {
    this.start_time = performance.now();
  }

  reset() {
    this.start_time = performance.now();
  }

  get elapsed_time_sec() {
    const now = performance.now();
    const time_ms = now - this.start_time;

    // convert to seconds
    return time_ms / MS_PER_SEC;
  }

  get_elapsed_measures(bpm) {
    const time_beats = (this.elapsed_time_sec / SEC_PER_MIN) * bpm;
    return time_beats / BEATS_PER_MEASURE;
  }
}
