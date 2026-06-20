"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"

const COMMIT_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
] as const

export function GitCommitHelper() {
  const t = useTranslations("GitCommitHelper.ui")
  const [type, setType] = useState("feat")
  const [scope, setScope] = useState("")
  const [subject, setSubject] = useState("")

  const commitMsg = `${type}${scope ? `(${scope})` : ""}: ${subject}`
  const gitCommand = `git commit -m "${commitMsg.replace(/"/g, '\\"')}"`

  const handleCopy = () => {
    navigator.clipboard.writeText(gitCommand)
    toast.success(t("copied"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("commitType")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
            >
              {COMMIT_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("scope")}
            </label>
            <Input
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="auth"
              className="bg-background/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("subject")}
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="add login form validation"
              className="bg-background/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">git commit</span>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              <Clipboard className="w-3.5 h-3.5" />
              {t("copyCommit")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all">
            {gitCommand}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
