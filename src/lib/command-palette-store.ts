import { create } from "zustand"

interface CommandPaletteState {
    open: boolean
    setOpen: (open: boolean) => void
    toggle: () => void
}

/** Global open/close state for the ⌘K command palette, shared by the header
 *  trigger button and the palette's own keyboard shortcut. */
export const useCommandPalette = create<CommandPaletteState>((set) => ({
    open: false,
    setOpen: (open) => set({ open }),
    toggle: () => set((state) => ({ open: !state.open })),
}))
