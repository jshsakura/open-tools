"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  acquisitionTaxMultiHome,
  brokerageFee as calcBrokerage,
  capitalGainsTax,
  sqmToPyeong,
} from "./kr-real-estate.utils"

export function KrRealEstate() {
  const t = useTranslations("KrRealEstate.ui")
  const [sqm, setSqm] = useState(84)
  const [price, setPrice] = useState(600_000_000)
  const [homeCount, setHomeCount] = useState(1)

  // 양도소득세 inputs
  const [salePrice, setSalePrice] = useState(1_600_000_000)
  const [purchasePrice, setPurchasePrice] = useState(1_000_000_000)
  const [yearsHeld, setYearsHeld] = useState(5)
  const [isOneHomeExempt, setIsOneHomeExempt] = useState(true)

  const pyung = sqmToPyeong(sqm).toFixed(1)
  const brokerage = calcBrokerage(price)
  const acquisitionTax = acquisitionTaxMultiHome(price, homeCount)

  const capitalGains = capitalGainsTax({
    salePrice,
    purchasePrice,
    yearsHeld,
    isOneHomeExempt,
  })

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

          <div className="pt-1">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("homeCount")}</label>
            <Select value={String(homeCount)} onValueChange={(v) => setHomeCount(Number(v))}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("homeCount1")}</SelectItem>
                <SelectItem value="2">{t("homeCount2")}</SelectItem>
                <SelectItem value="3">{t("homeCount3")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

        <div className="space-y-3 border-t pt-4">
          <div className="text-xs font-semibold text-muted-foreground">{t("capitalGainsTitle")}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("salePrice")}</label>
              <Input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="bg-background/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("purchasePrice")}</label>
              <Input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="bg-background/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("yearsHeld")}</label>
              <Input
                type="number"
                value={yearsHeld}
                onChange={(e) => setYearsHeld(Number(e.target.value))}
                className="bg-background/50"
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Switch
                id="oneHomeExempt"
                checked={isOneHomeExempt}
                onCheckedChange={setIsOneHomeExempt}
              />
              <Label htmlFor="oneHomeExempt" className="text-xs text-muted-foreground">
                {t("oneHomeExempt")}
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-background/50 border rounded p-3">
              <div className="text-xs text-muted-foreground">{t("capitalGain")}</div>
              <div className="text-base font-bold">{capitalGains.gain.toLocaleString()} 원</div>
            </div>
            <div className="bg-background/50 border rounded p-3">
              <div className="text-xs text-muted-foreground">{t("capitalGainsTax")}</div>
              <div className="text-base font-bold text-primary">{capitalGains.tax.toLocaleString()} 원</div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">{t("capitalGainsNote")}</div>
        </div>
      </CardContent>
    </Card>
  )
}
