"use client"

import { useEffect, useMemo, useRef } from "react"
import { AdPlaceholder } from "@/components/ads/ad-placeholder"
import { cn } from "@/lib/utils"

type AdType = "leaderboard" | "skyscraper" | "rectangle"

interface AdsenseSlotProps {
    type: AdType
    clientId?: string
    slot?: string
    className?: string
    showPlaceholder?: boolean
}

declare global {
    interface Window {
        adsbygoogle?: any[]
    }
}

export function AdsenseSlot({
    type,
    clientId,
    slot,
    className,
    showPlaceholder = true,
}: AdsenseSlotProps) {
    const insRef = useRef<HTMLModElement | null>(null)
    const normalizedClientId = useMemo(() => {
        if (!clientId) return undefined
        return clientId.startsWith("ca-pub-") ? clientId : `ca-pub-${clientId}`
    }, [clientId])

    const enabled = Boolean(normalizedClientId && slot)

    useEffect(() => {
        if (!enabled) return
        const el = insRef.current as HTMLElement | null
        // Avoid pushing twice for the same ad slot.
        if (el && el.getAttribute("data-adsbygoogle-status") === "done") {
            return
        }
        try {
            window.adsbygoogle = window.adsbygoogle || []
            window.adsbygoogle.push({})
        } catch {
            // Ignore client-side ad init errors (blocked scripts, etc.)
        }
    }, [enabled, slot])

    const sizeClass = {
        leaderboard: "w-full max-w-[728px] h-[90px]",
        skyscraper: "w-[160px] h-[600px]",
        rectangle: "w-[300px] h-[250px]",
    }[type]

    if (!enabled) {
        return showPlaceholder ? <AdPlaceholder type={type} className={className} /> : null
    }

    const style = {
        leaderboard: { display: "block", width: "728px", height: "90px" },
        skyscraper: { display: "block", width: "160px", height: "600px" },
        rectangle: { display: "block", width: "300px", height: "250px" },
    }[type]

    return (
        <div className={cn(sizeClass, className)}>
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client={normalizedClientId}
                data-ad-slot={slot}
                ref={insRef}
            />
        </div>
    )
}
