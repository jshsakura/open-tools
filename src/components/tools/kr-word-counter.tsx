"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  countBytes,
  countCharsNoSpaces,
  countCharsWithSpaces,
  countLines,
  countWords,
} from "./kr-word-counter.utils"

export function KrWordCounter() {
  const t = useTranslations("KrWordCounter.ui")
  const [text, setText] = useState("")
  const [byteRule, setByteRule] = useState("3")

  const spaceInc = countCharsWithSpaces(text)
  const spaceExc = countCharsNoSpaces(text)
  const wordCount = countWords(text)
  const lineCount = countLines(text)

  const calculateBytes = () => countBytes(text, Number(byteRule))

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 space-y-4">
        <div className="flex gap-2 mb-2">
          <Button variant={byteRule === "3" ? "default" : "outline"} onClick={() => setByteRule("3")} className="flex-1 text-xs">UTF-8</Button>
          <Button variant={byteRule === "2" ? "default" : "outline"} onClick={() => setByteRule("2")} className="flex-1 text-xs">EUC-KR(레거시)</Button>
        </div>
        <Textarea placeholder={t("inputPlaceholder")} value={text} onChange={(e) => setText(e.target.value)} className="min-h-[220px] bg-background/50" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-xs">
          <div>{t("spaceInc")}: {spaceInc}</div>
          <div>{t("spaceExc")}: {spaceExc}</div>
          <div>{t("wordCount")}: {wordCount}</div>
          <div>{t("lineCount")}: {lineCount}</div>
          <div>{t("byteCount")}: {calculateBytes()} Byte</div>
        </div>
      </CardContent>
    </Card>
  )
}