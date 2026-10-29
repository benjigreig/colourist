"""
Contrast grade: a step name whose differences give WCAG 2 contrast exactly.

Purpose: reproduces the figures in docs/research/step-naming.md.
grade = 100 * log(1.05 / (Y + 0.05)) / log(21), so white is 0 and black is 100,
and the WCAG 2 contrast between two colours is 21 ** (grade difference / 100).

Usage: python3 contrast-grade.py
"""
import math

# Ladders as CIE L* (D65) targets, lightest to darkest. 13 is ADR 0001; 11 and 15 are spike placeholders.
LADDERS = {
    11: [98, 94, 86, 76, 65, 54, 43, 33, 23, 14, 7],
    13: [98, 96, 92, 86, 78, 68, 57, 46, 35, 25, 17, 10, 5],
    15: [98, 96, 93, 88, 82, 74, 65, 56, 47, 38, 30, 22, 15, 9, 4],
}


def luminance_from_lstar(lstar: float) -> float:
    """Relative luminance Y (0 to 1) for a CIE L* value."""
    return ((lstar + 16) / 116) ** 3 if lstar > 8 else lstar * 27 / 24389


def contrast_grade(y: float) -> float:
    """Contrast grade from relative luminance: 0 for white, 100 for black."""
    return 100 * math.log(1.05 / (y + 0.05)) / math.log(21)


def wcag_contrast(y1: float, y2: float) -> float:
    """WCAG 2 contrast ratio between two luminances."""
    return (max(y1, y2) + 0.05) / (min(y1, y2) + 0.05)


if __name__ == "__main__":
    for ratio in (3, 4.5, 7):
        print(f"{ratio}:1 needs a grade difference of {100 * math.log(ratio) / math.log(21):.1f}")
    for size, ladder in LADDERS.items():
        grades = [contrast_grade(luminance_from_lstar(l)) for l in ladder]
        print(f"\n{size} steps: {[round(g) for g in grades]}")
        for apart in (6, 7, 8):
            diffs = [grades[i + apart] - grades[i] for i in range(len(grades) - apart)]
            print(f"  {apart} steps apart: {min(diffs):.1f} to {max(diffs):.1f} grades, "
                  f"{21 ** (min(diffs) / 100):.2f}:1 to {21 ** (max(diffs) / 100):.2f}:1")
    y1, y2 = luminance_from_lstar(57), luminance_from_lstar(10)
    print(f"\nCheck, L* 57 against L* 10: WCAG {wcag_contrast(y1, y2):.4f}:1, "
          f"from grades {21 ** ((contrast_grade(y2) - contrast_grade(y1)) / 100):.4f}:1")
