export type ServiceId = "node" | "postgres" | "mysql" | "mongo" | "redis" | "nginx" | "minio" | "rabbitmq"

export type ServiceConfig = {
  enabled: boolean
  tag: string
  hostPort: string
}

export type ComposeOptions = {
  services: Record<ServiceId, ServiceConfig>
  restart: string
}

type ServiceDefinition = {
  name: string
  defaultTag: string
  defaultHostPort: string
  containerPort: string
  build: (cfg: ServiceConfig, restart: string) => string
  volume?: { name: string; mount: string }
  dependsOn?: ServiceId[]
}

const INDENT = "  "

function restartLine(restart: string): string {
  return restart && restart !== "no" ? `\n    restart: ${restart}` : ""
}

export const SERVICE_DEFINITIONS: Record<ServiceId, ServiceDefinition> = {
  node: {
    name: "web",
    defaultTag: "18-alpine",
    defaultHostPort: "3000",
    containerPort: "3000",
    dependsOn: ["postgres", "mysql", "mongo", "redis"],
    build: (cfg, restart) =>
      `  web:\n    image: node:${cfg.tag}\n    command: npm start\n    ports:\n      - "${cfg.hostPort}:3000"\n    environment:\n      - NODE_ENV=production${restartLine(restart)}`,
  },
  postgres: {
    name: "db",
    defaultTag: "15-alpine",
    defaultHostPort: "5432",
    containerPort: "5432",
    volume: { name: "pgdata", mount: "/var/lib/postgresql/data" },
    build: (cfg, restart) =>
      `  db:\n    image: postgres:${cfg.tag}\n    environment:\n      POSTGRES_USER: root\n      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}\n    ports:\n      - "${cfg.hostPort}:5432"\n    volumes:\n      - pgdata:/var/lib/postgresql/data${restartLine(restart)}`,
  },
  mysql: {
    name: "mysql",
    defaultTag: "8",
    defaultHostPort: "3306",
    containerPort: "3306",
    volume: { name: "mysqldata", mount: "/var/lib/mysql" },
    build: (cfg, restart) =>
      `  mysql:\n    image: mysql:${cfg.tag}\n    environment:\n      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}\n      MYSQL_DATABASE: app\n    ports:\n      - "${cfg.hostPort}:3306"\n    volumes:\n      - mysqldata:/var/lib/mysql${restartLine(restart)}`,
  },
  mongo: {
    name: "mongo",
    defaultTag: "7",
    defaultHostPort: "27017",
    containerPort: "27017",
    volume: { name: "mongodata", mount: "/data/db" },
    build: (cfg, restart) =>
      `  mongo:\n    image: mongo:${cfg.tag}\n    environment:\n      MONGO_INITDB_ROOT_USERNAME: root\n      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_PASSWORD}\n    ports:\n      - "${cfg.hostPort}:27017"\n    volumes:\n      - mongodata:/data/db${restartLine(restart)}`,
  },
  redis: {
    name: "cache",
    defaultTag: "7-alpine",
    defaultHostPort: "6379",
    containerPort: "6379",
    volume: { name: "redisdata", mount: "/data" },
    build: (cfg, restart) =>
      `  cache:\n    image: redis:${cfg.tag}\n    ports:\n      - "${cfg.hostPort}:6379"\n    volumes:\n      - redisdata:/data${restartLine(restart)}`,
  },
  nginx: {
    name: "nginx",
    defaultTag: "1.27-alpine",
    defaultHostPort: "80",
    containerPort: "80",
    dependsOn: ["node"],
    build: (cfg, restart) =>
      `  nginx:\n    image: nginx:${cfg.tag}\n    ports:\n      - "${cfg.hostPort}:80"\n    volumes:\n      - ./nginx.conf:/etc/nginx/nginx.conf:ro${restartLine(restart)}`,
  },
  minio: {
    name: "minio",
    defaultTag: "latest",
    defaultHostPort: "9000",
    containerPort: "9000",
    volume: { name: "miniodata", mount: "/data" },
    build: (cfg, restart) =>
      `  minio:\n    image: minio/minio:${cfg.tag}\n    command: server /data --console-address ":9001"\n    environment:\n      MINIO_ROOT_USER: \${MINIO_ROOT_USER}\n      MINIO_ROOT_PASSWORD: \${MINIO_ROOT_PASSWORD}\n    ports:\n      - "${cfg.hostPort}:9000"\n      - "9001:9001"\n    volumes:\n      - miniodata:/data${restartLine(restart)}`,
  },
  rabbitmq: {
    name: "rabbitmq",
    defaultTag: "3-management-alpine",
    defaultHostPort: "5672",
    containerPort: "5672",
    volume: { name: "rabbitmqdata", mount: "/var/lib/rabbitmq" },
    build: (cfg, restart) =>
      `  rabbitmq:\n    image: rabbitmq:${cfg.tag}\n    environment:\n      RABBITMQ_DEFAULT_USER: \${RABBITMQ_USER}\n      RABBITMQ_DEFAULT_PASS: \${RABBITMQ_PASSWORD}\n    ports:\n      - "${cfg.hostPort}:5672"\n      - "15672:15672"\n    volumes:\n      - rabbitmqdata:/var/lib/rabbitmq${restartLine(restart)}`,
  },
}

