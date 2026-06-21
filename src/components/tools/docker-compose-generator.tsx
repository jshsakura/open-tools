"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
  defaultOptions,
  generateCompose,
  RESTART_POLICIES,
  SERVICE_DEFINITIONS,
  SERVICE_ORDER,
  type ComposeOptions,
  type ServiceConfig,
  type ServiceId,
} from "./docker-compose-generator.utils"

const SERVICE_LABELS: Record<ServiceId, string> = {
  node: "NodeJS (Web Service)",
  postgres: "PostgreSQL (Database)",
  mysql: "MySQL (Database)",
  mongo: "MongoDB (Database)",
  redis: "Redis (Cache)",
  nginx: "Nginx (Reverse Proxy)",
  minio: "MinIO (Object Storage)",
  rabbitmq: "RabbitMQ (Message Queue)",
}

export function DockerComposeGenerator() {
  const t = useTranslations("DockerComposeGenerator.ui")
  const [opts, setOpts] = useState<ComposeOptions>(() => defaultOptions())

  const yml = generateCompose(opts)

  const updateService = (id: ServiceId, patch: Partial<ServiceConfig>) => {
    setOpts((prev) => ({
      ...prev,
      services: { ...prev.services, [id]: { ...prev.services[id], ...patch } },
    }))
  }

  const updateRestart = (restart: string) => {
    setOpts((prev) => ({ ...prev, restart }))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(yml)
    toast.success(t("copied"))
  }

  const handleDownload = () => {
    const blob = new Blob([yml], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "docker-compose.yml"
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("downloaded"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground">{t("selectServices")}</h3>
          <div className="space-y-3">
            {SERVICE_ORDER.map((id) => {
              const cfg = opts.services[id]
              return (
                <div key={id} className="rounded-lg border border-border/50 p-3 space-y-2">
                  <label className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                    <span>{SERVICE_LABELS[id]}</span>
                    <Switch
                      checked={cfg.enabled}
                      onCheckedChange={(checked) => updateService(id, { enabled: checked })}
                    />
                  </label>
                  {cfg.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-1">
                          {t("imageTag")}
                        </label>
                        <Input
                          value={cfg.tag}
                          onChange={(e) => updateService(id, { tag: e.target.value })}
                          className="h-8 bg-background/50 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-1">
                          {t("hostPort")}
                        </label>
                        <Input
                          value={cfg.hostPort}
                          onChange={(e) => updateService(id, { hostPort: e.target.value })}
                          className="h-8 bg-background/50 text-xs"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("restartPolicy")}
            </label>
            <Select value={opts.restart} onValueChange={updateRestart}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESTART_POLICIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">docker-compose.yml</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                <Clipboard className="w-3.5 h-3.5" />
                {t("copyYml")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                <Download className="w-3.5 h-3.5" />
                {t("download")}
              </Button>
            </div>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-[400px] overflow-y-auto">
            {yml}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
