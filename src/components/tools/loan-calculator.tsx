"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  Table,
  Calendar,
  Wallet,
  Percent,
  TrendingDown,
  PlusCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { amortize, type AmortizationRow } from "./loan-calculator.utils"

type RepaymentMethod = "equal" | "principal" | "lump"

interface ScheduleResult {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  schedule: AmortizationRow[]
  payoffMonths: number
}

export function LoanCalculator() {
  const t = useTranslations("LoanCalculator")
  const [amount, setAmount] = useState<string>("10000000") // 10 million default
  const [rate, setRate] = useState<string>("4.5")
  const [term, setTerm] = useState<string>("12")
  const [method, setMethod] = useState<RepaymentMethod>("equal")
  const [extra, setExtra] = useState<string>("0")

  const computed = useMemo(() => {
    const p = parseFloat(amount) || 0
    const annualRate = parseFloat(rate) || 0
    const r = annualRate / 100 / 12
    const n = parseInt(term) || 0
    const extraPayment = method === "equal" ? Math.max(0, parseFloat(extra) || 0) : 0

    if (p <= 0 || n <= 0) {
      return { result: null as ScheduleResult | null, savings: null as null | { monthsSaved: number; interestSaved: number } }
    }

    if (method === "equal") {
      const withExtra = amortize(p, annualRate, n, extraPayment)
      if (!withExtra) return { result: null, savings: null }

      const result: ScheduleResult = {
        monthlyPayment: withExtra.monthlyPayment,
        totalInterest: withExtra.totalInterest,
        totalPayment: withExtra.totalPayment,
        schedule: withExtra.schedule,
        payoffMonths: withExtra.payoffMonths,
      }

      let savings: { monthsSaved: number; interestSaved: number } | null = null
      if (extraPayment > 0) {
        const base = amortize(p, annualRate, n, 0)
        if (base) {
          savings = {
            monthsSaved: base.payoffMonths - withExtra.payoffMonths,
            interestSaved: base.totalInterest - withExtra.totalInterest,
          }
        }
      }

      return { result, savings }
    }

    // Equal-principal and lump-sum remain inline (no extra-payment support).
    const schedule: AmortizationRow[] = []
    let totalInterest = 0
    let balance = p

    if (method === "principal") {
      const monthlyPrincipal = p / n
      for (let i = 1; i <= n; i++) {
        const interest = balance * r
        const payment = monthlyPrincipal + interest
        balance -= monthlyPrincipal
        totalInterest += interest
        schedule.push({ month: i, payment, principal: monthlyPrincipal, interest, balance: Math.max(0, balance) })
      }
    } else {
      const monthlyInterest = p * r
      totalInterest = monthlyInterest * n
      for (let i = 1; i <= n; i++) {
        const isLast = i === n
        schedule.push({
          month: i,
          payment: isLast ? p + monthlyInterest : monthlyInterest,
          principal: isLast ? p : 0,
          interest: monthlyInterest,
          balance: isLast ? 0 : p,
        })
      }
    }

    const result: ScheduleResult = {
      monthlyPayment: schedule[0]?.payment || 0,
      totalInterest,
      totalPayment: p + totalInterest,
      schedule,
      payoffMonths: schedule.length,
    }
    return { result, savings: null }
  }, [amount, rate, term, method, extra])

  const result = computed.result
  const savings = computed.savings

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat().format(Math.round(val))
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <GlassCard className="p-6 space-y-6 lg:col-span-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-500" />
                {t("amount")}
              </Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-500" />
                {t("rate")}
              </Label>
              <Input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                {t("term")}
              </Label>
              <Input
                type="number"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-purple-500" />
                {t("method")}
              </Label>
              <Select value={method} onValueChange={(v) => setMethod(v as RepaymentMethod)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">{t("equal")}</SelectItem>
                  <SelectItem value="principal">{t("principal")}</SelectItem>
                  <SelectItem value="lump">{t("lump")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {method === "equal" ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-teal-500" />
                  {t("extraPayment")}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">{t("extraPaymentHint")}</p>
              </div>
            ) : null}
          </div>
        </GlassCard>

        {/* Results Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center gap-1 border-emerald-500/20">
              <span className="text-xs font-medium text-muted-foreground">{t("monthlyPayment")}</span>
              <span className="text-2xl font-bold text-emerald-600 tabular-nums">
                {result ? formatCurrency(result.monthlyPayment) : "0"}
              </span>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center gap-1 border-blue-500/20">
              <span className="text-xs font-medium text-muted-foreground">{t("totalInterest")}</span>
              <span className="text-2xl font-bold text-blue-600 tabular-nums">
                {result ? formatCurrency(result.totalInterest) : "0"}
              </span>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center gap-1 border-purple-500/20">
              <span className="text-xs font-medium text-muted-foreground">{t("totalPayment")}</span>
              <span className="text-2xl font-bold text-purple-600 tabular-nums">
                {result ? formatCurrency(result.totalPayment) : "0"}
              </span>
            </GlassCard>
          </div>

          {savings && (savings.monthsSaved > 0 || savings.interestSaved > 0) ? (
            <GlassCard className="p-4 border-teal-500/30 bg-teal-500/5">
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-teal-500" />
                <p className="text-sm font-medium leading-6">
                  {t("savingsSummary", {
                    months: savings.monthsSaved,
                    interest: formatCurrency(savings.interestSaved),
                  })}
                </p>
              </div>
            </GlassCard>
          ) : null}

          {/* Schedule Table */}
          <GlassCard className="p-0 overflow-hidden border-border/50">
            <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center gap-2">
              <Table className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">{t("schedule")}</h3>
            </div>
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-background/95 backdrop-blur-sm shadow-sm">
                  <tr className="border-b border-border/50">
                    <th className="p-3 font-medium text-muted-foreground">{t("month")}</th>
                    <th className="p-3 font-medium text-muted-foreground text-right">{t("payment")}</th>
                    <th className="p-3 font-medium text-muted-foreground text-right">{t("interest")}</th>
                    <th className="p-3 font-medium text-muted-foreground text-right">{t("balance")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {result?.schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono">{row.month}</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(row.payment)}</td>
                      <td className="p-3 text-right tabular-nums text-rose-500">{formatCurrency(row.interest)}</td>
                      <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
