export type PresetId =
  | "fade"
  | "slide-in"
  | "bounce"
  | "pulse"
  | "spin"
  | "shake"
  | "zoom"

export type TimingFunction =
  | "ease"
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "cubic-bezier(0.68, -0.55, 0.27, 1.55)"

export type Direction =
  | "normal"
  | "reverse"
  | "alternate"
  | "alternate-reverse"

export const PRESETS: ReadonlyArray<PresetId> = [
  "fade",
  "slide-in",
  "bounce",
  "pulse",
  "spin",
  "shake",
  "zoom",
]

export const TIMING_FUNCTIONS: ReadonlyArray<TimingFunction> = [
  "ease",
  "linear",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
]

export const DIRECTIONS: ReadonlyArray<Direction> = [
  "normal",
  "reverse",
  "alternate",
  "alternate-reverse",
]

/**
 * Map of preset id -> the body of its @keyframes (the part inside the braces).
 * The animation name is derived from the preset id (e.g. "slide-in" -> "slideIn").
 */
export const KEYFRAMES: Readonly<Record<PresetId, string>> = {
  fade: `  from { opacity: 0; }
  to { opacity: 1; }`,
  "slide-in": `  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }`,
  bounce: `  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }`,
  pulse: `  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }`,
  spin: `  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }`,
  shake: `  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-10px); }
  40%, 80% { transform: translateX(10px); }`,
  zoom: `  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }`,
}

export interface AnimationOptions {
  preset: PresetId
  duration: number // seconds
  delay: number // seconds
  timingFunction: TimingFunction
  iterationCount: number // ignored when infinite is true
  infinite: boolean
  direction: Direction
}

export const DEFAULT_OPTIONS: AnimationOptions = {
  preset: "fade",
  duration: 1,
  delay: 0,
  timingFunction: "ease",
  iterationCount: 1,
  infinite: false,
  direction: "normal",
}

/**
 * Convert a preset id ("slide-in") to a valid CSS animation name ("slideIn").
 */
export function presetToAnimationName(preset: PresetId): string {
  return preset.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

export interface AnimationCss {
  /** The full @keyframes block for the chosen preset. */
  keyframes: string
  /** The `animation:` shorthand declaration (single line). */
  shorthand: string
  /** keyframes + shorthand combined, ready to paste. */
  full: string
}

function resolveIterations(opts: AnimationOptions): string {
  if (opts.infinite) return "infinite"
  return String(Math.max(1, Math.round(opts.iterationCount)))
}

/**
 * Pure builder: given animation options, return the @keyframes block,
 * the animation shorthand, and a combined full snippet.
 */
export function buildAnimationCss(opts: AnimationOptions): AnimationCss {
  const name = presetToAnimationName(opts.preset)
  const body = KEYFRAMES[opts.preset]
  const keyframes = `@keyframes ${name} {\n${body}\n}`

  const iterations = resolveIterations(opts)
  const shorthand =
    `animation: ${name} ${opts.duration}s ${opts.timingFunction} ` +
    `${opts.delay}s ${iterations} ${opts.direction};`

  const full = `${keyframes}\n\n.element {\n  ${shorthand}\n}`

  return { keyframes, shorthand, full }
}
