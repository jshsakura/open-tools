"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Copy, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { parseUrl, type UrlParts } from "./url-parser.utils"

export function UrlParser() {
  const t = useTranslations("UrlParser.ui")
  const [url, setUrl] = useState(
    "https://user:pass@example.com:8080/search?q=open+tools&lang=ko#results",
  )

  const { valid, parts, params } = parseUrl(url)

  const componentRows: Array<{ label: string; value: string }> = parts
    ? (
        [
          ["protocol", parts.protocol],
          ["auth", parts.username ? `${parts.username}:${parts.password}` : ""],
          ["host", parts.hostname],
          ["port", parts.port],
          ["pathname", parts.pathname],
          ["hash", parts.hash],
          ["origin", parts.origin],
        ] as Array<[keyof typeof labelKeyMap, string]>
      )
        .filter(([, value]) => value !== "")
        .map(([key, value]) => ({ label: t(labelKeyMap[key]), value }))
    : []

  const buildBreakdown = (p: UrlParts): string => {
    const lines = [
      `${t("protocol")}: ${p.protocol}`,
      p.username ? `${t("auth")}: ${p.username}:${p.password}` : null,
      `${t("host")}: ${p.hostname}`,
      p.port ? `${t("port")}: ${p.port}` : null,
      `${t("pathname")}: ${p.pathname}`,
      p.hash ? `${t("hash")}: ${p.hash}` : null,
      `${t("origin")}: ${p.origin}`,
    ].filter(Boolean)

    if (params.length) {
      lines.push("", t("queryTable"))
      for (const { key, value } of params) lines.push(`  ${key} = ${value}`)
    }
    return lines.join("\n")
  }

  const copyBreakdown = () => {
    if (!parts) return
    navigator.clipboard.writeText(buildBreakdown(parts))
    toast.success(t("copied"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("urlInput")}</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-background/50 font-mono text-sm"
          />
        </div>

        {!valid && url.trim() && (
          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{t("invalidUrl")}</span>
          </div>
        )}

        {valid && parts && (
          <>
            <div className="pt-4 border-t border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground">{t("componentsTable")}</h4>
                <Button size="sm" variant="outline" className="h-7" onClick={copyBreakdown}>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {t("copyBreakdown")}
                </Button>
              </div>
              <div className="space-y-1.5">
                {componentRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex gap-2 text-xs font-mono bg-muted/40 p-2 rounded border border-border/30"
                  >
                    <span className="text-primary font-semibold min-w-[90px]">{row.label}</span>
                    <span className="text-foreground break-all">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {params.length > 0 && (
              <div className="pt-4 border-t border-border/40 space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground">{t("queryTable")}</h4>
                <div className="space-y-1.5">
                  {params.map((p, i) => (
                    <div
                      key={i}
                      className="flex gap-2 text-xs font-mono bg-muted/40 p-2 rounded border border-border/30"
                    >
                      <span className="text-primary font-semibold">{p.key}</span>
                      <span className="text-muted-foreground">=</span>
                      <span className="text-foreground break-all">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

const labelKeyMap = {
  protocol: "protocol",
  auth: "auth",
  host: "host",
  port: "port",
  pathname: "pathname",
  hash: "hash",
  origin: "origin",
} as const
