/**
 * Object that can be converted to a JSON-serializable format
 * @interface ToJSON
 */
export class ToJSON {
  /**
   * Convert this object to a JSON-serializable type
   * @returns {any}
   */
  to_json() {
    throw new Error("not implemented");
  }

  /**
   * Check if an object can be converted to a JSON-serializable type
   * @param {any} x
   * @returns {x is ToJSON}
   */
  static is_json_compatible(x) {
    return x.to_json !== undefined;
  }
}
