# Algebra of Music

A collection of data types for arranging musical notes into a score. This
way I can express and transform music with functional-style programming.
Furthermore, this decouples the musical arrangement code from the audio
playback code.

## Inspiration

This is a blend of a few different ideas from various resources on computational music:

- (AGoM) _A Geometry of Music_ by Dmitri Tymoczko
    - This book discusses 5 musical symmetries (OPTIC) - octave, permutation, transposition, inversion, and cardinality.
    - It also describes different pitch space geometries depending on which symmetries are chosen. For example, ordered pairs of pitch classes form a mobius strip.
- (HSOM) _Haskell School of Music_ by Paul Hudak and Donya Quick
    - This book describes music in Haskell by combining notes with "sequential composition" (putting notes one after another in time) and "parallel composition" (stacking notes to be played simultaneously).
- [Tidal Cycles](https://tidalcycles.org/docs/reference/cycles)
    - This Haskell music library defines a "cycle" - a fixed-length loop of time
    where you can insert music events, spaced evenly. Cycles can be nested
    within each other to create intricate subdivisions of time.

## Notes

The most basic bit of music is a note. It has a pitch
and a duration.

```
// P is the pitch type
Note<P> = (P, Duration)
```

The data type for pitches can vary. E.g. it could be
an integer MIDI note, a pitch class (e.g. an enum with values `C, Cs, ..., As, B`), a scale degree. This allows
flexibility when exploring the math of music.

Durations are expressed as rational numbers (as in HSoM). For now, I'm
interpreting it as a number of measures of 4/4 time. In the code I use
`N1`, `N2`, `N4`, ... for whole notes, half notes, quarter notes, and so on.

### Music as a Timeline of Notes

```
// Music is just a timeline of notes!
Music<P> = Timeline<Note<P>>

// A time interval is anything with a duration in time.
TimeInterval = {duration: Duration}

// A schedule of time intervals. This is not specific to music.
Timeline<T: TimeInterval> = T
            | Gap Duration
            | Sequential [Timeline<T>]
            | Parallel [Timeline<T>]
            | Cycle Duration [Timeline<T>]
            | Loop Duration Timeline<T>

// Aliases for musical terminology
Rest = Gap
Melody<P> = Sequential<Note<P>>
Harmony<P> = Parallel<Note<P>>
MusicCycle<P> = Cycle<Note<P>>
```

While designing this implementation, I realized that the parallel/sequential
composition (a la _Haskell School of Music_) technique can be used more
generally than for music. For example, animation also involves arranging
events in time both sequentially and simultaneously. I created the
`Timeline` type for this purpose. Then `Music` is simply a `Timeline` of notes.

- `T` - A single event. This means it's possible to express a single note/sound effect as `Music`.
- `Rest = Gap Duration` - A time interval where nothing happens. In music, we
    call this a rest.
- `Melody = Sequential [Music]` - Several timelines that should play one after the other. This can be used for sequencing notes into a melody
- `Harmony = Parallel [Music]` - Several timelines that should play simultaneously. When the individual lines are of different lengths, the maximum duration is used. Harmony is used for expressing chords and voice leading for multiple voices in the same instrument.
- `MusicCycle = Cycle Duration [Music]` - A fixed-length cycle of musical material, inspired by Tidal Cycles
    - The overall length is fixed. The inner timelines are rescaled so they
    each take the same fraction of the cycle.
    - Example: The cycle `[C, D, E]` represents 3 notes, each 1/3 of a cycle.
    Meanwhile, `[C, D, E, F]` represents 4 quarter notes.
    - Cycles can be nested for more intricate subdivisions.
    - Example: `[C, D, [E, F], [G, A, B]]` plays the C and D for 1/4 cycle each,
    E and F for `1/4 * 1/2 = 1/8` cycle, and then G, A, and B for `1/4 * 1/3 = 1/12` cycles
- `MusicLoop = Loop Duration Music` - A fixed-length container whose contents
    repeat depending on the relative lengths
    - If the loop duration is longer than the inner music, the music is repeated
    to fill the remaining duration
    - If the loop duration is _shorter_ than the inner music, the music is
    cropped to the loop duration.

`MusicCycle` and `MusicLoop` are not strictly necessary (you could achieve the
same results with `Melody`). However, they make some musical ideas easier to
express in code.

### Scores

When multiple instruments are used, it's helpful to assign different portions
of the music to each one. I express this with additional types as follows:

```
Score<P> = [Part<P>]

// InstrumentID is some type that identifies the instrument
Part<P> = (InstrumentID, Music<P>)
```

Essentially a score is a list of `(instrument, music)` pairs. This makes it
easy to determine which instrument to use with the audio library.

For monophonic instruments (common in Tone.js), for `Harmony` only the top
line is played.
