P1 = PVector(100, 240)
P2 = PVector(320, 100)
P3 = PVector(540, 240)
P4 = PVector(540, 300)

STEPS = 10
RATIO = 1.0 / STEPS

def interpolate(p1, p2, ratio):
    distance = p2 - p1
    return p1 + distance * ratio

def plot(p, r=3):
    circle(p.x, p.y, r)

def line_between(p1, p2):
    line(p1.x, p1.y, p2.x, p2.y)

def circle(x, y, r):
    ellipse(x, y, r, r)

def bezier_gen(p1, p2, p3, steps, ratio):
    for x in xrange(steps):
        p4 = interpolate(p1, p2, ratio * x)
        p5 = interpolate(p2, p3, ratio * x)
        #Curve point
        p6 = interpolate(p4, p5, ratio * x)
        yield p4, p5, p6

def bezier_gen_cubic(p1, p2, p3, p4, steps, ratio):
    for x in xrange(steps):
        #First subdivision
        p5 = interpolate(p1, p2, ratio * x)
        p6 = interpolate(p2, p3, ratio * x)
        p7 = interpolate(p3, p4, ratio * x)
        #Second subdivision
        p8 = interpolate(p5, p6, ratio * x)
        p9 = interpolate(p6, p7, ratio * x)
        #Curve point
        p10 = interpolate(p8, p9, ratio * x)
        yield p8, p9, p10

def setup():
    size(640, 480)

def draw():
    background(0)
    stroke(255, 0, 0)
    strokeWeight(4)
    noFill()
    beginShape()
    vertex(P1.x, P1.y)
    quadraticVertex(P2.x, P2.y, P3.x, P3.y)
    endShape()
    
    stroke(255)
    strokeWeight(1)
    plot(P1)
    line_between(P1, P2)
    plot(P2)
    line_between(P2, P3)
    plot(P3)
    
    for p4, p5, p6 in bezier_gen(P1, P2, P3, STEPS, RATIO):
        line_between(p4, p5)
        plot(p6)
    
    

def mouseDragged():
    global P2
    P2 = PVector(mouseX, mouseY)

def mouseWheel(event):
    global STEPS, RATIO
    STEPS -= int(event.getCount())
    STEPS = max(STEPS, 1)
    RATIO = 1.0 / STEPS