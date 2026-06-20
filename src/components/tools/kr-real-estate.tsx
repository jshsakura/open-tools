"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  acquisitionTax as calcAcquisitionTax,
  brokerageFee as calcBrokerage,
  sqmToPyeong,
} from "./kr-real-estate.utils"

export function KrRealEstate() {
  const t = useTranslations("KrRealEstate.ui")
  const [sqm, setSqm] = useState(84)
  const [price, setPrice] = useState(600_000_000)

  const pyung = sqmToPyeong(sqm).toFixed(1)
  const brokerage = calcBrokerage(price)
  const acquisitionTax = calcAcquisitionTax(price)

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">{t("areaSize")}</div>
          <Input type="number" value={sqm} onChange={(e) => setSqm(Number(e.target.value))} className="bg-background/50" />
          <div className="text-sm font-bold">{t("pyungCount")}: {pyung} 평</div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="text-xs font-semibold text-muted-foreground">{t("dealAmount")}</div>
          <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="bg-background/50" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-background/50 border rounded p-3">
              <div className="text-xs text-muted-foreground">{t("commission")}</div>
              <div className="text-base font-bold text-primary">{brokerage.toLocaleString()} 원</div>
            </div>
            <div className="bg-background/50 border rounded p-3">
              <div className="text-xs text-muted-foreground">{t("acquisitionTax")}</div>
              <div className="text-base font-bold text-primary">{acquisitionTax.toLocaleString()} 원</div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">{t("taxNote")}</div>
        </div>
      </CardContent>
    </Card>
  )
}
