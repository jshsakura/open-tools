"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"

export function PromptOptimizer() {
  const t = useTranslations("PromptOptimizer.ui")
  const [prompt, setPrompt] = useState("")
  const [role, setRole] = useState(() => t("roleDefault"))
  const [format, setFormat] = useState(() => t("formatDefault"))
  const [result, setResult] = useState("")

  const handleOptimize = () => {
    if (!prompt.trim()) return
    setResult(t("template", { role, prompt, format }))
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
    toast.success(t("copied"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("roleLabel")}</label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} className="bg-background/50" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("formatLabel")}</label>
          <Input value={format} onChange={(e) => setFormat(e.target.value)} className="bg-background/50" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("inputLabel")}</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] bg-background/50"
          />
        </div>
        <Button onClick={handleOptimize} className="w-full font-bold">
          {t("optimizeBtn")}
        </Button>

        {result && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">{t("outputLabel")}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyResult}
                className="h-8 gap-1.5"
              >
                <Clipboard className="w-3.5 h-3.5" />
                {t("copy")}
              </Button>
            </div>
            <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-[300px] overflow-y-auto">
              {result}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}