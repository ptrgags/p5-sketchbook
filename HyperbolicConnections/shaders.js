export const PRIMITIVE_CIRCLE = 0.0;
export const PRIMITIVE_LINE = 1.0;

export const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 v_uv;

void main() {
  gl_Position = vec4(aPosition, 1.0);
  
  // [-1, 1] x [-1, 1]
  v_uv = 2.0 * aTexCoord - 1.0;
}
`;

export const FRAGMENT_SHADER = (pair_count) => `
#line 0
#define PAIR_COUNT ${pair_count}
#define CIRCLE ${PRIMITIVE_CIRCLE.toFixed(1)}
#define LINE ${PRIMITIVE_LINE.toFixed(1)}
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

// +1 for north hemisphere or -1 for south hemisphere. This
// is used to reverse twists for the southern hemisphere
uniform float hemisphere;

// [-1, 1] x [-1, 1]
varying vec2 v_uv;

float circle(vec2 point, vec2 center, float radius, float interior, float feather_amount) {
  float dist = length(point - center);
  
  float mask = smoothstep(radius + feather_amount, radius - feather_amount, dist);
  
  return mix(1.0 - mask, mask, interior);
}

float half_plane(vec2 point, vec2 normal, float feather_amount) {
  float dist = dot(point, normal);
  return smoothstep(0.0 + feather_amount, 0.0 - feather_amount, dist);
}

vec3 fill_circles(vec2 uv) {
  vec3 color = background_color;
  
  const float CIRCLE_FEATHER_AMOUNT = 0.0025;
  const float LINE_FEATHER_AMOUNT = 0.01;
  
  for (int i = 0; i < PAIR_COUNT; i++) {
    vec4 primitive = primitives[i];
    
    vec2 fill = fill_flags[i];
    float should_fill = fill.x;
    float interior = fill.y;
    
    float primitive_type = primitive.a;
    float mask = 0.0;
    float outline = 0.0;
    float feather_amount = 0.0;
    if (primitive_type == CIRCLE) {
      mask = circle(uv, primitive.xy, primitive.z, interior, CIRCLE_FEATHER_AMOUNT);
    } else {
      mask = half_plane(uv, primitive.xy, LINE_FEATHER_AMOUNT);
    }
    
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
  // for the southern hemisphere, reverse the twist direction so
  // when projected to a sphere, the tangents at the edges match up.
  return vec2(polar.x, polar.y + hemisphere * twist_amount);
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
  pos.y *= 7.0 / 5.0;
  pos = to_polar(pos);
  pos = warp(pos);
  pos = to_rect(pos);
  
  vec3 color = fill_circles(pos);
  
  // only show the unit circle
  // A tiny bit bigger to reduce the background bleeding when I post-process
  // the images via image warping.
  float radius = 1.0 + 0.001;
  float interior = 1.0;
  float feather_amount = 0.0025;
  float unit_circle = circle(pos, vec2(0.0), radius, interior, feather_amount);
  //color = mix(vec3(0.0), color, unit_circle);
  
  gl_FragColor = vec4(color, 1.0);
}
`;
