export interface GitignoreTemplate {
  id: string
  label: string
  patterns: string[]
}

// Curated, commonly-used .gitignore templates. Kept intentionally compact —
// the goal is sensible defaults per stack, not an exhaustive mirror of
// github/gitignore. Patterns are merged and de-duplicated on output.
export const GITIGNORE_TEMPLATES: GitignoreTemplate[] = [
  {
    id: "node",
    label: "Node",
    patterns: [
      "node_modules/",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      ".pnpm-debug.log*",
      ".npm",
      "dist/",
      "build/",
      "coverage/",
      ".env",
      ".env.local",
      ".env.*.local",
    ],
  },
  {
    id: "python",
    label: "Python",
    patterns: [
      "__pycache__/",
      "*.py[cod]",
      "*$py.class",
      ".Python",
      "build/",
      "dist/",
      "*.egg-info/",
      ".eggs/",
      ".venv/",
      "venv/",
      "env/",
      ".pytest_cache/",
      ".mypy_cache/",
      ".coverage",
      "htmlcov/",
    ],
  },
  {
    id: "java",
    label: "Java",
    patterns: [
      "*.class",
      "*.log",
      "*.jar",
      "*.war",
      "*.ear",
      "target/",
      "build/",
      ".gradle/",
      "hs_err_pid*",
    ],
  },
  {
    id: "go",
    label: "Go",
    patterns: [
      "*.exe",
      "*.exe~",
      "*.dll",
      "*.so",
      "*.dylib",
      "*.test",
      "*.out",
      "go.work",
      "vendor/",
      "bin/",
    ],
  },
  {
    id: "rust",
    label: "Rust",
    patterns: ["/target/", "Cargo.lock", "**/*.rs.bk", "*.pdb"],
  },
  {
    id: "nextjs",
    label: "Next.js",
    patterns: [
      ".next/",
      "out/",
      "next-env.d.ts",
      ".vercel",
      "*.tsbuildinfo",
    ],
  },
  {
    id: "macos",
    label: "macOS",
    patterns: [
      ".DS_Store",
      ".AppleDouble",
      ".LSOverride",
      "._*",
      ".Spotlight-V100",
      ".Trashes",
    ],
  },
  {
    id: "windows",
    label: "Windows",
    patterns: [
      "Thumbs.db",
      "Thumbs.db:encryptable",
      "ehthumbs.db",
      "Desktop.ini",
      "$RECYCLE.BIN/",
      "*.lnk",
    ],
  },
  {
    id: "vscode",
    label: "VS Code",
    patterns: [".vscode/*", "!.vscode/settings.json", "!.vscode/extensions.json", "*.code-workspace"],
  },
  {
    id: "jetbrains",
    label: "JetBrains",
    patterns: [".idea/", "*.iml", "*.ipr", "*.iws", "out/"],
  },
]

export function buildGitignore(selectedIds: string[]): string {
  const selected = GITIGNORE_TEMPLATES.filter((tpl) =>
    selectedIds.includes(tpl.id),
  )
  if (selected.length === 0) return ""

  const seen = new Set<string>()
  const blocks = selected.map((tpl) => {
    const uniquePatterns = tpl.patterns.filter((pattern) => {
      if (seen.has(pattern)) return false
      seen.add(pattern)
      return true
    })
    return [`# ${tpl.label}`, ...uniquePatterns].join("\n")
  })

  return `${blocks.join("\n\n")}\n`
}
