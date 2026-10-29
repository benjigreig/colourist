/**
 * @module grade
 * Contrast grades: step names that carry WCAG 2 contrast (D-041).
 *
 * A grade runs from 0 for white to 100 for black, counting towards dark (D-042). The difference
 * between two grades gives their WCAG 2 contrast ratio exactly, as 21 to the power of the
 * difference ÷ 100: 37 grades apart is at least 3:1, 50 is 4.5:1 and 64 is 7:1. Grades are
 * rounded only for people; checks use the exact values (D-043).
 */

const LOG_21 = Math.log(21);

/**
 * The contrast grade of a colour.
 * @param luminance - WCAG 2 relative luminance, from 0 (black) to 1 (white)
 * @returns the exact grade, from 0 (white) to 100 (black)
 */
export function contrastGrade(luminance: number): number {
  return (100 * Math.log(1.05 / (luminance + 0.05))) / LOG_21;
}

/**
 * How many grades apart two colours must be to reach a WCAG 2 contrast ratio.
 * @param ratio - the contrast ratio, from 1 to 21
 * @returns the exact grade difference, from 0 to 100
 * @throws {RangeError} when the ratio is outside 1 to 21
 */
export function gradesForRatio(ratio: number): number {
  if (!(ratio >= 1 && ratio <= 21)) {
    throw new RangeError(`A contrast ratio must be from 1 to 21, not ${ratio}`);
  }
  return (100 * Math.log(ratio)) / LOG_21;
}
