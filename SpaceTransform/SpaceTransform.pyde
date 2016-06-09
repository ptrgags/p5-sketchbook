x_axis = PVector(50, 0)
y_axis = PVector(0, -50)
z_axis = PVector(25, -25)

vertices = [
    (x, y, z, w)
    for x in xrange(2)
    for y in xrange(2)
    for z in xrange(2)
    for w in xrange(2)
]

def draw_vec(vec):
    noFill()
    ellipse(vec.x, vec.y, 4, 4)

def draw_axis(vec, c):
    stroke(c)
    line(-vec.x * 10, -vec.y * 10, vec.x * 10, vec.y * 10)

def setup():
    size(400, 400)

def draw():
    
    w_axis = PVector((mouseX - width / 2) / 2, (mouseY  - height / 2) / 2)
    
    background(0)
    
    pushMatrix()
    translate(width / 2, height/ 2)
    
    draw_axis(x_axis, color(255, 0, 0))
    draw_axis(y_axis, color(0, 255, 0))
    draw_axis(z_axis, color(0, 0, 255))
    draw_axis(w_axis, color(255, 255, 255))
    
    for v in vertices:
        x, y, z, w = v
        p = x * x_axis + y * y_axis + z * z_axis + w * w_axis;
        draw_vec(p)
    
    popMatrix()
        