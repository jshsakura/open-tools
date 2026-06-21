export interface PermissionSet {
  read: boolean
  write: boolean
  execute: boolean
}

export interface SpecialBits {
  setuid: boolean
  setgid: boolean
  sticky: boolean
}

export interface Perms {
  owner: PermissionSet
  group: PermissionSet
  others: PermissionSet
  special: SpecialBits
}

const READ = 4
const WRITE = 2
const EXECUTE = 1

const SETUID = 4
const SETGID = 2
const STICKY = 1

export const EMPTY_PERMS: Perms = {
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  others: { read: false, write: false, execute: false },
  special: { setuid: false, setgid: false, sticky: false },
}

function setDigit(set: PermissionSet): number {
  return (set.read ? READ : 0) + (set.write ? WRITE : 0) + (set.execute ? EXECUTE : 0)
}

function specialDigit(special: SpecialBits): number {
  return (
    (special.setuid ? SETUID : 0) +
    (special.setgid ? SETGID : 0) +
    (special.sticky ? STICKY : 0)
  )
}

/**
 * Converts a permission model to its octal string.
 * Returns a 4-digit string when any special bit is set, otherwise 3 digits.
 */
export function permsToOctal(perms: Perms): string {
  const owner = setDigit(perms.owner)
  const group = setDigit(perms.group)
  const others = setDigit(perms.others)
  const special = specialDigit(perms.special)
  const base = `${owner}${group}${others}`
  return special > 0 ? `${special}${base}` : base
}

function digitToSet(digit: number): PermissionSet {
  return {
    read: (digit & READ) !== 0,
    write: (digit & WRITE) !== 0,
    execute: (digit & EXECUTE) !== 0,
  }
}

function digitToSpecial(digit: number): SpecialBits {
  return {
    setuid: (digit & SETUID) !== 0,
    setgid: (digit & SETGID) !== 0,
    sticky: (digit & STICKY) !== 0,
  }
}

/**
 * Parses a 3- or 4-digit octal permission string into a permission model.
 * Returns null when the input is not a valid octal permission string.
 */
export function octalToPerms(input: string): Perms | null {
  const value = input.trim()
  if (!/^[0-7]{3,4}$/.test(value)) return null

  const padded = value.length === 3 ? `0${value}` : value
  const special = Number.parseInt(padded[0], 8)
  const owner = Number.parseInt(padded[1], 8)
  const group = Number.parseInt(padded[2], 8)
  const others = Number.parseInt(padded[3], 8)

  return {
    owner: digitToSet(owner),
    group: digitToSet(group),
    others: digitToSet(others),
    special: digitToSpecial(special),
  }
}

function symbolicTriad(set: PermissionSet): string {
  return `${set.read ? "r" : "-"}${set.write ? "w" : "-"}${set.execute ? "x" : "-"}`
}

function applySpecial(triad: string, hasSpecial: boolean, lowerChar: string, upperChar: string): string {
  if (!hasSpecial) return triad
  const last = triad[2]
  const replacement = last === "x" ? lowerChar : upperChar
  return triad.slice(0, 2) + replacement
}

/**
 * Converts a permission model to its symbolic representation (e.g. rwxr-xr-x).
 * Special bits adjust the execute slot: s/S (setuid/setgid) and t/T (sticky).
 */
export function permsToSymbolic(perms: Perms): string {
  const owner = applySpecial(symbolicTriad(perms.owner), perms.special.setuid, "s", "S")
  const group = applySpecial(symbolicTriad(perms.group), perms.special.setgid, "s", "S")
  const others = applySpecial(symbolicTriad(perms.others), perms.special.sticky, "t", "T")
  return `${owner}${group}${others}`
}

/**
 * Converts an octal permission string directly to symbolic form.
 * Returns null when the octal string is invalid.
 */
export function octalToSymbolic(input: string): string | null {
  const perms = octalToPerms(input)
  if (!perms) return null
  return permsToSymbolic(perms)
}
