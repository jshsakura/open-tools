import { describe, expect, it } from "vitest"

import {
  defaultOptions,
  defaultServiceConfig,
  generateCompose,
  SERVICE_ORDER,
  type ComposeOptions,
  type ServiceId,
} from "./docker-compose-generator.utils"

// Build options enabling only the named services, leaving the rest at defaults.
// Keeps tests immutable: every call returns a fresh options object.
function opts(enabled: Partial<Record<ServiceId, boolean>>, restart = "unless-stopped"): ComposeOptions {
  const services = {} as ComposeOptions["services"]
  SERVICE_ORDER.forEach((id) => {
    services[id] = { ...defaultServiceConfig(id), enabled: Boolean(enabled[id]) }
  })
  return { services, restart }
}

describe("docker-compose-generator utils", () => {
  describe("no services selected", () => {
    it("emits the version header and an empty services block", () => {
      const yml = generateCompose(opts({}))
      expect(yml).toContain("version: '3.8'")
      expect(yml).toContain("services:")
    })

    it("omits all service blocks when nothing is selected", () => {
      const yml = generateCompose(opts({}))
      expect(yml).not.toContain("web:")
      expect(yml).not.toContain("db:")
      expect(yml).not.toContain("cache:")
    })

    it("omits volumes and networks sections when no service is on", () => {
      const yml = generateCompose(opts({ node: true }))
      expect(yml).toContain("web:")
      expect(yml).not.toContain("\nvolumes:")
      expect(yml).not.toContain("pgdata")
      // node alone still gets a networks section because a service exists
      expect(yml).toContain("\nnetworks:")
    })
  })

  describe("postgres only", () => {
    it("includes the db service block with its image and port", () => {
      const yml = generateCompose(opts({ postgres: true }))
      expect(yml).toContain("db:")
      expect(yml).toContain("image: postgres:15-alpine")
      expect(yml).toContain('- "5432:5432"')
    })

    it("declares a top-level volumes section containing pgdata", () => {
      const yml = generateCompose(opts({ postgres: true }))
      expect(yml).toContain("\nvolumes:")
      expect(yml).toContain("pgdata:")
      expect(yml).toContain("- pgdata:/var/lib/postgresql/data")
      expect(yml).not.toContain("redisdata")
    })

    it("uses an env-var placeholder for the password, never a hardcoded secret", () => {
      const yml = generateCompose(opts({ postgres: true }))
      expect(yml).toContain("POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}")
      expect(yml).not.toContain("secret_password")
    })

    it("does not emit web or cache service blocks", () => {
      const yml = generateCompose(opts({ postgres: true }))
      expect(yml).not.toContain("web:")
      expect(yml).not.toContain("cache:")
    })
  })

  describe("redis only", () => {
    it("includes the cache service block with its image and port", () => {
      const yml = generateCompose(opts({ redis: true }))
      expect(yml).toContain("cache:")
      expect(yml).toContain("image: redis:7-alpine")
      expect(yml).toContain('- "6379:6379"')
    })

    it("declares a top-level volumes section containing redisdata only", () => {
      const yml = generateCompose(opts({ redis: true }))
      expect(yml).toContain("\nvolumes:")
      expect(yml).toContain("redisdata:")
      expect(yml).toContain("- redisdata:/data")
      expect(yml).not.toContain("pgdata")
    })
  })

  describe("multiple services", () => {
    it("includes all three legacy service blocks when every option is on", () => {
      const yml = generateCompose(opts({ node: true, postgres: true, redis: true }))
      expect(yml).toContain("web:")
      expect(yml).toContain("db:")
      expect(yml).toContain("cache:")
    })

    it("lists pgdata and redisdata under a single volumes section", () => {
      const yml = generateCompose(opts({ node: true, postgres: true, redis: true }))
      expect(yml).toContain("\nvolumes:")
      expect(yml).toContain("pgdata:")
      expect(yml).toContain("redisdata:")
      expect(yml.match(/\nvolumes:/g)?.length).toBe(1)
    })

    it("renders each selected service's port mapping", () => {
      const yml = generateCompose(opts({ node: true, postgres: true, redis: true }))
      expect(yml).toContain('- "3000:3000"')
      expect(yml).toContain('- "5432:5432"')
      expect(yml).toContain('- "6379:6379"')
    })
  })

  describe("new services", () => {
    it("emits a mysql service with env-var password and its volume", () => {
      const yml = generateCompose(opts({ mysql: true }))
      expect(yml).toContain("mysql:")
      expect(yml).toContain("image: mysql:8")
      expect(yml).toContain("MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}")
      expect(yml).toContain("mysqldata:")
    })

    it("emits a mongo service with its volume", () => {
      const yml = generateCompose(opts({ mongo: true }))
      expect(yml).toContain("mongo:")
      expect(yml).toContain("image: mongo:7")
      expect(yml).toContain("mongodata:/data/db")
    })

    it("emits an nginx service without a named volume", () => {
      const yml = generateCompose(opts({ nginx: true }))
      expect(yml).toContain("nginx:")
      expect(yml).toContain('- "80:80"')
      expect(yml).not.toContain("\nvolumes:")
    })

    it("emits a minio service exposing console port and data volume", () => {
      const yml = generateCompose(opts({ minio: true }))
      expect(yml).toContain("minio:")
      expect(yml).toContain("miniodata:/data")
      expect(yml).toContain('- "9001:9001"')
    })

    it("emits a rabbitmq service with management port", () => {
      const yml = generateCompose(opts({ rabbitmq: true }))
      expect(yml).toContain("rabbitmq:")
      expect(yml).toContain('- "15672:15672"')
      expect(yml).toContain("rabbitmqdata:")
    })
  })

  describe("per-service customization", () => {
    it("honors a custom image tag", () => {
      const base = opts({ postgres: true })
      const custom: ComposeOptions = {
        ...base,
        services: { ...base.services, postgres: { ...base.services.postgres, tag: "16" } },
      }
      const yml = generateCompose(custom)
      expect(yml).toContain("image: postgres:16")
    })

    it("honors a custom host port while keeping the container port fixed", () => {
      const base = opts({ redis: true })
      const custom: ComposeOptions = {
        ...base,
        services: { ...base.services, redis: { ...base.services.redis, hostPort: "6380" } },
      }
      const yml = generateCompose(custom)
      expect(yml).toContain('- "6380:6379"')
    })
  })

  describe("restart policy", () => {
    it("adds a restart line to every service when a policy is set", () => {
      const yml = generateCompose(opts({ node: true, postgres: true }, "always"))
      expect(yml.match(/restart: always/g)?.length).toBe(2)
    })

    it("omits the restart line when policy is 'no'", () => {
      const yml = generateCompose(opts({ node: true }, "no"))
      expect(yml).not.toContain("restart:")
    })
  })

  describe("networks", () => {
    it("declares a single bridge network and attaches every service to it", () => {
      const yml = generateCompose(opts({ node: true, postgres: true }))
      expect(yml).toContain("\nnetworks:")
      expect(yml).toContain("appnet:")
      expect(yml).toContain("driver: bridge")
      expect(yml.match(/- appnet/g)?.length).toBe(2)
    })
  })

  describe("depends_on", () => {
    it("makes web depend on enabled backing services", () => {
      const yml = generateCompose(opts({ node: true, postgres: true, redis: true }))
      expect(yml).toContain("depends_on:")
      expect(yml).toContain("      - db")
      expect(yml).toContain("      - cache")
    })

    it("omits depends_on for web when no backing service is enabled", () => {
      const yml = generateCompose(opts({ node: true }))
      expect(yml).not.toContain("depends_on:")
    })
  })

  describe("defaultOptions", () => {
    it("enables node and postgres by default", () => {
      const o = defaultOptions()
      expect(o.services.node.enabled).toBe(true)
      expect(o.services.postgres.enabled).toBe(true)
      expect(o.services.redis.enabled).toBe(false)
    })
  })
})
