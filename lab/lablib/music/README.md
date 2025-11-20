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

// Aliases for musical terminology
Rest = Gap
Melody<P> = Sequential<Note<P>>
Harmony<P> = Parallel<Note<P>>
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

### Specialized Melody Constructors

Originally my definition of Timeline had `Loop` and `Cycle` types to express
looped clips of music (like in a DAW) and even subdivisions (like in Tidal Cycles).
This made several algorithms more complicated. I eventually decided on
a different approach - have fancy constructors that can describe timelines in
terms of loops/cycles, but expand them into the equivalent `Sequential/Melody`.

#### Loops

- `Sequential.from_repeat(timeline: Timeline, n: int)`
  - Take `timeline` and make exactly $n \ge 1$ copies of it in sequence.
- `Sequential.from_loop(timeline: Timeline, total_duration: Duration)`
  - Repeat `timeline` as many times as it takes to be `total_duration` measures long.
  - This is inspired by music clips in a DAW, where you can drag the right end of the clip to repeat it to an arbitrary length.
  - (⚠️Not yet implemented) If `total_duration` is not an integer multiple of `timeline.duration`, the last copy will be truncated to fit.
  - Under the hood this constructor makes use of `Sequential.from_repeat()`

#### Cycles

- `Sequential.from_cycle(cycle_duration: Duration, timelines: Timeline[])`
  - Like in Tidal Cycles, take `cycle_duration` and divide it evenly based on the number of entries of timelines.
  - The inner timelines are rescaled so they each take the same fraction of the cycle. See the section on [Time stretching](#time-stretching)
  - Example: the cycle `[C, D, E]` represents 3 notes, each 1/3 of a cycle.
    Meanwhile, `[C, D, E, F]` represents 4 quarters of a cycle.
  - Cycles can be nested for more intricate subdivisions.
  - Example: `[C, D, [E, F], [G, A, B]]` plays the C and D for 1/4 cycle each,
    E and F for `1/4 * 1/2 = 1/8` cycle, and then G, A, and B for `1/4 * 1/3 = 1/12` cycles

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

## Transformations

### Map Over Timeline

A timeline is a fancy collection of the underyling type `T`. Sometimes we
want to apply the same transformation to each of these underlying values.
In `Timeline.js`, the function `timeline_map` does just this.

```
timeline_map f Gap = Gap
timeline_map f T = f T
timeline_map f Sequential(children) = Sequential(map (timeline_map f) children)
timeline_map f Parallel(children) = Parallel(map (timeline_map f) children)
```

`timeline_map(f: function(T): U, timeline: Timleine<T>): Timeline<U>` traverses
the structure of `timeline` and every time a `T` value is encountered, it
uses `f()` to transform it to some new type `U`. A new timeline is created
with the same overall structure, but containing only the U values.

This is used for pitch conversions like transposition, inversion, etc.

For `Music`, some musical transformations take a `Note(pitch, duration)`
and turn it into a note with a different pitch `Note(different_pitch, duration)`. in `Score.js`, the function `map_pitch(pitch_func, music)` specializes
`timeline_map()` for this use case. This is used for things like transposing
and inverting musical material.

### Transpose

Transposition can be done using `map_pitch()` + a simple math formula.

For `Music`, sometimes we want to take musical material and transpose it to
a different range. Sometimes this is used to make a motif that moves up the
scale. Or perhaps you want to take a melody and transpose it up or down an
octave for a different instrument to play.

For absolute pitches, transposition uses the formula

`transpose(pitch, interval) = pitch + interval`

For other pitch representations (pitch class, scale degree), the formula
is similar. See `transpose.js` for some examples.

### Inversion (⚠️not yet implemented)

Inversion can be done using `map_pitch()` + a simple math formula.

In music theory, there a few different ways to describe inversions of
a melody. I prefer thinking about it in terms of a reflection about some
chosen center pitch (in some cases, quarter tones are needed).

`invert(pitch, center) = 2 * center - pitch`

#### Gory Details: Explanation of inversion formula

Reflection in the origin would be calculated as `invert(pitch) = -pitch`.
However, we don't want to flip over that, that would produce negative pitches!

We want to flip over some chosen pitch on the staff. So we need to
change our perspective by transposing up to the center pitch. In group theory,
this sort of "change of perspective/transforming a transformation" is called
**conjugation** and has the form `A * B * A^(-1)`, applied from right to left.

So here we're conjugating `invert` by `transpose(center)`:

```
transpose(center) * invert * transpose^-1(center)(pitch)
= transpose(center) * invert(pitch - center)
= transpose(center)(-(pitch - center))
= -(pitch - center) + center
= -pitch + center + center
= 2 * center - pitch
```

🪦

### Reverse aka Retrograde

In music, "retrograde" refers to flipping a piece of music backwards in time,
so the last note plays first and so on. In terms of a generic `Timeline`, we might describe this more simply as "reverse"

⚠️Right now only `retrograde(music)` exists, but the function should be made into a generic `reverse(timeline)`, then `retrograde` is just a type alias
for music.

We can do this via a recursive algorithm:

```
reverse T = T
reverse Gap = Gap
reverse Sequential(children) = Sequential(array_reverse (map reverse children))
reverse Parallel(children, duration) =
    Parallel(map (pad_if_needed duration) children)

// Helper function: if the individual line is shorter than the full Parallel
// timeline, there is an implicit Gap at the end.
// when reversing the timeline, we need to explicitly add this Gap.
//
// aaaaaaaaaaa                aaaaaaaaaaa
// bbbbbbb       --reverse--> GGGGbbbbbbb  (G = gap)
// ccccccccc                  GGccccccccc
//
//
pad_if_needed target_duration timeline(duration)
  | duration == target_duration = timeline
  | otherwise = Sequential(Gap(target_duration - duration), timeline)
```

### Time Stretching

Sometimes we want to take a timeline and `ssttrreettcchh` it or `sqsh` it
by a multiplicative factor. This can be used to speed/up slow down a melody.
It's also used by `Sequential.from_cycle()`

This is very similar to `timeline_map()`, except here we want to operate on
not just the intervals `T`, but also the `Gap`s:

```
time_stretch Gap(duration) factor = T(duration * factor)
time_stretch T(duration) factor = T(duration * factor)
time_stretch Sequential(children) factor = Sequential(map time_stretch children)
time_stretch Parallel(children) factor = Parallel(map tim_stretch children)
```

### Delaying Music (⚠️not yet implemented)

If you want to delay a bit of music so it starts later in time, you could
always just do `timeline -> Sequential(Gap(delay_amount), timeline)`. For
a slightly flatter version, here's a recursive formula:

```
delay amount Gap(duration) = Gap (duration + amount)
delay amount T = Sequential(Gap(amount), T)
delay amount Sequential(children) = Sequential(Gap(amount), ...children)
delay amount Parallel = Sequential(gap(amount), Parallel)
```
