export type Scale = "4.5" | "4.0"

// Grade -> grade point per scale (Korean 4.5 and standard 4.0).
export const GRADE_POINTS: Record<Scale, Record<string, number>> = {
  "4.5": { "A+": 4.5, A: 4.0, "B+": 3.5, B: 3.0, "C+": 2.5, C: 2.0, "D+": 1.5, D: 1.0, F: 0 },
  "4.0": { "A+": 4.0, A: 4.0, "B+": 3.5, B: 3.0, "C+": 2.5, C: 2.0, "D+": 1.5, D: 1.0, F: 0 },
}

export interface GpaCourse {
  grade: string
  credits: number
}

export interface GpaResult {
  gpa: number
  totalCredits: number
}

/**
 * Compute the credit-weighted GPA for the given courses on the chosen scale.
 * Courses with non-finite or non-positive credits are ignored. Unknown grades
 * contribute 0 points. With no valid credits, gpa is 0.
 */
export function computeGpa(courses: GpaCourse[], scale: Scale): GpaResult {
  let points = 0
  let credits = 0

  for (const course of courses) {
    const credit = course.credits
    if (!Number.isFinite(credit) || credit <= 0) continue
    const gradePoint = GRADE_POINTS[scale][course.grade] ?? 0
    points += gradePoint * credit
    credits += credit
  }

  return { gpa: credits > 0 ? points / credits : 0, totalCredits: credits }
}