export const SERVICE_ORDER: ServiceId[] = [
  "node",
  "postgres",
  "mysql",
  "mongo",
  "redis",
  "nginx",
  "minio",
  "rabbitmq",
]

export const RESTART_POLICIES = ["no", "always", "on-failure", "unless-stopped"] as const

export const NETWORK_NAME = "appnet"

export function defaultServiceConfig(id: ServiceId): ServiceConfig {
  const def = SERVICE_DEFINITIONS[id]
  return { enabled: false, tag: def.defaultTag, hostPort: def.defaultHostPort }
}

export function defaultOptions(): ComposeOptions {
  const services = {} as Record<ServiceId, ServiceConfig>
  SERVICE_ORDER.forEach((id) => {
    services[id] = defaultServiceConfig(id)
  })
  services.node = { ...services.node, enabled: true }
  services.postgres = { ...services.postgres, enabled: true }
  return { services, restart: "unless-stopped" }
}

function enabledIds(opts: ComposeOptions): ServiceId[] {
  return SERVICE_ORDER.filter((id) => opts.services[id]?.enabled)
}

function buildDependsOn(id: ServiceId, active: Set<ServiceId>): string {
  const def = SERVICE_DEFINITIONS[id]
  if (!def.dependsOn) return ""
  const deps = def.dependsOn.filter((d) => active.has(d)).map((d) => SERVICE_DEFINITIONS[d].name)
  if (deps.length === 0) return ""
  return `\n    depends_on:${deps.map((name) => `\n      - ${name}`).join("")}`
}

export function generateCompose(opts: ComposeOptions): string {
  const active = new Set(enabledIds(opts))
  const ids = enabledIds(opts)

  const serviceBlocks = ids.map((id) => {
    const def = SERVICE_DEFINITIONS[id]
    const block = def.build(opts.services[id], opts.restart)
    const dependsOn = buildDependsOn(id, active)
    const networkLine = `\n    networks:\n      - ${NETWORK_NAME}`
    return `${block}${dependsOn}${networkLine}`
  })

  const namedVolumes = ids
    .map((id) => SERVICE_DEFINITIONS[id].volume?.name)
    .filter((v): v is string => Boolean(v))

  const servicesSection = serviceBlocks.length
    ? `\n${serviceBlocks.join("\n")}`
    : ""

  const volumesSection = namedVolumes.length
    ? `\n\nvolumes:${namedVolumes.map((v) => `\n${INDENT}${v}:`).join("")}`
    : ""

  const networksSection = ids.length
    ? `\n\nnetworks:\n${INDENT}${NETWORK_NAME}:\n${INDENT}${INDENT}driver: bridge`
    : ""

  return `version: '3.8'

services:${servicesSection}${volumesSection}${networksSection}`
}
