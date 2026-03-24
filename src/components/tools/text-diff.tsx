"use client"

import { useState, useMemo } from "react"
import { diffLines, diffWords, type Change } from "diff"
import {
  Copy,
  CheckCircle2,
  GitCompareArrows,
  Trash2,
  BarChart2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

type DiffMode = "lines" | "words"

export function TextDiff() {
  const [original, setOriginal] = useState("")
  const [modified, setModified] = useState("")
  const [mode, setMode] = useState<DiffMode>("lines")
  const [copied, setCopied] = useState(false)

  const diff: Change[] = useMemo(() => {
    if (!original && !modified) return []
    return mode === "lines"
      ? diffLines(original, modified)
      : diffWords(original, modified)
  }, [original, modified, mode])

  const stats = useMemo(() => {
    return diff.reduce(
      (acc, part) => {
        const count = part.count ?? 1
        if (part.added) acc.added += count
        else if (part.removed) acc.removed += count
        else acc.unchanged += count
        return acc
      },
      { added: 0, removed: 0, unchanged: 0 },
    )
  }, [diff])

  const diffText = useMemo(() => {
    return diff
      .map((part) => {
        const prefix = part.added ? "+ " : part.removed ? "- " : "  "
        return part.value
          .split("\n")
          .filter((l, i, arr) => i < arr.length - 1 || l !== "")
          .map((line) => prefix + line)
          .join("\n")
      })
      .join("\n")
  }, [diff])

  const copyDiff = async () => {
    if (!diffText) return
    await navigator.clipboard.writeText(diffText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasContent = original !== "" || modified !== ""
  const label = mode === "lines" ? "lines" : "words"

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-1">
          Mode:
        </span>
        <Button
          variant={mode === "lines" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("lines")}
        >
          Line Diff
        </Button>
        <Button
          variant={mode === "words" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("words")}
        >
          Word Diff
        </Button>
      </div>

      {/* Input Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Label className="text-sm font-semibold text-muted-foreground">
              Original
            </Label>
            {original && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOriginal("")}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <Textarea
            placeholder="Paste original text here..."
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="min-h-[240px] font-mono text-sm bg-background/50 focus:bg-background transition-all resize-y"
          />
        </div>

        {/* Modified */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Label className="text-sm font-semibold text-muted-foreground">
              Modified
            </Label>
            {modified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModified("")}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <Textarea
            placeholder="Paste modified text here..."
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="min-h-[240px] font-mono text-sm bg-background/50 focus:bg-background transition-all resize-y"
          />
        </div>
      </div>

      {/* Stats Bar */}
      {hasContent && (
        <div className="flex flex-wrap items-center gap-3">
          <BarChart2 className="w-4 h-4 text-muted-foreground" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            +{stats.added} {label} added
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            -{stats.removed} {label} removed
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            {stats.unchanged} {label} unchanged
          </span>
        </div>
      )}

      {/* Diff Result */}
      <GlassCard className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold">Diff Result</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyDiff}
            disabled={!hasContent || diff.length === 0}
            className="h-7 px-2 text-xs gap-1.5"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy Diff"}
          </Button>
        </div>

        {/* Body */}
        <div className="min-h-[160px]">
          {!hasContent ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Enter text in both fields to see the diff
            </div>
          ) : diff.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              No differences found — the texts are identical
            </div>
          ) : mode === "lines" ? (
            /* Line-by-line view */
            <div className="overflow-auto max-h-[480px] font-mono text-sm">
              {diff.map((part, i) => {
                const lines = part.value
                  .split("\n")
                  .filter((l, idx, arr) => idx < arr.length - 1 || l !== "")
                return lines.map((line, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={cn(
                      "flex items-start px-4 py-0.5 whitespace-pre leading-6",
                      part.added &&
                        "bg-green-500/10 text-green-700 dark:text-green-400",
                      part.removed &&
                        "bg-red-500/10 text-red-700 dark:text-red-400",
                      !part.added &&
                        !part.removed &&
                        "text-foreground/75",
                    )}
                  >
                    <span className="select-none w-5 shrink-0 opacity-60 font-bold">
                      {part.added ? "+" : part.removed ? "-" : " "}
                    </span>
                    <span>{line}</span>
                  </div>
                ))
              })}
            </div>
          ) : (
            /* Word-level inline view */
            <div className="overflow-auto max-h-[480px] p-4">
              <p className="text-sm whitespace-pre-wrap leading-8 font-mono">
                {diff.map((part, i) => (
                  <span
                    key={i}
                    className={cn(
                      "rounded px-0.5",
                      part.added &&
                        "bg-green-500/20 text-green-700 dark:text-green-400",
                      part.removed &&
                        "bg-red-500/20 text-red-700 dark:text-red-400 line-through",
                    )}
                  >
                    {part.value}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
