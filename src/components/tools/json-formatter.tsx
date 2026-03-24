"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  FileJson,
  Minimize2,
  RefreshCcw,
  FileCode,
  Table,
  Copy,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react"

// ─── YAML Conversion (pure TypeScript, no external libs) ──────────────────────

function needsYamlQuoting(str: string): boolean {
  if (str === "") return true
  if (/^(true|false|null|yes|no|on|off|~)$/i.test(str)) return true
  if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(str)) return true
  if (/^0x[0-9a-fA-F]+$/i.test(str)) return true
  if (/^[:{}\[\],#&*!|>'"~%@`?]/.test(str)) return true
  if (/^-\s/.test(str)) return true
  if (/[:\n\r\t]/.test(str)) return true
  if (/\s$/.test(str)) return true
  return false
}

function yamlScalar(val: string): string {
  if (!needsYamlQuoting(val)) return val
  const escaped = val
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
  return `"${escaped}"`
}

function toYaml(data: unknown, indent = 0): string {
  const pad = "  ".repeat(indent)

  if (data === null || data === undefined) return "null"
  if (typeof data === "boolean") return data ? "true" : "false"
  if (typeof data === "number") {
    if (isNaN(data)) return ".nan"
    if (!isFinite(data)) return data > 0 ? ".inf" : "-.inf"
    return String(data)
  }
  if (typeof data === "string") return yamlScalar(data)

  if (Array.isArray(data)) {
    if (data.length === 0) return "[]"
    return data
      .map((item) => {
        if (Array.isArray(item)) {
          return `${pad}-\n${toYaml(item, indent + 1)}`
        }
        if (typeof item === "object" && item !== null) {
          const rendered = toYaml(item, indent + 1)
          const lines = rendered.split("\n")
          // Strip one level of indent from first line to use as `- firstKey: val`
          const firstContent = lines[0].replace(/^  /, "")
          const rest = lines.slice(1).join("\n")
          return rest
            ? `${pad}- ${firstContent}\n${rest}`
            : `${pad}- ${firstContent}`
        }
        return `${pad}- ${toYaml(item, 0)}`
      })
      .join("\n")
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>
    const keys = Object.keys(obj)
    if (keys.length === 0) return "{}"
    return keys
      .map((key) => {
        const val = obj[key]
        const safeKey = needsYamlQuoting(key) ? `"${key.replace(/"/g, '\\"')}"` : key

        if (val === null || val === undefined) {
          return `${pad}${safeKey}: null`
        }
        if (typeof val === "object") {
          if (Array.isArray(val)) {
            if (val.length === 0) return `${pad}${safeKey}: []`
            return `${pad}${safeKey}:\n${toYaml(val, indent + 1)}`
          }
          const nested = val as object
          if (Object.keys(nested).length === 0) return `${pad}${safeKey}: {}`
          return `${pad}${safeKey}:\n${toYaml(val, indent + 1)}`
        }
        return `${pad}${safeKey}: ${toYaml(val, 0)}`
      })
      .join("\n")
  }

  return String(data)
}

// ─── TypeScript Interface Generation ──────────────────────────────────────────

function toPascalCase(s: string): string {
  if (!s) return "Root"
  return s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

function getType(
  value: unknown,
  name: string,
  defs: Map<string, string>
): string {
  if (value === null) return "null"
  if (value === undefined) return "undefined"

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]"
    const types = new Set(
      value.map((item) => getType(item, name + "Item", defs))
    )
    const typeStr =
      types.size === 1
        ? [...types][0]
        : `(${[...types].join(" | ")})`
    return `${typeStr}[]`
  }

  if (typeof value === "object") {
    const interfaceName = toPascalCase(name)
    const fields = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const fieldType = getType(v, k, defs)
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)
          ? k
          : `"${k}"`
        return `  ${safeKey}: ${fieldType};`
      })
      .join("\n")
    const interfaceStr = `interface ${interfaceName} {\n${fields}\n}`
    defs.set(interfaceName, interfaceStr)
    return interfaceName
  }

  if (typeof value === "string") return "string"
  if (typeof value === "number") return "number"
  if (typeof value === "boolean") return "boolean"
  return "unknown"
}

