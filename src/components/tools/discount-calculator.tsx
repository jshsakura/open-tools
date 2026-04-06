"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { BadgePercent, Receipt, Tags, Wallet } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function DiscountCalculatorTool() {
  const t = useTranslations("DiscountCalculator")
  const [originalPrice, setOriginalPrice] = useState("120")
  const [discountPercent, setDiscountPercent] = useState("20")
  const [extraCoupon, setExtraCoupon] = useState("5")

  const result = useMemo(() => {
    const price = parseFloat(originalPrice)
    const discount = parseFloat(discountPercent)
    const coupon = parseFloat(extraCoupon) || 0

    if (!Number.isFinite(price) || !Number.isFinite(discount) || price < 0 || discount < 0) {
      return null
    }

    const percentOff = Math.min(discount, 100)
    const discountAmount = price * (percentOff / 100)
    const priceAfterDiscount = Math.max(0, price - discountAmount)
    const finalPrice = Math.max(0, priceAfterDiscount - coupon)
    const totalSaved = Math.max(0, price - finalPrice)
    const totalSavedPercent = price > 0 ? (totalSaved / price) * 100 : 0

    return {
      discountAmount,
      priceAfterDiscount,
      finalPrice,
      totalSaved,
      totalSavedPercent,
    }
  }, [discountPercent, extraCoupon, originalPrice])

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
              <Tags className="h-4 w-4 text-violet-500" />
              {t("extraCoupon")}
            </Label>
            <Input type="number" min="0" step="0.01" value={extraCoupon} onChange={(e) => setExtraCoupon(e.target.value)} />
            <p className="text-xs text-muted-foreground">{t("couponHint")}</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-rose-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("discountAmount")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-rose-500">{result ? formatNumber(result.discountAmount) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-emerald-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("finalPrice")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">{result ? formatNumber(result.finalPrice) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-sky-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("priceAfterDiscount")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">{result ? formatNumber(result.priceAfterDiscount) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("totalSaved")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-violet-500">{result ? formatNumber(result.totalSaved) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-amber-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3">
                <Receipt className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result
                    ? t("summary", {
                        saved: formatNumber(result.totalSaved),
                        percent: result.totalSavedPercent.toFixed(1),
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
