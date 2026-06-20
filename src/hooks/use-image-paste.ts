"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * Shared clipboard-image support for image tools.
 *
 * - Listens for window `paste` events and, when the clipboard holds an image,
 *   hands the resulting File to `onImageFile` (Ctrl/Cmd+V anywhere on the page).
 * - Returns `pasteFromClipboard()` for an explicit "Paste from clipboard" button
 *   (uses the async Clipboard API), plus `isSupported` for that button.
 *
 * Single source of truth so every image tool gets identical paste behaviour.
 */
export function useImagePaste(
    onImageFile: (file: File) => void,
    options: { enabled?: boolean } = {},
) {
    const { enabled = true } = options
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        setIsSupported(
            typeof navigator !== "undefined" &&
                typeof navigator.clipboard?.read === "function",
        )
    }, [])

    useEffect(() => {
        if (!enabled) return
        const onPaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items
            if (!items) return
            for (const item of items) {
                if (item.type.startsWith("image/")) {
                    const file = item.getAsFile()
                    if (file) {
                        e.preventDefault()
                        onImageFile(file)
                        return
                    }
                }
            }
        }
        window.addEventListener("paste", onPaste)
        return () => window.removeEventListener("paste", onPaste)
    }, [enabled, onImageFile])

    const pasteFromClipboard = useCallback(async (): Promise<boolean> => {
        try {
            const items = await navigator.clipboard.read()
            for (const item of items) {
                const imageType = item.types.find((t) => t.startsWith("image/"))
                if (imageType) {
                    const blob = await item.getType(imageType)
                    const ext = imageType.split("/")[1] || "png"
                    onImageFile(new File([blob], `pasted-${Date.now()}.${ext}`, { type: imageType }))
                    return true
                }
            }
            return false
        } catch {
            return false
        }
    }, [onImageFile])

    return { pasteFromClipboard, isSupported }
}
