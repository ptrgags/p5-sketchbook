import { Point } from "../../pga2d/objects.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { LSystem } from "../../sketchlib/LSystem.js";
import { draw_primitive } from "../../sketchlib/p5_helpers/draw_primitive.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { MouseInput } from "../lablib/MouseInput.js";
import { N32 } from "../lablib/music/durations.js";
import { B4, C4, E4, E6, F6, G6 } from "../lablib/music/pitches.js";
import { Melody, Note, Rest, Score } from "../lablib/music/Score.js";
import { MuteButton } from "../lablib/MuteButton.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
import { Rational } from "../lablib/Rational.js";
import { SoundManager } from "../lablib/SoundManager.js";

const TREE_LSYSTEM = new LSystem("Fa", {
  a: "[+Fa][-Fa]",
});

function count_symbols(str) {
  /**
   * @type {Map<string, number>}
   */
  const counts = new Map();
  for (const c of str) {
    const current_count = counts.get(c) ?? 0;
    counts.set(c, current_count + 1);
  }

  return counts;
}

const TREE_STRS = TREE_LSYSTEM.iterate(8);
for (const str of TREE_STRS) {
  const counts = count_symbols(str);
  const ignore_a_len = str.length - counts.get("a");
  console.log(ignore_a_len, counts, str);
}

/*
function render_tree(tree_str, max_depth) {
  const DELTA_ANGLE = Math.PI / 3;
  let position = Point.point(WIDTH / 2, (3 * HEIGHT) / 2);
  let orientation = 0;
  const stack = [];
  let depth = 0;

  for (const c of tree_str) {
    if (c === "F") {
    } else if (c === "[") {
      depth++;
      this.stack.push([position, orientation]);
    } else if (c === "]") {
      [position, orientation] = this.stack.pop();
    }
  }
}*/

function make_score(tree_str, max_depth) {
  const draw_notes = [];
  const stack_notes = [];
  const turn_notes = [];

  // Duration of the shortest note
  const DUR = N32;
  // For stack push/pops, it'll be hi-lo for push, lo-hi for pop
  const STACK_HI = new Note(B4, DUR);
  const STACK_LO = new Note(E4, DUR);

  // For left/right turns, just play a single note, different for each direction
  const TURN_LEFT = new Note(G6, DUR);
  const TURN_RIGHT = new Note(F6, DUR);

  let depth = 0;
  for (const c of tree_str) {
    if (c === "F") {
      const note_length = max_depth - depth + 1;
      const dur = DUR.mul(new Rational(note_length));
      draw_notes.push(new Note(C4, dur));
      stack_notes.push(new Rest(dur));
      turn_notes.push(new Rest(dur));
    } else if (c === "[") {
      depth++;
      const dur = DUR.mul(new Rational(2));
      draw_notes.push(new Rest(dur));
      stack_notes.push(new Melody(STACK_HI, STACK_LO));
      turn_notes.push(new Rest(dur));
    } else if (c === "]") {
      depth--;
      const dur = DUR.mul(new Rational(2));
      draw_notes.push(new Rest(dur));
      stack_notes.push(new Melody(new Note(E4, dur), new Note(B4, dur)));
      turn_notes.push(new Rest(dur));
    } else if (c === "+") {
      draw_notes.push(new Rest(DUR));
      stack_notes.push(new Rest(DUR));
      turn_notes.push(TURN_LEFT);
    } else if (c === "-") {
      draw_notes.push(new Rest(DUR));
      stack_notes.push(new Rest(DUR));
      turn_notes.push(TURN_RIGHT);
    } else {
      continue;
    }
  }

  return new Score({
    parts: [
      ["sine", new Melody(...draw_notes)],
      ["square", new Melody(...stack_notes)],
      ["poly", new Melody(...turn_notes)],
    ],
  });
}

const MOUSE = new CanvasMouseHandler();

// Add scores here
/**@type {import("../lablib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {
    tree: make_score(TREE_STRS[3], 3),
  },
};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

class SoundScene {
  /**
   * Constructor
   * @param {SoundManager} sound Reference to the sound manager
   */
  constructor(sound) {
    this.sound = sound;
    this.mute_button = new MuteButton();
    this.events = new EventTarget();

    // Schedule sound callbacks here
    // this.sound.events.addEventListener('event', (e) => ...);
  }

  update() {
    // state changes each frame go here
    // note that you can do this.sound.get_param(param_id) if the score
    // has animations
  }

  render() {
    // Render stuff here
    return this.mute_button.render();
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_pressed(input) {
    this.mute_button.mouse_pressed(input);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_moved(input) {
    this.mute_button.mouse_moved(input);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_dragged(input) {
    this.mute_button.mouse_dragged(input);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_released(input) {
    this.mute_button.mouse_released(input);
  }
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
      document.getElementById("sketch-canvas")
    ).elt;

    MOUSE.setup(canvas);

    scene.events.addEventListener("scene-change", () => {
      scene = new SoundScene(SOUND);
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
