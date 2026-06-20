"use client"

import { useTranslations } from "next-intl"
import { ClipboardPaste } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useImagePaste } from "@/hooks/use-image-paste"
import { cn } from "@/lib/utils"

interface ClipboardPasteButtonProps {
    /** Receives the image File read from the clipboard. */
    onImageFile: (file: File) => void
    /** When false, the global Ctrl/Cmd+V paste listener is disabled. */
    enablePasteShortcut?: boolean
    className?: string
    variant?: React.ComponentProps<typeof Button>["variant"]
    size?: React.ComponentProps<typeof Button>["size"]
}

/**
 * Reusable "Paste from clipboard" button + Ctrl/Cmd+V support for image tools.
 * Renders nothing if the browser lacks async clipboard read (the paste shortcut
 * still works via the hook where available).
 */
export function ClipboardPasteButton({
    onImageFile,
    enablePasteShortcut = true,
    className,
    variant = "outline",
    size = "sm",
}: ClipboardPasteButtonProps) {
    const t = useTranslations("Common")
    const { pasteFromClipboard, isSupported } = useImagePaste(onImageFile, {
        enabled: enablePasteShortcut,
    })

    if (!isSupported) return null

    const handleClick = async () => {
        const ok = await pasteFromClipboard()
        if (!ok) toast.error(t("clipboardNoImage"))
    }

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            onClick={handleClick}
            className={cn("gap-1.5", className)}
        >
            <ClipboardPaste className="h-4 w-4" />
            {t("pasteFromClipboard")}
        </Button>
    )
}
