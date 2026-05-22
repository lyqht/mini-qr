import type { ECLevel, ShapeMask } from '../types'

/**
 * Build a `hideCell(r, c)` predicate that returns true when the module at
 * (r, c) lies outside the configured shape mask. The QR matrix sits inside a
 * notional unit square (0..1 on both axes), and each cell's centre is
 * hit-tested against the shape.
 *
 * Custom shapes are stamped by point-in-polygon over `shape.svgPath` — we
 * approximate the path by sampling, since this runs in the SSR-safe SVG path
 * and we can't rely on the DOM's `isPointInFill`.
 */
export function buildShapeMaskPredicate(
  mask: ShapeMask,
  count: number
): (r: number, c: number) => boolean {
  const inside = pointInShape(mask)
  return (r, c) => {
    // Cell centre in unit-square coordinates.
    const x = (c + 0.5) / count
    const y = (r + 0.5) / count
    return !inside(x, y)
  }
}

function pointInShape(mask: ShapeMask): (x: number, y: number) => boolean {
  if (typeof mask === 'string') {
    switch (mask) {
      case 'circle':
        return circleInside
      case 'rounded-square':
        return roundedSquareInside
      case 'heart':
        return heartInside
      case 'triangle':
        return triangleInside
      case 'star':
        return starInside
    }
  }
  // Custom path: parse to polyline and run point-in-polygon. Falls back to
  // "always inside" if parsing fails — we'd rather show a full QR than blank.
  const polygon = parseSvgPathToPolygon(mask.svgPath)
  if (!polygon || polygon.length < 3) return () => true
  return (x, y) => pointInPolygon(x, y, polygon)
}

function circleInside(x: number, y: number): boolean {
  const dx = x - 0.5
  const dy = y - 0.5
  return dx * dx + dy * dy <= 0.25
}

function roundedSquareInside(x: number, y: number): boolean {
  // Square inset by 0 — same as a normal QR — but with rounded corners that
  // clip cells just at the corners.
  const corner = 0.15
  const inCorner =
    (x < corner || x > 1 - corner) && (y < corner || y > 1 - corner)
  if (!inCorner) return true
  const cx = x < corner ? corner : 1 - corner
  const cy = y < corner ? corner : 1 - corner
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= corner * corner
}

function triangleInside(x: number, y: number): boolean {
  // Upright equilateral inscribed in the unit square. Apex (0.5, 0), base at y=1.
  // Edges: y >= 0, y <= 1, and y >= |x - 0.5| * 2 (so the triangle widens
  // linearly from apex to base).
  if (y < 0 || y > 1) return false
  return y >= Math.abs(x - 0.5) * 2 * 1
}

function heartInside(x: number, y: number): boolean {
  // Implicit heart curve: shift to centred coords, then use the classic
  // (x² + y² − 1)³ − x²y³ <= 0. Scale so the heart fills the unit square.
  const cx = (x - 0.5) * 2.4
  const cy = (0.55 - y) * 2.4
  const term = cx * cx + cy * cy - 1
  return term * term * term - cx * cx * cy * cy * cy <= 0
}

function starInside(x: number, y: number): boolean {
  // 5-pointed star: point-in-polygon over the 10-vertex star polygon
  // inscribed in the unit square.
  const cx = 0.5
  const cy = 0.5
  const rOuter = 0.5
  const rInner = rOuter * 0.382
  const verts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    verts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return pointInPolygon(x, y, verts)
}

function pointInPolygon(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Coarse SVG path → polygon sampler. Handles M / L / H / V / Z absolute and
 * relative commands plus C/Q via endpoint sampling — enough for "trace this
 * outline as a polygon for point-in-poly". Strokes and fill rules are ignored.
 */
function parseSvgPathToPolygon(path: string): [number, number][] | undefined {
  const points: [number, number][] = []
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  const tokens = path
    .replace(/([a-zA-Z])/g, ' $1 ')
    .replace(/,/g, ' ')
    .trim()
    .split(/\s+/)

  let i = 0
  const take = (): number => Number(tokens[i++])
  while (i < tokens.length) {
    const cmd = tokens[i++]
    switch (cmd) {
      case 'M':
        x = take()
        y = take()
        startX = x
        startY = y
        points.push([x, y])
        break
      case 'm':
        x += take()
        y += take()
        startX = x
        startY = y
        points.push([x, y])
        break
      case 'L':
        x = take()
        y = take()
        points.push([x, y])
        break
      case 'l':
        x += take()
        y += take()
        points.push([x, y])
        break
      case 'H':
        x = take()
        points.push([x, y])
        break
      case 'h':
        x += take()
        points.push([x, y])
        break
      case 'V':
        y = take()
        points.push([x, y])
        break
      case 'v':
        y += take()
        points.push([x, y])
        break
      case 'C':
        take()
        take()
        take()
        take()
        x = take()
        y = take()
        points.push([x, y])
        break
      case 'c':
        take()
        take()
        take()
        take()
        x += take()
        y += take()
        points.push([x, y])
        break
      case 'Q':
        take()
        take()
        x = take()
        y = take()
        points.push([x, y])
        break
      case 'q':
        take()
        take()
        x += take()
        y += take()
        points.push([x, y])
        break
      case 'Z':
      case 'z':
        x = startX
        y = startY
        break
      default:
        // Unrecognized token (likely a stray number after an implicit cmd) —
        // bail out rather than risk a bad polygon.
        if (!Number.isNaN(Number(cmd))) return undefined
    }
  }
  return points.length >= 3 ? points : undefined
}

/**
 * Hiding modules cuts into the error-correction budget. A circular mask
 * inscribed in the square hides ~21% of cells; only EC level H can absorb
 * that. Callers may auto-bump EC when a shape mask is configured.
 */
export function recommendedECForShape(mask: ShapeMask | undefined): ECLevel | undefined {
  if (!mask) return undefined
  if (typeof mask === 'string') {
    switch (mask) {
      case 'circle':
      case 'heart':
      case 'triangle':
      case 'star':
        return 'H'
      case 'rounded-square':
        return 'Q'
    }
  }
  // Custom path — assume worst case.
  return 'H'
}
