import { describe, it, expect } from "vitest"
import {
    CVD_MATRICES,
    CVD_TYPES,
    applyMatrix,
    type Matrix3x3,
} from "./color-blindness-simulator.utils"

const IDENTITY: Matrix3x3 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
]

describe("CVD_MATRICES", () => {
    it("has a matrix for every CVD type", () => {
        for (const type of CVD_TYPES) {
            expect(CVD_MATRICES[type]).toBeDefined()
        }
    })

    it("every matrix is 3x3", () => {
        for (const type of CVD_TYPES) {
            const matrix = CVD_MATRICES[type]
            expect(matrix).toHaveLength(3)
            for (const row of matrix) {
                expect(row).toHaveLength(3)
            }
        }
    })
})

describe("applyMatrix", () => {
    it("returns the input unchanged for the identity matrix", () => {
        expect(applyMatrix(10, 120, 240, IDENTITY)).toEqual([10, 120, 240])
        expect(applyMatrix(0, 0, 0, IDENTITY)).toEqual([0, 0, 0])
        expect(applyMatrix(255, 255, 255, IDENTITY)).toEqual([255, 255, 255])
    })

    it("does not mutate the input matrix", () => {
        const matrix: Matrix3x3 = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ]
        const before = JSON.stringify(matrix)
        applyMatrix(50, 60, 70, matrix)
        expect(JSON.stringify(matrix)).toBe(before)
    })

    it("produces equal r=g=b grayscale for achromatopsia", () => {
        const samples: Array<[number, number, number]> = [
            [255, 0, 0],
            [0, 255, 0],
            [12, 200, 90],
            [180, 50, 240],
        ]
        for (const [r, g, b] of samples) {
            const [or, og, ob] = applyMatrix(r, g, b, CVD_MATRICES.achromatopsia)
            expect(or).toBe(og)
            expect(og).toBe(ob)
        }
    })

    it("clamps results to the 0-255 range", () => {
        const overshoot: Matrix3x3 = [
            [2, 2, 2],
            [2, 2, 2],
            [2, 2, 2],
        ]
        for (const channel of applyMatrix(255, 255, 255, overshoot)) {
            expect(channel).toBe(255)
        }

        const negative: Matrix3x3 = [
            [-5, -5, -5],
            [-5, -5, -5],
            [-5, -5, -5],
        ]
        for (const channel of applyMatrix(255, 255, 255, negative)) {
            expect(channel).toBe(0)
        }
    })

    it("returns integer channel values", () => {
        for (const channel of applyMatrix(123, 45, 200, CVD_MATRICES.deuteranopia)) {
            expect(Number.isInteger(channel)).toBe(true)
        }
    })
})
