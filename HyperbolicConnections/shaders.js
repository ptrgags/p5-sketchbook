const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 uv;

void main() {
  gl_Position = vec4(aPosition, 1.0);
  
  // [-1, 1] x [-1, 1]
  uv = 2.0 * aTexCoord - 1.0;
}
`;

const FRAGMENT_SHADER = (pair_count) => `
#define PAIR_COUNT ${pair_count}

precision highp float;

// for lines: (nx, ny, n dot p0, 0.0);
// for circles: (cx, cy, r, 1.0);
uniform vec4 primitives[PAIR_COUNT];
// (should_fill, interior);
uniform vec2 fill_flags[PAIR_COUNT];

// [-1, 1] x [-1, 1]
varying vec2 uv;

float circle(vec2 point, vec2 center, float radius, float interior) {
  float dist = length(point - center);
  float mask = smoothstep(radius + 0.01, radius, dist);
  
  return mix(1.0 - mask, mask, interior);
}

float circle_outline(vec2 point, vec2 center, float radius) {
  float dist = length(point - center);
  
  float outer = smoothstep(radius + 0.01, radius, dist);
  float inner = 1.0 - smoothstep(radius, radius - 0.01, dist);
  return outer * inner;
}

float half_plane(vec2 point, vec2 normal) {
  float dist = dot(point, normal);
  return smoothstep(0.01, 0.0, dist);
}

float half_plane_outline(vec2 point, vec2 normal) {
  float dist = abs(dot(point, normal));
  return smoothstep(0.01, 0.0, dist);
}

#define CIRCLE 0.0
#define LINE 1.0
void main() {
  const vec3 BACKGROUND = vec3(1.0);
  vec3 color = BACKGROUND;
  
  for (int i = 0; i < PAIR_COUNT; i++) {
    vec4 primitive = primitives[i];
    
    vec2 fill = fill_flags[i];
    float should_fill = fill.x;
    float interior = fill.y;
    
    float primitive_type = primitive.a;
    float mask = 0.0;
    float outline = 0.0;
    if (primitive_type == CIRCLE) {
      mask = circle(uv, primitive.xy, primitive.z, interior);
      outline = circle_outline(uv, primitive.xy, primitive.z);
    } else {
      mask = half_plane(uv, primitive.xy);
      outline = half_plane_outline(uv, primitive.xy);
    }
    
    float actual_mask = mix(outline, mask, should_fill);
    const vec3 ORANGE = vec3(1.0, 0.5, 0.0);
    vec3 fill_color = mix(BACKGROUND, ORANGE, should_fill);
    color = mix(color, fill_color, mask);
  }
  
  
  // only show the unit circle
  float unit_circle = circle(uv, vec2(0.0), 1.0, 1.0);
  color = mix(vec3(0.0), color, unit_circle);
  
  gl_FragColor = vec4(color, 1.0);
}
`;
