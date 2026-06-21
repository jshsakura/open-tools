"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { BadgePercent, Layers, Receipt, Tags, Wallet } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { computeDiscount } from "./discount-calculator.utils"

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function DiscountCalculatorTool() {
  const t = useTranslations("DiscountCalculator")
  const [originalPrice, setOriginalPrice] = useState("120")
  const [discountPercent, setDiscountPercent] = useState("20")
  const [extraDiscountPercent, setExtraDiscountPercent] = useState("10")
  const [extraCoupon, setExtraCoupon] = useState("5")
  const [quantity, setQuantity] = useState("1")
  const [taxPercent, setTaxPercent] = useState("0")

  const result = useMemo(() => {
    return computeDiscount({
      originalPrice: parseFloat(originalPrice),
      discounts: [parseFloat(discountPercent), parseFloat(extraDiscountPercent) || 0],
      coupon: parseFloat(extraCoupon) || 0,
      taxPercent: parseFloat(taxPercent) || 0,
      quantity: parseInt(quantity, 10) || 0,
    })
  }, [discountPercent, extraCoupon, extraDiscountPercent, originalPrice, quantity, taxPercent])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4 text-emerald-500" />
              {t("originalPrice")}
            </Label>
            <Input type="number" min="0" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <BadgePercent className="h-4 w-4 text-rose-500" />
              {t("discountPercent")}
            </Label>
            <Input type="number" min="0" max="100" step="0.1" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Layers className="h-4 w-4 text-rose-500" />
              {t("extraDiscountPercent")}
            </Label>
            <Input type="number" min="0" max="100" step="0.1" value={extraDiscountPercent} onChange={(e) => setExtraDiscountPercent(e.target.value)} />
            <p className="text-xs text-muted-foreground">{t("extraDiscountHint")}</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Tags className="h-4 w-4 text-violet-500" />
              {t("extraCoupon")}
            </Label>
            <Input type="number" min="0" step="0.01" value={extraCoupon} onChange={(e) => setExtraCoupon(e.target.value)} />
            <p className="text-xs text-muted-foreground">{t("couponHint")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("quantity")}</Label>
              <Input type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("taxPercent")}</Label>
              <Input type="number" min="0" step="0.1" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-rose-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("unitPrice")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-rose-500">{result ? formatNumber(result.unitAfterCoupon) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-sky-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("subtotal")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">{result ? formatNumber(result.subtotal) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-amber-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("taxAmount")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-amber-500">{result ? formatNumber(result.taxAmount) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-emerald-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("finalTotal")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">{result ? formatNumber(result.finalTotal) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-violet-500/10 p-3">
                <Receipt className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result
                    ? t("summaryStacked", {
                        saved: formatNumber(result.totalSaved),
                        percent: result.effectivePercentOff.toFixed(1),
                      })
                    : t("invalidInput")}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
