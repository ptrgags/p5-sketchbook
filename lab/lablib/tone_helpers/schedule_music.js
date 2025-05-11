import { Cycle, Gap, Loop, Parallel, Sequential } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { ToneClip } from "./compile_music.js";
import { to_tone_time } from "./measure_notation.js";

/**
 * 
 * @param {Rational} offset 
 * @param {Loop<ToneClip>} loop 
 */
export function schedule_loop(offset, loop) {
    const { duration, child } = loop;
    if (duration < child.duration) {
        throw new Error("not implemented: crop loop")
    } else if (duration > child.duration) {
        throw new Error("not implemented:")
    }

    schedule_clips(offset, child);
}

/**
 * 
 * @param {Rational} offset 
 * @param {Cycle<ToneClip>} clips 
 */
function schedule_cycle(offset, clips) {
    throw new Error("Function not implemented.");
}

/**
 * 
 * @param {Rational} offset 
 * @param {import("../music/Timeline").Timeline<ToneClip>} clips 
 */
export function schedule_clips(offset, clips) {
    if (clips instanceof Gap) {
        // No music, nothing to schedule
    }

    else if (clips instanceof ToneClip) {
        const start = offset;
        const end = start.add(clips.duration);
        const start_time = to_tone_time(start);
        const end_time = to_tone_time(end);
        clips.material.start(start_time).stop(end_time);
        return;
    } else if (clips instanceof Sequential) {
        let start = offset;
        for (const child of clips.children) {
            schedule_clips(start, child);
            start = start.add(child.duration);
        }
        return;
    } else if (clips instanceof Parallel) {
        clips.children.forEach(x => schedule_clips(offset, x));
    } else if (clips instanceof Loop) {
        schedule_loop(offset, clips);
    } else if (clips instanceof Cycle) {
        schedule_cycle(offset, clips);
    }
}


