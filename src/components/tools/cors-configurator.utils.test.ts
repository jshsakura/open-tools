import { describe, expect, it } from "vitest"

import { generateCors, type CorsOptions } from "./cors-configurator.utils"

const baseOpts: CorsOptions = {
  origin: "https://example.com",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
  allowCredentials: true,
  maxAge: 86400,
}

describe("generateCors directives per target", () => {
  it("nginx output contains add_header directives for each option", () => {
    const { config } = generateCors(baseOpts, "nginx")
    expect(config).toContain("# NGINX")
    expect(config).toContain("Access-Control-Allow-Origin")
    expect(config).toContain("GET, POST, OPTIONS")
    expect(config).toContain("Access-Control-Allow-Headers")
    expect(config).toContain("Access-Control-Expose-Headers")
    expect(config).toContain("Access-Control-Allow-Credentials")
    expect(config).toContain("Access-Control-Max-Age")
  })

  it("express output contains cors() options", () => {
    const { config } = generateCors(baseOpts, "express")
    expect(config).toContain("import cors")
    expect(config).toContain('origin: "https://example.com"')
    expect(config).toContain('allowedHeaders: ["Content-Type", "Authorization"]')
    expect(config).toContain("credentials: true")
    expect(config).toContain("maxAge: 86400")
  })

  it("spring output contains WebMvcConfigurer directives", () => {
    const { config } = generateCors(baseOpts, "spring")
    expect(config).toContain("addCorsMappings")
    expect(config).toContain('.allowedOrigins("https://example.com")')
    expect(config).toContain(".allowedHeaders(")
    expect(config).toContain(".allowCredentials(true)")
    expect(config).toContain(".maxAge(86400)")
  })

  it("apache output contains Header set directives", () => {
    const { config } = generateCors(baseOpts, "apache")
    expect(config).toContain("# Apache")
    expect(config).toContain('Header set Access-Control-Allow-Origin "https://example.com"')
    expect(config).toContain("Header set Access-Control-Allow-Credentials")
    expect(config).toContain('Header set Access-Control-Max-Age "86400"')
  })

  it("vercel output is valid vercel.json with a headers array", () => {
    const { config } = generateCors(baseOpts, "vercel")
    expect(config).toContain("vercel.json")
    const json = JSON.parse(config.replace("// vercel.json\n", ""))
    expect(json.headers[0].source).toBe("/(.*)")
    const keys = json.headers[0].headers.map((h: { key: string }) => h.key)
    expect(keys).toContain("Access-Control-Allow-Origin")
    expect(keys).toContain("Access-Control-Allow-Credentials")
    expect(keys).toContain("Access-Control-Max-Age")
  })
})

describe("generateCors credentials + wildcard warning", () => {
  it("flags the invalid `*` origin + credentials combination", () => {
    const { credentialsWildcardWarning } = generateCors(
      { ...baseOpts, origin: "*", allowCredentials: true },
      "express"
    )
    expect(credentialsWildcardWarning).toBe(true)
  })

  it("does not flag wildcard origin when credentials are disabled", () => {
    const { credentialsWildcardWarning } = generateCors(
      { ...baseOpts, origin: "*", allowCredentials: false },
      "express"
    )
    expect(credentialsWildcardWarning).toBe(false)
  })

  it("does not flag a specific origin with credentials enabled", () => {
    const { credentialsWildcardWarning } = generateCors(
      { ...baseOpts, origin: "https://app.example.com", allowCredentials: true },
      "express"
    )
    expect(credentialsWildcardWarning).toBe(false)
  })

  it("omits optional directives when header lists are empty", () => {
    const { config } = generateCors(
      { ...baseOpts, allowedHeaders: [], exposedHeaders: [], allowCredentials: false },
      "nginx"
    )
    expect(config).not.toContain("Access-Control-Allow-Headers")
    expect(config).not.toContain("Access-Control-Expose-Headers")
    expect(config).not.toContain("Access-Control-Allow-Credentials")
  })
})
