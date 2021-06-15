def my_lerp(c1, c2, a):
    """
    Linear interpolate between
    colors c1 and c2 with alpha a
    """
    return a * c1 + (1 - a) * c2

#These are colors, not xyz coordinates.
C1 = PVector(255, 0, 0)
C2 = PVector(0, 0, 255)
C3 = PVector(0, 255, 0)

H_SLICES = 640
V_SLICES = 480

def setup():
    size(640, 480)
    background(0)
    noStroke()
    dx = width * 1.0 / H_SLICES
    dy = height * 1.0 / V_SLICES
    for x in xrange(H_SLICES):
        x_alpha = x * 1.0 / H_SLICES
        x_color = my_lerp(C1, C2, x_alpha)
        for y in xrange(V_SLICES):
            y_alpha = y * 1.0 / H_SLICES
            y_color = my_lerp(C3, x_color, y_alpha)
            fill(color(y_color.x, y_color.y, y_color.z))
            rect(x * dx, y * dy, dx, dy)
            
def draw():
    pass
