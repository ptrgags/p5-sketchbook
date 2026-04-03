import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { PlayButtonScene } from "../sketchlib/scenes/PlayButtonScene.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { Animated } from "../sketchlib/animation/Animated.js";
import { SoundScene } from "../sketchlib/scenes/SoundScene.js";
import { MouseCallbacks } from "../sketchlib/input/MouseCallbacks.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { lerp } from "../sketchlib/lerp.js";
import { Style } from "../sketchlib/Style.js";
import { Color } from "../sketchlib/Color.js";

const MOUSE = new CanvasMouseHandler();

// Add scores here
/**@type {import("../sketchlib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

// samples per second: the usual 44.1 kHz
const SAMPLE_RATE = 44100;
// one channel for mono audio
const MONO = 1;

/**
 *
 * @param {Float32Array} samples Samples as an array of [0, -1] values
 * @param {number} sample_count number of samples to consider
 * @returns {LineSegment[]}
 */
function render_waveform(samples, sample_count) {
  const result = [];
  for (let x = 0; x < WIDTH; x++) {
    const t = x / (WIDTH - 1);
    const index_f = sample_count * t;
    const a = samples[Math.floor(index_f)];
    const b = samples[Math.ceil(index_f)];
    const value = lerp(a, b, index_f % 1);

    const center_point = new Point(x, HEIGHT / 2);
    const wave_point = new Point(x, HEIGHT / 2 - value * 100);

    result.push(new LineSegment(center_point, wave_point));
  }
  return result;
}

/**
 *
 * @param {string} s
 * @returns {number}
 */
function ord(s) {
  return s.charCodeAt(0);
}

// Loosely following https://devtails.xyz/@adam/how-to-write-a-wav-file-in-javascript
const HEADER_SIZE = 44;
// 16-bit
const BYTES_PER_SAMPLE = 2;
// WAV uses little-endian, see https://en.wikipedia.org/wiki/WAV#WAV_file_header
const LITTLE_ENDIAN = true;

/**
 * Download a generated file
 * @param {File} file The file to downlowd
 */
