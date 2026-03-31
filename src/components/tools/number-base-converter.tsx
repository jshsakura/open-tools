"use client"

import { useState, useCallback } from "react"
import { Copy, CheckCircle2, Hash, ArrowLeftRight, AlertCircle, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ─── Conversion Helpers ───────────────────────────────────────────────────────

type Base = 2 | 8 | 10 | 16

function toBigInt(value: string, base: Base): bigint | null {
  if (!value.trim()) return null
  try {
    const clean = value.trim().toLowerCase()
    // Strip common prefixes if user types them
    const stripped =
      base === 2  && clean.startsWith("0b") ? clean.slice(2) :
      base === 8  && clean.startsWith("0o") ? clean.slice(2) :
      base === 16 && clean.startsWith("0x") ? clean.slice(2) :
      clean

    if (!stripped) return null

    // Validate characters
    const validators: Record<Base, RegExp> = {
      2:  /^[01]+$/,
      8:  /^[0-7]+$/,
      10: /^-?[0-9]+$/,
      16: /^[0-9a-f]+$/,
    }
    if (!validators[base].test(stripped)) return null

    return BigInt(`0x${stripped !== clean ? stripped : toHexStr(stripped, base)}`)
  } catch {
    return null
  }
}

/** Convert a validated digit-string in `base` to a hex string for BigInt parsing */
function toHexStr(digits: string, base: Base): string {
  // We parse manually to avoid JS Number precision limits
  let result = 0n
  const bigBase = BigInt(base)
  const hexDigits = "0123456789abcdef"
  for (const ch of digits.toLowerCase()) {
    const d = BigInt(hexDigits.indexOf(ch))
    result = result * bigBase + d
  }
  return result.toString(16)
}

function fromBigInt(value: bigint, base: Base, upperHex: boolean): string {
  const abs = value < 0n ? -value : value
  let str: string
  switch (base) {
    case 2:  str = abs.toString(2);  break
    case 8:  str = abs.toString(8);  break
    case 10: str = abs.toString(10); break
    case 16: str = abs.toString(16); break
  }
  if (base === 16 && upperHex) str = str.toUpperCase()
  return (value < 0n ? "-" : "") + str
}

const CHAR_PATTERNS: Record<Base, RegExp> = {
  2:  /^-?[01]*$/,
  8:  /^-?[0-7]*$/,
  10: /^-?[0-9]*$/,
  16: /^-?[0-9a-fA-F]*$/,
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldState {
  raw: string       // what the user typed (display value)
  error: string | null
}

const EMPTY: FieldState = { raw: "", error: null }

const BASES: { base: Base; label: string; prefix: string; placeholder: string; color: string }[] = [
  { base: 2,  label: "Binary",      prefix: "0b", placeholder: "e.g. 1010",     color: "text-violet-500" },
  { base: 8,  label: "Octal",       prefix: "0o", placeholder: "e.g. 755",      color: "text-indigo-500" },
  { base: 10, label: "Decimal",     prefix: "",   placeholder: "e.g. 255",      color: "text-blue-500"   },
  { base: 16, label: "Hexadecimal", prefix: "0x", placeholder: "e.g. FF or ff", color: "text-purple-500" },
]

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      disabled={!text}
      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 shrink-0"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      {copied ? "Copied!" : "Copy"}
    </Button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NumberBaseConverter() {
  const [fields, setFields] = useState<Record<Base, FieldState>>({
    2:  EMPTY,
    8:  EMPTY,
    10: EMPTY,
    16: EMPTY,
  })
  const [upperHex, setUpperHex] = useState(true)
  const [activeBase, setActiveBase] = useState<Base | null>(null)

  const handleChange = useCallback(
    (base: Base, raw: string) => {
      setActiveBase(base)

      // Allow empty
      if (!raw.trim()) {
        setFields({ 2: EMPTY, 8: EMPTY, 10: EMPTY, 16: EMPTY })
        return
      }

      // Validate characters
      if (!CHAR_PATTERNS[base].test(raw)) {
        setFields((prev) => ({
          ...prev,
          [base]: {
            raw,
            error: `Invalid character for base-${base}`,
          },
        }))
        return
      }

      // Try to parse
      const bigVal = toBigInt(raw, base)
      if (bigVal === null) {
        setFields((prev) => ({
          ...prev,
          [base]: { raw, error: "Could not parse value" },
        }))
        return
      }

      // Fan out to all bases
      const next: Record<Base, FieldState> = {
        2:  { raw: fromBigInt(bigVal, 2,  upperHex), error: null },
        8:  { raw: fromBigInt(bigVal, 8,  upperHex), error: null },
        10: { raw: fromBigInt(bigVal, 10, upperHex), error: null },
        16: { raw: fromBigInt(bigVal, 16, upperHex), error: null },
      }
      // Keep the user's raw input in the active field
      next[base] = { raw, error: null }
      setFields(next)
    },
    [upperHex]
  )

  const toggleHexCase = useCallback(() => {
    setUpperHex((prev) => {
      const next = !prev
      // Re-render hex field with new case
      setFields((prevFields) => {
        const hexRaw = prevFields[16].raw
        if (!hexRaw || prevFields[16].error) return prevFields
        return {
          ...prevFields,
          16: {
            ...prevFields[16],
            raw: next ? hexRaw.toUpperCase() : hexRaw.toLowerCase(),
          },
        }
      })
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setFields({ 2: EMPTY, 8: EMPTY, 10: EMPTY, 16: EMPTY })
    setActiveBase(null)
  }, [])

  const hasValue = Object.values(fields).some((f) => f.raw !== "")

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="w-4 h-4" />
          <span>Edit any field to convert all others instantly</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleHexCase}
            className="gap-1.5 h-8 text-xs font-mono"
            title="Toggle hex case"
          >
            {upperHex ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                HEX: A–F
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                hex: a–f
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={!hasValue}
            className="h-8 text-xs gap-1.5"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BASES.map(({ base, label, prefix, placeholder, color }) => {
          const field = fields[base]
          const isActive = activeBase === base
          const hasError = !!field.error
          const displayValue = field.raw

          return (
            <Card
              key={base}
              className={cn(
                "border transition-all duration-200",
                isActive && !hasError && "border-primary/50 shadow-md shadow-primary/5",
                hasError && "border-destructive/60",
                !isActive && !hasError && "border-border/60 bg-card/60 backdrop-blur-sm"
              )}
            >
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className={cn("font-bold", color)}>
                      Base&#8209;{base}
                    </span>
                    <span className="text-muted-foreground font-normal">{label}</span>
                    {prefix && (
                      <span className="text-xs font-mono text-muted-foreground/60 bg-muted/40 px-1.5 py-0.5 rounded border border-border/30">
                        {prefix}
                      </span>
                    )}
                  </CardTitle>
                  <CopyButton text={displayValue} />
                </div>
              </CardHeader>

              <CardContent className="pt-3 pb-4 space-y-1">
                <div className="relative">
                  <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => handleChange(base, e.target.value)}
                    onFocus={() => setActiveBase(base)}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    placeholder={placeholder}
                    className={cn(
                      "w-full bg-transparent rounded-lg px-3 py-2.5",
                      "font-mono text-sm leading-relaxed tracking-wide",
                      "border transition-colors duration-150",
                      "focus:outline-none focus:ring-2 focus:ring-offset-0",
                      "placeholder:text-muted-foreground/40",
                      hasError
                        ? "border-destructive/50 focus:ring-destructive/30 text-destructive"
                        : "border-border/50 focus:ring-primary/30 focus:border-primary/50"
                    )}
                  />
                </div>

                {/* Error message */}
                {hasError && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive mt-1.5 px-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {field.error}
                  </p>
                )}

                {/* Char count hint */}
                {!hasError && displayValue && (
                  <p className="text-xs text-muted-foreground/50 px-1 font-mono">
                    {displayValue.replace("-", "").length} digit
                    {displayValue.replace("-", "").length !== 1 ? "s" : ""}
                    {base === 16 && (
                      <span className="ml-2">
                        ({Math.ceil(displayValue.replace("-", "").length / 2)} byte
                        {Math.ceil(displayValue.replace("-", "").length / 2) !== 1 ? "s" : ""})
                      </span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick reference */}
      <Card className="border-border/40 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <ArrowLeftRight className="w-4 h-4" />
            Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "0",    bin: "0",        oct: "0",    dec: "0",   hex: "0"  },
              { label: "8",    bin: "1000",     oct: "10",   dec: "8",   hex: "8"  },
              { label: "10",   bin: "1010",     oct: "12",   dec: "10",  hex: "A"  },
              { label: "15",   bin: "1111",     oct: "17",   dec: "15",  hex: "F"  },
              { label: "16",   bin: "10000",    oct: "20",   dec: "16",  hex: "10" },
              { label: "255",  bin: "11111111", oct: "377",  dec: "255", hex: "FF" },
              { label: "256",  bin: "100000000",oct: "400",  dec: "256", hex: "100"},
              { label: "1024", bin: "10000000000",oct:"2000",dec: "1024",hex: "400"},
            ].map((row) => (
              <button
                type="button"
                key={row.label}
                onClick={() => handleChange(10, row.dec)}
                className={cn(
                  "text-left p-2.5 rounded-xl border transition-all duration-150",
                  "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
                  "bg-background/50 border-border/30",
                  "group cursor-pointer"
                )}
              >
                <span className="block text-xs font-bold text-foreground/80 mb-1.5 group-hover:text-primary transition-colors">
                  {row.dec}
                </span>
                <span className="block text-[10px] font-mono text-muted-foreground/60 leading-relaxed">
                  <span className="text-violet-400/70">bin </span>{row.bin}<br />
                  <span className="text-indigo-400/70">oct </span>{row.oct}<br />
                  <span className="text-purple-400/70">hex </span>{row.hex}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
