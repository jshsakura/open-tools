import { describe, expect, it } from "vitest"

import { validateBusinessNumber, validateRrn } from "./kr-id-validator.utils"

// Valid RRN examples constructed by hand:
//   weights = [2,3,4,5,6,7,8,9,2,3,4,5] over first 12 digits
//   checkDigit = (11 - sum % 11) % 10
//
//   "900101123456" -> check 8 -> "9001011234568"
//   "880101200001" -> check 4 -> "8801012000014"
const VALID_RRN_A = "9001011234568"
const VALID_RRN_B = "8801012000014"

// Valid business-number examples constructed by hand:
//   weights = [1,3,7,1,3,7,1,3,5] over first 9 digits,
//   plus floor(digit[8] * 5 / 10); checkDigit = (10 - sum % 10) % 10
//
//   "123456789" -> check 1 -> "1234567891"
//   "220181234" -> check 7 -> "2201812347"
//   "104810000" -> check 0 -> "1048100000"
const VALID_BIZ_A = "1234567891"
const VALID_BIZ_B = "2201812347"
const VALID_BIZ_C = "1048100000"

describe("validateRrn", () => {
  it("returns true for a known-valid 13-digit RRN", () => {
    expect(validateRrn(VALID_RRN_A)).toBe(true)
  })

  it("returns true for a second known-valid RRN", () => {
    expect(validateRrn(VALID_RRN_B)).toBe(true)
  })

  it("strips hyphens before validating a valid RRN", () => {
    expect(validateRrn("900101-1234568")).toBe(true)
  })

  it("strips spaces and arbitrary non-digits before validating", () => {
    expect(validateRrn("9 0 0 1 0 1 - 1 2 3 4 5 6 8")).toBe(true)
  })

  it("returns false when the check digit is wrong", () => {
    // VALID_RRN_A with last digit changed from 8 to 9
    expect(validateRrn("9001011234569")).toBe(false)
  })

  it("returns false when an interior digit is altered (checksum mismatch)", () => {
    // flip second digit 9 -> 0, leaving the original check digit
    expect(validateRrn("8001011234568")).toBe(false)
  })

  it("returns false for a string that is too short", () => {
    expect(validateRrn("123456789012")).toBe(false)
  })

  it("returns false for a string that is too long", () => {
    expect(validateRrn("90010112345689")).toBe(false)
  })

  it("returns false when non-numeric characters remain after stripping make length wrong", () => {
    expect(validateRrn("abcdefghijklm")).toBe(false)
  })

  it("returns false for an empty string", () => {
    expect(validateRrn("")).toBe(false)
  })

  it("returns false for whitespace-only input", () => {
    expect(validateRrn("             ")).toBe(false)
  })

  it("validates the check digit 0 branch correctly", () => {
    // when sum % 11 === 1, (11 - 1) % 10 === 0
    // "000000000000" -> sum 0 -> (11-0)%10 = 1, so check is 1
    expect(validateRrn("0000000000001")).toBe(true)
    expect(validateRrn("0000000000000")).toBe(false)
  })
})

describe("validateBusinessNumber", () => {
  it("returns true for a known-valid 10-digit business number", () => {
    expect(validateBusinessNumber(VALID_BIZ_A)).toBe(true)
  })

  it("returns true for a second known-valid business number", () => {
    expect(validateBusinessNumber(VALID_BIZ_B)).toBe(true)
  })

  it("returns true for a third known-valid business number (check digit 0)", () => {
    expect(validateBusinessNumber(VALID_BIZ_C)).toBe(true)
  })

  it("strips hyphens before validating a valid business number", () => {
    expect(validateBusinessNumber("123-45-67891")).toBe(true)
  })

  it("returns false when the check digit is wrong", () => {
    // VALID_BIZ_A with last digit changed from 1 to 2
    expect(validateBusinessNumber("1234567892")).toBe(false)
  })

  it("returns false when an interior digit is altered", () => {
    expect(validateBusinessNumber("1234567791")).toBe(false)
  })

  it("returns false for a string that is too short", () => {
    expect(validateBusinessNumber("123456789")).toBe(false)
  })

  it("returns false for a string that is too long", () => {
    expect(validateBusinessNumber("12345678910")).toBe(false)
  })

  it("returns false for non-numeric input", () => {
    expect(validateBusinessNumber("abcdefghij")).toBe(false)
  })

  it("returns false for an empty string", () => {
    expect(validateBusinessNumber("")).toBe(false)
  })

  it("returns false for whitespace-only input", () => {
    expect(validateBusinessNumber("          ")).toBe(false)
  })
})
