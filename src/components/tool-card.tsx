import { Link } from "@/i18n/routing"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolCardProps {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    href: string
    tags?: string[]
    color?: string
}

export function ToolCard({ title, description, icon: Icon, href, tags, color = "text-primary" }: ToolCardProps) {
    return (
        <Link href={href} className="group block h-full cursor-pointer" prefetch={false}>
            <div className="relative h-full overflow-hidden rounded-[24px] border border-black/[0.08] dark:border-white/[0.05] bg-white/[0.7] dark:bg-card/20 p-5 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.9] dark:hover:bg-card/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-xl group-hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98] shadow-[0_4px_15px_rgb(0,0,0,0.05)]">
                {/* Subtle Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex flex-col h-full gap-3 z-10">
                    {/* Header: Icon & Title & Arrow icon */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className={cn("shrink-0 p-1.5 rounded-xl bg-secondary/50 border border-border/20 transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/20", color)}>
                                <Icon className="h-5 w-5 stroke-[1.5]" />
                            </div>
                            <h3 className="font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight break-keep">
                                {title}
                            </h3>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>

                    {/* Description - Left Aligned & Compact */}
                    <p className="text-xs text-muted-foreground/80 dark:text-muted-foreground/60 line-clamp-2 leading-relaxed text-left">
                        {description}
                    </p>

                    {/* Footer: Tags only */}
                    <div className="mt-auto flex flex-wrap gap-1">
                        {tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[11px] rounded-full font-bold bg-primary/5 text-primary/60 border border-primary/10 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    )
}
