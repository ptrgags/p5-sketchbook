const SEC_PER_MIN = 60;
const BEATS_PER_MEASURE = 4;

export class Tempo {
  /**
   * Convert time in seconds to time in measures of 4/4 time
   * @param {number} sec Time in seconds
   * @param {number} bpm beats per minute
   * @returns {number} Time in measures of 4/4 time
   */
  static sec_to_measures(sec, bpm) {
    const time_beats = (sec / SEC_PER_MIN) * bpm;
    return time_beats / BEATS_PER_MEASURE;
  }

  /**
   * Convert time in measures to time in seconds for a given constant tempo
   * @param {number} measures Measures of 4/4 time
   * @param {number} bpm beats per minute
   * @returns {number} time in seconds
   */
  static measures_to_sec(measures, bpm) {
    const time_beats = measures * BEATS_PER_MEASURE;
    return (time_beats / bpm) * SEC_PER_MIN;
  }
}
