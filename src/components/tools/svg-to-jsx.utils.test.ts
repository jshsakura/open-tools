import { describe, expect, it } from "vitest"

import {
  convertSvgAttributes,
  svgStyleStringToObject,
  svgToJsx,
} from "./svg-to-jsx.utils"

const SAMPLE = '<svg width="24" height="24"><path stroke-width="2" fill-rule="evenodd"/></svg>'

describe("convertSvgAttributes", () => {
  it("converts kebab-case attributes to camelCase", () => {
    const out = convertSvgAttributes(SAMPLE)
    expect(out).toContain("strokeWidth=")
    expect(out).toContain("fillRule=")
    expect(out).not.toContain("stroke-width=")
    expect(out).not.toContain("fill-rule=")
  })

  it("maps class to className", () => {
    expect(convertSvgAttributes('<svg class="icon"></svg>')).toContain('className="icon"')
  })

  it("maps xlink:href to xlinkHref", () => {
    expect(convertSvgAttributes('<use xlink:href="#a" />')).toContain('xlinkHref="#a"')
  })

  it("converts inline style strings to objects", () => {
    const out = convertSvgAttributes('<rect style="fill: red; stroke-width: 2" />')
    expect(out).toContain('style={{ fill: "red", strokeWidth: "2" }}')
  })
})

describe("svgStyleStringToObject", () => {
  it("camelCases and quotes declarations", () => {
    expect(svgStyleStringToObject("stop-color: blue; stop-opacity: 1")).toBe(
      '{{ stopColor: "blue", stopOpacity: "1" }}',
    )
  })
})

describe("svgToJsx", () => {
  it("spreads props onto the root svg by default", () => {
    const out = svgToJsx(SAMPLE)
    expect(out).toContain("{...props}")
    expect(out.match(/\{\.\.\.props\}/g)?.length).toBe(1)
  })

  it("omits props spread when disabled", () => {
    const out = svgToJsx(SAMPLE, { spreadProps: false })
    expect(out).not.toContain("{...props}")
  })

  it("emits a plain JS function by default", () => {
    const out = svgToJsx(SAMPLE, { componentName: "Star" })
    expect(out).toContain("export default function Star(props) {")
    expect(out).toContain("return (")
    expect(out).not.toContain("React.FC")
  })

  it("emits a typed React.FC component in typescript mode", () => {
    const out = svgToJsx(SAMPLE, { componentName: "Star", typescript: true })
    expect(out).toContain("const Star: React.FC<React.SVGProps<SVGSVGElement>>")
    expect(out).toContain('import * as React from "react"')
    expect(out).toContain("export default Star")
  })

  it("uses _props when spread is off in typescript mode", () => {
    const out = svgToJsx(SAMPLE, { typescript: true, spreadProps: false })
    expect(out).toContain("(_props)")
  })

  it("strips xml prolog and comments", () => {
    const input = '<?xml version="1.0"?><!-- c --><svg width="1"></svg>'
    const out = svgToJsx(input)
    expect(out).not.toContain("<?xml")
    expect(out).not.toContain("<!--")
  })

  it("falls back to default component name when blank", () => {
    const out = svgToJsx(SAMPLE, { componentName: "  " })
    expect(out).toContain("export default function SvgIcon")
  })

  it("throws on empty input", () => {
    expect(() => svgToJsx("")).toThrow()
    expect(() => svgToJsx("   ")).toThrow()
  })

  it("throws when there is no svg element", () => {
    expect(() => svgToJsx("<div>not svg</div>")).toThrow()
  })
})
