"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { validateBusinessNumber, validateRrn } from "./kr-id-validator.utils"

export function KrIdValidator() {
  const t = useTranslations("KrIdValidator.ui")
  const [jumin, setJumin] = useState("")
  const [business, setBusiness] = useState("")
  const [jResult, setJResult] = useState<boolean | null>(null)
  const [bResult, setBResult] = useState<boolean | null>(null)

  const validateJumin = () => {
    setJResult(validateRrn(jumin))
  }

  const validateBusiness = () => {
    setBResult(validateBusinessNumber(business))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs font-semibold mb-1 text-muted-foreground">{t("juminLabel")}</div>
          <Input value={jumin} onChange={(e) => setJumin(e.target.value)} placeholder="주민등록번호" className="bg-background/50" />
          <Button onClick={validateJumin} className="mt-2 text-xs">{t("validateBtn")}</Button>
          {jResult !== null && <div className={`mt-1 text-xs ${jResult ? "text-green-500" : "text-red-500"}`}>{jResult ? t("validResult") : t("invalidResult")}</div>}
        </div>
        <div>
          <div className="text-xs font-semibold mb-1 text-muted-foreground">{t("businessLabel")}</div>
          <Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="사업자등록번호" className="bg-background/50" />
          <Button onClick={validateBusiness} className="mt-2 text-xs">{t("validateBtn")}</Button>
          {bResult !== null && <div className={`mt-1 text-xs ${bResult ? "text-green-500" : "text-red-500"}`}>{bResult ? t("validResult") : t("invalidResult")}</div>}
        </div>
      </CardContent>
    </Card>
  )
}