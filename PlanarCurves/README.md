# Planar Curves

This sketch experiments with creating curves in the plane based on a curvature
function.

I also used this sketch to experiment with different types of input devices,
namely:

* Gamepads via the [Web Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API)
* Digital pen and tablet via the [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
* MIDI music controllers via the [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)

## Usage

In the main file (`PlanarCurves.js`), the `PARAMETERS` preset can be selected
from one of the ones in `parameters.js`. New presets can be added by creating a
new Parameters struct.

Some presets require different input devices, see the notes below.

Current presets:

| Preset | Description | Notes |
| --- | --- | --- |
| `RANDOM_WALK` | A random number from `[-1.0, 1.0]` is addded each frame | N/A |
| `GAMEPAD` | A gamepad's left joystick controls the curvature | Requires a gamepad plugged in. I've only tried this with an Xbox controller |
| `POINTER` | Use a pen's tilt angle to control the curvature | Requires a pen and tablet that has a pen tilt sensor. I used a Gaomon M10K Pro |
| `MIDI` | Use a MIDI Control Change message (any channel, controller 1) to control the curvature | Requires some sort of MIDI device. I used one of the knobs on an Akai LPD8 |

## Background

I wanted to learn about defining curves from curvature and torsion using the
Frenet-Serret equations. I decided to start with planar curves (curvature nonzero, torsion 0) since that was easy, and I had seen the technique described
in a paper from the 2014 Bridges math art conference:  ["Taking a Point for a Walk: Pattern Formation with Self Interacting Curves"](https://archive.bridgesmathart.org/2014/bridges2014-337.pdf) by David Chappell.

Since curvature can be defined as `k(s) = d(theta)/ds`, we can integrate
both sides to get:

```
theta(s) = int(k(s), 0, s)
```

This angle is the angle of the tangent vector. Since the curve is parameterized by the arc length, this is a unit length vector:

```
T = (cos(theta(s)), sin(theta(s))
```

If we integrate this, we can get the position:

```
r(s) = int(T(s), 0, s) = (int(cos(theta(s)), 0, s), int(sin(theta(s)), 0, s))
```

The components are the `x(s)` and `y(s)` described in the paper.

So as long as we have some function `k(s)` we can compute `r(s)` by numeric
integration (I used the [Euler method](https://en.wikipedia.org/wiki/Euler_method) for its simplicity)

TODO: Diagrams

## Parameters

TODO