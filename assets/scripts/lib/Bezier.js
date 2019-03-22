function LinearBezier(p1, p2, t) {
  return p1 * (1 - t) + p2 * t;
}

function QuadraticBezier(p1, p2, p3, t) {
  return LinearBezier(p1, p2, t) * (1 - t) + LinearBezier(p2, p3, t) * t;
}

export function CubicBezier(p1, p2, t) {
  return QuadraticBezier(0, p1, p2, t) * (1 - t) + QuadraticBezier(p1, p2, 1, t) * t;
}