"use client"

import * as React from "react"
import { useEffect, useState } from "react"

export function BackgroundBlobs() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none">
            <div
                className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[80px] animate-pulse"
                style={{ animationDuration: '6s' }}
            />
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[80px] animate-pulse"
                style={{ animationDuration: '8s', animationDelay: '2s' }}
            />
        </div>
    )
}
