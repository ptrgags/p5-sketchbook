import { Point } from "../../../pga2d/objects.js";
import { GroupPrimitive } from "../../../sketchlib/rendering/GroupPrimitive.js";
import { RectPrimitive } from "../../../sketchlib/rendering/primitives.js";
import { Style } from "../../../sketchlib/Style.js";
import { count_voices } from "./count_voices.js";
import { Harmony, Score } from "./Score.js";
import { Gap, Sequential } from "./Timeline.js";

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
export function render_timeline(offset, timeline, measure_dimensions) {
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
      const child_block = render_timeline(
        child_offset,
        child,
        measure_dimensions
      );
      child_blocks.push(child_block);

      const child_width = child.duration.real * measure_dimensions.x;
      child_offset = child_offset.add(Point.direction(child_width, 0));
    }
    return group(child_blocks.filter((x) => x !== undefined));
  }

  if (timeline instanceof Harmony) {
    // render blocks for all the children, with offsets increasing vertically
    let child_offset = offset;
    const child_blocks = [];
    for (const child of timeline.children) {
      const child_block = render_timeline(
        child_offset,
        child,
        measure_dimensions
      );
      child_blocks.push(child_block);

      const child_height = count_voices(child) * measure_dimensions.y;
      child_offset = child_offset.add(Point.direction(0, child_height));
    }
    return group(child_blocks.filter((x) => x !== undefined));
  }

  // For now cycles, loops and individual intervals are rendered as a single
  // block
  return render_block(offset, timeline, measure_dimensions);
}

/**
 * Render a score as rectangles arranged in rows like in a DAW
 * @param {Point} offset Top left corner of the score
 * @param {Score} score The score to draw
 * @param {Point} measure_dimensions (pixels_per_measure, pixels_per_voice) the dimensions of a block representing one measure and one voice
 * @param {Style[]} styles Styles for rendering the different parts of the score.
 * @returns {GroupPrimitive} The visual representation of the score
 */
export function render_score(offset, score, measure_dimensions, styles) {
  const parts = [];
  let voices_so_far = 0;
  for (const [i, entry] of score.parts.entries()) {
    const [, part] = entry;
    const child_offset = Point.direction(
      0,
      voices_so_far * measure_dimensions.y
    );

    const rendered = render_timeline(
      offset.add(child_offset),
      part,
      measure_dimensions
    );
    const part_group = style(rendered, { style: styles[i] });
    parts.push(part_group);

    voices_so_far += count_voices(part);
  }

  return group(parts);
}
