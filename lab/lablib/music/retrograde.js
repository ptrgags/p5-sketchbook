import { Harmony, Melody, MusicCycle, MusicLoop, Note, Rest } from "./Score.js";
import { Gap } from "./Timeline";

/**
 * sdrawkcab cisum eht yalP
 * @template P
 * @param {import("./Score").Music<P>} music The music material
 * @return {import("./Score").Music<P>} The music reversed
 */
export function retrograde(music) {
  if (music instanceof Note || music instanceof Gap) {
    return music;
  }

  if (music instanceof Melody) {
    // retrograde(a, b) = retrograde(b), retrograde(a)
    const retrograded_children = music.children.map(retrograde);
    retrograded_children.reverse();
    return new Melody(...retrograded_children);
  }

  if (music instanceof Harmony) {
    const full_duration = music.duration;
    const retrograded_children = music.children.map((x) => {
      if (x.duration.equals(full_duration)) {
        return retrograde(x);
      } else {
        // If the child (duration d) finished before than the full duration
        // of the harmony D, consider the implied gap.
        // so retrograde(child(d), gap(D - d)) = gap(D - d), child(d)

        const remaining = full_duration.sub(x.duration);
        return new Melody(new Rest(remaining), retrograde(x));
      }
    });

    return new Harmony(...retrograded_children);
  }

  if (music instanceof MusicLoop) {
    return new MusicLoop(music.duration, retrograde(music.child));
  }

  if (music instanceof MusicCycle) {
    const retrograded_children = music.children.map(retrograde);
    retrograded_children.reverse();
    return new MusicCycle(music.duration, ...retrograded_children);
  }
}
