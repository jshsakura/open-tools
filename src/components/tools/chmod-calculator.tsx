"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GlassCard } from "@/components/ui/glass-card"
import {
  EMPTY_PERMS,
  octalToPerms,
  permsToOctal,
  permsToSymbolic,
  type PermissionSet,
  type Perms,
} from "./chmod-calculator.utils"

type RoleKey = "owner" | "group" | "others"
type PermKey = keyof PermissionSet

const ROLES: RoleKey[] = ["owner", "group", "others"]
const PERMISSIONS: PermKey[] = ["read", "write", "execute"]

const SPECIAL_KEYS = ["setuid", "setgid", "sticky"] as const
type SpecialKey = (typeof SPECIAL_KEYS)[number]

export function ChmodCalculator() {
  const t = useTranslations("ChmodCalculator")
  const [perms, setPerms] = useState<Perms>(() => octalToPerms("755") ?? EMPTY_PERMS)
  const [octalDraft, setOctalDraft] = useState("755")
  const [octalError, setOctalError] = useState<string | null>(null)

  const octal = permsToOctal(perms)
  const symbolic = permsToSymbolic(perms)
  const command = `chmod ${octal} file`

  const applyPerms = (next: Perms) => {
    setPerms(next)
    setOctalDraft(permsToOctal(next))
    setOctalError(null)
  }

  const togglePermission = (role: RoleKey, perm: PermKey, value: boolean) => {
    applyPerms({
      ...perms,
      [role]: { ...perms[role], [perm]: value },
    })
  }

  const toggleSpecial = (key: SpecialKey, value: boolean) => {
    applyPerms({
      ...perms,
      special: { ...perms.special, [key]: value },
    })
  }

  const onOctalChange = (value: string) => {
    const cleaned = value.replace(/[^0-7]/g, "").slice(0, 4)
    setOctalDraft(cleaned)
    if (cleaned === "") {
      setOctalError(null)
      return
    }
    const parsed = octalToPerms(cleaned)
    if (!parsed) {
      setOctalError(t("errorInvalidOctal"))
      return
    }
    setOctalError(null)
    setPerms(parsed)
  }

  const copy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(t("copied"))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="space-y-6 p-6">
        <p className="text-sm font-medium">{t("gridTitle")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="p-2 text-left font-medium">{t("roleHeader")}</th>
                {PERMISSIONS.map((perm) => (
                  <th key={perm} className="p-2 font-medium">
                    {t(perm)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role} className="border-t border-border/40">
                  <td className="p-2 text-left font-medium">{t(role)}</td>
                  {PERMISSIONS.map((perm) => {
                    const id = `${role}-${perm}`
                    return (
                      <td key={perm} className="p-2">
                        <input
                          id={id}
                          type="checkbox"
                          checked={perms[role][perm]}
                          onChange={(event) => togglePermission(role, perm, event.target.checked)}
                          aria-label={`${t(role)} ${t(perm)}`}
                          className="h-5 w-5 cursor-pointer accent-primary"
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
          <p className="text-sm font-medium">{t("specialTitle")}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {SPECIAL_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <Label htmlFor={`special-${key}`} className="cursor-pointer">
                  {t(key)}
                </Label>
                <Switch
                  id={`special-${key}`}
                  checked={perms.special[key]}
                  onCheckedChange={(value) => toggleSpecial(key, value)}
                />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="octal-input">{t("octal")}</Label>
          <div className="flex gap-2">
            <Input
              id="octal-input"
              inputMode="numeric"
              value={octalDraft}
              onChange={(event) => onOctalChange(event.target.value)}
              className="text-lg font-mono tracking-widest"
              placeholder="755"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => copy(octal)}
              aria-label={t("copy")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {octalError && <p className="text-sm text-red-500">{octalError}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t("symbolic")}</Label>
          <div className="flex gap-2">
            <div className="flex h-10 flex-1 items-center rounded-md border border-input bg-background px-3 text-lg font-mono tracking-widest">
              {symbolic}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => copy(symbolic)}
              aria-label={t("copy")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("command")}</Label>
          <div className="flex gap-2">
            <div className="flex h-10 flex-1 items-center overflow-x-auto rounded-md border border-input bg-background px-3 font-mono text-sm">
              {command}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => copy(command)}
              aria-label={t("copy")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      <p className="text-center text-xs text-muted-foreground">{t("note")}</p>
    </div>
  )
}
