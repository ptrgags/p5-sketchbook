# Autocatalysis

## 2021-07-30 Initial Experiments

Yesterday and today I worked on implementing the differential equations for
[Autocatalysis](https://en.wikipedia.org/wiki/Autocatalysis#Far_from_equilibrium)
except I made the system general enough to handle 4 chemical species. This
involved:

* Parsing equations like `A + 2B -> C` or `A + 2B + C <-> D`. Both forward
    and reversible reactions are supported
* Integrating the differential equations
* Rendering the results. I render the value with the maximum concentration,
    but it would be good to think of other coloring methods. Perhaps interpolate
    between the 4 colors using the relative concentrations as weights?


Here's one interesting result from experimenting with coupled equations:

```
A + B -> C
2C -> D + B
3D -> A
```

In the image below:
* A = purple
* B = dark green
* C = yellow
* D = red

![Early complex reaction](figures/complex-reaction.png)

I'm out of time this morning, I'll analyze what's going on here later

Next Steps:

* Experiment with more equations - can I find a system that oscillates naturally?
* Experiment with rendering methods
  * Interpolate color palette
  * Try making some sort of phase space plot to see what's going on?