export type ComposeOptions = {
  node: boolean
  postgres: boolean
  redis: boolean
}

export function generateCompose(opts: ComposeOptions): string {
  const { node, postgres, redis } = opts

  const namedVolumes = [postgres ? "pgdata" : "", redis ? "redisdata" : ""].filter(Boolean)

  return `version: '3.8'

services:${node ? `\n  web:\n    image: node:18-alpine\n    command: npm start\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production` : ""}${postgres ? `\n  db:\n    image: postgres:15-alpine\n    environment:\n      POSTGRES_USER: root\n      POSTGRES_PASSWORD: secret_password\n    ports:\n      - "5432:5432"\n    volumes:\n      - pgdata:/var/lib/postgresql/data` : ""}${redis ? `\n  cache:\n    image: redis:7-alpine\n    ports:\n      - "6379:6379"\n    volumes:\n      - redisdata:/data` : ""}${namedVolumes.length ? `\n\nvolumes:${namedVolumes.map((v) => `\n  ${v}:`).join("")}` : ""}`
}
