import slugify from "slugify"
import { romanize } from "es-hangul"

export type SlugSeparator = "-" | "_"

export interface SlugOptions {
  separator: SlugSeparator
  lowercase: boolean
  stripSpecial: boolean
  maxLength: number
}

export const DEFAULT_SLUG_OPTIONS: SlugOptions = {
  separator: "-",
  lowercase: true,
  stripSpecial: true,
  maxLength: 0,
}

const HANGUL_PATTERN = /[㄰-㆏가-힣]/

function hasHangul(text: string): boolean {
  return HANGUL_PATTERN.test(text)
}

/**
 * Convert a single line of text into a URL-safe slug.
 * Korean input is transliterated to Latin via es-hangul `romanize`
 * before slugifying; everything else is passed straight to slugify.
 */
export function generateSlug(text: string, options: SlugOptions): string {
  const source = text ?? ""
  const trimmed = source.trim()
  if (trimmed === "") return ""

  const prepared = hasHangul(trimmed) ? romanize(trimmed) : trimmed

  const slug = slugify(prepared, {
    replacement: options.separator,
    lower: options.lowercase,
    strict: options.stripSpecial,
    trim: true,
  })

  if (options.maxLength > 0 && slug.length > options.maxLength) {
    return trimSeparators(slug.slice(0, options.maxLength), options.separator)
  }

  return slug
}

/**
 * Process multi-line input, returning one slug per non-empty line.
 */
export function generateSlugs(multiline: string, options: SlugOptions): string[] {
  const source = multiline ?? ""
  return source
    .split(/\r?\n/)
    .map((line) => generateSlug(line, options))
    .filter((slug) => slug !== "")
}

function trimSeparators(value: string, separator: SlugSeparator): string {
  let result = value
  while (result.endsWith(separator)) {
    result = result.slice(0, -1)
  }
  while (result.startsWith(separator)) {
    result = result.slice(1)
  }
  return result
}
