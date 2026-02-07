"use client"

import { cn } from "@/lib/utils"

interface AdPlaceholderProps {
    type: "leaderboard" | "skyscraper" | "rectangle";
    className?: string;
}

export function AdPlaceholder({ type, className }: AdPlaceholderProps) {
    const dimensions = {
        leaderboard: "w-full max-w-[728px] h-[90px]",
        skyscraper: "w-[160px] h-[600px]",
        rectangle: "w-[300px] h-[250px]",
    }

    const labels = {
        leaderboard: "Leaderboard (728x90)",
        skyscraper: "Skyscraper (160x600)",
        rectangle: "Rectangle (300x250)",
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center bg-muted/30 border border-dashed border-border/50 rounded-lg text-muted-foreground/40 text-xs font-medium uppercase tracking-wider select-none overflow-hidden",
                dimensions[type],
                className
            )}
        >
            <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded bg-muted/50 border border-border/20">
                    AD SPACE
                </div>
                <span>{labels[type]}</span>
            </div>
        </div>
    )
}
