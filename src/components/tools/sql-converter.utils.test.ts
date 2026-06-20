import { describe, expect, it } from "vitest"

import { parseInsert, toRecords } from "./sql-converter.utils"

describe("parseInsert — basic parsing", () => {
  it("parses columns and a single string/number row", () => {
    // Act
    const result = parseInsert("INSERT INTO users (id, name) VALUES (1, 'John');")

    // Assert
    expect(result.columns).toEqual(["id", "name"])
    expect(result.rows).toEqual([[1, "John"]])
  })

  it("coerces NULL, integers, floats and strings to JS types", () => {
    // Act
    const result = parseInsert(
      "INSERT INTO t (a, b, c, d) VALUES (42, 3.14, NULL, 'hello');"
    )

    // Assert
    expect(result.rows).toEqual([[42, 3.14, null, "hello"]])
  })
})

describe("parseInsert — tricky string values", () => {
  it("keeps commas inside quoted strings", () => {
    // Act
    const result = parseInsert(
      "INSERT INTO p (id, name) VALUES (1, 'Doe, John');"
    )

    // Assert
    expect(result.rows).toEqual([[1, "Doe, John"]])
  })

  it("keeps parentheses inside quoted strings", () => {
    // Act
    const result = parseInsert(
      "INSERT INTO p (id, note) VALUES (1, 'Jr. (the third)');"
    )

    // Assert
    expect(result.rows).toEqual([[1, "Jr. (the third)"]])
  })

  it("handles escaped single quotes ('') inside strings", () => {
    // Act
    const result = parseInsert(
      "INSERT INTO p (id, name) VALUES (1, 'O''Brien');"
    )

    // Assert
    expect(result.rows).toEqual([[1, "O'Brien"]])
  })
})

describe("parseInsert — multiple rows and statements", () => {
  it("parses multiple value tuples in one statement", () => {
    // Act
    const result = parseInsert(
      "INSERT INTO users (id, name) VALUES (1, 'a'), (2, 'b'), (3, 'c');"
    )

    // Assert
    expect(result.rows).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ])
  })

  it("parses multiple INSERT statements and concatenates rows", () => {
    // Arrange
    const sql = `
      INSERT INTO users (id, name) VALUES (1, 'a');
      INSERT INTO users (id, name) VALUES (2, 'b, c'), (3, 'd');
    `

    // Act
    const result = parseInsert(sql)

    // Assert
    expect(result.columns).toEqual(["id", "name"])
    expect(result.rows).toEqual([
      [1, "a"],
      [2, "b, c"],
      [3, "d"],
    ])
  })

  it("does not split on semicolons inside quoted strings", () => {
    // Act
    const result = parseInsert(
      "INSERT INTO t (id, code) VALUES (1, 'a;b;c');"
    )

    // Assert
    expect(result.rows).toEqual([[1, "a;b;c"]])
  })
})

describe("parseInsert — errors", () => {
  it("throws when there is no INSERT statement", () => {
    // Act / Assert
    expect(() => parseInsert("SELECT * FROM t;")).toThrow()
  })
})

describe("toRecords", () => {
  it("maps rows to objects keyed by column", () => {
    // Arrange
    const parsed = parseInsert(
      "INSERT INTO u (id, name) VALUES (1, 'a'), (2, 'b');"
    )

    // Act
    const records = toRecords(parsed)

    // Assert
    expect(records).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ])
  })

  it("falls back to positional arrays when no columns are present", () => {
    // Arrange
    const parsed = parseInsert("INSERT INTO u VALUES (1, 'a');")

    // Act
    const records = toRecords(parsed)

    // Assert
    expect(records).toEqual([[1, "a"]])
  })
})
