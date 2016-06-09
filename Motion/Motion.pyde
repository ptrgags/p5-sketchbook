class Spaceship(object):
    SCREEN_WIDTH = 640
    SCREEN_HEIGHT = 480
    TOP_SPEED = 4
    TOP_ACCELERATION = 0.4
    SIZE = 50 #Width of bounding box of spaceship shape
    def __init__(self, pos):
        self.position = pos
        self.velocity = PVector(0, 0)
        self.acceleration = PVector(0, 0)
    
    def step(self):
        self.velocity += self.acceleration
        self.velocity.limit(self.TOP_SPEED)
        
        self.position += self.velocity
        
        #self.clamp_position()
        self.wrap_position()
        
        #Clear the acceleration
        self.acceleration *= 0
    
    def clamp_position(self):
        if self.position.x < 0:
            self.position.x = 0
        if self.position.y < 0:
            self.position.y = 0
        
        if self.position.x > self.SCREEN_WIDTH:
            self.position.x = self.SCREEN_WIDTH - 1
        if self.position.y > self.SCREEN_HEIGHT:
            self.position.y = self.SCREEN_HEIGHT - 1
    
    def wrap_position(self):
        self.position.x %= self.SCREEN_WIDTH
        self.position.y %= self.SCREEN_HEIGHT
    
    def apply_accel(self, accel):
        self.acceleration.add(accel)
        self.acceleration.limit(self.TOP_ACCELERATION)
    
    def velocity_to(self, location):
        vel_to = location - self.position
        
        speed = vel_to.mag()
        
        vel_to.normalize()
        if speed < 100:
            new_speed = map(speed, 0, 100, 0, self.TOP_SPEED)
            vel_to *= new_speed
        else:
            vel_to *= self.TOP_SPEED
        
        return (vel_to - self.velocity).limit(self.TOP_ACCELERATION)
    
    def separate(self, other_ships, neighborhood):
        count = 0
        neighborhood_sq = neighborhood ** 2
        sum = PVector(0, 0)
        for ship in other_ships:
            distance = self.position - ship.position
            if 0 < distance.magSq() < neighborhood_sq:
                distance.normalize()
                sum += distance
                count += 1
        
        if count:
            sum /= count
            sum.setMag(self.TOP_SPEED)
            steer = (sum - self.velocity).limit(self.TOP_ACCELERATION)
        else:
            steer = PVector(0, 0)
        
        return steer

    def align(self, other_ships, neighborhood):
        count = 0
        neighborhood_sq = neighborhood ** 2
        sum = PVector(0, 0)
        for ship in other_ships:
            distance = self.position - ship.position
            if 0 < distance.magSq() < neighborhood_sq:
                sum += ship.velocity
                count += 1
        
        if count:
            sum /= count
            sum.setMag(self.TOP_SPEED)
            steer = (sum - self.velocity).limit(self.TOP_ACCELERATION)
        else:
            steer = PVector(0, 0)
        
        return steer
    
    def cohesion(self, other_ships, neighborhood):
        count = 0
        neighborhood_sq = neighborhood ** 2
        sum = PVector(0, 0)
        for ship in other_ships:
            distance = self.position - ship.position
            if 0 < distance.magSq() < neighborhood_sq:
                sum += ship.position
                count += 1
        
        if count:
            sum /= count
            steer = self.velocity_to(sum)
        else:
            steer = PVector(0, 0)
        
        return steer
    
    def get_normal_point(self, predicted, start, end):
        a = predicted - start
        b = end - start
        
        b.normalize()
        b.mult(a.dot(b));
        return start + b

    def predict(self):
        expected_vel = self.velocity.get()
        expected_vel.normalize()
        expected_vel.mult(25) #How many pixels to look ahead
        return self.position + expected_vel

    def follow(self, path):
        predicted_pos = self.predict()
        world_record = 100000000
        target = None
        
        for i in xrange(len(path.points) - 1):
            start = path.points[i]
            end = path.points[i + 1]
            normal_point = self.get_normal_point(predicted_pos, start, end)
            if not start.x < normal_point.x < end.x:
                normal_point = end.get()
            
            distance = (predicted_pos - normal_point).mag()
            if distance < world_record:
                world_record = distance
                target = normal_point.get()
            
     
        #
        #dir = path.end - path.start
        #dir.normalize()
        #dir.mult(self.TOP_SPEED) #This should be changeable
        #target = normal_point + dir
     
        if world_record > path.radius:
            return self.velocity_to(target)
        else:
            return PVector(0, 0)
                
    @property
    def angle(self):
        return self.velocity.heading()
    
    def draw(self, stroke_color):
        stroke(stroke_color)
        noFill()
        pushMatrix()
        translate(self.position.x, self.position.y)
        rotate(self.angle)
        
        #Make a spaceship that looks kinda like an OR gate
        beginShape()
        vertex(-self.SIZE / 2.0, -self.SIZE / 4.0)
        quadraticVertex(self.SIZE / 2.0, 0, -self.SIZE/2.0, self.SIZE / 4.0)
        quadraticVertex(-self.SIZE / 4.0, 0, -self.SIZE / 2.0, -self.SIZE / 4.0)
        endShape()
        
        #ellipse(0, 0, self.SIZE, self.SIZE)
        #line(0, 0, self.SIZE * 0.75, 0)
        popMatrix()

