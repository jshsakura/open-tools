"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"

export function PromptOptimizer() {
  const t = useTranslations("PromptOptimizer.ui")
  const [prompt, setPrompt] = useState("")
  const [role, setRole] = useState("전문가 소프트웨어 엔지니어")
  const [format, setFormat] = useState("Markdown 코드 블록과 단계별 설명")
  const [result, setResult] = useState("")

  const handleOptimize = () => {
    if (!prompt.trim()) return
    const optimized = `# [SYSTEM ROLE]\n당신은 ${role}입니다. 다음 지침에 따라 전문적인 답변을 제시하세요.\n\n# [USER QUESTION]\n${prompt}\n\n# [OUTPUT SPECIFICATION]\n출력은 반드시 '${format}' 형태로 작성하십시오. 또한, 간결하면서도 깊이 있는 세부 사항을 빠짐없이 기술하세요.`
    setResult(optimized)
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
                onClick={() => navigator.clipboard.writeText(result)}
                className="h-8 gap-1.5"
              >
                <Clipboard className="w-3.5 h-3.5" />
                Copy
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