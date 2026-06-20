"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { filterCodes } from "./http-status-codes.utils"

export function HttpStatusCodes() {
  const t = useTranslations("HttpStatusCodes.ui")
  const [search, setSearch] = useState("")

  const filtered = filterCodes(search)

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 space-y-4">
        <Input placeholder={t("searchCode")} value={search} onChange={(e) => setSearch(e.target.value)} className="bg-background/50" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Card key={item.code} className="bg-muted/40">
              <CardContent className="py-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-bold font-mono text-primary">{item.code}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{item.name}</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground pt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}