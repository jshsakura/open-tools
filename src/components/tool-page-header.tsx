"use client"

import { cn } from "@/lib/utils"
import { getToolById } from "@/lib/tools-catalog"

interface ToolPageHeaderProps {
    title: React.ReactNode
    description?: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
    toolId?: string
    colorClass?: string
    center?: boolean
    className?: string
}

export function ToolPageHeader({
    title,
    description,
    icon,
    toolId,
    colorClass,
    center = false,
    className
}: ToolPageHeaderProps) {
    const tool = toolId ? getToolById(toolId) : null
    const Icon = icon ?? tool?.icon
    const resolvedColor = colorClass ?? tool?.color ?? "text-primary"

    return (
        <div className={cn("mb-12 space-y-4", center && "text-center", className)}>
            <div className={cn(
                "inline-flex items-center justify-center p-3 rounded-2xl bg-muted/40 ring-1 ring-border/50",
                center ? "mx-auto" : ""
            )}>
                {Icon && <Icon className={cn("w-7 h-7", resolvedColor)} />}
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-5xl lg:text-6xl drop-shadow-sm">
                {title}
            </h1>
            {description && (
                <p className={cn("text-lg text-muted-foreground leading-relaxed break-keep", center && "mx-auto")}>
                    {description}
                </p>
            )}
        </div>
    )
}
