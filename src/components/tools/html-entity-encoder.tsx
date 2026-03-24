"use client"

import { useState, useCallback } from "react"
import { Copy, CheckCircle2, Code2, ArrowRightLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// ─── Encode / Decode Logic ────────────────────────────────────────────────────

const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": "\u00a0",
  "&copy;": "©",
  "&reg;": "®",
  "&trade;": "™",
  "&euro;": "€",
  "&pound;": "£",
  "&yen;": "¥",
  "&cent;": "¢",
  "&mdash;": "—",
  "&ndash;": "–",
  "&lsquo;": "\u2018",
  "&rsquo;": "\u2019",
  "&ldquo;": "\u201c",
  "&rdquo;": "\u201d",
  "&laquo;": "«",
  "&raquo;": "»",
  "&hellip;": "…",
  "&bull;": "•",
  "&middot;": "·",
  "&times;": "×",
  "&divide;": "÷",
  "&plusmn;": "±",
  "&deg;": "°",
  "&micro;": "µ",
  "&para;": "¶",
  "&sect;": "§",
  "&dagger;": "†",
  "&Dagger;": "‡",
  "&permil;": "‰",
  "&prime;": "′",
  "&Prime;": "″",
  "&larr;": "←",
  "&rarr;": "→",
  "&uarr;": "↑",
  "&darr;": "↓",
  "&harr;": "↔",
  "&infin;": "∞",
  "&asymp;": "≈",
  "&ne;": "≠",
  "&le;": "≤",
  "&ge;": "≥",
  "&sum;": "∑",
  "&prod;": "∏",
  "&radic;": "√",
  "&int;": "∫",
  "&alpha;": "α",
  "&beta;": "β",
  "&gamma;": "γ",
  "&delta;": "δ",
  "&theta;": "θ",
  "&lambda;": "λ",
  "&mu;": "μ",
  "&pi;": "π",
  "&sigma;": "σ",
  "&omega;": "ω",
  "&Omega;": "Ω",
}

function encodeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\u00a0/g, "&nbsp;")
    .replace(/©/g, "&copy;")
    .replace(/®/g, "&reg;")
    .replace(/™/g, "&trade;")
    .replace(/€/g, "&euro;")
    .replace(/£/g, "&pound;")
    .replace(/¥/g, "&yen;")
    .replace(/¢/g, "&cent;")
    .replace(/—/g, "&mdash;")
    .replace(/–/g, "&ndash;")
    .replace(/\u2018/g, "&lsquo;")
    .replace(/\u2019/g, "&rsquo;")
    .replace(/\u201c/g, "&ldquo;")
    .replace(/\u201d/g, "&rdquo;")
    .replace(/«/g, "&laquo;")
    .replace(/»/g, "&raquo;")
    .replace(/…/g, "&hellip;")
    .replace(/•/g, "&bull;")
    .replace(/·/g, "&middot;")
    .replace(/×/g, "&times;")
    .replace(/÷/g, "&divide;")
    .replace(/±/g, "&plusmn;")
    .replace(/°/g, "&deg;")
    .replace(/µ/g, "&micro;")
    .replace(/¶/g, "&para;")
    .replace(/§/g, "&sect;")
    .replace(
      /[^\x00-\x7E\u00a0£¥©®°µ¶·º»÷±¢€™—–\u2018\u2019\u201c\u201d«»…•×]/g,
      (ch) => `&#${ch.codePointAt(0)};`
    )
}

function decodeHtmlEntities(text: string): string {
  // Named entities (longest-match via the table)
  let result = text.replace(
    /&[a-zA-Z][a-zA-Z0-9]*;/g,
    (entity) => NAMED_ENTITIES[entity] ?? entity
  )
  // Decimal numeric entities &#NNN;
  result = result.replace(/&#(\d+);/g, (_, num) =>
    String.fromCodePoint(Number(num))
  )
  // Hexadecimal numeric entities &#xHHH;
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  )
  return result
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PanelProps {
  inputLabel: string
  outputLabel: string
  inputPlaceholder: string
  outputPlaceholder: string
  input: string
  output: string
  onInputChange: (v: string) => void
  onClear: () => void
}

