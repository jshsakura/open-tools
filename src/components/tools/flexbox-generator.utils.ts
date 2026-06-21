export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse"
export type JustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly"
export type AlignItems = "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
export type AlignContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "stretch"
  | "space-between"
  | "space-around"
export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse"

export interface FlexOptions {
  flexDirection: FlexDirection
  justifyContent: JustifyContent
  alignItems: AlignItems
  alignContent: AlignContent
  flexWrap: FlexWrap
  gap: number
}

export const FLEX_DIRECTIONS: FlexDirection[] = ["row", "row-reverse", "column", "column-reverse"]
export const JUSTIFY_CONTENTS: JustifyContent[] = [
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "space-evenly",
]
export const ALIGN_ITEMS: AlignItems[] = ["flex-start", "flex-end", "center", "stretch", "baseline"]
export const ALIGN_CONTENTS: AlignContent[] = [
  "flex-start",
  "flex-end",
  "center",
  "stretch",
  "space-between",
  "space-around",
]
export const FLEX_WRAPS: FlexWrap[] = ["nowrap", "wrap", "wrap-reverse"]

export const DEFAULT_FLEX_OPTIONS: FlexOptions = {
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "stretch",
  alignContent: "stretch",
  flexWrap: "nowrap",
  gap: 16,
}

// Builds the container CSS rule for the chosen flex options.
export function buildFlexCss(opts: FlexOptions): string {
  return `.flex-container {
  display: flex;
  flex-direction: ${opts.flexDirection};
  justify-content: ${opts.justifyContent};
  align-items: ${opts.alignItems};
  align-content: ${opts.alignContent};
  flex-wrap: ${opts.flexWrap};
  gap: ${opts.gap}px;
}`
}

const DIRECTION_TW: Record<FlexDirection, string> = {
  row: "flex-row",
  "row-reverse": "flex-row-reverse",
  column: "flex-col",
  "column-reverse": "flex-col-reverse",
}

const JUSTIFY_TW: Record<JustifyContent, string> = {
  "flex-start": "justify-start",
  "flex-end": "justify-end",
  center: "justify-center",
  "space-between": "justify-between",
  "space-around": "justify-around",
  "space-evenly": "justify-evenly",
}

const ALIGN_ITEMS_TW: Record<AlignItems, string> = {
  "flex-start": "items-start",
  "flex-end": "items-end",
  center: "items-center",
  stretch: "items-stretch",
  baseline: "items-baseline",
}

const ALIGN_CONTENT_TW: Record<AlignContent, string> = {
  "flex-start": "content-start",
  "flex-end": "content-end",
  center: "content-center",
  stretch: "content-stretch",
  "space-between": "content-between",
  "space-around": "content-around",
}

const WRAP_TW: Record<FlexWrap, string> = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
  "wrap-reverse": "flex-wrap-reverse",
}

// Maps a px gap to a Tailwind gap utility. 1 step = 0.25rem = 4px; falls back
// to an arbitrary value when the gap is not a multiple of 4.
function gapToTailwind(gap: number): string {
  if (gap === 0) return "gap-0"
  if (gap % 4 === 0) return `gap-${gap / 4}`
  return `gap-[${gap}px]`
}

// Builds the equivalent Tailwind class list for the chosen flex options.
export function buildFlexTailwind(opts: FlexOptions): string {
  return [
    "flex",
    DIRECTION_TW[opts.flexDirection],
    WRAP_TW[opts.flexWrap],
    JUSTIFY_TW[opts.justifyContent],
    ALIGN_ITEMS_TW[opts.alignItems],
    ALIGN_CONTENT_TW[opts.alignContent],
    gapToTailwind(opts.gap),
  ].join(" ")
}
