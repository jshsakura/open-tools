"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRightLeft, Spline, Type } from "lucide-react"
import { toast } from "sonner"
// @ts-ignore
import { disassemble, assemble, josa } from "es-hangul"

export function HangulProcessor() {
    const t = useTranslations("TextTools")

    // Disassemble State
    const [disInput, setDisInput] = useState("")
    const [disOutput, setDisOutput] = useState("")

    // Assemble State
    const [assInput, setAssInput] = useState("")
    const [assOutput, setAssOutput] = useState("")

    // Josa State
    const [josaInput, setJosaInput] = useState("")
    const [josaType, setJosaType] = useState<"eun/neun" | "i/ga" | "eul/reul">("eun/neun")
    const [josaOutput, setJosaOutput] = useState("")

    const handleDisassemble = (input: string) => {
        if (!input) {
            setDisOutput("")
            return
        }
        try {
            // disassemble in v2.x returns a string or array of characters.
            // We ensure it's a string for display.
            const result = disassemble(input)
            setDisOutput(Array.isArray(result) ? result.join("") : result)
        } catch (e) {
            console.error(e)
            // toast.error("Error processing text")
        }
    }

    const onDisInputChange = (val: string) => {
        setDisInput(val)
        handleDisassemble(val)
    }

    const handleAssemble = () => {
        if (!assInput) return
        try {
            const result = assemble(assInput.split(""))
            setAssOutput(result)
        } catch (e) {
            console.error(e)
            toast.error("Error assembling text")
        }
    }

    const handleJosa = () => {
        if (!josaInput) return
        try {
            let result = ""
            switch (josaType) {
                case "eun/neun":
                    result = josa(josaInput, "은/는")
                    break
                case "i/ga":
                    result = josa(josaInput, "이/가")
                    break
                case "eul/reul":
                    result = josa(josaInput, "을/를")
                    break
            }
            setJosaOutput(result)
        } catch (e) {
            console.error(e)
            toast.error("Error processing josa")
        }
    }

    return (
        <Tabs defaultValue="disassemble" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="disassemble" className="rounded-md">
                    <Spline className="w-4 h-4 mr-2" />
                    {t("HangulProcessor.tabs.disassemble")}
                </TabsTrigger>
                <TabsTrigger value="assemble" className="rounded-md">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    {t("HangulProcessor.tabs.assemble")}
                </TabsTrigger>
                <TabsTrigger value="josa" className="rounded-md">
                    <Type className="w-4 h-4 mr-2" />
                    {t("HangulProcessor.tabs.josa")}
                </TabsTrigger>
            </TabsList>

            {/* Disassemble Tab */}
            <TabsContent value="disassemble" className="space-y-6">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>{t("HangulProcessor.disassemble.inputLabel")}</Label>
                        <div className="flex gap-2">
                            <Input
                                value={disInput}
                                onChange={(e) => onDisInputChange(e.target.value)}
                                placeholder="안녕하세요"
                                className="text-lg"
                            />
                            <Button onClick={() => handleDisassemble(disInput)}>{t("HangulProcessor.convert")}</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("HangulProcessor.disassemble.outputLabel")}</Label>
                        <div className="p-4 bg-muted rounded-lg font-mono text-lg min-h-[60px] flex items-center">
                            {disOutput}
                        </div>
                    </div>
                </div>
            </TabsContent>

            {/* Assemble Tab */}
            <TabsContent value="assemble" className="space-y-6">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>{t("HangulProcessor.assemble.inputLabel")}</Label>
                        <div className="flex gap-2">
                            <Input
                                value={assInput}
                                onChange={(e) => setAssInput(e.target.value)}
                                placeholder="ㅇㅏㄴㄴㅕㅇㅎㅏㅅㅔㅇㅛ"
                                className="text-lg"
                            />
                            <Button onClick={handleAssemble}>{t("HangulProcessor.convert")}</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("HangulProcessor.assemble.outputLabel")}</Label>
                        <div className="p-4 bg-muted rounded-lg font-mono text-lg min-h-[60px] flex items-center">
                            {assOutput}
                        </div>
                    </div>
                </div>
            </TabsContent>

            {/* Josa Tab */}
            <TabsContent value="josa" className="space-y-6">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>{t("HangulProcessor.josa.inputLabel")}</Label>
                        <div className="flex gap-2">
                            <Input
                                value={josaInput}
                                onChange={(e) => setJosaInput(e.target.value)}
                                placeholder="사과"
                                className="text-lg"
                            />
                            <select
                                className="px-3 py-2 rounded-md border bg-background"
                                value={josaType}
                                // @ts-ignore
                                onChange={(e) => setJosaType(e.target.value)}
                            >
                                <option value="eun/neun">은/는 (Eun/Neun)</option>
                                <option value="i/ga">이/가 (I/Ga)</option>
                                <option value="eul/reul">을/를 (Eul/Reul)</option>
                            </select>
                            <Button onClick={handleJosa}>{t("HangulProcessor.check")}</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("HangulProcessor.josa.outputLabel")}</Label>
                        <div className="p-4 bg-muted rounded-lg font-mono text-lg min-h-[60px] flex items-center text-primary font-bold">
                            {josaOutput}
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    )
}