function jsonToTypeScript(json: unknown): string {
  const defs = new Map<string, string>()
  const rootType = getType(json, "Root", defs)
  const interfaces = [...defs.values()]

  if (interfaces.length === 0) {
    return `type Root = ${rootType};`
  }

  // If root ended up as an array or primitive, add a type alias
  if (!defs.has("Root")) {
    return [...interfaces, `type Root = ${rootType};`].join("\n\n")
  }

  return interfaces.join("\n\n")
}

// ─── CSV Conversion ────────────────────────────────────────────────────────────

function jsonToCsv(data: unknown): string {
  if (!Array.isArray(data)) {
    throw new Error("Input must be a JSON array (starting with [)")
  }
  if (data.length === 0) {
    throw new Error("Array must not be empty")
  }

  // Collect all unique keys across all rows
  const allKeys = new Set<string>()
  data.forEach((row) => {
    if (typeof row === "object" && row !== null && !Array.isArray(row)) {
      Object.keys(row as object).forEach((k) => allKeys.add(k))
    }
  })

  if (allKeys.size === 0) {
    throw new Error("Array items must be objects with keys (e.g. [{key: value}])")
  }

  const headers = [...allKeys]

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return ""
    const str =
      typeof val === "object" ? JSON.stringify(val) : String(val)
    if (
      str.includes(",") ||
      str.includes('"') ||
      str.includes("\n") ||
      str.includes("\r")
    ) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerRow = headers.map((h) => escapeCell(h)).join(",")
  const dataRows = data.map((row) => {
    if (
      typeof row !== "object" ||
      row === null ||
      Array.isArray(row)
    ) {
      return headers.map(() => "").join(",")
    }
    const obj = row as Record<string, unknown>
    return headers.map((h) => escapeCell(obj[h])).join(",")
  })

  return [headerRow, ...dataRows].join("\n")
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function JsonFormatterTool() {
  // ── Format tab state ──────────────────────────────────────────────────────
  const [fmtInput, setFmtInput] = useState("")
  const [fmtOutput, setFmtOutput] = useState("")
  const [fmtError, setFmtError] = useState<string | null>(null)
  const [fmtCopied, setFmtCopied] = useState(false)
  const [fmtIndent, setFmtIndent] = useState<2 | 4>(2)

  // ── Minify tab state ──────────────────────────────────────────────────────
  const [minInput, setMinInput] = useState("")
  const [minOutput, setMinOutput] = useState("")
  const [minError, setMinError] = useState<string | null>(null)
  const [minCopied, setMinCopied] = useState(false)
  const [minSaved, setMinSaved] = useState<number | null>(null)

  // ── YAML tab state ────────────────────────────────────────────────────────
  const [yamlInput, setYamlInput] = useState("")
  const [yamlOutput, setYamlOutput] = useState("")
  const [yamlError, setYamlError] = useState<string | null>(null)
  const [yamlCopied, setYamlCopied] = useState(false)

  // ── CSV tab state ─────────────────────────────────────────────────────────
  const [csvInput, setCsvInput] = useState("")
  const [csvOutput, setCsvOutput] = useState("")
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvCopied, setCsvCopied] = useState(false)

  // ── TypeScript tab state ──────────────────────────────────────────────────
  const [tsInput, setTsInput] = useState("")
  const [tsOutput, setTsOutput] = useState("")
  const [tsError, setTsError] = useState<string | null>(null)
  const [tsCopied, setTsCopied] = useState(false)

  // ── Helpers ───────────────────────────────────────────────────────────────
  const copyText = (text: string, setFlag: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setFlag(true)
    setTimeout(() => setFlag(false), 2000)
  }

  const lineCount = (s: string) => (s ? s.split("\n").length : 0)
  const byteSize = (s: string) => new Blob([s]).size

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFormat = () => {
    setFmtError(null)
    setFmtOutput("")
    if (!fmtInput.trim()) {
      setFmtError("Please enter JSON to format.")
      return
    }
    try {
      const parsed = JSON.parse(fmtInput)
      setFmtOutput(JSON.stringify(parsed, null, fmtIndent))
    } catch (e: unknown) {
      setFmtError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  const handleMinify = () => {
    setMinError(null)
    setMinOutput("")
    setMinSaved(null)
    if (!minInput.trim()) {
      setMinError("Please enter JSON to minify.")
      return
    }
    try {
      const parsed = JSON.parse(minInput)
      const minified = JSON.stringify(parsed)
      setMinOutput(minified)
      setMinSaved(minInput.length - minified.length)
    } catch (e: unknown) {
      setMinError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  const handleYaml = () => {
    setYamlError(null)
    setYamlOutput("")
    if (!yamlInput.trim()) {
      setYamlError("Please enter JSON to convert.")
      return
    }
    try {
      const parsed = JSON.parse(yamlInput)
      setYamlOutput(toYaml(parsed))
    } catch (e: unknown) {
      setYamlError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  const handleCsv = () => {
    setCsvError(null)
    setCsvOutput("")
    if (!csvInput.trim()) {
      setCsvError("Please enter a JSON array to convert.")
      return
    }
    try {
      const parsed = JSON.parse(csvInput)
      setCsvOutput(jsonToCsv(parsed))
    } catch (e: unknown) {
      setCsvError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  const handleTs = () => {
    setTsError(null)
    setTsOutput("")
    if (!tsInput.trim()) {
      setTsError("Please enter JSON to convert.")
      return
    }
    try {
      const parsed = JSON.parse(tsInput)
      setTsOutput(jsonToTypeScript(parsed))
    } catch (e: unknown) {
      setTsError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  // ── Shared Sub-Components ─────────────────────────────────────────────────
  const ErrorBox = ({ msg }: { msg: string }) => (
    <div className="flex items-start gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in slide-in-from-top-2">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-bold mb-1">Error</p>
        <p className="text-[11px] leading-relaxed opacity-90 font-mono break-all">
          {msg}
        </p>
      </div>
    </div>
  )

  const CopyBtn = ({
    text,
    copied,
    onCopy,
  }: {
    text: string
    copied: boolean
    onCopy: () => void
  }) => (
    <Button
      variant="secondary"
      size="sm"
      className="rounded-xl gap-2 font-bold h-8"
      disabled={!text}
      onClick={onCopy}
    >
      {copied ? (
        <CheckCircle2 className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? "Copied!" : "Copy"}
    </Button>
  )

  const ClearBtn = ({ onClick }: { onClick: () => void }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="text-muted-foreground/50 hover:text-rose-500"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Tabs defaultValue="format" className="w-full">
        {/* Tab List */}
        <TabsList className="bg-muted/30 p-1 rounded-xl flex-wrap h-auto gap-1 mb-2">
          <TabsTrigger
            value="format"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-1.5 text-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Format
          </TabsTrigger>
          <TabsTrigger
            value="minify"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-1.5 text-sm"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            Minify
          </TabsTrigger>
          <TabsTrigger
            value="yaml"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-1.5 text-sm"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            JSON → YAML
          </TabsTrigger>
          <TabsTrigger
            value="csv"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-1.5 text-sm"
          >
            <Table className="h-3.5 w-3.5" />
            JSON → CSV
          </TabsTrigger>
          <TabsTrigger
            value="typescript"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-1.5 text-sm"
          >
            <FileCode className="h-3.5 w-3.5" />
            JSON → TypeScript
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1 : Format ──────────────────────────────────────────────── */}
        <TabsContent value="format" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    JSON Input
                  </CardTitle>
                  <CardDescription>
                    Paste your JSON here to format and validate
                  </CardDescription>
                </div>
                <ClearBtn
                  onClick={() => {
                    setFmtInput("")
                    setFmtOutput("")
                    setFmtError(null)
                  }}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                {/* Indent selector */}
                <div className="flex items-center gap-3">
                  <Label
                    htmlFor="fmt-indent-switch"
                    className={`text-sm transition-colors ${fmtIndent === 2 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    2 spaces
                  </Label>
                  <Switch
                    id="fmt-indent-switch"
                    checked={fmtIndent === 4}
                    onCheckedChange={(checked) =>
                      setFmtIndent(checked ? 4 : 2)
                    }
                  />
                  <Label
                    htmlFor="fmt-indent-switch"
                    className={`text-sm transition-colors ${fmtIndent === 4 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    4 spaces
                  </Label>
                </div>

                <Textarea
                  placeholder={`{\n  "name": "John",\n  "age": 30,\n  "active": true\n}`}
                  value={fmtInput}
                  onChange={(e) => setFmtInput(e.target.value)}
                  className="flex-1 min-h-[300px] font-mono text-[13px] bg-background/50 border-primary/10 transition-all focus-visible:ring-primary focus-visible:ring-offset-0"
                />

                {/* Stat badges */}
                {fmtInput && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {lineCount(fmtInput)} lines
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {fmtInput.length} chars
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {byteSize(fmtInput)} bytes
                    </Badge>
                  </div>
                )}

                {fmtError && <ErrorBox msg={fmtError} />}

                <Button
                  className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg"
                  onClick={handleFormat}
                >
                  <Sparkles className="h-4 w-4" />
                  Format JSON
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="border-green-500/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Formatted Output
                  </CardTitle>
                  <CardDescription>
                    Pretty-printed JSON with {fmtIndent}-space indent
                  </CardDescription>
                </div>
                <CopyBtn
                  text={fmtOutput}
                  copied={fmtCopied}
                  onCopy={() => copyText(fmtOutput, setFmtCopied)}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <Textarea
                  readOnly
                  value={fmtOutput}
                  placeholder="Formatted JSON will appear here..."
                  className="flex-1 min-h-[300px] font-mono text-[12px] bg-background/80 border-green-500/10 transition-all"
                />
                {fmtOutput && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] text-green-600 border-green-500/30 font-mono"
                    >
                      {lineCount(fmtOutput)} lines
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-green-600 border-green-500/30 font-mono"
                    >
                      {fmtOutput.length} chars
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2 : Minify ──────────────────────────────────────────────── */}
        <TabsContent value="minify" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    JSON Input
                  </CardTitle>
                  <CardDescription>
                    Paste formatted JSON to strip all whitespace
                  </CardDescription>
                </div>
                <ClearBtn
                  onClick={() => {
                    setMinInput("")
                    setMinOutput("")
                    setMinError(null)
                    setMinSaved(null)
                  }}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <Textarea
                  placeholder={`{\n  "name": "John",\n  "age": 30\n}`}
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  className="flex-1 min-h-[300px] font-mono text-[13px] bg-background/50 border-primary/10 transition-all focus-visible:ring-primary focus-visible:ring-offset-0"
                />

                {minInput && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {minInput.length} chars
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {byteSize(minInput)} bytes
                    </Badge>
                  </div>
                )}

                {minError && <ErrorBox msg={minError} />}

                <Button
                  className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg"
                  onClick={handleMinify}
                >
                  <Minimize2 className="h-4 w-4" />
                  Minify JSON
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="border-orange-500/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Minimize2 className="h-4 w-4 text-orange-500" />
                    Minified Output
                  </CardTitle>
                  {minSaved !== null && minSaved > 0 && (
                    <CardDescription className="text-orange-500 font-medium">
                      Saved {minSaved} bytes —{" "}
                      {Math.round((minSaved / minInput.length) * 100)}%
                      smaller
                    </CardDescription>
                  )}
                </div>
                <CopyBtn
                  text={minOutput}
                  copied={minCopied}
                  onCopy={() => copyText(minOutput, setMinCopied)}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <Textarea
                  readOnly
                  value={minOutput}
                  placeholder="Minified JSON will appear here..."
                  className="flex-1 min-h-[300px] font-mono text-[12px] bg-background/80 border-orange-500/10 transition-all"
                />
                {minOutput && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] text-orange-600 border-orange-500/30 font-mono"
                    >
                      {minOutput.length} chars
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-orange-600 border-orange-500/30 font-mono"
                    >
                      {byteSize(minOutput)} bytes
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 3 : JSON → YAML ─────────────────────────────────────────── */}
        <TabsContent value="yaml" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    JSON Input
                  </CardTitle>
                  <CardDescription>
                    Paste JSON to convert to YAML format
                  </CardDescription>
                </div>
                <ClearBtn
                  onClick={() => {
                    setYamlInput("")
                    setYamlOutput("")
                    setYamlError(null)
                  }}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <Textarea
                  placeholder={`{\n  "server": {\n    "host": "localhost",\n    "port": 8080\n  },\n  "tags": ["web", "api"]\n}`}
                  value={yamlInput}
                  onChange={(e) => setYamlInput(e.target.value)}
                  className="flex-1 min-h-[300px] font-mono text-[13px] bg-background/50 border-primary/10 transition-all focus-visible:ring-primary focus-visible:ring-offset-0"
                />
                {yamlError && <ErrorBox msg={yamlError} />}
                <Button
                  className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg"
                  onClick={handleYaml}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Convert to YAML
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="border-purple-500/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4 text-purple-500" />
                    YAML Output
                  </CardTitle>
                  <CardDescription>
                    Pure TypeScript conversion — zero external libraries
                  </CardDescription>
                </div>
                <CopyBtn
                  text={yamlOutput}
                  copied={yamlCopied}
                  onCopy={() => copyText(yamlOutput, setYamlCopied)}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <Textarea
                  readOnly
                  value={yamlOutput}
                  placeholder="YAML output will appear here..."
                  className="flex-1 min-h-[300px] font-mono text-[12px] bg-background/80 border-purple-500/10 transition-all"
                />
                {yamlOutput && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] text-purple-600 border-purple-500/30 font-mono"
                    >
                      {lineCount(yamlOutput)} lines
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-purple-600 border-purple-500/30 font-mono"
                    >
                      {byteSize(yamlOutput)} bytes
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 4 : JSON → CSV ──────────────────────────────────────────── */}
        <TabsContent value="csv" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    JSON Array Input
                  </CardTitle>
                  <CardDescription>
                    Paste a JSON array of objects to convert to CSV
                  </CardDescription>
                </div>
                <ClearBtn
                  onClick={() => {
                    setCsvInput("")
                    setCsvOutput("")
                    setCsvError(null)
                  }}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <Textarea
                  placeholder={`[\n  { "name": "Alice", "age": 30, "city": "Seoul" },\n  { "name": "Bob",   "age": 25, "city": "Busan" },\n  { "name": "Carol", "age": 28, "city": "Jeju"  }\n]`}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="flex-1 min-h-[300px] font-mono text-[13px] bg-background/50 border-primary/10 transition-all focus-visible:ring-primary focus-visible:ring-offset-0"
                />
                {csvError && <ErrorBox msg={csvError} />}
                <Button
                  className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg"
                  onClick={handleCsv}
                >
                  <Table className="h-4 w-4" />
                  Convert to CSV
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="border-teal-500/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Table className="h-4 w-4 text-teal-500" />
                    CSV Output
                  </CardTitle>
                  <CardDescription>
                    First row is the header; values are comma-separated
                  </CardDescription>
                </div>
                <CopyBtn
                  text={csvOutput}
                  copied={csvCopied}
                  onCopy={() => copyText(csvOutput, setCsvCopied)}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <Textarea
                  readOnly
                  value={csvOutput}
                  placeholder="CSV output will appear here..."
                  className="flex-1 min-h-[300px] font-mono text-[12px] bg-background/80 border-teal-500/10 transition-all"
                />
                {csvOutput && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] text-teal-600 border-teal-500/30 font-mono"
                    >
                      {lineCount(csvOutput) - 1} data rows
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-teal-600 border-teal-500/30 font-mono"
                    >
                      {csvOutput.split("\n")[0]?.split(",").length ?? 0}{" "}
                      columns
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 5 : JSON → TypeScript ───────────────────────────────────── */}
        <TabsContent value="typescript" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    JSON Input
                  </CardTitle>
                  <CardDescription>
                    Paste any JSON to generate TypeScript interfaces
                  </CardDescription>
                </div>
                <ClearBtn
                  onClick={() => {
                    setTsInput("")
                    setTsOutput("")
                    setTsError(null)
                  }}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <Textarea
                  placeholder={`{\n  "id": 1,\n  "name": "John Doe",\n  "active": true,\n  "address": {\n    "city": "Seoul",\n    "zip": "04524"\n  },\n  "tags": ["admin", "user"]\n}`}
                  value={tsInput}
                  onChange={(e) => setTsInput(e.target.value)}
                  className="flex-1 min-h-[300px] font-mono text-[13px] bg-background/50 border-primary/10 transition-all focus-visible:ring-primary focus-visible:ring-offset-0"
                />
                {tsError && <ErrorBox msg={tsError} />}
                <Button
                  className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg"
                  onClick={handleTs}
                >
                  <FileCode className="h-4 w-4" />
                  Generate TypeScript
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="border-blue-500/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-blue-500" />
                    TypeScript Interfaces
                  </CardTitle>
                  <CardDescription>
                    Auto-generated — nested objects become separate interfaces
                  </CardDescription>
                </div>
                <CopyBtn
                  text={tsOutput}
                  copied={tsCopied}
                  onCopy={() => copyText(tsOutput, setTsCopied)}
                />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <Textarea
                  readOnly
                  value={tsOutput}
                  placeholder="TypeScript interfaces will appear here..."
                  className="flex-1 min-h-[300px] font-mono text-[12px] bg-background/80 border-blue-500/10 transition-all"
                />
                {tsOutput && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] text-blue-600 border-blue-500/30 font-mono"
                    >
                      {(tsOutput.match(/^interface /gm) ?? []).length}{" "}
                      interface
                      {(tsOutput.match(/^interface /gm) ?? []).length !== 1
                        ? "s"
                        : ""}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-blue-600 border-blue-500/30 font-mono"
                    >
                      {lineCount(tsOutput)} lines
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Info Cards ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 space-y-3 bg-primary/5 border-primary/10 rounded-[24px]">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <h4 className="font-bold text-sm">Format & Validate</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Instantly pretty-print JSON with 2- or 4-space indentation.
            Syntax errors are caught and shown with descriptive messages so
            you can pinpoint and fix them quickly.
          </p>
          <div className="flex items-center gap-1 text-xs text-primary/70 font-medium">
            <ChevronRight className="h-3 w-3" />
            Validates as you convert
          </div>
        </Card>

        <Card className="p-6 space-y-3 bg-indigo-500/5 border-indigo-500/10 rounded-[24px]">
          <div className="flex items-center gap-2 text-indigo-500">
            <RefreshCcw className="h-5 w-5" />
            <h4 className="font-bold text-sm">Multi-Format Conversion</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Transform JSON into YAML, CSV, or TypeScript interfaces — all
            processed entirely in your browser. No data ever leaves your
            device, and no external libraries are required.
          </p>
          <div className="flex items-center gap-1 text-xs text-indigo-500/70 font-medium">
            <ChevronRight className="h-3 w-3" />
            100% client-side &amp; private
          </div>
        </Card>

        <Card className="p-6 space-y-3 bg-blue-500/5 border-blue-500/10 rounded-[24px]">
          <div className="flex items-center gap-2 text-blue-500">
            <FileCode className="h-5 w-5" />
            <h4 className="font-bold text-sm">TypeScript Type Generation</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generate fully-typed TypeScript interfaces from any JSON
            structure. Nested objects become separate named interfaces, and
            arrays receive proper element types automatically.
          </p>
          <div className="flex items-center gap-1 text-xs text-blue-500/70 font-medium">
            <ChevronRight className="h-3 w-3" />
            Handles deep nesting &amp; arrays
          </div>
        </Card>
      </div>
    </div>
  )
}
