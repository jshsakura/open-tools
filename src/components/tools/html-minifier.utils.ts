export interface MinifyResult {
  output: string
  originalSize: number
  minifiedSize: number
  savedPercent: number
}

// Lightweight, dependency-free HTML minifier: strips comments and collapses
// insignificant whitespace. Intentionally conservative — it does not touch the
// contents of <pre>, <textarea>, <script>, or <style> blocks so meaningful
// whitespace and code are preserved.
const PRESERVE_PATTERN =
  /(<pre[\s\S]*?<\/pre>|<textarea[\s\S]*?<\/textarea>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/gi

function collapse(segment: string): string {
  return segment
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim()
}

export function minifyHtml(input: string): MinifyResult {
  const originalSize = new Blob([input]).size

  const parts = input.split(PRESERVE_PATTERN)
  const output = parts
    .map((part, index) => (index % 2 === 1 ? part : collapse(part)))
    .join("")
    .trim()

  const minifiedSize = new Blob([output]).size
  const savedPercent =
    originalSize === 0
      ? 0
      : Math.round(((originalSize - minifiedSize) / originalSize) * 1000) / 10

  return { output, originalSize, minifiedSize, savedPercent }
}
