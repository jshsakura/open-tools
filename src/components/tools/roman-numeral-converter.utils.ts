const ROMAN_MAP: Array<[number, string]> = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
]

export const ROMAN_MAX = 3999
export const ROMAN_MIN = 1

export function toRoman(value: number): string | null {
  if (!Number.isInteger(value) || value < ROMAN_MIN || value > ROMAN_MAX) {
    return null
  }
  let remaining = value
  let result = ""
  for (const [num, symbol] of ROMAN_MAP) {
    while (remaining >= num) {
      result += symbol
      remaining -= num
    }
  }
  return result
}

const VALID_ROMAN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i

export function fromRoman(input: string): number | null {
  const value = input.trim().toUpperCase()
  if (!value || !VALID_ROMAN.test(value)) return null

  const singles: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }
  let total = 0
  for (let i = 0; i < value.length; i += 1) {
    const current = singles[value[i]]
    const next = singles[value[i + 1]]
    if (next && current < next) {
      total -= current
    } else {
      total += current
    }
  }
  return total
}
