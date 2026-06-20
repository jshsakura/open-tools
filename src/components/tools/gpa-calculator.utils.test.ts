import { describe, expect, it } from "vitest"

import { computeGpa } from "./gpa-calculator.utils"

describe("computeGpa — basics", () => {
  it("returns the grade point of a single course as the GPA", () => {
    // Arrange / Act
    const result = computeGpa([{ grade: "A", credits: 3 }], "4.5")

    // Assert
    expect(result.gpa).toBe(4.0)
    expect(result.totalCredits).toBe(3)
  })

  it("returns 0 GPA and 0 credits for an empty course list", () => {
    // Act
    const result = computeGpa([], "4.5")

    // Assert
    expect(result).toEqual({ gpa: 0, totalCredits: 0 })
  })

  it("gives the maximum GPA when every course is A+ on the 4.5 scale", () => {
    // Act
    const result = computeGpa(
      [
        { grade: "A+", credits: 3 },
        { grade: "A+", credits: 4 },
      ],
      "4.5",
    )

    // Assert
    expect(result.gpa).toBe(4.5)
    expect(result.totalCredits).toBe(7)
  })

  it("gives 0 GPA when every course is F", () => {
    // Act
    const result = computeGpa(
      [
        { grade: "F", credits: 3 },
        { grade: "F", credits: 3 },
      ],
      "4.5",
    )

    // Assert
    expect(result.gpa).toBe(0)
    expect(result.totalCredits).toBe(6)
  })
})

describe("computeGpa — credit weighting", () => {
  it("weights by credits, producing a different result than a simple average", () => {
    // Arrange: A+ (4.5) for 1 credit, F (0) for 5 credits.
    const courses = [
      { grade: "A+", credits: 1 },
      { grade: "F", credits: 5 },
    ]

    // Act
    const result = computeGpa(courses, "4.5")

    // Assert: weighted = (4.5*1 + 0*5) / 6 = 0.75, which is far from the
    // simple average of (4.5 + 0) / 2 = 2.25.
    expect(result.gpa).toBeCloseTo(0.75, 6)
    expect(result.gpa).not.toBeCloseTo(2.25, 2)
    expect(result.totalCredits).toBe(6)
  })

  it("matches a hand-computed weighted example", () => {
    // Arrange: A+ (4.5)*3 + B+ (3.5)*2 + C (2.0)*1 = 13.5 + 7 + 2 = 22.5
    //          over 6 credits = 3.75
    const courses = [
      { grade: "A+", credits: 3 },
      { grade: "B+", credits: 2 },
      { grade: "C", credits: 1 },
    ]

    // Act
    const result = computeGpa(courses, "4.5")

    // Assert
    expect(result.gpa).toBeCloseTo(3.75, 6)
    expect(result.totalCredits).toBe(6)
  })
})

describe("computeGpa — scales", () => {
  it("caps A+ at 4.0 on the 4.0 scale (differs from 4.5 scale)", () => {
    // Arrange
    const courses = [{ grade: "A+", credits: 3 }]

    // Act
    const onFour = computeGpa(courses, "4.0")
    const onFourFive = computeGpa(courses, "4.5")

    // Assert
    expect(onFour.gpa).toBe(4.0)
    expect(onFourFive.gpa).toBe(4.5)
  })

  it("treats shared grades identically across scales (B = 3.0 on both)", () => {
    // Act
    const onFour = computeGpa([{ grade: "B", credits: 3 }], "4.0")
    const onFourFive = computeGpa([{ grade: "B", credits: 3 }], "4.5")

    // Assert
    expect(onFour.gpa).toBe(3.0)
    expect(onFourFive.gpa).toBe(3.0)
  })
})

describe("computeGpa — invalid credits and grades", () => {
  it("ignores courses with zero credits", () => {
    // Act
    const result = computeGpa(
      [
        { grade: "A+", credits: 0 },
        { grade: "B", credits: 3 },
      ],
      "4.5",
    )

    // Assert: only the B (3.0) course counts.
    expect(result.gpa).toBe(3.0)
    expect(result.totalCredits).toBe(3)
  })

  it("ignores courses with negative credits", () => {
    // Act
    const result = computeGpa(
      [
        { grade: "A+", credits: -2 },
        { grade: "B", credits: 2 },
      ],
      "4.5",
    )

    // Assert
    expect(result.gpa).toBe(3.0)
    expect(result.totalCredits).toBe(2)
  })

  it("ignores courses with NaN credits (e.g. blank input)", () => {
    // Act
    const result = computeGpa(
      [
        { grade: "A+", credits: NaN },
        { grade: "A", credits: 3 },
      ],
      "4.5",
    )

    // Assert
    expect(result.gpa).toBe(4.0)
    expect(result.totalCredits).toBe(3)
  })

  it("treats unknown grades as 0 points", () => {
    // Act
    const result = computeGpa([{ grade: "Z", credits: 3 }], "4.5")

    // Assert
    expect(result.gpa).toBe(0)
    expect(result.totalCredits).toBe(3)
  })
})
