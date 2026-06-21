// Password strength estimation without external libraries.
// Computes entropy from the actual character pool + length, then penalizes
// common passwords, sequences, repeats and keyboard patterns to derive a
// realistic score and crack-time estimates.

export type StrengthScore = 0 | 1 | 2 | 3 | 4

export interface CrackTimes {
  // seconds-to-crack for three attacker profiles
  onlineSeconds: number
  offlineSeconds: number
  supercomputerSeconds: number
}

export interface StrengthResult {
  entropyBits: number
  score: StrengthScore
  crackTimes: CrackTimes
  warnings: string[]
}

// Guesses-per-second for each attacker profile.
// online: throttled remote attack; offline: fast GPU hash cracking;
// supercomputer: large distributed/ASIC cluster.
const GUESSES_PER_SECOND = {
  online: 100,
  offline: 1e10,
  supercomputer: 1e14,
} as const

// ~100 of the most common leaked passwords (lowercased, deduped).
const COMMON_PASSWORDS = new Set([
  "123456", "password", "123456789", "12345678", "12345", "qwerty", "1234567",
  "111111", "1234567890", "123123", "abc123", "1234", "password1", "iloveyou",
  "1q2w3e4r", "000000", "qwerty123", "zaq12wsx", "dragon", "sunshine", "654321",
  "master", "1qaz2wsx", "123321", "666666", "121212", "letmein", "monkey",
  "asdfghjkl", "passw0rd", "qazwsx", "trustno1", "michael", "football", "welcome",
  "jesus", "ninja", "mustang", "password123", "admin", "login", "princess",
  "qwertyuiop", "solo", "starwars", "freedom", "whatever", "shadow", "superman",
  "batman", "baseball", "tigger", "charlie", "robert", "thomas", "hockey",
  "ranger", "daniel", "hannah", "maggie", "jordan", "jennifer", "joshua",
  "michelle", "loveme", "ashley", "bailey", "passw0rd1", "flower", "hottie",
  "loveyou", "zaq1zaq1", "fuckyou", "test", "test123", "guest", "root",
  "changeme", "secret", "summer", "winter", "computer", "internet", "samsung",
  "google", "apple", "qwe123", "asd123", "123qwe", "1q2w3e", "qweasd",
  "987654321", "11111111", "112233", "789456", "aaaaaa", "qazxsw", "love",
  "hello", "access", "pokemon", "soccer", "amanda", "andrew", "buster",
])

const KEYBOARD_ROWS = [
  "qwertyuiop", "asdfghjkl", "zxcvbnm",
  "1234567890",
  "qwertzuiop", "azertyuiop", // common intl layouts
]

const SEQUENCE_SOURCES = [
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
]

const SEQUENCE_MIN_RUN = 3
const REPEAT_MIN_RUN = 3

function poolSize(pw: string): number {
  let size = 0
  if (/[a-z]/.test(pw)) size += 26
  if (/[A-Z]/.test(pw)) size += 26
  if (/[0-9]/.test(pw)) size += 10
  // any character outside [A-Za-z0-9] counts as the symbol pool
  if (/[^A-Za-z0-9]/.test(pw)) size += 33
  return size
}

// Longest run (>= minRun) found where consecutive characters step by +/-1 in
// one of the source alphabets (e.g. "abc", "321", forward or reverse).
function hasSequentialRun(pw: string, minRun: number): boolean {
  const lower = pw.toLowerCase()
  for (const source of SEQUENCE_SOURCES) {
    for (let i = 0; i + minRun <= lower.length; i++) {
      const slice = lower.slice(i, i + minRun)
      const forward = source.includes(slice)
      const reversed = source.includes(slice.split("").reverse().join(""))
      if (forward || reversed) return true
    }
  }
  return false
}

function hasRepeatedRun(pw: string, minRun: number): boolean {
  // e.g. "aaa", "1111"
  const re = new RegExp(`(.)\\1{${minRun - 1},}`)
  return re.test(pw)
}

