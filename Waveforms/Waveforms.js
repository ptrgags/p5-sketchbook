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
 * @returns {LineSegment[]}
 */
function render_waveform(samples) {
  const result = [];
  for (let x = 0; x < WIDTH; x++) {
    const t = x / (WIDTH - 1);
    const index_f = samples.length * t;
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
      samples[i] = Math.sin(2 * Math.PI * freq * t);
    }
    buf.copyToChannel(samples, 0);

    const sampler = new tone.Sampler({
      A4: buf,
    });

    sampler.volume.value = -9;
    // trigger a different note than what's in the buffer
    sampler.triggerAttackRelease("A3", "0:1");
    sampler.toDestination();

    this.primitive = style(
      render_waveform(samples),
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
