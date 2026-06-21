export const COMMIT_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
] as const

export type CommitType = (typeof COMMIT_TYPES)[number]

export const GITMOJI: Record<CommitType, string> = {
  feat: "✨", // sparkles
  fix: "🐛", // bug
  docs: "📝", // memo
  style: "💄", // lipstick
  refactor: "♻️", // recycle
  perf: "⚡️", // zap
  test: "✅", // white check mark
  build: "📦", // package
  ci: "👷", // construction worker
  chore: "🔧", // wrench
}

export const SUBJECT_MAX = 50
export const BODY_LINE_MAX = 72

export type CommitInput = {
  type: string
  scope: string
  subject: string
  body: string
  footer: string
  gitmoji: boolean
}

export function buildSubject(input: CommitInput): string {
  const { type, scope, subject, gitmoji } = input
  const emoji = gitmoji && type in GITMOJI ? `${GITMOJI[type as CommitType]} ` : ""
  const scopePart = scope ? `(${scope})` : ""
  return `${type}${scopePart}: ${emoji}${subject}`
}

export function buildCommitMessage(input: CommitInput): string {
  const subjectLine = buildSubject(input)
  const sections = [subjectLine]
  if (input.body.trim()) {
    sections.push(input.body.trim())
  }
  if (input.footer.trim()) {
    sections.push(input.footer.trim())
  }
  // Conventional Commits: blank line between subject, body, and footer.
  return sections.join("\n\n")
}

function escapeForShell(value: string): string {
  return value.replace(/"/g, '\\"')
}

export function buildGitCommand(input: CommitInput): string {
  const message = buildCommitMessage(input)
  // Each paragraph becomes its own -m so git inserts the required blank lines.
  const paragraphs = message.split("\n\n")
  return `git commit ${paragraphs.map((p) => `-m "${escapeForShell(p)}"`).join(" ")}`
}

export type LengthWarning = {
  over: boolean
  length: number
  limit: number
}

export function subjectWarning(input: CommitInput): LengthWarning {
  const length = buildSubject(input).length
  return { over: length > SUBJECT_MAX, length, limit: SUBJECT_MAX }
}

export function bodyWarning(body: string): LengthWarning {
  const longest = body
    .split("\n")
    .reduce((max, line) => Math.max(max, line.length), 0)
  return { over: longest > BODY_LINE_MAX, length: longest, limit: BODY_LINE_MAX }
}
