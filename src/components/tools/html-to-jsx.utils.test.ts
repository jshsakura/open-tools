import { describe, expect, it } from "vitest"

import { htmlToJsx, styleStringToObject } from "./html-to-jsx.utils"

describe("htmlToJsx", () => {
  it("maps class to className and for to htmlFor", () => {
    const out = htmlToJsx('<label class="lbl" for="email">Email</label>')
    expect(out).toContain('className="lbl"')
    expect(out).toContain('htmlFor="email"')
    expect(out).not.toContain("class=")
    expect(out).not.toContain(" for=")
  })

  it("self-closes void elements correctly", () => {
    expect(htmlToJsx("<br>")).toBe("<br />")
    expect(htmlToJsx('<img src="a.png">')).toBe('<img src="a.png" />')
    expect(htmlToJsx("<hr>")).toBe("<hr />")
    expect(htmlToJsx('<input type="text">')).toBe('<input type="text" />')
  })

  it("does not double self-close an already self-closed tag", () => {
    expect(htmlToJsx('<img src="a.png" />')).toBe('<img src="a.png" />')
  })

  it("handles attributeless void tags", () => {
    expect(htmlToJsx("<br/>")).toBe("<br />")
  })

  it("converts inline style strings into a JSX style object", () => {
    const out = htmlToJsx('<div style="background-color: red; font-size: 12px"></div>')
    expect(out).toContain('style={{ backgroundColor: "red", fontSize: "12px" }}')
  })

  it("converts HTML comments into JSX comments", () => {
    expect(htmlToJsx("<!-- hello -->")).toBe("{/* hello */}")
  })

  it("removes comments inside markup but keeps them as JSX comments", () => {
    const out = htmlToJsx("<div><!-- note -->Hi</div>")
    expect(out).toBe("<div>{/* note */}Hi</div>")
  })

  it("wraps multiple root nodes in a fragment", () => {
    const out = htmlToJsx("<p>one</p><p>two</p>")
    expect(out.startsWith("<>")).toBe(true)
    expect(out.trimEnd().endsWith("</>")).toBe(true)
    expect(out).toContain("<p>one</p>")
    expect(out).toContain("<p>two</p>")
  })

  it("does not wrap a single root element in a fragment", () => {
    const out = htmlToJsx("<div><span>x</span></div>")
    expect(out.startsWith("<>")).toBe(false)
    expect(out).toBe("<div><span>x</span></div>")
  })

  it("renders boolean attributes without a value", () => {
    const out = htmlToJsx("<button disabled>Go</button>")
    expect(out).toContain("<button disabled>")
    expect(out).not.toContain("disabled=")
  })

  it("preserves data-* and aria-* attributes verbatim", () => {
    const out = htmlToJsx('<div data-id="5" aria-label="close"></div>')
    expect(out).toContain('data-id="5"')
    expect(out).toContain('aria-label="close"')
  })

  it("wraps output in component boilerplate when requested", () => {
    const out = htmlToJsx("<div>Hi</div>", {
      wrapComponent: true,
      componentName: "MyThing",
    })
    expect(out).toContain("export function MyThing() {")
    expect(out).toContain("return (")
    expect(out).toContain("<div>Hi</div>")
  })

  it("falls back to a default component name when blank", () => {
    const out = htmlToJsx("<div>Hi</div>", { wrapComponent: true, componentName: "  " })
    expect(out).toContain("export function Component() {")
  })

  it("maps event handler attribute names", () => {
    const out = htmlToJsx('<button onclick="x">A</button>')
    expect(out).toContain("onClick=")
  })

  it("throws on empty input", () => {
    expect(() => htmlToJsx("")).toThrow()
    expect(() => htmlToJsx("   ")).toThrow()
  })

  it("drops doctype declarations", () => {
    const out = htmlToJsx("<!DOCTYPE html><div>x</div>")
    expect(out).toBe("<div>x</div>")
    expect(out.toLowerCase()).not.toContain("doctype")
  })
})

describe("styleStringToObject", () => {
  it("camelCases properties and quotes values", () => {
    expect(styleStringToObject("margin-top: 4px; color: blue")).toBe(
      '{{ marginTop: "4px", color: "blue" }}',
    )
  })

  it("preserves CSS custom properties with bracket-quoted keys", () => {
    const out = styleStringToObject("--brand-color: #fff")
    expect(out).toContain('"--brand-color": "#fff"')
  })

  it("ignores empty declarations", () => {
    expect(styleStringToObject("color: red;;")).toBe('{{ color: "red" }}')
  })
})
