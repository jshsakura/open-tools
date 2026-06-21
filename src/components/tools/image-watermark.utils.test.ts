import { describe, expect, it } from "vitest"

import { placementXY, type WatermarkPosition } from "./image-watermark.utils"

// Image 1000x800, mark 200x100, margin 20.
const IMG_W = 1000
const IMG_H = 800
const MARK_W = 200
const MARK_H = 100
const MARGIN = 20

function place(pos: WatermarkPosition, margin = MARGIN) {
    return placementXY(pos, IMG_W, IMG_H, MARK_W, MARK_H, margin)
}

describe("placementXY — all 9 grid positions", () => {
    it("top-left sits at the margin", () => {
        // Arrange / Act
        const p = place("top-left")
        // Assert
        expect(p).toEqual({ x: 20, y: 20 })
    })

    it("top-center is horizontally centered, top margin", () => {
        expect(place("top-center")).toEqual({ x: (1000 - 200) / 2, y: 20 })
    })

    it("top-right hugs the right margin", () => {
        expect(place("top-right")).toEqual({ x: 1000 - 200 - 20, y: 20 })
    })

    it("center-left is vertically centered, left margin", () => {
        expect(place("center-left")).toEqual({ x: 20, y: (800 - 100) / 2 })
    })

    it("center is centered on both axes", () => {
        expect(place("center")).toEqual({ x: (1000 - 200) / 2, y: (800 - 100) / 2 })
    })

    it("center-right is vertically centered, right margin", () => {
        expect(place("center-right")).toEqual({ x: 1000 - 200 - 20, y: (800 - 100) / 2 })
    })

    it("bottom-left hugs the bottom margin, left edge", () => {
        expect(place("bottom-left")).toEqual({ x: 20, y: 800 - 100 - 20 })
    })

    it("bottom-center is horizontally centered, bottom margin", () => {
        expect(place("bottom-center")).toEqual({ x: (1000 - 200) / 2, y: 800 - 100 - 20 })
    })

    it("bottom-right hugs the bottom-right corner", () => {
        expect(place("bottom-right")).toEqual({ x: 1000 - 200 - 20, y: 800 - 100 - 20 })
    })
})

describe("placementXY — margins", () => {
    it("a zero margin pins corners to the image edges", () => {
        expect(place("top-left", 0)).toEqual({ x: 0, y: 0 })
        expect(place("bottom-right", 0)).toEqual({ x: 1000 - 200, y: 800 - 100 })
    })

    it("margin does not affect centered axes", () => {
        const m0 = place("center", 0)
        const m50 = place("center", 50)
        expect(m0).toEqual(m50)
        expect(m0).toEqual({ x: 400, y: 350 })
    })

    it("a larger margin pushes the mark further from edges", () => {
        expect(place("top-left", 100)).toEqual({ x: 100, y: 100 })
        expect(place("bottom-right", 100)).toEqual({ x: 1000 - 200 - 100, y: 800 - 100 - 100 })
    })
})

describe("placementXY — center exactness", () => {
    it("centers a mark in a square image", () => {
        // Arrange / Act
        const p = placementXY("center", 500, 500, 100, 100, 0)
        // Assert
        expect(p).toEqual({ x: 200, y: 200 })
    })

    it("centers a mark equal to the image size at origin", () => {
        const p = placementXY("center", 300, 300, 300, 300, 0)
        expect(p).toEqual({ x: 0, y: 0 })
    })
})
