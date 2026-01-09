import { Style } from "../../../sketchlib/Style.js";
import { C4, C5 } from "./pitches.js";
import { Harmony, Melody, Note, Rest } from "./Music.js";
import { Score } from "./Score.js";
import { Color } from "../../../sketchlib/Color.js";
import { Primitive } from "../../../sketchlib/primitives/Primitive.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../../sketchlib/primitives/LinePrimitive.js";
import { RectPrimitive } from "../../../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Point } from "../../../pga2d/Point.js";
import { Direction } from "../../../pga2d/Direction.js";

// For the background colors I'm using, solid black fill looks fine
const NOTE_STYLE = new Style({
  fill: Color.BLACK,
});

const MEASURE_LINE_STYLE = new Style({
  stroke: Color.from_hex_code("#777777"),
});

/**
 * Get the minimum and maximum MIDI notes
 * @param {import("./Music.js").Music<number>} music The musical timeline
 * @return {[number, number] | undefined} [min, max] pitch, or undefined if the music is silent
 */
function get_pitch_range(music) {
  if (music instanceof Rest) {
    // No pitch information
    return undefined;
  }

  if (music instanceof Note) {
    return [music.pitch, music.pitch];
  }

  // For Melody and Harmony, examine the pitches across all notes and
  // get the overall min/max
  const child_ranges = music.children
    .map((x) => get_pitch_range(x))
    .filter((x) => x !== undefined);

  if (child_ranges.length === 0) {
    return undefined;
  }

  return child_ranges.reduce(([acc_min, acc_max], [min_pitch, max_pitch]) => {
    return [Math.min(acc_min, min_pitch), Math.max(acc_max, max_pitch)];
  });
}

/**
 * Render notes in a rectangle starting at offset and measure_dimensions.y tall.
 * Its width is determined by the duration of the music. The range of pitches
 * is automatically scaled so only pitch_range is drawn.
 * @param {Point} offset Top left corner of the rectangle where the notes will be overlayed as a Point
 * @param {import("./Music.js").Music<number>} music Music as a timeline of MIDI notes
 * @param {Direction} measure_dimensions a Direction representing the size of 1 measure in pixels
 * @param {[number, number]} pitch_range (min_pitch, max_pitch) as MIDI notes for determining note placement
 * @returns {Primitive} A primitive containing all the notes (unstyled)
 */
function render_notes(offset, music, measure_dimensions, pitch_range) {
  if (music instanceof Rest) {
    return undefined;
  }

  if (music instanceof Note) {
    const [min_pitch, max_pitch] = pitch_range;
    const pitch_count = max_pitch - min_pitch + 1;
    const note_height = measure_dimensions.y / pitch_count;
    const pitch_index = music.pitch - min_pitch;

    const note_offset = new Direction(
      0,
      measure_dimensions.y - (pitch_index + 1) * note_height
    );
    const dimensions = new Direction(
      music.duration.real * measure_dimensions.x,
      note_height
    );
    return new RectPrimitive(offset.add(note_offset), dimensions);
  }

  if (music instanceof Melody) {
    let child_offset = offset;
    const all_notes = [];
    for (const child of music.children) {
      const child_notes = render_notes(
        child_offset,
        child,
        measure_dimensions,
        pitch_range
      );
      all_notes.push(child_notes);

      const child_width = child.duration.real * measure_dimensions.x;
      child_offset = child_offset.add(Direction.DIR_X.scale(child_width));
    }
    return group(...all_notes.filter((x) => x !== undefined));
  }

  if (music instanceof Harmony) {
    // Gather up the notes from all the children and overlay them. This assumes
    // that ptich_range was computed across all of the parallel lines
    return group(
      ...music.children
        .map((x) => {
          return render_notes(offset, x, measure_dimensions, pitch_range);
        })
        .filter((x) => x !== undefined)
    );
  }
}

/**
 * Render a single Music timeline
 * @param {Point} offset Offset of the top left corner where the timeline should appear as a Point
 * @param {import("./Music.js").Music<number>} music
 * @param {Direction} measure_dimensions Dimensions of a rectangle representing one measure of music
 * @param {Style} background_style Style for the background rectangle
 * @param {Style} note_style Style for the smaller note rectangles
 * @returns {GroupPrimitive} A group primmitive ready for rendering
 */
export function render_music(
  offset,
  music,
  measure_dimensions,
  background_style,
  note_style
) {
  // Background rectangle ----------------------
  const duration = music.duration;
  const width_measures = duration.real;
  const dimensions = new Direction(
    width_measures * measure_dimensions.x,
    measure_dimensions.y
  );
  const background = style(
    new RectPrimitive(offset, dimensions),
    background_style
  );

  // Vertical lines to mark the start of each measure -------------
  const whole_measures = duration.quotient;
  const measure_lines = new Array(whole_measures);
  for (let i = 0; i < whole_measures; i++) {
    const x = i * measure_dimensions.x;
    measure_lines[i] = new LinePrimitive(
      offset.add(Direction.DIR_X.scale(x)),
      offset.add(new Direction(x, measure_dimensions.y))
    );
  }
  const styled_lines = style(measure_lines, MEASURE_LINE_STYLE);

  const [min_pitch, max_pitch] = get_pitch_range(music) ?? [C4, C5];
  /**
   * Expand the range by a couple of semitones so notes aren't too close
   * to the top/bottom edges which can look confusing
   * @type {[number, number]}
   */
  const pitch_range = [min_pitch - 2, max_pitch + 2];

  // Many small rectangles for the notes ----------------------
  const notes = style(
    render_notes(offset, music, measure_dimensions, pitch_range),
    note_style
  );

  return group(background, styled_lines, notes);
}

/**
 * Render a score as rectangles arranged in rows like in a DAW
 * @param {Point} offset Top left corner of the score as a Point
 * @param {Score<number>} score The score to draw, with values as MIDI notes
 * @param {Direction} measure_dimensions (pixels_per_measure, pixels_per_voice) the dimensions of a block representing one measure and one voice as a Direction
 * @param {Style[]} styles Styles for the background rectangles for each part of the score.
 * @returns {GroupPrimitive} The visual representation of the score
 */
export function render_score(offset, score, measure_dimensions, styles) {
  const parts = [];
  for (const [i, part] of score.parts.entries()) {
    const child_offset = new Direction(0, measure_dimensions.y).scale(i);

    const rendered = render_music(
      offset.add(child_offset),
      part.music,
      measure_dimensions,
      styles[i],
      NOTE_STYLE
    );
    const part_group = style(rendered, styles[i]);
    parts.push(part_group);
  }

  return group(...parts);
}
