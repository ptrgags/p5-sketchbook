const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 v_uv;

void main() {
  gl_Position = vec4(aPosition, 1.0);
  
  // [-1, 1] x [-1, 1]
  v_uv = 2.0 * aTexCoord - 1.0;
}
`;

const FRAGMENT_SHADER = (pair_count) => `
#define PAIR_COUNT ${pair_count}
#define CIRCLE 0.0
#define LINE 1.0
#define PI ${Math.PI}

precision highp float;

// for lines: (nx, ny, n dot p0, 0.0);
// for circles: (cx, cy, r, 1.0);
uniform vec4 primitives[PAIR_COUNT];
// (should_fill, interior);
uniform vec2 fill_flags[PAIR_COUNT];

// colors for each circle
uniform vec3 colors[PAIR_COUNT];

// background color is configurable
uniform vec3 background_color;

uniform vec2 mouse_uv;

// [-1, 1] x [-1, 1]
varying vec2 v_uv;

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

vec3 fill_circles(vec2 uv) {
  vec3 color = background_color;
  
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
    vec3 circle_color = colors[i];
    vec3 fill_color = mix(background_color, circle_color, should_fill);
    color = mix(color, fill_color, mask);
  }
  
  return color;
}

vec2 to_polar(vec2 rect) {
  return vec2(
    length(rect), 
    atan(rect.y, rect.x)
  );
}

vec2 to_rect(vec2 polar) {
  return vec2(
    polar.x * cos(polar.y),
    polar.x * sin(polar.y)
  );
}

vec2 twist(vec2 polar, float twist_amount) {
  return vec2(polar.x, polar.y + twist_amount);
}

vec2 radial_stretch(vec2 polar, float control_point) {
    float r = polar.x;
    // This polynomial goes through the curves (0, 0), (1, 1)
    // and the point (0.5, control_point). 
    float stretched = 
        (2.0 - 4.0 * control_point) * r * r + 
        (4.0 * control_point - 1.0) * r;
    // The polynomial doesn't necessarily stay in range.
    stretched = clamp(stretched, 0.0, 1.0);
    return vec2(stretched, polar.y);
}

vec2 warp(vec2 polar) {
  vec2 pos = polar;
  pos = radial_stretch(pos, 0.5 + mouse_uv.x);
  pos = twist(pos, mouse_uv.y * 2.0 * PI * (1.0 - polar.x));
  return pos;
}

void main() {
  vec2 pos = v_uv;
  pos = to_polar(pos);
  pos = warp(pos);
  pos = to_rect(pos);
  
  vec3 color = fill_circles(pos);
  
  // only show the unit circle
  float unit_circle = circle(v_uv, vec2(0.0), 1.0, 1.0);
  color = mix(vec3(0.0), color, unit_circle);
  
  gl_FragColor = vec4(color, 1.0);
}
`;
