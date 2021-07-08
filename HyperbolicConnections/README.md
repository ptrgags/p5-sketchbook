# Hyperbolic Connections (2021)

Sketch for generating abstract patterns on the Poincaré disk like these:

| North Hemisphere | South Hemisphere |
|--|--|
|![Example Output: North Hemisphere](figures/example-north.png) | ![Example Output: South Hemisphere](figures/example-south.png) |

This sketch generates multiple images at once, this is so I can generate
images that I can stitch together into a "panorama" using my 
[panoramas script](https://github.com/ptrgags/panoramas). This script now
has an option to combine 2 stereographic projections into a single
equirectangular image to texture a sphere. See the section [Beyond the Sketch](#beyond-the-sketch) for more information about this

## Usage

Run the sketch. You will get a pair of patterns on the screen by default.
There are several settings you can adjust in the sketch, see the comments
in the code. At present, these settings are not exposed at runtime.

## Background

This idea came from patterns I draw by hand like these:

![Original Patterns](figures/original-patterns.png)

These patterns work as long as there are an even number of boundary points,
since you always connect two points at a time. When choosing connections,
you can only connect two boundary points if there are an even number
of other boundary points in between, otherwise you make it impossible to
finish the diagram without crossing lines:

![Boundary Rules](figures/boundary-conditions.png)

How would I make a digital version? Given that the shape of the boundary
doesn't matter (just how many boundary points and how they're connected), 
I tried doing so with a circle. The boundary points can always be connected
with a circle that is orthogonal to the boundary. Another way to think about
this is I'm drawing geodesics in the [Poincaré disk model](https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model) of the hyperbolic plane. That
would look something like this:

![Orthogonal Circles](figures/orthogonal-circles.png)

From there, I just needed a way to randomly generate these circles.

## Random Boundary Generation

One observation is that the circle fill patterns act like pairs of balanced
brackets when you walk around the boundary counterclockwise. 
This even works with multiple colors, just treat each color as a different
type of bracket/brace/parenthesis, or just color them differently like I did
in this diagram:

![Nested Brackets](figures/nested-brackets.png)

### Structure of the Strings

To generate multiple patterns at once to cover a whole sphere, we need to make
sure they line up at the equator. This requires:

1. There needs to be the same number of boundary points
2. The colors must match up on the boundary.
3. Colors should be filled the same way on both spheres.
4. Wherever the pattern has lines that touch the boundary, the angle must be
    reversed between northern and southern hemispheres. This way, when
    unprojected back to the sphere, the curve is at least C1 continuous
    at the equator:

![Constraint 4](figures/angle-constraint.png)

We need to adhere to these rules, but otherwise we want to make the patterns
as varied as possible.

To handle rules 1 and 2, I generate all the strings at once in lockstep, chunks
at a time. Each chunk has a single color, but the color is randomly selected
from a palette (color choice represented below as `A`, `B` or `C`).

```
Remaining length:     20
.                <-- Dot indicates randomly selected insertion point
AA.AAAA               14
AABBBBAA.AA           10
AABB.BBAACCCCCCAA      4
AABBAAAABBAACCCCCCAA   0
```

In order to satsify rules 2 and 3, I only insert chunks at even indices of the
boundary, otherwise sometimes there's inconsistencies between north and south
hemispheres. There might be more sophisticated ways of doing this, but this
works well enough for me.

To ensure that colors match, I use a simple odd/even fill rule. If an opening
bracket is at an even position in the string, that circle is filled, otherwise
the background color will be used.

Since the circles are chosen to be orthogonal to the boundary, rule 4 is always
satisfied. However, if the image is warped at all in the shader (I may explore
this more in the future), I'd need to be careful to twist one hemisphere
clockwise and the other one counterclockwise.

To add random variation, each chunk can be any pair of balanced brackets of
a single color and a fixed length. See the [Generating a Chunk](#generating-a-chunk)
section below for more details.

### Generating a Chunk

The algorithm for generating a single chunk is pretty straightforward. Given
a desired length, randomly add pairs of brackets so the result is always
balanced:

```
Pairs remaing:  5
.      <-- the dot indicates where the next pair of brackets will go
[].             4
[.][]           3
.[[]][]         2
[][[].][]       1
[][[][]][]      0
```

## Computing Orthogonal Circles

I didn't know how to compute orthogonal circles going through two of the
boundary points. After some research and playing around on paper, I found not
one but two ways, see the subsections below.

Also note that if the two boundary parts are opposite
each other on the circle, the "orthogonal circle" is
the line connecting the two points. Think of it as a circle
through infinity.

### Method 1: Intersect Tangents

The first method I had to look up. I found [This GeoGebra example](https://www.geogebra.org/m/S5xyRmtZ)
that shows how this works. Essentially, make tangent lines through the two
boundary points. The intersection of these will be the center of the circle.
The distance from that to one of the boundary points will be the radius:

![Tangent Method](figures/tangent-method.png)

### Method 2: Kite Analysis

While learning about the above, I realized that the geometry
forms a kite shape with nice side lengths and angles. Since
the main circle is the unit circle, two sides are length 1,
two sides are the radius I'm trying to find, and
two of the angles are 90 degrees! I looked up some math
about kites and found [Two area formulas](https://en.wikipedia.org/wiki/Kite_(geometry)#Area). I used both here
to derive another method for computing the orthogonal circles. It makes use of polar coordinates

Here's a diagram and derivation:

![Kite Method](figures/kite-method.png)

This is the method I use in the code, and the derivation
is also listed there in comments. I think this method is
slightly less efficient, as it uses more trig functions,
but it was nifty and it's fast enough for my use case.

## Beyond the Sketch

This sketch is really just part of a larger picture. Since these maps are
related to the Poincaré disk, it only takes an inverse stereographic projection
to map the colors onto a sphere. The results can be stored as an equirectangular
image (`(longitude, latitude)` texture).

My [panoramas repo](https://github.com/ptrgags/panoramas) makes it easy to
generate a panorama from 2 stereographic maps (one for the north hemisphere,
one for the south hemisphere):

```
python3 main.py stereographic sphere north.png /path/to/south.png
```

This generates a single equirectangular image. Here's example input and output:

Input:

| North Hemisphere | South Hemisphere |
|--|--|
|![Example Output: North Hemisphere](figures/example-north.png) | ![Example Output: South Hemisphere](figures/example-south.png) |

Output:

![Example Panorama](figures/example-panorama.png)

The distortion near the north/south pole stretches circles into rounded
rectangles, but in this case that results in an interesting artistic effect.