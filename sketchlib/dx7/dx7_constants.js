export const HEADER_LENGTH = 6;
export const VOICE_LENGTH = 128;
export const VOICE_COUNT = 32;
export const DATA_LENGTH = VOICE_COUNT * VOICE_LENGTH;

// checksum and end sysex message
export const TRAILER_LENGTH = 2;

export const TOTAL_LENGTH = HEADER_LENGTH + DATA_LENGTH + TRAILER_LENGTH;

export const STATUS_START = 0xf0;
export const ID_YAMAHA = 67;
// sub status s = 0, channel number n=0
export const SUB_STATUS = 0;
export const FORMAT_32_VOICES = 9;

export const VOICE_START = 6;

export const OPERATOR_LENGTH = 17;
export const OPERATOR_COUNT = 6;

export const NAME_LENGTH = 10;

export const TRAILER_OFFSET = HEADER_LENGTH + DATA_LENGTH;
export const STATUS_END = 0xf7;
