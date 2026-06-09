"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/glass-card"
import {
  MOCK_FIELDS,
  type MockField,
  generateRows,
  toCsv,
} from "./mock-data-generator.utils"

type Format = "json" | "csv"
const MAX_ROWS = 1000
const COPY_RESET_MS = 2000

export function MockDataGenerator() {
  const t = useTranslations("MockDataGenerator")
  const [fields, setFields] = useState<MockField[]>([
    "id",
    "name",
    "email",
  ])
  const [count, setCount] = useState(10)
  const [format, setFormat] = useState<Format>("json")
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)

  const toggleField = (field: MockField) => {
    setFields((prev) =>
      prev.includes(field)
        ? prev.filter((item) => item !== field)
        : [...prev, field],
    )
  }

  const generate = () => {
    const rows = generateRows(fields, count)
    setOutput(
      format === "json" ? JSON.stringify(rows, null, 2) : toCsv(rows),
    )
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch (error) {
      console.error("Failed to copy mock data:", error)
    }
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `mock-data.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <Label>{t("fields")}</Label>
        <div className="flex flex-wrap gap-2">
          {MOCK_FIELDS.map((field) => (
            <Button
              key={field}
              size="sm"
              variant={fields.includes(field) ? "default" : "outline"}
              onClick={() => toggleField(field)}
            >
              {fields.includes(field) && <Check className="mr-2 h-3.5 w-3.5" />}
              {t(`field_${field}`)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("rows")}</Label>
            <Input
              type="number"
              min={1}
              max={MAX_ROWS}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("format")}</Label>
            <div className="flex gap-2">
              {(["json", "csv"] as Format[]).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={format === value ? "default" : "outline"}
                  onClick={() => setFormat(value)}
                >
                  {value.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={generate} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("generate")}
        </Button>
      </GlassCard>

      {output && (
        <GlassCard className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <Label>{t("result")}</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {t("download")}
              </Button>
              <Button size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? t("copied") : t("copy")}
              </Button>
            </div>
          </div>
          <Textarea
            readOnly
            value={output}
            className="min-h-[300px] font-mono text-xs"
            aria-label={t("result")}
          />
        </GlassCard>
      )}
    </div>
  )
}
