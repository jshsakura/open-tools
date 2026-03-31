"use client"

import { Loader2 } from "lucide-react"

export function ToolLoadingSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="space-y-3">
                <div className="h-8 w-64 bg-secondary/50 rounded-lg animate-pulse" />
                <div className="h-4 w-96 bg-secondary/30 rounded animate-pulse" />
            </div>

            {/* Main Content Skeleton */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-[400px] bg-card/60 border border-border/20 rounded-2xl animate-pulse" />
                <div className="h-[400px] bg-card/60 border border-border/20 rounded-2xl animate-pulse" />
            </div>

            {/* Loading Indicator */}
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading tool...</p>
                </div>
            </div>
        </div>
    )
}

export function ToolLoader({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto min-h-[calc(100vh-200px)] max-w-5xl px-4 py-8">
            {children}
        </div>
    )
}
