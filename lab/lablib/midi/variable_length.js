const MAX_BYTES = 4;

/**
 * Compute the length of a variable length quantity when encoded as binary
 * data.
 * @param {number} value The value
 * @returns {number} the length of the value when encoded
 */
export function compute_variable_length(value) {
  return split_value_7bits(value).length;
}

/**
 * Decode a single variable-length number as described in the MIDI spec
 * @param {DataView} payload the payload to decode from
 * @param {number} offset Byte offset of the variable-length number within payload
 * @returns {[number, number]} (value, after_offset) - the decoded value, and the offset of the byte just after the end of the variable length number
 */
export function decode_variable_length(payload, offset) {
  let index = offset;
  let value = 0;
  for (let i = 0; i < MAX_BYTES; i++) {
    const byte = payload.getUint8(index);
    // the low 7 bits are tacked on to the value (MSBF)
    value = (value << 7) | (byte & 0x7f);

    // the top bit of the byte indicates that there's more bytes to come.
    const more_bytes = byte >> 7 === 1;
    index++;

    if (!more_bytes) {
      return [value, index];
    }
  }

  // If we reached here, then all 4 bytes had the high bit set. This is not
  // allowed by the MIDI spec
  throw new Error(
    "invalid MIDI data: variable length quantity longer than 4 bytes detected!"
  );
}

/**
 * Split a value into 7-bit chunks
 * @param {number} value The value to split
 * @returns {number[]} the 7-bit values in LSBF order
 */
function split_value_7bits(value) {
  if (value === 0) {
    return [0];
  }

  const values = [];
  let current = value;
  while (current !== 0) {
    values.push(current & 0x7f);
    current >>= 7;
  }
  return values;
}

const MAX_MIDI_VALUE = 0x0fffffff;

/**
 * Write a variable-length quantity as described in the MIDI spec
 * @param {DataView} data_view The buffer to write to
 * @param {number} offset The offset of the first byte to write
 * @param {number} value value to encode
 * @returns {number} the new offset after writing the variable-length quantity
 */
export function encode_variable_length(data_view, offset, value) {
  if (value > MAX_MIDI_VALUE) {
    throw new Error("MIDI only allows numbers up to 0x0fffffff");
  }

  const values_lsbf = split_value_7bits(value);
  const values_msbf = values_lsbf.reverse();

  // For all bytes except the last one, the MIDI spec says to
  // set the high bit (to indicate more bytes following)
  for (let i = 0; i < values_msbf.length - 1; i++) {
    const high_bit_set = (1 << 7) | values_msbf[i];
    data_view.setUint8(offset + i, high_bit_set);
  }
  // For the last byte, the value is written verbatim
  const last_index = values_msbf.length - 1;
  data_view.setUint8(offset + last_index, values_msbf[last_index]);

  return offset + values_msbf.length;
}
