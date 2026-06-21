import { describe, it, expect } from "vitest"
import {
  decodeKey,
  hexToBytes,
  base64ToBytes,
  bufToHex,
  bufToBase64,
} from "./hmac-generator.utils"

describe("hexToBytes", () => {
  it("decodes a hex string to bytes", () => {
    expect(Array.from(hexToBytes("00ff10"))).toEqual([0, 255, 16])
  })
  it("ignores whitespace", () => {
    expect(Array.from(hexToBytes("00 ff 10"))).toEqual([0, 255, 16])
  })
  it("returns empty for empty input", () => {
    expect(Array.from(hexToBytes(""))).toEqual([])
  })
  it("throws on odd length", () => {
    expect(() => hexToBytes("abc")).toThrow()
  })
  it("throws on invalid characters", () => {
    expect(() => hexToBytes("zz")).toThrow()
  })
})

describe("base64ToBytes", () => {
  it("decodes a base64 string to bytes", () => {
    // "Man" => "TWFu"
    expect(Array.from(base64ToBytes("TWFu"))).toEqual([77, 97, 110])
  })
  it("handles padding", () => {
    // "M" => "TQ=="
    expect(Array.from(base64ToBytes("TQ=="))).toEqual([77])
  })
  it("returns empty for empty input", () => {
    expect(Array.from(base64ToBytes(""))).toEqual([])
  })
  it("throws on invalid characters", () => {
    expect(() => base64ToBytes("!!!!")).toThrow()
  })
})

describe("decodeKey", () => {
  it("decodes utf8 keys", () => {
    expect(Array.from(decodeKey("AB", "utf8"))).toEqual([65, 66])
  })
  it("decodes hex keys", () => {
    expect(Array.from(decodeKey("4142", "hex"))).toEqual([65, 66])
  })
  it("decodes base64 keys", () => {
    expect(Array.from(decodeKey("QUI=", "base64"))).toEqual([65, 66])
  })
  it("round-trips hex: bytes -> hex -> bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 254, 255])
    const hex = bufToHex(bytes)
    expect(Array.from(decodeKey(hex, "hex"))).toEqual(Array.from(bytes))
  })
  it("round-trips base64: bytes -> base64 -> bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 254, 255])
    const b64 = bufToBase64(bytes)
    expect(Array.from(decodeKey(b64, "base64"))).toEqual(Array.from(bytes))
  })
})

describe("bufToHex", () => {
  it("formats known bytes as lowercase hex", () => {
    expect(bufToHex(new Uint8Array([0, 15, 16, 255]))).toBe("000f10ff")
  })
  it("accepts ArrayBuffer", () => {
    const buf = new Uint8Array([171, 205]).buffer
    expect(bufToHex(buf)).toBe("abcd")
  })
})

describe("bufToBase64", () => {
  it("formats known bytes as base64", () => {
    // [77,97,110] => "Man" => "TWFu"
    expect(bufToBase64(new Uint8Array([77, 97, 110]))).toBe("TWFu")
  })
  it("hex and base64 of the same bytes differ but decode equally", () => {
    const bytes = new Uint8Array([1, 2, 3, 4])
    expect(bufToHex(bytes)).toBe("01020304")
    expect(bufToBase64(bytes)).toBe("AQIDBA==")
  })
})
