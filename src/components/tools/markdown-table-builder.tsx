"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"

type Align = "left" | "center" | "right"

const ALIGN_SEPARATORS: Record<Align, string> = {
  left: ":---",
  center: ":--:",
  right: "---:",
}

export function MarkdownTableBuilder() {
  const t = useTranslations("MarkdownTableBuilder.ui")
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [cells, setCells] = useState<Record<string, string>>({})
  const [aligns, setAligns] = useState<Record<number, Align>>({})

  const handleCellChange = (r: number, c: number, val: string) => {
    setCells({ ...cells, [`${r}-${c}`]: val })
  }

  const handleAlignChange = (c: number, val: Align) => {
    setAligns({ ...aligns, [c]: val })
  }

  const generateMarkdownTable = () => {
    let md = "|"
    for (let c = 0; c < cols; c++) {
      md += ` ${cells[`0-${c}`] || `Header ${c + 1}`} |`
    }
    md += "\n|"
    for (let c = 0; c < cols; c++) {
      md += ` ${ALIGN_SEPARATORS[aligns[c] || "left"]} |`
    }
    md += "\n"
    for (let r = 1; r < rows; r++) {
      md += "|"
      for (let c = 0; c < cols; c++) md += ` ${cells[`${r}-${c}`] || ""} |`
      md += "\n"
    }
    return md
  }

  const markdown = generateMarkdownTable()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    toast.success(t("copied"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setRows(rows + 1)} variant="outline" size="sm">+ Row</Button>
            <Button onClick={() => setCols(cols + 1)} variant="outline" size="sm">+ Col</Button>
          </div>
          <div className="overflow-x-auto space-y-1">
            <div className="flex gap-1 min-w-[200px]">
              {Array.from({ length: cols }).map((_, c) => (
                <select
                  key={c}
                  aria-label={t("alignOption")}
                  value={aligns[c] || "left"}
                  onChange={(e) => handleAlignChange(c, e.target.value as Align)}
                  className="flex-1 bg-background/50 border border-border/80 px-1 py-1 text-xs rounded text-center"
                >
                  <option value="left">⬅</option>
                  <option value="center">↔</option>
                  <option value="right">➡</option>
                </select>
              ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex gap-1 min-w-[200px]">
                {Array.from({ length: cols }).map((_, c) => (
                  <input
                    key={c}
                    value={cells[`${r}-${c}`] || ""}
                    onChange={(e) => handleCellChange(r, c, e.target.value)}
                    className="flex-1 bg-background/50 border border-border/80 px-2 py-1 text-xs rounded text-center"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">{t("copyMarkdown")}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5" />
              {t("copyMarkdown")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-[300px] overflow-y-auto">
            {markdown}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
