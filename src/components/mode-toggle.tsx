"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    console.log("ModeToggle rendered")

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <span className="sr-only">Loading theme</span>
            </Button>
        )
    }

    const isDark = resolvedTheme === 'dark'

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 hover:bg-primary/10"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            <Sun className={`h-[1.2rem] w-[1.2rem] transition-all absolute ${isDark ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
            <Moon className={`h-[1.2rem] w-[1.2rem] transition-all absolute ${isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
