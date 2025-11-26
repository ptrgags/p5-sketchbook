import { Point } from "../../../pga2d/objects.js";
import { GroupPrimitive } from "../../../sketchlib/rendering/GroupPrimitive.js";
import { RectPrimitive } from "../../../sketchlib/rendering/primitives.js";
import { group, style } from "../../../sketchlib/rendering/shorthand.js";
import { Style } from "../../../sketchlib/Style.js";
import { count_voices } from "./count_voices.js";
import { C4, C5 } from "./pitches.js";
import { Harmony, Melody, Note, Rest, Score } from "./Score.js";
import { Gap, Sequential } from "./Timeline.js";
import { Color } from "../../../sketchlib/Color.js";

/**
 * Render a simple timeline as a single block. The duration determines the width,
 * the number of voices determines the height.
 * @template {import("./Timeline.js").TimeInterval} T
 * @param {Point} offset The top left corner where the timeline should be rendered.
 * @param {import("./Timeline.js").Timeline<T>} timeline The timeline of events
 * @param {Point} measure_dimensions Dimensions of a 1 measure x 1 voice block in pixels as a Point.direction
 * @returns {RectPrimitive}
 */
function render_block(offset, timeline, measure_dimensions) {
  const width = timeline.duration.real;
  const voices = count_voices(timeline);

  const dimensions = Point.direction(
    width * measure_dimensions.x,
    voices * measure_dimensions.y
  );
  return new RectPrimitive(offset, dimensions);
}

/**
 * Render a single timeline as a strip of rectangles. This does not apply styling
 * @template {import("./Timeline.js").TimeInterval} T
 * @param {Point} offset The top left corner where the timeline should be rendered.
 * @param {import("./Timeline.js").Timeline<T>} timeline The timeline of events
 * @param {Point} measure_dimensions Dimensions of a 1 measure x 1 voice block in pixels as a Point.direction
 * @return {import("../../../sketchlib/rendering/GroupPrimitive.js").Primitive | undefined} A primitive to render, or undefined if there was no content to render.
 */
export function old_render_timeline(offset, timeline, measure_dimensions) {
  if (timeline instanceof Gap) {
    // no musical content to render
    return undefined;
  }

  if (timeline instanceof Sequential) {
    // render blocks for all the children, with offsets increasing
    // horizontally
    let child_offset = offset;
    const child_blocks = [];
    for (const child of timeline.children) {
      const child_block = old_render_timeline(
        child_offset,
        child,
        measure_dimensions
      );
      child_blocks.push(child_block);

      const child_width = child.duration.real * measure_dimensions.x;
      child_offset = child_offset.add(Point.direction(child_width, 0));
    }
    return group(...child_blocks.filter((x) => x !== undefined));
  }

  if (timeline instanceof Harmony) {
    // render blocks for all the children, with offsets increasing vertically
    let child_offset = offset;
    const child_blocks = [];
    for (const child of timeline.children) {
      const child_block = old_render_timeline(
        child_offset,
        child,
        measure_dimensions
      );
      child_blocks.push(child_block);

      const child_height = count_voices(child) * measure_dimensions.y;
      child_offset = child_offset.add(Point.direction(0, child_height));
    }
    return group(...child_blocks.filter((x) => x !== undefined));
  }

  // For now cycles, loops and individual intervals are rendered as a single
  // block
  return render_block(offset, timeline, measure_dimensions);
}

function render_notes(offset, music, measure_dimensions, pitch_range) {
  if (music instanceof Gap) {
    return undefined;
  }

  if (music instanceof Note) {
    const [min_pitch, max_pitch] = pitch_range;
    const pitch_count = max_pitch - min_pitch;
    const note_height = measure_dimensions.y / pitch_count;
    const pitch_index = music.pitch - min_pitch;

    const note_offset = Point.direction(
      0,
      measure_dimensions.y - pitch_index * note_height
    );
    const dimensions = Point.direction(
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
      child_offset = child_offset.add(Point.DIR_X.scale(child_width));
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
 * @param {Point} offset Offset of the top left corner where the timeline should appear
 * @param {import("./Score.js").Music<number>} music
 * @param {Point} measure_dimensions Dimensions of a rectangle representing one measure of music
 * @param {Style} background_style Style for the background rectangle
 * @param {Style} note_style Style for the note rectangles
 * @returns {GroupPrimitive} A group primmitive ready for rendering
 */
export function render_music(
  offset,
  music,
  measure_dimensions,
  background_style,
  note_style
) {
  const width_measures = music.duration.real;
  const dimensions = Point.direction(
    width_measures * measure_dimensions.x,
    measure_dimensions.y
  );
  const background = style(
    new RectPrimitive(offset, dimensions),
    background_style
  );

  const pitch_range = get_pitch_range(music) ?? [C4, C5];
  const notes = style(
    render_notes(offset, music, measure_dimensions, pitch_range),
    note_style
  );

  return group(background, notes);
}

/**
 * Get the minimum and maximum MIDI notes
 * @param {import("./Score.js").Music<number>} music The music
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

  // Melody and Harmony are just a simple
  return music.children
    .map((x) => get_pitch_range(x))
    .filter((x) => x !== undefined)
    .reduce(([acc_min, acc_max], [min_pitch, max_pitch]) => {
      return [Math.min(acc_min, min_pitch), Math.max(acc_max, max_pitch)];
    });
}

// TODO: this should be a darker version of each instrument's color
const NOTE_STYLE = new Style({
  fill: Color.BLACK,
});

/**
 * Render a score as rectangles arranged in rows like in a DAW
 * @param {Point} offset Top left corner of the score
 * @param {Score<number>} score The score to draw, with values as MIDI notes
 * @param {Point} measure_dimensions (pixels_per_measure, pixels_per_voice) the dimensions of a block representing one measure and one voice
 * @param {Style[]} styles Styles for rendering the different parts of the score.
 * @returns {GroupPrimitive} The visual representation of the score
 */
export function render_score(offset, score, measure_dimensions, styles) {
  const parts = [];
  for (const [i, entry] of score.parts.entries()) {
    const [, part] = entry;
    const child_offset = Point.direction(0, measure_dimensions.y).scale(i);

    const rendered = render_music(
      offset.add(child_offset),
      part,
      measure_dimensions,
      styles[i],
      NOTE_STYLE
    );
    const part_group = style(rendered, styles[i]);
    parts.push(part_group);
  }

  return group(...parts);
}
