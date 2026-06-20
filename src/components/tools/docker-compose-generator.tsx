"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"
import { generateCompose } from "./docker-compose-generator.utils"

export function DockerComposeGenerator() {
  const t = useTranslations("DockerComposeGenerator.ui")
  const [node, setNode] = useState(true)
  const [postgres, setPostgres] = useState(true)
  const [redis, setRedis] = useState(false)

  const yml = generateCompose({ node, postgres, redis })

  const handleCopy = () => {
    navigator.clipboard.writeText(yml)
    toast.success(t("copied"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground">{t("selectServices")}</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={node} onChange={(e) => setNode(e.target.checked)} className="rounded text-primary" />
              <span>NodeJS (Web Service)</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={postgres} onChange={(e) => setPostgres(e.target.checked)} className="rounded text-primary" />
              <span>PostgreSQL (Database)</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={redis} onChange={(e) => setRedis(e.target.checked)} className="rounded text-primary" />
              <span>Redis (Cache)</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">docker-compose.yml</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5" />
              {t("copyYml")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-[300px] overflow-y-auto">
            {yml}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}