function hasKeyboardPattern(pw: string, minRun: number): boolean {
  const lower = pw.toLowerCase()
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i + minRun <= lower.length; i++) {
      const slice = lower.slice(i, i + minRun)
      const forward = row.includes(slice)
      const reversed = row.includes(slice.split("").reverse().join(""))
      if (forward || reversed) return true
    }
  }
  return false
}

function isCommon(pw: string): boolean {
  const lower = pw.toLowerCase()
  if (COMMON_PASSWORDS.has(lower)) return true
  // strip trailing non-letters ("password123!" -> "password", "qwerty!" -> "qwerty")
  const stripped = lower.replace(/[^a-z]+$/, "")
  return stripped.length >= 3 && COMMON_PASSWORDS.has(stripped)
}

function scoreFromEntropy(bits: number): StrengthScore {
  if (bits < 28) return 0
  if (bits < 40) return 1
  if (bits < 60) return 2
  if (bits < 80) return 3
  return 4
}

/**
 * Estimate the strength of a password.
 * Entropy is computed from the real character pool and length, then reduced by
 * penalties for common passwords and predictable patterns. Crack times derive
 * from the penalized entropy.
 */
export function estimateStrength(pw: string): StrengthResult {
  const empty: StrengthResult = {
    entropyBits: 0,
    score: 0,
    crackTimes: { onlineSeconds: 0, offlineSeconds: 0, supercomputerSeconds: 0 },
    warnings: [],
  }
  if (!pw) return empty

  const size = poolSize(pw)
  const rawBits = size > 0 ? pw.length * Math.log2(size) : 0

  const warnings: string[] = []
  let penalty = 0 // bits to subtract

  if (isCommon(pw)) {
    warnings.push("common")
    // common passwords are essentially free to guess from a dictionary
    penalty += rawBits * 0.85
  }
  if (hasSequentialRun(pw, SEQUENCE_MIN_RUN)) {
    warnings.push("sequence")
    penalty += rawBits * 0.25
  }
  if (hasRepeatedRun(pw, REPEAT_MIN_RUN)) {
    warnings.push("repeat")
    penalty += rawBits * 0.25
  }
  if (hasKeyboardPattern(pw, SEQUENCE_MIN_RUN)) {
    warnings.push("keyboard")
    penalty += rawBits * 0.2
  }
  if (pw.length < 8) {
    warnings.push("short")
  }

  const entropyBits = Math.max(0, Math.round((rawBits - penalty) * 10) / 10)
  const score = scoreFromEntropy(entropyBits)

  // guesses needed ~= 2^bits; assume the attacker finds it halfway on average.
  const guesses = Math.pow(2, entropyBits) / 2
  const crackTimes: CrackTimes = {
    onlineSeconds: guesses / GUESSES_PER_SECOND.online,
    offlineSeconds: guesses / GUESSES_PER_SECOND.offline,
    supercomputerSeconds: guesses / GUESSES_PER_SECOND.supercomputer,
  }

  return { entropyBits, score, crackTimes, warnings }
}

const SECOND = 1
const MINUTE = 60
const HOUR = 3600
const DAY = 86400
const YEAR = 31557600 // 365.25 days
const CENTURY = YEAR * 100

/** Format a seconds-to-crack value into a short human-readable label. */
export function formatCrackTime(seconds: number): string {
  if (!isFinite(seconds)) return "centuries"
  if (seconds < SECOND) return "instant"
  if (seconds < MINUTE) return `${Math.round(seconds)} sec`
  if (seconds < HOUR) return `${Math.round(seconds / MINUTE)} min`
  if (seconds < DAY) return `${Math.round(seconds / HOUR)} hr`
  if (seconds < YEAR) return `${Math.round(seconds / DAY)} days`
  if (seconds < CENTURY) return `${Math.round(seconds / YEAR)} years`
  return "centuries"
}
