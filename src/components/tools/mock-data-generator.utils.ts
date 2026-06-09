const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery",
  "Quinn", "Sam", "Drew", "Skyler", "Robin", "Cameron", "Hayden", "Reese",
]
const LAST_NAMES = [
  "Smith", "Johnson", "Lee", "Brown", "Garcia", "Martinez", "Davis", "Lopez",
  "Wilson", "Anderson", "Thomas", "Moore", "Kim", "Park", "Nguyen", "Patel",
]
const DOMAINS = ["example.com", "mail.com", "test.org", "demo.net", "inbox.io"]
const CITIES = [
  "Seoul", "New York", "London", "Tokyo", "Berlin", "Paris", "Sydney",
  "Toronto", "Singapore", "Madrid",
]

export type MockField =
  | "id"
  | "name"
  | "email"
  | "phone"
  | "city"
  | "company"
  | "uuid"
  | "boolean"

export const MOCK_FIELDS: MockField[] = [
  "id",
  "name",
  "email",
  "phone",
  "city",
  "company",
  "uuid",
  "boolean",
]

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomDigits(length: number): string {
  let out = ""
  for (let i = 0; i < length; i += 1) out += Math.floor(Math.random() * 10)
  return out
}

function uuidv4(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const r = (Math.random() * 16) | 0
    const v = char === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function fieldValue(field: MockField, index: number): string | number | boolean {
  const first = pick(FIRST_NAMES)
  const last = pick(LAST_NAMES)
  switch (field) {
    case "id":
      return index + 1
    case "name":
      return `${first} ${last}`
    case "email":
      return `${first.toLowerCase()}.${last.toLowerCase()}@${pick(DOMAINS)}`
    case "phone":
      return `+1-${randomDigits(3)}-${randomDigits(3)}-${randomDigits(4)}`
    case "city":
      return pick(CITIES)
    case "company":
      return `${last} ${pick(["Labs", "Group", "Inc", "Studio", "Works"])}`
    case "uuid":
      return uuidv4()
    case "boolean":
      return Math.random() > 0.5
    default:
      return ""
  }
}

export function generateRows(
  fields: MockField[],
  count: number,
): Array<Record<string, string | number | boolean>> {
  const safeCount = Math.max(1, Math.min(1000, Math.floor(count)))
  const activeFields = fields.length > 0 ? fields : MOCK_FIELDS
  return Array.from({ length: safeCount }, (_, index) => {
    const row: Record<string, string | number | boolean> = {}
    for (const field of activeFields) {
      row[field] = fieldValue(field, index)
    }
    return row
  })
}

export function toCsv(
  rows: Array<Record<string, string | number | boolean>>,
): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const escape = (value: string | number | boolean) => {
    const str = String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ]
  return lines.join("\n")
}
