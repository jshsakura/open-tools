"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Clipboard, Download } from "lucide-react"
import { toast } from "sonner"
import {
  drawBox,
  insertAt,
  MIN_BOX_WIDTH,
  MIN_BOX_HEIGHT,
  MAX_BOX_WIDTH,
  MAX_BOX_HEIGHT,
} from "./ascii-art-diagram.utils"

const BOX_CHARS = [
  "┌", "┐", "└", "┘", "─", "│", "├", "┤", "┬", "┴", "┼",
  "→", "←", "↑", "↓", "●",
]

const INITIAL = `┌─────────────────┐
│   User Client   │
└────────┬────────┘
         │
         ▼`

const TEMPLATES: Record<string, string> = {
  flowchart: `┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────┐
│ Process │
└────┬────┘
     │
     ▼
┌─────────┐
│   End   │
└─────────┘`,
  tree: `root
├── src
│   ├── index.ts
│   └── utils.ts
├── tests
│   └── index.test.ts
└── README.md`,
  table: `┌──────────┬──────────┬──────────┐
│  Name    │  Type    │  Default │
├──────────┼──────────┼──────────┤
│  size    │  number  │  16      │
│  color   │  string  │  red     │
└──────────┴──────────┴──────────┘`,
  box: `┌─────────────────┐
│                 │
│                 │
└─────────────────┘`,
}

const DOWNLOAD_FILENAME = "diagram.txt"

export function AsciiArtDiagram() {
  const t = useTranslations("AsciiArtDiagram.ui")
  const [text, setText] = useState(INITIAL)
  const [boxWidth, setBoxWidth] = useState(12)
  const [boxHeight, setBoxHeight] = useState(4)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const applyInsert = (insert: string) => {
    const el = textareaRef.current
    if (!el) {
      setText((prev) => prev + insert)
      return
    }
    const { text: next, caret } = insertAt(
      text,
      el.selectionStart,
      el.selectionEnd,
      insert,
    )
    setText(next)
    // Restore caret right after the inserted content.
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(caret, caret)
    })
  }

  const handleTemplate = (key: string) => {
    const template = TEMPLATES[key]
    if (template) setText(template)
  }

  const handleDrawBox = () => {
    applyInsert(drawBox(boxWidth, boxHeight))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    toast.success(t("copied"))
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = DOWNLOAD_FILENAME
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(t("downloaded"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("template")}
            </Label>
            <Select onValueChange={handleTemplate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("templatePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(TEMPLATES).map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`template_${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("drawBox")}
            </Label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={boxWidth}
                min={MIN_BOX_WIDTH}
                max={MAX_BOX_WIDTH}
                onChange={(e) => setBoxWidth(Number(e.target.value))}
                className="w-16 font-mono"
                aria-label={t("boxWidth")}
              />
              <span className="text-xs text-muted-foreground">×</span>
              <Input
                type="number"
                value={boxHeight}
                min={MIN_BOX_HEIGHT}
                max={MAX_BOX_HEIGHT}
                onChange={(e) => setBoxHeight(Number(e.target.value))}
                className="w-16 font-mono"
                aria-label={t("boxHeight")}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDrawBox}
                className="text-xs"
              >
                {t("insertBox")}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
            {t("drawMode")}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {BOX_CHARS.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => applyInsert(char)}
                className="h-8 w-8 rounded-md border border-input bg-background/50 font-mono text-sm hover:bg-muted transition-colors"
                aria-label={`insert ${char}`}
              >
                {char}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs font-semibold text-muted-foreground">
              {t("canvasArea")}
            </Label>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {t("download")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5"
              >
                <Clipboard className="w-3.5 h-3.5" />
                {t("copyText")}
              </Button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[260px] bg-background/50 font-mono text-sm leading-tight p-4 rounded border border-border whitespace-pre overflow-auto"
          />
        </div>
      </CardContent>
    </Card>
  )
}
