"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  bodyWarning,
  buildCommitMessage,
  buildGitCommand,
  COMMIT_TYPES,
  subjectWarning,
  type CommitInput,
} from "./git-commit-helper.utils"

export function GitCommitHelper() {
  const t = useTranslations("GitCommitHelper.ui")
  const [type, setType] = useState("feat")
  const [scope, setScope] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [footer, setFooter] = useState("")
  const [gitmoji, setGitmoji] = useState(false)

  const input: CommitInput = { type, scope, subject, body, footer, gitmoji }
  const previewMsg = buildCommitMessage(input)
  const gitCommand = buildGitCommand(input)
  const subjWarn = subjectWarning(input)
  const bodyWarn = bodyWarning(body)

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
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-muted-foreground">{t("subject")}</label>
              <span className={cn("text-[10px]", subjWarn.over ? "text-destructive" : "text-muted-foreground")}>
                {subjWarn.length}/{subjWarn.limit}
              </span>
            </div>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="add login form validation"
              className={cn("bg-background/50", subjWarn.over && "border-destructive")}
            />
            {subjWarn.over && (
              <p className="text-[10px] text-destructive mt-1">{t("subjectTooLong")}</p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-muted-foreground">{t("body")}</label>
              <span className={cn("text-[10px]", bodyWarn.over ? "text-destructive" : "text-muted-foreground")}>
                {bodyWarn.length}/{bodyWarn.limit}
              </span>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Explain what and why (wrap at 72 chars)."
              className={cn("min-h-[80px] bg-background/50 font-mono text-xs", bodyWarn.over && "border-destructive")}
            />
            {bodyWarn.over && (
              <p className="text-[10px] text-destructive mt-1">{t("bodyTooLong")}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("footer")}
            </label>
            <Input
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder="Closes #123 / BREAKING CHANGE: ..."
              className="bg-background/50"
            />
          </div>
          <label className="flex items-center justify-between gap-2 text-sm cursor-pointer">
            <span className="text-xs font-semibold text-muted-foreground">{t("gitmoji")}</span>
            <Switch checked={gitmoji} onCheckedChange={setGitmoji} />
          </label>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">{t("preview")}</span>
            <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all min-h-[80px]">
              {previewMsg}
            </pre>
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
        </div>
      </CardContent>
    </Card>
  )
}
