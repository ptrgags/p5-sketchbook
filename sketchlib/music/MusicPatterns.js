import { Rational } from "../Rational.js";
import { Chord } from "./Chord.js";
import { ChordVoicing } from "./ChordVoicing.js";
import { N4 } from "./durations.js";
import { Melody, Note, Rest } from "./Music.js";
import { PatternGrid } from "./PatternGrid.js";
import { RelTimelineOps } from "./RelTimelineOps.js";
import { Rhythm } from "./Rhythm.js";
import { Scale } from "./Scale.js";
import { TimeInterval, timeline_map } from "./Timeline.js";

/**
 * Convert pitches to notes at the default velocity.
 * If pitches is an array, it is assumed to be quarter notes
 * @template P
 * @param {P[] | PatternGrid<P>} pitches An array of pitches or a PatternGrid of pitches
 * @returns {PatternGrid<Note<P>>}
 */
function pitches_to_notes(pitches) {
  if (!(pitches instanceof PatternGrid)) {
    pitches = new PatternGrid(pitches, N4);
  }

  return pitches.map((p) => new Note(p));
}

export class MusicPatterns {
  /**
   * Merge a grid of pitches and a grid of velocities.
   *
   * When velocities is not defined, pitches are promoted to notes at the default velocity.
   * In this case, if the pitches are a flat array, quarter notes are assumed.
   *
   * When one of pitches/velocities is a flat array, it is promoted to a PatternGrid with the same
   * grid size as the other.
   *
   * If both pitches/velocites are flat arrays, they are assumed to be quarter notes
   *
   * @template P
   * @param {P[] | PatternGrid<P>} pitches Pitches.
   * @param {number[] | PatternGrid<number>} [velocities] Velocity values. If not specified, the result will assume the default velocity (mf) for every note.
   * @returns {PatternGrid<Note<P>>}
   */
  static make_notes(pitches, velocities) {
    if (!velocities) {
      return pitches_to_notes(pitches);
    }

    /**
     * @type {PatternGrid<P>}
     */
    let pitch_grid;
    /**
     * @type {PatternGrid<number>}
     */
    let velocity_grid;
    if (pitches instanceof PatternGrid && velocities instanceof PatternGrid) {
      pitch_grid = pitches;
      velocity_grid = velocities;
    } else if (Array.isArray(pitches) && velocities instanceof PatternGrid) {
      pitch_grid = new PatternGrid(pitches, velocities.step_size);
      velocity_grid = velocities;
    } else if (pitches instanceof PatternGrid && Array.isArray(velocities)) {
      pitch_grid = pitches;
      velocity_grid = new PatternGrid(velocities, pitches.step_size);
    } else if (Array.isArray(pitches) && Array.isArray(velocities)) {
      pitch_grid = new PatternGrid(pitches, N4);
      velocity_grid = new PatternGrid(velocities, N4);
    } else {
      throw new Error("impossible!");
    }

    return PatternGrid.merge(
      pitch_grid,
      velocity_grid,
      (p, v) => new Note(p, v),
    );
  }

  /**
   * Compose a melody. This is a wrapper around MusicPatterns.make_notes + Rhythm.zip.
   * @template P
   * @param {Rhythm} rhythm The rhythm of the melody
   * @param {P[] | PatternGrid<P>} pitches The pitches (one per beat)
   * @param {number[] | PatternGrid<number>} [velocities] The velocities (one per beat)
   * @return {Melody<P>}
   */
  static melody(rhythm, pitches, velocities) {
    const notes = MusicPatterns.make_notes(pitches, velocities);
    return rhythm.zip(notes);
  }

  /**
   * @param {Rhythm} rhythm
   * @param {Scale} scale
   * @param {number[]} degrees
   * @param {number[]} [velocities]
   * @return {Melody<number>}
   */
  static scale_melody(rhythm, scale, degrees, velocities) {
    // the duration here doesn't matter
    const pitches = scale.sequence(degrees);
    const notes = MusicPatterns.make_notes(pitches, velocities);
    return rhythm.zip(notes);
  }

  /**
   *
   * @param {Rhythm} rhythm
   * @param {PatternGrid<Chord>} chords
   * @param {PatternGrid<number>} [transpose]
   * @param {PatternGrid<number>} [velocity]
   */
  static block_chords(rhythm, chords, transpose, velocity) {}

  /**
   *
   * @param {Rhythm} rhythm
   * @param {PatternGrid<Chord>} chords
   * @param {PatternGrid<(number | undefined)[]>} indices
   * @param {PatternGrid<number>} [velocities]
   * @return {Melody<number>}
   */
  static voice_lead(rhythm, chords, indices, velocities) {
    // voice the chords and apply the velocity
    const voicings = PatternGrid.merge(chords, indices, (chord, idxs) =>
      chord.voice(idxs),
    );
    const with_velocity = MusicPatterns.make_notes(voicings, velocities);

    const timeline = rhythm.zip(with_velocity);
    const children = [...RelTimelineOps.iter_with_gaps(timeline)].map(
      (interval) => {
        if (interval instanceof Rest) {
          return interval;
        }

        // right now things are nested as
        // TimeInterval(Note(voicing, velocity), duration)
        // we want
        // voicing.to_harmony(duration, velocity)
        const voicing = interval.value.pitch;
        const velocity = interval.value.velocity;
        const duration = interval.duration;
        return voicing.to_harmony(duration, velocity);
      },
    );

    return new Melody(...children);
  }
}
