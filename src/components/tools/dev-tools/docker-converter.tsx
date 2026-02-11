"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Check, ArrowRightLeft, Container, Trash2 } from "lucide-react"
import { toast } from "sonner"
// import { composerize } from "composerize-ts"

export function DockerConverter() {
    const t = useTranslations("DevTools")
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [copied, setCopied] = useState(false)

    const convert = () => {
        if (!input) {
            toast.error(t("DockerConverter.errorEmpty"))
            return
        }

        try {
            // Trim and ensure it starts with docker run if possible, though composerize handles loose inputs
            // const result = composerize(input.trim())
            // setOutput(result.yaml)
            // toast.success(t("DockerConverter.success"))
            toast.error("This feature is temporarily disabled due to a build issue.")
        } catch (e: any) {
            console.error(e)
            toast.error(t("DockerConverter.error") + ": " + e.message)
        }
    }

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        toast.success(t("DockerConverter.copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    const clearInput = () => {
        setInput("")
        setOutput("")
    }

    return (
        <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-4 flex flex-col h-full">
                <div className="flex justify-between items-center">
                    <Label>{t("DockerConverter.inputLabel")}</Label>
                    <Button size="sm" variant="ghost" onClick={clearInput} disabled={!input}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <Textarea
                    className="flex-1 font-mono text-sm resize-none min-h-[300px] w-full max-w-full overflow-x-auto"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock -d nginx"
                />
                <Button onClick={convert} className="w-full">
                    <Container className="mr-2 h-4 w-4" />
                    {t("DockerConverter.convertButton")}
                </Button>
            </div>

            <div className="space-y-4 flex flex-col h-full">
                <div className="flex justify-between items-center">
                    <Label>{t("DockerConverter.outputLabel")}</Label>
                    <Button size="sm" variant="ghost" onClick={copyToClipboard} disabled={!output}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                <Textarea
                    className="flex-1 font-mono text-sm resize-none bg-muted min-h-[350px] w-full max-w-full overflow-x-auto"
                    value={output}
                    readOnly
                    placeholder={t("DockerConverter.outputPlaceholder")}
                />
            </div>
        </div>
    )
}
