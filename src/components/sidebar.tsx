"use client"

import { Link } from "@/i18n/routing"
import { usePathname } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LayoutGrid, Music, Image as ImageIcon, FileText, Settings, HelpCircle, Database, User, Mail, Bell } from "lucide-react"

import { GlassCard } from "@/components/ui/glass-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    return (
        <GlassCard className={cn("flex flex-col gap-3 p-4 h-full", className)}>
            <div className="py-1">
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Discover
                </h3>
                <div className="grid gap-1">
                    <Link
                        href="/"
                        className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:shadow-inner hover:translate-x-1",
                            pathname === "/" || pathname === "/en" || pathname === "/ko" ? "bg-white/15 text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        All Apps
                    </Link>
                    <Link
                        href="#"
                        className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-white/10 hover:shadow-inner hover:text-foreground hover:translate-x-1"
                    >
                        <span className="flex h-4 w-4 items-center justify-center rounded border border-muted-foreground/30 bg-background/50 text-[9px] uppercase font-bold text-muted-foreground/70 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                            N
                        </span>
                        New & Noteworthy
                    </Link>
                </div>
            </div>

            <div className="py-1">
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Categories
                </h3>
                <div className="grid gap-1">
                    <Link
                        href="/tools/sql-formatter"
                        className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:shadow-inner hover:translate-x-1",
                            pathname.includes("sql-formatter") ? "bg-white/15 text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Database className="h-4 w-4" />
                        SQL Formatter
                    </Link>
                    <Link
                        href="/tools/suno-downloader"
                        className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:shadow-inner hover:translate-x-1",
                            pathname.includes("suno") ? "bg-white/15 text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Music className="h-4 w-4" />
                        Audio & Music
                    </Link>
                    <Link
                        href="#"
                        className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-white/10 hover:shadow-inner hover:text-foreground hover:translate-x-1"
                    >
                        <ImageIcon className="h-4 w-4" />
                        Image Editing
                    </Link>
                    <Link
                        href="#"
                        className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-white/10 hover:shadow-inner hover:text-foreground hover:translate-x-1"
                    >
                        <FileText className="h-4 w-4" />
                        Documents
                    </Link>
                </div>
            </div>

            <div className="py-1 mt-auto">
                <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0 border border-primary/20">
                            <AvatarImage src="/avatar.jpg" alt="User" />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                OP
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-foreground truncate">User Name</span>
                                <Bell className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer" />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate">user@email.com</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid gap-1 mt-2">
                    <Link href="#" className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-white/10 hover:shadow-inner hover:text-foreground hover:translate-x-1">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                    <Link href="#" className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-white/10 hover:shadow-inner hover:text-foreground hover:translate-x-1">
                        <HelpCircle className="h-4 w-4" />
                        Support
                    </Link>
                </div>
            </div>
        </GlassCard>
    )
}