class Path(object):
    def __init__(self, points, radius):
        self.points = points
        self.radius = radius
    
    def draw(self):
        strokeWeight(self.radius * 2)
        stroke(0, 100)
        beginShape()
        for p in self.points:
            vertex(p.x, p.y)
        endShape()
        
        strokeWeight(1)
        stroke(0)
        beginShape()
        for p in self.points:
            vertex(p.x, p.y)
        endShape()
        
def setup():
    
    size(Spaceship.SCREEN_WIDTH, Spaceship.SCREEN_HEIGHT)
    
    global shipsA, shipsB
    positions = [PVector(random(width), random(height)) for x in xrange(10)]
    positions2 = [PVector(random(width), random(height)) for x in xrange(3)]
    shipsA = [Spaceship(pos) for pos in positions]
    shipsB = [Spaceship(pos) for pos in positions2]
    
    global path
    points = [PVector(0, 0), PVector(100, 100), PVector(300, 400), PVector(640, 480)]
    path = Path(points, 20)
    
    cursor(CROSS)

def draw():
    background(0xBBBBBB)
    global shipsA, shipsB, path
    
    mouse_pos = PVector(mouseX, mouseY)
    
    path.draw()
    
    #Global accelerations
    gravity = PVector.fromAngle(frameCount * PI / 100)
    wind = PVector(random(-0.2, 0.2), 0)
    
    for ship in shipsA:
        #accel_mouse = ship.velocity_to(mouse_pos)
        #accel_flee = ship.separate(shipsB, 50) #Run away from B ships
        #accel_align = ship.align(shipsA, 20)
        #accel_group = ship.cohesion(shipsA, 50)
        #accel_separate = ship.separate(shipsA, 20)
        accel_path = ship.follow(path)
        
        #ship.apply_accel(accel_mouse)
        ship.apply_accel(wind)
        #ship.apply_accel(accel_flee)
        #ship.apply_accel(accel_align)
        #ship.apply_accel(accel_group)
        #ship.apply_accel(accel_separate)
        ship.apply_accel(accel_path)
    
        ship.step()
        ship.draw(color(255, 0, 0))
    
    for ship in shipsB:
        
        #Pursue one of this ships. change this every 1000 frames
        ship_index = (frameCount / 1000) % len(shipsA)
        accel_pursuit = ship.velocity_to(shipsA[ship_index].position)
        accel_align = ship.align(shipsB, 100)
        
        ship.apply_accel(accel_pursuit)
        ship.apply_accel(accel_align)
        
        ship.step()
        ship.draw(color(0, 35, 128))
    
    