function ConvertPanel({
  inputLabel,
  outputLabel,
  inputPlaceholder,
  outputPlaceholder,
  input,
  output,
  onInputChange,
  onClear,
}: PanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [output])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Input */}
      <Card className="flex flex-col border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-muted-foreground" />
              {inputLabel}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={!input}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            spellCheck={false}
            placeholder={inputPlaceholder}
            className={cn(
              "w-full h-full resize-none bg-transparent p-4",
              "font-mono text-sm leading-relaxed",
              "focus:outline-none placeholder:text-muted-foreground/40",
              "min-h-[360px]"
            )}
          />
        </CardContent>
      </Card>

      {/* Output */}
      <Card className="flex flex-col border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
              {outputLabel}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!output}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <textarea
            value={output}
            readOnly
            spellCheck={false}
            placeholder={outputPlaceholder}
            className={cn(
              "w-full h-full resize-none bg-transparent p-4",
              "font-mono text-sm leading-relaxed",
              "focus:outline-none placeholder:text-muted-foreground/40",
              "min-h-[360px]",
              "cursor-default select-all"
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function HtmlEntityEncoder() {
  const [encodeInput, setEncodeInput] = useState("")
  const [decodeInput, setDecodeInput] = useState("")

  const encodeOutput = encodeInput ? encodeHtmlEntities(encodeInput) : ""
  const decodeOutput = decodeInput ? decodeHtmlEntities(decodeInput) : ""

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Tabs defaultValue="encode" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/50 p-1 rounded-xl max-w-xs">
          <TabsTrigger value="encode" className="rounded-lg gap-1.5 text-sm">
            <Code2 className="w-4 h-4" />
            Encode
          </TabsTrigger>
          <TabsTrigger value="decode" className="rounded-lg gap-1.5 text-sm">
            <ArrowRightLeft className="w-4 h-4" />
            Decode
          </TabsTrigger>
        </TabsList>

        {/* ── Encode tab ──────────────────────────────────────────────────── */}
        <TabsContent value="encode" className="mt-4">
          <ConvertPanel
            inputLabel="Plain Text"
            outputLabel="HTML Entities"
            inputPlaceholder={'Type or paste plain text here…\ne.g. <script>alert("XSS")</script>'}
            outputPlaceholder="Encoded HTML entities will appear here…"
            input={encodeInput}
            output={encodeOutput}
            onInputChange={setEncodeInput}
            onClear={() => setEncodeInput("")}
          />

          {/* Info chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["&", "&amp;"],
              ["<", "&lt;"],
              [">", "&gt;"],
              ['"', "&quot;"],
              ["'", "&#39;"],
              ["©", "&copy;"],
              ["™", "&trade;"],
              ["€", "&euro;"],
              ["…", "&hellip;"],
            ].map(([raw, entity]) => (
              <span
                key={entity}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 border border-border/40 text-xs font-mono text-muted-foreground"
              >
                <span className="text-foreground/80">{raw}</span>
                <span className="text-muted-foreground/50">→</span>
                <span className="text-rose-500/90">{entity}</span>
              </span>
            ))}
          </div>
        </TabsContent>

        {/* ── Decode tab ──────────────────────────────────────────────────── */}
        <TabsContent value="decode" className="mt-4">
          <ConvertPanel
            inputLabel="HTML Entities"
            outputLabel="Plain Text"
            inputPlaceholder={"Paste HTML entities here…\ne.g. &lt;p&gt;Hello &amp; world&lt;/p&gt;"}
            outputPlaceholder="Decoded plain text will appear here…"
            input={decodeInput}
            output={decodeOutput}
            onInputChange={setDecodeInput}
            onClear={() => setDecodeInput("")}
          />

          {/* Info chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["&amp;", "&"],
              ["&lt;", "<"],
              ["&gt;", ">"],
              ["&quot;", '"'],
              ["&#39;", "'"],
              ["&#38;", "&"],
              ["&#x26;", "&"],
              ["&copy;", "©"],
              ["&trade;", "™"],
            ].map(([entity, raw]) => (
              <span
                key={entity}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 border border-border/40 text-xs font-mono text-muted-foreground"
              >
                <span className="text-rose-500/90">{entity}</span>
                <span className="text-muted-foreground/50">→</span>
                <span className="text-foreground/80">{raw}</span>
              </span>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
