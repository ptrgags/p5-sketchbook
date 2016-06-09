def to_rect(radius, angle, flip_y=True):
    """
    Convert polar to rectangular coords
    """
    x = radius * cos(angle)
    y = -1 if flip_y else 1
    y *= radius * sin(angle)
    return x, y

def hex_points(radius, flat_top=True):
    """
    PVectors for the corners of a hexagon
    relative to the center
    
    flat_top: True means flat-topped hex, False means pointy
    """
    angle_offset = 0 if flat_top else PI / 6
    for i in xrange(6):
        angle = THIRD_PI * i + angle_offset
        yield to_rect(radius, angle)

def draw_hex(center, radius, flat_top=True):
    cx, cy = center
    beginShape()
    for x, y in hex_points(radius, flat_top):
        vertex(cx + x, cy + y)
    endShape(CLOSE)
    
def hex_dims(size):
    h = size * 2
    w = sqrt(3) * size
    return w, h

def to_cube(r, q):
    x = q
    z = r
    y = -x - z
    return x, y, z

def setup():
    size(640, 480)

HEX_SIZE = 30

w, h = hex_dims(HEX_SIZE)
r_basis = PVector(w / 2, h * 3 / 4)
q_basis = PVector(w)

def draw():
    background(0)
    
    noFill()
    stroke(255)
    
    translate(width / 2, height / 2)
    
    for r in xrange(-3, 4):
        for q in xrange(-3, 4):
            x, y, z = to_cube(r, q) 
            c = r * r_basis + q * q_basis
            if 3 >= y >= -3:
                stroke(255)
                draw_hex((c.x, c.y), HEX_SIZE, False)
            if x == 0:
                stroke(255, 0, 0)
            if y == 0:
                stroke(0, 255, 0)
            if z == 0:
                stroke(0, 0, 255)
            if y == 0 or x == 0 or z == 0:
                ellipse(c.x, c.y, 10, 10)