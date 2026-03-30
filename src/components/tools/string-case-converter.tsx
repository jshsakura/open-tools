"use client"

import { useState, useMemo } from "react"
import { Copy, CheckCircle2, CaseSensitive, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Tokenizer: splits any input into lowercase word tokens
// Handles camelCase, PascalCase, snake_case, kebab-case, dot.case, spaces, etc.
// ---------------------------------------------------------------------------
function tokenize(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s\-_.]+/)
    .map((w) => w.toLowerCase())
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// Case converters
// ---------------------------------------------------------------------------
function toCamelCase(tokens: string[]): string {
  return tokens
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("")
}

function toPascalCase(tokens: string[]): string {
  return tokens.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")
}

function toSnakeCase(tokens: string[]): string {
  return tokens.join("_")
}

function toScreamingSnakeCase(tokens: string[]): string {
  return tokens.join("_").toUpperCase()
}

function toKebabCase(tokens: string[]): string {
  return tokens.join("-")
}

function toTrainCase(tokens: string[]): string {
  return tokens.join("-").toUpperCase()
}

function toFlatCase(tokens: string[]): string {
  return tokens.join("")
}

function toUpperCase(tokens: string[]): string {
  return tokens.join(" ").toUpperCase()
}

function toLowerCase(tokens: string[]): string {
  return tokens.join(" ")
}

function toTitleCase(tokens: string[]): string {
  return tokens.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

function toSentenceCase(tokens: string[]): string {
  const joined = tokens.join(" ")
  return joined.charAt(0).toUpperCase() + joined.slice(1)
}

function toDotCase(tokens: string[]): string {
  return tokens.join(".")
}

// ---------------------------------------------------------------------------
// Case definitions
// ---------------------------------------------------------------------------
interface CaseFormat {
  label: string
  example: string
  convert: (tokens: string[]) => string
  fontMono?: boolean
}

const CASE_FORMATS: CaseFormat[] = [
  {
    label: "camelCase",
    example: "helloWorld",
    convert: toCamelCase,
    fontMono: true,
  },
  {
    label: "PascalCase",
    example: "HelloWorld",
    convert: toPascalCase,
    fontMono: true,
  },
  {
    label: "snake_case",
    example: "hello_world",
    convert: toSnakeCase,
    fontMono: true,
  },
  {
    label: "SCREAMING_SNAKE_CASE",
    example: "HELLO_WORLD",
    convert: toScreamingSnakeCase,
    fontMono: true,
  },
  {
    label: "kebab-case",
    example: "hello-world",
    convert: toKebabCase,
    fontMono: true,
  },
  {
    label: "TRAIN-CASE",
    example: "HELLO-WORLD",
    convert: toTrainCase,
    fontMono: true,
  },
  {
    label: "flatcase",
    example: "helloworld",
    convert: toFlatCase,
    fontMono: true,
  },
  {
    label: "UPPERCASE",
    example: "HELLO WORLD",
    convert: toUpperCase,
    fontMono: false,
  },
  {
    label: "lowercase",
    example: "hello world",
    convert: toLowerCase,
    fontMono: false,
  },
  {
    label: "Title Case",
    example: "Hello World",
    convert: toTitleCase,
    fontMono: false,
  },
  {
    label: "Sentence case",
    example: "Hello world",
    convert: toSentenceCase,
    fontMono: false,
  },
  {
    label: "dot.case",
    example: "hello.world",
    convert: toDotCase,
    fontMono: true,
  },
]

// ---------------------------------------------------------------------------
// Copy button with 2-second checkmark feedback
// ---------------------------------------------------------------------------
function CopyButton({ text, disabled }: { text: string; disabled: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text || disabled) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7 shrink-0 transition-colors",
        copied && "text-green-500",
      )}
      onClick={handleCopy}
      disabled={disabled}
      title="Copy"
    >
      {copied ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function StringCaseConverter() {
  const [input, setInput] = useState("")

  const tokens = useMemo(() => tokenize(input), [input])
  const hasContent = input.trim() !== "" && tokens.length > 0

  const results = useMemo(() => {
    if (!hasContent) return CASE_FORMATS.map(() => "")
    return CASE_FORMATS.map((fmt) => fmt.convert(tokens))
  }, [tokens, hasContent])

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Input */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <CaseSensitive className="w-4 h-4 text-indigo-500" />
            Input Text
          </Label>
          {input && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInput("")}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <Textarea
          placeholder="Type or paste any text — camelCase, snake_case, plain sentence…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[120px] font-mono text-sm bg-background/50 focus:bg-background transition-all resize-y"
          autoFocus
        />
        {hasContent && (
          <p className="mt-2 px-1 text-xs text-muted-foreground">
            {tokens.length} token{tokens.length !== 1 ? "s" : ""} detected:{" "}
            <span className="font-mono text-foreground/70">
              {tokens.join(", ")}
            </span>
          </p>
        )}
      </GlassCard>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CASE_FORMATS.map((fmt, i) => {
          const result = results[i]
          const display = hasContent ? result : fmt.example
          const isEmpty = !hasContent

          return (
            <GlassCard
              key={fmt.label}
              className={cn(
                "p-4 flex flex-col gap-2 transition-all duration-200 group",
                isEmpty && "opacity-60",
              )}
            >
              {/* Label row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  {fmt.label}
                </span>
                <CopyButton text={result} disabled={!hasContent} />
              </div>

              {/* Value */}
              <p
                className={cn(
                  "text-sm break-all leading-relaxed",
                  fmt.fontMono ? "font-mono" : "font-medium",
                  isEmpty
                    ? "text-muted-foreground/50 italic"
                    : "text-foreground",
                )}
              >
                {display || (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </p>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
