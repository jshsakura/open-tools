// Pure geometry helpers for the SVG Shapes Generator.
// All functions are deterministic for a given seed so they can be unit-tested.

export type ShapeType = "blob" | "waves" | "layeredWaves" | "polygon" | "star" | "corner"

export const SHAPE_TYPES: ShapeType[] = [
  "blob",
  "waves",
  "layeredWaves",
  "polygon",
  "star",
  "corner",
]

export const CANVAS_SIZE = 200

// A tiny deterministic pseudo-random generator (mulberry32) so randomize is
// reproducible from a single numeric seed — keeps shape output testable.
export function createRng(seed: number): () => number {
  let a = Math.floor(seed * 0xffffffff) >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

// Smooth closed blob built from N points around a circle with seeded radius wobble.
export function generateBlobPath(complexity: number, seed: number, size = CANVAS_SIZE): string {
  const rng = createRng(seed)
  const count = 6
  const points: Array<{ x: number; y: number }> = []
  const step = (Math.PI * 2) / count
  for (let i = 0; i < count; i++) {
    const angle = i * step
    const wobble = Math.sin(angle * complexity + seed * 10) * size * 0.1 + (rng() - 0.5) * size * 0.06
    const r = size * 0.4 + wobble
    points.push({
      x: round(size / 2 + Math.cos(angle) * r),
      y: round(size / 2 + Math.sin(angle) * r),
    })
  }

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length; i++) {
    const curr = points[i]
    const next = points[(i + 1) % points.length]
    const xc = round((curr.x + next.x) / 2)
    const yc = round((curr.y + next.y) / 2)
    d += ` Q ${curr.x} ${curr.y}, ${xc} ${yc}`
  }
  return `${d} Z`
}

// A single wave band filling the bottom portion of the canvas.
export function generateWavePath(
  complexity: number,
  seed: number,
  baseline: number,
  size = CANVAS_SIZE,
): string {
  const segments = Math.max(2, Math.round(complexity))
  const segWidth = size / segments
  const amp = size * 0.12 + (seed % 1) * size * 0.05
  let d = `M 0 ${round(baseline)}`
  for (let i = 0; i < segments; i++) {
    const x1 = round(i * segWidth + segWidth / 2)
    const x2 = round((i + 1) * segWidth)
    const dir = i % 2 === 0 ? -1 : 1
    const y1 = round(baseline + dir * amp)
    d += ` Q ${x1} ${y1}, ${x2} ${round(baseline)}`
  }
  d += ` L ${size} ${size} L 0 ${size} Z`
  return d
}

export function generateLayeredWavePaths(
  complexity: number,
  seed: number,
  size = CANVAS_SIZE,
): string[] {
  const layers = 3
  const paths: string[] = []
  for (let i = 0; i < layers; i++) {
    const baseline = size * (0.45 + i * 0.18)
    paths.push(generateWavePath(complexity, seed + i * 0.137, baseline, size))
  }
  return paths
}

// Regular polygon with `sides` vertices.
export function generatePolygonPath(sides: number, size = CANVAS_SIZE): string {
  const count = Math.max(3, Math.round(sides))
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.42
  const points: string[] = []
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / count
    points.push(`${round(cx + Math.cos(angle) * r)} ${round(cy + Math.sin(angle) * r)}`)
  }
  return `M ${points.join(" L ")} Z`
}

// Star with `points` outer spikes (alternates outer/inner radius).
export function generateStarPath(points: number, size = CANVAS_SIZE): string {
  const count = Math.max(3, Math.round(points))
  const cx = size / 2
  const cy = size / 2
  const outer = size * 0.45
  const inner = outer * 0.45
  const verts: string[] = []
  for (let i = 0; i < count * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const angle = -Math.PI / 2 + (i * Math.PI) / count
    verts.push(`${round(cx + Math.cos(angle) * r)} ${round(cy + Math.sin(angle) * r)}`)
  }
  return `M ${verts.join(" L ")} Z`
}

// A soft rounded "corner" decoration anchored at the top-left.
export function generateCornerPath(complexity: number, seed: number, size = CANVAS_SIZE): string {
  const rng = createRng(seed)
  const reach = size * (0.55 + rng() * 0.25)
  const dip = size * (0.1 + (complexity / 20) * size * 0)
  const ctrl = round(reach * 0.6 + dip)
  return `M 0 0 L ${size} 0 L ${round(reach)} 0 Q ${ctrl} ${round(size * 0.5)}, 0 ${round(reach)} Z`
}

export interface ShapeResult {
  // One or more path strings; layered waves return multiple.
  paths: string[]
}

export function generateShape(
  type: ShapeType,
  complexity: number,
  seed: number,
  size = CANVAS_SIZE,
): ShapeResult {
  switch (type) {
    case "blob":
      return { paths: [generateBlobPath(complexity, seed, size)] }
    case "waves":
      return { paths: [generateWavePath(complexity, seed, size * 0.5, size)] }
    case "layeredWaves":
      return { paths: generateLayeredWavePaths(complexity, seed, size) }
    case "polygon":
      return { paths: [generatePolygonPath(complexity + 2, size)] }
    case "star":
      return { paths: [generateStarPath(complexity + 2, size)] }
    case "corner":
      return { paths: [generateCornerPath(complexity, seed, size)] }
    default:
      return { paths: [generateBlobPath(complexity, seed, size)] }
  }
}
