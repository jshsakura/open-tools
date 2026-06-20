// Korean 주민등록번호 (Resident Registration Number) checksum weights
// Applied over the first 12 digits.
const RRN_WEIGHTS = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]
const RRN_LENGTH = 13

// Korean 사업자등록번호 (Business Registration Number) checksum weights
// Applied over the first 9 digits.
const BUSINESS_WEIGHTS = [1, 3, 7, 1, 3, 7, 1, 3, 5]
const BUSINESS_LENGTH = 10

/**
 * Validates a Korean 주민등록번호 (13-digit RRN) by its checksum.
 *
 * Algorithm:
 *   sum = Σ digit[i] * weight[i] for i in 0..11
 *   checkDigit = (11 - (sum % 11)) % 10
 *   valid when checkDigit === digit[12]
 *
 * Non-digit characters (e.g. hyphens, spaces) are stripped before validation.
 */
export function validateRrn(value: string): boolean {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length !== RRN_LENGTH) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += Number(cleaned[i]) * RRN_WEIGHTS[i]
  }
  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === Number(cleaned[12])
}

/**
 * Validates a Korean 사업자등록번호 (10-digit business number) by its checksum.
 *
 * Algorithm:
 *   sum = Σ digit[i] * weight[i] for i in 0..8
 *   sum += floor(digit[8] * 5 / 10)
 *   checkDigit = (10 - (sum % 10)) % 10
 *   valid when checkDigit === digit[9]
 *
 * Non-digit characters (e.g. hyphens, spaces) are stripped before validation.
 */
export function validateBusinessNumber(value: string): boolean {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length !== BUSINESS_LENGTH) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number(cleaned[i]) * BUSINESS_WEIGHTS[i]
  }
  sum += Math.floor((Number(cleaned[8]) * 5) / 10)
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === Number(cleaned[9])
}
