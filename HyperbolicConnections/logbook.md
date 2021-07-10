# Hyperbolic Connections

## Work So far

So far, this sketch generates a random abstract pattern of circles, and you can
twist the pattern by dragging the mouse. I still need to document how this works
and how this relates to hyperbolic geometry.

## 2021-06-29 Palette from Coolors.co

Yesterday I was generating several images from this sketch, and I found it
helpful to use [coolors.co](https://coolors.co) for this. The neat thing is
their URLs are of the format:

```
https://coolors.co/color1-color2-color3-...-colorN
```

Where the colors are hex codes. So this is easy to parse and turn into an
array of colors to pass to the sketch.

## Next Steps

* There's a bug in the pattern generation, sometimes circles get filled when
  they should not be filled. Figure out why this is happening
* One of the reasons why I wanted to make these is to use as stereographic
  projections to use in my other repo, [panoramas](https://github.com/ptrgags/panoramas).
  To facilitate this, I need to be able to generate not 1 map but 2 that connect
  at the edge. I need to think about this more.

## 2021-07-03 Pinch Function

Today I was thinking about new ways to warp the image besides radial stretching
and twisting. I think one way is to pinch/stretch the angle component
periodically.

I made a [Desmos graph](https://www.desmos.com/calculator/u6wkpshcx5) to
prototype this. It's kinda neat, it uses similar math to gamma corrections, but
it also uses some symmetry operations to shape the graph correctly.

That said, this equation seems cumbersome, I should revisit this and find a
simpler formula.

Also, I made one observation: when picking a gamma factor, if you want a linear
slider to control it, the slider should control an _angle_ and the tangent of
the angle would give you the gamma factor.

Next Steps:

* Find a simpler equation for this pinching operation
* Try other warping methods. Perhaps a linear stretch from one semicircle to
    the other.

## 2021-07-04 Color-matched Images

Today I made quite a bit of progress:

* I refactored the code so I could generate multiple images via `p5`'s instance
    mode. This allows me to generate both north and south hemispheres of a
    stereographic projection.
* I designed a new algorithm that generates multiple boundary strings in
    lockstep so the colors and fill match, even though the patterns can vary
* I noticed and fixed some issues with the use of `smoothstep()`

There are a couple caveats:
* The twisting doesn't work correctly with multiple images given how `p5`
    measures mouseX, so I turned it off.
* I reverted to the odd/even fill rules. This results in a lot of one color.

Next Steps:

* Consider adding multiple background colors to compensate for the odd/even
    fill rule
* Figure out a better way to apply twisting. Also, don't use mouse dragged,
    it makes it hard to take a screenshot without warping the image