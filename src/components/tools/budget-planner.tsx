"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { summarize } from "./budget-planner.utils"

type BudgetItem = { label: string; type: "income" | "expense"; amount: number }

const STORAGE_KEY = "budget-planner-items"
const DEFAULT_ITEMS: BudgetItem[] = [{ label: "월급", type: "income", amount: 3000000 }]

export function BudgetPlanner() {
  const t = useTranslations("BudgetPlanner.ui")
  const [items, setItems] = useState<BudgetItem[]>(DEFAULT_ITEMS)
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore corrupted storage
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore quota errors
    }
  }, [items, loaded])

  const { income: totalIncome, expense: totalExpense, balance } = summarize(items)

  const handleAddItem = () => {
    if (!label || !amount) return
    setItems([...items, { label, type, amount: Math.abs(Number(amount)) }])
    setLabel("")
    setAmount("")
  }

  const handleDelete = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("category")} className="bg-background/50" />
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t("amount")} className="bg-background/50" />
          <div className="flex gap-2">
            <Button variant={type === "income" ? "default" : "outline"} onClick={() => setType("income")} className="flex-1 text-xs">{t("income")}</Button>
            <Button variant={type === "expense" ? "default" : "outline"} onClick={() => setType("expense")} className="flex-1 text-xs">{t("expense")}</Button>
          </div>
          <Button onClick={handleAddItem} className="w-full text-xs font-bold py-1">{t("addExpense")}</Button>

          <div className="space-y-1 pt-2 text-xs">
            <div className="font-bold text-muted-foreground">{t("totalStatus")}</div>
            <div className="flex justify-between"><span>{t("income")}</span><span className="text-green-500">+{totalIncome.toLocaleString()} 원</span></div>
            <div className="flex justify-between"><span>{t("expense")}</span><span className="text-red-500">-{totalExpense.toLocaleString()} 원</span></div>
            <div className="flex justify-between font-bold border-t pt-1"><span>{t("balance")}</span><span className={balance >= 0 ? "text-green-500" : "text-red-500"}>{balance.toLocaleString()} 원</span></div>
            <div className="flex h-2 rounded overflow-hidden bg-muted mt-1">
              <div className="bg-green-500" style={{ width: `${totalIncome + totalExpense ? (totalIncome / (totalIncome + totalExpense)) * 100 : 0}%` }} />
              <div className="bg-red-500" style={{ width: `${totalIncome + totalExpense ? (totalExpense / (totalIncome + totalExpense)) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 text-xs bg-background/50 border p-2 rounded">
              <span className="truncate">{item.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className={item.type === "income" ? "text-green-500" : "text-red-500"}>
                  {item.type === "income" ? "+" : "-"}{item.amount.toLocaleString()} 원
                </span>
                <button onClick={() => handleDelete(idx)} className="text-muted-foreground hover:text-red-500" aria-label={t("delete")}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
