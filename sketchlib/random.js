export class Random {
  // random int in [min, max)
  static rand_int(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Random choice from an array of choices
  static rand_choice(choices) {
    const index = Random.rand_int(0, choices.length);
    return choices[index];
  }

  /**
   * Fisher-Yates shuffle, see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
   *
   * This returns a copy of the results
   * @param {Array} array Any array
   * @returns A shuffled copy of the array
   */
  static shuffle(array) {
    const result = [...array];
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
      const j = Random.rand_int(i, n);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
