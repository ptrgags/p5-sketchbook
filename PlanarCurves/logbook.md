# Planar Curves

## 2021-07-11 Initial Experiments

This sketch is an experiment in learning about curvature of planar curves
in differential geometry. Starting with an initial point, orientation, and
a curvature function, this sketch computes the path, parameterized by
arc length.

The math for this can be found in [This paper](https://archive.bridgesmathart.org/2014/bridges2014-337.pdf)
about self-avoiding random walks (minus the self-avoiding part, that's beyond
the scope of this sketch).

```
theta(s) = integral(0, s, k(s), ds)
x(s) = integral(0, s, cos(theta(s)), ds)
y(s) = integral(0, s, sin(tehta(s)), ds)
```

When I first looked at these, I wasn't sure where the cos(theta) and sin(theta)
are, but these are just the components of the unit tangent vector:
`(cos(theta(s)), sin(theta(s)))`

I made an ensemble of curves with slightly varied parameters to make more
interesting designs. Like the [Hyperbolic Connections sketch](../HyperbolicConnections/),
I use palettes from https://coolors.co/, as the URLs are easy to parse.

Next Steps:
* Gather the parameters into a struct like I did with the seashell surfaces
* Experiment with more curvature functions such as:
  * square/saw/triangle waves?
  * normal curve or other impulse-like function?
  * Tap into the gamepad API to adjust the curvature in real-time?
  * Try the self-avoiding walk (perhaps in a separate sketch?)

## 2021-07-12 Clean up Sketch

Today I want to clean up the sketch to move on to something else. I did
the following:

* Moved parameters to a simple struct, similar to what I did with the
    [SeashellTexture sketch](../SeashellTexture/).
* Added Web Gamepad API support so I can adjust the curvature manually

This was the first time I used the [Web Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API)
It proved pretty easy to set up, though one thing that the MSN docs don't
explain well is that the Gamepad objects are created every frame, not updated
in place, so using `naviagtor.getGamepads()[i]` is important in the update
loop.

Next Steps:
* Modify the gamepad controls to adjust the curve speed
    (perhaps with the A button?) and/or the maximum curvature (right stick?)
* Create a README