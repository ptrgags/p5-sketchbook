export class MidiControls {
  constructor(enabled) {
    this.cc_value = 64;
    if (enabled) {
      navigator.requestMIDIAccess().then((access) => {
        access.inputs.forEach((entry) => {
          entry.onmidimessage = (message) => this.on_message(message);
        });
      }, console.error);
    }
  }

  on_message(message) {
    const CONTROL_CHANGE = 0b1011;
    const message_type = (message.data[0] >> 4) & 0b1111;
    if (message_type !== CONTROL_CHANGE) {
      return;
    }

    // Right now I don't care which channel the message came from
    //const channel = message.data[0] & 0b1111;

    const controller_number = message.data[1];
    const value = message.data[2];

    if (controller_number === 1) {
      this.cc_value = value;
    }
  }
}
