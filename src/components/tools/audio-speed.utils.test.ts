import { describe, it, expect } from "vitest"
import { buildAtempoChain, buildSpeedArgs, MIN_SPEED, MAX_SPEED } from "./audio-speed.utils"

/** Evaluate the product of an "atempo=x,atempo=y" chain. */
function chainProduct(chain: string): number {
    return chain
        .split(",")
        .map((f) => Number(f.replace("atempo=", "")))
        .reduce((a, b) => a * b, 1)
}

describe("buildAtempoChain", () => {
    it("returns a single atempo for factors within [0.5, 2.0]", () => {
        expect(buildAtempoChain(1.5)).toBe("atempo=1.5")
        expect(buildAtempoChain(2.0)).toBe("atempo=2")
        expect(buildAtempoChain(0.5)).toBe("atempo=0.5")
    })

    it("chains multiple atempo filters for speeds above 2.0", () => {
        const chain = buildAtempoChain(3.0)
        expect(chain.split(",").length).toBeGreaterThan(1)
        expect(chainProduct(chain)).toBeCloseTo(3.0, 3)
    })

    it("keeps every factor within the valid [0.5, 2.0] range", () => {
        for (const speed of [0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4]) {
            const factors = buildAtempoChain(speed)
                .split(",")
                .map((f) => Number(f.replace("atempo=", "")))
            for (const f of factors) {
                expect(f).toBeGreaterThanOrEqual(0.5)
                expect(f).toBeLessThanOrEqual(2.0)
            }
            expect(chainProduct(buildAtempoChain(speed))).toBeCloseTo(speed, 3)
        }
    })

    it("throws for speeds outside the supported range", () => {
        expect(() => buildAtempoChain(MIN_SPEED - 0.1)).toThrow()
        expect(() => buildAtempoChain(MAX_SPEED + 0.1)).toThrow()
    })
})

describe("buildSpeedArgs", () => {
    it("applies the atempo chain via -filter:a and encodes to the format", () => {
        const args = buildSpeedArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            speed: 1.5,
            format: "mp3",
            bitrate: 192,
        })
        expect(args[args.indexOf("-filter:a") + 1]).toBe("atempo=1.5")
        expect(args).toContain("libmp3lame")
        expect(args[args.length - 1]).toBe("out.mp3")
    })
})
