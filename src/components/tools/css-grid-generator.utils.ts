export type TrackUnit = "fr" | "px" | "auto" | "minmax"

export interface Track {
  unit: TrackUnit
  value: number
}

export const DEFAULT_TRACK: Track = { unit: "fr", value: 1 }

// Renders a single track to its CSS grid-template value.
// minmax uses the numeric value as the px minimum and 1fr as the max.
export function trackToCss(track: Track): string {
  switch (track.unit) {
    case "auto":
      return "auto"
    case "px":
      return `${track.value}px`
    case "minmax":
      return `minmax(${track.value}px, 1fr)`
    case "fr":
    default:
      return `${track.value}fr`
  }
}

// Joins tracks into a grid-template-columns/rows string.
export function tracksToTemplate(tracks: Track[]): string {
  if (tracks.length === 0) return "none"
  return tracks.map(trackToCss).join(" ")
}

export interface GridConfig {
  columns: Track[]
  rows: Track[]
  gap: number
}

export function buildGridCss(config: GridConfig): string {
  return `.grid-container {
  display: grid;
  grid-template-columns: ${tracksToTemplate(config.columns)};
  grid-template-rows: ${tracksToTemplate(config.rows)};
  gap: ${config.gap}px;
}`
}

// Maps a Tailwind spacing scale step to a gap utility. Falls back to an
// arbitrary value when the px gap is not a multiple of 4 (1 step = 0.25rem = 4px).
function gapToTailwind(gap: number): string {
  if (gap === 0) return "gap-0"
  if (gap % 4 === 0) return `gap-${gap / 4}`
  return `gap-[${gap}px]`
}

// Produces a Tailwind class for a track list. Uses grid-cols-N / grid-rows-N
// when every track is an equal 1fr; otherwise emits an arbitrary template value.
function tracksToTailwind(tracks: Track[], axis: "cols" | "rows"): string {
  const allEqualFr =
    tracks.length > 0 && tracks.every((t) => t.unit === "fr" && t.value === 1)
  if (allEqualFr) return `grid-${axis}-${tracks.length}`
  const template = tracksToTemplate(tracks).replace(/ /g, "_")
  const prop = axis === "cols" ? "grid-cols" : "grid-rows"
  return `${prop}-[${template}]`
}

export function buildGridTailwind(config: GridConfig): string {
  return [
    "grid",
    tracksToTailwind(config.columns, "cols"),
    tracksToTailwind(config.rows, "rows"),
    gapToTailwind(config.gap),
  ].join(" ")
}
