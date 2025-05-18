import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/primitives.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { N16, N32, N8 } from "../lablib/music/durations.js";
import { A3, C4, D4, E4, G4 } from "../lablib/music/pitches.js";

import { Melody, Note, Rest, Score } from "../lablib/music/Score.js";
import { MuteButton } from "../lablib/MuteButton.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
import { SoundManager } from "../lablib/SoundManager.js";
import { Clock } from "./Clock.js";
import { ClockTime } from "./ClockTime.js";
import {
  WESTMINSTER_QUARTERS_SCORES,
  WESTMINSTER_SCORE_LENGTHS,
} from "./westminster_quarters.js";

const MOUSE = new CanvasMouseHandler();

const TICK_TOCK = new Score([
  "tick",
  //new Note(C4, N16),
  new Melody(new Note(A3, N8), new Note(C4, N16), new Note(C4, N16)),
]);

/** @type {import("../lablib/SoundManager.js").SoundManifest} */
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
      }
    );

    this.next_available_second = 0;

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
    } else if (seconds === 0) {
      this.sound.play_sfx("hour11");
      this.next_available_second = WESTMINSTER_SCORE_LENGTHS.hour11;
    } else if (seconds > Math.ceil(this.next_available_second)) {
      this.sound.play_sfx("tick_tock");
      this.next_available_second = 0;
    }
  }

  update() {
    this.clock.update();
  }

  render() {
    const clock = this.clock.render();
    const mute_button = this.mute_button.render();
    return new GroupPrimitive([clock, mute_button]);
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
  let scene = new PlayButtonScene(SOUND);
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;

    MOUSE.setup(canvas);

    scene.events.addEventListener("scene-change", () => {
      scene = new PendulumClockScene(SOUND);
    });
  };

  p.draw = () => {
    p.background(0);

    scene.update();

    const scene_primitive = scene.render();

    draw_primitive(p, scene_primitive);
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
