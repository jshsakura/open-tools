import { describe, expect, it } from "vitest"

import {
  bodyWarning,
  buildCommitMessage,
  buildGitCommand,
  buildSubject,
  subjectWarning,
  type CommitInput,
} from "./git-commit-helper.utils"

const base: CommitInput = {
  type: "feat",
  scope: "",
  subject: "add login form",
  body: "",
  footer: "",
  gitmoji: false,
}

describe("git-commit-helper utils", () => {
  describe("buildSubject", () => {
    it("formats type and subject without scope", () => {
      expect(buildSubject(base)).toBe("feat: add login form")
    })

    it("includes the scope in parentheses when present", () => {
      expect(buildSubject({ ...base, scope: "auth" })).toBe("feat(auth): add login form")
    })

    it("prepends the matching gitmoji when enabled", () => {
      const result = buildSubject({ ...base, gitmoji: true })
      expect(result).toBe("feat: ✨ add login form")
    })

    it("does not prepend an emoji when gitmoji is disabled", () => {
      expect(buildSubject({ ...base, gitmoji: false })).not.toContain("✨")
    })
  })

  describe("buildCommitMessage", () => {
    it("returns just the subject line when no body or footer", () => {
      expect(buildCommitMessage(base)).toBe("feat: add login form")
    })

    it("separates subject and body with a blank line", () => {
      const msg = buildCommitMessage({ ...base, body: "Adds client-side validation." })
      expect(msg).toBe("feat: add login form\n\nAdds client-side validation.")
    })

    it("appends the footer after a blank line", () => {
      const msg = buildCommitMessage({
        ...base,
        body: "Body text.",
        footer: "Closes #123",
      })
      expect(msg).toBe("feat: add login form\n\nBody text.\n\nCloses #123")
    })

    it("supports a BREAKING CHANGE footer", () => {
      const msg = buildCommitMessage({
        ...base,
        footer: "BREAKING CHANGE: drops the v1 endpoint",
      })
      expect(msg).toContain("BREAKING CHANGE: drops the v1 endpoint")
    })

    it("trims whitespace-only body and footer", () => {
      const msg = buildCommitMessage({ ...base, body: "   ", footer: "  " })
      expect(msg).toBe("feat: add login form")
    })
  })

  describe("buildGitCommand", () => {
    it("uses a single -m for a subject-only commit", () => {
      expect(buildGitCommand(base)).toBe('git commit -m "feat: add login form"')
    })

    it("uses one -m per paragraph for body and footer", () => {
      const cmd = buildGitCommand({ ...base, body: "Body.", footer: "Closes #1" })
      expect(cmd).toBe('git commit -m "feat: add login form" -m "Body." -m "Closes #1"')
    })

    it("escapes double quotes in the subject", () => {
      const cmd = buildGitCommand({ ...base, subject: 'fix "thing"' })
      expect(cmd).toContain('\\"thing\\"')
    })
  })

  describe("subjectWarning", () => {
    it("does not flag a short subject", () => {
      expect(subjectWarning(base).over).toBe(false)
    })

    it("flags a subject line over 50 characters", () => {
      const long = "a".repeat(60)
      const warn = subjectWarning({ ...base, subject: long })
      expect(warn.over).toBe(true)
      expect(warn.limit).toBe(50)
    })
  })

  describe("bodyWarning", () => {
    it("does not flag short body lines", () => {
      expect(bodyWarning("short line\nanother").over).toBe(false)
    })

    it("flags the longest body line over 72 characters", () => {
      const body = "ok\n" + "b".repeat(80)
      const warn = bodyWarning(body)
      expect(warn.over).toBe(true)
      expect(warn.length).toBe(80)
      expect(warn.limit).toBe(72)
    })
  })
})
