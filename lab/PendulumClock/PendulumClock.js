import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/primitives.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { N1, N16, N2, N4 } from "../lablib/music/durations.js";
import { B3, C4, E4, FS4, G4, GS4 } from "../lablib/music/pitches.js";
import { Melody, Note, parse_melody, Score } from "../lablib/music/Score.js";
import { MuteButton } from "../lablib/MuteButton.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
import { SoundManager } from "../lablib/SoundManager.js";
import { Clock } from "./Clock.js";

const MOUSE = new CanvasMouseHandler();

// Bell changes for the Westminster Quarters
// See https://en.wikipedia.org/wiki/Westminster_Quarters#Description
const CHANGES = [
  parse_melody([GS4, N2], [FS4, N2], [E4, N2], [B3, N1]),
  parse_melody([E4, N2], [GS4, N2], [FS4, N2], [B3, N1]),
  parse_melody([E4, N2], [FS4, N2], [GS4, N2], [E4, N1]),
  parse_melody([GS4, N2], [E4, N2], [FS4, N2], [B3, N1]),
  parse_melody([B3, N2], [FS4, N2], [GS4, N2], [E4, N1]),
];
const WESTMINSTER_QUARTERS = [
  CHANGES[0],
  new Melody(CHANGES[1], CHANGES[2]),
  new Melody(CHANGES[3], CHANGES[4], CHANGES[1]),
  new Melody(CHANGES[1], CHANGES[2], CHANGES[3], CHANGES[4]),
];

function wrap_score(score) {
  return new Score(["square", score]);
}

const TICK = new Score(["sine", new Note(C4, N16)]);
const TOCK = new Score(["sine", new Note(G4, N16)]);
const MINUTE_MELODY = new Score([
  "square",
  new Melody(new Note(C4, N16), new Note(E4, N16), new Note(G4, N16)),
]);

/** @type {import("../lablib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  sfx: {
    tick: TICK,
    tock: TOCK,
    minute: MINUTE_MELODY,
    quarter: wrap_score(WESTMINSTER_QUARTERS[0]),
    half_hour: wrap_score(WESTMINSTER_QUARTERS[1]),
    third_quarter: wrap_score(WESTMINSTER_QUARTERS[2]),
    hour: wrap_score(WESTMINSTER_QUARTERS[3]),
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

    const clock_events = this.clock.events;
    clock_events.addEventListener("second", () => {
      //this.sound.play_sfx("tick");
    });
    clock_events.addEventListener("half-second", () => {
      //this.sound.play_sfx("tock");
    });
    clock_events.addEventListener("minute", () => {
      //this.sound.play_sfx("quarter");
      this.sound.play_sfx("hour");
    });
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
