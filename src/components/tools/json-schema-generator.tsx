"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Clipboard, Download } from "lucide-react"
import { toast } from "sonner"
import { generateSchema, type SchemaDraft } from "./json-schema-generator.utils"

const DRAFT_OPTIONS: SchemaDraft[] = ["draft-07", "2020-12"]
const INDENT_OPTIONS = ["2", "4", "tab"] as const

function indentValue(option: string): string | number {
  if (option === "tab") return "\t"
  return Number(option)
}

export function JsonSchemaGenerator() {
  const t = useTranslations("JsonSchemaGenerator.ui")
  const [jsonStr, setJsonStr] = useState('{\n  "name": "Jane",\n  "age": 25\n}')
  const [schema, setSchema] = useState("")
  const [draft, setDraft] = useState<SchemaDraft>("draft-07")
  const [indent, setIndent] = useState<string>("4")

  const handleGenerate = () => {
    try {
      const parsed = JSON.parse(jsonStr)
      const genSchema = generateSchema(parsed, draft)
      setSchema(JSON.stringify(genSchema, null, indentValue(indent)))
    } catch {
      toast.error(t("invalidJson"))
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(schema)
    toast.success(t("copySchema"))
  }

  const handleDownload = () => {
    const blob = new Blob([schema], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "schema.json"
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("downloaded"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">{t("jsonInput")}</label>
            <Textarea value={jsonStr} onChange={(e) => setJsonStr(e.target.value)} className="min-h-[180px] bg-background/50 font-mono text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">{t("draft")}</label>
              <Select value={draft} onValueChange={(v) => setDraft(v as SchemaDraft)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DRAFT_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">{t("indent")}</label>
              <Select value={indent} onValueChange={setIndent}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "tab" ? t("tab") : t("spaces", { count: opt })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} className="w-full font-semibold">{t("generate")}</Button>
        </div>
        <div className="space-y-2">
          {schema && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-muted-foreground">{t("schemaOutput")}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                    <Clipboard className="w-3.5 h-3.5" />
                    {t("copySchema")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    {t("download")}
                  </Button>
                </div>
              </div>
              <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-[220px] overflow-y-auto">
                {schema}
              </pre>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
