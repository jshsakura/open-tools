import { describe, expect, it } from "vitest"

import { generateCompose } from "./docker-compose-generator.utils"

describe("docker-compose-generator utils", () => {
  describe("no services selected", () => {
    it("emits the version header and an empty services block", () => {
      // Arrange
      const opts = { node: false, postgres: false, redis: false }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).toContain("version: '3.8'")
      expect(yml).toContain("services:")
    })

    it("omits all service blocks when nothing is selected", () => {
      // Arrange
      const opts = { node: false, postgres: false, redis: false }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).not.toContain("web:")
      expect(yml).not.toContain("db:")
      expect(yml).not.toContain("cache:")
    })

    it("omits the volumes section entirely when no volume-needing service is on", () => {
      // Arrange
      const opts = { node: true, postgres: false, redis: false }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).toContain("web:")
      expect(yml).not.toContain("\nvolumes:")
      expect(yml).not.toContain("pgdata")
      expect(yml).not.toContain("redisdata")
    })
  })

  describe("postgres only", () => {
    it("includes the db service block with its image and port", () => {
      // Arrange
      const opts = { node: false, postgres: true, redis: false }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).toContain("db:")
      expect(yml).toContain("image: postgres:15-alpine")
      expect(yml).toContain('- "5432:5432"')
    })

    it("declares a top-level volumes section containing pgdata", () => {
      // Arrange
      const opts = { node: false, postgres: true, redis: false }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).toContain("\nvolumes:")
      expect(yml).toContain("pgdata:")
      expect(yml).toContain("- pgdata:/var/lib/postgresql/data")
      // redis volume must not leak in
      expect(yml).not.toContain("redisdata")
    })

    it("does not emit web or cache service blocks", () => {
      // Arrange
      const opts = { node: false, postgres: true, redis: false }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).not.toContain("web:")
      expect(yml).not.toContain("cache:")
    })
  })

  describe("redis only", () => {
    it("includes the cache service block with its image and port", () => {
      // Arrange
      const opts = { node: false, postgres: false, redis: true }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).toContain("cache:")
      expect(yml).toContain("image: redis:7-alpine")
      expect(yml).toContain('- "6379:6379"')
    })

    it("declares a top-level volumes section containing redisdata only", () => {
      // Arrange
      const opts = { node: false, postgres: false, redis: true }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).toContain("\nvolumes:")
      expect(yml).toContain("redisdata:")
      expect(yml).toContain("- redisdata:/data")
      expect(yml).not.toContain("pgdata")
    })
  })

  describe("multiple services", () => {
    it("includes all three service blocks when every option is on", () => {
      // Arrange
      const opts = { node: true, postgres: true, redis: true }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).toContain("web:")
      expect(yml).toContain("db:")
      expect(yml).toContain("cache:")
    })

    it("lists both pgdata and redisdata under a single volumes section", () => {
      // Arrange
      const opts = { node: true, postgres: true, redis: true }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).toContain("\nvolumes:")
      expect(yml).toContain("pgdata:")
      expect(yml).toContain("redisdata:")
      // exactly one top-level volumes section
      expect(yml.match(/\nvolumes:/g)?.length).toBe(1)
    })

    it("renders each selected service's port mapping", () => {
      // Arrange
      const opts = { node: true, postgres: true, redis: true }

      // Act
      const yml = generateCompose(opts)

      // Assert
      expect(yml).toContain('- "3000:3000"')
      expect(yml).toContain('- "5432:5432"')
      expect(yml).toContain('- "6379:6379"')
    })
  })
})
