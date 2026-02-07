"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
import { LoremIpsum } from "lorem-ipsum"

// Simple Korean Lorem data to avoid huge dependency if possible, or use a library.
// For K-Special, users like "다람쥐 헌 쳇바퀴..." style or modern "키위" style.
const KO_WORDS = [
    "키위", "참새", "다람쥐", "호랑이", "사자", "토끼", "거북이", "두루미",
    "사랑", "행복", "개발", "코딩", "리액트", "넥스트", "배포", "성공",
    "학교", "종이", "비행기", "하늘", "바람", "구름", "별", "달", "우주",
    "생각", "마음", "기쁨", "슬픔", "도전", "열정", "희망", "미래", "과거"
]

const KO_SENTENCES = [
    "다람쥐 헌 쳇바퀴에 타고파.",
    "내가 그린 기린 그림은 잘 그린 기린 그림이고 네가 그린 기린 그림은 못 그린 기린 그림이다.",
    "간장 공장 공장장은 강 공장장이고 된장 공장 공장장은 공 공장장이다.",
    "저기 저 뜀틀이 내가 뛸 뜀틀인가 내가 안 뛸 뜀틀인가.",
    "들의 콩깍지는 깐 콩깍지인가 안 깐 콩깍지인가.",
    "작은 별들이 밤하늘을 수놓고 있었다.",
    "바람이 불어오는 곳 그곳으로 가네.",
    "모든 국민은 법 앞에 평등하다.",
    "대한민국은 민주공화국이다.",
    "새로운 시작은 늘 설레게 한다."
]

export function LoremGenerator() {
    const t = useTranslations("TextTools.LoremGenerator")
    const [count, setCount] = useState(3)
    const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs")
    const [lang, setLang] = useState<"en" | "ko">("en")
    const [output, setOutput] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const browserLang = navigator.language.toLowerCase()
            if (browserLang.startsWith("ko")) {
                setLang("ko")
            } else {
                setLang("en")
            }
        }
    }, [])

    const generateLorem = () => {
        let text = ""

        if (lang === "en") {
            const lorem = new LoremIpsum({
                sentencesPerParagraph: {
                    max: 8,
                    min: 4
                },
                wordsPerSentence: {
                    max: 16,
                    min: 4
                }
            })

            if (unit === "paragraphs") {
                text = lorem.generateParagraphs(count)
            } else if (unit === "sentences") {
                text = lorem.generateSentences(count)
            } else {
                text = lorem.generateWords(count)
            }
        } else {
            // Korean Logic
            if (unit === "words") {
                const words = []
                for (let i = 0; i < count; i++) {
                    const rand = Math.floor(Math.random() * KO_WORDS.length)
                    words.push(KO_WORDS[rand])
                }
                text = words.join(" ")
            } else if (unit === "sentences") {
                const sentences = []
                for (let i = 0; i < count; i++) {
                    const rand = Math.floor(Math.random() * KO_SENTENCES.length)
                    sentences.push(KO_SENTENCES[rand])
                }
                text = sentences.join(" ")
            } else {
                // Paragraphs
                const paragraphs = []
                for (let i = 0; i < count; i++) {
                    const sentences = []
                    const sCount = Math.floor(Math.random() * 4) + 3 // 3-6 sentences
                    for (let j = 0; j < sCount; j++) {
                        const rand = Math.floor(Math.random() * KO_SENTENCES.length)
                        sentences.push(KO_SENTENCES[rand])
                    }
                    paragraphs.push(sentences.join(" "))
                }
                text = paragraphs.join("\n\n")
            }
        }

        setOutput(text)
    }

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-8 bg-secondary/20 p-6 rounded-xl">
                <div className="space-y-4">
                    <Label>{t("language")}</Label>
                    <RadioGroup defaultValue="en" value={lang} onValueChange={(v: "en" | "ko") => setLang(v)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="en" id="en" />
                            <Label htmlFor="en">{t("en")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ko" id="ko" />
                            <Label htmlFor="ko">{t("ko")}</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-4">
                    <Label>{t("unit")}</Label>
                    <RadioGroup defaultValue="paragraphs" value={unit} onValueChange={(v: any) => setUnit(v)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paragraphs" id="paragraphs" />
                            <Label htmlFor="paragraphs">{t("paragraphs")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sentences" id="sentences" />
                            <Label htmlFor="sentences">{t("sentences")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="words" id="words" />
                            <Label htmlFor="words">{t("words")}</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-4 sm:col-span-2">
                    <div className="flex justify-between">
                        <Label>{t("count")}: {count}</Label>
                    </div>
                    <Slider
                        value={[count]}
                        onValueChange={(v) => setCount(v[0])}
                        min={1}
                        max={50}
                        step={1}
                        className="w-full"
                    />
                </div>
            </div>

            <Button size="lg" className="w-full" onClick={generateLorem}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {t("generateButton")}
            </Button>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>{t("outputLabel")}</Label>
                    <Button size="sm" variant="ghost" onClick={copyToClipboard} disabled={!output}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                <Textarea
                    className="min-h-[300px] font-serif text-lg leading-relaxed bg-muted/30"
                    value={output}
                    readOnly
                    placeholder={t("outputPlaceholder")}
                />
            </div>
        </div>
    )
}
