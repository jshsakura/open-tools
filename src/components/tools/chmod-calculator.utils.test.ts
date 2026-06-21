import { describe, it, expect } from "vitest"
import {
  EMPTY_PERMS,
  octalToPerms,
  octalToSymbolic,
  permsToOctal,
  permsToSymbolic,
  type Perms,
} from "./chmod-calculator.utils"

const make = (
  owner: [boolean, boolean, boolean],
  group: [boolean, boolean, boolean],
  others: [boolean, boolean, boolean],
  special: [boolean, boolean, boolean] = [false, false, false],
): Perms => ({
  owner: { read: owner[0], write: owner[1], execute: owner[2] },
  group: { read: group[0], write: group[1], execute: group[2] },
  others: { read: others[0], write: others[1], execute: others[2] },
  special: { setuid: special[0], setgid: special[1], sticky: special[2] },
})

describe("permsToOctal", () => {
  it("converts rwxr-xr-x to 755", () => {
    expect(permsToOctal(make([true, true, true], [true, false, true], [true, false, true]))).toBe("755")
  })
  it("converts rw-r--r-- to 644", () => {
    expect(permsToOctal(make([true, true, false], [true, false, false], [true, false, false]))).toBe("644")
  })
  it("converts full permissions to 777", () => {
    expect(permsToOctal(make([true, true, true], [true, true, true], [true, true, true]))).toBe("777")
  })
  it("converts no permissions to 000", () => {
    expect(permsToOctal(EMPTY_PERMS)).toBe("000")
  })
  it("prefixes a special digit when special bits are set", () => {
    const perms = make([true, true, true], [true, false, true], [true, false, true], [true, false, false])
    expect(permsToOctal(perms)).toBe("4755")
  })
})

describe("octalToPerms", () => {
  it("parses 755 correctly", () => {
    expect(octalToPerms("755")).toEqual(make([true, true, true], [true, false, true], [true, false, true]))
  })
  it("parses 644 correctly", () => {
    expect(octalToPerms("644")).toEqual(make([true, true, false], [true, false, false], [true, false, false]))
  })
  it("parses 000 to empty perms", () => {
    expect(octalToPerms("000")).toEqual(EMPTY_PERMS)
  })
  it("parses a 4-digit octal with setuid (4755)", () => {
    expect(octalToPerms("4755")).toEqual(
      make([true, true, true], [true, false, true], [true, false, true], [true, false, false]),
    )
  })
  it("parses 1777 with sticky bit", () => {
    expect(octalToPerms("1777")).toEqual(
      make([true, true, true], [true, true, true], [true, true, true], [false, false, true]),
    )
  })
  it("trims surrounding whitespace", () => {
    expect(octalToPerms("  755  ")).toEqual(octalToPerms("755"))
  })
  it("returns null for digits out of octal range", () => {
    expect(octalToPerms("888")).toBeNull()
    expect(octalToPerms("759")).toBeNull()
  })
  it("returns null for wrong length", () => {
    expect(octalToPerms("75")).toBeNull()
    expect(octalToPerms("75555")).toBeNull()
  })
  it("returns null for non-numeric input", () => {
    expect(octalToPerms("rwx")).toBeNull()
    expect(octalToPerms("")).toBeNull()
  })
})

describe("permsToSymbolic", () => {
  it("converts 755 to rwxr-xr-x", () => {
    expect(permsToSymbolic(make([true, true, true], [true, false, true], [true, false, true]))).toBe("rwxr-xr-x")
  })
  it("converts 644 to rw-r--r--", () => {
    expect(permsToSymbolic(make([true, true, false], [true, false, false], [true, false, false]))).toBe("rw-r--r--")
  })
  it("converts 777 to rwxrwxrwx", () => {
    expect(permsToSymbolic(make([true, true, true], [true, true, true], [true, true, true]))).toBe("rwxrwxrwx")
  })
  it("converts 000 to ---------", () => {
    expect(permsToSymbolic(EMPTY_PERMS)).toBe("---------")
  })
  it("uses lowercase s for setuid when owner execute is set", () => {
    const perms = make([true, true, true], [true, false, true], [true, false, true], [true, false, false])
    expect(permsToSymbolic(perms)).toBe("rwsr-xr-x")
  })
  it("uses uppercase S for setuid when owner execute is unset", () => {
    const perms = make([true, true, false], [true, false, true], [true, false, true], [true, false, false])
    expect(permsToSymbolic(perms)).toBe("rwSr-xr-x")
  })
  it("uses lowercase t for sticky when others execute is set", () => {
    const perms = make([true, true, true], [true, true, true], [true, true, true], [false, false, true])
    expect(permsToSymbolic(perms)).toBe("rwxrwxrwt")
  })
  it("uses uppercase T for sticky when others execute is unset", () => {
    const perms = make([true, true, true], [true, true, true], [true, true, false], [false, false, true])
    expect(permsToSymbolic(perms)).toBe("rwxrwxrwT")
  })
  it("renders setgid in the group triad", () => {
    const perms = make([true, true, true], [true, false, true], [true, false, true], [false, true, false])
    expect(permsToSymbolic(perms)).toBe("rwxr-sr-x")
  })
})

describe("octalToSymbolic", () => {
  it("converts 755 to rwxr-xr-x", () => {
    expect(octalToSymbolic("755")).toBe("rwxr-xr-x")
  })
  it("converts 644 to rw-r--r--", () => {
    expect(octalToSymbolic("644")).toBe("rw-r--r--")
  })
  it("converts 4755 to rwsr-xr-x", () => {
    expect(octalToSymbolic("4755")).toBe("rwsr-xr-x")
  })
  it("returns null for invalid octal", () => {
    expect(octalToSymbolic("999")).toBeNull()
  })
})

describe("round trips", () => {
  const cases = ["000", "644", "755", "777", "750", "4755", "2755", "1777", "7777"]
  for (const octal of cases) {
    it(`round-trips ${octal}`, () => {
      const perms = octalToPerms(octal)
      expect(perms).not.toBeNull()
      expect(permsToOctal(perms as Perms)).toBe(octal)
    })
  }
})
