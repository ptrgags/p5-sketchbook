# Animated Tangle: Animation Breakdown

IMG: labeled panels

## Top Level: Animated Tangle

## Panel 1: Seascape

## Panel 2: Traffic

## Panel 3: Quadrants

### Panel 3A: Hitomezashi

### Panel 3B: Circle Fan

### Panel 3C: Peek

### Panel 3D: Brick Wall

## Panel 4: Coral

### Panel 4A: Coral Polyps

## Panel 5: Geode

IMG: close up of the geode

I love the look of geodes, especially the banding patterns of agate.

In real life, agates form when silica-rich water fills a crack in a rock and deposits a layer of crystal on the walls. When this happens repeatedly over time, you get bands of color growing inwards from the walls. See [This article from Geology In](https://www.geologyin.com/2016/02/how-do-agates-form.html) for more information.

I figured out a way to render such banding patterns. I take the boundary polygon and render it many times with different stroke widths.

I render the innermost color band first by using a very thick outline. Then, I render the second innermost band with a slightly thinner line, and so on.

| First Band                         | Second Band                       | Many Bands                         |
| ---------------------------------- | --------------------------------- | ---------------------------------- |
| IMG: Polygon with first band drawn | IMG: Polygon with two bands drawn | IMG: polygon with many bands drawn |

This produces lines both inside and outside the polygon. However, if we use the boundary polygon as a clip mask, we
can crop out the outside portion.

IMG: Cropped version - now it looks like a geode.

This geode rendering is very similar to what I did with
the Circulal Fan animation. The only difference is in the
timing. Circular Fan moves in steps for a mechanical feel,
but Geode grows continuously.

## Panel 6: Barber Pole and Doors

### Panel 6A: Barber Pole

IMG: The stripes with an arrow to show motion

To make the barber poles, I just used a set of stripes that scroll across the panel.

### Panel 6B: Doors

IMG: close up of the doors

This panel features doors that open and close, somewhat like jaws. I chose the timing carefully so the doors close one after another with a steady rhythm.
