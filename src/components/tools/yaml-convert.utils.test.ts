import { describe, it, expect } from "vitest"
import { jsonToYaml, yamlToJson } from "./yaml-convert.utils"

describe("jsonToYaml", () => {
  it("round-trips a JSON object back through YAML", () => {
    const json = '{"name":"tool","tags":["a","b"],"nested":{"x":1}}'

    const yaml = jsonToYaml(json)
    const back = JSON.parse(yamlToJson(yaml))

    expect(back).toEqual({ name: "tool", tags: ["a", "b"], nested: { x: 1 } })
  })

  it("changes output when the indent option changes", () => {
    const json = '{"nested":{"deep":true}}'

    const two = jsonToYaml(json, { indent: 2 })
    const four = jsonToYaml(json, { indent: 4 })

    expect(two).not.toBe(four)
    expect(four).toContain("    deep: true")
  })

  it("sorts object keys when sortKeys is enabled", () => {
    const json = '{"banana":1,"apple":2,"cherry":3}'

    const sorted = jsonToYaml(json, { sortKeys: true })

    const lines = sorted.trim().split("\n")
    expect(lines).toEqual(["apple: 2", "banana: 1", "cherry: 3"])
  })

  it("throws on invalid JSON", () => {
    expect(() => jsonToYaml("{ not valid")).toThrow()
  })
})

describe("yamlToJson", () => {
  it("converts a YAML document into JSON", () => {
    const yaml = "name: tool\ncount: 3\nitems:\n  - one\n  - two\n"

    const json = JSON.parse(yamlToJson(yaml))

    expect(json).toEqual({ name: "tool", count: 3, items: ["one", "two"] })
  })

  it("changes output when the indent option changes", () => {
    const yaml = "nested:\n  deep: true\n"

    const two = yamlToJson(yaml, { indent: 2 })
    const four = yamlToJson(yaml, { indent: 4 })

    expect(two).not.toBe(four)
    expect(four).toContain('        "deep": true')
  })

  it("sorts object keys when sortKeys is enabled", () => {
    const yaml = "banana: 1\napple: 2\ncherry: 3\n"

    const json = yamlToJson(yaml, { sortKeys: true })

    expect(json.indexOf('"apple"')).toBeLessThan(json.indexOf('"banana"'))
    expect(json.indexOf('"banana"')).toBeLessThan(json.indexOf('"cherry"'))
  })

  it("throws on invalid YAML", () => {
    expect(() => yamlToJson("foo: [1, 2\nbar: : :")).toThrow()
  })
})
