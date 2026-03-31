"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { ArrowRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  tags?: string[];
  color?: string;
  isPopular?: boolean;
  isRecent?: boolean;
  onNavigate?: (toolId: string) => void;
}

export function ToolCard({
  id,
  title,
  description,
  icon: Icon,
  href,
  tags,
  color = "text-primary",
  isPopular = false,
  isRecent = false,
  onNavigate,
}: ToolCardProps) {
  const t = useTranslations();

  return (
    <Link
      href={href}
      data-tool-id={id}
      className="group block h-full cursor-pointer"
      prefetch={false}
      onClick={() => onNavigate?.(id)}
    >
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-[24px] border border-black/[0.08] bg-white/[0.7] p-5 shadow-[0_4px_15px_rgb(0,0,0,0.05)] transition-all duration-300 hover:scale-[1.01] hover:border-primary/20 hover:bg-white/[0.9] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] active:scale-[0.98] group-hover:-translate-y-1 dark:border-white/[0.05] dark:bg-card/20 dark:hover:bg-card/40 dark:hover:shadow-xl",
          isRecent &&
            "border-primary/40 bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_16px_40px_hsl(var(--primary)/0.18)]",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {isRecent && (
          <div className="absolute inset-x-5 top-3 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        )}

        <div className="relative z-10 flex h-full flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={cn(
                  "relative shrink-0 rounded-xl border border-border/20 bg-secondary/50 p-1.5 transition-all duration-300 group-hover:border-primary/20 group-hover:bg-primary/10",
                  color,
                )}
              >
                {isPopular && (
                  <span className="absolute -left-1.5 -top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-amber-200/80 bg-amber-400 text-white shadow-sm dark:border-amber-100/30 dark:bg-amber-500">
                    <Star className="h-2.5 w-2.5 fill-current stroke-[2.2]" />
                  </span>
                )}
                <Icon className="h-5 w-5 stroke-[1.5]" />
              </div>
              <h3 className="break-keep text-base font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                {title}
              </h3>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <p className="line-clamp-2 text-left text-xs leading-relaxed text-muted-foreground/80 dark:text-muted-foreground/60">
            {description}
          </p>

          <div className="mt-auto flex flex-wrap gap-1">
            {tags?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5 text-[11px] font-bold text-primary/60 transition-colors group-hover:bg-primary/10 group-hover:text-primary"
              >
                {t(`Category.${tag}`)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
