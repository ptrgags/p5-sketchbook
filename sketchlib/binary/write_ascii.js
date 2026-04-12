/**
 * Write an ASCII string to a DataView
 * @param {DataView} data_view data view to write to
 * @param {string} str String of ASCII characters
 * @param {number} offset Start offset
 * @returns {number} The offset after writing the string
 */
export function write_ascii(data_view, str, offset) {
  for (let i = 0; i < str.length; i++) {
    data_view.setUint8(offset + i, str.charCodeAt(i));
  }

  return offset + str.length;
}
