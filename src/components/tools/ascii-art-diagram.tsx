"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"

const BOX_CHARS = [
  "┌", "┐", "└", "┘", "─", "│", "├", "┤", "┬", "┴", "┼",
  "→", "←", "↑", "↓", "●",
]

const INITIAL = `┌─────────────────┐
│   User Client   │
└────────┬────────┘
         │
         ▼`

export function AsciiArtDiagram() {
  const t = useTranslations("AsciiArtDiagram.ui")
  const [text, setText] = useState(INITIAL)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertChar = (char: string) => {
    const el = textareaRef.current
    if (!el) {
      setText((prev) => prev + char)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = text.slice(0, start) + char + text.slice(end)
    setText(next)
    // Restore caret right after the inserted character.
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + char.length
      el.setSelectionRange(pos, pos)
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    toast.success(t("copied"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">
            {t("drawMode")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BOX_CHARS.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => insertChar(char)}
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
            <label className="text-xs font-semibold text-muted-foreground">
              {t("canvasArea")}
            </label>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              <Clipboard className="w-3.5 h-3.5" />
              {t("copyText")}
            </Button>
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
