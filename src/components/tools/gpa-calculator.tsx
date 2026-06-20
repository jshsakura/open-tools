"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Trash2, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Scale = "4.5" | "4.0"

// Grade -> grade point per scale (Korean 4.5 and standard 4.0).
const GRADE_POINTS: Record<Scale, Record<string, number>> = {
    "4.5": { "A+": 4.5, A: 4.0, "B+": 3.5, B: 3.0, "C+": 2.5, C: 2.0, "D+": 1.5, D: 1.0, F: 0 },
    "4.0": { "A+": 4.0, A: 4.0, "B+": 3.5, B: 3.0, "C+": 2.5, C: 2.0, "D+": 1.5, D: 1.0, F: 0 },
}

interface Course {
    id: string
    name: string
    grade: string
    credits: string
}

const newCourse = (): Course => ({ id: crypto.randomUUID(), name: "", grade: "A+", credits: "3" })

export function GpaCalculator() {
    const t = useTranslations("GpaCalculator")
    const [scale, setScale] = useState<Scale>("4.5")
    const [courses, setCourses] = useState<Course[]>([newCourse(), newCourse(), newCourse()])

    const grades = Object.keys(GRADE_POINTS[scale])

    const update = (id: string, patch: Partial<Course>) =>
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    const remove = (id: string) => setCourses((prev) => prev.filter((c) => c.id !== id))

    const { gpa, totalCredits } = useMemo(() => {
        let points = 0
        let credits = 0
        for (const c of courses) {
            const credit = parseFloat(c.credits)
            if (!Number.isFinite(credit) || credit <= 0) continue
            const gp = GRADE_POINTS[scale][c.grade] ?? 0
            points += gp * credit
            credits += credit
        }
        return { gpa: credits > 0 ? points / credits : 0, totalCredits: credits }
    }, [courses, scale])

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            <GlassCard className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold">{t("scale")}</Label>
                    <div className="flex gap-2">
                        {(["4.5", "4.0"] as Scale[]).map((s) => (
                            <Button key={s} size="sm" variant={scale === s ? "default" : "outline"} onClick={() => setScale(s)} className="font-mono text-xs">
                                {s}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="hidden sm:grid grid-cols-[1fr_110px_90px_36px] gap-2 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        <span>{t("course")}</span>
                        <span>{t("grade")}</span>
                        <span>{t("credits")}</span>
                        <span />
                    </div>
                    {courses.map((c, i) => (
                        <div key={c.id} className="grid grid-cols-[1fr_110px_90px_36px] gap-2 items-center">
                            <Input
                                value={c.name}
                                onChange={(e) => update(c.id, { name: e.target.value })}
                                placeholder={t("coursePlaceholder", { n: i + 1 })}
                                className="h-9 text-sm"
                            />
                            <select
                                value={c.grade}
                                onChange={(e) => update(c.id, { grade: e.target.value })}
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            >
                                {grades.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                            <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={c.credits}
                                onChange={(e) => update(c.id, { credits: e.target.value })}
                                className="h-9 text-sm"
                            />
                            <button
                                onClick={() => remove(c.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                aria-label={t("remove")}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <Button variant="outline" size="sm" onClick={() => setCourses((p) => [...p, newCourse()])} className="gap-1">
                    <Plus className="h-3.5 w-3.5" /> {t("addCourse")}
                </Button>
            </GlassCard>

            <GlassCard className="p-6 flex items-center justify-around text-center">
                <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" /> {t("gpa")}
                    </div>
                    <p className="text-4xl font-black text-primary tabular-nums">{gpa.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">/ {scale}</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("totalCredits")}</div>
                    <p className="text-4xl font-black tabular-nums">{totalCredits}</p>
                </div>
            </GlassCard>
        </div>
    )
}
