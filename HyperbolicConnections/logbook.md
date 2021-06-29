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