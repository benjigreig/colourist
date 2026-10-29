import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { contrastGrade, gradesForRatio } from '../src/index.ts';

const CRITERION = 'CLR-7: Contrast grades (D-041)';

/** WCAG 2 contrast ratio between two relative luminances. */
function ratio(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe('contrast grades', () => {
  it(`${CRITERION} — white is 0 and black is 100`, () => {
    expect(contrastGrade(1)).toBeCloseTo(0, 12);
    expect(contrastGrade(0)).toBeCloseTo(100, 12);
  });

  it(`${CRITERION} — the difference between two grades gives their WCAG 2 contrast exactly`, () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (a, b) => {
          const difference = Math.abs(contrastGrade(a) - contrastGrade(b));
          expect(21 ** (difference / 100)).toBeCloseTo(ratio(a, b), 9);
        },
      ),
    );
  });

  it(`${CRITERION} — 37, 50 and 64 apart reach 3:1, 4.5:1 and 7:1`, () => {
    expect(Math.ceil(gradesForRatio(3))).toBe(37);
    expect(Math.ceil(gradesForRatio(4.5))).toBe(50);
    expect(Math.ceil(gradesForRatio(7))).toBe(64);
    expect(() => gradesForRatio(0.5)).toThrow(RangeError);
    expect(() => gradesForRatio(22)).toThrow(RangeError);
  });
});
