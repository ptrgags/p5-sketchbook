import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { CanvasMouseHandler } from "../sketchlib/CanvasMouseHandler.js";
import { N16, N8 } from "../sketchlib/music/durations.js";
import { A3, C4 } from "../sketchlib/music/pitches.js";

import { make_note, Melody, Note } from "../sketchlib/music/Music.js";
import { MuteButton } from "../sketchlib/MuteButton.js";
import { PlayButtonScene } from "../sketchlib/PlayButtonScene.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { Clock } from "./Clock.js";
import { ClockTime } from "./ClockTime.js";
import {
  WESTMINSTER_QUARTERS_SCORES,
  WESTMINSTER_SCORE_LENGTHS,
} from "./westminster_quarters.js";
import { Part, Score } from "../sketchlib/music/Score.js";

const MOUSE = new CanvasMouseHandler();

const MELODY_TICK_TOCK = new Melody(
  make_note(A3, N8),
  make_note(C4, N16),
  make_note(C4, N16),
);
const TICK_TOCK = new Score(
  new Part("tick_tock", MELODY_TICK_TOCK, {
    instrument_id: "tick",
    midi_channel: 0,
    midi_instrument: 81 - 1, // square lead
  }),
);

/** @type {import("../sketchlib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  bpm: 60,
  sfx: {
    tick_tock: TICK_TOCK,
    ...WESTMINSTER_QUARTERS_SCORES,
  },
};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

class PendulumClockScene {
  constructor(sound) {
    this.sound = sound;
    this.clock = new Clock();
    this.mute_button = new MuteButton();
    this.events = new EventTarget();

    this.mute_button.events.addEventListener(
      "change",
      (/** @type {CustomEvent}*/ e) => {
        this.sound.toggle_sound(e.detail.sound_on);
      },
    );

    this.next_available_second = -1;

    this.clock.events.addEventListener("tick", (/**@type {CustomEvent}*/ e) => {
      /**@type {ClockTime} */
      const time = e.detail;

      this.clock_sound(time);
    });
  }

  /**
   * Play a tick sound or chimes depending on where we are in the hour
   * @param {ClockTime} time
   */
  clock_sound(time) {
    const { hours, minutes, seconds } = time;

    if (minutes === 0 && seconds === 0) {
      // convert to 12 hour time
      const n = hours % 2;
      const hour12 = n === 0 ? 12 : n;
      const chime_id = `hour${hour12}`;

      this.sound.play_sfx(chime_id);
      this.next_available_second = WESTMINSTER_SCORE_LENGTHS[chime_id];
    } else if (minutes === 15 && seconds === 0) {
      this.sound.play_sfx("quarter1");
      this.next_available_second = WESTMINSTER_SCORE_LENGTHS.quarter1;
    } else if (minutes === 30 && seconds === 0) {
      this.sound.play_sfx("quarter2");
      this.next_available_second = WESTMINSTER_SCORE_LENGTHS.quarter2;
    } else if (minutes === 45 && seconds === 0) {
      this.sound.play_sfx("quarter3");
      this.next_available_second = WESTMINSTER_SCORE_LENGTHS.quarter3;
    } else if (seconds > Math.ceil(this.next_available_second)) {
      this.sound.play_sfx("tick_tock");
      this.next_available_second = -1;
    }
  }

  update() {
    this.clock.update();
  }

  render() {
    const clock = this.clock.render();
    const mute_button = this.mute_button.render();
    return group(clock, mute_button);
  }

  mouse_pressed(input) {
    this.mute_button.mouse_pressed(input);
  }
  mouse_moved(input) {
    this.mute_button.mouse_moved(input);
  }
  mouse_dragged(input) {
    this.mute_button.mouse_dragged(input);
  }
  mouse_released(input) {
    this.mute_button.mouse_released(input);
  }
}

export const sketch = (p) => {
  /**@type {PlayButtonScene | PendulumClockScene} */
  let scene = new PlayButtonScene();
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);

    scene.events.addEventListener("scene-change", async () => {
      await SOUND.init();
      scene = new PendulumClockScene(SOUND);
    });
  };

  p.draw = () => {
    p.background(0);

    scene.update();

    const scene_primitive = scene.render();

    scene_primitive.draw(p);
  };

  MOUSE.mouse_pressed(p, (input) => {
    scene.mouse_pressed(input);
  });

  MOUSE.mouse_moved(p, (input) => {
    scene.mouse_moved(input);
  });

  MOUSE.mouse_released(p, (input) => {
    scene.mouse_released(input);
  });

  MOUSE.mouse_dragged(p, (input) => {
    scene.mouse_dragged(input);
  });
};
