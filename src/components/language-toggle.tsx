"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const onSelectChange = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 hover:bg-primary/10">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelectChange("en")} className={locale === "en" ? "bg-accent" : ""}>
                    <span className="mr-2">🇺🇸</span> English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectChange("ko")} className={locale === "ko" ? "bg-accent" : ""}>
                    <span className="mr-2">🇰🇷</span> 한국어
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
