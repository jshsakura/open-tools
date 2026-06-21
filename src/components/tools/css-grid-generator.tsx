"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Clipboard, Plus, Minus } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  buildGridCss,
  buildGridTailwind,
  tracksToTemplate,
  DEFAULT_TRACK,
  type Track,
  type TrackUnit,
} from "./css-grid-generator.utils"

const UNITS: TrackUnit[] = ["fr", "px", "auto", "minmax"]
const MAX_TRACKS = 8
const MIN_TRACKS = 1

type Mode = "css" | "tailwind"

function updateTrackAt(tracks: Track[], index: number, patch: Partial<Track>): Track[] {
  return tracks.map((track, i) => (i === index ? { ...track, ...patch } : track))
}

export function CssGridGenerator() {
  const t = useTranslations("CssGridGenerator.ui")
  const [columns, setColumns] = useState<Track[]>([{ ...DEFAULT_TRACK }, { ...DEFAULT_TRACK }, { ...DEFAULT_TRACK }])
  const [rows, setRows] = useState<Track[]>([{ ...DEFAULT_TRACK }, { ...DEFAULT_TRACK }, { ...DEFAULT_TRACK }])
  const [gap, setGap] = useState(16)
  const [mode, setMode] = useState<Mode>("css")

  const config = useMemo(() => ({ columns, rows, gap }), [columns, rows, gap])
  const cssCode = useMemo(() => buildGridCss(config), [config])
  const tailwindCode = useMemo(() => buildGridTailwind(config), [config])
  const output = mode === "css" ? cssCode : tailwindCode

  const cellCount = columns.length * rows.length

  const addTrack = (setter: typeof setColumns, list: Track[]) => {
    if (list.length >= MAX_TRACKS) return
    setter([...list, { ...DEFAULT_TRACK }])
  }
  const removeTrack = (setter: typeof setColumns, list: Track[]) => {
    if (list.length <= MIN_TRACKS) return
    setter(list.slice(0, -1))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    toast.success(t("codeExport"))
  }

  const renderTrackControls = (
    label: string,
    list: Track[],
    setter: typeof setColumns,
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground">
          {label} ({list.length})
        </label>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => removeTrack(setter, list)}>
            <Minus className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => addTrack(setter, list)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        {list.map((track, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="w-4 text-[10px] text-muted-foreground">{index + 1}</span>
            <select
              value={track.unit}
              onChange={(e) =>
                setter(updateTrackAt(list, index, { unit: e.target.value as TrackUnit }))
              }
              className="flex-1 rounded-md border border-input bg-background/50 px-2 py-1 text-xs"
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            {track.unit !== "auto" && (
              <input
                type="number"
                min={0}
                value={track.value}
                onChange={(e) =>
                  setter(updateTrackAt(list, index, { value: Number(e.target.value) }))
                }
                className="w-16 rounded-md border border-input bg-background/50 px-2 py-1 text-xs font-mono"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Card className="max-w-5xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {renderTrackControls(t("cols"), columns, setColumns)}
          {renderTrackControls(t("rows"), rows, setRows)}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("gap")}: {gap}px
            </label>
            <input
              type="range"
              min="0"
              max="40"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground block">{t("preview")}</label>
            <div
              className="rounded-lg bg-muted/20 p-2"
              style={{
                display: "grid",
                gridTemplateColumns: tracksToTemplate(columns),
                gridTemplateRows: tracksToTemplate(rows),
                gap: `${gap}px`,
                minHeight: "220px",
              }}
            >
              {Array.from({ length: cellCount }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex rounded-md border border-border/50 p-0.5">
              <Button
                variant={mode === "css" ? "default" : "ghost"}
                size="sm"
                className="h-7"
                onClick={() => setMode("css")}
              >
                CSS
              </Button>
              <Button
                variant={mode === "tailwind" ? "default" : "ghost"}
                size="sm"
                className="h-7"
                onClick={() => setMode("tailwind")}
              >
                Tailwind
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              <Clipboard className="w-3.5 h-3.5" />
              {t("codeExport")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all min-h-[200px]">
            {output}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
