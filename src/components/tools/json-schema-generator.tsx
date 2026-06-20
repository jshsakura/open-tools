"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"
import { generateSchema } from "./json-schema-generator.utils"

export function JsonSchemaGenerator() {
  const t = useTranslations("JsonSchemaGenerator.ui")
  const [jsonStr, setJsonStr] = useState('{\n  "name": "Jane",\n  "age": 25\n}')
  const [schema, setSchema] = useState("")

  const handleGenerate = () => {
    try {
      const parsed = JSON.parse(jsonStr)
      const genSchema = generateSchema(parsed)
      setSchema(JSON.stringify(genSchema, null, 4))
    } catch {
      toast.error("Invalid JSON data format.")
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(schema)
    toast.success(t("copySchema"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">{t("jsonInput")}</label>
            <Textarea value={jsonStr} onChange={(e) => setJsonStr(e.target.value)} className="min-h-[180px] bg-background/50 font-mono text-xs" />
          </div>
          <Button onClick={handleGenerate} className="w-full font-semibold">Generate Schema</Button>
        </div>
        <div className="space-y-2">
          {schema && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-muted-foreground">{t("schemaOutput")}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  {t("copySchema")}
                </Button>
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
