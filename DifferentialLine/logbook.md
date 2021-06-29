# Differential Line (2021-06)

## 2021-06-29 Initial Sketch

Today I started following along with [this article by Jason Webb](https://medium.com/@jason.webb/2d-differential-growth-in-js-1843fd51b0ce)
about differential growth in 2D. So far, I created basic classes for `Point`,
`Polyline` and a utility `Vec2` class. I've added an attraction force to
neighbors and an alignment force, but so far the results aren't great. I'll
need to do the repulsion force and that's going to require a spatial data
structure.

Also, not quite happy with my vector implementation. I should probably
do operations in place to avoid unnecessary allocations.

## Next Steps

* Create a spatial data structure so I can do the NN query
* Revise my Vec2 class
* Better yet, design one vector class that can be reused in sketches. I'm tired
  of redefining it.