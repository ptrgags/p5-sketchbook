export function vec2(x, y) {
  return { x: x, y: y };
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function norm(v) {
  return v.x * v.x + v.y * v.y;
}

export function scale(r, v) {
  return { x: r * v.x, y: r * v.y };
}
