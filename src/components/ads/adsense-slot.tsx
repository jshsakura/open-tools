"use client"

import { useEffect, useMemo } from "react"
import { AdPlaceholder } from "@/components/ads/ad-placeholder"
import { cn } from "@/lib/utils"

type AdType = "leaderboard" | "skyscraper" | "rectangle"

interface AdsenseSlotProps {
    type: AdType
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
    slot,
    className,
    showPlaceholder = true,
}: AdsenseSlotProps) {
    const client = process.env.NEXT_PUBLIC_ADSENSE_ID
    const clientId = useMemo(() => {
        if (!client) return undefined
        return client.startsWith("ca-pub-") ? client : `ca-pub-${client}`
    }, [client])

    const enabled = Boolean(clientId && slot)

    useEffect(() => {
        if (!enabled) return
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
                data-ad-client={clientId}
                data-ad-slot={slot}
            />
        </div>
    )
}
