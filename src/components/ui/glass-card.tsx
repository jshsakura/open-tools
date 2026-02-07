import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    gradient?: boolean
}

export function GlassCard({ children, className, gradient = false, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 backdrop-blur-xl transition-all duration-500",
                gradient && "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-muted/20 before:to-transparent before:opacity-50",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