function download_file(file) {
  const url = URL.createObjectURL(file);

  const anchor = document.createElement("a");
  anchor.setAttribute("href", url);
  anchor.setAttribute("download", file.name);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 *
 * @param {Float32Array} samples
 * @returns {File}
 */
function make_wav_file(samples) {
  const data_length = BYTES_PER_SAMPLE * samples.length;
  const byte_length = HEADER_SIZE + data_length;
  const buffer = new ArrayBuffer(byte_length);
  const data_view = new DataView(buffer);

  // RIFF magic number
  let offset = 0;
  data_view.setUint8(offset, ord("R"));
  data_view.setUint8(offset + 1, ord("I"));
  data_view.setUint8(offset + 2, ord("F"));
  data_view.setUint8(offset + 3, ord("F"));
  offset += 4;

  // file size minus 8 bytes for the RIFF header
  data_view.setUint32(offset, byte_length - 8, LITTLE_ENDIAN);
  offset += 4;

  // WAV magic number
  data_view.setUint8(offset, ord("W"));
  data_view.setUint8(offset + 1, ord("A"));
  data_view.setUint8(offset + 2, ord("V"));
  data_view.setUint8(offset + 3, ord("E"));
  offset += 4;

  // "fmt " magic number
  data_view.setUint8(offset, ord("f"));
  data_view.setUint8(offset + 1, ord("m"));
  data_view.setUint8(offset + 2, ord("t"));
  data_view.setUint8(offset + 3, ord(" "));
  offset += 4;

  // chunk size minus the 8-byte header = 16 bytes
  data_view.setUint32(offset, 16, LITTLE_ENDIAN);
  offset += 4;

  // format 1: PCM integer
  // huh interesting, 2 would be float values...
  data_view.setUint16(offset, 1, LITTLE_ENDIAN);
  offset += 2;

  // number of channels. 1 for mono
  data_view.setUint16(offset, MONO, LITTLE_ENDIAN);
  offset += 2;

  // sample rate in cycles/second
  data_view.setUint32(offset, SAMPLE_RATE, LITTLE_ENDIAN);
  offset += 4;

  // bytes to read per second
  data_view.setUint32(offset, SAMPLE_RATE * BYTES_PER_SAMPLE, LITTLE_ENDIAN);
  offset += 4;

  // bytes per block = number of channels * bytes per sample
  data_view.setUint16(offset, MONO * BYTES_PER_SAMPLE, LITTLE_ENDIAN);
  offset += 2;

  // 16 bits per sample
  data_view.setUint16(offset, BYTES_PER_SAMPLE * 8, LITTLE_ENDIAN);
  offset += 2;

  // "data" magic number
  data_view.setUint8(offset, ord("d"));
  data_view.setUint8(offset + 1, ord("a"));
  data_view.setUint8(offset + 2, ord("t"));
  data_view.setUint8(offset + 3, ord("a"));
  offset += 4;

  data_view.setUint32(offset, data_length);
  offset += 4;

  for (const [i, value] of samples.entries()) {
    // initial range is [-1, 1]
    // we want to scale to the range of a 16-bit signed integer
    // which is [-2^15 - 1, 2^15]

    // I'm going to be lazy and ignore the minimum value
    const quantized = Math.round(value * (1 << 15));

    data_view.setInt16(offset + BYTES_PER_SAMPLE * i, quantized, LITTLE_ENDIAN);
  }
  offset += BYTES_PER_SAMPLE * samples.length;
  if (offset !== byte_length) {
    console.log("actual", offset, "expected", byte_length);
    throw new Error("whoops, my offsets are off");
  }

  return new File([buffer], "waveform.wav", { type: "audio/wav" });
}

/**
 * @implements {Animated}
 */
class WaveformsAnimation {
  /**
   *
   * @param {import("tone")} tone
   */
  constructor(tone) {
    this.tone = tone;
    this.ctx = tone.getContext().rawContext;

    // create one second of audio
    const SAMPLE_COUNT = SAMPLE_RATE;
    const buf = this.ctx.createBuffer(MONO, SAMPLE_COUNT, SAMPLE_RATE);

    const samples = new Float32Array(SAMPLE_COUNT);
    const freq = 440;
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const t = i / SAMPLE_COUNT;
      samples[i] =
        Math.sin(2 * Math.PI * freq * t) +
        Math.sin(((2 * Math.PI * 3) / 2) * freq * t);
    }
    buf.copyToChannel(samples, 0);

    const sampler = new tone.Sampler({
      A4: buf,
    });

    sampler.volume.value = -9;
    // trigger a different note than what's in the buffer
    sampler.triggerAttackRelease("A3", "0:1");
    sampler.toDestination();

    const period = 1 / freq;
    const period_samples = Math.floor(period * SAMPLE_RATE);

    download_file(make_wav_file(samples));

    this.primitive = style(
      render_waveform(samples, period_samples),
      new Style({ stroke: Color.RED }),
    );
  }

  /**
   * @type {MouseCallbacks[]}
   */
  get mouse_callbacks() {
    return [];
  }

  update() {}
}

/**
 *
 * @param {import("p5")} p
 */
export const sketch = (p) => {
  /** @type {PlayButtonScene | SoundScene} */
  let scene = new PlayButtonScene(SOUND);
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      // @ts-ignore
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);
    MOUSE.callbacks = scene.mouse_callbacks;

    scene.events.addEventListener("scene-change", () => {
      scene = new SoundScene(SOUND, new WaveformsAnimation(SOUND.tone));
      MOUSE.callbacks = scene.mouse_callbacks;
    });
  };

  p.draw = () => {
    p.background(0);

    scene.update();
    scene.primitive.draw(p);
  };

  MOUSE.configure_callbacks(p);
};
