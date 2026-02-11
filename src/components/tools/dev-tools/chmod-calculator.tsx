"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

type Permission = {
    read: boolean
    write: boolean
    execute: boolean
}

export function ChmodCalculator() {
    const t = useTranslations("DevTools.ChmodCalculator")

    const [owner, setOwner] = useState<Permission>({ read: true, write: true, execute: true })
    const [group, setGroup] = useState<Permission>({ read: true, write: false, execute: true })
    const [publicPerm, setPublicPerm] = useState<Permission>({ read: true, write: false, execute: true })

    const [octal, setOctal] = useState("755")
    const [symbolic, setSymbolic] = useState("-rwxr-xr-x")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        calculate()
    }, [owner, group, publicPerm])

    const calculate = () => {
        const o = (owner.read ? 4 : 0) + (owner.write ? 2 : 0) + (owner.execute ? 1 : 0)
        const g = (group.read ? 4 : 0) + (group.write ? 2 : 0) + (group.execute ? 1 : 0)
        const p = (publicPerm.read ? 4 : 0) + (publicPerm.write ? 2 : 0) + (publicPerm.execute ? 1 : 0)

        setOctal(`${o}${g}${p}`)

        const sym = [
            "-",
            owner.read ? "r" : "-", owner.write ? "w" : "-", owner.execute ? "x" : "-",
            group.read ? "r" : "-", group.write ? "w" : "-", group.execute ? "x" : "-",
            publicPerm.read ? "r" : "-", publicPerm.write ? "w" : "-", publicPerm.execute ? "x" : "-"
        ].join("")

        setSymbolic(sym)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    const PermissionGroup = ({ label, state, setState }: { label: string, state: Permission, setState: any }) => (
        <div className="space-y-4 p-4 sm:p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="font-semibold text-center break-words">{label}</h3>
            <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <Checkbox
                        id={`${label}-read`}
                        checked={state.read}
                        onCheckedChange={(checked) => setState({ ...state, read: !!checked })}
                    />
                    <Label htmlFor={`${label}-read`} className="text-sm sm:text-base">{t("read")} (4)</Label>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <Checkbox
                        id={`${label}-write`}
                        checked={state.write}
                        onCheckedChange={(checked) => setState({ ...state, write: !!checked })}
                    />
                    <Label htmlFor={`${label}-write`} className="text-sm sm:text-base">{t("write")} (2)</Label>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <Checkbox
                        id={`${label}-execute`}
                        checked={state.execute}
                        onCheckedChange={(checked) => setState({ ...state, execute: !!checked })}
                    />
                    <Label htmlFor={`${label}-execute`} className="text-sm sm:text-base">{t("execute")} (1)</Label>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PermissionGroup label={t("owner")} state={owner} setState={setOwner} />
                <PermissionGroup label={t("group")} state={group} setState={setGroup} />
                <PermissionGroup label={t("public")} state={publicPerm} setState={setPublicPerm} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>{t("octalLabel")}</Label>
                    <div className="relative">
                        <Input value={octal} readOnly className="text-2xl font-mono h-14 bg-muted text-center" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => copyToClipboard(octal)}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>{t("symbolicLabel")}</Label>
                    <div className="relative">
                        <Input value={symbolic} readOnly className="text-2xl font-mono h-14 bg-muted text-center" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => copyToClipboard(symbolic)}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
