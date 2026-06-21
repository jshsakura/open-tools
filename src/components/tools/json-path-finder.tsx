"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  Braces,
  Search,
  Copy,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Hash,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { queryJsonPath, type JsonPathMatch } from "./json-path-finder.utils"

const SAMPLE_JSON = `{
  "store": {
    "name": "Corner Books",
    "book": [
      { "title": "Dune", "author": "Herbert", "price": 12 },
      { "title": "1984", "author": "Orwell", "price": 9 },
      { "title": "Sapiens", "author": "Harari", "price": 20 }
    ],
    "bicycle": { "color": "red", "price": 199 }
  }
}`

const EXAMPLE_QUERIES = [
  "$.store.name",
  "$.store.book[*].title",
  "$.store.book[0]",
  "$.store.book[-1].author",
  "$..price",
  "$.store.book[1:3]",
] as const

type EvalState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; matches: JsonPathMatch[] }

function prettyValue(value: unknown): string {
  if (value === undefined) return "undefined"
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function JsonPathFinder() {
  const t = useTranslations("JsonPathFinder")
  const [jsonText, setJsonText] = useState(SAMPLE_JSON)
  const [query, setQuery] = useState("$.store.book[*].title")
  const [copied, setCopied] = useState(false)

  const result = useMemo<EvalState>(() => {
    if (!jsonText.trim() || !query.trim()) return { status: "idle" }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonText)
    } catch (e) {
      return {
        status: "error",
        message: `${t("invalidJson")}: ${e instanceof Error ? e.message : String(e)}`,
      }
    }

    try {
      const matches = queryJsonPath(parsed, query)
      return { status: "ok", matches }
    } catch (e) {
      return {
        status: "error",
        message: `${t("invalidQuery")}: ${e instanceof Error ? e.message : String(e)}`,
      }
    }
  }, [jsonText, query, t])

  const resultsText = useMemo(() => {
    if (result.status !== "ok") return ""
    return result.matches
      .map((m) => `${m.path} = ${prettyValue(m.value)}`)
      .join("\n")
  }, [result])

  const handleCopy = () => {
    if (!resultsText) return
    navigator.clipboard.writeText(resultsText)
    setCopied(true)
    toast.success(t("copied"))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setJsonText("")
    setQuery("")
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <Braces className="h-7 w-7 text-primary" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── JSON input ──────────────────────────────────────────── */}
        <GlassCard className="p-6 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold flex items-center gap-2">
              <Braces className="h-4 w-4 text-primary" />
              {t("jsonLabel")}
            </Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="text-muted-foreground/50 hover:text-rose-500"
              aria-label={t("clear")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={t("jsonPlaceholder")}
            className="flex-1 min-h-[320px] font-mono text-[13px] bg-background/50"
          />
        </GlassCard>

        {/* ── Query + results ─────────────────────────────────────── */}
        <GlassCard className="p-6 space-y-4 flex flex-col">
          <div className="space-y-2">
            <Label className="text-sm font-bold flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              {t("queryLabel")}
            </Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="$.store.book[*].title"
              className="h-11 font-mono text-sm"
              spellCheck={false}
            />
          </div>

          {/* Example queries */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t("examplesLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuery(q)}
                  className="rounded-lg border border-border/50 bg-secondary/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {result.status === "error" && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="break-all font-mono text-[11px] leading-relaxed opacity-90">
                {result.message}
              </p>
            </div>
          )}

          {/* Results header */}
          {result.status === "ok" && (
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                <Hash className="h-3 w-3" />
                {t("matchCount", { count: result.matches.length })}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 gap-2 rounded-xl font-bold"
                disabled={result.matches.length === 0}
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? t("copied") : t("copy")}
              </Button>
            </div>
          )}

          {/* Results list */}
          <div className="flex-1 space-y-2 overflow-auto rounded-xl border border-border/40 bg-background/40 p-3 min-h-[200px]">
            {result.status === "ok" && result.matches.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("noMatch")}
              </p>
            )}
            {result.status === "idle" && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("idle")}
              </p>
            )}
            {result.status === "ok" &&
              result.matches.map((m, idx) => (
                <div
                  key={`${m.path}-${idx}`}
                  className="rounded-lg border border-border/30 bg-secondary/20 p-3 space-y-1.5"
                >
                  <p className="font-mono text-[11px] font-bold text-primary break-all">
                    {m.path}
                  </p>
                  <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] text-foreground/90">
                    {prettyValue(m.value)}
                  </pre>
                </div>
              ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
