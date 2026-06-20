import { describe, expect, it } from "vitest"

import { morseToText, textToMorse } from "./morse-converter.utils"

describe("textToMorse", () => {
  it("encodes a simple word", () => {
    expect(textToMorse("SOS")).toBe("... --- ...")
  })

  it("is case-insensitive", () => {
    expect(textToMorse("sos")).toBe(textToMorse("SOS"))
  })

  it("separates words with a slash", () => {
    expect(textToMorse("HI YOU")).toBe(".... .. / -.-- --- ..-")
  })

  it("drops unknown characters", () => {
    expect(textToMorse("AéB")).toBe(".- -...")
  })
})

describe("morseToText", () => {
  it("decodes a simple sequence", () => {
    expect(morseToText("... --- ...")).toBe("SOS")
  })

  it("decodes word boundaries from slashes", () => {
    expect(morseToText(".... .. / -.-- --- ..-")).toBe("HI YOU")
  })

  it("drops unknown morse tokens", () => {
    expect(morseToText(".- ........ -...")).toBe("AB")
  })
})

describe("round-trip", () => {
  it("text -> morse -> text preserves the message", () => {
    const message = "HELLO WORLD"
    expect(morseToText(textToMorse(message))).toBe(message)
  })

  it("handles single words", () => {
    expect(morseToText(textToMorse("MORSE"))).toBe("MORSE")
  })
})
