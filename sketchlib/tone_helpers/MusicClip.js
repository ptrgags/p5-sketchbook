import { Note } from "../music/Music.js";

export class MusicClip {
  /**
   * Constructor
   * @param {import("../music/Music.js").Music<Note<number>>} music
   */
  constructor(music) {
    this.music = music;
  }
}
