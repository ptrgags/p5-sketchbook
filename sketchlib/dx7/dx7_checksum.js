/**
 * Compute the checksum for a dx7 sysex message. This is the sum of the
 * data bytes (just the variable-length portion, no header), followed by
 * taking the two's complement (i.e. negative) and masking to 7 bits
 * (MIDI data bytes have a 0 in the 8th bit)
 *
 * @see {https://github.com/asb2m10/dexed/blob/2e182b3db85c09083ab13c8b9b00565ce7d9ff85/Source/PluginData.cpp#L30|Dexed implementation}
 * @see {https://homepages.abdn.ac.uk/d.j.benson/pages/dx7/sysex-format.txt|DX7 sysex format}
 * @param {Uint8Array} bytes bytes to sum
 * @returns {number} The checksum
 */
export function dx7_checksum(bytes) {
  const sum = bytes.reduce((acc, x) => acc + x);
  const twos_complement = -sum;
  return twos_complement & 0b1111111;
}
