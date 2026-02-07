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
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            <div
                className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] animate-pulse"
                style={{ animationDuration: '4s' }}
            />
            <div
                className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[150px] animate-pulse"
                style={{ animationDuration: '6s', animationDelay: '1s' }}
            />
            <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>
    )
}
