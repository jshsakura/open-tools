export type CorsTarget =
  | "nginx"
  | "express"
  | "spring"
  | "apache"
  | "vercel"

export interface CorsOptions {
  origin: string
  methods: string[]
  allowedHeaders: string[]
  exposedHeaders: string[]
  allowCredentials: boolean
  maxAge: number
}

export interface CorsResult {
  config: string
  /** True when credentials are enabled together with the `*` wildcard origin. */
  credentialsWildcardWarning: boolean
}

const quote = (value: string) => `"${value}"`

function joinList(values: string[]): string {
  return values.join(", ")
}

function buildNginx(o: CorsOptions): string {
  const lines = [
    "# NGINX",
    `add_header 'Access-Control-Allow-Origin' '${o.origin}' always;`,
    `add_header 'Access-Control-Allow-Methods' '${joinList(o.methods)}' always;`,
  ]
  if (o.allowedHeaders.length > 0) {
    lines.push(
      `add_header 'Access-Control-Allow-Headers' '${joinList(o.allowedHeaders)}' always;`
    )
  }
  if (o.exposedHeaders.length > 0) {
    lines.push(
      `add_header 'Access-Control-Expose-Headers' '${joinList(o.exposedHeaders)}' always;`
    )
  }
  if (o.allowCredentials) {
    lines.push(`add_header 'Access-Control-Allow-Credentials' 'true' always;`)
  }
  lines.push(`add_header 'Access-Control-Max-Age' '${o.maxAge}' always;`)
  return lines.join("\n")
}

function buildExpress(o: CorsOptions): string {
  const props = [
    `  origin: "${o.origin}",`,
    `  methods: [${o.methods.map(quote).join(", ")}],`,
  ]
  if (o.allowedHeaders.length > 0) {
    props.push(`  allowedHeaders: [${o.allowedHeaders.map(quote).join(", ")}],`)
  }
  if (o.exposedHeaders.length > 0) {
    props.push(`  exposedHeaders: [${o.exposedHeaders.map(quote).join(", ")}],`)
  }
  if (o.allowCredentials) {
    props.push(`  credentials: true,`)
  }
  props.push(`  maxAge: ${o.maxAge},`)
  return `// Express (cors middleware)
import cors from "cors"

app.use(cors({
${props.join("\n")}
}))`
}

function buildSpring(o: CorsOptions): string {
  const lines = [
    "// Spring (WebMvcConfigurer)",
    "@Override",
    "public void addCorsMappings(CorsRegistry registry) {",
    '  registry.addMapping("/**")',
    `    .allowedOrigins("${o.origin}")`,
    `    .allowedMethods(${o.methods.map(quote).join(", ")})`,
  ]
  if (o.allowedHeaders.length > 0) {
    lines.push(`    .allowedHeaders(${o.allowedHeaders.map(quote).join(", ")})`)
  }
  if (o.exposedHeaders.length > 0) {
    lines.push(`    .exposedHeaders(${o.exposedHeaders.map(quote).join(", ")})`)
  }
  if (o.allowCredentials) {
    lines.push(`    .allowCredentials(true)`)
  }
  lines.push(`    .maxAge(${o.maxAge});`)
  lines.push("}")
  return lines.join("\n")
}

function buildApache(o: CorsOptions): string {
  const lines = [
    "# Apache (mod_headers)",
    `Header set Access-Control-Allow-Origin "${o.origin}"`,
    `Header set Access-Control-Allow-Methods "${joinList(o.methods)}"`,
  ]
  if (o.allowedHeaders.length > 0) {
    lines.push(`Header set Access-Control-Allow-Headers "${joinList(o.allowedHeaders)}"`)
  }
  if (o.exposedHeaders.length > 0) {
    lines.push(`Header set Access-Control-Expose-Headers "${joinList(o.exposedHeaders)}"`)
  }
  if (o.allowCredentials) {
    lines.push(`Header set Access-Control-Allow-Credentials "true"`)
  }
  lines.push(`Header set Access-Control-Max-Age "${o.maxAge}"`)
  return lines.join("\n")
}

function buildVercel(o: CorsOptions): string {
  const headers = [
    { key: "Access-Control-Allow-Origin", value: o.origin },
    { key: "Access-Control-Allow-Methods", value: joinList(o.methods) },
  ]
  if (o.allowedHeaders.length > 0) {
    headers.push({ key: "Access-Control-Allow-Headers", value: joinList(o.allowedHeaders) })
  }
  if (o.exposedHeaders.length > 0) {
    headers.push({ key: "Access-Control-Expose-Headers", value: joinList(o.exposedHeaders) })
  }
  if (o.allowCredentials) {
    headers.push({ key: "Access-Control-Allow-Credentials", value: "true" })
  }
  headers.push({ key: "Access-Control-Max-Age", value: String(o.maxAge) })

  const config = {
    headers: [
      {
        source: "/(.*)",
        headers,
      },
    ],
  }
  return `// vercel.json\n${JSON.stringify(config, null, 2)}`
}

const BUILDERS: Record<CorsTarget, (o: CorsOptions) => string> = {
  nginx: buildNginx,
  express: buildExpress,
  spring: buildSpring,
  apache: buildApache,
  vercel: buildVercel,
}

/**
 * Generates a CORS config snippet for the given target server. The returned
 * result also flags the invalid `origin: *` + credentials combination, which
 * browsers reject.
 */
export function generateCors(opts: CorsOptions, target: CorsTarget): CorsResult {
  const builder = BUILDERS[target] ?? BUILDERS.nginx
  return {
    config: builder(opts),
    credentialsWildcardWarning: opts.allowCredentials && opts.origin.trim() === "*",
  }
}
